<?php

namespace App\Http\Controllers;

use App\Models\PastQuestion;
use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PastQuestionController extends Controller
{
    protected $aiService;

    public function __construct(AiService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Display a listing of past questions with search filters.
     */
    public function index(Request $request)
    {
        $universities = PastQuestion::distinct()->pluck('school');
        
        $query = PastQuestion::query();

        if ($request->filled('university')) {
            $query->where('school', $request->university);
        }

        if ($request->filled('course_code')) {
            $query->where('course_code', 'like', '%' . $request->course_code . '%');
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $pastQuestions = $query->latest()->get();

        return Inertia::render('PastQuestions/Index', [
            'pastQuestions' => $pastQuestions,
            'universities' => $universities,
            'filters' => $request->only(['university', 'course_code', 'year']),
        ]);
    }

    /**
     * Show the form for uploading a new past question.
     */
    public function create()
    {
        return Inertia::render('PastQuestions/Upload');
    }

    /**
     * Store a newly created past question in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school' => 'required|string|max:255',
            'exam_name' => 'required|string|max:255',
            'course_code' => 'required|string|max:50',
            'course_title' => 'required|string|max:255',
            'year' => 'required|string|max:4',
            'file' => 'nullable|file|mimes:pdf,png,jpg,jpeg,txt|max:10240',
            'content' => 'nullable|string',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('past_questions', 'public');
        }

        $content = $validated['content'];
        
        // If file provided but no content, try to extract it
        if ($filePath && empty($content)) {
            // Note: Extraction logic would go here, maybe handled by frontend before submission
            // or by a job. For simplicity, we assume text is already extracted or provided.
        }

        PastQuestion::create([
            'user_id' => Auth::id(),
            'school' => $validated['school'],
            'exam_name' => $validated['exam_name'],
            'course_code' => $validated['course_code'],
            'course_title' => $validated['course_title'],
            'year' => $validated['year'],
            'file_path' => $filePath,
            'content' => $content,
        ]);

        return redirect()->route('past-questions.index')->with('success', 'Past question uploaded successfully!');
    }

    /**
     * Show the solving interface for a specific past question.
     */
    public function solve(PastQuestion $pastQuestion)
    {
        return Inertia::render('PastQuestions/Solve', [
            'pastQuestion' => $pastQuestion,
        ]);
    }

    /**
     * AI Solver: Returns answers for the past question.
     */
    public function aiSolve(PastQuestion $pastQuestion)
    {
        if (empty($pastQuestion->content)) {
            return response()->json(['error' => 'No content available for AI processing.'], 400);
        }

        $answers = $this->aiService->solvePastQuestion($pastQuestion->content);

        return response()->json(['answers' => $answers]);
    }

    /**
     * Grade the user's answers.
     */
    public function grade(Request $request, PastQuestion $pastQuestion)
    {
        $validated = $request->validate([
            'user_answers' => 'required|array',
        ]);

        if (empty($pastQuestion->content)) {
            return response()->json(['error' => 'No content available for AI grading.'], 400);
        }

        $result = $this->aiService->gradePastQuestionSubmission($pastQuestion->content, $validated['user_answers']);

        return Inertia::render('PastQuestions/Result', [
            'pastQuestion' => $pastQuestion,
            'result' => $result,
        ]);
    }

    /**
     * Download the past question file.
     */
    public function download(PastQuestion $pastQuestion)
    {
        if (!$pastQuestion->file_path || !Storage::disk('public')->exists($pastQuestion->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('public')->download($pastQuestion->file_path);
    }
}
