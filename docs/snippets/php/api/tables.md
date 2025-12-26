```php title="PHP"
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use function Kreuzberg\extract_file;

/**
 * Extract and process tables from documents.
 */
$result = extract_file('document.pdf');

foreach ($result->tables as $table) {
    $rowCount = count($table->cells);
    echo "Table with {$rowCount} rows\n";
    echo "Page: {$table->pageNumber}\n";
    echo $table->markdown . "\n\n";
}
```
