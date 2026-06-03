<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $programs = Program::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('program_name', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Programs/Index', [
            'programs' => $programs,
            'filters' => $request->only(['search'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'program_name' => 'required|string|max:255|unique:programs',
        ]);

        Program::create($request->all());

        return to_route('admin.programs.index')
            ->with('success', 'Program created successfully.');
    }

    public function update(Request $request, Program $program)
    {
        $request->validate([
            'program_name' => [
                'required', 'string', 'max:255',
                Rule::unique('programs')->ignore($program->program_id, 'program_id')
            ]
        ]);

        $program->update($request->all());

        return to_route('admin.programs.index')
            ->with('success', 'Program updated successfully.');
    }

    public function destroy(Program $program)
    {
        $program->delete();

        return to_route('admin.programs.index')
            ->with('success', 'Program deleted successfully.');
    }
}
