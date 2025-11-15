<?php

namespace App\Policies;

use App\Models\Test;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class TestPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Test $test): bool
    {
        return $user->id === $test->user_id;
    }
}