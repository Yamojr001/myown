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
use Smalot\PdfParser\Parser;

class CourseController extends Controller
{
    /**
     * Display a listing of the user's courses.
     */
    public function index()
    {
        return Inertia::render('MyCourses', [
            'courses' => Auth::user()->courses()->orderBy('created_at', 'desc')->get(),
            'flash' => [ 'message' => session('message'), 'error' => session('error') ]
        ]);
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'required|string|max:50',
            'syllabus_text' => 'required|string',
        ]);
        
        $course = Auth::user()->courses()->create([
            'title' => $validated['title'],
            'code' => $validated['code'],
            'file_path' => null, // Files are not stored permanently for now, just text
            'status' => 'Analyzing Syllabus...',
        ]);

        try {
            $aiService = new AiService();
            $topics = $aiService->extractTopicsFromText($validated['syllabus_text']);

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

    /**
     * Extract text from various file formats.
     */
    public function extractText(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:15360', // 15MB
        ]);

        $file = $request->file('file');
        $mimeType = $file->getMimeType();
        $extension = strtolower($file->getClientOriginalExtension());
        $extractedText = '';
        $pageCount = 0;
        
        try {
            if ($extension === 'txt' || $mimeType === 'text/plain') {
                $extractedText = file_get_contents($file->getRealPath());
                $pageCount = max(1, ceil(str_word_count($extractedText) / 250)); // Estimate 250 words per page
            } elseif (in_array($extension, ['png', 'jpg', 'jpeg'])) {
                $aiService = new AiService();
                $extractedText = $aiService->extractTextFromImage($file->getRealPath(), $mimeType);
                $pageCount = 1;
            } elseif ($extension === 'pdf') {
                $parser = new Parser();
                $pdf = $parser->parseFile($file->getRealPath());
                $extractedText = $pdf->getText();
                $pageCount = max(1, count($pdf->getPages()));
                
                // If PDF is mostly images, text will be very short. Use Gemini Vision as fallback.
                if (strlen(trim($extractedText)) < 100) {
                    $aiService = new AiService();
                    $extractedText = $aiService->extractTextFromImage($file->getRealPath(), 'application/pdf');
                }
            } elseif (in_array($extension, ['ppt', 'pptx'])) {
                if ($extension === 'pptx') {
                    $zip = new \ZipArchive;
                    if ($zip->open($file->getRealPath()) === true) {
                        for ($i = 0; $i < $zip->numFiles; $i++) {
                            $entry = $zip->getNameIndex($i);
                            if (strpos($entry, 'ppt/slides/slide') !== false && strpos($entry, '.xml') !== false) {
                                $slideXml = $zip->getFromName($entry);
                                $extractedText .= strip_tags($slideXml) . " ";
                                $pageCount++;
                            }
                        }
                        $zip->close();
                        $pageCount = max(1, $pageCount);
                    }
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Legacy .ppt files are not supported. Please convert to .pptx or PDF.'
                    ], 422);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => "Unsupported file type: {$extension}. Supported: pdf, png, jpg, txt, pptx."
                ], 422);
            }
            
            return response()->json([
                'success' => true,
                'text' => trim($extractedText),
                'pageCount' => $pageCount
            ]);
        } catch (\Exception $e) {
            \Log::error("Extraction failed: " . $e->getMessage());
             return response()->json([
                'success' => false,
                'message' => 'Failed to extract text: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified course details.
     */
    public function show(Course $course)
    {
        // Security: Ensure the logged-in user owns this course.
        Gate::authorize('view', $course);

        // Eager load the test history for this specific course, ordered by newest first.
        $course->load(['tests' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }]);

        return Inertia::render('Courses/Show', [
            'course' => $course,
        ]);
    }

    /**
     * Show the pre-test for a specific course.
     */
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

    /**
     * Store and grade the results of the submitted test.
     */
    public function storeTest(Request $request, Course $course)
    {
        Gate::authorize('update', $course);
        $correctTestData = session('current_test');
        $courseTopics = session('current_test_topics');
        if (!$correctTestData || !$courseTopics) {
            return redirect()->route('courses.index')->with('error', 'Your session expired. Please try the test again.');
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
                // Ensure topic mapping does not go out of bounds if topics array is small
                if (count($courseTopics) > 0) {
                    $topicIndex = floor($index / ($totalQuestions / count($courseTopics)));
                    if (isset($courseTopics[$topicIndex])) {
                        $weakTopics[] = $courseTopics[$topicIndex];
                    }
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