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

        // Fetch the specific week data
        $weeklySchedule = $timetable->weekly_schedule['week_' . $week] ?? null;

        return Inertia::render('ReadingPlan/Index', [
            'weeklySchedule' => $weeklySchedule,
            'week' => $week,
            'totalWeeks' => $timetable->semester_duration_weeks,
            'semesterStartDate' => $timetable->semester_start_date,
        ]);
    }
}
