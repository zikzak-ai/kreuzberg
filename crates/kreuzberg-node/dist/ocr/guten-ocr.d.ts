import { OcrBackendProtocol } from '../types.js';

/**
 * Guten OCR backend for document OCR processing.
 *
 * This module provides integration with @gutenye/ocr-node for optical character recognition.
 * Guten OCR uses PaddleOCR models via ONNX Runtime for high-performance text extraction.
 *
 * @module ocr/guten-ocr
 */

/**
 * Guten OCR backend for OCR processing.
 *
 * This backend uses @gutenye/ocr-node for text extraction from images.
 * It uses PaddleOCR models via ONNX Runtime for efficient processing.
 *
 * ## Installation
 *
 * Install the optional dependency:
 * ```bash
 * npm install @gutenye/ocr-node
 * # or
 * pnpm add @gutenye/ocr-node
 * # or
 * bun add @gutenye/ocr-node
 * ```
 *
 * ## Usage
 *
 * ```typescript
 * import { GutenOcrBackend } from '@kreuzberg/node/ocr/guten-ocr';
 * import { registerOcrBackend, extractFile } from '@kreuzberg/node';
 *
 * // Create and register the backend
 * const backend = new GutenOcrBackend();
 * await backend.initialize();
 * registerOcrBackend(backend);
 *
 * // Extract with OCR enabled
 * const result = await extractFile('scanned.pdf', null, {
 *   ocr: { backend: 'guten-ocr', language: 'en' },
 * });
 * console.log(result.content);
 * ```
 *
 * ## Supported Languages
 *
 * Guten OCR supports multiple languages via different model configurations.
 * The default models support English ("en") and Chinese ("ch_sim", "ch_tra").
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const backend = new GutenOcrBackend();
 * await backend.initialize();
 *
 * // Custom model configuration
 * const customBackend = new GutenOcrBackend({
 *   models: {
 *     detectionPath: './models/detection.onnx',
 *     recognitionPath: './models/recognition.onnx',
 *     dictionaryPath: './models/dict.txt'
 *   }
 * });
 * await customBackend.initialize();
 * ```
 */
declare class GutenOcrBackend implements OcrBackendProtocol {
    private ocr;
    private ocrModule;
    private options?;
    /**
     * Create a new Guten OCR backend.
     *
     * @param options - Optional configuration for Guten OCR
     * @param options.models - Custom model paths (default: uses bundled models)
     * @param options.isDebug - Enable debug mode (default: false)
     * @param options.debugOutputDir - Directory for debug output (default: undefined)
     * @param options.onnxOptions - Custom ONNX Runtime options (default: undefined)
     *
     * @example
     * ```typescript
     * // Default configuration
     * const backend = new GutenOcrBackend();
     *
     * // With debug enabled
     * const debugBackend = new GutenOcrBackend({
     *   isDebug: true,
     *   debugOutputDir: './ocr_debug'
     * });
     * ```
     */
    constructor(options?: {
        models?: {
            detectionPath: string;
            recognitionPath: string;
            dictionaryPath: string;
        };
        isDebug?: boolean;
        debugOutputDir?: string;
        onnxOptions?: unknown;
    });
    /**
     * Get the backend name.
     *
     * @returns Backend name ("guten-ocr")
     */
    name(): string;
    /**
     * Get list of supported language codes.
     *
     * Guten OCR supports multiple languages depending on the model configuration.
     * The default models support English and Chinese.
     *
     * @returns Array of ISO 639-1/2 language codes
     */
    supportedLanguages(): string[];
    /**
     * Initialize the OCR backend.
     *
     * This method loads the Guten OCR module and creates an OCR instance.
     * Call this before using processImage().
     *
     * @throws {Error} If @gutenye/ocr-node is not installed
     * @throws {Error} If OCR initialization fails
     *
     * @example
     * ```typescript
     * const backend = new GutenOcrBackend();
     * await backend.initialize();
     * ```
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the backend and release resources.
     *
     * This method cleans up all resources associated with the backend,
     * including the GutenOCR instance and module references.
     *
     * @example
     * ```typescript
     * const backend = new GutenOcrBackend();
     * await backend.initialize();
     * // ... use backend ...
     * await backend.shutdown();
     * ```
     */
    shutdown(): Promise<void>;
    /**
     * Process image bytes and extract text using Guten OCR.
     *
     * This method:
     * 1. Decodes the image using sharp (if pixel data is needed) or passes bytes directly
     * 2. Runs OCR detection to find text regions
     * 3. Runs OCR recognition on each text region
     * 4. Returns extracted text with metadata
     *
     * @param imageBytes - Raw image data (PNG, JPEG, TIFF, etc.)
     * @param language - Language code (must be in supportedLanguages())
     * @returns Promise resolving to OCR result with content and metadata
     *
     * @throws {Error} If backend is not initialized
     * @throws {Error} If OCR processing fails
     *
     * @example
     * ```typescript
     * import { readFile } from 'fs/promises';
     *
     * const backend = new GutenOcrBackend();
     * await backend.initialize();
     *
     * const imageBytes = await readFile('scanned.png');
     * const result = await backend.processImage(imageBytes, 'en');
     * console.log(result.content);
     * console.log(result.metadata.confidence);
     * ```
     */
    processImage(imageBytes: Uint8Array | string, language: string): Promise<{
        content: string;
        mime_type: string;
        metadata: {
            width: number;
            height: number;
            confidence: number;
            text_regions: number;
            language: string;
        };
        tables: never[];
    }>;
}

export { GutenOcrBackend };
