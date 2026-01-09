<?php

declare(strict_types=1);

namespace Kreuzberg\Types;

/**
 * Extracted keyword with score.
 *
 * @property-read string $text Keyword text
 * @property-read float $score Keyword relevance score (0.0 to 1.0)
 */
readonly class Keyword
{
    public function __construct(
        public string $text,
        public float $score,
    ) {
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        /** @var string $text */
        $text = $data['text'] ?? '';

        $score = 0.0;
        if (isset($data['score'])) {
            $value = $data['score'];
            if (is_numeric($value)) {
                $score = (float) $value;
            }
        }

        return new self(
            text: $text,
            score: $score,
        );
    }
}
