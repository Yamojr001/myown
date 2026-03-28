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

            // Build prompt for AI handout generation
            $topicsText = !empty($courseData['topics']) ? implode(', ', $courseData['topics']) : 'General course topics';
            $readingPlanText = !empty($readingPlan) ? json_encode($readingPlan) : 'No structured plan available';
            
            $prompt = "You are an expert educational content creator. Using the provided course information, generate a comprehensive, well-structured reading handout organized by weekly days (Monday-Friday) for {$course->title} ({$course->code}).

COURSE INFORMATION:
- Title: {$course->title}
- Code: {$course->code}
- Topics: {$topicsText}
- Semester Duration: {$timetable->semester_duration_weeks} weeks

READING PLAN (if available):
{$readingPlanText}

COURSE CONTENT (use this as the primary source):
" . substr($courseData['full_content'] ?? '', 0, 150000) . "

REQUIREMENTS:
1. Create a structured handout with entries for each week (Week 1 through Week {$timetable->semester_duration_weeks})
2. For each week, provide readings for Monday through Friday
3. Each daily segment should include:
   - A focus area or key topic
   - 3-5 bullet points covering main concepts
   - 2-3 recommended tasks (Read, Take notes, Summarize, etc.)
4. Ensure content is evenly distributed across all weeks
5. Base all content primarily on the provided course material

Return your response as a single valid JSON object with this structure:
{
  \"weeks\": [
    {
      \"week_number\": 1,
      \"days\": {
        \"monday\": {\"focus\": \"...\", \"points\": [...], \"tasks\": [...]},
        \"tuesday\": {\"focus\": \"...\", \"points\": [...], \"tasks\": [...]},
        \"wednesday\": {\"focus\": \"...\", \"points\": [...], \"tasks\": [...]},
        \"thursday\": {\"focus\": \"...\", \"points\": [...], \"tasks\": [...]},
        \"friday\": {\"focus\": \"...\", \"points\": [...], \"tasks\": [...]}
      }
    }
  ]
}

Return ONLY the JSON object, no additional text.";

            $responseContent = $aiService->callGemini($prompt, 180, null);

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
    private function buildDailyHandouts($course, array $readingPlan): array
    {
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
}
