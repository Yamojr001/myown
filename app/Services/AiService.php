<?php

namespace App\Services;

use Smalot\PdfParser\Parser;
use GuzzleHttp\Exception\ClientException;

class AiService {
    private $apiKey;
    private $client;

    public function __construct() {
        $this->apiKey = config('services.gemini.api_key');
        $this->client = new \GuzzleHttp\Client();
        
        if (empty($this->apiKey)) {
            throw new \RuntimeException('Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file.');
        }
    }
    
    public function extractTopicsFromPdf($pdfFilePath) {
        try {
            if (!file_exists($pdfFilePath)) return null;
            $parser = new Parser();
            $pdf = $parser->parseFile($pdfFilePath);
            $text = preg_replace('/\s+/', ' ', $pdf->getText());
            if (empty($text)) return null;
            
            return $this->extractTopicsFromText($text);
        } catch (\Exception $e) {
            \Log::error('AI Service PDF Parsing Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function extractTopicsFromText($text) {
        try {
            if (empty($text)) return null;
            
            // Limit text size to something gemini handles easily in terms of prompt length (e.g., 200,000 chars)
            $promptText = substr($text, 0, 200000);
            $prompt = "Analyze the following extracted text from a university course syllabus or material. Your task is to identify and extract the main learning topics or key subject modules. Return your response as a single, flat JSON array of strings. For example: [\"Topic A\", \"Topic B\", \"Advanced Topic C\"]. Do not add any introductory text, explanation, or markdown formatting like ```json. Your response must be ONLY the JSON array itself. Here is the syllabus text: " . $promptText;

            $responseContent = $this->callGemini($prompt);
            if ($responseContent === null) return null;
            
            $topics = json_decode($responseContent, true);
            return (json_last_error() === JSON_ERROR_NONE && is_array($topics)) ? $topics : null;
        } catch (\Exception $e) {
            \Log::error('AI Service Text Topic Extraction Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function extractTextFromImage(string $filePath, string $mimeType) {
        try {
            if (!file_exists($filePath)) return "";
            
            $base64Data = base64_encode(file_get_contents($filePath));
            $prompt = "Analyze this document or image and extract ALL readable text. Maintain paragraphs and formatting where possible. Return ONLY the raw extracted text without any surrounding quotes, tags, or markdown blocks.";
            
            $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $this->apiKey;

            $response = $this->client->post($apiUrl, [
                'headers' => ['Content-Type'  => 'application/json'],
                'json' => [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                                ['inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $base64Data
                                ]]
                            ]
                        ]
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                    ]
                ],
                'timeout' => 60,
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
            if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                return $body['candidates'][0]['content']['parts'][0]['text'];
            }
            
            return "";
        } catch (\Exception $e) {
            \Log::error('AI Service Image/PDF Text Extraction Failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function generateTestFromTopics(array $topics) {
        try {
            $topicList = implode(', ', $topics);
            $prompt = "You are a test generation assistant. Based on the following topics, create a 50-question multiple-choice test. For each question, provide: a 'question' string, an 'options' array of 4 unique strings, and a 'correct_answer_index' (an integer from 0 to 3). The topics should be covered evenly. Ensure the entire response is a single, valid JSON object with a key 'questions' which contains an array of these question objects. Do not add any other text or explanation. The topics are: " . $topicList;

            \Log::info('AI Service: Generating test from topics', ['topics_count' => count($topics)]);
            
            $responseContent = $this->callGemini($prompt, 120, 8000);
            
            \Log::info('AI Service: Raw test response', [
                'response_length' => strlen($responseContent ?? ''),
                'first_500' => substr($responseContent ?? '', 0, 500)
            ]);
            
            if ($responseContent === null) {
                \Log::error('AI Service: callGemini returned null for test generation');
                return null;
            }

            $responseContent = $this->cleanJsonResponse($responseContent);

            \Log::info('AI Service: Cleaned test response', [
                'first_200' => substr($responseContent, 0, 200)
            ]);

            $testData = json_decode($responseContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('AI Service: JSON decode error for test', [
                    'error' => json_last_error_msg(),
                    'response_content' => substr($responseContent, 0, 1000),
                    'json_last_error' => json_last_error()
                ]);
                return null;
            }

            if (!isset($testData['questions'])) {
                \Log::error('AI Service: questions key missing in test data', [
                    'test_data_keys' => array_keys($testData),
                    'test_data' => $testData
                ]);
                return null;
            }

            if (!is_array($testData['questions'])) {
                \Log::error('AI Service: questions is not an array', [
                    'questions_type' => gettype($testData['questions'])
                ]);
                return null;
            }

            // Validate each question has required fields
            foreach ($testData['questions'] as $index => $question) {
                if (!isset($question['question'], $question['options'], $question['correct_answer_index'])) {
                    \Log::error('AI Service: Missing required fields in question', [
                        'question_index' => $index,
                        'question_data' => $question
                    ]);
                    return null;
                }
            }

            \Log::info('AI Service: Successfully generated test', [
                'question_count' => count($testData['questions'])
            ]);
            
            return $testData;

        } catch (\Exception $e) {
            \Log::error('AI Service Test Generation Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function generateStudyGuide(string $pdfFilePath, array $weakTopics)
    {
        try {
            if (!file_exists($pdfFilePath)) return null;
            
            $parser = new Parser();
            $pdf = $parser->parseFile($pdfFilePath);
            $lectureText = preg_replace('/\s+/', ' ', $pdf->getText());

            if (empty($lectureText)) return null;

            $weakTopicsList = implode(', ', $weakTopics);

            $prompt = "You are an expert academic tutor. I will provide the full text of a lecture note and a list of 'weak topics'. Your task is to create a detailed study guide focused only on these weak topics. RULES: 1. For each weak topic, you MUST base your explanations and examples directly on the provided lecture note text. Quote or paraphrase relevant sections. 2. If a weak topic is not explained in detail in the notes, you MUST explicitly state: 'This topic was not covered in detail in the provided notes, so here is a foundational explanation:' and then provide a clear summary from your general knowledge. 3. Format the entire study guide in Markdown. Use headings (#, ##), subheadings, bullet points (*), and bold text (**text**). For each topic, provide a summary, key points from the notes, and a simple 2-step reading plan. 4. Return your response as a single, valid JSON object with one key: \"study_guide_markdown\". Do not add any other text, just the JSON. LECTURE NOTE TEXT: \"\"\"{$lectureText}\"\"\" WEAK TOPICS: [{$weakTopicsList}]";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt));
            if ($responseContent === null) {
                \Log::error('AI Service: callGemini returned null for study guide');
                return null;
            }

            \Log::info('AI Service: Raw study guide response', ['response' => $responseContent]);

            $guideData = json_decode($responseContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('AI Service: JSON decode error for study guide', [
                    'error' => json_last_error_msg(),
                    'response_content' => $responseContent
                ]);
                return null;
            }

            if (!isset($guideData['study_guide_markdown'])) {
                \Log::error('AI Service: study_guide_markdown key missing', ['guide_data' => $guideData]);
                return null;
            }

            return $guideData['study_guide_markdown'];

        } catch (\Exception $e) {
            \Log::error('AI Service Study Guide Generation Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function generateTimetable(array $weakTopics, array $preferences)
    {
        try {
            $weakTopicsList = implode(', ', $weakTopics);
            $constraints = $this->formatConstraints($preferences);

            $prompt = "You are an expert academic planner. Create a 7-day study timetable for a university student.

            RULES:
            1.  The student's weak topics are: [{$weakTopicsList}]. You MUST prioritize these topics, dedicating more time to them than others.
            2.  Follow all user-defined constraints and preferences precisely.
            3.  The output must be a single, valid JSON object with keys for each day ('Monday', 'Tuesday', ..., 'Sunday').
            4.  Each day's value is an array of 'study block' objects with: 'time', 'topic' (string), and 'task' (brief string).
            5.  If a day has no study scheduled, the value should be an empty array [].
            6.  Do not include any text, explanation, or markdown formatting outside of the main JSON object.

            USER PREFERENCES & CONSTRAINTS:
            {$constraints}";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt));
            if ($responseContent === null) return null;

            $scheduleData = json_decode($responseContent, true);
            return (json_last_error() === JSON_ERROR_NONE && is_array($scheduleData)) ? $scheduleData : null;

        } catch (\Exception $e) {
            \Log::error('AI Service Timetable Generation Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function generateMasterTimetable(array $courses, array $preferences)
    {
        try {
            $constraints = $this->formatConstraints($preferences);
            $courseInfo = "";
            foreach ($courses as $c) {
                $courseInfo .= "- {$c['title']}: Score {$c['score']}%, Pages: {$c['page_count']}, Weak Topics: " . implode(', ', $c['weak_topics']) . "\n";
            }

            $prompt = "You are an expert academic planner. Create a 7-day unified study timetable for a student taking multiple courses.
            
            COURSES:
            {$courseInfo}

            RULES:
            1. Prioritize courses with LOWER scores and MORE pages.
            2. Dedicate more time to listed 'Weak Topics'.
            3. The output must be a single, valid JSON object with keys for each day ('Monday', ..., 'Sunday').
            4. Each day's value is an array of 'study block' objects with: 'time', 'topic' (must include course title), and 'task'.
            5. Follow these constraints:
            {$constraints}";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt));
            return $responseContent ? json_decode($responseContent, true) : null;
        } catch (\Exception $e) {
            \Log::error('AI Service Master Timetable Failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generates a semester-long weekly reading plan with test schedule
     */
    public function generateSemesterSchedule(array $courses, array $preferences, int $semesterWeeks, array $testSchedule = null)
    {
        try {
            $constraints = $this->formatSemesterConstraints($preferences);
            
            // Group courses by priority
            $prioritizedCourses = $this->prioritizeCourses($courses);
            
            $courseInfo = "";
            foreach ($prioritizedCourses as $c) {
                $weakTopics = is_array($c['weak_topics']) ? implode(', ', array_slice($c['weak_topics'], 0, 3)) : 'None';
                $courseInfo .= "- {$c['title']}: Score {$c['score']}%, Pages: {$c['page_count']}, Key Weak Topics: {$weakTopics}\n";
            }

            // Add test schedule info
            $testInfo = "";
            if ($testSchedule) {
                $testInfo = "TEST SCHEDULE:\n";
                foreach ($testSchedule as $test) {
                    $testInfo .= "- Week {$test['week']}: {$test['name']} ({$test['description']})\n";
                }
            }

            \Log::info('AI Service: Generating semester schedule with tests', [
                'course_count' => count($courses),
                'semester_weeks' => $semesterWeeks,
                'test_count' => $testSchedule ? count($testSchedule) : 0
            ]);

            $prompt = "You are an expert academic planner. Create a {$semesterWeeks}-week semester study plan.

            COURSES (prioritized by need):
            {$courseInfo}

            {$testInfo}

            RULES:
            1. Create a week-by-week plan for {$semesterWeeks} weeks.
            2. Prioritize courses with LOWER scores and MORE pages.
            3. Include focused review weeks before each test.
            4. Test weeks should have reduced study load or focus on review only.
            5. Distribute content evenly with realistic weekly study hours.
            6. CRITICAL: For EVERY WEEK, the `courses` array MUST contain an object for EVERY SINGLE COURSE listed above. Do not skip any courses in any week, even if the estimated hours are low.
            7. CRITICAL: To prevent token limits, you MUST return MINIFIED JSON. Do NOT use any line breaks, indentation, or unnecessary whitespace.
            8. CRITICAL: Keep all `topics` and `tasks` string arrays extremely concise. Summarize them in under 8 words per item, max 2 items. You MUST complete all {$semesterWeeks} weeks before stopping.
            9. Return JSON strictly matching this structure:
               {\"week_1\":{\"courses\":[{\"course\":\"First Course Name\",\"topics\":[\"Topic 1\",\"Topic 2\"],\"pages_to_read\":\"10-20\",\"tasks\":[\"Read chapter\",\"Practice exercises\"],\"estimated_hours\":2},{\"course\":\"Second Course Name\",\"topics\":[\"Topic A\"],\"pages_to_read\":\"20-30\",\"tasks\":[\"Review lectures\"],\"estimated_hours\":3}],\"weekly_objectives\":[\"Objective 1\"],\"total_study_hours\":15,\"is_test_week\":false,\"test_prep\":\"None\"}}
            10. Weekly study hours: {$preferences['study_hours']} hours.
            11. For test weeks, reduce study hours by 50% and focus on review.
            12. The week before a test should be focused on review and practice.
            13. Constraints: {$constraints}";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt, 60));
            
            if (!$responseContent) {
                \Log::error('AI Service Semester Schedule: Empty response from Gemini');
                return null;
            }

            $scheduleData = json_decode($responseContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('AI Service Semester Schedule: JSON decode error', [
                    'error' => json_last_error_msg(),
                    'response' => substr($responseContent, 0, 4000) . '... (truncated, total length: ' . strlen($responseContent) . ')'
                ]);
                return null;
            }

            // Mark test weeks in the schedule
            if ($testSchedule) {
                $scheduleData = $this->markTestWeeks($scheduleData, $testSchedule);
            }

            \Log::info('AI Service: Generated semester schedule with tests', [
                'weeks_count' => count($scheduleData),
                'test_weeks' => $testSchedule ? array_column($testSchedule, 'week') : []
            ]);
            
            return $scheduleData;
            
        } catch (\Exception $e) {
            \Log::error('AI Service Semester Schedule Failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Generates a simplified weekly timetable from semester schedule
     */
    public function generateWeeklyTimetableFromSemesterSchedule(array $semesterSchedule, array $preferences, int $weekNumber)
    {
        try {
            if (!isset($semesterSchedule["week_{$weekNumber}"])) {
                \Log::error("Week {$weekNumber} not found in semester schedule", ['available_weeks' => array_keys($semesterSchedule)]);
                return $this->generateFallbackWeeklySchedule($preferences);
            }

            $weekData = $semesterSchedule["week_{$weekNumber}"];
            
            // Check if this is a test week
            if (isset($weekData['is_test_week']) && $weekData['is_test_week']) {
                return $this->createTestWeekSchedule($weekData, $preferences);
            }
            
            // Create a simplified weekly schedule
            $weeklySchedule = $this->createSimplifiedSchedule($weekData, $preferences);
            
            \Log::info('AI Service: Generated weekly timetable for week ' . $weekNumber, [
                'course_count' => count($weekData['courses']),
                'total_hours' => $weekData['total_study_hours'] ?? $preferences['study_hours'],
                'is_test_week' => $weekData['is_test_week'] ?? false
            ]);
            
            return $weeklySchedule;

        } catch (\Exception $e) {
            \Log::error('AI Service Weekly Timetable Failed: ' . $e->getMessage());
            return $this->generateFallbackWeeklySchedule($preferences);
        }
    }

    /**
     * Create schedule for test week
     */
    private function createTestWeekSchedule(array $weekData, array $preferences): array
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $schedule = array_fill_keys($days, []);
        
        $testName = $weekData['test_name'] ?? 'Test';
        
        // Create light review schedule for test week
        $reviewDays = ['Monday', 'Tuesday', 'Wednesday'];
        foreach ($reviewDays as $day) {
            $schedule[$day][] = [
                'time' => '18:00 - 19:00',
                'topic' => 'Test Preparation',
                'task' => "Review key concepts for {$testName}",
                'course' => 'All Courses',
                'duration_minutes' => 60,
                'is_test_prep' => true
            ];
        }
        
        // Test day (Thursday)
        $schedule['Thursday'][] = [
            'time' => '09:00 - 12:00',
            'topic' => $testName,
            'task' => 'Take the test',
            'course' => 'All Courses',
            'duration_minutes' => 180,
            'is_test_day' => true
        ];
        
        // Rest day after test
        $schedule['Friday'][] = [
            'time' => 'All Day',
            'topic' => 'Rest and Recovery',
            'task' => 'Take a break after the test',
            'course' => 'None',
            'duration_minutes' => 0,
            'is_rest_day' => true
        ];
        
        return $schedule;
    }

    /**
     * Create a simplified schedule without AI
     */
    private function createSimplifiedSchedule(array $weekData, array $preferences): array
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $schedule = array_fill_keys($days, []);
        
        $totalHours = $weekData['total_study_hours'] ?? $preferences['study_hours'];
        // Assume 5 main study days for primary distribution
        $hoursPerDay = floor($totalHours / 5);
        if ($hoursPerDay < 1.5) $hoursPerDay = 1.5; // At least one slot
        
        // Custom schedule constraints
        $unavailableTimes = $this->extractUnavailableTimes($preferences);
        $preferredTime = $preferences['preferred_time'] ?? 'evening';
        
        $timeSlots = $this->getTimeSlots($preferredTime, $hoursPerDay);
        
        // Distribute courses across days
        $dayIndex = 0;
        $courseIndex = 0;
        $courses = $weekData['courses'] ?? [];
        
        $availableDays = [];
        for ($i = 0; $i < 5; $i++) {
            if (!isset($unavailableTimes[$days[$i]])) {
                $availableDays[] = $days[$i];
            }
        }
        
        if (empty($courses)) {
            return $schedule;
        }

        foreach ($availableDays as $day) {
            foreach ($timeSlots as $timeSlot) {
                $course = $courses[$courseIndex % count($courses)];
                $schedule[$day][] = [
                    'time' => $timeSlot,
                    'topic' => $course['course'] . ' - ' . ($course['topics'][0] ?? 'Study'),
                    'task' => $course['tasks'][0] ?? 'Review materials',
                    'course' => $course['course'],
                    'duration_minutes' => 90
                ];
                $courseIndex++;
            }
        }
        
        // Add weekend study if needed
        $weekendSlots = $this->getTimeSlots($preferredTime, 2);
        foreach (['Saturday', 'Sunday'] as $day) {
            if (!isset($unavailableTimes[$day])) {
                foreach ($weekendSlots as $timeSlot) {
                    $course = $courses[$courseIndex % count($courses)];
                    $schedule[$day][] = [
                        'time' => $timeSlot,
                        'topic' => $course['course'] . ' - Review',
                        'task' => 'Review and practice weak areas',
                        'course' => $course['course'],
                        'duration_minutes' => 60
                    ];
                    $courseIndex++;
                }
            }
        }
        
        return $schedule;
    }

    /**
     * Generate fallback schedule when AI fails
     */
    private function generateFallbackWeeklySchedule(array $preferences): array
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        $schedule = array_fill_keys($days, []);
        
        $studyHours = $preferences['study_hours'] ?? 15;
        $hoursPerDay = floor($studyHours / 5);
        $preferredTime = $preferences['preferred_time'] ?? 'evening';
        
        $timeSlots = $this->getTimeSlots($preferredTime, $hoursPerDay);
        
        // Create a simple schedule
        for ($i = 0; $i < 5; $i++) {
            $day = $days[$i];
            foreach ($timeSlots as $slot) {
                $schedule[$day][] = [
                    'time' => $slot,
                    'topic' => 'Study Session',
                    'task' => 'Review course materials and practice',
                    'duration_minutes' => 90
                ];
            }
        }
        
        return $schedule;
    }

    /**
     * Mark test weeks in the schedule
     */
    private function markTestWeeks(array $scheduleData, array $testSchedule): array
    {
        foreach ($testSchedule as $test) {
            $weekKey = "week_{$test['week']}";
            if (isset($scheduleData[$weekKey])) {
                $scheduleData[$weekKey]['is_test_week'] = true;
                $scheduleData[$weekKey]['test_name'] = $test['name'];
                $scheduleData[$weekKey]['test_type'] = $test['type'];
                
                // Adjust study hours for test week
                if (isset($scheduleData[$weekKey]['total_study_hours'])) {
                    $scheduleData[$weekKey]['total_study_hours'] = floor($scheduleData[$weekKey]['total_study_hours'] * 0.5);
                }
                
                // Focus on review for test week
                foreach ($scheduleData[$weekKey]['courses'] as &$course) {
                    $course['tasks'] = ["Review all materials", "Practice test questions", "Focus on weak areas"];
                    $course['estimated_hours'] = floor($course['estimated_hours'] * 0.5);
                }
                
                // Mark week before test as review week
                $prevWeek = $test['week'] - 1;
                $prevWeekKey = "week_{$prevWeek}";
                if (isset($scheduleData[$prevWeekKey])) {
                    $scheduleData[$prevWeekKey]['test_prep'] = "Prepare for {$test['name']}";
                    foreach ($scheduleData[$prevWeekKey]['courses'] as &$course) {
                        $course['tasks'][] = "Review for upcoming test";
                    }
                }
            }
        }
        
        return $scheduleData;
    }

    /**
     * Get time slots based on preferred time
     */
    private function getTimeSlots(string $preferredTime, int $hoursPerDay): array
    {
        $slots = [];
        
        switch ($preferredTime) {
            case 'morning':
                $startHour = 8;
                break;
            case 'afternoon':
                $startHour = 13;
                break;
            case 'night':
            default:
                $startHour = 18;
                break;
        }
        
        for ($i = 0; $i < $hoursPerDay; $i += 1.5) {
            $hour = $startHour + $i;
            $endHour = $hour + 1.5;
            $slots[] = sprintf("%02d:00 - %02d:00", $hour, $endHour);
        }
        
        return $slots;
    }

    /**
     * Extract unavailable times from preferences
     */
    private function extractUnavailableTimes(array $preferences): array
    {
        $unavailable = [];
        
        if (isset($preferences['has_custom_schedule']) && $preferences['has_custom_schedule'] && 
            isset($preferences['custom_schedules'])) {
            foreach ($preferences['custom_schedules'] as $schedule) {
                if (isset($schedule['availability']) && $schedule['availability'] === 'not_available') {
                    $day = $schedule['day'] ?? 'Monday';
                    $unavailable[$day] = true;
                }
            }
        }
        
        return $unavailable;
    }

    /**
     * Prioritize courses by score and page count
     */
    private function prioritizeCourses(array $courses): array
    {
        usort($courses, function($a, $b) {
            // Lower score = higher priority
            $scorePriority = $a['score'] <=> $b['score'];
            if ($scorePriority !== 0) return $scorePriority;
            
            // More pages = higher priority
            return $b['page_count'] <=> $a['page_count'];
        });
        
        return $courses;
    }

    public function tutorExplain(string $text)
    {
        $prompt = "You are an expert academic tutor. Provide a clear, excellent, and comprehensive explanation with practical examples for the following text. 
        
        RULES:
        1. Break down complex concepts into simple terms.
        2. Use relatable examples.
        3. Format your response beautifully using Markdown (headers, bold text, lists).
        4. If the text is a specific problem, solve it step-by-step.
        5. Return ONLY the Markdown-formatted explanation text, without any JSON wrapper or additional formatting.

        TEXT TO EXPLAIN:
        \"\"\"{$text}\"\"\"";
        
        $responseContent = $this->callGemini($prompt, 45, 8192, 'text/plain');
        
        if (!$responseContent) {
            return null;
        }
        
        // Clean up the response
        $cleaned = $responseContent;
        
        if (str_starts_with($cleaned, '"') && str_ends_with($cleaned, '"')) {
            $cleaned = substr($cleaned, 1, -1);
        }
        
        $cleaned = str_replace('\"', '"', $cleaned);
        $cleaned = str_replace('\n', "\n", $cleaned);
        $cleaned = str_replace('\\\\', '\\', $cleaned);
        
        return $cleaned;
    }

    public function cleanJsonResponse(?string $responseContent): ?string
    {
        if ($responseContent === null) return null;
        
        $cleaned = trim($responseContent);
        
        if (str_starts_with($cleaned, '```json')) {
            $cleaned = substr($cleaned, 7);
            $pos = strrpos($cleaned, '```');
            if ($pos !== false) $cleaned = substr($cleaned, 0, $pos);
        } elseif (str_starts_with($cleaned, '```')) {
            $cleaned = substr($cleaned, 3);
            $pos = strrpos($cleaned, '```');
            if ($pos !== false) $cleaned = substr($cleaned, 0, $pos);
        }
        
        $cleaned = trim($cleaned);
        
        if (str_starts_with($cleaned, '"') && str_ends_with($cleaned, '"')) {
            $cleaned = substr($cleaned, 1, -1);
            $cleaned = str_replace('\"', '"', $cleaned);
        }

        // Replace all literal newlines, carriage returns, and tabs with spaces.
        // This safely flattens the JSON string into one line, completely removing any 
        // unescaped control characters Gemini injects inside string values that cause json_decode to fail.
        $cleaned = str_replace(["\n", "\r", "\t"], ' ', $cleaned);
        
        // Strip any remaining invisible control characters
        $cleaned = preg_replace('/[\x00-\x1F\x7F]/', '', $cleaned);
        
        return $cleaned;
    }

    private function callGemini($prompt, $timeout = 45, $maxOutputTokens = 8192, $mimeType = 'application/json') {
        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $this->apiKey;

        try {
            $response = $this->client->post($apiUrl, [
                'headers' => ['Content-Type'  => 'application/json'],
                'json' => [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => [
                        'responseMimeType' => $mimeType, 
                        'temperature' => 0.3,
                        'maxOutputTokens' => $maxOutputTokens
                    ]
                ],
                'timeout' => $timeout,
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
            \Log::info('AI Service: Gemini API response received', [
                'has_text' => isset($body['candidates'][0]['content']['parts'][0]['text']),
                'response_keys' => array_keys($body)
            ]);
            
            if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                $textContent = $body['candidates'][0]['content']['parts'][0]['text'];
                return $textContent;
            }
            
            \Log::warning('Gemini response did not contain the expected text content path.', [
                'available_keys' => array_keys($body),
                'candidates' => isset($body['candidates']) ? $body['candidates'] : 'no_candidates'
            ]);
            return null;

        } catch (ClientException $e) {
            $responseBody = $e->getResponse()->getBody()->getContents();
            \Log::error('Gemini API Error from Google: ' . $responseBody);
            return null;
        } catch (\Exception $e) {
            \Log::error('General network error calling Gemini: ' . $e->getMessage());
            return null;
        }
    }
    
    private function formatConstraints(array $preferences): string
    {
        $constraints = [];
        
        if (isset($preferences['study_hours'])) {
            $constraints[] = "Total study hours per week: " . $preferences['study_hours'] . " hours";
        }
        
        if (isset($preferences['preferred_time'])) {
            $timeMap = [
                'morning' => 'Morning (6am - 12pm)',
                'afternoon' => 'Afternoon (1pm - 6pm)',
                'night' => 'Night (7pm - 11pm)'
            ];
            $constraints[] = "Preferred study time: " . ($timeMap[$preferences['preferred_time']] ?? $preferences['preferred_time']);
        }
        
        if (isset($preferences['has_custom_schedule']) && $preferences['has_custom_schedule'] && 
            isset($preferences['custom_schedules'])) {
            foreach ($preferences['custom_schedules'] as $schedule) {
                if (isset($schedule['day']) && isset($schedule['availability']) && 
                    isset($schedule['start_time']) && isset($schedule['end_time'])) {
                    $status = $schedule['availability'] === 'available' ? 'Available' : 'Not available';
                    $constraints[] = "{$schedule['day']}: {$status} from {$schedule['start_time']} to {$schedule['end_time']}";
                }
            }
        }
        
        return implode("\n", $constraints);
    }

    private function formatSemesterConstraints(array $preferences): string
    {
        $constraints = [];
        
        if (isset($preferences['study_hours'])) {
            $constraints[] = "Weekly study hours: " . $preferences['study_hours'] . " hours per week";
        }
        
        if (isset($preferences['preferred_time'])) {
            $timeMap = [
                'morning' => 'Morning focus (prefers morning study sessions)',
                'afternoon' => 'Afternoon focus (prefers afternoon study sessions)',
                'night' => 'Evening/night focus (prefers evening study sessions)'
            ];
            $constraints[] = "Student prefers: " . ($timeMap[$preferences['preferred_time']] ?? $preferences['preferred_time']);
        }
        
        if (isset($preferences['has_custom_schedule']) && $preferences['has_custom_schedule'] && 
            isset($preferences['custom_schedules'])) {
            $constraints[] = "Weekly availability:";
            foreach ($preferences['custom_schedules'] as $schedule) {
                if (isset($schedule['day']) && isset($schedule['availability']) && 
                    isset($schedule['start_time']) && isset($schedule['end_time'])) {
                    $status = $schedule['availability'] === 'available' ? 'Available' : 'Not available';
                    $constraints[] = "  - {$schedule['day']}: {$status} {$schedule['start_time']}-{$schedule['end_time']}";
                }
            }
        }
        
        return implode("\n", $constraints);
    }
}