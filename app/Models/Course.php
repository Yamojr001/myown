<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Course extends Model
{
    use HasFactory;
    protected $fillable = [ 'user_id', 'semester_id', 'title', 'code', 'credit_unit', 'file_path', 'page_count', 'topics', 'status', 'progress' ];
    protected $casts = [ 'topics' => 'array' ];

    public function semester(): BelongsTo { return $this->belongsTo(Semester::class); }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function tests(): HasMany { return $this->hasMany(Test::class); }
    public function suggestion(): HasOne { return $this->hasOne(Suggestion::class); }

    // The new relationship for the timetable
    public function timetable(): HasOne
    {
        return $this->hasOne(Timetable::class);
    }

    /**
     * Get the full course content from the shared table.
     */
    public function getFullContentAttribute()
    {
        $user = $this->user;
        if (!$user) return null;

        $year = (int)date('Y');
        $semester = $this->semester;
        if ($semester && preg_match('/\b(20\d{2})\b/', $semester->name, $matches)) {
            $year = (int)$matches[1];
        }

        return CourseContent::where([
            'school' => $user->school,
            'department' => $user->department,
            'year' => $year,
            'course_code' => $this->code,
        ])->value('content');
    }
}