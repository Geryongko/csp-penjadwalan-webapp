<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $teacher = Auth::user();
        
        $teacher->load(['lecturerProfile']);

        // 1. Get today's schedule
        $todayDayOfWeek = date('N'); // 1 (Monday) to 7 (Sunday)
        
        $todaySchedule = \App\Models\Schedule::with(['studentClass', 'subject', 'room'])
            ->where('teacher_id', $teacher->user_id)
            ->where('day_of_week', $todayDayOfWeek)
            ->orderBy('start_time')
            ->get();

        // 2. Get teaching assignments (classes they teach)
        $assignments = \App\Models\TeachingAssignment::with(['subject', 'studentClass'])
            ->where('teacher_id', $teacher->user_id)
            ->get();

        return Inertia::render('Teacher/Dashboard', [
            'teacher' => $teacher,
            'todaySchedule' => $todaySchedule,
            'assignments' => $assignments
        ]);
    }
}
