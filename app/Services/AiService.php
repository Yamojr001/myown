<?php
// File: /app/Services/AiService.php

namespace App\Services;

use Smalot\PdfParser\Parser;
use GuzzleHttp\Exception\ClientException;

class AiService {
    private $apiKey;
    private $client;

    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
        $this->client = new \GuzzleHttp\Client();
    }
    
    public function extractTopicsFromPdf($pdfFilePath) {
        try {
            if (!file_exists($pdfFilePath)) return null;
            $parser = new Parser();
            $pdf = $parser->parseFile($pdfFilePath);
            $text = preg_replace('/\s+/', ' ', $pdf->getText());
            if (empty($text)) return null;
            
            $prompt = "Analyze the following text from a university course syllabus. Your task is to identify and extract the main learning topics or key subject modules. Return your response as a single, flat JSON array of strings. For example: [\"Topic A\", \"Topic B\", \"Advanced Topic C\"]. Do not add any introductory text, explanation, or markdown formatting like ```json. Your response must be ONLY the JSON array itself. Here is the syllabus text: " . $text;

            $responseContent = $this->callGemini($prompt);
            if ($responseContent === null) return null;
            
            $topics = json_decode($responseContent, true);
            return (json_last_error() === JSON_ERROR_NONE && is_array($topics)) ? $topics : null;
        } catch (\Exception $e) {
            \Log::error('AI Service PDF Extraction Failed: ' . $e->getMessage());
            return null;
        }
    }

    public function generateTestFromTopics(array $topics) {
        try {
            $topicList = implode(', ', $topics);
            $prompt = "You are a test generation assistant. Based on the following topics, create a 50-question multiple-choice test. For each question, provide: a 'question' string, an 'options' array of 4 unique strings, and a 'correct_answer_index' (an integer from 0 to 3). The topics should be covered evenly. Ensure the entire response is a single, valid JSON object with a key 'questions' which contains an array of these question objects. Do not add any other text or explanation. The topics are: " . $topicList;

            $responseContent = $this->callGemini($prompt);
            if ($responseContent === null) return null;

            $testData = json_decode($responseContent, true);
            return (json_last_error() === JSON_ERROR_NONE && isset($testData['questions']) && is_array($testData['questions'])) ? $testData : null;
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

            $responseContent = $this->callGemini($prompt);
            if ($responseContent === null) {
                \Log::error('AI Service: callGemini returned null for study guide');
                return null;
            }

            \Log::info('AI Service: Raw study guide response', ['response' => $responseContent]);

            // Try to decode the JSON response
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

     /**
     * Generates a weekly study timetable based on user preferences and constraints.
     */
    public function generateTimetable(array $weakTopics, array $preferences)
    {
        try {
            $weakTopicsList = implode(', ', $weakTopics);
            $constraints = $this->formatConstraints($preferences);

            $prompt = "You are an expert academic planner. Your task is to create a 7-day study timetable for a university student.

            RULES:
            1.  The student's weak topics are: [{$weakTopicsList}]. You MUST prioritize these topics, dedicating more time to them than others.
            2.  Follow all user-defined constraints and preferences precisely.
            3.  The output must be a single, valid JSON object with a key for each day of the week ('Monday', 'Tuesday', ..., 'Sunday').
            4.  The value for each day must be an array of 'study block' objects.
            5.  Each 'study block' object must have three keys: 'time' (a string, e.g., '09:00 - 11:00'), 'topic' (a string), and 'task' (a brief string, e.g., 'Review lecture notes' or 'Practice problems').
            6.  If a day has no study scheduled, the value should be an empty array [].
            7.  Do not include any text, explanation, or markdown formatting outside of the main JSON object.

            USER PREFERENCES & CONSTRAINTS:
            {$constraints}";

            $responseContent = $this->callGemini($prompt);
            if ($responseContent === null) return null;

            $scheduleData = json_decode($responseContent, true);

            return (json_last_error() === JSON_ERROR_NONE && is_array($scheduleData)) ? $scheduleData : null;

        } catch (\Exception $e) {
            \Log::error('AI Service Timetable Generation Failed: ' . $e->getMessage());
            return null;
        }
    }


     /**
     * Helper to format user preferences into a string for the AI prompt.
     */
    private function formatConstraints(array $preferences): string
    {
        $text = "- Preferred study time: {$preferences['preferred_time']}\n";
        $text .= "- Total study hours per week: {$preferences['study_hours']}\n";
        
        if ($preferences['has_custom_schedule'] && !empty($preferences['custom_schedules'])) {
            $text .= "- Custom Schedule Rules (must be followed):\n";
            foreach ($preferences['custom_schedules'] as $rule) {
                if (isset($rule['day'], $rule['availability'], $rule['start_time'], $rule['end_time'])) {
                    $verb = $rule['availability'] === 'available' ? 'ONLY study' : 'NEVER study';
                    $text .= "  - On {$rule['day']}, the user must {$verb} between {$rule['start_time']} and {$rule['end_time']}.\n";
                }
            }
        }
        return $text;
    }



    private function callGemini($prompt) {
        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $this->apiKey;

        try {
            $response = $this->client->post($apiUrl, [
                'headers' => ['Content-Type'  => 'application/json'],
                'json' => [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json', 
                        'temperature' => 0.3
                    ]
                ],
                'timeout' => 120,
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
            \Log::info('AI Service: Raw Gemini API response', ['body' => $body]);
            
            // Check the response structure more carefully
            if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                $textContent = $body['candidates'][0]['content']['parts'][0]['text'];
                \Log::info('AI Service: Extracted text content', ['text' => $textContent]);
                return $textContent;
            }
            
            \Log::warning('Gemini response did not contain the expected text content path.', [
                'available_keys' => array_keys($body),
                'candidates_structure' => isset($body['candidates']) ? array_keys($body['candidates'][0] ?? []) : 'no_candidates'
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
}