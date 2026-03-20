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
        'preferences',
        'current_week',
        'next_test_week',
    ];

    protected $casts = [
        'schedule' => 'array',
        'weekly_schedule' => 'array',
        'test_schedule' => 'array',
        'preferences' => 'array',
        'semester_start_date' => 'date',
    ];

    protected $appends = ['current_week', 'next_test_info', 'min_schedule_week'];

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
            return $this->min_schedule_week ?? 1;
        }

        $startDate = Carbon::parse($this->semester_start_date);
        $today = Carbon::today();
        
        if ($today->lt($startDate)) {
            return $this->min_schedule_week ?? 1;
        }
        
        $weekNumber = (int) ($startDate->diffInWeeks($today) + 1);
        $weekNumber = min($weekNumber, $this->semester_duration_weeks);

        // Clamp to the minimum week that actually exists in the stored schedule
        $minWeek = $this->min_schedule_week;
        if ($minWeek && $weekNumber < $minWeek) {
            return $minWeek;
        }

        return $weekNumber;
    }

    /**
     * Get the minimum week number that exists in the stored weekly_schedule.
     * The AI generates the plan from the user's specified start week, so
     * earlier week keys (e.g. week_1, week_2) may not exist.
     */
    public function getMinScheduleWeekAttribute(): ?int
    {
        $schedule = $this->weekly_schedule;
        if (empty($schedule)) {
            return null;
        }

        $weeks = array_filter(array_map(function ($key) {
            if (preg_match('/^week_(\d+)$/', $key, $m)) {
                return (int) $m[1];
            }
            return null;
        }, array_keys($schedule)));

        return empty($weeks) ? null : min($weeks);
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