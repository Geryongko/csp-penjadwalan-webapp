<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentClass;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentClassController extends Controller
{
    public function index(Request $request)
    {
        $classes = StudentClass::with(['program', 'homeroomTeacher'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('class_name', 'like', "%{$search}%")
                      ->orWhereHas('homeroomTeacher', function ($q) use ($search) {
                          $q->where('full_name', 'like', "%{$search}%");
                      });
            })
            ->when($request->input('program_id'), function ($query, $id) {
                $query->where('program_id', $id);
            })
            ->when($request->input('grade_level'), function ($query, $level) {
                $query->where('grade_level', $level);
            })
            ->orderBy('grade_level')
            ->orderBy('class_name')
            ->paginate(10)
            ->withQueryString();

        $programs = Program::select('program_id', 'program_name')->get();
        $teachers = User::where('role_id', 2)->select('user_id', 'full_name')->get();

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'programs' => $programs,
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'program_id', 'grade_level']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'class_name'          => 'required|string|max:20',
            'grade_level'         => 'required|integer|min:1|max:12',
            'program_id'          => 'nullable|exists:programs,program_id',
            'homeroom_teacher_id' => 'nullable|exists:users,user_id',
        ]);

        StudentClass::create($request->all());

        return to_route('admin.classes.index')
            ->with('success', 'Class created successfully.');
    }

    public function update(Request $request, StudentClass $class)
    {
        $request->validate([
            'class_name'          => 'required|string|max:20',
            'grade_level'         => 'required|integer|min:1|max:12',
            'program_id'          => 'nullable|exists:programs,program_id',
            'homeroom_teacher_id' => 'nullable|exists:users,user_id',
        ]);

        $class->update($request->all());

        return to_route('admin.classes.index')
            ->with('success', 'Class updated successfully.');
    }

    public function destroy($id)
    {
        StudentClass::destroy($id);
        return to_route('admin.classes.index')
            ->with('success', 'Class deleted successfully.');
    }
}
