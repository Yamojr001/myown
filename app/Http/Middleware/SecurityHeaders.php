<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        $response->headers->set('X-XSS-Protection', '0');

        $scriptSrc = ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:'];
        $styleSrc = ["'self'", "'unsafe-inline'", 'https:'];
        $connectSrc = ["'self'", 'https:', 'ws:', 'wss:'];

        // Allow Vite HMR assets only in local development.
        if (app()->environment('local')) {
            $viteHosts = ['http://127.0.0.1:5173', 'http://localhost:5173'];
            $viteWsHosts = ['ws://127.0.0.1:5173', 'ws://localhost:5173'];

            $scriptSrc = array_merge($scriptSrc, $viteHosts);
            $styleSrc = array_merge($styleSrc, $viteHosts);
            $connectSrc = array_merge($connectSrc, $viteHosts, $viteWsHosts);
        }

        $csp = "default-src 'self'; "
            . 'script-src ' . implode(' ', array_unique($scriptSrc)) . '; '
            . 'script-src-elem ' . implode(' ', array_unique($scriptSrc)) . '; '
            . 'style-src ' . implode(' ', array_unique($styleSrc)) . '; '
            . "img-src 'self' data: https:; "
            . "font-src 'self' data: https:; "
            . 'connect-src ' . implode(' ', array_unique($connectSrc)) . '; '
            . "frame-ancestors 'self'; "
            . "base-uri 'self'; form-action 'self';";
        $response->headers->set('Content-Security-Policy', $csp);

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
