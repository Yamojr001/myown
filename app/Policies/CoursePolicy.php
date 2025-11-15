<?php
namespace App\Policies;
use App\Models\Course;
use App\Models\User;
class CoursePolicy
{
    public function view(User $user, Course $course): bool
    {
        return $user->id === $course->user_id;
    }
    public function update(User $user, Course $course): bool
    {
        return $user->id === $course->user_id;
    }
}