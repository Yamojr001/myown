<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\SemesterController; // <-- IMPORT
use App\Http\Controllers\MasterTimetableController;
use App\Http\Controllers\ReadingPlanController; // <-- IMPORT
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\PastQuestionController;
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

// Legal Pages
Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

// General Authenticated User Routes
Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Semester Management
    Route::post('/semesters', [SemesterController::class, 'store'])->name('semesters.store');
    Route::post('/semesters/switch', [SemesterController::class, 'switch'])->name('semesters.switch');
    
    // Course Management & Testing
    Route::get('/my-courses', [CourseController::class, 'index'])->name('courses.index');
    Route::post('/courses/extract-text', [CourseController::class, 'extractText'])->name('courses.extract-text');
    Route::post('/my-courses', [CourseController::class, 'store'])->name('courses.store');
    Route::get('/courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::get('/courses/{course}/pre-test', [CourseController::class, 'showTest'])->name('courses.test.show');
    Route::post('/courses/{course}/pre-test', [CourseController::class, 'storeTest'])->name('courses.test.store');

    // Advanced Testing Dashboard
    // Use /assessment* paths to avoid conflicts with the project-level /tests directory on some web servers.
    Route::get('/assessment', [TestController::class, 'index'])->name('tests.index');
    Route::post('/assessment/generate', [TestController::class, 'generate'])->name('tests.generate');
    Route::get('/assessment/take', [TestController::class, 'take'])->name('tests.take');
    Route::post('/assessment/store-objective', [TestController::class, 'storeObjective'])->name('tests.store.objective');
    Route::post('/assessment/store-essay', [TestController::class, 'storeEssay'])->name('tests.store.essay');
    Route::get('/assessment/{test}/results', [TestController::class, 'showResult'])->name('tests.result.show');

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

    // History Route
    Route::get('/history', [HistoryController::class, 'index'])->name('history.index');

    // Tutor and Read Aloud
    Route::get('/tutor', function() { return Inertia::render('Tutor/Show'); })->name('tutor.show');
    Route::post('/tutor/explain', [\App\Http\Controllers\TutorController::class, 'explain'])->name('tutor.explain');
    Route::get('/read-aloud', function() { return Inertia::render('ReadAloud/Show'); })->name('read-aloud.show');

    // Past Questions Routes
    Route::get('/past-questions', [PastQuestionController::class, 'index'])->name('past-questions.index');
    // Renamed upload path to /past-questions/upload for clarity
    Route::get('/past-questions/upload', [PastQuestionController::class, 'create'])->name('past-questions.upload');
    Route::post('/past-questions/upload', [PastQuestionController::class, 'store'])->name('past-questions.store');
    Route::get('/past-questions/{pastQuestion}/solve', [PastQuestionController::class, 'solve'])->name('past-questions.solve');
    Route::post('/past-questions/{pastQuestion}/ai-solve', [PastQuestionController::class, 'aiSolve'])->name('past-questions.ai-solve');
    Route::post('/past-questions/{pastQuestion}/grade', [PastQuestionController::class, 'grade'])->name('past-questions.grade');
    Route::get('/past-questions/{pastQuestion}/download', [PastQuestionController::class, 'download'])->name('past-questions.download');
});

// Admin-Only Routes
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('/users', [\App\Http\Controllers\Admin\AdminController::class, 'users'])->name('users');
    Route::post('/users/{user}/toggle-admin', [\App\Http\Controllers\Admin\AdminController::class, 'toggleAdmin'])->name('users.toggle-admin');
    Route::post('/users/{user}/toggle-status', [\App\Http\Controllers\Admin\AdminController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::get('/courses', [\App\Http\Controllers\Admin\AdminController::class, 'courses'])->name('courses');
    Route::get('/past-questions', [\App\Http\Controllers\Admin\AdminController::class, 'pastQuestions'])->name('past-questions');
    Route::get('/logs', [\App\Http\Controllers\Admin\AdminController::class, 'logs'])->name('logs');
    Route::get('/settings', [\App\Http\Controllers\Admin\AdminController::class, 'settings'])->name('settings');
    Route::get('/newsletter', [\App\Http\Controllers\Admin\AdminController::class, 'newsletter'])->name('newsletter');
    Route::post('/newsletter/send', [\App\Http\Controllers\Admin\AdminController::class, 'sendNewsletter'])->name('newsletter.send');
});

// Newsletter Unsubscription
Route::get('/newsletter/unsubscribe/{email}', function (Request $request, $email) {
    \App\Models\User::where('email', $email)->update(['subscribed_to_newsletter' => false]);
    return Inertia::render('Auth/Unsubscribed');
})->name('newsletter.unsubscribe');

// Deactivated Notice Page
Route::get('/deactivated', function () {
    return Inertia::render('Auth/Deactivated');
})->middleware(['auth'])->name('deactivated');

// Authentication Routes
require __DIR__.'/auth.php';