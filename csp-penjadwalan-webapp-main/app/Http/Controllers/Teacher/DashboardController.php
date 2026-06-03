<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        $teacher = Auth::user();
        
        // Eager load lecturer profile
        $teacher->load(['lecturerProfile']);

        // In a real SMA application, we would also load the Rombels where this teacher is homeroom
        // and the Subjects they are scheduled to teach. We will add those later.

        return Inertia::render('Teacher/Dashboard', [
            'teacher' => $teacher
        ]);
    }
}
