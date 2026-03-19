@component('mail::message')
<div style="text-align: center; margin: 0 auto 15px; padding: 0;">
    <img src="{{ $message->embed(public_path('images/branding/logo.png')) }}" alt="Phronix AI Logo" style="height: 55px; vertical-align: middle;">
</div>

<div style="text-align: center; height: 0; padding: 0; margin: 0; overflow: visible; position: relative; pointer-events: none;">
    <div style="display: inline-block; opacity: 0.15; padding-top: 55px;">
        <img src="{{ $message->embed(public_path('images/branding/watermark.png')) }}" alt="Phronix AI Watermark" style="width: 240px; height: 240px;">
    </div>
</div>

# Important Alert: {{ $testInfo['name'] }} Is Here! ⚠️

Hello {{ $user->name }},

We wanted to remind you that according to your Master Timetable, you have a **{{ $testInfo['name'] }}** scheduled for this week.

**Test Description:**  
{{ $testInfo['description'] }}

### 🚀 Preparedness Checklist:
- [ ] Review all topics covered in previous weeks.
- [ ] Take at least one Random Test in the "Tests & Assessments" section.
- [ ] Review your AI Study Guides for any weak topics.

@component('mail::button', ['url' => route('tests.index')])
Take a Practice Test
@endcomponent

You've got this! Proper preparation prevents poor performance.

Best regards,  
**The Phronix AI Team**
</div>
@endcomponent
