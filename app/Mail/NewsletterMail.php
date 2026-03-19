<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterMail extends Mailable
{
    use Queueable, SerializesModels;

    public $subjectLine;
    public $contentBody;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct($subjectLine, $contentBody, $user)
    {
        $this->subjectLine = $subjectLine;
        $this->contentBody = $contentBody;
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter',
            with: [
                'contentBody' => $this->contentBody,
                'subjectLine' => $this->subjectLine,
                'user' => $this->user,
                'unsubscribeUrl' => route('newsletter.unsubscribe', ['email' => $this->user->email]),
            ],
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
