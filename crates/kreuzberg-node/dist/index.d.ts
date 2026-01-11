import { PanicContext } from './errors.js';
export { CacheError, ErrorCode, ImageProcessingError, KreuzbergError, MissingDependencyError, OcrError, ParsingError, PluginError, ValidationError } from './errors.js';
import { ExtractionConfig as ExtractionConfig$1, ExtractionResult, PostProcessorProtocol, ValidatorProtocol, OcrBackendProtocol, ErrorClassification, WorkerPool, WorkerPoolStats } from './types.js';
export { ArchiveMetadata, Chunk, ChunkMetadata, ChunkingConfig, EmailMetadata, ErrorMetadata, ExcelMetadata, ExtractedImage, ExtractedKeyword, HeaderMetadata, HierarchyConfig, HtmlConversionOptions, HtmlImageMetadata, HtmlMetadata, HtmlPreprocessingOptions, ImageExtractionConfig, ImageMetadata, ImagePreprocessingMetadata, KeywordAlgorithm, KeywordConfig, LanguageDetectionConfig, LinkMetadata, Metadata, OcrConfig, OcrMetadata, PageBoundary, PageContent, PageExtractionConfig, PageInfo, PageStructure, PageUnitType, PdfConfig, PdfMetadata, PostProcessorConfig, PptxMetadata, ProcessingStage, RakeParams, StructuredData, Table, TesseractConfig, TextMetadata, TokenReductionConfig, XmlMetadata, YakeParams } from './types.js';
export { GutenOcrBackend } from './ocr/guten-ocr.js';

/**
 * Kreuzberg - Multi-language document intelligence framework.
 *
 * This is a TypeScript SDK around a high-performance Rust core.
 * All extraction logic, chunking, quality processing, and language detection
 * are implemented in Rust for maximum performance.
 *
 * ## API Usage Recommendations
 *
 * **For processing multiple documents**, prefer batch APIs:
 * - Use `batchExtractFiles()` / `batchExtractFilesSync()` for multiple files
 * - Use `batchExtractBytes()` / `batchExtractBytesSync()` for multiple byte arrays
 *
 * **Batch APIs provide**:
 * - Better performance (parallel processing in Rust)
 * - More reliable memory management
 * - Recommended for all multi-document workflows
 *
 * **Single extraction APIs** (`extractFile`, `extractBytes`) are suitable for:
 * - One-off document processing
 * - Interactive applications processing documents on-demand
 * - Avoid calling these in tight loops - use batch APIs instead
 *
 * ## Supported Formats
 *
 * - **Documents**: PDF, DOCX, PPTX, XLSX, DOC, PPT (with LibreOffice)
 * - **Text**: Markdown, Plain Text, XML
 * - **Web**: HTML (converted to Markdown)
 * - **Data**: JSON, YAML, TOML
 * - **Email**: EML, MSG
 * - **Images**: PNG, JPEG, TIFF (with OCR support)
 *
 * @example
 * ```typescript
 * import { extractFile, batchExtractFiles } from '@kreuzberg/node';
 *
 * // Single file extraction
 * const result = await extractFile('document.pdf');
 * console.log(result.content);
 *
 * // Multiple files (recommended approach)
 * const files = ['doc1.pdf', 'doc2.docx', 'doc3.xlsx'];
 * const results = await batchExtractFiles(files);
 * results.forEach(r => console.log(r.content));
 * ```
 */

/**
 * @internal Allows tests to provide a mocked native binding.
 */
declare function __setBindingForTests(mock: unknown): void;
/**
 * @internal Resets the cached native binding for tests.
 */
declare function __resetBindingForTests(): void;
/**
 * Extract content from a single file (synchronous).
 *
 * **Usage Note**: For processing multiple files, prefer `batchExtractFilesSync()` which
 * provides better performance and memory management.
 *
 * @param filePath - Path to the file to extract (string). Can be absolute or relative.
 * @param mimeType - Optional MIME type hint for format detection. If null, MIME type is auto-detected from file extension or content.
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns ExtractionResult containing extracted content, metadata, tables, and optional chunks/images
 * @throws {Error} If file doesn't exist, cannot be accessed, or cannot be read
 * @throws {ParsingError} When document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { extractFileSync } from '@kreuzberg/node';
 *
 * // Basic usage
 * const result = extractFileSync('document.pdf');
 * console.log(result.content);
 *
 * // With OCR configuration
 * const config = {
 *   ocr: {
 *     backend: 'tesseract',
 *     language: 'eng',
 *     tesseractConfig: {
 *       psm: 6,
 *       enableTableDetection: true,
 *     },
 *   },
 * };
 * const result2 = extractFileSync('scanned.pdf', null, config);
 * ```
 */
