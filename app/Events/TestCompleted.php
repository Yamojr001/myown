<?php

namespace App\Events;

use App\Models\Test;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TestCompleted
{
    use Dispatchable, SerializesModels;

    public $test;
    public $testType;

    public function __construct(Test $test, $testType)
    {
        $this->test = $test;
        $this->testType = $testType;
    }
}
