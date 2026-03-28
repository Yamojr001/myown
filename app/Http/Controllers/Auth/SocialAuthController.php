<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirect(string $provider): RedirectResponse
    {
        $this->assertSupportedProvider($provider);

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the provider callback and authenticate the user.
     */
    public function callback(string $provider): RedirectResponse
    {
        $this->assertSupportedProvider($provider);

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Throwable) {
            return redirect()->route('login')->withErrors([
                'oauth' => 'Unable to sign in with '.Str::headline($provider).'. Please try again.',
            ]);
        }

        $email = $socialUser->getEmail();

        if (! $email) {
            return redirect()->route('login')->withErrors([
                'oauth' => Str::headline($provider).' did not provide an email address.',
            ]);
        }

        $user = User::query()
            ->where(function ($query) use ($provider, $socialUser) {
                $query->where('provider', $provider)
                    ->where('provider_id', $socialUser->getId());
            })
            ->orWhere('email', $email)
            ->first();

        $isNewUser = false;

        if (! $user) {
            $isNewUser = true;
            $user = User::create([
                'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: 'New User',
                'email' => $email,
                'password' => Str::random(40),
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        } else {
            $user->fill([
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar() ?: $user->avatar,
                'email_verified_at' => $user->email_verified_at ?: now(),
            ])->save();
        }

        if ($isNewUser) {
            event(new Registered($user));
        }

        Auth::login($user, true);

        request()->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function assertSupportedProvider(string $provider): void
    {
        abort_unless(in_array($provider, ['google', 'microsoft'], true), 404);
    }
}
