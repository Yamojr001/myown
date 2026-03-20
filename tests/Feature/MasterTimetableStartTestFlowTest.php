<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\MasterTimetable;
use App\Models\User;
use App\Support\TestType;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MasterTimetableStartTestFlowTest extends TestCase
{
    #[Test]
    public function it_redirects_to_course_test_creation_route_for_due_test_week(): void
    {
        $user = User::factory()->create();
        $course = Course::query()->create([
            'user_id' => $user->id,
            'title' => 'Algorithms',
            'code' => 'CSC401',
            'credit_unit' => 3,
            'status' => 'In Progress',
            'progress' => 0,
        ]);

        MasterTimetable::query()->create([
            'user_id' => $user->id,
            'current_week' => 4,
            'semester_duration_weeks' => 14,
            'test_schedule' => [
                ['name' => 'Mid-Semester Test', 'week' => 4, 'type' => TestType::MID_SEMESTER, 'description' => 'Mid check'],
            ],
            'weekly_schedule' => ['week_4' => ['courses' => []]],
        ]);

        $response = $this->actingAs($user)->get(route('master-timetable.start-test'));

        $response->assertRedirect(route('tests.create', [
            'course' => $course->id,
            'test_type' => TestType::MID_SEMESTER,
            'test_name' => 'Mid-Semester Test',
        ]));
    }
}
