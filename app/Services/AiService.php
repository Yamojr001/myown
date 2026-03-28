<?php

namespace App\Services;

use Smalot\PdfParser\Parser;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\AiApiErrorMail;

class AiService {
    private $apiKey;
    private $client;
    private const PRIMARY_MODEL = 'gemini-2.5-flash';
    private const FALLBACK_MODEL = 'gemini-2.5-pro';

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
            
            $requestId = (string) Str::uuid();
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            ['inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $base64Data,
                            ]],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                ],
            ];

            $models = [self::PRIMARY_MODEL, (string) config('services.gemini.fallback_model', self::FALLBACK_MODEL)];
            foreach ($models as $model) {
                for ($attempt = 1; $attempt <= 3; $attempt++) {
                    try {
                        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $this->apiKey;
                        $response = $this->client->post($apiUrl, [
                            'headers' => [
                                'Content-Type' => 'application/json',
                                'X-Request-Id' => $requestId,
                            ],
                            'json' => $payload,
                            'timeout' => 180,
                        ]);

                        $body = json_decode($response->getBody()->getContents(), true);
                        if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                            return $body['candidates'][0]['content']['parts'][0]['text'];
                        }
                    } catch (\Throwable $e) {
                        \Log::warning('Image extraction retry failed', [
                            'request_id' => $requestId,
                            'model' => $model,
                            'attempt' => $attempt,
                            'error' => $e->getMessage(),
                        ]);
                    }

                    usleep(random_int(200000, 900000));
                }
            }

            return "";
        } catch (\Exception $e) {
            \Log::error('AI Service Image/PDF Text Extraction Failed: ' . $e->getMessage());
            $this->notifyAdminOfError($e, 'Vision/Extraction');
            throw $e;
        }
    }

    public function generateTestFromContent(string $content, int $questionCount = 50, bool $isEssay = false) {
        try {
            $contentExcerpt = substr($content, 0, 150000); // 150k chars is plenty for most syllabi
            
            if ($isEssay) {
                $prompt = "You are an expert exam generator. Based on the following COURSE CONTENT, create a {$questionCount}-question Essay/Short Answer Mock Exam. 
                
                CONTENT-SPECIFIC RULES:
                1. Focus ONLY on core academic concepts, principles, and technical details.
                2. AVOID trivial questions about authors, presentation dates, universities, or document metadata.
                3. STRICTLY use ONLY the information provided in the course content below. 
                
                JSON RULES:
                - Return a single valid JSON object with a key 'questions' containing an array of objects: [{\"question\": \"...\"}].
                - Do NOT include any control characters (newlines, tabs) inside the JSON string values.
                
                COURSE CONTENT:
                \"\"\"{$contentExcerpt}\"\"\"";
            } else {
                $prompt = "You are a test generation assistant. Based on the following COURSE CONTENT, create a {$questionCount}-question multiple-choice test. 
                
                CONTENT-SPECIFIC RULES:
                1. Focus ONLY on core academic concepts, definitions, and technical knowledge.
                2. AVOID 'stupid' or trivial questions about authors, document titles, page numbers, or administrative metadata.
                3. STRICTLY use ONLY the information provided in the course content below.
                
                JSON RULES:
                - Return a single valid JSON object with a key 'questions' containing an array of objects: [{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct_answer_index\": 0}].
                - Ensure all options are unique and plausible.
                - Do NOT use control characters like literal newlines or tabs within strings.
                
                COURSE CONTENT:
                \"\"\"{$contentExcerpt}\"\"\"";
            }

            \Log::info('AI Service: Generating test from content', ['content_length' => strlen($content), 'count' => $questionCount, 'isEssay' => $isEssay]);
            
            // Re-adjust prompt for extreme conciseness to avoid truncation at 50 questions
            $prompt .= "\n\nIMPORTANT: Be extremely CONCISE in your questions and options to ensure the entire JSON fits within the response limit. Do not add any filler text.";

            $responseContent = $this->callGemini($prompt, 180, null);
            
            if ($responseContent === null) {
                \Log::error('AI Service: callGemini returned null for test generation');
                return null;
            }

            $responseContent = $this->cleanJsonResponse($responseContent);

            $testData = json_decode($responseContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('AI Service: JSON decode error for test', [
                    'error' => json_last_error_msg(),
                    'response_content' => substr($responseContent, 0, 1000),
                    'full_length' => strlen($responseContent)
                ]);
                return null;
            }

            if (!isset($testData['questions']) || !is_array($testData['questions'])) {
                return null;
            }

            // Validate each question has required fields
            foreach ($testData['questions'] as $index => &$question) {
                if ($isEssay) {
                    if (!isset($question['question'])) return null;
                } else {
                    if (!isset($question['question'], $question['options'], $question['correct_answer_index'])) return null;
                }
                
                // For essays, we won't have options to shuffle later, so add a flag
                if ($isEssay) {
                    $question['is_essay'] = true;
                }
            }

            return $testData;

        } catch (\Exception $e) {
            \Log::error('AI Service Test Generation Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function markEssayTest(array $questions, array $answers) {
        try {
            $qnaList = "";
            foreach ($questions as $index => $q) {
                $userAns = $answers[$index] ?? "No answer provided.";
                $qnaList .= "Q" . ($index + 1) . ": " . $q['question'] . "\nStudent Answer: " . $userAns . "\n\n";
            }

            $prompt = "You are an expert university professor grading an essay exam. I will provide a list of questions and the student's corresponding answers. Grade each answer out of 100 based on accuracy, completeness, and understanding. Focus on the core concepts.

Your output must be a single valid JSON object containing exactly these keys:
1. 'score': The overall average score out of 100 (integer).
2. 'weak_topics': An array of up to 5 strings representing the topics the student struggled with the most based on their low-scoring answers. Provide brief topic names only.
3. 'feedback': A brief paragraph of overall constructive feedback.

Questions and Answers:
{$qnaList}";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt, 60));
            if (!$responseContent) return null;

            $resultData = json_decode($responseContent, true);
            if (json_last_error() !== JSON_ERROR_NONE) return null;

            return [
                'score' => $resultData['score'] ?? 0,
                'weak_topics' => $resultData['weak_topics'] ?? [],
                'feedback' => $resultData['feedback'] ?? "Test evaluated successfully."
            ];

        } catch (\Exception $e) {
            \Log::error('AI Service Essay Marking Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function generateStudyGuide(string $content, array $weakTopics)
    {
        try {
            if (empty($content)) return null;

            $weakTopicsList = implode(', ', $weakTopics);

            $prompt = "You are an expert academic tutor. I will provide the full text of a course syllabus/material and a list of 'weak topics'. Your task is to create a detailed study guide focused only on these weak topics. 

STRICT RULES: 
1. You MUST base your explanations and examples DIRECTLY and EXCLUSIVELY on the provided course content. Do not bring in outside information.
2. For each weak topic, you MUST provide exactly these three sub-sections:
   - ### Detailed Summary
   - ### Key Points (as bullet points)
   - ### 2-Step Reading Plan (as a numbered list)
   BASED ONLY on the provided text.
3. If a weak topic is genuinely not mentioned in the provided text, state: 'This topic was not covered in the provided material.' Do NOT use external knowledge to explain it.

Format the entire study guide in professional Markdown. 
CRITICAL: Use proper Markdown heading symbols (#, ##, ###) for structure.
DO NOT use bold text (**) for headings; use # instead.
Use a main title (# Course Title Study Guide).
Use secondary headings (## 1. Topic Name) for each topic.
Use tertiary headings (### Detailed Summary, ### Key Points, etc.) for sub-sections.
Use bullet points (*) for lists and bold text (**text**) ONLY for emphasis within paragraphs.
Ensure there is a space after each # symbol (e.g., '# Title', not '#Title').

Return your response as a single, valid JSON object with one key: \"study_guide_markdown\". Do not add any other text, just the JSON. 

COURSE CONTENT: 
\"\"\"" . substr($content, 0, 150000) . "\"\"\" 

WEAK TOPICS: [{$weakTopicsList}]";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt, 120, null));
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
    public function generateSemesterSchedule(array $courses, array $preferences, int $semesterWeeks, array $testSchedule = null, int $currentWeek = 1)
    {
        try {
            $constraints = $this->formatSemesterConstraints($preferences);
            
            // Group courses by priority
            $prioritizedCourses = $this->prioritizeCourses($courses);
            
            $courseInfo = "";
            foreach ($prioritizedCourses as $c) {
                $weakTopics = is_array($c['weak_topics'] ?? []) ? implode(', ', array_slice($c['weak_topics'], 0, 3)) : 'None';
                $courseInfo .= "### {$c['title']} ({$c['code']})\n- Score: {$c['score']}%\n- Bulkiness (Content Length): {$c['bulkiness']} characters\n- Credit Units: {$c['credit_unit']}\n- Key Weak Topics: {$weakTopics}\n\n";
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

            $prompt = "You are an expert academic planner. Create a study plan for a student taking multiple courses for a semester that lasts {$semesterWeeks} weeks total.
            The student is currently in **Week {$currentWeek}** and wants a plan starting from this week until the end of the semester.

            COURSES & METADATA:
            {$courseInfo}

            {$testInfo}

            STRICT RULES:
            1. Create a week-by-week plan starting from Week {$currentWeek} up to Week {$semesterWeeks}.
            2. Prioritize courses with HIGHER credit units, LOWER scores, and HIGHER bulkiness.
            3. Include focused review weeks before each test.
            4. Distribute content evenly with realistic weekly study hours: {$preferences['study_hours']} hours.
            5. For each course per week, set 'reading_summary' to 'TBD' and 'pages_to_read' to 'TBD'. We will generate these later.
            6. CRITICAL: For EVERY WEEK, the `courses` array MUST contain an object for EVERY SINGLE COURSE listed above.
            7. CRITICAL: Return MINIFIED JSON.
            8. Keep all `topics` and `tasks` string arrays extremely concise. Provide exactly 3 to 4 `tasks` per course.
            9. Return JSON strictly matching this structure:
               {\"week_1\":{\"courses\":[{\"course\":\"First Course Name\",\"reading_summary\":\"TBD\",\"topics\":[\"Topic 1\"],\"pages_to_read\":\"TBD\",\"tasks\":[\"Task 1\"],\"estimated_hours\":2},...],\"weekly_objectives\":[\"Objective 1\"],\"total_study_hours\":15,\"is_test_week\":false}}
            10. For test weeks, reduce study hours by 50% and focus on review.
            11. Constraints: {$constraints}";

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
     * Generates a detailed, week-by-week reading plan for a specific course,
     * mapped to the user's actual study timetable days.
     */
    public function generateDetailedReadingPlan(array $courseData, int $totalWeeks, array $dailyScheduleMap)
    {
        try {
            $content = $courseData['full_content'] ?? '';
            if (empty($content)) {
                $content = "Course topics: " . implode(', ', $courseData['topics'] ?? []);
            }

            $contentExcerpt = substr($content, 0, 150000);

            \Log::info('AI Service: Generating detailed reading plan with daily breakdown', [
                'course' => $courseData['title'],
                'weeks' => $totalWeeks,
                'schedule_weeks' => count($dailyScheduleMap)
            ]);

            $scheduleContext = "";
            foreach ($dailyScheduleMap as $weekKey => $days) {
                $dayList = implode(', ', array_keys($days));
                $scheduleContext .= "- {$weekKey}: Scheduled on {$dayList}\n";
            }

            $prompt = "You are an expert academic strategist. Your goal is to create a robust, highly detailed study plan for the following course, STRICTLY following the user's Master Timetable schedule provided below.

            COURSE: {$courseData['title']} ({$courseData['code']})
            TOTAL DURATION: {$totalWeeks} weeks
            
            WEEKLY SCHEDULE (Days the student actually has time for this course):
            {$scheduleContext}

            CONTENT TO DIVIDE:
            \"\"\"{$contentExcerpt}\"\"\"

            STRICT RULES:
            1. Divide the provided course content logically across the scheduled days in each week.
            2. For each week, provide:
               - 'summary': A concise overview of the week's goal.
               - 'daily_segments': An object where keys are the days from the schedule (e.g., 'Monday', 'Wednesday') and values are the specific segments/chapters to read on THAT day.
               - 'tasks': A list of 2-3 specific action items for the week.
            3. The plan must ensure the student finishes the entire content by the end of week {$totalWeeks}.
            4. If a week has no scheduled days for this course, assign a 'General Review' segment to be done whenever possible.
            5. Return ONLY a valid JSON object.
            7. Ensure every day mentioned in the WEEKLY SCHEDULE for a given week has a corresponding entry in 'daily_segments'. Do not add any introductory or concluding text.";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt, 180));
            
            if (!$responseContent) {
                \Log::error('AI Service Detailed Reading Plan: Empty response');
                return null;
            }

            $planData = json_decode($responseContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('AI Service Detailed Reading Plan: JSON decode error', [
                    'error' => json_last_error_msg(),
                    'response' => substr($responseContent, 0, 1000)
                ]);
                return null;
            }

            return $planData;

        } catch (\Exception $e) {
            \Log::error('AI Service Detailed Reading Plan Failed: ' . $e->getMessage());
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
            // Higher credit units = higher priority
            $creditPriority = ($b['credit_unit'] ?? 1) <=> ($a['credit_unit'] ?? 1);
            if ($creditPriority !== 0) return $creditPriority;

            // Lower score = higher priority
            $scorePriority = $a['score'] <=> $b['score'];
            if ($scorePriority !== 0) return $scorePriority;
            
            // More bulkiness = higher priority
            return ($b['bulkiness'] ?? 0) <=> ($a['bulkiness'] ?? 0);
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

    public function generateDailyAdvice(string $text, array $topics)
    {
        $topicList = implode(', ', $topics);
        $prompt = "You are a friendly and encouraging academic tutor. I will provide a short excerpt from a student's reading material and the topics they should focus on today. 
        
        Your task:
        1. Provide 2-3 specific study suggestions or mnemonic tips for these topics.
        2. Give 1 sentence of 'Advice of the Day' based on the content.
        3. Maintain a motivating and concise tone.
        4. Format your response in clean Markdown (bullet points, bold text).
        5. Return ONLY the Markdown explanation, no JSON.

        TOPICS: {$topicList}
        EXTRACT: \"\"\"" . substr($text, 0, 2000) . "\"\"\"";

        $responseContent = $this->callGemini($prompt, 30, 1024, 'text/plain');
        return $this->cleanJsonResponse($responseContent) ?: "Focus on understanding the core concepts and try explaining them to someone else!";
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
        
        if (str_starts_with($cleaned, '"') && str_ends_with($cleaned, '"') && (!str_starts_with($cleaned, '{') && !str_starts_with($cleaned, '['))) {
            $cleaned = substr($cleaned, 1, -1);
            $cleaned = str_replace('\"', '"', $cleaned);
        }

        // Replace all literal newlines, carriage returns, and tabs with spaces.
        // This safely flattens the JSON string into one line, completely removing any 
        // unescaped control characters Gemini injects inside string values that cause json_decode to fail.
        $cleaned = str_replace(["\r", "\t", "\n"], ' ', $cleaned);
        
        // Strip any remaining invisible control characters (0-31 and 127)
        // This is a safety measure against non-printable characters.
        $cleaned = preg_replace('/[\x00-\x1F\x7F]/', '', $cleaned);
        
        return $cleaned;
    }

    public function callGemini($prompt, $timeout = 45, $maxOutputTokens = null, $mimeType = 'application/json') {
        // Token limit check removed - allowing full usage
        // if (!$this->allowUsage()) {
        //     \Log::warning('AI Service usage limit reached', [
        //         'user_id' => Auth::id(),
        //         'ip' => request()?->ip(),
        //     ]);
        //     return null;
        // }

        $requestId = (string) Str::uuid();
        $models = [self::PRIMARY_MODEL, (string) config('services.gemini.fallback_model', self::FALLBACK_MODEL)];

        try {
            $generationConfig = [
                'responseMimeType' => $mimeType, 
                'temperature' => 0.3,
            ];

            if ($maxOutputTokens) {
                $generationConfig['maxOutputTokens'] = $maxOutputTokens;
            }

            $payload = [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => $generationConfig,
            ];

            foreach ($models as $model) {
                for ($attempt = 1; $attempt <= 3; $attempt++) {
                    try {
                        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $this->apiKey;
                        $response = $this->client->post($apiUrl, [
                            'headers' => [
                                'Content-Type' => 'application/json',
                                'X-Request-Id' => $requestId,
                            ],
                            'json' => $payload,
                            'timeout' => $timeout,
                        ]);

                        $body = json_decode($response->getBody()->getContents(), true);

                        \Log::info('AI Service: Gemini API response received', [
                            'request_id' => $requestId,
                            'model' => $model,
                            'attempt' => $attempt,
                            'has_text' => isset($body['candidates'][0]['content']['parts'][0]['text']),
                            'response_keys' => array_keys($body),
                        ]);

                        if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                            return $body['candidates'][0]['content']['parts'][0]['text'];
                        }
                    } catch (ClientException $e) {
                        $responseBody = $e->getResponse()?->getBody()?->getContents();
                        \Log::warning('Gemini API client error', [
                            'request_id' => $requestId,
                            'model' => $model,
                            'attempt' => $attempt,
                            'error' => $responseBody,
                        ]);

                        if ($attempt === 3) {
                            break;
                        }
                    } catch (\Throwable $e) {
                        \Log::warning('Gemini API transient error', [
                            'request_id' => $requestId,
                            'model' => $model,
                            'attempt' => $attempt,
                            'error' => $e->getMessage(),
                        ]);
                    }

                    usleep(random_int(200000, 900000));
                }
            }

            \Log::warning('Gemini response did not contain expected text content after retries.', [
                'request_id' => $requestId,
            ]);
            return null;
        } catch (\Exception $e) {
            \Log::error('General network error calling Gemini: ' . $e->getMessage(), [
                'request_id' => $requestId,
            ]);
            $this->notifyAdminOfError($e, implode(', ', $models));
            return null;
        }
    }

    private function allowUsage(): bool
    {
        $limit = (int) config('services.gemini.daily_request_limit', 500);
        $userId = Auth::id();
        $key = $userId
            ? 'ai_usage:user:' . $userId . ':' . now()->toDateString()
            : 'ai_usage:ip:' . (request()?->ip() ?? 'unknown') . ':' . now()->toDateString();

        $count = Cache::increment($key);
        if ($count === 1) {
            Cache::put($key, 1, now()->endOfDay());
        }

        return $count <= $limit;
    }

    /**
     * Notify the administrator when an AI API error occurs.
     * Uses cache to throttle emails once every 30 minutes.
     */
    private function notifyAdminOfError(\Exception $e, string $model = 'Unknown')
    {
        $cacheKey = 'ai_api_error_notified';
        
        if (!Cache::has($cacheKey)) {
            try {
                Mail::to('yamojr001@gmail.com')->send(new AiApiErrorMail($e->getMessage(), $model));
                // Throttle for 30 minutes
                Cache::put($cacheKey, true, now()->addMinutes(30));
            } catch (\Exception $mailEx) {
                \Log::error('Failed to send AI API Error Email: ' . $mailEx->getMessage());
            }
        }
    }
    
    /**
     * Solves a past question's content and returns the answers.
     */
    public function solvePastQuestion(string $content)
    {
        $prompt = "You are an expert academic assistant. Below is the content of a past examination paper. Your task is to solve all the questions provided in the text. 
        
        RULES:
        1. Provide clear, accurate, and concise answers for every question identified.
        2. Format your response in a clear, readable Markdown format (e.g., Q1: Answer, Q2: Answer...).
        3. If there are multiple-choice questions, provide the correct option and a brief explanation if helpful.
        4. If there are essay questions, provide a comprehensive but concise model answer.
        5. Return ONLY the Markdown explanation text.

        EXAM CONTENT:
        \"\"\"{$content}\"\"\"";

        return $this->callGemini($prompt, 60, 8192, 'text/plain');
    }

    /**
     * Solves a past question using Vision (Image/PDF) and optional text context.
     */
    public function solvePastQuestionWithVision(string $filePath, string $mimeType, ?string $additionalContext = null)
    {
        try {
            if (!file_exists($filePath)) return "Error: File not found for AI processing.";
            
            $base64Data = base64_encode(file_get_contents($filePath));
            $prompt = "You are an expert academic assistant. Analyze this examination paper (Image/PDF) and solve ALL the questions found within it.
            
            RULES:
            1. Extract every question accurately from the document.
            2. Provide clear, accurate, and concise answers for every question.
            3. Format your response in a clear, readable Markdown format (e.g., Q1: Answer, Q2: Answer...).
            4. If there are multiple-choice questions, provide the correct option and a brief explanation.
            5. If there are essay questions, provide a concise model answer.
            6. Return ONLY the Markdown answer text.";

            if ($additionalContext) {
                $prompt .= "\n\nAdditional Context/OCR Text: \"\"\"{$additionalContext}\"\"\"";
            }

            $requestId = (string) \Illuminate\Support\Str::uuid();
            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            ['inline_data' => [
                                'mime_type' => $mimeType,
                                'data' => $base64Data,
                            ]],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                    'maxOutputTokens' => 8192,
                ],
            ];

            $models = [self::PRIMARY_MODEL, (string) config('services.gemini.fallback_model', self::FALLBACK_MODEL)];
            foreach ($models as $model) {
                for ($attempt = 1; $attempt <= 3; $attempt++) {
                    try {
                        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $this->apiKey;
                        $response = $this->client->post($apiUrl, [
                            'headers' => [
                                'Content-Type' => 'application/json',
                                'X-Request-Id' => $requestId,
                            ],
                            'json' => $payload,
                            'timeout' => 120,
                        ]);

                        $body = json_decode($response->getBody()->getContents(), true);
                        if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                            return $body['candidates'][0]['content']['parts'][0]['text'];
                        }
                    } catch (\Throwable $e) {
                        \Log::warning('Multimodal solve retry failed', [
                            'request_id' => $requestId,
                            'model' => $model,
                            'attempt' => $attempt,
                            'error' => $e->getMessage(),
                        ]);
                    }
                    usleep(random_int(200000, 900000));
                }
            }

            return "Error: AI Solver failed to process the document after multiple attempts.";
        } catch (\Exception $e) {
            \Log::error('AI Service Multimodal Solve Failed: ' . $e->getMessage());
            $this->notifyAdminOfError($e, 'VisionSolve');
            return "Error: " . $e->getMessage();
        }
    }

    /**
     * Grades a user's submission for a past question.
     */
    public function gradePastQuestionSubmission(string $examContent, array $userAnswers)
    {
        $userSubmissionText = "";
        foreach ($userAnswers as $index => $answer) {
            $userSubmissionText .= "Question " . ($index + 1) . ": " . $answer . "\n";
        }

        $prompt = "You are an expert professor grading a student's submission for a past exam. 
        
        EXAM CONTENT:
        \"\"\"{$examContent}\"\"\"

        STUDENT SUBMISSION:
        \"\"\"{$userSubmissionText}\"\"\"

        TASK:
        1. Compare the student's answers with the correct solutions based on the exam content.
        2. Assign a score for each question (e.g., 5/5, 0/10).
        3. Provide the 'Correct Answer' for any question the student failed or partially failed.
        4. Calculate an overall score.
        5. Return your response as a valid JSON object with the following structure:
           {
             \"overall_score\": \"85/100\",
             \"results\": [
               {
                 \"question_number\": 1,
                 \"status\": \"scored\",
                 \"user_answer\": \"...\",
                 \"correct_answer\": \"...\",
                 \"score\": \"5/5\",
                 \"feedback\": \"...\"
               },
               {
                 \"question_number\": 2,
                 \"status\": \"fail\",
                 \"user_answer\": \"...\",
                 \"correct_answer\": \"...\",
                 \"score\": \"0/10\",
                 \"feedback\": \"...\"
               }
             ]
           }

        IMPORTANT: Return ONLY the JSON object.";

        $response = $this->callGemini($prompt, 90, 8192, 'application/json');
        return json_decode($this->cleanJsonResponse($response), true);
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

    public function explainText(string $text)
    {
        try {
            $prompt = "You are an expert academic tutor. Explain the following text in a way that is easy to understand for a university student. Keep the explanation concise but thorough. 
            
            TEXT:
            \"{$text}\"
            
            Return ONLY the explanation text.";

            return $this->callGemini($prompt, 60, null, 'text/plain');
        } catch (\Exception $e) {
            \Log::error('AI Service Explain Text Failed: ' . $e->getMessage());
            $this->notifyAdminOfError($e, 'ExplainText');
            return null;
        }
    }

    public function generateMiniTest(string $content, int $count = 10)
    {
        try {
            $prompt = "You are an expert exam generator. Based on the following COURSE CONTENT, create a {$count}-question mini-test for a university student.
            
            TYPES OF QUESTIONS:
            - Multiple Choice (Objective)
            - Fill-in-the-blank
            - Short Essay/Explanation
            
            JSON RULES:
            - Return a single valid JSON object with a key 'questions'.
            - Each question object must have: 
                - 'type': ('objective', 'fill_in', 'essay')
                - 'question': The question text
                - 'options': array of 4 strings (only for objective)
                - 'correct_answer_index': integer (only for objective)
                - 'correct_answer': string (for fill_in and objective)
            - Do not add any introductory or concluding text. Return ONLY the JSON.
            
            COURSE CONTENT:
            \"" . substr($content, 0, 80000) . "\"";

            $responseContent = $this->cleanJsonResponse($this->callGemini($prompt, 120));
            $data = json_decode($responseContent, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                \Log::error('AI Service Mini Test JSON Decode Error: ' . json_last_error_msg());
                return null;
            }

            return $data;
        } catch (\Exception $e) {
            \Log::error('AI Service Mini Test Generation Failed: ' . $e->getMessage());
            $this->notifyAdminOfError($e, 'MiniTest');
            return null;
        }
    }
}
