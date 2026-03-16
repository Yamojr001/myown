<?php

namespace App\Http\Controllers;

use App\Models\Test;
use App\Models\Course;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Display the results of a specific test.
     */
    public function showResult(Test $test)
    {
        Gate::authorize('view', $test);
        return Inertia::render('Tests/TestResult', [
            'testResult' => $test->load('course'),
        ]);
    }

    /**
     * Display test creation page for a specific course
     */
    public function create(Request $request, Course $course)
    {
        $user = Auth::user();
        
        // Verify the course belongs to the user
        if ($course->user_id !== $user->id) {
            abort(403, 'You do not have access to this course.');
        }

        $testType = $request->input('test_type', 'Pre-Test');
        $testName = $request->input('test_name', 'Pre-Test Test');
        
        // Check if test of this type already exists for this course
        $existingTest = Test::where('course_id', $course->id)
            ->where('type', $testType)
            ->first();

        if ($existingTest) {
            return redirect()->route('tests.result', $existingTest)
                ->with('error', 'You have already taken this test.');
        }

        // Extract topics from PDF
        $filePath = storage_path('app/public/' . $course->file_path);
        $topics = $this->aiService->extractTopicsFromPdf($filePath);
        
        if (!$topics || empty($topics)) {
            Log::error('Could not extract topics from PDF', [
                'course_id' => $course->id,
                'file_path' => $filePath
            ]);
            
            return back()->with('error', 'Could not extract topics from the syllabus. Please make sure the PDF contains readable text.');
        }

        // Generate test from topics
        $testData = $this->aiService->generateTestFromTopics($topics);
        
        if (!$testData) {
            Log::error('Failed to generate test data', [
                'course_id' => $course->id,
                'topics_count' => count($topics),
                'topics' => $topics
            ]);
            
            return back()->with('error', 'The AI failed to generate a test. Please try again later.');
        }

        // Shuffle options for each question to randomize
        foreach ($testData['questions'] as &$question) {
            // Store the correct answer before shuffling
            $correctAnswer = $question['options'][$question['correct_answer_index']];
            
            // Shuffle options
            shuffle($question['options']);
            
            // Find new index of correct answer
            $question['correct_answer_index'] = array_search($correctAnswer, $question['options']);
        }

        // Store the test questions in session for the test session
        session([
            'test_questions' => $testData['questions'],
            'test_course_id' => $course->id,
            'test_type' => $testType,
            'test_name' => $testName,
        ]);

        return Inertia::render('Tests/Create', [
            'course' => $course,
            'questions' => $testData['questions'],
            'totalQuestions' => count($testData['questions']),
            'testType' => $testType,
            'testName' => $testName,
        ]);
    }

    /**
     * Store test results
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'nullable|integer|min:0|max:3',
        ]);

        $user = Auth::user();
        
        // Retrieve test data from session
        $questions = session('test_questions');
        $courseId = session('test_course_id');
        $testType = session('test_type', 'Pre-Test');
        $testName = session('test_name', 'Test');
        
        if (!$questions || !$courseId) {
            return response()->json([
                'error' => 'Test session expired. Please start the test again.'
            ], 400);
        }

        $course = Course::find($courseId);
        
        if (!$course || $course->user_id !== $user->id) {
            return response()->json([
                'error' => 'Unauthorized access to course.'
            ], 403);
        }

        // Calculate score and identify weak topics
        $correctCount = 0;
        $weakTopics = [];
        
        foreach ($questions as $index => $question) {
            $userAnswer = $validated['answers'][$index] ?? null;
            
            if ($userAnswer === $question['correct_answer_index']) {
                $correctCount++;
            } else {
                // Extract topic from question to identify weak areas
                $questionText = $question['question'];
                
                // Try to extract main topic (first few words)
                $words = explode(' ', $questionText);
                $topic = implode(' ', array_slice($words, 0, 5));
                $weakTopics[] = $topic . '...';
            }
        }

        $score = round(($correctCount / count($questions)) * 100, 2);
        
        // Remove duplicate weak topics
        $weakTopics = array_unique($weakTopics);
        
        // Limit weak topics to avoid storing too much data
        $weakTopics = array_slice($weakTopics, 0, 10);

        // Save test result
        $test = Test::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'type' => $testType,
            'score' => $score,
            'weak_topics' => $weakTopics,
            'taken_date' => now(),
        ]);

        // Clear session
        session()->forget([
            'test_questions', 
            'test_course_id', 
            'test_type', 
            'test_name'
        ]);

        // If this was a scheduled test (not Pre-Test), update master timetable
        if ($testType !== 'Pre-Test') {
            $this->updateMasterTimetable($user, $testType);
        }

        return response()->json([
            'success' => true,
            'score' => $score,
            'weak_topics' => $weakTopics,
            'test_id' => $test->id,
            'redirect' => route('tests.result', $test)
        ]);
    }

    /**
     * Update master timetable after completing a scheduled test
     */
    private function updateMasterTimetable($user, $testType)
    {
        try {
            $timetable = $user->masterTimetable;
            
            if (!$timetable) {
                return;
            }

            // Check if all courses have taken this test type
            $courses = $user->courses()->get();
            $allTestsTaken = true;
            
            foreach ($courses as $course) {
                if (!$course->tests()->where('type', $testType)->exists()) {
                    $allTestsTaken = false;
                    break;
                }
            }
            
            // If all tests taken, update to next test
            if ($allTestsTaken && $timetable->test_schedule) {
                $testSchedule = $timetable->test_schedule;
                $nextTest = null;
                
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
                    
                    Log::info('Updated master timetable next test week', [
                        'user_id' => $user->id,
                        'test_type' => $testType,
                        'next_test_week' => $nextTest['week']
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to update master timetable after test', [
                'user_id' => $user->id,
                'test_type' => $testType,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Display test history for a course
     */
    public function getCourseTests(Course $course)
    {
        $user = Auth::user();
        
        // Verify the course belongs to the user
        if ($course->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $tests = Test::where('course_id', $course->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($test) {
                return [
                    'id' => $test->id,
                    'type' => $test->type,
                    'score' => $test->score,
                    'weak_topics' => $test->weak_topics,
                    'taken_date' => $test->taken_date->format('Y-m-d H:i'),
                    'created_at' => $test->created_at->format('Y-m-d H:i'),
                ];
            });

        return response()->json(['tests' => $tests]);
    }

    /**
     * Get test statistics for dashboard
     */
    public function getTestStatistics()
    {
        $user = Auth::user();
        
        $tests = Test::where('user_id', $user->id)
            ->with('course')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($test) {
                return [
                    'id' => $test->id,
                    'course_name' => $test->course->title,
                    'type' => $this->formatTestType($test->type),
                    'score' => $test->score,
                    'taken_date' => $test->taken_date->format('M d, Y'),
                ];
            });

        $averageScore = Test::where('user_id', $user->id)
            ->avg('score');

        $testCount = Test::where('user_id', $user->id)->count();

        return response()->json([
            'recent_tests' => $tests,
            'average_score' => round($averageScore, 2),
            'test_count' => $testCount,
        ]);
    }

    /**
     * Format test type for display
     */
    private function formatTestType($type)
    {
   
        $types = [
            'Pre-Test' => 'Pre-Test',
            'mid_semester' => 'Mid-Semester',
            'post_test' => 'Post-Test',
            'mock_exam' => 'Mock Exam',
        ];


        return $types[$type] ?? ucfirst($type);
    }

    /**
     * Delete a test
     */
    public function destroy(Test $test)
    {
        Gate::authorize('delete', $test);
        
        $test->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Test deleted successfully.'
        ]);
    }
}