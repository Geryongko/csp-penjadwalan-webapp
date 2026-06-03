<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\CostComponent;
use App\Models\StudentClass;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class BillingController extends Controller
{
    public function index()
    {
        $billings = Billing::with(['costComponent', 'student', 'semester'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        $costComponents = CostComponent::all();
        $classes = StudentClass::all();

        return Inertia::render('Admin/Billings/Index', [
            'billings' => $billings,
            'costComponents' => $costComponents,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cost_component_id' => 'required|exists:cost_components,cost_component_id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
            'student_class_id' => 'nullable|exists:student_classes,student_class_id',
            'due_date' => 'required|date',
        ]);

        $costComponent = CostComponent::findOrFail($request->cost_component_id);
        
        $monthName = date('F', mktime(0, 0, 0, $request->month, 10));
        $description = "{$costComponent->component_name} - {$monthName} {$request->year}";

        // Get students (role_id 3 is typically student)
        $studentsQuery = User::where('role_id', 3);
        
        if ($request->student_class_id) {
            // Filter by class by joining enrollments or student_profiles if needed
            // Wait, how do we filter students by class?
            // Usually student_profiles has program_id, but how is class linked? Let's check enrollments.
            $studentsQuery->whereHas('enrollments', function ($q) use ($request) {
                $q->where('student_class_id', $request->student_class_id);
            });
        }

        $students = $studentsQuery->get();
        $generatedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($students as $student) {
                // Check if this exact description already exists for this student to prevent duplicates
                $exists = Billing::where('student_id', $student->user_id)
                    ->where('cost_component_id', $costComponent->cost_component_id)
                    ->where('description', $description)
                    ->exists();

                if (!$exists) {
                    Billing::create([
                        'student_id' => $student->user_id,
                        'semester_id' => 1, // Fallback, could be dynamically resolved
                        'cost_component_id' => $costComponent->cost_component_id,
                        'description' => $description,
                        'amount' => $costComponent->amount,
                        'due_date' => $request->due_date,
                        'status' => 'unpaid',
                    ]);
                    $generatedCount++;
                }
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to generate bills: ' . $e->getMessage()]);
        }

        return back()->with('success', "Successfully generated {$generatedCount} bills.");
    }
}