declare function extractFileSync(filePath: string, mimeTypeOrConfig?: string | null | ExtractionConfig$1, maybeConfig?: ExtractionConfig$1 | null): ExtractionResult;
/**
 * Extract content from a single file (asynchronous).
 *
 * **Usage Note**: For processing multiple files, prefer `batchExtractFiles()` which
 * provides better performance and memory management.
 *
 * @param filePath - Path to the file to extract (string). Can be absolute or relative.
 * @param mimeType - Optional MIME type hint for format detection. If null, MIME type is auto-detected from file extension or content.
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns Promise<ExtractionResult> containing extracted content, metadata, tables, and optional chunks/images
 * @throws {Error} If file doesn't exist, cannot be accessed, or cannot be read
 * @throws {ParsingError} When document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { extractFile } from '@kreuzberg/node';
 *
 * // Basic usage
 * const result = await extractFile('document.pdf');
 * console.log(result.content);
 *
 * // With chunking enabled
 * const config = {
 *   chunking: {
 *     maxChars: 1000,
 *     maxOverlap: 200,
 *   },
 * };
 * const result2 = await extractFile('long_document.pdf', null, config);
 * console.log(result2.chunks); // Array of text chunks
 * ```
 */
declare function extractFile(filePath: string, mimeTypeOrConfig?: string | null | ExtractionConfig$1, maybeConfig?: ExtractionConfig$1 | null): Promise<ExtractionResult>;
/**
 * Extract content from raw bytes (synchronous).
 *
 * **Usage Note**: For processing multiple byte arrays, prefer `batchExtractBytesSync()`
 * which provides better performance and memory management.
 *
 * @param data - File content as Uint8Array (Buffer will be converted)
 * @param mimeType - MIME type of the data (required for accurate format detection). Must be a valid MIME type string.
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns ExtractionResult containing extracted content, metadata, tables, and optional chunks/images
 * @throws {TypeError} When data is not a valid Uint8Array
 * @throws {Error} When file cannot be read or parsed
 * @throws {ParsingError} When document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { extractBytesSync } from '@kreuzberg/node';
 * import { readFileSync } from 'fs';
 *
 * const data = readFileSync('document.pdf');
 * const result = extractBytesSync(data, 'application/pdf');
 * console.log(result.content);
 * ```
 */
declare function extractBytesSync(dataOrPath: Uint8Array | string, mimeType: string, config?: ExtractionConfig$1 | null): ExtractionResult;
/**
 * Extract content from raw bytes (asynchronous).
 *
 * **Usage Note**: For processing multiple byte arrays, prefer `batchExtractBytes()`
 * which provides better performance and memory management.
 *
 * @param data - File content as Uint8Array (Buffer will be converted)
 * @param mimeType - MIME type of the data (required for accurate format detection). Must be a valid MIME type string.
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns Promise<ExtractionResult> containing extracted content, metadata, tables, and optional chunks/images
 * @throws {TypeError} When data is not a valid Uint8Array
 * @throws {Error} When file cannot be read or parsed
 * @throws {ParsingError} When document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { extractBytes } from '@kreuzberg/node';
 * import { readFile } from 'fs/promises';
 *
 * const data = await readFile('document.pdf');
 * const result = await extractBytes(data, 'application/pdf');
 * console.log(result.content);
 * ```
 */
declare function extractBytes(dataOrPath: Uint8Array | string, mimeType: string, config?: ExtractionConfig$1 | null): Promise<ExtractionResult>;
/**
 * Extract content from multiple files in parallel (synchronous).
 *
 * **Recommended for**: Processing multiple documents efficiently with better
 * performance and memory management compared to individual `extractFileSync()` calls.
 *
 * **Benefits**:
 * - Parallel processing in Rust for maximum performance
 * - Optimized memory usage across all extractions
 * - More reliable for batch document processing
 *
 * @param paths - List of file paths to extract (absolute or relative paths)
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns Array of ExtractionResults (one per file, in same order as input)
 * @throws {Error} If any file cannot be read or parsed
 * @throws {ParsingError} When any document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When any extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { batchExtractFilesSync } from '@kreuzberg/node';
 *
 * const files = ['doc1.pdf', 'doc2.docx', 'doc3.xlsx'];
 * const results = batchExtractFilesSync(files);
 *
 * results.forEach((result, i) => {
 *   console.log(`File ${files[i]}: ${result.content.substring(0, 100)}...`);
 * });
 * ```
 */
declare function batchExtractFilesSync(paths: string[], config?: ExtractionConfig$1 | null): ExtractionResult[];
/**
 * Extract content from multiple files in parallel (asynchronous).
 *
 * **Recommended for**: Processing multiple documents efficiently with better
 * performance and memory management compared to individual `extractFile()` calls.
 *
 * **Benefits**:
 * - Parallel processing in Rust for maximum performance
 * - Optimized memory usage across all extractions
 * - More reliable for batch document processing
 *
 * @param paths - List of file paths to extract (absolute or relative paths)
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns Promise resolving to array of ExtractionResults (one per file, in same order as input)
 * @throws {Error} If any file cannot be read or parsed
 * @throws {ParsingError} When any document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When any extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { batchExtractFiles } from '@kreuzberg/node';
 *
 * const files = ['invoice1.pdf', 'invoice2.pdf', 'invoice3.pdf'];
 * const results = await batchExtractFiles(files, {
 *   ocr: { backend: 'tesseract', language: 'eng' }
 * });
 *
 * // Process all results
 * const totalAmount = results
 *   .map(r => extractAmount(r.content))
 *   .reduce((a, b) => a + b, 0);
 * ```
 */
