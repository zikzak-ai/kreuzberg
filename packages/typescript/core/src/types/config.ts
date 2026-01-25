/**
 * Configuration interfaces for Kreuzberg extraction options.
 *
 * These types define all configurable parameters for document extraction,
 * including OCR, chunking, image processing, and post-processing options.
 */

// ============================================================================
// ============================================================================

export interface TesseractConfig {
	psm?: number;
	enableTableDetection?: boolean;
	tesseditCharWhitelist?: string;
}

export interface OcrConfig {
	backend: string;
	language?: string;
	tesseractConfig?: TesseractConfig;
}

export interface ChunkingConfig {
	maxChars?: number;
	maxOverlap?: number;
	/**
	 * @deprecated Since 4.2.0, use `maxChars` instead
	 */
	chunkSize?: number;
	/**
	 * @deprecated Since 4.2.0, use `maxOverlap` instead
	 */
	chunkOverlap?: number;
	preset?: string;
	embedding?: Record<string, unknown>;
	enabled?: boolean;
}

export interface LanguageDetectionConfig {
	enabled?: boolean;
	minConfidence?: number;
	detectMultiple?: boolean;
}

export interface TokenReductionConfig {
	mode?: string;
	preserveImportantWords?: boolean;
}

export interface FontConfig {
	enabled?: boolean;
	customFontDirs?: string[];
}

export interface PdfConfig {
	extractImages?: boolean;
	passwords?: string[];
	extractMetadata?: boolean;
	fontConfig?: FontConfig;
}

export interface ImageExtractionConfig {
	extractImages?: boolean;
	targetDpi?: number;
	maxImageDimension?: number;
	autoAdjustDpi?: boolean;
	minDpi?: number;
	maxDpi?: number;
}

export interface PostProcessorConfig {
	enabled?: boolean;
	enabledProcessors?: string[];
	disabledProcessors?: string[];
}

export interface HtmlPreprocessingOptions {
	enabled?: boolean;
	preset?: "minimal" | "standard" | "aggressive";
	removeNavigation?: boolean;
	removeForms?: boolean;
}

export interface HtmlConversionOptions {
	headingStyle?: "atx" | "underlined" | "atx_closed";
	listIndentType?: "spaces" | "tabs";
	listIndentWidth?: number;
	bullets?: string;
	strongEmSymbol?: string;
	escapeAsterisks?: boolean;
	escapeUnderscores?: boolean;
	escapeMisc?: boolean;
	escapeAscii?: boolean;
	codeLanguage?: string;
	autolinks?: boolean;
	defaultTitle?: boolean;
	brInTables?: boolean;
	hocrSpatialTables?: boolean;
	highlightStyle?: "double_equal" | "html" | "bold" | "none";
	extractMetadata?: boolean;
	whitespaceMode?: "normalized" | "strict";
	stripNewlines?: boolean;
	wrap?: boolean;
	wrapWidth?: number;
	convertAsInline?: boolean;
	subSymbol?: string;
	supSymbol?: string;
	newlineStyle?: "spaces" | "backslash";
	codeBlockStyle?: "indented" | "backticks" | "tildes";
	keepInlineImagesIn?: string[];
	encoding?: string;
	debug?: boolean;
	stripTags?: string[];
	preserveTags?: string[];
	preprocessing?: HtmlPreprocessingOptions;
}

/**
 * Keyword extraction algorithm type.
 *
 * Supported algorithms:
 * - "yake": YAKE (Yet Another Keyword Extractor) - statistical approach
 * - "rake": RAKE (Rapid Automatic Keyword Extraction) - co-occurrence based
 */
export type KeywordAlgorithm = "yake" | "rake";

/**
 * YAKE algorithm-specific parameters.
 */
export interface YakeParams {
	/** Window size for co-occurrence analysis (default: 2) */
	windowSize?: number;
}

/**
 * RAKE algorithm-specific parameters.
 */
export interface RakeParams {
	/** Minimum word length to consider (default: 1) */
	minWordLength?: number;

	/** Maximum words in a keyword phrase (default: 3) */
	maxWordsPerPhrase?: number;
}

