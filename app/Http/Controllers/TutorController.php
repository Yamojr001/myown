<?php

namespace App\Http\Controllers;

use App\Services\AiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TutorController extends Controller
{
    public function explain(Request $request, AiService $aiService)
    {
        $request->validate([
            'text' => 'required|string|min:10',
        ]);

        Log::info('TutorController: Received text for explanation', [
            'text_length' => strlen($request->text),
            'text_preview' => substr($request->text, 0, 100)
        ]);

        $explanation = $aiService->tutorExplain($request->text);

        Log::info('TutorController: Generated explanation response', [
            'raw_response' => $explanation,
            'response_type' => gettype($explanation),
            'is_json' => json_decode($explanation) !== null
        ]);

        // Return as JSON response for Inertia
        return response()->json([
            'explanation' => $explanation
        ]);
    }
}