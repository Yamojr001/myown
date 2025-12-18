<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Timetable;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TimetableController extends Controller
{
    public function show(Course $course)
    {
        Gate::authorize('view', $course);

        $latestTest = $course->tests()->latest()->first();
        $timetable = $course->timetable; // Get the existing timetable if it exists

        return Inertia::render('Timetable/Show', [
            'course' => $course,
            'weakTopics' => $latestTest ? $latestTest->weak_topics : [],
            'timetable' => $timetable,
            'flash' => ['error' => session('error')],
        ]);
    }

    public function generate(Request $request, Course $course, AiService $aiService)
    {
        Gate::authorize('update', $course);

        $preferences = $request->validate([
            'uses_suggestion' => 'required|string',
            'preferred_time' => 'required|string',
            'study_hours' => 'required|integer|min:1|max:40',
            'has_custom_schedule' => 'required|boolean',
            'custom_schedules' => 'nullable|array',
        ]);

        $latestTest = $course->tests()->latest()->first();
        if (!$latestTest || empty($latestTest->weak_topics)) {
            return back()->with('error', 'Cannot generate a timetable without weak topics. Please take a test first.');
        }

        $schedule = $aiService->generateTimetable($latestTest->weak_topics, $preferences);

        if (!$schedule) {
            return back()->with('error', 'The AI failed to generate a timetable. Please try again.');
        }

        Timetable::updateOrCreate(
            ['course_id' => $course->id, 'user_id' => $request->user()->id],
            ['schedule' => $schedule]
        );

        return redirect()->route('timetables.show', $course->id);
    }
}