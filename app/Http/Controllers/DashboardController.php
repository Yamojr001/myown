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

        $semesterId = $user->current_semester_id;

        // 1. Get the user's most recent courses constrained to the active semester
        $recentCourses = $user->courses()
                              ->where('semester_id', $semesterId)
                              ->orderBy('created_at', 'desc')
                              ->take(5)
                              ->get();

        // 2. Get the user's latest test result for the active semester
        $latestTest = $user->tests()
                           ->whereHas('course', function($query) use ($semesterId) {
                               $query->where('semester_id', $semesterId);
                           })
                           ->with('course')
                           ->latest()
                           ->first();

        // 3. Calculate overall statistics constraint to active semester
        $totalCourses = $user->courses()->where('semester_id', $semesterId)->count();
        $averageScore = $user->tests()
                                   ->whereHas('course', function($query) use ($semesterId) {
                                       $query->where('semester_id', $semesterId);
                                   })
                                   ->avg('score');

        // 4. Get semester information from master timetable
        $timetable = $user->masterTimetable;
        $semesterInfo = null;
        if ($timetable) {
            $semesterInfo = [
                'current_week' => $timetable->current_week,
                'total_weeks' => $timetable->semester_duration_weeks,
                'start_date' => $timetable->semester_start_date?->format('Y-m-d'),
                'has_timetable' => true,
            ];
        }

        // 5. Fetch active system notifications
        $systemNotifications = \App\Models\SystemNotification::active()->latest()->get();

        // Pass all this data as props to our React component
        return Inertia::render('Dashboard', [
            'recentCourses' => $recentCourses,
            'latestTest' => $latestTest,
            'stats' => [
                'totalCourses' => $totalCourses,
                'averageScore' => round($averageScore), // Round to a whole number
            ],
            'semesterInfo' => $semesterInfo,
            'systemNotifications' => $systemNotifications,
        ]);
    }
}