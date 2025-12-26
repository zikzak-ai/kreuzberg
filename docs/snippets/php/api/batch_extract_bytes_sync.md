```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\batch_extract_bytes;

/**
 * Batch extract content from multiple byte arrays.
 *
 * @var list<string> $files
 */
$files = ['doc1.pdf', 'doc2.docx'];

/** @var list<string> $dataList */
$dataList = [];
/** @var list<string> $mimeTypes */
$mimeTypes = [];

foreach ($files as $file) {
    $dataList[] = file_get_contents($file);
    $mimeTypes[] = str_ends_with($file, '.pdf')
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
}

$results = batch_extract_bytes($dataList, $mimeTypes);

foreach ($results as $i => $result) {
    $charCount = strlen($result->content);
    echo "Document " . ($i + 1) . ": {$charCount} characters\n";
}
```
