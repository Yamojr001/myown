<?php
// File: /public/check_models.php

// Bootstrap the Laravel application to access the config
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

// Get the API key from your configuration
$apiKey = config('services.gemini.api_key');

if (empty($apiKey)) {
    die("<h1>Error</h1><p>Your GEMINI_API_KEY is not set in your .env file or the config is cached. Please run `php artisan config:clear` and try again.</p>");
}

// The endpoint to list available models
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models?key=" . $apiKey;

$client = new \GuzzleHttp\Client();

header('Content-Type: text/plain'); // Set header to plain text for clean output

echo "--- PREPAI MODEL DIAGNOSTIC TOOL ---\n\n";
echo "Attempting to list models for your API key...\n";

try {
    $response = $client->get($apiUrl);
    $body = json_decode($response->getBody()->getContents(), true);
    
    echo "SUCCESS: Google's server responded. Here is the list of models your key has access to:\n\n";
    
    $foundModel = false;
    foreach ($body['models'] as $model) {
        // We only care about models that can actually generate content for us
        if (in_array('generateContent', $model['supportedGenerationMethods'])) {
            echo "------------------------------------------------------\n";
            echo "VALID MODEL FOUND:\n";
            echo "  Name: " . $model['name'] . "\n";
            echo "  Description: " . $model['description'] . "\n\n";
            $foundModel = true;
        }
    }
    
    if (!$foundModel) {
        echo "\nERROR: No models supporting 'generateContent' were found for this API key. The key might be restricted or for a different service.";
    } else {
         echo "------------------------------------------------------\n";
         echo "\nACTION REQUIRED:\n";
         echo "1. Choose one of the 'Name' values from the list above (e.g., 'models/gemini-pro-vision').\n";
         echo "2. Open your '/app/Services/AiService.php' file.\n";
         echo "3. Find the 'callGemini' function.\n";
         echo "4. Replace the current model name in the URL with the one you chose. For example, change 'models/gemini-pro' to 'models/gemini-pro-vision'.\n";
    }

} catch (\Exception $e) {
    echo "ERROR: The API call failed.\n";
    echo "Message: " . $e->getMessage() . "\n";
}