<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'title',
        'code',
        'file_path',
        'topics',
        'status',
        'progress',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'topics' => 'array', // Automatically convert the JSON 'topics' string to a PHP array!
    ];

    /**
     * Get the user that owns the course.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}