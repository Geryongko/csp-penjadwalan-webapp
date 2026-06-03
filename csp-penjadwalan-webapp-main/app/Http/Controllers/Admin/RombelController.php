<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rombel;
use App\Models\Program;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RombelController extends Controller
{
    public function index(Request $request)
    {
        $rombels = Rombel::with(['program', 'homeroomTeacher'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('rombel_name', 'like', "%{$search}%")
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
            ->orderBy('rombel_name')
            ->paginate(10)
            ->withQueryString();

        $programs = Program::select('program_id', 'program_name')->get();
        $teachers = User::where('role_id', 2)->select('user_id', 'full_name')->get();

        return Inertia::render('Admin/Rombels/Index', [
            'rombels' => $rombels,
            'programs' => $programs,
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'program_id', 'grade_level']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'rombel_name'         => 'required|string|max:20',
            'grade_level'         => 'required|integer|min:1|max:12',
            'program_id'          => 'nullable|exists:programs,program_id',
            'homeroom_teacher_id' => 'nullable|exists:users,user_id',
        ]);

        Rombel::create($request->all());

        return to_route('admin.rombels.index')
            ->with('success', 'Rombel created successfully.');
    }

    public function update(Request $request, Rombel $rombel)
    {
        $request->validate([
            'rombel_name'         => 'required|string|max:20',
            'grade_level'         => 'required|integer|min:1|max:12',
            'program_id'          => 'nullable|exists:programs,program_id',
            'homeroom_teacher_id' => 'nullable|exists:users,user_id',
        ]);

        $rombel->update($request->all());

        return to_route('admin.rombels.index')
            ->with('success', 'Rombel updated successfully.');
    }

    public function destroy($id)
    {
        Rombel::destroy($id);
        return to_route('admin.rombels.index')
            ->with('success', 'Rombel deleted successfully.');
    }
}
