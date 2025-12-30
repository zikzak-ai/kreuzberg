<?php

declare(strict_types=1);

namespace Kreuzberg\Config;

/**
 * Image extraction configuration.
 */
readonly class ImageExtractionConfig
{
    public function __construct(
        /**
         * Enable image extraction from documents.
         *
         * When enabled, images are extracted from documents and saved/processed
         * separately from text content. Extracted images can be further analyzed
         * or stored for later retrieval.
         *
         * @var bool
         * @default false
         */
        public bool $extractImages = false,

        /**
         * Perform OCR on extracted images.
         *
         * When enabled, extracted images are processed with OCR to extract any
         * text content they contain. Useful for images with embedded text,
         * diagrams with labels, or scanned images.
         *
         * @var bool
         * @default false
         */
        public bool $performOcr = false,

        /**
         * Minimum image width for extraction.
         *
         * Images narrower than this threshold are skipped during extraction.
         * Helps reduce noise from small decorative images while preserving
         * content-relevant images.
         *
         * Valid range: 1-unlimited pixels
         * Recommended values:
         * - 0-50: Extract small images and icons
         * - 50-200: Extract medium-sized images
         * - 200+: Extract only large, content-relevant images
         *
         * @var int|null
         * @default null (no minimum)
         */
        public ?int $minWidth = null,

        /**
         * Minimum image height for extraction.
         *
         * Images shorter than this threshold are skipped during extraction.
         * Combined with minWidth to filter based on image dimensions.
         *
         * Valid range: 1-unlimited pixels
         * Recommended values: Same as $minWidth for square aspect ratio filtering
         *
         * @var int|null
         * @default null (no minimum)
         */
        public ?int $minHeight = null,
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

        /** @var bool $performOcr */
        $performOcr = $data['perform_ocr'] ?? false;
        if (!is_bool($performOcr)) {
            /** @var bool $performOcr */
            $performOcr = (bool) $performOcr;
        }

        /** @var int|null $minWidth */
        $minWidth = $data['min_width'] ?? null;
        if ($minWidth !== null && !is_int($minWidth)) {
            /** @var int $minWidth */
            $minWidth = (int) $minWidth;
        }

        /** @var int|null $minHeight */
        $minHeight = $data['min_height'] ?? null;
        if ($minHeight !== null && !is_int($minHeight)) {
            /** @var int $minHeight */
            $minHeight = (int) $minHeight;
        }

        return new self(
            extractImages: $extractImages,
            performOcr: $performOcr,
            minWidth: $minWidth,
            minHeight: $minHeight,
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
            'perform_ocr' => $this->performOcr,
            'min_width' => $this->minWidth,
            'min_height' => $this->minHeight,
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
