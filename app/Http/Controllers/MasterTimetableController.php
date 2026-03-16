<?php

namespace App\Http\Controllers;

use App\Models\MasterTimetable;
use App\Models\Test;
use App\Models\Course;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Smalot\PdfParser\Parser;
use Carbon\Carbon;

class MasterTimetableController extends Controller
{
    public function show()
    {
        $user = Auth::user();
        $courses = $user->courses()->with('tests')->get();
        $timetable = $user->masterTimetable;

        $coursesData = [];
        $allTestsTaken = $courses->isNotEmpty();

        $parser = new Parser();

        foreach ($courses as $course) {
            $latestTest = $course->tests()->latest()->first();
            if (!$latestTest) {
                $allTestsTaken = false;
            }

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
                'has_initial_test' => $course->tests()->exists(),
            ];
        }

        // Check if user needs to take a test
        $needsTest = false;
        $nextTestInfo = null;
        
        if ($timetable && $timetable->test_schedule) {
            $nextTestInfo = $timetable->next_test_info;
            $currentWeek = $timetable->current_week;
            
            if ($nextTestInfo && $currentWeek >= $nextTestInfo['week']) {
                $needsTest = true;
            }
        }

        return Inertia::render('MasterTimetable/Show', [
            'coursesData' => $coursesData,
            'allTestsTaken' => $allTestsTaken,
            'timetable' => $timetable,
            'currentWeekSchedule' => $timetable?->current_week_schedule,
            'semesterInfo' => [
                'current_week' => $timetable?->current_week,
                'total_weeks' => $timetable?->semester_duration_weeks,
                'start_date' => $timetable?->semester_start_date,
                'today' => Carbon::today()->format('Y-m-d'),
            ],
            'testInfo' => [
                'needs_test' => $needsTest,
                'next_test' => $nextTestInfo,
                'test_schedule' => $timetable?->test_schedule,
            ],
            'flash' => ['error' => session('error'), 'success' => session('success')],
        ]);
    }

    public function generate(Request $request, AiService $aiService)
    {
        $preferences = $request->validate([
            'preferred_time' => ['required', 'string'],
            'study_hours' => ['required', 'integer', 'min:1', 'max:50'],
            'semester_duration_weeks' => ['required', 'integer', 'min:8', 'max:52'],
            'semester_start_date' => ['required', 'date'],
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
                } catch (\Exception $e) { }

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

        // Calculate test schedule based on semester weeks
        $testSchedule = $this->calculateTestSchedule($preferences['semester_duration_weeks']);
        
        // Generate semester schedule with test weeks
        $weeklySchedule = $aiService->generateSemesterSchedule(
            $coursesForAI, 
            $preferences,
            $preferences['semester_duration_weeks'],
            $testSchedule
        );

        if (!$weeklySchedule) {
            return back()->with('error', 'The AI failed to generate a timetable at this time. Please try again.');
        }

        // Generate weekly timetable for current week
        $currentWeekSchedule = $aiService->generateWeeklyTimetableFromSemesterSchedule(
            $weeklySchedule,
            $preferences,
            1
        );

        MasterTimetable::updateOrCreate(
            ['user_id' => $user->id],
            [
                'schedule' => $currentWeekSchedule,
                'weekly_schedule' => $weeklySchedule,
                'semester_duration_weeks' => $preferences['semester_duration_weeks'],
                'semester_start_date' => $preferences['semester_start_date'],
                'current_week' => 1,
                'test_schedule' => $testSchedule,
                'next_test_week' => $testSchedule[0]['week'],
            ]
        );

        return redirect()->route('master-timetable.show')->with('success', 'Master timetable generated successfully!');
    }

    /**
     * Calculate test schedule based on semester weeks
     */
    private function calculateTestSchedule(int $semesterWeeks): array
    {
        // Remove 2 weeks for mock exam at the end
        $studyWeeks = $semesterWeeks - 2;
        
        // Divide remaining weeks into three parts
        $parts = $this->divideIntoThree($studyWeeks);
        
        $testWeeks = [];
        $currentWeek = 0;
        
        // Test 1: Mid-semester test (after first part)
        $currentWeek += $parts[0];
        $testWeeks[] = [
            'name' => 'Mid-Semester Test',
            'week' => $currentWeek,
            'type' => 'mid_semester',
            'description' => 'Assess progress after first study period',
        ];
        
        // Test 2: Post-test (after second part)
        $currentWeek += $parts[1];
        $testWeeks[] = [
            'name' => 'Post-Test',
            'week' => $currentWeek,
            'type' => 'post_test',
            'description' => 'Evaluate understanding after second study period',
        ];
        
        // Test 3: Mock Exam (at the end, after third part)
        $currentWeek += $parts[2];
        $testWeeks[] = [
            'name' => 'Mock Exam',
            'week' => $semesterWeeks - 1,
            'type' => 'mock_exam',
            'description' => 'Final comprehensive exam simulation',
        ];
        
        return $testWeeks;
    }

    /**
     * Divide weeks into three parts
     */
    private function divideIntoThree(int $weeks): array
    {
        $base = floor($weeks / 3);
        $remainder = $weeks % 3;
        
        $parts = [$base, $base, $base];
        
        if ($remainder >= 1) {
            $parts[0] += 1;
        }
        if ($remainder >= 2) {
            $parts[1] += 1;
        }
        
        return $parts;
    }

    /**
     * Start a test for all courses
     */
    public function startTest(Request $request)
    {
        $user = Auth::user();
        $timetable = $user->masterTimetable;
        
        if (!$timetable || !$timetable->test_schedule) {
            return back()->with('error', 'No timetable or test schedule found.');
        }
        
        $currentWeek = $timetable->current_week;
        $testSchedule = $timetable->test_schedule;
        
        // Find which test is due
        $currentTest = null;
        foreach ($testSchedule as $test) {
            if ($test['week'] === $currentWeek) {
                $currentTest = $test;
                break;
            }
        }
        
        if (!$currentTest) {
            return back()->with('error', 'No test scheduled for this week.');
        }
        
        // Check if user has already taken this test
        $courses = $user->courses()->get();
        $hasTakenTest = true;
        foreach ($courses as $course) {
            $existingTest = $course->tests()
                ->where('type', $currentTest['type'])
                ->first();
                
            if (!$existingTest) {
                $hasTakenTest = false;
                break;
            }
        }
        
        if ($hasTakenTest) {
            return back()->with('error', 'You have already taken this test.');
        }
        
        // Redirect to test page
        return redirect()->route('tests.create', [
            'test_type' => $currentTest['type'],
            'test_name' => $currentTest['name']
        ]);
    }

    /**
     * Update next test after completing a test
     */
    public function updateTestProgress(Request $request, $testType)
    {
        $user = Auth::user();
        $timetable = $user->masterTimetable;
        
        if (!$timetable) {
            return response()->json(['error' => 'No timetable found'], 404);
        }
        
        $testSchedule = $timetable->test_schedule;
        $nextTest = null;
        
        // Find next test
        foreach ($testSchedule as $test) {
            if ($test['type'] === $testType) {
                $currentIndex = array_search($test, $testSchedule);
                if (isset($testSchedule[$currentIndex + 1])) {
                    $nextTest = $testSchedule[$currentIndex + 1];
                }
                break;
            }
        }
        
        if ($nextTest) {
            $timetable->update([
                'next_test_week' => $nextTest['week']
            ]);
        }
        
        return response()->json(['success' => true, 'next_test' => $nextTest]);
    }

    /**
     * Get schedule for specific week
     */
    public function getWeek(Request $request, $week)
    {
        $user = Auth::user();
        $timetable = $user->masterTimetable;
        
        if (!$timetable) {
            return response()->json(['error' => 'No timetable found'], 404);
        }

        $week = min(max(1, $week), $timetable->semester_duration_weeks);
        
        // Check if this is a test week
        $isTestWeek = false;
        $testInfo = null;
        
        foreach ($timetable->test_schedule as $test) {
            if ($test['week'] == $week) {
                $isTestWeek = true;
                $testInfo = $test;
                break;
            }
        }
        
        // Regenerate weekly schedule
        $aiService = app(AiService::class);
        $weeklySchedule = $aiService->generateWeeklyTimetableFromSemesterSchedule(
            $timetable->weekly_schedule,
            [
                'preferred_time' => 'evening',
                'study_hours' => 15,
            ],
            $week
        );

        return response()->json([
            'schedule' => $weeklySchedule,
            'week' => $week,
            'total_weeks' => $timetable->semester_duration_weeks,
            'is_test_week' => $isTestWeek,
            'test_info' => $testInfo,
        ]);
    }

    /**
     * Download the timetable as a PDF
     */
    public function download(Request $request)
    {
        $user = Auth::user();
        $timetable = $user->masterTimetable;

        if (!$timetable) {
            return back()->with('error', 'No timetable found to download.');
        }

        $week = $request->query('week', $timetable->current_week);
        $week = min(max(1, $week), $timetable->semester_duration_weeks);

        $aiService = app(AiService::class);
        $weeklySchedule = $aiService->generateWeeklyTimetableFromSemesterSchedule(
            $timetable->weekly_schedule,
            [
                'preferred_time' => 'evening',
                'study_hours' => 15,
            ],
            $week
        );

        $data = [
            'user' => $user,
            'timetable' => $timetable,
            'week' => $week,
            'schedule' => $weeklySchedule,
            'daysOfWeek' => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.timetable', $data);
        
        return $pdf->download("master_timetable_week_{$week}.pdf");
    }
}