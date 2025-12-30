<?php

declare(strict_types=1);

namespace Kreuzberg\Config;

/**
 * PDF extraction configuration.
 */
readonly class PdfConfig
{
    public function __construct(
        /**
         * Extract images from PDF documents.
         *
         * When enabled, images embedded in PDFs are extracted and included
         * in the extraction results. Extracted images can be saved to disk
         * or processed further.
         *
         * @var bool
         * @default false
         */
        public bool $extractImages = false,

        /**
         * Extract PDF metadata.
         *
         * When enabled, PDF metadata such as title, author, subject, keywords,
         * creation date, and modification date are extracted and included
         * in the results.
         *
         * @var bool
         * @default true
         */
        public bool $extractMetadata = true,

        /**
         * Use OCR as fallback for PDF extraction.
         *
         * When enabled, if standard text extraction fails or produces poor results,
         * OCR will be used as a fallback mechanism. Useful for scanned PDFs or
         * PDFs with text rendering issues.
         *
         * @var bool
         * @default false
         */
        public bool $ocrFallback = false,

        /**
         * Start page for extraction (1-indexed).
         *
         * Specifies the first page to extract from. Pages before this are skipped.
         * When combined with $endPage, allows extraction of page ranges.
         *
         * Valid range: 1-total pages
         * Examples:
         * - null: Start from the first page
         * - 5: Start from page 5, skipping pages 1-4
         *
         * @var int|null
         * @default null (start from first page)
         */
        public ?int $startPage = null,

        /**
         * End page for extraction (inclusive, 1-indexed).
         *
         * Specifies the last page to extract from. Pages after this are skipped.
         * When combined with $startPage, allows extraction of page ranges.
         *
         * Valid range: 1-total pages
         * Examples:
         * - null: Extract until the last page
         * - 10: Extract up to page 10, skipping pages 11+
         * - startPage=5, endPage=10: Extract only pages 5-10
         *
         * @var int|null
         * @default null (extract until last page)
         */
        public ?int $endPage = null,
    ) {
    }

    /**
     * Create configuration from array data.
     *
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        /** @var bool $extractImages */
        $extractImages = $data['extract_images'] ?? false;
        if (!is_bool($extractImages)) {
            /** @var bool $extractImages */
            $extractImages = (bool) $extractImages;
        }

        /** @var bool $extractMetadata */
        $extractMetadata = $data['extract_metadata'] ?? true;
        if (!is_bool($extractMetadata)) {
            /** @var bool $extractMetadata */
            $extractMetadata = (bool) $extractMetadata;
        }

        /** @var bool $ocrFallback */
        $ocrFallback = $data['ocr_fallback'] ?? false;
        if (!is_bool($ocrFallback)) {
            /** @var bool $ocrFallback */
            $ocrFallback = (bool) $ocrFallback;
        }

        /** @var int|null $startPage */
        $startPage = $data['start_page'] ?? null;
        if ($startPage !== null && !is_int($startPage)) {
            /** @var int $startPage */
            $startPage = (int) $startPage;
        }

        /** @var int|null $endPage */
        $endPage = $data['end_page'] ?? null;
        if ($endPage !== null && !is_int($endPage)) {
            /** @var int $endPage */
            $endPage = (int) $endPage;
        }

        return new self(
            extractImages: $extractImages,
            extractMetadata: $extractMetadata,
            ocrFallback: $ocrFallback,
            startPage: $startPage,
            endPage: $endPage,
        );
    }

    /**
     * Create configuration from JSON string.
     */
    public static function fromJson(string $json): self
    {
        $data = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \InvalidArgumentException('Invalid JSON: ' . json_last_error_msg());
        }
        if (!is_array($data)) {
            throw new \InvalidArgumentException('JSON must decode to an object/array');
        }
        /** @var array<string, mixed> $data */
        return self::fromArray($data);
    }

    /**
     * Create configuration from JSON file.
     */
    public static function fromFile(string $path): self
    {
        if (!file_exists($path)) {
            throw new \InvalidArgumentException("File not found: {$path}");
        }
        $contents = file_get_contents($path);
        if ($contents === false) {
            throw new \InvalidArgumentException("Unable to read file: {$path}");
        }
        return self::fromJson($contents);
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'extract_images' => $this->extractImages,
            'extract_metadata' => $this->extractMetadata,
            'ocr_fallback' => $this->ocrFallback,
            'start_page' => $this->startPage,
            'end_page' => $this->endPage,
        ], static fn ($value): bool => $value !== null);
    }

    /**
     * Convert configuration to JSON string.
     */
    public function toJson(): string
    {
        $json = json_encode($this->toArray(), JSON_PRETTY_PRINT);
        if ($json === false) {
            throw new \RuntimeException('Failed to encode configuration to JSON');
        }
        return $json;
    }
}
