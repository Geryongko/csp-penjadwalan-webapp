<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TeachingAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = \App\Models\StudentClass::all();
        $teachers = \App\Models\User::where('role_id', 2)->get();

        if ($teachers->isEmpty() || $classes->isEmpty()) {
            return;
        }

        // Defined mappings based on user requests:
        // userid 3 -> Matematika (5)
        // userid 4 -> Fisika (6)
        // userid 5 -> Kimia (7)
        // userid 6 -> Biologi (8)
        // userid 7 -> Sejarah (12)
        // userid 8 -> Ekonomi (9)
        $teacherSubjectMap = [
            5 => 3,
            6 => 4,
            7 => 5,
            8 => 6,
            12 => 7,
            9 => 8,
        ];

        // For other subjects, fallback to a random teacher
        $otherSubjects = \App\Models\Subject::whereNotIn('subject_id', array_keys($teacherSubjectMap))->get();
        $teacherIndex = 0;
        foreach ($otherSubjects as $subject) {
            $teacher = $teachers[$teacherIndex % $teachers->count()];
            $teacherSubjectMap[$subject->subject_id] = $teacher->user_id;
            $teacherIndex++;
        }

        foreach ($classes as $class) {
            // Get curriculums for this class
            $curriculums = \App\Models\Curriculum::where('program_id', $class->program_id)
                ->orWhereNull('program_id')
                ->get();

            foreach ($curriculums as $curr) {
                // Ensure a unique constraint isn't violated by using updateOrCreate
                \App\Models\TeachingAssignment::updateOrCreate(
                    [
                        'subject_id' => $curr->subject_id,
                        'student_class_id' => $class->student_class_id,
                        'academic_year' => '2026/2027',
                    ],
                    [
                        'teacher_id' => $teacherSubjectMap[$curr->subject_id],
                    ]
                );
            }
        }
    }
}
