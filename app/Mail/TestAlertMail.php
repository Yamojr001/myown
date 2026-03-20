<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class TestAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $testInfo;

    public function __construct($user, $testInfo)
    {
        $this->user = $user;
        $this->testInfo = $testInfo;
    }

    public int $tries = 3;

    public function backoff(): array
    {
        return [30, 120, 300];
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "⚠️ Alert: Upcoming {$this->testInfo['name']} this week!",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.test_alert',
        );
    }
}
