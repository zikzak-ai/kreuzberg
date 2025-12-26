<?php

declare(strict_types=1);

// Auto-generated tests for email fixtures.

namespace E2EPhp\Tests;

use E2EPhp\Helpers;
use Kreuzberg\Kreuzberg;
use PHPUnit\Framework\TestCase;

class EmailTest extends TestCase
{
    /**
     * Sample EML email file to verify email parsing.
     */
    public function test_email_sample_eml(): void
    {
        $documentPath = Helpers::resolveDocument('email/sample_email.eml');
        if (!file_exists($documentPath)) {
            $this->markTestSkipped('Skipping email_sample_eml: missing document at ' . $documentPath);
        }

        $config = Helpers::buildConfig(null);

        $kreuzberg = new Kreuzberg($config);
        $result = $kreuzberg->extractFile($documentPath);

        Helpers::assertExpectedMime($result, ['message/rfc822']);
        Helpers::assertMinContentLength($result, 20);
    }

}
