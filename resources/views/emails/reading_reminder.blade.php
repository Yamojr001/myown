@component('mail::message')
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
The PrepAI Team
@endcomponent
