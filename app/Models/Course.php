<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- IMPORT THIS CLASS

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'code',
        'file_path',
        'topics',
        'status',
        'progress',
    ];

    protected $casts = [
        'topics' => 'array',
    ];

    /**
     * Get the user that owns the course.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // =======================================================
    // ADD THIS FUNCTION
    // This defines the "one-to-many" relationship: one Course has many Tests.
    // =======================================================
    public function tests(): HasMany
    {
        return $this->hasMany(Test::class);
    }
    // =======================================================
}