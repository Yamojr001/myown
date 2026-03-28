<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyProgress extends Model
{
    use HasFactory;

    protected $table = 'study_progress';

    protected $fillable = [
        'user_id',
        'course_id',
        'week_number',
        'day_name',
        'completed_tasks',
        'test_score',
        'test_passed',
        'test_questions',
    ];

    protected $casts = [
        'completed_tasks' => 'array',
        'test_questions' => 'array',
        'test_passed' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