/**
 * Keyword extraction configuration.
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
 * Extracted keyword with relevance metadata.
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
 * Embedding model type selector with multiple configurations.
 *
 * Choose from preset configurations (recommended), specific fastembed models,
 * or custom ONNX models for different embedding tasks.
 *
 * @example
 * ```typescript
 * // Using a preset (recommended for most cases)
 * const model = EmbeddingModelType.preset('balanced');
 *
 * // Using a specific fastembed model
 * const model = EmbeddingModelType.fastembed('BAAI/bge-small-en-v1.5', 384);
 *
 * // Using a custom ONNX model from HuggingFace
 * const model = EmbeddingModelType.custom('sentence-transformers/all-MiniLM-L6-v2', 384);
 * ```
 */
export interface EmbeddingModelType {
	/**
	 * Use a preset embedding configuration.
	 *
	 * Recommended for most use cases. Available presets include:
	 * - "balanced": Good performance and accuracy
	 * - "compact": Lightweight and fast
	 * - "large": Maximum accuracy at higher resource cost
	 *
	 * Call `list_embedding_presets()` to see all available presets.
	 *
	 * @param name - Preset name (e.g., "balanced", "compact", "large")
	 * @returns Configured EmbeddingModelType
	 */
	preset?(name: string): EmbeddingModelType;

	/**
	 * Use a specific fastembed model by name.
	 *
	 * Requires the embeddings feature to be enabled in the Rust core.
	 *
	 * @param model - fastembed model identifier (e.g., "BAAI/bge-small-en-v1.5")
	 * @param dimensions - Vector dimensions produced by the model
	 * @returns Configured EmbeddingModelType
	 */
	fastembed?(model: string, dimensions: number): EmbeddingModelType;

	/**
	 * Use a custom ONNX model from HuggingFace.
	 *
	 * Allows using any ONNX model published on HuggingFace hub.
	 *
	 * @param model_id - HuggingFace model identifier (e.g., "sentence-transformers/all-MiniLM-L6-v2")
	 * @param dimensions - Vector dimensions produced by the model
	 * @returns Configured EmbeddingModelType
	 */
	custom?(model_id: string, dimensions: number): EmbeddingModelType;
}

/**
 * Embedding generation configuration for text chunks.
 *
 * Configures embedding generation using ONNX models via fastembed-rs.
 * Embeddings are useful for semantic search, clustering, and similarity operations.
 *
 * Requires the embeddings feature to be enabled in the Rust core.
 *
 * @example
 * ```typescript
 * // Basic preset embedding (recommended)
 * const config: EmbeddingConfig = {
 *   model: EmbeddingModelType.preset('balanced'),
 *   normalize: true,
 *   batch_size: 64
 * };
 *
 * // Custom ONNX model with settings
 * const config: EmbeddingConfig = {
 *   model: EmbeddingModelType.custom('sentence-transformers/all-MiniLM-L6-v2', 384),
 *   normalize: true,
 *   batch_size: 32,
 *   cache_dir: '/custom/model/cache'
 * };
 * ```
 */
export interface EmbeddingConfig {
	/**
	 * The embedding model to use.
	 * Can be a preset (recommended), specific fastembed model, or custom ONNX model.
	 * Default: Preset "balanced"
	 */
	model?: EmbeddingModelType;

	/**
	 * Whether to normalize embedding vectors to unit length.
	 * Recommended for cosine similarity calculations.
	 * Default: true
	 */
	normalize?: boolean;

	/**
	 * Number of texts to process simultaneously.
	 * Higher values use more memory but may be faster.
	 * Default: 32
	 */
	batchSize?: number;

	/**
	 * Display progress during embedding model download.
	 * Useful for large models on slow connections.
	 * Default: false
	 */
	showDownloadProgress?: boolean;

	/**
	 * Custom directory for caching downloaded models.
	 * Defaults to ~/.cache/kreuzberg/embeddings/ if not specified.
	 * Default: null
	 */
	cacheDir?: string | null;
}

