<?php

namespace App\Services;

use App\Models\Semester;
use App\Models\Schedule;
use App\Models\ClassSession;
use Carbon\Carbon;
use Carbon\CarbonPeriod;

class SessionCalculatorService
{
    /**
     * Calculate all expected virtual and real sessions for a specific assignment.
     * 
     * @param int $assignmentId
     * @param int $studentClassId
     * @param int $subjectId
     * @param int $teacherId
     * @return array
     */
    public function getSessionsForAssignment($assignmentId, $studentClassId, $subjectId, $teacherId)
    {
        $semester = Semester::where('is_active', true)->first();
        if (!$semester) {
            return [];
        }

        // 1. Get real sessions from DB
        $realSessions = ClassSession::withCount('attendances')
            ->where('assignment_id', $assignmentId)
            ->get()
            ->keyBy(function($session) {
                return Carbon::parse($session->session_date)->format('Y-m-d');
            });

        // 2. Get schedule for this assignment
        $schedules = Schedule::where('student_class_id', $studentClassId)
            ->where('subject_id', $subjectId)
            ->where('teacher_id', $teacherId)
            ->get();

        if ($schedules->isEmpty() && $realSessions->isEmpty()) {
            return []; // No schedule and no real sessions
        }

        $validDaysOfWeek = $schedules->pluck('day_of_week')->toArray();

        // 3. Generate virtual dates based on schedule and semester dates
        $startDate = Carbon::parse($semester->start_date);
        $endDate = Carbon::parse($semester->end_date);
        $period = CarbonPeriod::create($startDate, $endDate);

        $mergedSessions = [];
        $sessionCounter = 1;

        foreach ($period as $date) {
            $dateString = $date->format('Y-m-d');
            $dayOfWeek = $date->dayOfWeekIso;

            // Does it match the schedule? Or is it already a real session?
            // (Real sessions can be on non-schedule days if teacher manually created them)
            $isScheduled = in_array($dayOfWeek, $validDaysOfWeek);
            $hasRealSession = $realSessions->has($dateString);

            if ($isScheduled || $hasRealSession) {
                if ($hasRealSession) {
                    $realSession = $realSessions->get($dateString);
                    
                    // Dynamic numbering logic
                    if ($realSession->session_type !== 'holiday') {
                        $realSession->session_number = $sessionCounter++;
                    } else {
                        $realSession->session_number = null; // No number for holidays
                    }
                    
                    $mergedSessions[] = $realSession;
                } else {
                    // It's a virtual session (has not been created yet)
                    $mergedSessions[] = [
                        'session_id' => null, // Virtual identifier
                        'assignment_id' => $assignmentId,
                        'session_date' => $dateString,
                        'session_number' => $sessionCounter, // Assign current counter
                        'topic' => 'Pertemuan ' . $sessionCounter,
                        'session_type' => 'regular',
                        'attendances_count' => 0,
                        'is_virtual' => true
                    ];
                    $sessionCounter++; // Increment after assigning to virtual
                }
            }
        }

        return $mergedSessions;
    }
}
