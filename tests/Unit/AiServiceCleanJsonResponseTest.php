<?php

namespace Tests\Unit;

use App\Services\AiService;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AiServiceCleanJsonResponseTest extends TestCase
{
    #[Test]
    public function it_cleans_markdown_wrapped_json(): void
    {
        config(['services.gemini.api_key' => 'test-key']);

        $service = new AiService();
        $raw = "```json\n{\n\"key\":\"value\"\n}\n```";
        $cleaned = $service->cleanJsonResponse($raw);

        $this->assertSame('{ "key":"value" }', preg_replace('/\s+/', ' ', $cleaned));
    }
}
