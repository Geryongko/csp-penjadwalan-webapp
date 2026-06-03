<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $subjects = Subject::with(['program'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('subject_name', 'like', "%{$search}%")
                      ->orWhere('subject_code', 'like', "%{$search}%");
                });
            })
            ->when($request->input('program_id'), function ($query, $id) {
                $query->where('program_id', $id);
            })
            ->paginate(10)
            ->withQueryString();

        $programs = Program::select('program_id', 'program_name')->orderBy('program_name')->get();

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'programs' => $programs,
            'filters' => $request->only(['search', 'program_id']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_name' => 'required|string|max:255',
            'jp'           => 'required|integer|min:1|max:10',
            'program_id'   => 'nullable|exists:programs,program_id',
            'description'  => 'nullable|string',
        ]);

        $prefix = strtoupper(substr($request->subject_name, 0, 3));

        do {
            $number = rand(100, 999);
            $generatedCode = $prefix . '-' . $number;
        } while (Subject::where('subject_code', $generatedCode)->exists());

        Subject::create([
            'subject_code' => $generatedCode,
            'subject_name' => $request->subject_name,
            'jp'           => $request->jp,
            'program_id'   => $request->program_id,
            'description'  => $request->description,
        ]);

        return to_route('admin.subjects.index')->with('success', 'Subject created successfully with code: ' . $generatedCode);
    }

    public function update(Request $request, Subject $subject)
    {
        $request->validate([
            'subject_code' => [
                'required', 'string', 'max:20',
                Rule::unique('subjects')->ignore($subject->subject_id, 'subject_id')
            ],
            'subject_name' => 'required|string|max:255',
            'jp'           => 'required|integer|min:1|max:10',
            'program_id'   => 'nullable|exists:programs,program_id',
            'description'  => 'nullable|string',
        ]);

        $subject->update($request->all());

        return to_route('admin.subjects.index')->with('success', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return to_route('admin.subjects.index')->with('success', 'Subject deleted successfully.');
    }
}
