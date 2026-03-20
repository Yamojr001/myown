<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogUserActivity
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'token',
        'api_key',
        'secret',
        'authorization',
        'cookie',
        'access_token',
        'refresh_token',
        'email',
        'phone_number',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();
            
            // Get or Create Active Session
            $session = \App\Models\LoginActivity::where('user_id', $user->id)
                ->whereNull('logout_at')
                ->latest()
                ->first();

            if ($session) {
                $session->update(['last_active_at' => now()]);
            } else {
                // Initialize session if none exists (handles existing authenticated users)
                $userAgent = $request->userAgent();
                $deviceInfo = \App\Helpers\DeviceHelper::parse($userAgent);
                
                \App\Models\LoginActivity::create([
                    'user_id' => $user->id,
                    'ip_address' => $request->ip(),
                    'user_agent' => $userAgent,
                    'device_type' => $deviceInfo['device_type'],
                    'browser' => $deviceInfo['browser'],
                    'platform' => $deviceInfo['platform'],
                    'login_at' => now(),
                    'last_active_at' => now(),
                ]);
            }

            // Log significant activities (excluding GET/HEAD)
            if (!in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
                $type = 'System';
                $path = $request->path();
                
                // Enhanced Type Mapping
                if (preg_match('/assessment|test|course|past-question|reading-plan|semester|timetable/i', $path)) {
                    $type = 'Academic Content';
                } elseif (preg_match('/ai|tutor|chat|generate|explain|solve/i', $path)) {
                    $type = 'AI Query';
                } elseif (preg_match('/profile|password|settings|newsletter/i', $path)) {
                    $type = 'Account Update';
                } elseif (preg_match('/login|logout|register/i', $path)) {
                    $type = 'Auth';
                }
                
                \App\Models\ActivityLog::create([
                    'user_id' => $user->id,
                    'type' => $type,
                    'description' => "User performed {$request->method()} action on /{$path}.",
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'metadata' => [
                        'url' => $request->fullUrl(),
                        'method' => $request->method(),
                        'payload' => $this->maskSensitive($request->except(['_token'])),
                    ],
                ]);
            }
        }

        return $next($request);
    }

    private function maskSensitive(array $payload): array
    {
        foreach ($payload as $key => $value) {
            if (in_array(strtolower((string) $key), self::SENSITIVE_KEYS, true)) {
                $payload[$key] = '***';
                continue;
            }

            if (is_array($value)) {
                $payload[$key] = $this->maskSensitive($value);
            }
        }

        return $payload;
    }
}
