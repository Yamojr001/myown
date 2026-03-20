<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\SerializesModels;

class ReadingReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $assignments;
    public $weekNumber;

    /**
     * @param $assignments Array of [course, title, topics, page_range, extracted_text, advice]
     */
    public function __construct($user, $assignments, $weekNumber)
    {
        $this->user = $user;
        $this->assignments = $assignments;
        $this->weekNumber = $weekNumber;
    }

    public int $tries = 3;

    public function backoff(): array
    {
        return [30, 120, 300];
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "📚 Your Daily Study Flash - Week {$this->weekNumber}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.reading_reminder',
        );
    }
}
