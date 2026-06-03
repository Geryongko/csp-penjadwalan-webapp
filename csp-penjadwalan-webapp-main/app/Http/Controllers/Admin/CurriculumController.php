<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Curriculum;
use App\Models\Program;
use App\Models\Subject;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CurriculumController extends Controller
{
    public function index(Request $request)
    {
        $selectedProgramId = $request->input('program_id');

        if (!$selectedProgramId) {
            return Inertia::render('Admin/Curriculums/Index', [
                'view_mode' => 'list_programs',
                'programs' => Program::when($request->input('search'), function($q, $search){
                        $q->where('program_name', 'like', "%{$search}%");
                    })->get(),
                'filters' => $request->only(['search']),
                'allPrograms' => Program::select('program_id', 'program_name')->get(),
                'allSubjects' => Subject::select('subject_id', 'subject_name', 'subject_code', 'jp')->get(),
            ]);
        }

        $curriculums = Curriculum::with('subject')
            ->where('program_id', $selectedProgramId)
            ->orderBy('semester')
            ->get();

        $selectedProgram = Program::find($selectedProgramId);

        $subjects = Subject::select('subject_id', 'subject_name', 'subject_code', 'jp')->get();

        return Inertia::render('Admin/Curriculums/Index', [
            'view_mode' => 'detail_curriculum',
            'curriculums' => $curriculums,
            'selected_program' => $selectedProgram,
            'subjects' => $subjects,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'program_id'    => 'required',
            'subject_id'    => 'required|exists:subjects,subject_id',
            'semester'      => 'required|integer|min:1|max:6',
            'category'      => 'required|string',
        ]);

        Curriculum::updateOrCreate(
            [
                'program_id'  => $request->program_id,
                'subject_id' => $request->subject_id,
            ],
            [
                'semester' => $request->semester,
                'category' => $request->category
            ]
        );
        return back()->with('success', 'Subject added to curriculum.');
    }

    public function destroy($id)
    {
        Curriculum::destroy($id);
        return back()->with('success', 'Subject removed from curriculum.');
    }
}
