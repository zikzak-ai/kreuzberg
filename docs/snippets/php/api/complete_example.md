```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\extract_file;
use Kreuzberg\Config\ExtractionConfig;
use Kreuzberg\Config\OcrConfig;
use Kreuzberg\Config\PdfConfig;
use Kreuzberg\Config\ImageExtractionConfig;
use Kreuzberg\Config\ChunkingConfig;
use Kreuzberg\Config\TokenReductionConfig;
use Kreuzberg\Config\LanguageDetectionConfig;
use Kreuzberg\Config\PostProcessorConfig;

/**
 * Complete example with all major configuration options.
 */
$config = new ExtractionConfig(
    useCache: true,
    enableQualityProcessing: true,
    forceOcr: false,
    ocr: new OcrConfig(
        backend: 'tesseract',
        language: 'eng+fra'
    ),
    pdf: new PdfConfig(
        extractImages: true,
        extractMetadata: true
    ),
    images: new ImageExtractionConfig(
        extractImages: true,
        targetDpi: 150,
        maxImageDimension: 4096
    ),
    chunking: new ChunkingConfig(
        maxChars: 1000,
        maxOverlap: 200
    ),
    tokenReduction: new TokenReductionConfig(
        mode: 'moderate'
    ),
    languageDetection: new LanguageDetectionConfig(
        enabled: true,
        minConfidence: 0.8
    ),
    postprocessor: new PostProcessorConfig(
        enabled: true
    )
);

$result = extract_file('document.pdf', config: $config);

echo "Content length: " . strlen($result->content) . "\n";
echo "Tables extracted: " . count($result->tables) . "\n";
echo "Images extracted: " . count($result->images ?? []) . "\n";
echo "Detected languages: " . implode(', ', $result->detectedLanguages ?? []) . "\n";
echo "Number of chunks: " . count($result->chunks ?? []) . "\n";
```
