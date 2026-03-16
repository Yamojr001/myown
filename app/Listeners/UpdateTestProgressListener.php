<?php

namespace App\Listeners;

use App\Events\TestCompleted;
use App\Models\MasterTimetable;

class UpdateTestProgressListener
{
    public function handle(TestCompleted $event)
    {
        $course = $event->test->course;
        $user = $course->user;
        $timetable = $user->masterTimetable;
        
        if (!$timetable) {
            return;
        }
        
        // Check if all courses have taken this test type
        $courses = $user->courses()->get();
        $allTestsTaken = true;
        
        foreach ($courses as $course) {
            if (!$course->tests()->where('test_type', $event->testType)->exists()) {
                $allTestsTaken = false;
                break;
            }
        }
        
        // If all tests taken, update to next test
        if ($allTestsTaken) {
            $testSchedule = $timetable->test_schedule;
            $nextTest = null;
            
            foreach ($testSchedule as $test) {
                if ($test['type'] === $event->testType) {
                    $currentIndex = array_search($test, $testSchedule);
                    if (isset($testSchedule[$currentIndex + 1])) {
                        $nextTest = $testSchedule[$currentIndex + 1];
                    }
                    break;
                }
            }
            
            if ($nextTest) {
                $timetable->update([
                    'next_test_week' => $nextTest['week']
                ]);
            }
        }
    }
}