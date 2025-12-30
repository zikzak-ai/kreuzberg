<?php

declare(strict_types=1);

namespace Kreuzberg\Config;

/**
 * Text chunking configuration.
 */
readonly class ChunkingConfig
{
    public function __construct(
        /**
         * Maximum size of text chunks in tokens or characters.
         *
         * Defines the maximum number of tokens (for token-based chunking) or characters
         * (for character-based chunking) per chunk. Larger chunks retain more context
         * but may be too long for some downstream processing.
         *
         * Valid range: 1-unlimited (practical range: 128-4096)
         * Recommended values:
         * - 256-512: For short documents or limited context windows
         * - 512-1024: For standard documents and embeddings
         * - 1024-2048: For longer documents requiring more context
         *
         * @var int
         * @default 512
         */
        public int $maxChunkSize = 512,

        /**
         * Number of tokens/characters to overlap between consecutive chunks.
         *
         * Overlap ensures context continuity between chunks by repeating some text
         * at the boundaries. This helps maintain semantic coherence when chunks
         * are processed independently.
         *
         * Valid range: 0-$maxChunkSize
         * Recommended values:
         * - 0-10%: For minimal overlap
         * - 10-25%: For standard overlap (typically 50 tokens for 512-token chunks)
         * - 25-50%: For high overlap when context preservation is critical
         *
         * @var int
         * @default 50
         */
        public int $chunkOverlap = 50,

        /**
         * Respect sentence boundaries when creating chunks.
         *
         * When enabled, chunks will not split in the middle of sentences.
         * This ensures that no sentence is broken across multiple chunks,
         * maintaining semantic integrity. Actual chunk size may vary slightly
         * to preserve complete sentences.
         *
         * @var bool
         * @default true
         */
        public bool $respectSentences = true,

        /**
         * Respect paragraph boundaries when creating chunks.
         *
         * When enabled, chunks will avoid splitting paragraphs.
         * This preserves thematic grouping and context within the document.
         * May result in variable chunk sizes to maintain paragraph integrity.
         *
         * @var bool
         * @default true
         */
        public bool $respectParagraphs = true,
    ) {
    }

    /**
     * Create configuration from array data.
     *
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        /** @var int $maxChunkSize */
        $maxChunkSize = $data['max_chunk_size'] ?? 512;
        if (!is_int($maxChunkSize)) {
            /** @var int $maxChunkSize */
            $maxChunkSize = (int) $maxChunkSize;
        }

        /** @var int $chunkOverlap */
        $chunkOverlap = $data['chunk_overlap'] ?? 50;
        if (!is_int($chunkOverlap)) {
            /** @var int $chunkOverlap */
            $chunkOverlap = (int) $chunkOverlap;
        }

        /** @var bool $respectSentences */
        $respectSentences = $data['respect_sentences'] ?? true;
        if (!is_bool($respectSentences)) {
            /** @var bool $respectSentences */
            $respectSentences = (bool) $respectSentences;
        }

        /** @var bool $respectParagraphs */
        $respectParagraphs = $data['respect_paragraphs'] ?? true;
        if (!is_bool($respectParagraphs)) {
            /** @var bool $respectParagraphs */
            $respectParagraphs = (bool) $respectParagraphs;
        }

        return new self(
            maxChunkSize: $maxChunkSize,
            chunkOverlap: $chunkOverlap,
            respectSentences: $respectSentences,
            respectParagraphs: $respectParagraphs,
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
        return [
            'max_chunk_size' => $this->maxChunkSize,
            'chunk_overlap' => $this->chunkOverlap,
            'respect_sentences' => $this->respectSentences,
            'respect_paragraphs' => $this->respectParagraphs,
        ];
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
