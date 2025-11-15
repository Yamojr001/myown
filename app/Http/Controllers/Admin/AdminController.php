<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia; // <-- Import Inertia

class AdminController extends Controller
{
    public function dashboard()
    {
        // This tells Laravel to render the React component located at:
        // /resources/js/Pages/Admin/Dashboard.jsx
        return Inertia::render('Admin/Dashboard');
    }
}