declare function batchExtractFiles(paths: string[], config?: ExtractionConfig$1 | null): Promise<ExtractionResult[]>;
/**
 * Extract content from multiple byte arrays in parallel (synchronous).
 *
 * **Recommended for**: Processing multiple documents from memory efficiently with better
 * performance and memory management compared to individual `extractBytesSync()` calls.
 *
 * **Benefits**:
 * - Parallel processing in Rust for maximum performance
 * - Optimized memory usage across all extractions
 * - More reliable for batch document processing
 *
 * @param dataList - List of file contents as Uint8Arrays (must be same length as mimeTypes)
 * @param mimeTypes - List of MIME types (one per data item, required for accurate format detection)
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns Array of ExtractionResults (one per data item, in same order as input)
 * @throws {TypeError} When dataList contains non-Uint8Array items or length mismatch with mimeTypes
 * @throws {Error} If any data cannot be read or parsed
 * @throws {ParsingError} When any document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When any extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { batchExtractBytesSync } from '@kreuzberg/node';
 * import { readFileSync } from 'fs';
 *
 * const files = ['doc1.pdf', 'doc2.docx', 'doc3.xlsx'];
 * const dataList = files.map(f => readFileSync(f));
 * const mimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
 *
 * const results = batchExtractBytesSync(dataList, mimeTypes);
 * results.forEach((result, i) => {
 *   console.log(`File ${files[i]}: ${result.content.substring(0, 100)}...`);
 * });
 * ```
 */
declare function batchExtractBytesSync(dataList: Uint8Array[], mimeTypes: string[], config?: ExtractionConfig$1 | null): ExtractionResult[];
/**
 * Extract content from multiple byte arrays in parallel (asynchronous).
 *
 * **Recommended for**: Processing multiple documents from memory efficiently with better
 * performance and memory management compared to individual `extractBytes()` calls.
 *
 * **Benefits**:
 * - Parallel processing in Rust for maximum performance
 * - Optimized memory usage across all extractions
 * - More reliable for batch document processing
 *
 * @param dataList - List of file contents as Uint8Arrays (must be same length as mimeTypes)
 * @param mimeTypes - List of MIME types (one per data item, required for accurate format detection)
 * @param config - Extraction configuration object. If null, uses default extraction settings.
 * @returns Promise resolving to array of ExtractionResults (one per data item, in same order as input)
 * @throws {TypeError} When dataList contains non-Uint8Array items or length mismatch with mimeTypes
 * @throws {Error} If any data cannot be read or parsed
 * @throws {ParsingError} When any document format is invalid or corrupted
 * @throws {OcrError} When OCR processing fails (if OCR is enabled)
 * @throws {ValidationError} When any extraction result fails validation (if validators registered)
 * @throws {KreuzbergError} For other extraction-related failures
 *
 * @example
 * ```typescript
 * import { batchExtractBytes } from '@kreuzberg/node';
 * import { readFile } from 'fs/promises';
 *
 * const files = ['invoice1.pdf', 'invoice2.pdf', 'invoice3.pdf'];
 * const dataList = await Promise.all(files.map(f => readFile(f)));
 * const mimeTypes = files.map(() => 'application/pdf');
 *
 * const results = await batchExtractBytes(dataList, mimeTypes, {
 *   ocr: { backend: 'tesseract', language: 'eng' }
 * });
 *
 * // Process all results
 * const totalAmount = results
 *   .map(r => extractAmount(r.content))
 *   .reduce((a, b) => a + b, 0);
 * ```
 */
declare function batchExtractBytes(dataList: Uint8Array[], mimeTypes: string[], config?: ExtractionConfig$1 | null): Promise<ExtractionResult[]>;
/**
 * Register a custom postprocessor.
 *
 * **IMPORTANT**: Custom processors only work with **async extraction functions**:
 * - ✅ `extractFile()`, `extractBytes()`, `batchExtractFiles()`, `batchExtractBytes()`
 * - ❌ `extractFileSync()`, `extractBytesSync()`, etc. (will skip custom processors)
 *
 * This limitation exists because sync extraction blocks the Node.js event loop,
 * preventing JavaScript callbacks from executing. For v4.0, use async extraction
 * when you need custom processors.
 *
 * @param processor - PostProcessorProtocol implementation with name(), process(), and optional processingStage()
 * @throws {Error} If processor is missing required methods (name or process)
 * @throws {Error} If processor name is empty string
 * @throws {Error} If a processor with the same name is already registered
 *
 * @example
 * ```typescript
 * import { registerPostProcessor, extractFile, ExtractionResult } from '@kreuzberg/node';
 *
 * class MyProcessor implements PostProcessorProtocol {
 *   name(): string {
 *     return 'my_processor';
 *   }
 *
 *   process(result: ExtractionResult): ExtractionResult {
 *     result.metadata.customField = 'custom_value';
 *     return result;
 *   }
 *
 *   processingStage(): 'early' | 'middle' | 'late' {
 *     return 'middle';
 *   }
 * }
 *
 * registerPostProcessor(new MyProcessor());
 *
 * // Use async extraction (required for custom processors)
 * const result = await extractFile('document.pdf');
 * console.log(result.metadata.customField); // 'custom_value'
 * ```
 */
