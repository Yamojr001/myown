<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // 1. Get the user's most recent courses
        $recentCourses = $user->courses()
                              ->orderBy('created_at', 'desc')
                              ->take(5) // Limit to the 5 most recent courses for a clean look
                              ->get();

        // 2. Get the user's latest test result for an AI insight
        $latestTest = $user->tests()
                           ->with('course') // Load the course information along with the test
                           ->latest()
                           ->first();

        // 3. Calculate overall statistics
        $totalCourses = $user->courses()->count();
        $averageScore = $user->tests()->avg('score');

        // Pass all this data as props to our React component
        return Inertia::render('Dashboard', [
            'recentCourses' => $recentCourses,
            'latestTest' => $latestTest,
            'stats' => [
                'totalCourses' => $totalCourses,
                'averageScore' => round($averageScore), // Round to a whole number
            ],
        ]);
    }
}