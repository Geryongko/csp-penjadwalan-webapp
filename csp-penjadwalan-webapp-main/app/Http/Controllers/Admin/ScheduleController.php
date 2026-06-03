<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Services\CSPEngine;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        // Fetch all generated schedules to display in the grid
        $schedules = Schedule::with(['studentClass', 'subject', 'teacher', 'room'])
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();

        $formattedSchedules = [];
        foreach ($schedules as $sch) {
            $formattedSchedules[$sch->day_of_week][] = $sch;
        }

        return Inertia::render('Admin/Schedules/Index', [
            'schedules' => $formattedSchedules
        ]);
    }

    public function generate()
    {
        // Increase time limit because CSP can take a few seconds
        set_time_limit(120);

        $engine = new CSPEngine();
        $result = $engine->generate();

        if ($result['status'] === 'success') {
            return redirect()->back()->with('success', $result['message']);
        } else {
            return redirect()->back()->with('error', $result['message']);
        }
    }
}