declare function registerPostProcessor(processor: PostProcessorProtocol): void;
/**
 * Unregister a postprocessor by name.
 *
 * Removes a previously registered postprocessor from the registry.
 * If the processor doesn't exist, this is a no-op (does not throw).
 *
 * @param name - Name of the processor to unregister (case-sensitive)
 *
 * @example
 * ```typescript
 * import { unregisterPostProcessor } from '@kreuzberg/node';
 *
 * unregisterPostProcessor('my_processor');
 * ```
 */
declare function unregisterPostProcessor(name: string): void;
/**
 * Clear all registered postprocessors.
 *
 * Removes all postprocessors from the registry. Useful for test cleanup or resetting state.
 * If no postprocessors are registered, this is a no-op.
 *
 * @example
 * ```typescript
 * import { clearPostProcessors } from '@kreuzberg/node';
 *
 * clearPostProcessors();
 * ```
 */
declare function clearPostProcessors(): void;
/**
 * List all registered post-processors.
 *
 * Returns the names of all currently registered post-processors (both built-in and custom).
 *
 * @returns Array of post-processor names (empty array if none registered)
 *
 * @example
 * ```typescript
 * import { listPostProcessors } from '@kreuzberg/node';
 *
 * const names = listPostProcessors();
 * console.log('Registered post-processors:', names);
 * ```
 */
declare function listPostProcessors(): string[];
/**
 * Register a custom validator.
 *
 * Validators check extraction results for quality, completeness, or correctness.
 * Unlike post-processors, validator errors **fail fast** - if a validator throws an error,
 * the extraction fails immediately.
 *
 * @param validator - ValidatorProtocol implementation with name(), validate(), and optional priority()/shouldValidate()
 * @throws {Error} If validator is missing required methods (name or validate)
 * @throws {Error} If validator name is empty string
 * @throws {Error} If a validator with the same name is already registered
 *
 * @example
 * ```typescript
 * import { registerValidator } from '@kreuzberg/node';
 *
 * class MinLengthValidator implements ValidatorProtocol {
 *   name(): string {
 *     return 'min_length_validator';
 *   }
 *
 *   priority(): number {
 *     return 100; // Run early
 *   }
 *
 *   validate(result: ExtractionResult): void {
 *     if (result.content.length < 100) {
 *       throw new Error('Content too short: minimum 100 characters required');
 *     }
 *   }
 * }
 *
 * registerValidator(new MinLengthValidator());
 * ```
 */
declare function registerValidator(validator: ValidatorProtocol): void;
/**
 * Unregister a validator by name.
 *
 * Removes a previously registered validator from the global registry.
 * If the validator doesn't exist, this is a no-op (does not throw).
 *
 * @param name - Validator name to unregister (case-sensitive)
 *
 * @example
 * ```typescript
 * import { unregisterValidator } from '@kreuzberg/node';
 *
 * unregisterValidator('min_length_validator');
 * ```
 */
declare function unregisterValidator(name: string): void;
/**
 * Clear all registered validators.
 *
 * Removes all validators from the global registry. Useful for test cleanup
 * or resetting state.
 *
 * @example
 * ```typescript
 * import { clearValidators } from '@kreuzberg/node';
 *
 * clearValidators();
 * ```
 */
declare function clearValidators(): void;
/**
 * List all registered validators.
 *
 * Returns the names of all currently registered validators (both built-in and custom).
 *
 * @returns Array of validator names (empty array if none registered)
 *
 * @example
 * ```typescript
 * import { listValidators } from '@kreuzberg/node';
 *
 * const names = listValidators();
 * console.log('Registered validators:', names);
 * ```
 */
declare function listValidators(): string[];
declare function registerOcrBackend(backend: OcrBackendProtocol): void;
/**
 * List all registered OCR backends.
 *
 * Returns an array of names of all currently registered OCR backends,
 * including built-in backends like "tesseract".
 *
 * @returns Array of OCR backend names (empty array if none registered)
 *
 * @example
 * ```typescript
 * import { listOcrBackends } from '@kreuzberg/node';
 *
 * const backends = listOcrBackends();
 * console.log(backends); // ['tesseract', 'my-custom-backend', ...]
 * ```
 */
declare function listOcrBackends(): string[];
/**
 * Unregister an OCR backend by name.
 *
 * Removes the specified OCR backend from the registry. If the backend doesn't exist,
 * this operation is a no-op (does not throw an error).
 *
 * @param name - Name of the OCR backend to unregister
 *
 * @example
 * ```typescript
 * import { unregisterOcrBackend } from '@kreuzberg/node';
 *
 * // Unregister a custom backend
 * unregisterOcrBackend('my-custom-ocr');
 * ```
 */
declare function unregisterOcrBackend(name: string): void;
/**
 * Clear all registered OCR backends.
 *
 * Removes all OCR backends from the registry, including built-in backends.
 * Use with caution as this will make OCR functionality unavailable until
 * backends are re-registered. If no backends are registered, this is a no-op.
 *
 * @example
 * ```typescript
 * import { clearOcrBackends } from '@kreuzberg/node';
 *
 * clearOcrBackends();
 * ```
 */
