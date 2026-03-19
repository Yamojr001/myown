@component('mail::message')
<div style="text-align: center; margin: 0 auto 15px; padding: 0;">
    <img src="{{ $message->embed(public_path('images/branding/logo.png')) }}" alt="Phronix AI Logo" style="height: 55px; vertical-align: middle;">
</div>

<div style="text-align: center; height: 0; padding: 0; margin: 0; overflow: visible; position: relative; pointer-events: none;">
    <div style="display: inline-block; opacity: 0.15; padding-top: 55px;">
        <img src="{{ $message->embed(public_path('images/branding/watermark.png')) }}" alt="Phronix AI Watermark" style="width: 240px; height: 240px;">
    </div>
</div>

# Hello {{ $user->name }}! 📚

It's time for today's study session. Here is your personalized daily reading breakdown for **Week {{ $weekNumber }}**:

@foreach($assignments as $item)
## {{ $item['title'] }} (Pages {{ $item['page_range'] }})

**Key Topics for Today:**
@foreach($item['topics'] as $topic)
- {{ $topic }}
@endforeach

### 💡 Study Advice & Suggestions:
{!! $item['advice'] !!}

---

### 📖 Extracted Content Snapshot:
@if(!empty($item['extracted_text']))
> {{ Str::limit($item['extracted_text'], 500) }}
... *(See the full materials in your dashboard)*
@else
*(Text could not be extracted. Please check your course handout for pages {{ $item['page_range'] }}.)*
@endif

@endforeach

@if(!empty($assignments) && $assignments[0]['is_test_week'])
> [!IMPORTANT]
> **This is a Test Week!** Focus on review and practice questions.
@endif

@component('mail::button', ['url' => route('dashboard')])
Go to Dashboard
@endcomponent

Keep up the great work! Consistent reading is the key to mastery.

Best regards,  
**The Phronix AI Team**
</div>
@endcomponent
