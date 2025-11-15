<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Test;
use App\Http\Requests\StoreCourseRequest;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CourseController extends Controller
{
    public function index()
    {
        return Inertia::render('MyCourses', [
            'courses' => Auth::user()->courses()->orderBy('created_at', 'desc')->get(),
            'flash' => [ 'message' => session('message'), 'error' => session('error') ]
        ]);
    }

    public function store(StoreCourseRequest $request)
    {
        $validated = $request->validated();
        $path = $request->file('syllabus')->store('syllabi', 'public');
        $fullPath = storage_path('app/public/' . $path);

        $course = Auth::user()->courses()->create([
            'title' => $validated['title'],
            'code' => $validated['code'],
            'file_path' => $path,
            'status' => 'Analyzing Syllabus...',
        ]);

        try {
            $aiService = new AiService(config('services.gemini.api_key'));
            $topics = $aiService->extractTopicsFromPdf($fullPath);

            if ($topics) {
                $course->update(['topics' => $topics, 'status' => 'Pre-Test Needed']);
            } else {
                $course->update(['status' => 'AI Analysis Failed']);
            }
        } catch (\Exception $e) {
            $course->update(['status' => 'AI Analysis Failed']);
            \Log::error('AI Service Exception in store(): ' . $e->getMessage());
        }
        return redirect(route('courses.index'))->with('message', 'Course added and analysis complete!');
    }

    public function showTest(Course $course)
    {
        Gate::authorize('view', $course);
        if (empty($course->topics)) {
            return redirect(route('courses.index'))->with('error', 'AI analysis failed or is not complete for this course.');
        }
        
        $aiService = new AiService(config('services.gemini.api_key'));
        $testData = $aiService->generateTestFromTopics($course->topics);

        if (!$testData || !isset($testData['questions'])) {
            return redirect(route('courses.index'))->with('error', 'The AI failed to generate a test. Please try again later.');
        }
        
        session(['current_test' => $testData['questions'], 'current_test_topics' => $course->topics]);
        
        $questionsForFrontend = array_map(fn($q) => ['question' => $q['question'], 'options' => $q['options']], $testData['questions']);

        return Inertia::render('Tests/PreTest', [
            'course' => $course,
            'questions' => $questionsForFrontend,
        ]);
    }

    public function storeTest(Request $request, Course $course)
    {
        Gate::authorize('update', $course);
        $correctTestData = session('current_test');
        $courseTopics = session('current_test_topics');
        if (!$correctTestData || !$courseTopics) {
            return redirect()->route('courses.index')->with('error', 'Your session expired. Please try again.');
        }

        $userAnswers = $request->input('answers');
        if (!is_array($userAnswers) || count($userAnswers) !== count($correctTestData)) {
            return back()->with('error', 'Invalid submission. Please answer all questions.');
        }

        $totalQuestions = count($correctTestData);
        $correctAnswersCount = 0;
        $weakTopics = [];

        foreach ($correctTestData as $index => $questionData) {
            $correctIndex = $questionData['correct_answer_index'];
            $userAnswerIndex = $userAnswers[$index] ?? null;

            if ($userAnswerIndex !== null && (int)$userAnswerIndex === (int)$correctIndex) {
                $correctAnswersCount++;
            } else {
                $topicIndex = floor($index / ($totalQuestions / count($courseTopics)));
                if (isset($courseTopics[$topicIndex])) {
                    $weakTopics[] = $courseTopics[$topicIndex];
                }
            }
        }

        $score = ($totalQuestions > 0) ? round(($correctAnswersCount / $totalQuestions) * 100) : 0;
        $uniqueWeakTopics = array_values(array_unique($weakTopics));

        $test = Test::create([
            'user_id' => Auth::id(), 'course_id' => $course->id, 'type' => 'Pre-Test',
            'score' => $score, 'weak_topics' => $uniqueWeakTopics,
        ]);

        $course->update(['status' => 'In Progress', 'progress' => $score]);
        $request->session()->forget(['current_test', 'current_test_topics']);

        return redirect()->route('tests.result.show', ['test' => $test->id]);
    }
}