declare function clearOcrBackends(): void;
/**
 * List all registered document extractors.
 *
 * Returns an array of names of all currently registered document extractors,
 * including built-in extractors for PDF, Office documents, images, etc.
 *
 * @returns Array of document extractor names (empty array if none registered)
 *
 * @example
 * ```typescript
 * import { listDocumentExtractors } from '@kreuzberg/node';
 *
 * const extractors = listDocumentExtractors();
 * console.log(extractors); // ['PDFExtractor', 'ImageExtractor', ...]
 * ```
 */
declare function listDocumentExtractors(): string[];
/**
 * Unregister a document extractor by name.
 *
 * Removes the specified document extractor from the registry. If the extractor
 * doesn't exist, this operation is a no-op (does not throw an error).
 *
 * @param name - Name of the document extractor to unregister
 *
 * @example
 * ```typescript
 * import { unregisterDocumentExtractor } from '@kreuzberg/node';
 *
 * // Unregister a custom extractor
 * unregisterDocumentExtractor('MyCustomExtractor');
 * ```
 */
declare function unregisterDocumentExtractor(name: string): void;
/**
 * Clear all registered document extractors.
 *
 * Removes all document extractors from the registry, including built-in extractors.
 * Use with caution as this will make document extraction unavailable until
 * extractors are re-registered.
 *
 * @example
 * ```typescript
 * import { clearDocumentExtractors } from '@kreuzberg/node';
 *
 * clearDocumentExtractors();
 * ```
 */
declare function clearDocumentExtractors(): void;
/**
 * ExtractionConfig namespace with static methods for loading configuration from files.
 *
 * Provides factory methods to load extraction configuration from TOML, YAML, or JSON files,
 * or to discover configuration files in the current directory tree.
 *
 * For creating configurations programmatically, use plain TypeScript objects instead:
 *
 * @example
 * ```typescript
 * import { ExtractionConfig, extractFile } from '@kreuzberg/node';
 *
 * // Load configuration from file
 * const config1 = ExtractionConfig.fromFile('config.toml');
 *
 * // Or create with plain object
 * const config2 = {
 *   chunking: { maxChars: 2048 },
 *   ocr: { backend: 'tesseract', language: 'eng' }
 * };
 *
 * // Use with extraction
 * const result = await extractFile('document.pdf', null, config2);
 * ```
 */
declare const ExtractionConfig: {
    /**
     * Load extraction configuration from a file.
     *
     * Automatically detects the file format based on extension:
     * - `.toml` - TOML format
     * - `.yaml` - YAML format
     * - `.json` - JSON format
     *
     * @param filePath - Path to the configuration file (absolute or relative)
     * @returns ExtractionConfig object loaded from the file
     *
     * @throws {Error} If file does not exist or is not accessible
     * @throws {Error} If file content is not valid TOML/YAML/JSON
     * @throws {Error} If configuration structure is invalid
     * @throws {Error} If file extension is not supported
     *
     * @example
     * ```typescript
     * import { ExtractionConfig } from '@kreuzberg/node';
     *
     * // Load from TOML file
     * const config1 = ExtractionConfig.fromFile('kreuzberg.toml');
     *
     * // Load from YAML file
     * const config2 = ExtractionConfig.fromFile('./config.yaml');
     *
     * // Load from JSON file
     * const config3 = ExtractionConfig.fromFile('./config.json');
     * ```
     */
    fromFile(filePath: string): ExtractionConfig$1;
    /**
     * Discover and load configuration from current or parent directories.
     *
     * Searches for a `kreuzberg.toml` file starting from the current working directory
     * and traversing up the directory tree. Returns the first configuration file found.
     *
     * @returns ExtractionConfig object if found, or null if no configuration file exists
     *
     * @example
     * ```typescript
     * import { ExtractionConfig } from '@kreuzberg/node';
     *
     * // Try to find config in current or parent directories
     * const config = ExtractionConfig.discover();
     * if (config) {
     *   console.log('Found configuration');
     *   // Use config for extraction
     * } else {
     *   console.log('No configuration file found, using defaults');
     * }
     * ```
     */
    discover(): ExtractionConfig$1 | null;
};
/**
 * Detect MIME type from raw bytes.
 *
 * Uses content inspection (magic bytes) to determine MIME type.
 * This is more accurate than extension-based detection but requires
 * reading the file content.
 *
 * @param bytes - Raw file content as Buffer
 * @returns The detected MIME type string
 *
 * @throws {Error} If MIME type cannot be determined from content
 *
 * @example
 * ```typescript
 * import { detectMimeType } from '@kreuzberg/node';
 * import * as fs from 'fs';
 *
 * // Read file content
 * const content = fs.readFileSync('document.pdf');
 *
 * // Detect MIME type from bytes
 * const mimeType = detectMimeType(content);
 * console.log(mimeType); // 'application/pdf'
 * ```
 */
