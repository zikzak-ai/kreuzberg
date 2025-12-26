```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\extract_file;
use Kreuzberg\Config\ExtractionConfig;
use Kreuzberg\Config\LanguageDetectionConfig;
use Kreuzberg\Config\TokenReductionConfig;
use Kreuzberg\Config\ChunkingConfig;
use Kreuzberg\Config\KeywordConfig;
use Kreuzberg\Config\EmbeddingConfig;

/**
 * Comprehensive extraction configuration combining multiple features.
 */
$config = new ExtractionConfig(
    enableQualityProcessing: true,
    languageDetection: new LanguageDetectionConfig(
        enabled: true,
        detectMultiple: true
    ),
    tokenReduction: new TokenReductionConfig(
        mode: 'moderate'
    ),
    chunking: new ChunkingConfig(
        maxChars: 512,
        maxOverlap: 50,
        embedding: new EmbeddingConfig(
            normalize: true
        )
    ),
    keywords: new KeywordConfig(
        algorithm: 'yake',
        maxKeywords: 10
    )
);

$result = extract_file('document.pdf', config: $config);

echo "Languages: " . implode(', ', $result->detectedLanguages ?? []) . "\n";
echo "Chunks: " . count($result->chunks ?? []) . "\n";
echo "Keywords: " . implode(', ', $result->keywords ?? []) . "\n";
echo "Content length: " . strlen($result->content) . " characters\n";
```
