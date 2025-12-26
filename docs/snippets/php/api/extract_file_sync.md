```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\extract_file;

/**
 * Extract content from a file.
 */
$result = extract_file('document.pdf');

echo "Content length: " . strlen($result->content) . " characters\n";
echo "Tables: " . count($result->tables) . "\n";
echo "Metadata keys: " . implode(', ', array_keys((array) $result->metadata)) . "\n";
```
