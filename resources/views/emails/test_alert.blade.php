@component('mail::message')
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
The PrepAI Team
@endcomponent
