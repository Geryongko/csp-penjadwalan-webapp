<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;

use App\Models\Program;
use App\Models\Semester;
use App\Models\StudentProfile;
use App\Models\LecturerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index(Request $request)
    {

        $filters = $request->only('search', 'role');
        $roleId = $request->input('role', 3);

        $users = User::query()
            ->where('role_id', $roleId)
            ->with(['studentProfile.program', 'lecturerProfile', 'enrollments.studentClass'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $filters,
            'programs' => Program::all(['program_id', 'program_name']),
            'semesters' => Semester::all(['semester_id', 'semester_name', 'academic_year', 'term']),
            'studentClasses' => \App\Models\StudentClass::all(['student_class_id', 'class_name', 'grade_level']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_id' => 'required|integer|in:1,2,3',
            'phone_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $profilePicturePath = null;
        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $profilePicturePath = '/storage/' . $path;
        }

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'phone_number' => $request->phone_number,
            'birth_date' => $request->birth_date,
            'is_active' => true,
            'profile_picture' => $profilePicturePath,
        ]);

        if ($request->role_id == 3) {
            $request->validate([
                'student_class_id' => 'required|exists:student_classes,student_class_id',
                'semester_id' => 'required|exists:semesters,semester_id',
                'batch_year' => 'required|integer',
            ]);

            $studentClass = \App\Models\StudentClass::findOrFail($request->student_class_id);

            // Generate NIM (running number)
            $runningNumber = \App\Models\StudentProfile::where('batch_year', $request->batch_year)->count() + 1;
            $formattedRunningNumber = str_pad($runningNumber, 4, '0', STR_PAD_LEFT);
            $generatedNIM = $request->batch_year . $formattedRunningNumber;

            $user->studentProfile()->create([
                'student_number' => $generatedNIM,
                'program_id' => $studentClass->program_id,
                'semester_id' => $request->semester_id,
                'batch_year' => $request->batch_year,
            ]);

            \App\Models\Enrollment::create([
                'student_class_id' => $studentClass->student_class_id,
                'student_id' => $user->user_id,
                'enrollment_date' => now(),
                'status' => 'active'
            ]);
        } elseif ($request->role_id == 2) {
            $runningNumber = LecturerProfile::count() + 1;
            $generatedNIDN = 'G' . str_pad($runningNumber, 6, '0', STR_PAD_LEFT);

            $user->lecturerProfile()->create([
                'lecturer_number' => $generatedNIDN,
                'title' => $request->title,
                'position' => $request->position,
            ]);
        }

        return to_route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'students' => 'required|array|min:1',
            'students.*.full_name' => 'required|string|max:255',
            'students.*.email' => 'required|string|email|max:255',
            'students.*.phone_number' => 'nullable|string|max:20',
            'students.*.birth_date' => 'nullable|date',
            'student_class_id' => 'required|exists:student_classes,student_class_id',
            'semester_id' => 'required|exists:semesters,semester_id',
            'batch_year' => 'required|integer|digits:4',
        ]);

        $successCount = 0;
        $errors = [];
        
        $studentClass = \App\Models\StudentClass::findOrFail($request->student_class_id);

        foreach ($request->students as $index => $studentData) {
            $rowNumber = $index + 1;
            
            // Check if email already exists to prevent hard crashes
            if (User::where('email', $studentData['email'])->exists()) {
                $errors[] = "Row {$rowNumber}: Email {$studentData['email']} is already registered.";
                continue;
            }

            try {
                \Illuminate\Support\Facades\DB::beginTransaction();

                $user = User::create([
                    'full_name' => $studentData['full_name'],
                    'email' => $studentData['email'],
                    'password_hash' => Hash::make('password'),
                    'role_id' => 3, // Student
                    'phone_number' => $studentData['phone_number'] ?? null,
                    'birth_date' => $studentData['birth_date'] ?? null,
                ]);

                $runningNumber = \App\Models\StudentProfile::where('batch_year', $request->batch_year)->count() + 1;
                $formattedRunningNumber = str_pad($runningNumber, 4, '0', STR_PAD_LEFT);
                $generatedNIM = $request->batch_year . $formattedRunningNumber;

                $user->studentProfile()->create([
                    'student_number' => $generatedNIM,
                    'program_id' => $studentClass->program_id,
                    'semester_id' => $request->semester_id,
                    'batch_year' => $request->batch_year,
                ]);

                \App\Models\Enrollment::create([
                    'student_class_id' => $studentClass->student_class_id,
                    'student_id' => $user->user_id,
                    'enrollment_date' => now(),
                    'status' => 'active'
                ]);

                \Illuminate\Support\Facades\DB::commit();
                $successCount++;
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\DB::rollBack();
                $errors[] = "Row {$rowNumber}: Failed to save {$studentData['full_name']} due to server error.";
            }
        }

        if (count($errors) > 0) {
            return back()->withErrors(['bulk_import' => $errors])->with('success', "Imported {$successCount} students successfully, but encountered errors on some rows.");
        }

        return to_route('admin.users.index')->with('success', "Successfully imported {$successCount} students.");
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
            'role_id' => 'required|integer|in:1,2,3',
            'phone_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $userData = [
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'birth_date' => $request->birth_date,
        ];

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture) {
                $oldPath = str_replace('/storage/', '', $user->profile_picture);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $userData['profile_picture'] = '/storage/' . $path;
        }

        $user->update($userData);

        if ($user->role_id == 3) {
            $request->validate([
                'student_class_id' => 'required|exists:student_classes,student_class_id',
                'semester_id' => 'required|exists:semesters,semester_id',
                'batch_year' => 'required|integer',
            ]);

            $studentClass = \App\Models\StudentClass::findOrFail($request->student_class_id);

            $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'program_id' => $studentClass->program_id,
                    'semester_id' => $request->semester_id,
                    'batch_year' => $request->batch_year,
                ]
            );

            $user->enrollments()->updateOrCreate(
                ['student_id' => $user->user_id],
                [
                    'student_class_id' => $studentClass->student_class_id,
                    'enrollment_date' => now(),
                    'status' => 'active'
                ]
            );
        } elseif ($user->role_id == 2) {
            $user->lecturerProfile()->updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'lecturer_number' => $user->lecturerProfile->lecturer_number ?? ('G' . str_pad(LecturerProfile::count() + 1, 6, '0', STR_PAD_LEFT)),
                    'title' => $request->title,
                    'position' => $request->position,
                ]
            );
        }

        return to_route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {

        if ($user->profile_picture) {
            $oldPath = str_replace('/storage/', '', $user->profile_picture);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $user->delete();
        return to_route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
