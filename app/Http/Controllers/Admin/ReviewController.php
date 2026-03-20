<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with('user')->latest()->get();
        
        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews
        ]);
    }

    public function markAsRead(Review $review)
    {
        $review->update(['is_read' => true]);
        return back()->with('success', 'Feedback marked as read.');
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return back()->with('success', 'Feedback deleted.');
    }
}