/**
 * Page extraction and tracking configuration.
 *
 * Controls whether Kreuzberg tracks page boundaries and optionally inserts page markers
 * into the extracted content.
 *
 * @example
 * ```typescript
 * // Basic page tracking
 * const config: PageConfig = {
 *   extractPages: true,
 *   insertPageMarkers: false
 * };
 *
 * // With custom page marker format
 * const config: PageConfig = {
 *   extractPages: true,
 *   insertPageMarkers: true,
 *   markerFormat: '\\n--- Page {page_num} ---\\n'
 * };
 * ```
 */
export interface PageConfig {
	/**
	 * Enable page tracking and per-page extraction.
	 * Default: false
	 */
	extractPages?: boolean;

	/**
	 * Insert page markers into the main content string.
	 * Default: false
	 */
	insertPageMarkers?: boolean;

	/**
	 * Template for page markers containing {page_num} placeholder.
	 * Default: "\n\n<!-- PAGE {page_num} -->\n\n"
	 */
	markerFormat?: string;
}

/**
 * Document hierarchy detection configuration.
 *
 * Controls detection of document structure and hierarchy using clustering algorithms
 * to identify heading levels and document organization.
 *
 * @example
 * ```typescript
 * // Basic hierarchy detection
 * const config: HierarchyConfig = {
 *   enabled: true,
 *   kClusters: 6,
 *   includeBbox: true
 * };
 *
 * // Customize clustering parameters
 * const config: HierarchyConfig = {
 *   enabled: true,
 *   kClusters: 8,
 *   includeBbox: false,
 *   ocrCoverageThreshold: 0.5
 * };
 * ```
 */
export interface HierarchyConfig {
	/**
	 * Enable hierarchy detection.
	 * Default: true
	 */
	enabled?: boolean;

	/**
	 * Number of clusters for k-means clustering of font sizes.
	 * Controls the number of heading levels detected (1-10, typically 6 for H1-H6).
	 * Default: 6
	 */
	kClusters?: number;

	/**
	 * Include bounding box information in hierarchy output.
	 * Default: true
	 */
	includeBbox?: boolean;

	/**
	 * Optional threshold for OCR coverage before enabling hierarchy detection.
	 * Only applies hierarchy detection if OCR coverage exceeds this threshold (0.0-1.0).
	 * Default: null (no threshold)
	 */
	ocrCoverageThreshold?: number | null;
}

/**
 * Image preprocessing configuration for OCR operations.
 *
 * This configuration controls image preprocessing before OCR processing.
 * It is NOT for extracting images from documents (see ImageExtractionConfig for that).
 *
 * Preprocessing helps improve OCR accuracy on low-quality scans by cleaning up the image.
 *
 * @example
 * ```typescript
 * // Basic preprocessing for OCR
 * const config: ImagePreprocessingConfig = {
 *   targetDpi: 300,
 *   denoise: false,
 *   autoRotate: false
 * };
 *
 * // Aggressive preprocessing for low-quality scans
 * const config: ImagePreprocessingConfig = {
 *   targetDpi: 300,
 *   denoise: true,
 *   contrastEnhance: true,
 *   autoRotate: true,
 *   deskew: true
 * };
 * ```
 */
export interface ImagePreprocessingConfig {
	/**
	 * Target DPI for image normalization before OCR.
	 * Higher DPI = better quality but larger files.
	 * Default: 300
	 */
	targetDpi?: number;

	/**
	 * Automatically detect and correct image rotation.
	 * Default: false
	 */
	autoRotate?: boolean;

	/**
	 * Correct skewed (tilted) images to improve OCR accuracy.
	 * Default: false
	 */
	deskew?: boolean;

	/**
	 * Apply denoising filters to reduce noise in images.
	 * Improves OCR accuracy on low-quality scans.
	 * Default: false
	 */
	denoise?: boolean;

	/**
	 * Enhance contrast to improve text readability.
	 * Default: false
	 */
	contrastEnhance?: boolean;

	/**
	 * Method for converting images to black and white.
	 * Options depend on the OCR backend (e.g., "auto", "otsu", "sauvola").
	 * Default: "auto"
	 */
	binarizationMethod?: string;