declare function detectMimeType(bytes: Buffer): string;
/**
 * Detect MIME type from a file path.
 *
 * Determines the MIME type based on the file extension in the provided path.
 * By default, checks if the file exists; can be disabled with checkExists parameter.
 *
 * @param filePath - The file path to detect MIME type from (e.g., 'document.pdf')
 * @param checkExists - Whether to verify the file exists (default: true)
 * @returns The detected MIME type as a string (e.g., 'application/pdf')
 *
 * @throws {Error} If MIME type cannot be determined from the file extension,
 * or if checkExists is true and the file does not exist
 *
 * @example
 * ```typescript
 * import { detectMimeTypeFromPath } from '@kreuzberg/node';
 *
 * // Detect MIME type from existing file
 * const mimeType = detectMimeTypeFromPath('/path/to/document.pdf');
 * console.log(mimeType); // 'application/pdf'
 *
 * // Detect without checking file existence
 * const mimeType2 = detectMimeTypeFromPath('document.docx', false);
 * console.log(mimeType2); // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 * ```
 */
declare function detectMimeTypeFromPath(filePath: string, checkExists?: boolean): string;
/**
 * Validate that a MIME type is supported by Kreuzberg.
 *
 * Checks if a MIME type is in the list of supported formats. Note that any
 * `image/*` MIME type is automatically considered valid.
 *
 * @param mimeType - The MIME type to validate (string)
 * @returns The validated MIME type (may be normalized)
 *
 * @throws {Error} If the MIME type is not supported
 *
 * @example
 * ```typescript
 * import { validateMimeType } from '@kreuzberg/node';
 *
 * // Validate supported type
 * const validated = validateMimeType('application/pdf');
 * console.log(validated); // 'application/pdf'
 *
 * // Validate custom image type
 * const validated2 = validateMimeType('image/custom-format');
 * console.log(validated2); // 'image/custom-format' (any image/* is valid)
 *
 * // Validate unsupported type (throws error)
 * try {
 *   validateMimeType('video/mp4');
 * } catch (err) {
 *   console.error(err); // Error: Unsupported format: video/mp4
 * }
 * ```
 */
declare function validateMimeType(mimeType: string): string;
/**
 * Get file extensions for a given MIME type.
 *
 * Returns an array of file extensions commonly associated with the specified
 * MIME type. For example, 'application/pdf' returns ['pdf'].
 *
 * @param mimeType - The MIME type to look up (e.g., 'application/pdf', 'image/jpeg')
 * @returns Array of file extensions (without leading dots)
 *
 * @throws {Error} If the MIME type is not recognized or supported
 *
 * @example
 * ```typescript
 * import { getExtensionsForMime } from '@kreuzberg/node';
 *
 * // Get extensions for PDF
 * const pdfExts = getExtensionsForMime('application/pdf');
 * console.log(pdfExts); // ['pdf']
 *
 * // Get extensions for JPEG
 * const jpegExts = getExtensionsForMime('image/jpeg');
 * console.log(jpegExts); // ['jpg', 'jpeg']
 * ```
 */
declare function getExtensionsForMime(mimeType: string): string[];
/**
 * Embedding preset configuration.
 *
 * Contains all settings for a specific embedding model preset.
 */
interface EmbeddingPreset {
    /** Name of the preset (e.g., "fast", "balanced", "quality", "multilingual") */
    name: string;
    /** Recommended chunk size in characters */
    chunkSize: number;
    /** Recommended overlap in characters */
    overlap: number;
    /** Model identifier (e.g., "AllMiniLML6V2Q", "BGEBaseENV15") */
    modelName: string;
    /** Embedding vector dimensions */
    dimensions: number;
    /** Human-readable description of the preset */
    description: string;
}
/**
 * List all available embedding preset names.
 *
 * Returns an array of preset names that can be used with `getEmbeddingPreset`.
 *
 * @returns Array of 4 preset names: ["fast", "balanced", "quality", "multilingual"]
 *
 * @example
 * ```typescript
 * import { listEmbeddingPresets } from '@kreuzberg/node';
 *
 * const presets = listEmbeddingPresets();
 * console.log(presets); // ['fast', 'balanced', 'quality', 'multilingual']
 * ```
 */
declare function listEmbeddingPresets(): string[];
/**
 * Get a specific embedding preset by name.
 *
 * Returns a preset configuration object, or null if the preset name is not found.
 *
 * @param name - The preset name (case-sensitive)
 * @returns An `EmbeddingPreset` object or `null` if not found
 *
 * @example
 * ```typescript
 * import { getEmbeddingPreset } from '@kreuzberg/node';
 *
 * const preset = getEmbeddingPreset('balanced');
 * if (preset) {
 *   console.log(`Model: ${preset.modelName}, Dims: ${preset.dimensions}`);
 *   // Model: BGEBaseENV15, Dims: 768
 * }
 * ```
 */
declare function getEmbeddingPreset(name: string): EmbeddingPreset | null;
/**
 * Get the error code for the last FFI error.
 *
 * Returns the FFI error code as an integer. This is useful for programmatic error handling
 * and distinguishing between different types of failures in native code.
 *
 * Error codes:
 * - 0: Success (no error)
 * - 1: GenericError
 * - 2: Panic
 * - 3: InvalidArgument
 * - 4: IoError
 * - 5: ParsingError
 * - 6: OcrError
 * - 7: MissingDependency
 *
 * @returns The integer error code
 *
 * @example
 * ```typescript
 * import { extractFile, getLastErrorCode, ErrorCode } from '@kreuzberg/node';
 *
 * try {
 *   const result = await extractFile('document.pdf');
 * } catch (error) {
 *   const code = getLastErrorCode();
 *   if (code === ErrorCode.Panic) {
 *     console.error('Native code panic detected');
 *   }
 * }
 * ```
 */
