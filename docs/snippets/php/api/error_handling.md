```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\extract_file;
use Kreuzberg\Exceptions\KreuzbergException;

/**
 * Error handling for document extraction.
 */
try {
    $result = extract_file('document.pdf');
    echo $result->content;
} catch (KreuzbergException $e) {
    // Extract error code to determine error type
    $errorType = match ($e->getCode()) {
        1 => 'Validation Error',
        2 => 'Parsing Error',
        3 => 'OCR Error',
        4 => 'Missing Dependency',
        5 => 'I/O Error',
        6 => 'Plugin Error',
        7 => 'Unsupported Format',
        default => 'Extraction Error',
    };

    echo "{$errorType}: {$e->getMessage()}\n";
} catch (\Throwable $e) {
    echo "System error: {$e->getMessage()}\n";
}
```
