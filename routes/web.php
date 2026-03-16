<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\MasterTimetableController;
use App\Http\Controllers\ReadingPlanController; // <-- IMPORT
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
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/courses/{course}/pre-test', [CourseController::class, 'showTest'])->name('courses.test.show');
    Route::post('/courses/{course}/pre-test', [CourseController::class, 'storeTest'])->name('courses.test.store');
    Route::get('/tests/{test}/results', [TestController::class, 'showResult'])->name('tests.result.show');

    // AI Suggestion Routes
    Route::get('/courses/{course}/suggestion', [SuggestionController::class, 'show'])->name('suggestion.show');
    Route::post('/courses/{course}/suggestion', [SuggestionController::class, 'generate'])->name('suggestion.generate');
    Route::get('/suggestion/{suggestion}/download', [SuggestionController::class, 'download'])->name('suggestion.download');

    // Master Timetable Routes
    Route::get('/master-timetable', [MasterTimetableController::class, 'show'])->name('master-timetable.show');
    Route::post('/master-timetable', [MasterTimetableController::class, 'generate'])->name('master-timetable.generate');
    Route::get('/master-timetable/download', [MasterTimetableController::class, 'download'])->name('master-timetable.download');
    Route::get('/master-timetable/week/{week}', [MasterTimetableController::class, 'getWeek'])->name('master-timetable.week');
    Route::get('/master-timetable/start-test', [MasterTimetableController::class, 'startTest'])->name('master-timetable.start-test');

    // Reading Plan Route
    Route::get('/reading-plan', [ReadingPlanController::class, 'index'])->name('reading-plan.index');

    // Tutor and Read Aloud
    Route::get('/tutor', function() { return Inertia::render('Tutor/Show'); })->name('tutor.show');
    Route::post('/tutor/explain', [\App\Http\Controllers\TutorController::class, 'explain'])->name('tutor.explain');
    Route::get('/read-aloud', function() { return Inertia::render('ReadAloud/Show'); })->name('read-aloud.show');
});

// Admin-Only Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
});

// Authentication Routes
require __DIR__.'/auth.php';