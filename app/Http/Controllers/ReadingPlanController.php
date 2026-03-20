<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class ReadingPlanController extends Controller
{
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

        $courses = $user->courses()->where('semester_id', $user->current_semester_id)->get();

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

        $course->update([
            'reading_plan' => $detailedPlan
        ]);

        return back()->with('success', 'Detailed reading plan generated for ' . $course->title);
    }

    public function showDetailed(\App\Models\Course $course)
    {
        $user = Auth::user();
        if ($course->user_id !== $user->id) {
            abort(403);
        }

        $readingPlan = $course->reading_plan;
        
        // Handle legacy structure where weeks are wrapped in 'weekly_plan'
        if (isset($readingPlan['weekly_plan'])) {
            $readingPlan = $readingPlan['weekly_plan'] ?? [];
        }

        // Filter for week_ keys and ensure it's an array
        if (is_array($readingPlan)) {
            $readingPlan = array_filter($readingPlan, function($key) {
                return str_starts_with($key, 'week_');
            }, ARRAY_FILTER_USE_KEY);
        } else {
            $readingPlan = [];
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

        $readingPlan = $course->reading_plan;
        
        // Handle legacy structure
        if (isset($readingPlan['weekly_plan'])) {
            $readingPlan = $readingPlan['weekly_plan'] ?? [];
        }

        // Filter for week_ keys
        if (is_array($readingPlan)) {
            $readingPlan = array_filter($readingPlan, function($key) {
                return str_starts_with($key, 'week_');
            }, ARRAY_FILTER_USE_KEY);
        } else {
            $readingPlan = [];
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.study-handout', [
            'course' => $course,
            'readingPlan' => $readingPlan,
            'user' => $user
        ]);

        return $pdf->download("{$course->code}_Study_Handout.pdf");
    }
}
