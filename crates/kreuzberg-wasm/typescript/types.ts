/**
 * Type definitions for Kreuzberg WASM bindings
 *
 * These types are generated from the Rust core library and define
 * the interface for extraction, configuration, and results.
 */

/**
 * Token reduction configuration
 */
export interface TokenReductionConfig {
	/** Token reduction mode */
	mode?: string;
	/** Preserve important words during reduction */
	preserveImportantWords?: boolean;
}

/**
 * Post-processor configuration
 */
export interface PostProcessorConfig {
	/** Whether post-processing is enabled */
	enabled?: boolean;
	/** List of enabled processors */
	enabledProcessors?: string[];
	/** List of disabled processors */
	disabledProcessors?: string[];
}

/**
 * Keyword extraction algorithm type
 *
 * Supported algorithms:
 * - "yake": YAKE (Yet Another Keyword Extractor) - statistical approach
 * - "rake": RAKE (Rapid Automatic Keyword Extraction) - co-occurrence based
 */
export type KeywordAlgorithm = "yake" | "rake";

/**
 * YAKE algorithm-specific parameters
 */
export interface YakeParams {
	/** Window size for co-occurrence analysis (default: 2) */
	windowSize?: number;
}

/**
 * RAKE algorithm-specific parameters
 */
export interface RakeParams {
	/** Minimum word length to consider (default: 1) */
	minWordLength?: number;
	/** Maximum words in a keyword phrase (default: 3) */
	maxWordsPerPhrase?: number;
}

/**
 * Keyword extraction configuration
 *
 * Controls how keywords are extracted from text, including algorithm selection,
 * scoring thresholds, n-gram ranges, and language-specific settings.
 */
export interface KeywordConfig {
	/** Algorithm to use for extraction (default: "yake") */
	algorithm?: KeywordAlgorithm;
	/** Maximum number of keywords to extract (default: 10) */
	maxKeywords?: number;
	/** Minimum score threshold 0.0-1.0 (default: 0.0) */
	minScore?: number;
	/** N-gram range [min, max] for keyword extraction (default: [1, 3]) */
	ngramRange?: [number, number];
	/** Language code for stopword filtering (e.g., "en", "de", "fr") */
	language?: string;
	/** YAKE-specific tuning parameters */
	yakeParams?: YakeParams;
	/** RAKE-specific tuning parameters */
	rakeParams?: RakeParams;
}

/**
 * Extracted keyword with relevance metadata
 *
 * Represents a single keyword extracted from text along with its relevance score,
 * the algorithm that extracted it, and optional position information.
 */
export interface ExtractedKeyword {
	/** The keyword text */
	text: string;
	/** Relevance score (higher is better, algorithm-specific range) */
	score: number;
	/** Algorithm that extracted this keyword */
	algorithm: KeywordAlgorithm;
	/** Optional positions where keyword appears in text (character offsets) */
	positions?: number[];
}

/**
 * Configuration for document extraction
 */
export interface ExtractionConfig {
	/** OCR configuration */
	ocr?: OcrConfig;
	/** Chunking configuration */
	chunking?: ChunkingConfig;
	/** Image extraction configuration */
	images?: ImageExtractionConfig;
	/** Page extraction configuration */
	pages?: PageExtractionConfig;
	/** Language detection configuration */
	languageDetection?: LanguageDetectionConfig;
	/** PDF extraction options */
	pdfOptions?: PdfConfig;
	/** Token reduction configuration */
	tokenReduction?: TokenReductionConfig;
	/** Post-processor configuration */
	postprocessor?: PostProcessorConfig;
	/** Keyword extraction configuration */
	keywords?: KeywordConfig;
	/** Whether to use caching */
	useCache?: boolean;
	/** Enable quality processing */
	enableQualityProcessing?: boolean;
	/** Force OCR even if text is available */
	forceOcr?: boolean;
	/** Maximum concurrent extractions */
	maxConcurrentExtractions?: number;
}

/**
 * Tesseract OCR configuration
 */
export interface TesseractConfig {
	/** Tesseract page segmentation mode */
	psm?: number;
	/** Enable table detection */
	enableTableDetection?: boolean;
	/** Character whitelist for recognition */
	tesseditCharWhitelist?: string;
}

/**
 * OCR configuration
 */
export interface OcrConfig {
	/** OCR backend to use */
	backend?: string;
	/** Language codes (ISO 639) */
	languages?: string[];
	/** Whether to perform OCR */
	enabled?: boolean;
	/** Tesseract-specific configuration */
	tesseractConfig?: TesseractConfig;
	/** Language code for OCR */
	language?: string;
}

/**
 * Chunking configuration
 */
export interface ChunkingConfig {
	/** Maximum characters per chunk */
	maxChars?: number;
	/** Overlap between chunks */
	maxOverlap?: number;
}

/**
 * Image extraction configuration
 */
export interface ImageExtractionConfig {
	/** Whether to extract images */
	enabled?: boolean;
	/** Target DPI for image extraction */
	targetDpi?: number;
	/** Maximum image dimension in pixels */
	maxImageDimension?: number;
	/** Automatically adjust DPI */
	autoAdjustDpi?: boolean;
	/** Minimum DPI threshold */
	minDpi?: number;
	/** Maximum DPI threshold */
	maxDpi?: number;
}

