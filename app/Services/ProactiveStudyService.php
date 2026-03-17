<?php

namespace App\Services;

use App\Models\User;
use App\Models\Course;
use App\Models\MasterTimetable;
use App\Services\AiService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Smalot\PdfParser\Parser;

class ProactiveStudyService
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Get the current daily assignment for a user
     */
    public function getDailyAssignment(User $user)
    {
        $timetable = $user->masterTimetable;
        if (!$timetable) return null;

        $currentWeek = $timetable->current_week;
        $weeklyData = $timetable->weekly_schedule["week_{$currentWeek}"] ?? null;

        if (!$weeklyData || !isset($weeklyData['courses'])) return null;

        $today = Carbon::now()->format('l'); // e.g. "Monday"
        $studyDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        // If today is a weekend, maybe review? User asked to divide for the week to days.
        // Let's assume a 5-day study week for the main reading distribution.
        if (!in_array($today, $studyDays)) {
             // Optional: Return a review summary for the week on weekends
             return null; 
        }

        $dayIndex = array_search($today, $studyDays);
        $totalCourses = count($weeklyData['courses']);
        
        // Simple rotation or partition. 
        // If 5 courses and 5 days, 1 course per day.
        // If 2 courses and 5 days, spread them.
        // For simplicity: We'll divide each course's weekly goal into 5 parts, 
        // and today the user reads 1/5th of ALL courses assigned for the week.
        
        $assignments = [];

        foreach ($weeklyData['courses'] as $courseInfo) {
            $course = Course::where('user_id', $user->id)
                            ->where('title', $courseInfo['course'])
                            ->first();

            if (!$course) continue;

            $pageRange = $courseInfo['pages_to_read']; // e.g. "10-25"
            $dailyRange = $this->calculateDailyPageRange($pageRange, $dayIndex, 5);

            if ($dailyRange) {
                $assignments[] = [
                    'course' => $course,
                    'title' => $course->title,
                    'topics' => $courseInfo['topics'],
                    'page_range' => $dailyRange,
                    'is_test_week' => $weeklyData['is_test_week'] ?? false,
                    'test_prep' => $weeklyData['test_prep'] ?? 'None',
                ];
            }
        }

        return $assignments;
    }

    /**
     * Divide a range like "10-25" into N parts and return the i-th part
     */
    private function calculateDailyPageRange(string $range, int $dayIndex, int $totalDays)
    {
        if (preg_match('/(\d+)\s*-\s*(\d+)/', $range, $matches)) {
            $start = (int)$matches[1];
            $end = (int)$matches[2];
            $total = ($end - $start) + 1;
            
            $perDay = ceil($total / $totalDays);
            $dayStart = $start + ($dayIndex * $perDay);
            $dayEnd = min($dayStart + $perDay - 1, $end);

            if ($dayStart > $end) return null;

            return "{$dayStart}-{$dayEnd}";
        }
        
        // If it's just a single number (though prompt mandates range)
        if (is_numeric($range)) {
            return $dayIndex === 0 ? $range : null;
        }

        return null;
    }

    /**
     * Extract text from specific pages of a PDF
     */
    public function extractContentForAssignment(Course $course, string $range)
    {
        if (!$course->file_path || !file_exists(storage_path('app/public/' . $course->file_path))) {
            return null;
        }

        try {
            if (preg_match('/(\d+)\s*-\s*(\d+)/', $range, $matches)) {
                $startPage = (int)$matches[1];
                $endPage = (int)$matches[2];

                $parser = new Parser();
                $pdf = $parser->parseFile(storage_path('app/public/' . $course->file_path));
                $pages = $pdf->getPages();
                
                $extractedText = "";
                // PDF metadata is usually 1-indexed for users, but we check bounds
                for ($i = $startPage - 1; $i < $endPage; $i++) {
                    if (isset($pages[$i])) {
                        $extractedText .= $pages[$i]->getText() . "\n\n";
                    }
                }

                return trim($extractedText);
            }
        } catch (\Exception $e) {
            Log::error("Failed to extract PDF content for course {$course->id}: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Check if it's test time for the user
     */
    public function getActiveTestAlert(User $user)
    {
        $timetable = $user->masterTimetable;
        if (!$timetable || !$timetable->test_schedule) return null;

        $currentWeek = $timetable->current_week;
        
        foreach ($timetable->test_schedule as $test) {
            if ($test['week'] == $currentWeek) {
                return $test;
            }
        }

        return null;
    }
}
