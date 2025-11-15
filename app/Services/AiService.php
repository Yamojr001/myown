<?php
// File: /app/Services/AiService.php (The Final, 100% Corrected Production Version)

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

    private function callGemini($prompt) {
        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $this->apiKey;

        try {
            $response = $this->client->post($apiUrl, [
                'headers' => ['Content-Type'  => 'application/json'],
                'json' => [
                    'contents' => [['parts' => [['text' => $prompt]]]],
                    'generationConfig' => ['responseMimeType' => 'application/json', 'temperature' => 0.3]
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            
           if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
        return $body['candidates'][0]['content']['parts'][0]['text'];
    }
            
            \Log::warning('Gemini response did not contain the expected text content path.', ['response' => $body]);
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