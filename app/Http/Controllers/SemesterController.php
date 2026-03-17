<?php

namespace App\Http\Controllers;

use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SemesterController extends Controller
{
    /**
     * Create a new semester for the user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $semester = $user->semesters()->create([
            'name' => $request->name,
        ]);

        // Automatically switch the user to the newly created semester
        $user->update(['current_semester_id' => $semester->id]);

        return back()->with('message', 'Semester created successfully!');
    }

    /**
     * Switch the user's active semester.
     */
    public function switch(Request $request)
    {
        $request->validate([
            'semester_id' => 'required|exists:semesters,id',
        ]);

        $user = Auth::user();

        // Ensure the semester actually belongs to the user
        $semester = Semester::where('id', $request->semester_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $user->update(['current_semester_id' => $semester->id]);

        return back()->with('message', 'Switched to ' . $semester->name);
    }
}
