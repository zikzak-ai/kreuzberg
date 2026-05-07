<?php
// E2E test runner that configures the PHP extension before running tests
// The bootstrap.php will load the extension via require_once once phpunit starts

// Run PHPUnit normally; bootstrap.php will load the extension
$phpunit = __DIR__ . '/vendor/bin/phpunit';
passthru($phpunit, $ret);
exit($ret);