declare function getLastErrorCode(): number;
/**
 * Get panic context information if the last error was a panic.
 *
 * Returns detailed information about a panic in native code, or null if the last error was not a panic.
 * This provides debugging information when native code panics.
 *
 * @returns A `PanicContext` object with file, line, function, message, and timestamp_secs, or null if no panic context is available
 *
 * @example
 * ```typescript
 * import { extractFile, getLastPanicContext } from '@kreuzberg/node';
 *
 * try {
 *   const result = await extractFile('document.pdf');
 * } catch (error) {
 *   const context = getLastPanicContext();
 *   if (context) {
 *     console.error(`Panic at ${context.file}:${context.line}`);
 *     console.error(`In function: ${context.function}`);
 *     console.error(`Message: ${context.message}`);
 *   }
 * }
 * ```
 */
declare function getLastPanicContext(): PanicContext | null;
/**
 * Returns the human-readable name for an error code.
 *
 * Maps numeric error codes to their string names, providing a consistent way
 * to get error code names across all platforms.
 *
 * @param code - The numeric error code (0-7)
 * @returns The error code name as a string (e.g., "validation", "ocr", "unknown")
 *
 * @example
 * ```typescript
 * import { getErrorCodeName } from '@kreuzberg/node';
 *
 * const name = getErrorCodeName(0);  // returns "validation"
 * const name = getErrorCodeName(2);  // returns "ocr"
 * const name = getErrorCodeName(99); // returns "unknown"
 * ```
 */
declare function getErrorCodeName(code: number): string;
/**
 * Returns the description for an error code.
 *
 * Retrieves user-friendly descriptions of error types from the FFI layer.
 *
 * @param code - The numeric error code (0-7)
 * @returns A brief description of the error type
 *
 * @example
 * ```typescript
 * import { getErrorCodeDescription } from '@kreuzberg/node';
 *
 * const desc = getErrorCodeDescription(0);  // returns "Input validation error"
 * const desc = getErrorCodeDescription(4);  // returns "File system I/O error"
 * const desc = getErrorCodeDescription(99); // returns "Unknown error code"
 * ```
 */
declare function getErrorCodeDescription(code: number): string;
/**
 * Classifies an error message string into an error code category.
 *
 * This function analyzes the error message content and returns the most likely
 * error code (0-7) based on keyword patterns. Used to programmatically classify
 * errors for handling purposes.
 *
 * The classification is based on keyword matching:
 * - **Validation (0)**: Keywords like "invalid", "validation", "schema", "required"
 * - **Parsing (1)**: Keywords like "parsing", "corrupted", "malformed"
 * - **Ocr (2)**: Keywords like "ocr", "tesseract", "language", "model"
 * - **MissingDependency (3)**: Keywords like "not found", "missing", "dependency"
 * - **Io (4)**: Keywords like "file", "disk", "read", "write", "permission"
 * - **Plugin (5)**: Keywords like "plugin", "register", "extension"
 * - **UnsupportedFormat (6)**: Keywords like "unsupported", "format", "mime"
 * - **Internal (7)**: Keywords like "internal", "bug", "panic"
 *
 * @param errorMessage - The error message string to classify
 * @returns An object with the classification details
 *
 * @example
 * ```typescript
 * import { classifyError } from '@kreuzberg/node';
 *
 * const result = classifyError("PDF file is corrupted");
 * // Returns: { code: 1, name: "parsing", confidence: 0.95 }
 *
 * const result = classifyError("Tesseract not found");
 * // Returns: { code: 3, name: "missing_dependency", confidence: 0.9 }
 * ```
 */
declare function classifyError(errorMessage: string): ErrorClassification;
/**
 * Create a worker pool for concurrent file extraction.
 *
 * The worker pool manages a set of background worker threads that can process
 * extraction requests concurrently, improving throughput when handling multiple files.
 *
 * @param size - Optional number of worker threads (defaults to CPU count). Must be > 0
 * @returns A WorkerPool instance to use with extraction functions
 *
 * @throws {Error} If size is invalid or pool creation fails
 *
 * @example
 * ```typescript
 * import { createWorkerPool, extractFileInWorker, closeWorkerPool } from '@kreuzberg/node';
 *
 * // Create pool with 4 workers
 * const pool = createWorkerPool(4);
 *
 * try {
 *   const result = await extractFileInWorker(pool, 'document.pdf');
 *   console.log(result.content);
 * } finally {
 *   // Always close the pool when done
 *   await closeWorkerPool(pool);
 * }
 * ```
 */
declare function createWorkerPool(size?: number): WorkerPool;
/**
 * Get statistics about a worker pool.
 *
 * Returns information about the pool's current state, including the number of active workers,
 * queued tasks, and total processed tasks.
 *
 * @param pool - The worker pool instance
 * @returns WorkerPoolStats with pool information
 *
 * @example
 * ```typescript
 * import { createWorkerPool, getWorkerPoolStats } from '@kreuzberg/node';
 *
 * const pool = createWorkerPool(4);
 * const stats = getWorkerPoolStats(pool);
 *
 * console.log(`Pool size: ${stats.size}`);
 * console.log(`Active workers: ${stats.activeWorkers}`);
 * console.log(`Queued tasks: ${stats.queuedTasks}`);
 * ```
 */