/**
 * PDF extraction configuration
 */
export interface PdfConfig {
	/** Whether to extract images from PDF */
	extractImages?: boolean;
	/** Passwords for encrypted PDFs */
	passwords?: string[];
	/** Whether to extract metadata */
	extractMetadata?: boolean;
}

/**
 * Page extraction configuration
 */
export interface PageExtractionConfig {
	/** Extract pages as separate array (ExtractionResult.pages) */
	extractPages?: boolean;
	/** Insert page markers in main content string */
	insertPageMarkers?: boolean;
	/** Page marker format (use {page_num} placeholder) */
	markerFormat?: string;
}

/**
 * Language detection configuration
 */
export interface LanguageDetectionConfig {
	/** Whether to detect languages */
	enabled?: boolean;
}

/**
 * Result of document extraction
 */
export interface ExtractionResult {
	/** Extracted text content */
	content: string;
	/** MIME type of the document */
	mimeType: string;
	/** Document metadata */
	metadata: Metadata;
	/** Extracted tables */
	tables: Table[];
	/** Detected languages (ISO 639 codes) */
	detectedLanguages?: string[] | null;
	/** Text chunks when chunking is enabled */
	chunks?: Chunk[] | null;
	/** Extracted images */
	images?: ExtractedImage[] | null;
	/** Per-page content */
	pages?: PageContent[] | null;
	/** Extracted keywords when keyword extraction is enabled */
	keywords?: ExtractedKeyword[] | null;
}

/**
 * Document metadata
 */
export interface Metadata {
	/** Document title */
	title?: string;
	/** Document subject or description */
	subject?: string;
	/** Document author(s) */
	authors?: string[];
	/** Keywords/tags */
	keywords?: string[];
	/** Primary language (ISO 639 code) */
	language?: string;
	/** Creation timestamp (ISO 8601 format) */
	createdAt?: string;
	/** Last modification timestamp (ISO 8601 format) */
	modifiedAt?: string;
	/** User who created the document */
	creator?: string;
	/** User who last modified the document */
	lastModifiedBy?: string;
	/** Number of pages/slides */
	pageCount?: number;
	/** Format-specific metadata */
	formatMetadata?: unknown;
	/**
	 * Additional fields may be added at runtime by postprocessors.
	 * Use bracket notation to safely access unexpected properties.
	 */
	[key: string]: unknown;
}

/**
 * Extracted table
 */
export interface Table {
	/** Table cells/rows */
	cells?: string[][];
	/** Table markdown representation */
	markdown?: string;
	/** Page number if available */
	pageNumber?: number;
	/** Table headers */
	headers?: string[];
	/** Table rows */
	rows?: string[][];
}

/**
 * Chunk metadata
 */
export interface ChunkMetadata {
	/** Character start position in original content */
	charStart: number;
	/** Character end position in original content */
	charEnd: number;
	/** Token count if available */
	tokenCount: number | null;
	/** Index of this chunk */
	chunkIndex: number;
	/** Total number of chunks */
	totalChunks: number;
}

/**
 * Text chunk from chunked content
 */
export interface Chunk {
	/** Chunk text content */
	content: string;
	/** Chunk metadata */
	metadata?: ChunkMetadata;
	/** Character position in original content (legacy) */
	charIndex?: number;
	/** Token count if available (legacy) */
	tokenCount?: number;
	/** Embedding vector if computed */
	embedding?: number[] | null;
}

/**
 * Extracted image from document
 */
export interface ExtractedImage {
	/** Image data as Uint8Array or base64 string */
	data: Uint8Array | string;
	/** Image format/MIME type */
	format?: string;
	/** MIME type of the image */
	mimeType?: string;
	/** Image index in document */
	imageIndex?: number;
	/** Page number if available */
	pageNumber?: number | null;
	/** Image width in pixels */
	width?: number | null;
	/** Image height in pixels */
	height?: number | null;
	/** Color space of the image */
	colorspace?: string | null;
	/** Bits per color component */
	bitsPerComponent?: number | null;
	/** Whether this is a mask image */
	isMask?: boolean;
	/** Image description */
	description?: string | null;
	/** Optional OCR result from the image */
	ocrResult?: ExtractionResult | string | null;
}

/**
 * Per-page content
 */
export interface PageContent {
	/** Page number (1-indexed) */
	pageNumber: number;
	/** Text content of the page */
	content: string;
	/** Tables on this page */
	tables?: Table[];
	/** Images on this page */
	images?: ExtractedImage[];
}

/**
 * OCR backend protocol/interface
 */
export interface OcrBackendProtocol {
	/** Get the backend name */
	name(): string;
	/** Get supported language codes */
	supportedLanguages?(): string[];
	/** Initialize the backend */
	initialize(options?: Record<string, unknown>): void | Promise<void>;
	/** Shutdown the backend */
	shutdown?(): void | Promise<void>;
	/** Process an image with OCR */
	processImage(
		imageData: Uint8Array | string,
		language?: string,
	): Promise<
		| {
				content: string;
				mime_type: string;
				metadata?: Record<string, unknown>;
				tables?: unknown[];
		  }
		| string
	>;
}
