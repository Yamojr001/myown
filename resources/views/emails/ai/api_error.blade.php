<x-mail::message>
# AI API Error Detected

Phronix AI has encountered a critical error while communicating with the Gemini API.

**Error Message:**
{{ $errorMessage }}

**Model Involved:**
{{ $model }}

**Time:**
{{ now()->toDayDateTimeString() }}

<x-mail::panel>
Please check your Gemini API quota, billing status, or API key validity immediately to restore service for your scholars.
</x-mail::panel>

Thanks,<br>
{{ config('app.name') }} System Monitor
</x-mail::message>
