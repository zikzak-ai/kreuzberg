```php title="PHP"
<?php

declare(strict_types=1);

/**
 * Error handling for HTTP client extraction requests.
 */
try {
    $ch = curl_init('http://localhost:8000/extract');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: multipart/form-data'],
    ]);

    $response = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($statusCode >= 400) {
        $error = json_decode($response, true);
        echo "Error: {$error['error_type']}: {$error['message']}\n";
    } else {
        $results = json_decode($response, true);
        // Process results
        foreach ($results as $result) {
            echo $result['content'] . "\n";
        }
    }
} catch (\Throwable $e) {
    echo "Request failed: {$e->getMessage()}\n";
}
```
