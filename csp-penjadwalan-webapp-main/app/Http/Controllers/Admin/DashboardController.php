<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subject;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        $totalStudents = User::where('role_id', 3)->count();

        $newStudentsThisMonth = User::where('role_id', 3)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalLecturers = User::where('role_id', 2)->count();

        $activeSubjects = Subject::count();


        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'stats' => [
                'students' => [
                    'total' => $totalStudents,
                    'new_this_month' => $newStudentsThisMonth,
                ],
                'lecturers' => [
                    'total' => $totalLecturers,
                ],
                'subjects' => [
                    'total' => $activeSubjects,
                ],
            ],
        ]);
    }
}
