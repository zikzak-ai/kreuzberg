<?php

declare(strict_types=1);

namespace Kreuzberg\Config;

/**
 * Image preprocessing configuration for OCR.
 */
readonly class ImagePreprocessingConfig
{
    public function __construct(
        /**
         * Target DPI for image upscaling/downscaling.
         *
         * Adjusts image resolution to the specified dots-per-inch.
         * Higher DPI improves OCR accuracy but increases processing time.
         * Typically 150-300 DPI is optimal for OCR.
         *
         * Valid range: 1-600 DPI (practical range: 50-600)
         * Recommended values:
         * - 100-150: For good OCR, lower processing overhead
         * - 200-300: Standard for high-quality OCR
         * - 400+: Maximum quality OCR, requires more computation
         *
         * @var int|null
         * @default null (no DPI adjustment)
         */
        public ?int $targetDpi = null,

        /**
         * Automatically detect and correct image rotation.
         *
         * When enabled, attempts to detect if the image is rotated and
         * automatically corrects the orientation. Improves OCR accuracy
         * for images captured at different angles.
         *
         * @var bool
         * @default false
         */
        public bool $autoRotate = false,

        /**
         * Correct image skew (perspective distortion).
         *
         * When enabled, detects and corrects slight skewing or perspective
         * distortion in scanned documents. Improves OCR accuracy for
         * imperfectly scanned or photographed documents.
         *
         * @var bool
         * @default false
         */
        public bool $deskew = false,

        /**
         * Binarization method for converting images to black and white.
         *
         * Converts grayscale/color images to binary (black and white) for
         * improved OCR accuracy. Different methods work better for different
         * document types and lighting conditions.
         *
         * Common methods:
         * - 'otsu': Otsu's method (global threshold, good for balanced documents)
         * - 'sauvola': Local adaptive method (good for varying lighting)
         * - 'niblack': Niblack's method (sensitive local thresholding)
         * - 'bernsen': Bernsen's method (contrast-based local thresholding)
         * - null: Skip binarization, use grayscale
         *
         * @var string|null
         * @default null (no binarization)
         */
        public ?string $binarizationMethod = null,

        /**
         * Apply noise reduction/denoising to images.
         *
         * When enabled, reduces visual noise in images which can improve
         * OCR accuracy for low-quality scans. May slightly blur sharp edges.
         *
         * @var bool
         * @default false
         */
        public bool $denoise = false,

        /**
         * Apply sharpening filter to images.
         *
         * When enabled, enhances edges and details in the image to improve
         * text clarity for OCR. Useful for slightly blurry documents.
         * May amplify noise in low-quality scans.
         *
         * @var bool
         * @default false
         */
        public bool $sharpen = false,

        /**
         * Contrast adjustment multiplier.
         *
         * Multiplier for image contrast. Values > 1.0 increase contrast,
         * < 1.0 decrease contrast. Helps with low-contrast documents.
         *
         * Valid range: 0.1-5.0
         * Recommended values:
         * - 1.0: No change
         * - 1.2-1.5: Moderate contrast increase
         * - 1.5-2.0: Significant contrast increase for faded documents
         *
         * @var float|null
         * @default null (no adjustment)
         */
        public ?float $contrastAdjustment = null,

        /**
         * Brightness adjustment.
         *
         * Adds or subtracts brightness from the image. Positive values brighten,
         * negative values darken. Helps with images that are too dark or too light.
         *
         * Valid range: -100 to 100 (implementation dependent)
         * Recommended values:
         * - -10 to 10: Small adjustments
         * - -20 to 20: Moderate adjustments
         * - -50 to 50: Strong adjustments for very dark/light images
         *
         * @var float|null
         * @default null (no adjustment)
         */
        public ?float $brightnessAdjustment = null,
    ) {
    }

    /**
     * Create configuration from array data.
     *
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        /** @var int|null $targetDpi */
        $targetDpi = $data['target_dpi'] ?? null;
        if ($targetDpi !== null && !is_int($targetDpi)) {
            /** @var int $targetDpi */
            $targetDpi = (int) $targetDpi;
        }

        /** @var bool $autoRotate */
        $autoRotate = $data['auto_rotate'] ?? false;
        if (!is_bool($autoRotate)) {
            /** @var bool $autoRotate */
            $autoRotate = (bool) $autoRotate;
        }

        /** @var bool $deskew */
        $deskew = $data['deskew'] ?? false;
        if (!is_bool($deskew)) {
            /** @var bool $deskew */
            $deskew = (bool) $deskew;
        }

        /** @var string|null $binarizationMethod */
        $binarizationMethod = $data['binarization_method'] ?? null;
        if ($binarizationMethod !== null && !is_string($binarizationMethod)) {
            /** @var string $binarizationMethod */
            $binarizationMethod = (string) $binarizationMethod;
        }

        /** @var bool $denoise */
        $denoise = $data['denoise'] ?? false;
        if (!is_bool($denoise)) {
            /** @var bool $denoise */
            $denoise = (bool) $denoise;
        }

        /** @var bool $sharpen */
        $sharpen = $data['sharpen'] ?? false;
        if (!is_bool($sharpen)) {
            /** @var bool $sharpen */
            $sharpen = (bool) $sharpen;
        }

        /** @var float|null $contrastAdjustment */
        $contrastAdjustment = $data['contrast_adjustment'] ?? null;
        if ($contrastAdjustment !== null && !is_float($contrastAdjustment)) {
            /** @var float $contrastAdjustment */
            $contrastAdjustment = (float) $contrastAdjustment;
        }

        /** @var float|null $brightnessAdjustment */
        $brightnessAdjustment = $data['brightness_adjustment'] ?? null;
        if ($brightnessAdjustment !== null && !is_float($brightnessAdjustment)) {
            /** @var float $brightnessAdjustment */
            $brightnessAdjustment = (float) $brightnessAdjustment;
        }

        return new self(
            targetDpi: $targetDpi,
            autoRotate: $autoRotate,
            deskew: $deskew,
            binarizationMethod: $binarizationMethod,
            denoise: $denoise,
            sharpen: $sharpen,
            contrastAdjustment: $contrastAdjustment,
            brightnessAdjustment: $brightnessAdjustment,
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
            'target_dpi' => $this->targetDpi,
            'auto_rotate' => $this->autoRotate,
            'deskew' => $this->deskew,
            'binarization_method' => $this->binarizationMethod,
            'denoise' => $this->denoise,
            'sharpen' => $this->sharpen,
            'contrast_adjustment' => $this->contrastAdjustment,
            'brightness_adjustment' => $this->brightnessAdjustment,
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