	/**
	 * Invert colors (white text on black background).
	 * Useful for certain document types and scanned images.
	 * Default: false
	 */
	invertColors?: boolean;
}

export interface ExtractionConfig {
	useCache?: boolean;
	enableQualityProcessing?: boolean;
	ocr?: OcrConfig;
	forceOcr?: boolean;
	chunking?: ChunkingConfig;
	images?: ImageExtractionConfig;
	pdfOptions?: PdfConfig;
	tokenReduction?: TokenReductionConfig;
	languageDetection?: LanguageDetectionConfig;
	postprocessor?: PostProcessorConfig;
	htmlOptions?: HtmlConversionOptions;
	keywords?: KeywordConfig;
	pages?: PageConfig;
	embedding?: EmbeddingConfig;
	hierarchy?: HierarchyConfig;
	imagePreprocessing?: ImagePreprocessingConfig;
	maxConcurrentExtractions?: number;

	/**
	 * Content text format (default: Plain).
	 * Controls the format of the extracted content:
	 * - "plain": Raw extracted text (default)
	 * - "markdown": Markdown formatted output
	 * - "djot": Djot markup format
	 * - "html": HTML formatted output
	 *
	 * @example
	 * ```typescript
	 * // Get markdown formatted output
	 * const config: ExtractionConfig = {
	 *   outputFormat: "markdown"
	 * };
	 * ```
	 */
	outputFormat?: "plain" | "markdown" | "djot" | "html";

	/**
	 * Result structure format (default: Unified).
	 * Controls whether results are returned in unified format with all
	 * content in the content field, or element-based format with semantic
	 * elements (for Unstructured-compatible output).
	 *
	 * - "unified": All content in the content field with metadata at result level (default)
	 * - "element_based": Semantic elements (headings, paragraphs, tables, etc.) for Unstructured compatibility
	 *
	 * @example
	 * ```typescript
	 * // Get element-based output for Unstructured compatibility
	 * const config: ExtractionConfig = {
	 *   resultFormat: "element_based"
	 * };
	 * ```
	 */
	resultFormat?: "unified" | "element_based";

	/**
	 * Serialize the configuration to a JSON string.
	 *
	 * Converts this configuration object to its JSON representation.
	 * The JSON can be used to create a new config via fromJson() or
	 * passed to extraction functions that accept JSON configs.
	 *
	 * @returns JSON string representation of the configuration
	 *
	 * @example
	 * ```typescript
	 * const config: ExtractionConfig = { useCache: true };
	 * const json = config.toJson();
	 * console.log(json); // '{"useCache":true,...}'
	 * ```
	 */
	toJson(): string;

	/**
	 * Get a configuration field by name (dot notation supported).
	 *
	 * Retrieves a nested configuration field using dot notation
	 * (e.g., "ocr.backend", "images.targetDpi").
	 *
	 * @param fieldName - The field path to retrieve
	 * @returns The field value as a JSON string, or null if not found
	 *
	 * @example
	 * ```typescript
	 * const config: ExtractionConfig = {
	 *   ocr: { backend: 'tesseract' }
	 * };
	 * const backend = config.getField('ocr.backend');
	 * console.log(backend); // '"tesseract"'
	 *
	 * const missing = config.getField('nonexistent');
	 * console.log(missing); // null
	 * ```
	 */
	getField(fieldName: string): string | null;

	/**
	 * Merge another configuration into this one.
	 *
	 * Performs a shallow merge where fields from the other config
	 * take precedence over this config's fields. Modifies this config
	 * in-place.
	 *
	 * @param other - Configuration to merge in (takes precedence)
	 *
	 * @example
	 * ```typescript
	 * const base: ExtractionConfig = { useCache: true, forceOcr: false };
	 * const override: ExtractionConfig = { forceOcr: true };
	 * base.merge(override);
	 * console.log(base.useCache); // true
	 * console.log(base.forceOcr); // true
	 * ```
	 */
	merge(other: ExtractionConfig): void;
}
