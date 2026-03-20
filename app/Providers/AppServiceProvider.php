<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        RateLimiter::for('ai-heavy', function (Request $request) {
            $id = $request->user()?->id ?: $request->ip();

            return [
                Limit::perMinute(20)->by('ai-heavy:' . $id),
                Limit::perHour(200)->by('ai-heavy-hour:' . $id),
            ];
        });

        // Listen for Login Events
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Login::class,
            function ($event) {
                $user = $event->user;
                $userAgent = request()->userAgent();
                $deviceInfo = \App\Helpers\DeviceHelper::parse($userAgent);

                \App\Models\LoginActivity::create([
                    'user_id' => $user->id,
                    'ip_address' => request()->ip(),
                    'user_agent' => $userAgent,
                    'device_type' => $deviceInfo['device_type'],
                    'browser' => $deviceInfo['browser'],
                    'platform' => $deviceInfo['platform'],
                    'login_at' => now(),
                    'last_active_at' => now(),
                ]);

                // Also log a general activity
                \App\Models\ActivityLog::create([
                    'user_id' => $user->id,
                    'type' => 'Login',
                    'description' => 'User logged into the platform.',
                    'ip_address' => request()->ip(),
                    'user_agent' => $userAgent,
                ]);
            }
        );

        // Listen for Logout Events
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Logout::class,
            function ($event) {
                if ($event->user) {
                    $loginActivity = \App\Models\LoginActivity::where('user_id', $event->user->id)
                        ->whereNull('logout_at')
                        ->latest()
                        ->first();

                    if ($loginActivity) {
                        $logoutAt = now();
                        $duration = $logoutAt->diffInSeconds($loginActivity->login_at);
                        
                        $loginActivity->update([
                            'logout_at' => $logoutAt,
                            'duration_seconds' => $duration,
                        ]);
                    }
                }
            }
        );

        // Listen for Registration Events
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Auth\Events\Registered::class,
            function ($event) {
                $user = $event->user;
                \App\Models\ActivityLog::create([
                    'user_id' => $user->id,
                    'type' => 'Signup',
                    'description' => "New scholar {$user->name} joined the platform.",
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            }
        );
    }
}
