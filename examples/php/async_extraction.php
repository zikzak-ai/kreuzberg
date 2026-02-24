<?php

declare(strict_types=1);

/**
 * Async Extraction Example
 *
 * Demonstrates non-blocking document extraction using Kreuzberg's async API.
 * Async operations spawn work on a background Tokio thread pool and return
 * immediately with a pollable DeferredResult object.
 *
 * This example covers:
 * - Single file async extraction (OOP and procedural APIs)
 * - Non-blocking polling with isReady/tryGetResult
 * - Blocking wait with timeout
 * - Batch async extraction
 * - Concurrent async extractions
 *
 * @package Kreuzberg
 */

require_once __DIR__ . '/../../packages/php/vendor/autoload.php';

use Kreuzberg\Exceptions\KreuzbergException;
use Kreuzberg\Kreuzberg;
use function Kreuzberg\extract_file_async;
use function Kreuzberg\batch_extract_files_async;


echo "=== Example 1: Basic Async Extraction (OOP API) ===\n\n";

try {
    $kreuzberg = new Kreuzberg();

    // Start async extraction — returns immediately
    $deferred = $kreuzberg->extractFileAsync(__DIR__ . '/../sample-documents/sample.pdf');

    echo "Extraction started (non-blocking)...\n";

    // Poll until ready
    $attempts = 0;
    while (!$deferred->isReady() && $attempts < 1000) {
        usleep(1000); // 1ms
        $attempts++;
    }

    // Block until result is available
    $result = $deferred->getResult();

    echo "Content length: " . strlen($result->content) . " characters\n";
    echo "MIME type: {$result->mimeType}\n";
    echo "First 200 characters:\n";
    echo substr($result->content, 0, 200) . "...\n\n";

} catch (KreuzbergException $e) {
    echo "Error: {$e->getMessage()}\n\n";
}


echo "=== Example 2: Async Extraction (Procedural API) ===\n\n";

try {
    $deferred = extract_file_async(__DIR__ . '/../sample-documents/sample.pdf');

    // Block until complete
    $result = $deferred->getResult();

    echo "Content length: " . strlen($result->content) . " characters\n\n";

} catch (KreuzbergException $e) {
    echo "Error: {$e->getMessage()}\n\n";
}


echo "=== Example 3: Non-Blocking tryGetResult ===\n\n";

try {
    $kreuzberg = new Kreuzberg();
    $deferred = $kreuzberg->extractFileAsync(__DIR__ . '/../sample-documents/sample.pdf');

    // Try to get result immediately (likely null for large files)
    $result = $deferred->tryGetResult();

    if ($result !== null) {
        echo "Result was immediately available: " . strlen($result->content) . " chars\n\n";
    } else {
        echo "Result not yet ready, waiting...\n";
        $result = $deferred->getResult();
        echo "Result received: " . strlen($result->content) . " chars\n\n";
    }

} catch (KreuzbergException $e) {
    echo "Error: {$e->getMessage()}\n\n";
}


echo "=== Example 4: Wait with Timeout ===\n\n";

try {
    $kreuzberg = new Kreuzberg();
    $deferred = $kreuzberg->extractFileAsync(__DIR__ . '/../sample-documents/sample.pdf');

    // Wait up to 5 seconds
    $result = $deferred->wait(5000);

    if ($result !== null) {
        echo "Extraction completed within timeout\n";
        echo "Content length: " . strlen($result->content) . " characters\n\n";
    } else {
        echo "Extraction timed out after 5 seconds\n\n";
    }

} catch (KreuzbergException $e) {
    echo "Error: {$e->getMessage()}\n\n";
}


echo "=== Example 5: Batch Async Extraction ===\n\n";

try {
    $files = [
        __DIR__ . '/../sample-documents/sample.pdf',
    ];

    $files = array_filter($files, 'file_exists');

    if (!empty($files)) {
        $kreuzberg = new Kreuzberg();

        $start = microtime(true);
        $deferred = $kreuzberg->batchExtractFilesAsync($files);

        echo "Batch extraction started for " . count($files) . " files...\n";

        // Wait with 30 second timeout
        $results = $deferred->waitBatch(30000);
        $elapsed = microtime(true) - $start;

        if ($results !== null) {
            echo "Completed in " . number_format($elapsed, 3) . " seconds\n\n";

            foreach ($results as $i => $result) {
                $filename = basename($files[$i]);
                echo "{$filename}: " . strlen($result->content) . " chars\n";
            }
        } else {
            echo "Batch extraction timed out\n";
        }
    }

    echo "\n";

} catch (KreuzbergException $e) {
    echo "Error: {$e->getMessage()}\n\n";
}


echo "=== Example 6: Concurrent Async Extractions ===\n\n";

try {
    $kreuzberg = new Kreuzberg();
    $sampleFile = __DIR__ . '/../sample-documents/sample.pdf';

    if (file_exists($sampleFile)) {
        // Launch multiple extractions concurrently
        $deferred1 = $kreuzberg->extractFileAsync($sampleFile);
        $deferred2 = $kreuzberg->extractFileAsync($sampleFile);

        echo "Two extractions launched concurrently...\n";

        // Both run in parallel on the Tokio thread pool
        $result1 = $deferred1->getResult();
        $result2 = $deferred2->getResult();

        echo "Extraction 1: " . strlen($result1->content) . " chars\n";
        echo "Extraction 2: " . strlen($result2->content) . " chars\n\n";
    }

} catch (KreuzbergException $e) {
    echo "Error: {$e->getMessage()}\n\n";
}


echo "=== Example 7: Procedural Batch Async ===\n\n";

try {
    $files = array_filter([
        __DIR__ . '/../sample-documents/sample.pdf',
    ], 'file_exists');

    if (!empty($files)) {
        $deferred = batch_extract_files_async($files);
        $results = $deferred->getResults();

        echo "Processed " . count($results) . " files\n";
        foreach ($results as $i => $result) {
            echo "  File {$i}: " . strlen($result->content) . " chars\n";
        }
    }

    echo "\n";

} catch (KreuzbergException $e) {
    echo "Error: {$e->getMessage()}\n\n";
}


echo "Done!\n";
