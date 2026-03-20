<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function create()
    {
        return Inertia::render('Reviews/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|min:10',
            'type' => 'required|string|in:review,suggestion',
        ]);

        Review::create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
            'type' => $validated['type'],
        ]);

        return back()->with('success', 'Thank you for your feedback! We have received your ' . $validated['type'] . '.');
    }
}
