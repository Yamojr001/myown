<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReadingReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $course;
    public $portion;

    public function __construct($course, $portion)
    {
        $this->course = $course;
        $this->portion = $portion;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Time to read: {$this->course}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.reading_reminder',
        );
    }
}
