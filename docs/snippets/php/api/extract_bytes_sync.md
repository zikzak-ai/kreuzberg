```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\extract_bytes;

/**
 * Extract content from file bytes.
 */
$data = file_get_contents('document.pdf');

$result = extract_bytes(
    $data,
    'application/pdf'
);

echo $result->content;
```
