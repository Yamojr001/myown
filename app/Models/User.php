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
    public function tests(): HasMany
    {
        return $this->hasMany(Test::class);
    }
    // =======================================================

    /**
     * Defines the "one-to-one" relationship: one User has one MasterTimetable.
     */
    public function masterTimetable(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MasterTimetable::class);
    }
}