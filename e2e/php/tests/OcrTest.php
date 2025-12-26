<?php

declare(strict_types=1);

// Auto-generated tests for ocr fixtures.

namespace E2EPhp\Tests;

use E2EPhp\Helpers;
use Kreuzberg\Kreuzberg;
use PHPUnit\Framework\TestCase;

class OcrTest extends TestCase
{
    /**
     * PNG image with visible English text for OCR validation.
     */
    public function test_ocr_image_hello_world(): void
    {
        $documentPath = Helpers::resolveDocument('images/test_hello_world.png');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping ocr_image_hello_world: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(['force_ocr' => true, 'ocr' => ['backend' => 'tesseract', 'language' => 'eng']]);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['image/png']);
        Helpers::assertMinContentLength($result, 5);
        Helpers::assertContentContainsAny($result, ['hello', 'world']);
    }

    /**
     * Image with no text to ensure OCR handles empty results gracefully.
     */
    public function test_ocr_image_no_text(): void
    {
        $documentPath = Helpers::resolveDocument('images/flower_no_text.jpg');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping ocr_image_no_text: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(['force_ocr' => true, 'ocr' => ['backend' => 'tesseract', 'language' => 'eng']]);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['image/jpeg']);
        Helpers::assertMaxContentLength($result, 200);
    }

    /**
     * Image-only German PDF requiring OCR to extract text.
     */
    public function test_ocr_pdf_image_only_german(): void
    {
        $documentPath = Helpers::resolveDocument('pdfs/image_only_german_pdf.pdf');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping ocr_pdf_image_only_german: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(['force_ocr' => true, 'ocr' => ['backend' => 'tesseract', 'language' => 'eng']]);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['application/pdf']);
        Helpers::assertMinContentLength($result, 20);
        Helpers::assertMetadataExpectation($result, 'format_type', ['eq' => 'pdf']);
    }

    /**
     * Rotated page PDF requiring OCR to verify orientation handling.
     */
    public function test_ocr_pdf_rotated_90(): void
    {
        $documentPath = Helpers::resolveDocument('pdfs/ocr_test_rotated_90.pdf');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping ocr_pdf_rotated_90: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(['force_ocr' => true, 'ocr' => ['backend' => 'tesseract', 'language' => 'eng']]);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['application/pdf']);
        Helpers::assertMinContentLength($result, 10);
    }

    /**
     * Scanned PDF requires OCR to extract text.
     */
    public function test_ocr_pdf_tesseract(): void
    {
        $documentPath = Helpers::resolveDocument('pdfs/ocr_test.pdf');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping ocr_pdf_tesseract: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(['force_ocr' => true, 'ocr' => ['backend' => 'tesseract', 'language' => 'eng']]);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['application/pdf']);
        Helpers::assertMinContentLength($result, 20);
        Helpers::assertContentContainsAny($result, ['Docling', 'Markdown', 'JSON']);
    }

}
