<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeachingAssignment;
use App\Models\User;
use App\Models\Subject;
use App\Models\StudentClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeachingAssignmentController extends Controller
{
    public function index()
    {
        $assignments = TeachingAssignment::with(['teacher', 'subject', 'studentClass'])
            ->orderBy('student_class_id')
            ->get();
            
        $teachers = User::where('role_id', 2)->get();
        $subjects = Subject::all();
        $classes = StudentClass::all();

        return Inertia::render('Admin/TeachingAssignments/Index', [
            'assignments' => $assignments,
            'teachers' => $teachers,
            'subjects' => $subjects,
            'classes' => $classes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,user_id',
            'subject_id' => 'required|exists:subjects,subject_id',
            'student_class_id' => 'required|exists:student_classes,student_class_id',
        ]);

        // Prevent assigning the same subject to the same class more than once per year
        $exists = TeachingAssignment::where('subject_id', $request->subject_id)
            ->where('student_class_id', $request->student_class_id)
            ->where('academic_year', '2026/2027')
            ->exists();

        if ($exists) {
            return back()->withErrors(['subject_id' => 'This class already has a teacher assigned for this subject.']);
        }

        TeachingAssignment::create([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'student_class_id' => $request->student_class_id,
            'academic_year' => '2026/2027',
        ]);

        return redirect()->route('admin.teaching-assignments.index')->with('success', 'Teaching assignment created successfully.');
    }

    public function update(Request $request, TeachingAssignment $teachingAssignment)
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,user_id',
            'subject_id' => 'required|exists:subjects,subject_id',
            'student_class_id' => 'required|exists:student_classes,student_class_id',
        ]);

        // Prevent assigning the same subject to the same class more than once per year (unless it's this exact assignment)
        $exists = TeachingAssignment::where('subject_id', $request->subject_id)
            ->where('student_class_id', $request->student_class_id)
            ->where('academic_year', '2026/2027')
            ->where('assignment_id', '!=', $teachingAssignment->assignment_id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['subject_id' => 'This class already has a teacher assigned for this subject.']);
        }

        $teachingAssignment->update([
            'teacher_id' => $request->teacher_id,
            'subject_id' => $request->subject_id,
            'student_class_id' => $request->student_class_id,
        ]);

        return redirect()->route('admin.teaching-assignments.index')->with('success', 'Teaching assignment updated successfully.');
    }

    public function destroy(TeachingAssignment $teachingAssignment)
    {
        $teachingAssignment->delete();
        return redirect()->route('admin.teaching-assignments.index')->with('success', 'Teaching assignment deleted successfully.');
    }
}
