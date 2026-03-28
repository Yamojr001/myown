<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\StudyProgress;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class StudyRoomController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $timetable = $user->masterTimetable;
        
        $suggestedCourse = null;
        if ($timetable) {
            $dayName = now()->format('l'); // Monday, Tuesday, etc.
            $currentWeek = $timetable->current_week;
            $schedule = $timetable->weekly_schedule['week_' . $currentWeek][$dayName] ?? [];
            
            if (!empty($schedule)) {
                // Find first course in schedule
                $firstSlot = $schedule[0];
                $courseTitle = $firstSlot['course'] ?? null;
                if ($courseTitle) {
                    $suggestedCourse = $user->courses()->where('title', 'like', "%{$courseTitle}%")->first();
                }
            }
        }

        $courses = $user->courses()->whereNotNull('generated_handout')->get()
            ->map(function($course) {
                return [
                    'id' => $course->id,
                    'title' => $course->title,
                    'code' => $course->code,
                ];
            });

        return Inertia::render('StudyRoom/Index', [
            'suggestedCourse' => $suggestedCourse,
            'courses' => $courses,
            'currentDay' => now()->format('l'),
            'currentWeek' => $timetable ? $timetable->current_week : 1,
        ]);
    }

    public function show(Course $course)
    {
        $user = Auth::user();
        if ($course->user_id !== $user->id) abort(403);

        $timetable = $user->masterTimetable;
        $weekNumber = $timetable ? $timetable->current_week : 1;
        $dayName = strtolower(now()->format('l'));

        $handout = json_decode($course->generated_handout, true);
        
        // Find handout for today
        $todayHandout = null;
        if (isset($handout['weeks'])) {
            foreach ($handout['weeks'] as $week) {
                if ($week['week_number'] == $weekNumber) {
                    $todayHandout = $week['days'][$dayName] ?? null;
                    break;
                }
            }
        }

        $progress = StudyProgress::firstOrCreate([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'week_number' => $weekNumber,
            'day_name' => $dayName,
        ]);

        return Inertia::render('StudyRoom/Show', [
            'course' => $course,
            'todayHandout' => $todayHandout,
            'progress' => $progress,
            'weekNumber' => $weekNumber,
            'dayName' => ucfirst($dayName),
        ]);
    }

    public function explain(Request $request, AiService $aiService)
    {
        $request->validate(['text' => 'required|string']);
        $explanation = $aiService->explainText($request->text);
        return response()->json(['explanation' => $explanation]);
    }

    public function generateTest(Course $course, AiService $aiService)
    {
        $user = Auth::user();
        $timetable = $user->masterTimetable;
        $weekNumber = $timetable ? $timetable->current_week : 1;
        $dayName = strtolower(now()->format('l'));

        $progress = StudyProgress::where([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'week_number' => $weekNumber,
            'day_name' => $dayName,
        ])->first();

        if ($progress && $progress->test_questions) {
            return response()->json(['questions' => $progress->test_questions]);
        }

        $handout = json_decode($course->generated_handout, true);
        $todayHandout = null;
        if (isset($handout['weeks'])) {
            foreach ($handout['weeks'] as $week) {
                if ($week['week_number'] == $weekNumber) {
                    $todayHandout = $week['days'][$dayName] ?? null;
                    break;
                }
            }
        }

        // Use focus and points from handout to generate test
        $content = "Course: {$course->title}\n";
        if ($todayHandout) {
            $content .= "Focus: {$todayHandout['focus']}\n";
            $content .= "Points: " . implode("\n", $todayHandout['points']);
        } else {
            $content .= substr($course->full_content, 0, 5000);
        }

        $testData = $aiService->generateMiniTest($content);
        
        $questions = $testData['questions'] ?? [];
        if ($progress) {
            $progress->update(['test_questions' => $questions]);
        }

        return response()->json(['questions' => $questions]);
    }

    public function submitTest(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'answers' => 'required|array',
            'week_number' => 'required|integer',
            'day_name' => 'required|string',
        ]);

        $progress = StudyProgress::where([
            'user_id' => Auth::id(),
            'course_id' => $request->course_id,
            'week_number' => $request->week_number,
            'day_name' => strtolower($request->day_name),
        ])->firstOrFail();

        // Simple grading for objective questions
        $score = 0;
        $questions = $progress->test_questions ?? [];
        $total = count($questions);
        
        if ($total === 0) return response()->json(['score' => 0, 'passed' => false]);

        foreach ($questions as $index => $q) {
            if ($q['type'] === 'objective') {
                if (($request->answers[$index] ?? null) == $q['correct_answer_index']) {
                    $score++;
                }
            } else {
                // For essay and fill-in, we just give credit for providing an answer for now
                if (!empty($request->answers[$index])) {
                    $score++;
                }
            }
        }

        $percentage = ($score / $total) * 100;
        $passed = $percentage >= 70;

        $progress->update([
            'test_score' => $percentage,
            'test_passed' => $passed,
        ]);

        return response()->json([
            'score' => $percentage,
            'passed' => $passed,
        ]);
    }

    public function toggleTask(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'task' => 'required|string',
            'week_number' => 'required|integer',
            'day_name' => 'required|string',
        ]);

        $progress = StudyProgress::firstOrCreate([
            'user_id' => Auth::id(),
            'course_id' => $request->course_id,
            'week_number' => $request->week_number,
            'day_name' => strtolower($request->day_name),
        ]);

        $completedTasks = $progress->completed_tasks ?? [];
        if (in_array($request->task, $completedTasks)) {
            $completedTasks = array_values(array_diff($completedTasks, [$request->task]));
        } else {
            $completedTasks[] = $request->task;
        }

        $progress->update(['completed_tasks' => $completedTasks]);

        return response()->json(['completed_tasks' => $completedTasks]);
    }
}
