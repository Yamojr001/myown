<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AiApiErrorMail extends Mailable
{
    use Queueable, SerializesModels;

    public $errorMessage;
    public $model;

    /**
     * Create a new message instance.
     */
    public function __construct(string $errorMessage, string $model = 'Unknown')
    {
        $this->errorMessage = $errorMessage;
        $this->model = $model;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'CRITICAL: Phronix AI - Gemini API Error Alert',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.ai.api_error',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
