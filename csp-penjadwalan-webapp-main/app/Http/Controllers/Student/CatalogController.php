<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\KrsItem;
use App\Models\Grade;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $studentProfile = $user->studentProfile;

        if (!$studentProfile) {
            return Inertia::render('Student/Catalog/Index', [
                'catalog' => []
            ]);
        }

        // Get active enrollment for the student
        $enrollment = \App\Models\Enrollment::where('student_id', $user->user_id)->first();
        $studentClassId = $enrollment ? $enrollment->student_class_id : null;

        $curriculums = Curriculum::with('subject')
            ->where('program_id', $studentProfile->program_id)
            ->whereIn('semester', [1, 2]) // High school only has Semester 1 (Ganjil) and 2 (Genap)
            ->orderBy('semester')
            ->get();

        $catalog = $curriculums->map(function ($curr) use ($studentClassId) {
            // Find who teaches this subject for this specific student's class
            $teacherName = 'Not Assigned';
            
            if ($studentClassId && $curr->subject_id) {
                $schedule = \App\Models\Schedule::with('teacher')
                    ->where('student_class_id', $studentClassId)
                    ->where('subject_id', $curr->subject_id)
                    ->first();
                
                if ($schedule && $schedule->teacher) {
                    $teacherName = $schedule->teacher->full_name;
                }
            }

            return [
                'id' => $curr->subject_id,
                'code' => $curr->subject->subject_code ?? '-',
                'name' => $curr->subject->subject_name ?? '-',
                'semester' => $curr->semester,
                'teacher_name' => $teacherName
            ];
        });

        return Inertia::render('Student/Catalog/Index', [
            'catalog' => $catalog
        ]);
    }
}
