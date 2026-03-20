<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\URL;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class NewsletterUnsubscribeSignedTest extends TestCase
{
    #[Test]
    public function it_rejects_unsigned_unsubscribe_links(): void
    {
        $user = User::factory()->create(['subscribed_to_newsletter' => true]);

        $this->get(route('newsletter.unsubscribe', ['user' => $user->id]))->assertForbidden();
    }

    #[Test]
    public function it_accepts_valid_signed_unsubscribe_links(): void
    {
        $user = User::factory()->create(['subscribed_to_newsletter' => true]);

        $signedUrl = URL::temporarySignedRoute('newsletter.unsubscribe', now()->addMinutes(30), [
            'user' => $user->id,
        ]);

        $this->get($signedUrl)->assertOk();
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'subscribed_to_newsletter' => false,
        ]);
    }
}
