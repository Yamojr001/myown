<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ReadingPlanController extends Controller
{
    /**
     * Generate an AI-powered handout for a specific course.
     */
    public function generateHandout(Request $request, \App\Models\Course $course, \App\Services\AiService $aiService)
    {
        $user = Auth::user();
        if ($course->user_id !== $user->id) {
            abort(403);
        }

        $timetable = $user->masterTimetable;
        if (!$timetable) {
            return back()->with('error', 'Please generate your Master Timetable first to generate handouts.');
        }

        try {
            $courseData = [
                'title' => $course->title,
                'code' => $course->code,
                'topics' => $course->topics ?? [],
                'full_content' => $course->full_content,
            ];

            $readingPlan = $this->normalizeReadingPlan($course->reading_plan);
            $timetableData = $timetable->weekly_schedule ?? [];

            // Build a literal map of the schedule for the AI to see the slots
            $scheduleSummary = "";
            $weeklyDayMap = []; // [week_1 => [Monday, Tuesday], week_2 => [Monday, Wednesday]]
            $dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            
            foreach ($timetableData as $weekKey => $weekData) {
                if (!is_array($weekData)) continue;
                
                $weekNum = (int) str_replace('week_', '', $weekKey);
                foreach ($dayOrder as $day) {
                    $lowerDay = strtolower($day);
                    $dayKey = isset($weekData[$day]) ? $day : (isset($weekData[$lowerDay]) ? $lowerDay : null);
                    if (!$dayKey || !is_array($weekData[$dayKey])) continue;
                    
                    foreach ($weekData[$dayKey] as $slot) {
                        $slotCourse = $slot['course'] ?? $slot['title'] ?? $slot['course_title'] ?? '';
                        $match = false;
                        if (!empty($course->title) && stripos($slotCourse, $course->title) !== false) $match = true;
                        if (!empty($course->code) && stripos($slotCourse, $course->code) !== false) $match = true;

                        if ($match) {
                            $scheduleSummary .= "- Week {$weekNum}, {$day}: {$slot['time']} ({$slot['topic']})\n";
                            $weeklyDayMap[$weekNum][] = $lowerDay;
                        }
                    }
                }
                if (isset($weeklyDayMap[$weekNum])) {
                    $weeklyDayMap[$weekNum] = array_values(array_unique($weeklyDayMap[$weekNum]));
                }
            }

            // FALLBACK: If No slots found, use standard Mon-Fri
            if (empty($scheduleSummary)) {
                $scheduleSummary = "GENERAL STUDY SCHEDULE (Course not found in timetable, using standard weeks):\n";
                for ($i = 1; $i <= $timetable->semester_duration_weeks; $i++) {
                    $scheduleSummary .= "- Week {$i}: Monday, Tuesday, Wednesday, Thursday, Friday (2 hours daily)\n";
                }
            }

            $prompt = "You are an expert educational content creator. Using the provided course information and study timetable, generate a comprehensive reading handout for {$course->title} ({$course->code}).

STRICT REQUIREMENT: You MUST ONLY generate study content for the EXACT weeks and days listed in the STUDENT STUDY SCHEDULE below. 
- If a week is not listed, do not generate for it.
- If a day (e.g. Wednesday) is not listed for a specific week, DO NOT generate a reading for that day in that week.

COURSE INFORMATION:
- Title: {$course->title}
- Code: {$course->code}
- Semester Duration: {$timetable->semester_duration_weeks} weeks

STUDENT STUDY SCHEDULE (Weeks/Days allocated for this course):
{$scheduleSummary}

COURSE CONTENT (primary source):
" . substr($courseData['full_content'] ?? '', 0, 150000) . "

REQUIREMENTS:
1. Create a structured handout with entries for each week mentioned in the STUDY SCHEDULE.
2. For each week, provide readings ONLY for the specific days found in the STUDY SCHEDULE for that week.
3. Distribution: Evenly divide the course content across all scheduled slots.
4. Each daily entry MUST have a 'focus' (string), 'points' (array of strings), and 'tasks' (array of strings).
5. Ensure content is logically progressive and covers the entire course material by the final week.

Return your response as a single valid JSON object with this structure:
{
  \"weeks\": [
    {
      \"week_number\": 1,
      \"days\": {
        \"day_from_schedule\": {\"focus\": \"...\", \"points\": [...], \"tasks\": [...]}
      }
    }
  ]
}

IMPORTANT: The 'days' object for each week MUST ONLY contain keys for the days scheduled for THAT specific week (e.g., 'monday', 'tuesday').

Return ONLY the JSON object, no additional text.";

            $responseContent = $aiService->cleanJsonResponse($aiService->callGemini($prompt, 180, null));

            if (!$responseContent) {
                return back()->with('error', 'Failed to generate handout. Please try again.');
            }

            // Parse and validate JSON response
            $handoutData = json_decode($responseContent, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('Invalid handout JSON response', [
                    'course_id' => $course->id,
                    'response' => $responseContent,
                    'error' => json_last_error_msg(),
                ]);
                return back()->with('error', 'Generated handout format is invalid. Please try again.');
            }

            // Save the generated handout
            $course->update([
                'generated_handout' => $responseContent,
                'handout_generated_at' => now(),
            ]);

            return back()->with('success', 'Reading handout generated successfully for ' . $course->title);
        } catch (\Exception $e) {
            \Log::error('Handout generation failed', [
                'course_id' => $course->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            return back()->with('error', 'An error occurred while generating the handout. Please try again.');
        }
    }

    /**
     * Display daily reading handouts derived from generated plans or course content fallback.
     */
    public function handouts()
    {
        $user = Auth::user();

        $courses = $user->courses()
            ->where('semester_id', $user->current_semester_id)
            ->get()
            ->map(function ($course) {
                $readingPlan = $this->normalizeReadingPlan($course->reading_plan);
                $generatedHandout = null;
                $isHandoutGenerated = !empty($course->generated_handout);

                if ($isHandoutGenerated) {
                    $generatedHandout = json_decode($course->generated_handout, true);
                }

                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'code' => $course->code,
                    'hasGeneratedPlan' => !empty($readingPlan),
                    'isHandoutGenerated' => $isHandoutGenerated,
                    'generatedHandout' => $generatedHandout,
                    'dailyHandouts' => $this->buildDailyHandouts($course, $readingPlan),
                ];
            });

        return Inertia::render('ReadingPlan/Handouts', [
            'courses' => $courses,
        ]);
    }

    /**
     * Display the reading plan based on the Master Timetable's weekly schedule.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $timetable = $user->masterTimetable;

        if (!$timetable) {
            return redirect()->route('master-timetable.show')->with('error', 'Please generate your Master Timetable first to view your reading plan.');
        }

        $week = $request->query('week', $timetable->current_week);
        $week = min(max(1, $week), $timetable->semester_duration_weeks);

        // The AI generates the schedule starting from the user-specified current week,
        // so early week numbers (e.g., week_1, week_2) may not exist in weekly_schedule.
        // If the desired week key is missing, clamp to the nearest available week key.
        $storedSchedule = $timetable->weekly_schedule ?? [];
        if (!empty($storedSchedule) && !isset($storedSchedule['week_' . $week])) {
            // Extract stored week numbers and find the closest one
            $availableWeeks = array_filter(array_map(function ($key) {
                if (preg_match('/^week_(\d+)$/', $key, $m)) {
                    return (int) $m[1];
                }
                return null;
            }, array_keys($storedSchedule)));

            if (!empty($availableWeeks)) {
                // Find the week number closest to the requested week
                $closest = null;
                $minDiff = PHP_INT_MAX;
                foreach ($availableWeeks as $w) {
                    $diff = abs($w - $week);
                    if ($diff < $minDiff) {
                        $minDiff = $diff;
                        $closest = $w;
                    }
                }
                $week = $closest;
            }
        }

        // Fetch the specific week data
        $weeklySchedule = $storedSchedule['week_' . $week] ?? null;

        $courses = $user->courses()->where('semester_id', $user->current_semester_id)->get()->map(function ($course) {
            $course->reading_plan = $this->normalizeReadingPlan($course->reading_plan);
            return $course;
        });

        return Inertia::render('ReadingPlan/Index', [
            'weeklySchedule' => $weeklySchedule,
            'week' => (int)$week,
            'totalWeeks' => $timetable->semester_duration_weeks,
            'semesterStartDate' => $timetable->semester_start_date,
            'courses' => $courses,
        ]);
    }

    /**
     * Generate a detailed reading plan for a specific course.
     */
    public function generate(Request $request, \App\Models\Course $course, \App\Services\AiService $aiService)
    {
        $user = Auth::user();
        if ($course->user_id !== $user->id) {
            abort(403);
        }

        $timetable = $user->masterTimetable;
        if (!$timetable) {
            return back()->with('error', 'Please generate your Master Timetable first to determine allocated hours.');
        }

        // Calculate per-day schedule map for this course across all weeks
        $totalWeeks = $timetable->semester_duration_weeks;
        $dailyScheduleMap = [];
        for ($i = 1; $i <= $totalWeeks; $i++) {
            $weekSchedule = $aiService->generateWeeklyTimetableFromSemesterSchedule($timetable->weekly_schedule, $timetable->preferences, $i);
            
            foreach ($weekSchedule as $day => $slots) {
                foreach ($slots as $slot) {
                    if (($slot['course'] ?? '') === $course->title) {
                        $dailyScheduleMap["week_{$i}"][$day][] = $slot['time'];
                    }
                }
            }
            
            // If No slots found for this week, initialize empty but keep the week key
            if (!isset($dailyScheduleMap["week_{$i}"])) {
                $dailyScheduleMap["week_{$i}"] = [];
            }
        }

        $courseData = [
            'id' => $course->id,
            'title' => $course->title,
            'code' => $course->code,
            'topics' => $course->topics,
            'full_content' => $course->full_content,
        ];

        $detailedPlan = $aiService->generateDetailedReadingPlan($courseData, (int)$totalWeeks, $dailyScheduleMap);

        if (!$detailedPlan) {
            return back()->with('error', 'Failed to generate detailed reading plan. Please try again.');
        }

        $normalizedPlan = $this->normalizeReadingPlan($detailedPlan);
        if (empty($normalizedPlan)) {
            return back()->with('error', 'Reading plan generated but could not be normalized. Please regenerate.');
        }

        $course->update([
            'reading_plan' => $normalizedPlan
        ]);

        return back()->with('success', 'Detailed reading plan generated for ' . $course->title);
    }

    public function showDetailed(\App\Models\Course $course)
    {
        $user = Auth::user();
        if ($course->user_id !== $user->id) {
            abort(403);
        }

        $readingPlan = $this->normalizeReadingPlan($course->reading_plan);

        // Auto-heal legacy records once viewed.
        if (!empty($readingPlan) && $course->reading_plan !== $readingPlan) {
            $course->update(['reading_plan' => $readingPlan]);
        }

        return Inertia::render('ReadingPlan/ShowDetailed', [
            'course' => $course,
            'readingPlan' => $readingPlan,
        ]);
    }

    /**
     * Download the detailed reading plan as a PDF handout.
     */
    public function downloadHandout(\App\Models\Course $course)
    {
        $user = Auth::user();
        if ($course->user_id !== $user->id) {
            abort(403);
        }

        if (!$course->reading_plan) {
            return back()->with('error', 'Reading plan not generated yet.');
        }

        $readingPlan = $this->normalizeReadingPlan($course->reading_plan);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.study-handout', [
            'course' => $course,
            'readingPlan' => $readingPlan,
            'user' => $user
        ]);

        return $pdf->download("{$course->code}_Study_Handout.pdf");
    }

    /**
     * Normalize reading plan payloads into an associative week map:
     * ["week_1" => [...], "week_2" => [...]]
     */
    private function normalizeReadingPlan($plan): array
    {
        if (!is_array($plan) || empty($plan)) {
            return [];
        }

        if (isset($plan['weekly_plan']) && is_array($plan['weekly_plan'])) {
            $plan = $plan['weekly_plan'];
        }

        // Already in expected shape.
        $hasWeekKeys = count(array_filter(array_keys($plan), fn ($key) => is_string($key) && str_starts_with($key, 'week_'))) > 0;
        if ($hasWeekKeys) {
            return array_filter($plan, fn ($key) => is_string($key) && str_starts_with($key, 'week_'), ARRAY_FILTER_USE_KEY);
        }

        // Convert list format: [{"week":1, ...}, {"week":2, ...}]
        if (array_is_list($plan)) {
            $normalized = [];
            foreach ($plan as $entry) {
                if (!is_array($entry)) {
                    continue;
                }

                $weekNum = null;
                if (isset($entry['week']) && is_numeric($entry['week'])) {
                    $weekNum = (int) $entry['week'];
                } elseif (isset($entry['week_number']) && is_numeric($entry['week_number'])) {
                    $weekNum = (int) $entry['week_number'];
                }

                if ($weekNum !== null && $weekNum > 0) {
                    unset($entry['week']);
                    $normalized['week_' . $weekNum] = $entry;
                }
            }

            return $normalized;
        }

        return [];
    }

    /**
     * Convert normalized weekly data into a flat daily handout list.
     */
    private function buildDailyHandouts($course, $readingPlan, $timetable = null): array
    {
        // If we have AI-generated weeks, prioritize them
        if (isset($readingPlan['weeks']) && is_array($readingPlan['weeks'])) {
            return $readingPlan['weeks'];
        }

        // Fallback to existing logic if it's the old format
        if (!empty($readingPlan)) {
            $weeks = array_keys($readingPlan);
            usort($weeks, function ($a, $b) {
                return (int) str_replace('week_', '', $a) <=> (int) str_replace('week_', '', $b);
            });

            $scheduleEntries = $this->expandWeekdaySchedule($weeks);

            if (!empty($scheduleEntries)) {
                $chunks = $this->chunkContentForHandouts((string) ($course->full_content ?? ''), count($scheduleEntries));
                $handouts = [];
                $limit = min(count($chunks), count($scheduleEntries));

                for ($index = 0; $index < $limit; $index++) {
                    $entry = $scheduleEntries[$index];
                    $chunk = trim($chunks[$index] ?? '');

                    if ($chunk === '') {
                        continue;
                    }

                    $handouts[] = [
                        'week' => $entry['week'],
                        'day' => $entry['day'],
                        'segment' => $chunk,
                        'focus' => null,
                        'summary' => 'Auto-segmented from course content. Generate a detailed reading plan for better pacing.',
                        'tasks' => ['Read this segment carefully', 'Take concise notes', 'Summarize key points'],
                    ];
                }

                return $handouts;
            }
        }

        // Fallback: split course content into simple weekday segments.
        return $this->buildFallbackHandoutsFromContent((string) ($course->full_content ?? ''));
    }

    /**
     * Create basic daily segments when an AI-generated reading plan is unavailable.
     */
    private function buildFallbackHandoutsFromContent(string $content): array
    {
        $chunks = $this->chunkContentForHandouts($content, 5);
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $handouts = [];

        foreach ($days as $index => $day) {
            $segment = trim($chunks[$index] ?? '');
            if ($segment === '') {
                continue;
            }

            $handouts[] = [
                'week' => 1,
                'day' => $day,
                'segment' => $segment,
                'focus' => null,
                'summary' => 'Auto-segmented from course content. Generate a detailed reading plan for better pacing.',
                'tasks' => ['Read this segment carefully', 'Take concise notes', 'Summarize key points'],
            ];
        }

        return $handouts;
    }

    /**
     * Expand each week into weekday slots so handouts are consistent across courses.
     */
    private function expandWeekdaySchedule(array $weeks): array
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        $scheduleEntries = [];

        foreach ($weeks as $weekKey) {
            $weekNumber = (int) str_replace('week_', '', (string) $weekKey);
            if ($weekNumber < 1) {
                continue;
            }

            foreach ($days as $day) {
                $scheduleEntries[] = [
                    'week' => $weekNumber,
                    'day' => $day,
                ];
            }
        }

        return $scheduleEntries;
    }

    /**
     * Split course content into readable chunks for planned handouts.
     */
    private function chunkContentForHandouts(string $content, int $parts): array
    {
        $paragraphs = $this->extractParagraphBlocks($content);

        if (empty($paragraphs) || $parts < 1) {
            return [];
        }

        // If paragraph count is already smaller, keep one paragraph per segment.
        if (count($paragraphs) <= $parts) {
            return $paragraphs;
        }

        // Group complete paragraphs into up to $parts chunks without splitting paragraphs.
        $targetChars = (int) ceil(array_sum(array_map('strlen', $paragraphs)) / $parts);
        $chunks = [];
        $currentChunk = '';
        $remainingGroups = $parts;

        foreach ($paragraphs as $index => $paragraph) {
            $remainingParagraphs = count($paragraphs) - $index;

            // Ensure we leave enough paragraphs for remaining groups.
            if ($remainingParagraphs === $remainingGroups) {
                if ($currentChunk !== '') {
                    $chunks[] = trim($currentChunk);
                    $currentChunk = '';
                    $remainingGroups--;
                }

                $chunks[] = $paragraph;
                $remainingGroups--;
                continue;
            }

            if ($currentChunk === '') {
                $currentChunk = $paragraph;
                continue;
            }

            $candidate = $currentChunk."\n\n".$paragraph;

            if (strlen($currentChunk) >= $targetChars && $remainingGroups > 1) {
                $chunks[] = trim($currentChunk);
                $currentChunk = $paragraph;
                $remainingGroups--;
            } else {
                $currentChunk = $candidate;
            }
        }

        if ($currentChunk !== '') {
            $chunks[] = trim($currentChunk);
        }

        return array_values(array_filter($chunks));
    }

    /**
     * Parse source content into paragraph-like blocks.
     */
    private function extractParagraphBlocks(string $content): array
    {
        $text = strip_tags($content);
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace('/\t+/', ' ', $text) ?? '';

        $rawBlocks = preg_split('/\n{2,}/', $text) ?: [];
        $blocks = [];

        foreach ($rawBlocks as $block) {
            $clean = trim(preg_replace('/\s+/', ' ', $block) ?? '');
            if ($clean !== '') {
                $blocks[] = $clean;
            }
        }

        return $blocks;
    }

    /**
     * Get unique study days for a course from the Master Timetable.
     */
    private function getCourseStudyDays(array $weeklySchedule, string $courseTitle): array
    {
        $daysFound = [];
        $dayOrder = [
            'monday' => 1, 'tuesday' => 2, 'wednesday' => 3, 'thursday' => 4, 
            'friday' => 5, 'saturday' => 6, 'sunday' => 7
        ];

        foreach ($weeklySchedule as $weekData) {
            if (!is_array($weekData)) continue;
            
            foreach ($weekData as $day => $slots) {
                $lowerDay = strtolower($day);
                if (!is_array($slots) || !isset($dayOrder[$lowerDay])) continue;
                
                foreach ($slots as $slot) {
                    $slotCourse = $slot['course'] ?? $slot['title'] ?? $slot['course_title'] ?? '';
                    if (!empty($courseTitle) && stripos($slotCourse, $courseTitle) !== false) {
                        $daysFound[$lowerDay] = true;
                        break;
                    }
                }
            }
        }

        return array_keys($daysFound);
    }
}