declare function getWorkerPoolStats(pool: WorkerPool): WorkerPoolStats;
/**
 * Extract content from a single file using a worker pool (asynchronous).
 *
 * Submits an extraction task to the worker pool. The task is executed by one of the
 * available workers in the background, allowing other tasks to be processed concurrently.
 *
 * @param pool - The worker pool instance
 * @param filePath - Path to the file to extract
 * @param mimeTypeOrConfig - Optional MIME type or extraction configuration
 * @param maybeConfig - Optional extraction configuration (if second param is MIME type)
 * @returns Promise<ExtractionResult> containing extracted content and metadata
 *
 * @throws {Error} If the file cannot be read or extraction fails
 *
 * @example
 * ```typescript
 * import { createWorkerPool, extractFileInWorker, closeWorkerPool } from '@kreuzberg/node';
 *
 * const pool = createWorkerPool(4);
 *
 * try {
 *   const files = ['doc1.pdf', 'doc2.docx', 'doc3.xlsx'];
 *   const results = await Promise.all(
 *     files.map(f => extractFileInWorker(pool, f))
 *   );
 *
 *   results.forEach((r, i) => {
 *     console.log(`${files[i]}: ${r.content.substring(0, 100)}...`);
 *   });
 * } finally {
 *   await closeWorkerPool(pool);
 * }
 * ```
 */
declare function extractFileInWorker(pool: WorkerPool, filePath: string, mimeTypeOrConfig?: string | null | ExtractionConfig$1, maybeConfig?: ExtractionConfig$1 | null): Promise<ExtractionResult>;
/**
 * Extract content from multiple files in parallel using a worker pool (asynchronous).
 *
 * Submits multiple extraction tasks to the worker pool for concurrent processing.
 * This is more efficient than using `extractFileInWorker` multiple times sequentially.
 *
 * @param pool - The worker pool instance
 * @param paths - Array of file paths to extract
 * @param config - Extraction configuration object (applies to all files)
 * @returns Promise<ExtractionResult[]> array of results (one per file, in same order)
 *
 * @throws {Error} If any file cannot be read or extraction fails
 *
 * @example
 * ```typescript
 * import { createWorkerPool, batchExtractFilesInWorker, closeWorkerPool } from '@kreuzberg/node';
 *
 * const pool = createWorkerPool(4);
 *
 * try {
 *   const files = ['invoice1.pdf', 'invoice2.pdf', 'invoice3.pdf'];
 *   const results = await batchExtractFilesInWorker(pool, files, {
 *     ocr: { backend: 'tesseract', language: 'eng' }
 *   });
 *
 *   const total = results.reduce((sum, r) => sum + extractAmount(r.content), 0);
 *   console.log(`Total: $${total}`);
 * } finally {
 *   await closeWorkerPool(pool);
 * }
 * ```
 */
declare function batchExtractFilesInWorker(pool: WorkerPool, paths: string[], config?: ExtractionConfig$1 | null): Promise<ExtractionResult[]>;
/**
 * Close a worker pool and shut down all worker threads.
 *
 * Should be called when the pool is no longer needed to clean up resources
 * and gracefully shut down worker threads. Any pending tasks will be cancelled.
 *
 * @param pool - The worker pool instance to close
 * @returns Promise that resolves when the pool is fully closed
 *
 * @throws {Error} If pool shutdown fails
 *
 * @example
 * ```typescript
 * import { createWorkerPool, extractFileInWorker, closeWorkerPool } from '@kreuzberg/node';
 *
 * const pool = createWorkerPool(4);
 *
 * try {
 *   const result = await extractFileInWorker(pool, 'document.pdf');
 *   console.log(result.content);
 * } finally {
 *   // Clean up the pool
 *   await closeWorkerPool(pool);
 * }
 * ```
 */
declare function closeWorkerPool(pool: WorkerPool): Promise<void>;
declare const __version__ = "4.0.0";

export { type EmbeddingPreset, ErrorClassification, ExtractionConfig, ExtractionResult, OcrBackendProtocol, PanicContext, PostProcessorProtocol, ValidatorProtocol, WorkerPool, WorkerPoolStats, __resetBindingForTests, __setBindingForTests, __version__, batchExtractBytes, batchExtractBytesSync, batchExtractFiles, batchExtractFilesInWorker, batchExtractFilesSync, classifyError, clearDocumentExtractors, clearOcrBackends, clearPostProcessors, clearValidators, closeWorkerPool, createWorkerPool, detectMimeType, detectMimeTypeFromPath, extractBytes, extractBytesSync, extractFile, extractFileInWorker, extractFileSync, getEmbeddingPreset, getErrorCodeDescription, getErrorCodeName, getExtensionsForMime, getLastErrorCode, getLastPanicContext, getWorkerPoolStats, listDocumentExtractors, listEmbeddingPresets, listOcrBackends, listPostProcessors, listValidators, registerOcrBackend, registerPostProcessor, registerValidator, unregisterDocumentExtractor, unregisterOcrBackend, unregisterPostProcessor, unregisterValidator, validateMimeType };
