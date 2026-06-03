<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

use App\Http\Controllers\Admin\FacultyController;
use App\Http\Controllers\Admin\MajorController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SemesterController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\CourseClassController;
use App\Http\Controllers\Admin\CurriculumController;
use App\Http\Controllers\Admin\CostComponentController;

use App\Http\Controllers\Student\BillingController;
use App\Http\Controllers\Student\PaymentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (Auth::check()) {
        $role = Auth::user()->role_id;

        if ($role == 1) {
            return redirect()->route('admin.dashboard');
        }
        elseif ($role == 3) {
            return redirect()->route('student.dashboard');
        }
    }

    return Inertia::render('Welcome');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
        
        Route::resource('users', App\Http\Controllers\Admin\UserController::class);
        Route::resource('programs', App\Http\Controllers\Admin\ProgramController::class)->except(['show']);
        Route::resource('rooms', App\Http\Controllers\Admin\RoomController::class)->except(['show']);
        Route::resource('semesters', App\Http\Controllers\Admin\SemesterController::class)->except(['show']);
        Route::resource('subjects', App\Http\Controllers\Admin\SubjectController::class)->except(['show']);
        Route::resource('rombels', App\Http\Controllers\Admin\RombelController::class);
        
        Route::get('curriculums', [App\Http\Controllers\Admin\CurriculumController::class, 'index'])->name('curriculums.index');
        Route::post('curriculums', [App\Http\Controllers\Admin\CurriculumController::class, 'store'])->name('curriculums.store');
        Route::delete('curriculums/{id}', [App\Http\Controllers\Admin\CurriculumController::class, 'destroy'])->name('curriculums.destroy');
        
        Route::resource('cost_components', App\Http\Controllers\Admin\CostComponentController::class)->except(['show']);
    });

    Route::middleware(['auth', 'verified', 'student'])->prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');
        
        // KRS logic has been removed for SMA
        
        Route::get('billing', [App\Http\Controllers\Student\BillingController::class, 'index'])->name('billing.index');
        Route::post('billing/{billing}/pay', [App\Http\Controllers\Student\BillingController::class, 'pay'])->name('billing.pay');
    
        Route::get('profile', [\App\Http\Controllers\Student\ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [\App\Http\Controllers\Student\ProfileController::class, 'update'])->name('profile.update');
        Route::put('password', [\App\Http\Controllers\Student\ProfileController::class, 'updatePassword'])->name('password.update');

        Route::get('catalog', [App\Http\Controllers\Student\CatalogController::class, 'index'])->name('catalog.index');
    });
});

Route::get('language/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'id'])) {
        Session::put('locale', $locale);
    }
    return back();
})->name('language.switch');

require __DIR__.'/auth.php';
