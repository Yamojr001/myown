<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin',
        'is_active',
        'subscribed_to_newsletter',
        'school',
        'department',
        'level',
        'avatar',
        'current_semester_id',
        'phone_number',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_active' => 'boolean',
            'subscribed_to_newsletter' => 'boolean',
        ];
    }
    
    /**
     * Defines the "one-to-many" relationship: one User has many Courses.
     */
    public function courses(): HasMany
    {
        return $this->hasMany(Course::class);
    }

    // =======================================================
    // ADD THIS FUNCTION
    // This defines the "one-to-many" relationship: one User has many Tests.
    // =======================================================
    // =======================================================
    public function tests(): HasMany
    {
        return $this->hasMany(Test::class);
    }
    // =======================================================

    /**
     * Defines the "one-to-many" relationship: one User has many Semesters.
     */
    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class);
    }

    /**
     * Defines the "belongsTo" relationship for the active semester context.
     */
    public function currentSemester(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Semester::class, 'current_semester_id');
    }

    /**
     * Defines the "one-to-one" relationship: one User has one MasterTimetable.
     */
    public function masterTimetable(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MasterTimetable::class);
    }
}