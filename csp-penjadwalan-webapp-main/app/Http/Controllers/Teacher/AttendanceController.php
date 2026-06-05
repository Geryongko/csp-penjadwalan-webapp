<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\TeachingAssignment;
use App\Models\ClassSession;
use App\Models\Attendance;
use App\Models\Enrollment;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the teacher's assigned classes.
     */
    public function index()
    {
        $teacherId = Auth::id();

        // Get teaching assignments for the logged-in teacher
        $assignments = TeachingAssignment::with(['subject', 'studentClass'])
            ->where('teacher_id', $teacherId)
            ->get();

        return Inertia::render('Teacher/Attendance/Index', [
            'assignments' => $assignments
        ]);
    }

    /**
     * Display the sessions for a specific class.
     */
    public function show($assignmentId)
    {
        $teacherId = Auth::id();

        $assignment = TeachingAssignment::with(['subject', 'studentClass'])
            ->where('assignment_id', $assignmentId)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        $calculator = new \App\Services\SessionCalculatorService();
        $sessions = $calculator->getSessionsForAssignment(
            $assignment->assignment_id,
            $assignment->student_class_id,
            $assignment->subject_id,
            $assignment->teacher_id
        );

        // Calculate summary for display
        $totalStudents = Enrollment::where('student_class_id', $assignment->student_class_id)
            ->where('status', 'active')
            ->count();

        return Inertia::render('Teacher/Attendance/Show', [
            'assignment' => $assignment,
            'sessions' => $sessions,
            'totalStudents' => $totalStudents
        ]);
    }

    /**
     * Store a newly created session (from modal manually) or JIT Init.
     */
    public function storeSession(Request $request, $assignmentId)
    {
        $request->validate([
            'session_date' => 'required|date',
            'session_number' => 'required|integer|min:1',
            'topic' => 'required|string|max:255',
        ]);

        $teacherId = Auth::id();
        $assignment = TeachingAssignment::where('assignment_id', $assignmentId)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        // Check if meeting number already exists for this assignment
        if (ClassSession::where('assignment_id', $assignmentId)->where('session_number', $request->session_number)->exists()) {
            return back()->withErrors(['session_number' => 'Pertemuan ke-' . $request->session_number . ' sudah ada!']);
        }

        DB::beginTransaction();

        try {
            $session = ClassSession::create([
                'assignment_id' => $assignmentId,
                'student_class_id' => $assignment->student_class_id,
                'session_date' => $request->session_date,
                'session_number' => $request->session_number,
                'topic' => $request->topic,
                'is_online' => false,
            ]);

            // Get all students enrolled in this class
            $students = Enrollment::where('student_class_id', $assignment->student_class_id)
                ->where('status', 'active')
                ->get();

            $attendancesData = [];
            foreach ($students as $enrollment) {
                $attendancesData[] = [
                    'session_id' => $session->session_id,
                    'student_id' => $enrollment->student_id,
                    'status' => 'present', // Default all to present (hadir)
                ];
            }

            if (count($attendancesData) > 0) {
                Attendance::insert($attendancesData);
            }

            DB::commit();

            return redirect()->route('teacher.attendance.editSession', ['assignmentId' => $assignmentId, 'sessionId' => $session->session_id])
                ->with('success', 'Pertemuan ' . $request->session_number . ' berhasil dibuat. Silakan isi presensi.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal membuat pertemuan: ' . $e->getMessage()]);
        }
    }

    /**
     * Initialize a virtual session JIT and redirect to edit.
     */
    public function initSession(Request $request, $assignmentId)
    {
        $request->validate([
            'session_date' => 'required|date',
            'session_number' => 'required|integer',
            'topic' => 'required|string',
        ]);

        $teacherId = Auth::id();
        $assignment = TeachingAssignment::where('assignment_id', $assignmentId)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        // Check if session already created
        $session = ClassSession::where('assignment_id', $assignmentId)
            ->where('session_date', $request->session_date)
            ->first();

        if (!$session) {
            DB::beginTransaction();
            try {
                $session = ClassSession::create([
                    'assignment_id' => $assignmentId,
                    'student_class_id' => $assignment->student_class_id,
                    'session_date' => $request->session_date,
                    'session_number' => $request->session_number,
                    'topic' => $request->topic,
                    'session_type' => 'regular',
                    'is_online' => false,
                ]);

                // Create default empty attendances
                $students = Enrollment::where('student_class_id', $assignment->student_class_id)
                    ->where('status', 'active')
                    ->get();

                $attendancesData = [];
                foreach ($students as $enrollment) {
                    $attendancesData[] = [
                        'session_id' => $session->session_id,
                        'student_id' => $enrollment->student_id,
                        'status' => 'present',
                    ];
                }

                if (count($attendancesData) > 0) {
                    Attendance::insert($attendancesData);
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->withErrors(['error' => 'Gagal inisialisasi pertemuan: ' . $e->getMessage()]);
            }
        }

        return redirect()->route('teacher.attendance.editSession', ['assignmentId' => $assignmentId, 'sessionId' => $session->session_id]);
    }

    /**
     * Show the form for editing the attendance of a specific session.
     */
    public function editSession($assignmentId, $sessionId)
    {
        $teacherId = Auth::id();
        $assignment = TeachingAssignment::with(['subject', 'studentClass'])
            ->where('assignment_id', $assignmentId)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        $session = ClassSession::where('session_id', $sessionId)
            ->where('assignment_id', $assignmentId)
            ->firstOrFail();

        $attendances = Attendance::with(['student.studentProfile'])
            ->where('session_id', $sessionId)
            ->get()
            ->sortBy('student.full_name')
            ->values();

        return Inertia::render('Teacher/Attendance/Form', [
            'assignment' => $assignment,
            'session' => $session,
            'attendances' => $attendances
        ]);
    }

    /**
     * Update the attendance records for a session.
     */
    public function updateAttendance(Request $request, $assignmentId, $sessionId)
    {
        $request->validate([
            'topic' => 'required|string|max:255',
            'session_type' => 'required|in:regular,uts,uas,holiday',
            'attendances' => 'required|array',
            'attendances.*.attendance_id' => 'required|exists:attendances,attendance_id',
            'attendances.*.status' => 'required|in:present,absent,late,excused',
            'attendances.*.note' => 'nullable|string',
        ]);

        $teacherId = Auth::id();
        // Verify ownership
        TeachingAssignment::where('assignment_id', $assignmentId)
            ->where('teacher_id', $teacherId)
            ->firstOrFail();

        DB::beginTransaction();

        try {
            // Update topic and type
            ClassSession::where('session_id', $sessionId)
                ->where('assignment_id', $assignmentId)
                ->update([
                    'topic' => $request->topic,
                    'session_type' => $request->session_type
                ]);

            // Update attendances
            foreach ($request->attendances as $attData) {
                Attendance::where('attendance_id', $attData['attendance_id'])
                    ->where('session_id', $sessionId) // Extra security
                    ->update([
                        'status' => $attData['status'],
                        'note' => $attData['note'] ?? null,
                    ]);
            }

            DB::commit();

            return redirect()->route('teacher.attendance.show', $assignmentId)
                ->with('success', 'Data presensi berhasil disimpan.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Gagal menyimpan presensi: ' . $e->getMessage()]);
        }
    }
}
