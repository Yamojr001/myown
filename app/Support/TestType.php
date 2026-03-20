<?php

namespace App\Support;

final class TestType
{
    public const PRE_TEST = 'pre_test';
    public const MID_SEMESTER = 'mid_semester';
    public const POST_TEST = 'post_test';
    public const MOCK_EXAM = 'mock_exam';
    public const RANDOM_TEST = 'random_test';

    /**
     * Convert old and display values to a canonical internal test type.
     */
    public static function normalize(string $value): string
    {
        $normalized = strtolower(trim($value));

        return match ($normalized) {
            'pre-test', 'pre_test', 'pre test' => self::PRE_TEST,
            'mid-semester', 'mid_semester', 'mid semester' => self::MID_SEMESTER,
            'post-test', 'post_test', 'post test' => self::POST_TEST,
            'mock exam', 'mock_exam', 'mock-exam' => self::MOCK_EXAM,
            'random test', 'random_test', 'random-test' => self::RANDOM_TEST,
            default => $normalized,
        };
    }

    public static function label(string $value): string
    {
        return match (self::normalize($value)) {
            self::PRE_TEST => 'Pre-Test',
            self::MID_SEMESTER => 'Mid-Semester',
            self::POST_TEST => 'Post-Test',
            self::MOCK_EXAM => 'Mock Exam',
            self::RANDOM_TEST => 'Random Test',
            default => ucfirst(str_replace('_', ' ', self::normalize($value))),
        };
    }
}
