<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Enrollment;
use App\Models\TeachingAssignment;
use App\Models\ClassSession;
use App\Models\Attendance;
use App\Models\Semester;

class AttendanceController extends Controller
{
    /**
     * Display a summary of attendance for all enrolled subjects.
     */
    public function index()
    {
        $studentId = Auth::id();
        
        // Find active enrollment
        $activeSemester = Semester::where('is_active', true)->first();
        
        $enrollment = Enrollment::with(['studentClass'])
            ->where('student_id', $studentId)
            ->where('status', 'active')
            ->first();

        if (!$enrollment) {
            return Inertia::render('Student/Attendance/Index', [
                'assignments' => []
            ]);
        }

        // Get all teaching assignments for the student's class
        $assignments = TeachingAssignment::with(['subject', 'teacher'])
            ->where('student_class_id', $enrollment->student_class_id)
            ->get();

        $calculator = new \App\Services\SessionCalculatorService();
        $summary = [];
        
        foreach ($assignments as $assignment) {
            $sessions = $calculator->getSessionsForAssignment(
                $assignment->assignment_id,
                $assignment->student_class_id,
                $assignment->subject_id,
                $assignment->teacher_id
            );

            // Filter out holidays from expected sessions
            $expectedSessions = collect($sessions)->filter(function($s) {
                // If it's an array (virtual session) or object (real session)
                $type = is_array($s) ? $s['session_type'] : $s->session_type;
                return $type !== 'holiday';
            });
            
            $totalSessions = $expectedSessions->count();
            
            // Get all attendances for this student in this assignment
            $attendances = Attendance::where('student_id', $studentId)
                ->whereHas('classSession', function($q) use ($assignment) {
                    $q->where('assignment_id', $assignment->assignment_id)
                      ->where('session_type', '!=', 'holiday');
                })->get();

            // Status counts
            $present = $attendances->where('status', 'present')->count();
            $absent = $attendances->where('status', 'absent')->count();
            $late = $attendances->where('status', 'late')->count();
            $excused = $attendances->where('status', 'excused')->count();

            $percentage = $totalSessions > 0 ? round(($present / $totalSessions) * 100) : 0;

            $summary[] = [
                'assignment' => $assignment,
                'total_sessions' => $totalSessions,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'excused' => $excused,
                'percentage' => $percentage
            ];
        }

        return Inertia::render('Student/Attendance/Index', [
            'summary' => $summary,
            'studentClass' => $enrollment->studentClass
        ]);
    }

    /**
     * Display the detailed attendances for a specific subject (assignment).
     */
    public function show($assignmentId)
    {
        $studentId = Auth::id();
        
        $assignment = TeachingAssignment::with(['subject', 'teacher', 'studentClass'])
            ->findOrFail($assignmentId);

        // Get all sessions using JIT Calculator
        $calculator = new \App\Services\SessionCalculatorService();
        $sessions = $calculator->getSessionsForAssignment(
            $assignment->assignment_id,
            $assignment->student_class_id,
            $assignment->subject_id,
            $assignment->teacher_id
        );

        $attendances = Attendance::where('student_id', $studentId)
            ->whereHas('classSession', function($q) use ($assignmentId) {
                $q->where('assignment_id', $assignmentId);
            })
            ->get()
            ->keyBy('session_id');

        $sessionDetails = [];
        foreach ($sessions as $session) {
            $sessionId = is_array($session) ? $session['session_id'] : $session->session_id;
            $attendance = $sessionId ? $attendances->get($sessionId) : null;
            $sessionDetails[] = [
                'session' => $session,
                'attendance' => $attendance ? $attendance : null
            ];
        }

        return Inertia::render('Student/Attendance/Show', [
            'assignment' => $assignment,
            'sessionDetails' => $sessionDetails
        ]);
    }
}
