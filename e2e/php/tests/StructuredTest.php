<?php

declare(strict_types=1);

// Auto-generated tests for structured fixtures.

namespace E2EPhp\Tests;

use E2EPhp\Helpers;
use Kreuzberg\Kreuzberg;
use PHPUnit\Framework\TestCase;

class StructuredTest extends TestCase
{
    /**
     * Structured JSON extraction should stream and preserve content.
     */
    public function test_structured_json_basic(): void
    {
        $documentPath = Helpers::resolveDocument('json/sample_document.json');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping structured_json_basic: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(null);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['application/json']);
        Helpers::assertMinContentLength($result, 20);
        Helpers::assertContentContainsAny($result, ['Sample Document', 'Test Author']);
    }

    /**
     * Simple JSON document to verify structured extraction.
     */
    public function test_structured_json_simple(): void
    {
        $documentPath = Helpers::resolveDocument('data_formats/simple.json');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping structured_json_simple: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(null);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['application/json']);
        Helpers::assertMinContentLength($result, 10);
        Helpers::assertContentContainsAny($result, ['{', 'name']);
    }

    /**
     * Simple YAML document to validate structured extraction.
     */
    public function test_structured_yaml_simple(): void
    {
        $documentPath = Helpers::resolveDocument('data_formats/simple.yaml');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping structured_yaml_simple: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(null);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['application/x-yaml']);
        Helpers::assertMinContentLength($result, 10);
    }

}
