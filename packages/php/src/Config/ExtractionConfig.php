<?php

declare(strict_types=1);

namespace Kreuzberg\Config;

/**
 * Configuration for document extraction.
 *
 * @example
 * ```php
 * use Kreuzberg\Config\ExtractionConfig;
 * use Kreuzberg\Config\OcrConfig;
 * use Kreuzberg\Config\PdfConfig;
 * use Kreuzberg\Config\ChunkingConfig;
 *
 * $config = new ExtractionConfig(
 *     ocr: new OcrConfig(backend: 'tesseract', language: 'eng'),
 *     pdf: new PdfConfig(extractImages: true),
 *     chunking: new ChunkingConfig(maxChunkSize: 1000),
 * );
 * ```
 */
readonly class ExtractionConfig
{
    /**
     * Embedding generation configuration.
     *
     * Configures how text chunks are converted into embeddings (vector representations)
     * for semantic search and similarity matching.
     *
     * @var EmbeddingConfig|null
     * @default null
     */
    public ?EmbeddingConfig $embedding;

    /**
     * Keyword extraction configuration.
     *
     * Configures keyword extraction parameters such as maximum number of keywords
     * and minimum relevance score thresholds.
     *
     * @var KeywordConfig|null
     * @default null
     */
    public ?KeywordConfig $keyword;

    /**
     * Page extraction configuration.
     *
     * Configures page-level extraction options including page markers and format.
     *
     * @var PageConfig|null
     * @default null
     */
    public ?PageConfig $page;

    public function __construct(
        /**
         * OCR configuration.
         *
         * Configures Optical Character Recognition settings for scanned documents
         * and image-based PDFs. Includes backend selection, language, and Tesseract options.
         *
         * @var OcrConfig|null
         * @default null
         */
        public ?OcrConfig $ocr = null,

        /**
         * PDF extraction configuration.
         *
         * Configures PDF-specific extraction options like image extraction,
         * metadata extraction, OCR fallback, and page range selection.
         *
         * @var PdfConfig|null
         * @default null
         */
        public ?PdfConfig $pdf = null,

        /**
         * Text chunking configuration.
         *
         * Configures how extracted text is split into chunks for processing,
         * including chunk size, overlap, and boundary preservation options.
         *
         * @var ChunkingConfig|null
         * @default null
         */
        public ?ChunkingConfig $chunking = null,
        ?EmbeddingConfig $embedding = null,

        /**
         * Image extraction configuration.
         *
         * Configures image extraction parameters such as minimum dimensions
         * and whether to perform OCR on extracted images.
         *
         * @var ImageExtractionConfig|null
         * @default null
         */
        public ?ImageExtractionConfig $imageExtraction = null,
        ?PageConfig $page = null,

        /**
         * Language detection configuration.
         *
         * Configures automatic language detection for document content,
         * including confidence thresholds and maximum languages to detect.
         *
         * @var LanguageDetectionConfig|null
         * @default null
         */
        public ?LanguageDetectionConfig $languageDetection = null,
        ?KeywordConfig $keyword = null,

        /**
         * Enable image extraction from documents.
         *
         * When enabled, images will be extracted from PDFs and other document formats
         * and included in the extraction results.
         *
         * @var bool
         * @default false
         */
        public bool $extractImages = false,

        /**
         * Enable table extraction from documents.
         *
         * When enabled, tables will be detected and extracted from documents
         * with structured formatting preserved.
         *
         * @var bool
         * @default true
         */
        public bool $extractTables = true,

        /**
         * Preserve document formatting in extracted text.
         *
         * When enabled, attempts to preserve original document formatting
         * including indentation, spacing, and structure in the extracted text.
         *
         * @var bool
         * @default false
         */
        public bool $preserveFormatting = false,

        /**
         * Output format for extracted content.
         *
         * Specifies the format for the extracted content. Common values:
         * - 'text': Plain text format
         * - 'markdown': Markdown format with basic formatting
         * - 'html': HTML format with rich formatting
         *
         * @var string|null
         * @default null
         */
        public ?string $outputFormat = null,
        ?EmbeddingConfig $embeddings = null,
        ?KeywordConfig $keywords = null,
        ?PageConfig $pages = null,
    ) {
        // Support both 'embedding' and 'embeddings' parameter names
        $this->embedding = $embeddings ?? $embedding;
        // Support both 'keyword' and 'keywords' parameter names
        $this->keyword = $keywords ?? $keyword;
        // Support both 'page' and 'pages' parameter names
        $this->page = $pages ?? $page;
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

        /** @var bool $extractTables */
        $extractTables = $data['extract_tables'] ?? true;
        if (!is_bool($extractTables)) {
            /** @var bool $extractTables */
            $extractTables = (bool) $extractTables;
        }

        /** @var bool $preserveFormatting */
        $preserveFormatting = $data['preserve_formatting'] ?? false;
        if (!is_bool($preserveFormatting)) {
            /** @var bool $preserveFormatting */
            $preserveFormatting = (bool) $preserveFormatting;
        }

        /** @var string|null $outputFormat */
        $outputFormat = $data['output_format'] ?? null;
        if ($outputFormat !== null && !is_string($outputFormat)) {
            /** @var string $outputFormat */
            $outputFormat = (string) $outputFormat;
        }

        $ocr = null;
        if (isset($data['ocr']) && is_array($data['ocr'])) {
            /** @var array<string, mixed> $ocrData */
            $ocrData = $data['ocr'];
            $ocr = OcrConfig::fromArray($ocrData);
        }

        $pdf = null;
        if (isset($data['pdf']) && is_array($data['pdf'])) {
            /** @var array<string, mixed> $pdfData */
            $pdfData = $data['pdf'];
            $pdf = PdfConfig::fromArray($pdfData);
        }

        $chunking = null;
        if (isset($data['chunking']) && is_array($data['chunking'])) {
            /** @var array<string, mixed> $chunkingData */
            $chunkingData = $data['chunking'];
            $chunking = ChunkingConfig::fromArray($chunkingData);
        }

        $embedding = null;
        if (isset($data['embedding']) && is_array($data['embedding'])) {
            /** @var array<string, mixed> $embeddingData */
            $embeddingData = $data['embedding'];
            $embedding = EmbeddingConfig::fromArray($embeddingData);
        }

        $imageExtraction = null;
        if (isset($data['image_extraction']) && is_array($data['image_extraction'])) {
            /** @var array<string, mixed> $imageExtractionData */
            $imageExtractionData = $data['image_extraction'];
            $imageExtraction = ImageExtractionConfig::fromArray($imageExtractionData);
        }

        $page = null;
        if (isset($data['page']) && is_array($data['page'])) {
            /** @var array<string, mixed> $pageData */
            $pageData = $data['page'];
            $page = PageConfig::fromArray($pageData);
        }

        $languageDetection = null;
        if (isset($data['language_detection']) && is_array($data['language_detection'])) {
            /** @var array<string, mixed> $languageDetectionData */
            $languageDetectionData = $data['language_detection'];
            $languageDetection = LanguageDetectionConfig::fromArray($languageDetectionData);
        }

        $keyword = null;
        if (isset($data['keyword']) && is_array($data['keyword'])) {
            /** @var array<string, mixed> $keywordData */
            $keywordData = $data['keyword'];
            $keyword = KeywordConfig::fromArray($keywordData);
        }

        return new self(
            ocr: $ocr,
            pdf: $pdf,
            chunking: $chunking,
            embedding: $embedding,
            imageExtraction: $imageExtraction,
            page: $page,
            languageDetection: $languageDetection,
            keyword: $keyword,
            extractImages: $extractImages,
            extractTables: $extractTables,
            preserveFormatting: $preserveFormatting,
            outputFormat: $outputFormat,
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
     * Convert configuration to array for FFI.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'ocr' => $this->ocr?->toArray(),
            'pdf' => $this->pdf?->toArray(),
            'chunking' => $this->chunking?->toArray(),
            'embedding' => $this->embedding?->toArray(),
            'image_extraction' => $this->imageExtraction?->toArray(),
            'page' => $this->page?->toArray(),
            'language_detection' => $this->languageDetection?->toArray(),
            'keyword' => $this->keyword?->toArray(),
            'extract_images' => $this->extractImages,
            'extract_tables' => $this->extractTables,
            'preserve_formatting' => $this->preserveFormatting,
            'output_format' => $this->outputFormat,
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

    /**
     * Create a new configuration builder instance.
     *
     * @return ExtractionConfigBuilder A builder for creating ExtractionConfig instances
     */
    public static function builder(): ExtractionConfigBuilder
    {
        return new ExtractionConfigBuilder();
    }
}
