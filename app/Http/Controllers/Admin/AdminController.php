<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Fetch System Statistics
        $stats = [
            'total_users' => \App\Models\User::count(),
            'total_courses' => \App\Models\Course::count(),
            'total_tests' => \App\Models\Test::count(),
            'total_past_questions' => \App\Models\PastQuestion::count(),
        ];

        // Fetch Recent Activity
        $recent_users = \App\Models\User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);
        
        $recent_uploads = \App\Models\PastQuestion::with('user:id,name')
            ->latest()
            ->take(5)
            ->get(['id', 'user_id', 'school', 'course_code', 'created_at']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentUsers' => $recent_users,
            'recentUploads' => $recent_uploads,
        ]);
    }

    public function users()
    {
        return Inertia::render('Admin/Users/Index', [
            'users' => \App\Models\User::latest()->paginate(10),
        ]);
    }

    public function toggleAdmin(\App\Models\User $user)
    {
        // Prevent self-demotion
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot demote yourself.');
        }

        $user->update(['is_admin' => !$user->is_admin]);

        return back()->with('success', 'User role updated successfully.');
    }

    public function toggleStatus(\App\Models\User $user)
    {
        // Prevent self-deactivation
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot deactivate yourself.');
        }

        $user->update(['is_active' => !$user->is_active]);

        return back()->with('success', 'User status updated successfully.');
    }

    public function courses()
    {
        return Inertia::render('Admin/Courses/Index', [
            'courses' => \App\Models\Course::with('user:id,name')->latest()->paginate(10),
        ]);
    }

    public function pastQuestions()
    {
        return Inertia::render('Admin/PastQuestions/Index', [
            'pastQuestions' => \App\Models\PastQuestion::with('user:id,name')->latest()->paginate(10),
        ]);
    }

    public function logs(Request $request)
    {
        $tab = $request->get('tab', 'all');
        
        $query = \App\Models\ActivityLog::with('user:id,name')->latest();

        if ($tab === 'signups') {
            $query->where('type', 'Signup');
        } elseif ($tab === 'academic') {
            $query->where('type', 'Academic Content');
        } elseif ($tab === 'ai') {
            $query->where('type', 'AI Query');
        }

        $logs = $query->paginate(20)->withQueryString();

        $sessions = [];
        if ($tab === 'sessions') {
            $sessions = \App\Models\LoginActivity::with('user:id,name')
                ->latest()
                ->paginate(20)
                ->withQueryString();
        }

        return Inertia::render('Admin/Logs/Index', [
            'logs' => $logs,
            'sessions' => $sessions,
            'currentTab' => $tab,
        ]);
    }

    public function settings()
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'app_name' => config('app.name'),
                'ai_model' => 'Gemini 2.5 Flash',
                'environment' => config('app.env'),
            ]
        ]);
    }

    public function newsletter()
    {
        return Inertia::render('Admin/Newsletter/Index', [
            'stats' => [
                'total_subscribers' => \App\Models\User::where('subscribed_to_newsletter', true)->count(),
            ]
        ]);
    }

    public function sendNewsletter(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $subscribers = \App\Models\User::where('subscribed_to_newsletter', true)->get();

        foreach ($subscribers as $subscriber) {
            \Illuminate\Support\Facades\Mail::to($subscriber->email)
                ->queue(new \App\Mail\NewsletterMail($request->subject, $request->content, $subscriber));
        }

        return back()->with('success', "Newsletter broadcast initiated to {$subscribers->count()} scholars.");
    }
}