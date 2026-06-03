<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Semester;
use App\Models\Enrollment;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $student */
        $student = Auth::user();

        $student->load(['studentProfile.program']);

        $activeSemester = Semester::where('is_active', true)->first();
        $semesterName = $activeSemester ? $activeSemester->semester_name : '-';

        // Get student's active enrollment
        $enrollment = Enrollment::where('student_id', $student->user_id)
            ->where('status', 'active')
            ->with('studentClass')
            ->first();
            
        $studentClass = $enrollment ? $enrollment->studentClass : null;
        
        $todaySchedule = [];
        $weeklySchedule = [];
        
        if ($studentClass) {
            // Monday = 1, Sunday = 7
            // However, Carbon format('N') returns 1 (Monday) - 7 (Sunday).
            $today = Carbon::now()->format('N');
            
            // Limit to Monday(1) - Friday(5)
            if ($today > 5) {
                $today = 1; // if weekend, show monday's schedule or empty
            }

            $todaySchedule = Schedule::where('student_class_id', $studentClass->student_class_id)
                ->where('day_of_week', $today)
                ->with(['subject', 'teacher', 'room'])
                ->orderBy('start_time')
                ->get();

            $weeklyData = Schedule::where('student_class_id', $studentClass->student_class_id)
                ->with(['subject', 'teacher', 'room'])
                ->orderBy('day_of_week')
                ->orderBy('start_time')
                ->get();
                
            // Group by day_of_week
            foreach ($weeklyData as $sch) {
                $weeklySchedule[$sch->day_of_week][] = $sch;
            }
        }

        $dashboardData = [
            'semester_level' => $student->studentProfile->current_semester_level ?? 1,
            'active_semester_name' => $semesterName,
            'student_class_name' => $studentClass ? $studentClass->class_name : 'No Class Assigned',
        ];

        return Inertia::render('Student/Dashboard', [
            'student' => $student,
            'dashboardData' => $dashboardData,
            'todaySchedule' => $todaySchedule,
            'weeklySchedule' => $weeklySchedule,
            'todayDayNumber' => (int) (Carbon::now()->format('N') > 5 ? 1 : Carbon::now()->format('N')),
        ]);
    }
}
