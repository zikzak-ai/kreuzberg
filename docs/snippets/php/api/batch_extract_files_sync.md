```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\batch_extract_files;

/**
 * Batch extract content from multiple files.
 *
 * @var list<string> $files
 */
$files = ['doc1.pdf', 'doc2.docx', 'doc3.pptx'];

$results = batch_extract_files($files);

foreach ($results as $i => $result) {
    $charCount = strlen($result->content);
    echo "File " . ($i + 1) . ": {$charCount} characters\n";
}
```
