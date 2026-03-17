<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HistoryController extends Controller
{
    /**
     * Display a listing of the user's semesters (History).
     */
    public function index(Request $request): Response
    {
        // Fetch all semesters for the user, including the count of courses they contain
        $semesters = $request->user()->semesters()->withCount('courses')->orderBy('created_at', 'desc')->get();

        return Inertia::render('History/Index', [
            'semesters' => $semesters,
        ]);
    }
}
