<?php

declare(strict_types=1);

// Auto-generated tests for image fixtures.

namespace E2EPhp\Tests;

use E2EPhp\Helpers;
use Kreuzberg\Kreuzberg;
use PHPUnit\Framework\TestCase;

class ImageTest extends TestCase
{
    /**
     * JPEG image to validate metadata extraction without OCR.
     */
    public function test_image_metadata_only(): void
    {
        $documentPath = Helpers::resolveDocument('images/example.jpg');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping image_metadata_only: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(['ocr' => null]);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['image/jpeg']);
        Helpers::assertMaxContentLength($result, 100);
    }

}
