<?php

declare(strict_types=1);

// Auto-generated tests for html fixtures.

namespace E2EPhp\Tests;

use E2EPhp\Helpers;
use Kreuzberg\Kreuzberg;
use PHPUnit\Framework\TestCase;

class HtmlTest extends TestCase
{
    /**
     * Large Wikipedia HTML page to validate complex conversion.
     */
    public function test_html_complex_layout(): void
    {
        $documentPath = Helpers::resolveDocument('web/taylor_swift.html');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping html_complex_layout: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(null);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['text/html']);
        Helpers::assertMinContentLength($result, 1000);
    }

    /**
     * HTML table converted to markdown should retain structure.
     */
    public function test_html_simple_table(): void
    {
        $documentPath = Helpers::resolveDocument('web/simple_table.html');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping html_simple_table: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(null);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['text/html']);
        Helpers::assertMinContentLength($result, 100);
        Helpers::assertContentContainsAll($result, ['Product', 'Category', 'Price', 'Stock', 'Laptop', 'Electronics', 'Sample Data Table']);
    }

}
