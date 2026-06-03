<?php

namespace App\Services;

use App\Models\TimeSlot;
use App\Models\Room;
use App\Models\User;
use App\Models\StudentClass;
use App\Models\Curriculum;
use App\Models\Schedule;
use App\Models\Subject;

class CSPEngine
{
    private $timeSlots;
    private $rooms;
    private $teachers;
    private $classes;
    private $curriculums;

    // The schedule we are building:
    // Format: $schedule[day][time_slot_id][room_id] = ['class_id', 'teacher_id', 'subject_id']
    private $scheduleGrid = [];

    // Track teacher assignments to prevent double booking:
    // Format: $teacherGrid[day][time_slot_id][teacher_id] = true
    private $teacherGrid = [];
    
    // Track class assignments to prevent double booking:
    // Format: $classGrid[day][time_slot_id][class_id] = true
    private $classGrid = [];

    // The blocks of JP we need to schedule.
    // Format: [['class_id' => X, 'subject_id' => Y, 'teacher_id' => Z, 'jp' => 2], ...]
    private $blocksToSchedule = [];

    public function generate()
    {
        // 1. Fetch Master Data
        // Only non-break time slots
        $this->timeSlots = TimeSlot::where('is_break', false)->orderBy('slot_number')->get();
        $this->rooms = Room::all();
        $this->teachers = User::where('role_id', 2)->get();
        $this->classes = StudentClass::all();
        
        // 2. Build the list of blocks to schedule based on curriculum
        $this->prepareBlocks();

        // 3. Run the Backtracking algorithm
        $success = $this->backtrack(0);

        if ($success) {
            $this->saveScheduleToDatabase();
            return ['status' => 'success', 'message' => 'Schedule generated successfully.'];
        } else {
            return ['status' => 'error', 'message' => 'Failed to generate a conflict-free schedule. Not enough resources.'];
        }
    }

    private function prepareBlocks()
    {
        $this->blocksToSchedule = [];

        $assignments = \App\Models\TeachingAssignment::with('subject')->get();

        foreach ($assignments as $assignment) {
            $subject = $assignment->subject;
            if (!$subject) continue;

            $totalJp = $subject->jp;

            // Split JP into 2 JP and 1 JP blocks
            while ($totalJp > 0) {
                $blockJp = ($totalJp >= 2) ? 2 : 1;
                $totalJp -= $blockJp;

                $this->blocksToSchedule[] = [
                    'class_id' => $assignment->student_class_id,
                    'subject_id' => $assignment->subject_id,
                    'teacher_id' => $assignment->teacher_id,
                    'jp' => $blockJp
                ];
            }
        }
        
        // Sort blocks by JP descending (heuristic: schedule bigger blocks first)
        usort($this->blocksToSchedule, function($a, $b) {
            return $b['jp'] <=> $a['jp'];
        });
    }

    private function backtrack($blockIndex)
    {
        // If we have scheduled all blocks, we are done!
        if ($blockIndex >= count($this->blocksToSchedule)) {
            return true;
        }

        $block = $this->blocksToSchedule[$blockIndex];
        
        // Try assigning this block to every possible (day, slot, room)
        $days = [1, 2, 3, 4, 5]; // Monday to Friday

        foreach ($days as $day) {
            // Check if class already has this subject on this day (soft constraint: distribute subjects across week)
            if ($this->hasSubjectOnDay($block['class_id'], $block['subject_id'], $day)) {
                continue; 
            }

            // We need consecutive slots equal to $block['jp']
            $maxSlotIndex = count($this->timeSlots) - $block['jp'];
            
            for ($i = 0; $i <= $maxSlotIndex; $i++) {
                
                // Get the required sequence of slots
                $requiredSlots = [];
                for ($j = 0; $j < $block['jp']; $j++) {
                    $requiredSlots[] = $this->timeSlots[$i + $j];
                }

                // Optimization: if any slot in sequence is invalid for class/teacher, skip whole sequence
                $canSchedule = true;
                foreach ($requiredSlots as $slot) {
                    if (isset($this->teacherGrid[$day][$slot->time_slot_id][$block['teacher_id']]) ||
                        isset($this->classGrid[$day][$slot->time_slot_id][$block['class_id']])) {
                        $canSchedule = false;
                        break;
                    }
                }
                
                if (!$canSchedule) continue;

                foreach ($this->rooms as $room) {
                    // Check if room is available for all required slots
                    $roomAvailable = true;
                    foreach ($requiredSlots as $slot) {
                        if (isset($this->scheduleGrid[$day][$slot->time_slot_id][$room->room_id])) {
                            $roomAvailable = false;
                            break;
                        }
                    }

                    if ($roomAvailable) {
                        // Place block
                        foreach ($requiredSlots as $slot) {
                            $this->scheduleGrid[$day][$slot->time_slot_id][$room->room_id] = [
                                'class_id' => $block['class_id'],
                                'teacher_id' => $block['teacher_id'],
                                'subject_id' => $block['subject_id']
                            ];
                            $this->teacherGrid[$day][$slot->time_slot_id][$block['teacher_id']] = true;
                            $this->classGrid[$day][$slot->time_slot_id][$block['class_id']] = true;
                        }

                        // Recursive call
                        if ($this->backtrack($blockIndex + 1)) {
                            return true;
                        }

                        // Backtrack (undo placement)
                        foreach ($requiredSlots as $slot) {
                            unset($this->scheduleGrid[$day][$slot->time_slot_id][$room->room_id]);
                            unset($this->teacherGrid[$day][$slot->time_slot_id][$block['teacher_id']]);
                            unset($this->classGrid[$day][$slot->time_slot_id][$block['class_id']]);
                        }
                    }
                }
            }
        }

        return false; // Could not schedule this block
    }

    private function hasSubjectOnDay($classId, $subjectId, $day)
    {
        if (!isset($this->scheduleGrid[$day])) return false;

        foreach ($this->scheduleGrid[$day] as $slotId => $rooms) {
            foreach ($rooms as $roomId => $assignment) {
                if ($assignment['class_id'] == $classId && $assignment['subject_id'] == $subjectId) {
                    return true;
                }
            }
        }
        return false;
    }

    private function saveScheduleToDatabase()
    {
        // Clear old generated schedules (for now, clear all)
        Schedule::truncate();

        $inserts = [];
        foreach ($this->scheduleGrid as $day => $slots) {
            foreach ($slots as $slotId => $rooms) {
                $slot = $this->timeSlots->firstWhere('time_slot_id', $slotId);
                foreach ($rooms as $roomId => $assignment) {
                    $inserts[] = [
                        'student_class_id' => $assignment['class_id'],
                        'subject_id' => $assignment['subject_id'],
                        'teacher_id' => $assignment['teacher_id'],
                        'room_id' => $roomId,
                        'day_of_week' => $day,
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // Insert in chunks
        $chunks = array_chunk($inserts, 100);
        foreach ($chunks as $chunk) {
            Schedule::insert($chunk);
        }
    }
}
