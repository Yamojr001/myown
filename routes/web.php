<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Welcome Page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// General Authenticated User Routes
Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Course Management & Testing
    Route::get('/my-courses', [CourseController::class, 'index'])->name('courses.index');
    Route::post('/my-courses', [CourseController::class, 'store'])->name('courses.store');
    
    // NEW: Route to view a single course's details
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    
    Route::get('/courses/{course}/pre-test', [CourseController::class, 'showTest'])->name('courses.test.show');
    Route::post('/courses/{course}/pre-test', [CourseController::class, 'storeTest'])->name('courses.test.store');
    Route::get('/tests/{test}/results', [TestController::class, 'showResult'])->name('tests.result.show');
});

// Admin-Only Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
});

// Authentication Routes
require __DIR__.'/auth.php';