<?php

namespace Tests\Unit;

use App\Support\TestType;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TestTypeTest extends TestCase
{
    #[Test]
    public function it_normalizes_legacy_and_display_values(): void
    {
        $this->assertSame(TestType::PRE_TEST, TestType::normalize('Pre-Test'));
        $this->assertSame(TestType::MID_SEMESTER, TestType::normalize('Mid-Semester'));
        $this->assertSame(TestType::MOCK_EXAM, TestType::normalize('Mock Exam'));
        $this->assertSame(TestType::RANDOM_TEST, TestType::normalize('random test'));
    }

    #[Test]
    public function it_returns_human_labels_for_canonical_values(): void
    {
        $this->assertSame('Pre-Test', TestType::label('pre_test'));
        $this->assertSame('Mid-Semester', TestType::label('mid_semester'));
        $this->assertSame('Mock Exam', TestType::label('mock_exam'));
    }
}
