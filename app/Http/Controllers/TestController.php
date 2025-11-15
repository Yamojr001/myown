<?php

namespace App\Http\Controllers;

use App\Models\Test;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class TestController extends Controller
{
    /**
     * Display the results of a specific test.
     *
     * @param  \App\Models\Test  $test
     * @return \Inertia\Response
     */
    public function showResult(Test $test)
    {
        Gate::authorize('view', $test);
        return Inertia::render('Tests/TestResult', [
            'testResult' => $test->load('course'),
        ]);
    }
}