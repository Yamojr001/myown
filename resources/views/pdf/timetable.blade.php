<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Master Timetable - Week {{ $week }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        h1 {
            color: #1e3a8a; /* brand-blue */
            text-align: center;
        }
        .header-info {
            text-align: center;
            margin-bottom: 30px;
            color: #666;
        }
        .day-section {
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .day-header {
            background-color: #f3f4f6;
            padding: 10px;
            font-size: 18px;
            font-weight: bold;
            border-left: 4px solid #1e3a8a;
            margin-bottom: 10px;
        }
        .block {
            padding: 10px;
            margin-bottom: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
        }
        .block-time {
            color: #1e3a8a;
            font-weight: bold;
            font-size: 14px;
        }
        .block-topic {
            font-weight: bold;
            font-size: 16px;
            margin-top: 4px;
        }
        .block-task {
            font-size: 14px;
            color: #4b5563;
            margin-top: 4px;
        }
        .block-course {
            font-size: 12px;
            color: #6b7280;
            margin-top: 2px;
        }
        .rest-day {
            text-align: center;
            padding: 15px;
            color: #9ca3af;
            font-style: italic;
            border: 1px dashed #e5e7eb;
        }
        
        .test-prep {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
        }
        .test-day {
            background-color: #fef9c3;
            border-left: 4px solid #eab308;
        }
        .rest-block {
            background-color: #dcfce3;
            border-left: 4px solid #22c55e;
        }
    </style>
</head>
<body>
    <h1>Master Study Timetable</h1>
    <div class="header-info">
        <p><strong>Student:</strong> {{ $user->name }}</p>
        <p><strong>Semester Week:</strong> {{ $week }}</p>
    </div>

    @foreach($daysOfWeek as $day)
        <div class="day-section">
            <div class="day-header">{{ $day }}</div>
            
            @if(isset($schedule[$day]) && is_array($schedule[$day]) && count($schedule[$day]) > 0)
                @foreach($schedule[$day] as $block)
                    @php
                        $blockClass = '';
                        if (isset($block['is_test_day']) && $block['is_test_day']) {
                            $blockClass = 'test-day';
                        } elseif (isset($block['is_test_prep']) && $block['is_test_prep']) {
                            $blockClass = 'test-prep';
                        } elseif (isset($block['is_rest_day']) && $block['is_rest_day']) {
                            $blockClass = 'rest-block';
                        }
                    @endphp
                    <div class="block {{ $blockClass }}">
                        <div class="block-time">{{ $block['time'] ?? 'All Day' }}</div>
                        <div class="block-topic">{{ $block['topic'] ?? 'Study Session' }}</div>
                        <div class="block-task">{{ $block['task'] ?? '' }}</div>
                        @if(isset($block['course']) && $block['course'] !== 'None')
                            <div class="block-course">{{ $block['course'] }}</div>
                        @endif
                    </div>
                @endforeach
            @else
                <div class="rest-day">Rest Day</div>
            @endif
        </div>
    @endforeach
</body>
</html>
