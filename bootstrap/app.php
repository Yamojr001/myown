<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withSchedule(function (\Illuminate\Console\Scheduling\Schedule $schedule) {
        $schedule->command('app:send-study-notifications')
            ->dailyAt('07:00')
            ->withoutOverlapping()
            ->onSuccess(function () {
                \Log::info('Scheduled command succeeded', ['command' => 'app:send-study-notifications']);
            })
            ->onFailure(function () {
                \Log::error('Scheduled command failed', ['command' => 'app:send-study-notifications']);
            });
    })
    ->withMiddleware(function (Middleware $middleware) { // <-- Removed the ': void' for compatibility if needed, but it's fine either way
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\CheckUserStatus::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\LogUserActivity::class,
        ]);

        // =======================================================
        // ADD THIS ALIAS REGISTRATION BLOCK
        // This is the correct way to register a route middleware alias in Laravel 11.
        // =======================================================
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);
        // =======================================================
        
    })
    ->withExceptions(function (Exceptions $exceptions) { // <-- Removed the ': void'
        //
    })->create();