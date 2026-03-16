<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class MasterTimetable extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'schedule',
        'semester_duration_weeks',
        'semester_start_date',
        'weekly_schedule',
        'test_schedule',
        'current_week',
        'next_test_week',
    ];

    protected $casts = [
        'schedule' => 'array',
        'weekly_schedule' => 'array',
        'test_schedule' => 'array',
        'semester_start_date' => 'date',
    ];

    protected $appends = ['current_week', 'next_test_info'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the current week based on semester start date
     */
    public function getCurrentWeekAttribute()
    {
        if (!$this->semester_start_date || !$this->semester_duration_weeks) {
            return 1;
        }

        $startDate = Carbon::parse($this->semester_start_date);
        $today = Carbon::today();
        
        if ($today->lt($startDate)) {
            return 1;
        }
        
        $weekNumber = $startDate->diffInWeeks($today) + 1;
        
        return min($weekNumber, $this->semester_duration_weeks);
    }

    /**
     * Get next test information
     */
    public function getNextTestInfoAttribute()
    {
        if (!$this->test_schedule || !$this->current_week) {
            return null;
        }

        foreach ($this->test_schedule as $test) {
            if ($test['week'] >= $this->current_week) {
                return $test;
            }
        }

        return null;
    }

    /**
     * Get schedule for current week
     */
    public function getCurrentWeekScheduleAttribute()
    {
        if (!$this->weekly_schedule || !$this->current_week) {
            return null;
        }

        return $this->weekly_schedule['week_' . $this->current_week] ?? null;
    }
}