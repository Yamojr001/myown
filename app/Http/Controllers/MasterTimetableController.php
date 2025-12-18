<?php

namespace App\Http\Controllers;

use App\Models\MasterTimetable;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Smalot\PdfParser\Parser;

class MasterTimetableController extends Controller
{
    /**
     * Display the master timetable survey and existing schedule.
     */
    public function show()
    {
        $user = Auth::user();
        $courses = $user->courses()->with('tests')->get();
        $timetable = $user->masterTimetable;

        $coursesData = [];
        $allTestsTaken = $courses->isNotEmpty(); // Assume true if courses exist, then check

        $parser = new Parser();

        foreach ($courses as $course) {
            $latestTest = $course->tests()->latest()->first();
            // If any course is missing a test result, the user cannot generate a master timetable.
            if (!$latestTest) {
                $allTestsTaken = false;
            }

            // Get the page count from the course's PDF file
            $pageCount = 0;
            try {
                $filePath = storage_path('app/public/' . $course->file_path);
                if (file_exists($filePath)) {
                    $pdf = $parser->parseFile($filePath);
                    $pageCount = count($pdf->getPages());
                }
            } catch (\Exception $e) {
                \Log::warning("Could not parse PDF for page count for course ID: {$course->id}");
            }

            $coursesData[] = [
                'id' => $course->id,
                'title' => $course->title,
                'code' => $course->code,
                'latest_score' => $latestTest ? $latestTest->score : null,
                'page_count' => $pageCount,
            ];
        }

        return Inertia::render('MasterTimetable/Show', [
            'coursesData' => $coursesData,
            'allTestsTaken' => $allTestsTaken,
            'timetable' => $timetable,
            'flash' => ['error' => session('error')],
        ]);
    }

    /**
     * Generate a new master timetable.
     */
    public function generate(Request $request, AiService $aiService)
    {
        $preferences = $request->validate([
            'preferred_time' => ['required', 'string'],
            'study_hours' => ['required', 'integer', 'min:1', 'max:50'],
            'has_custom_schedule' => ['required', 'boolean'],
            'custom_schedules' => ['nullable', 'array'],
        ]);

        $user = Auth::user();
        $courses = $user->courses()->with('tests')->get();
        $parser = new Parser();
        $coursesForAI = [];

        foreach ($courses as $course) {
            $latestTest = $course->tests()->latest()->first();
            if ($latestTest) {
                $pageCount = 0;
                try {
                    $filePath = storage_path('app/public/' . $course->file_path);
                    if (file_exists($filePath)) {
                        $pdf = $parser->parseFile($filePath);
                        $pageCount = count($pdf->getPages());
                    }
                } catch (\Exception $e) { /* Ignore errors here, default to 0 */ }

                $coursesForAI[] = [
                    'title' => $course->title,
                    'score' => $latestTest->score,
                    'page_count' => $pageCount,
                    'weak_topics' => $latestTest->weak_topics,
                ];
            }
        }

        if (empty($coursesForAI)) {
            return back()->with('error', 'No courses with test results were found to generate a timetable.');
        }

        $schedule = $aiService->generateMasterTimetable($coursesForAI, $preferences);

        if (!$schedule) {
            return back()->with('error', 'The AI failed to generate a timetable at this time. Please try again.');
        }

        MasterTimetable::updateOrCreate(
            ['user_id' => $user->id],
            ['schedule' => $schedule]
        );

        return redirect()->route('master-timetable.show');
    }
}