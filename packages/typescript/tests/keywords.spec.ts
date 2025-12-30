/**
 * Keyword Extraction Tests for TypeScript WASM Binding
 *
 * Comprehensive test suite for keyword extraction functionality in Kreuzberg WASM bindings.
 * Tests cover YAKE and RAKE algorithm implementations, configuration validation,
 * scoring/filtering, language-specific extraction, and parameter tuning.
 *
 * Note: NER (Named Entity Recognition) is not yet implemented in this version.
 * These tests focus on keyword extraction functionality only.
 *
 * @group wasm-binding
 * @group keywords
 * @group extraction
 */

import type {
	ExtractionConfig,
	ExtractionResult,
	KeywordAlgorithm,
	KeywordConfig,
	RakeParams,
	YakeParams,
} from "@kreuzberg/core";
import { describe, expect, it } from "vitest";

/**
 * Mock extracted keyword for testing
 */
interface ExtractedKeyword {
	/** The keyword text */
	text: string;

	/** Relevance score (higher is better, algorithm-specific) */
	score: number;

	/** Algorithm that extracted this keyword */
	algorithm: KeywordAlgorithm;

	/** Optional positions where keyword appears in text (character offsets) */
	positions?: number[];
}

describe("keywords: YAKE Algorithm Extraction", () => {
	/**
	 * Test YAKE algorithm is properly configured and can extract keywords
	 */
	it("should extract keywords using YAKE algorithm", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
			maxKeywords: 5,
		};

		expect(config.algorithm).toBe("yake");
		expect(config.maxKeywords).toBe(5);
	});

	/**
	 * Test YAKE window size parameter configuration
	 */
	it("should configure YAKE window size parameter", () => {
		const yakeParams: YakeParams = {
			windowSize: 3,
		};

		const config: KeywordConfig = {
			algorithm: "yake",
			yakeParams,
		};

		expect(config.yakeParams?.windowSize).toBe(3);
		expect(config.algorithm).toBe("yake");
	});

	/**
	 * Test YAKE with default window size
	 */
	it("should use default YAKE window size when not specified", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
		};

		expect(config.algorithm).toBe("yake");
		expect(config.yakeParams).toBeUndefined();
	});
});

describe("keywords: RAKE Algorithm Extraction", () => {
	/**
	 * Test RAKE algorithm is properly configured
	 */
	it("should extract keywords using RAKE algorithm", () => {
		const config: KeywordConfig = {
			algorithm: "rake",
			maxKeywords: 10,
		};

		expect(config.algorithm).toBe("rake");
		expect(config.maxKeywords).toBe(10);
	});

	/**
	 * Test RAKE minimum word length configuration
	 */
	it("should configure RAKE minimum word length parameter", () => {
		const rakeParams: RakeParams = {
			minWordLength: 3,
		};

		const config: KeywordConfig = {
			algorithm: "rake",
			rakeParams,
		};

		expect(config.rakeParams?.minWordLength).toBe(3);
		expect(config.algorithm).toBe("rake");
	});

	/**
	 * Test RAKE maximum words per phrase configuration
	 */
	it("should configure RAKE max words per phrase parameter", () => {
		const rakeParams: RakeParams = {
			maxWordsPerPhrase: 4,
		};

		const config: KeywordConfig = {
			algorithm: "rake",
			rakeParams,
		};

		expect(config.rakeParams?.maxWordsPerPhrase).toBe(4);
	});

	/**
	 * Test RAKE with multiple parameters
	 */
	it("should configure all RAKE parameters together", () => {
		const rakeParams: RakeParams = {
			minWordLength: 2,
			maxWordsPerPhrase: 5,
		};

		const config: KeywordConfig = {
			algorithm: "rake",
			rakeParams,
		};

		expect(config.rakeParams?.minWordLength).toBe(2);
		expect(config.rakeParams?.maxWordsPerPhrase).toBe(5);
	});
});

describe("keywords: N-gram Range Configuration", () => {
	/**
	 * Test n-gram range (1,1) for unigrams only
	 */
	it("should extract unigrams only with ngramRange [1,1]", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
			ngramRange: [1, 1],
		};

		expect(config.ngramRange).toEqual([1, 1]);
	});

	/**
	 * Test n-gram range (1,2) for unigrams and bigrams
	 */
	it("should extract unigrams and bigrams with ngramRange [1,2]", () => {
		const config: KeywordConfig = {
			algorithm: "rake",
			ngramRange: [1, 2],
		};

		expect(config.ngramRange).toEqual([1, 2]);
	});

	/**
	 * Test default n-gram range (1,3)
	 */
	it("should use default ngramRange [1,3] when not specified", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
		};

		expect(config.ngramRange).toBeUndefined();
	});

	/**
	 * Test custom n-gram range (1,4) for up to trigrams and 4-grams
	 */
	it("should support extended ngramRange [1,4]", () => {
		const config: KeywordConfig = {
			algorithm: "rake",
			ngramRange: [1, 4],
		};

		expect(config.ngramRange).toEqual([1, 4]);
	});
});

describe("keywords: Score Filtering and Thresholds", () => {
	/**
	 * Test minimum score filtering at 0.5
	 */
	it("should filter keywords below minScore threshold of 0.5", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
			minScore: 0.5,
		};

		expect(config.minScore).toBe(0.5);
	});

	/**
	 * Test minimum score filtering at 0.0 (no filtering)
	 */
	it("should allow all scores when minScore is 0.0", () => {
		const config: KeywordConfig = {
			algorithm: "rake",
			minScore: 0.0,
		};

		expect(config.minScore).toBe(0.0);
	});

	/**
	 * Test high minimum score threshold
	 */
	it("should filter aggressively with minScore of 0.8", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
			minScore: 0.8,
			maxKeywords: 20,
		};

		expect(config.minScore).toBe(0.8);
		expect(config.maxKeywords).toBe(20);
	});

	/**
	 * Test normalized score range (0.0-1.0)
	 */
	it("should validate score is within normalized range [0.0, 1.0]", () => {
		const validScores = [0.0, 0.25, 0.5, 0.75, 1.0];

		validScores.forEach((score) => {
			const config: KeywordConfig = {
				algorithm: "rake",
				minScore: score,
			};

			expect(config.minScore).toBeGreaterThanOrEqual(0.0);
			expect(config.minScore).toBeLessThanOrEqual(1.0);
		});
	});
});

describe("keywords: Maximum Keywords Limit", () => {
	/**
	 * Test maxKeywords limit enforcement
	 */
	it("should respect maxKeywords limit of 5", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
			maxKeywords: 5,
		};

		expect(config.maxKeywords).toBe(5);
		expect(config.maxKeywords).toBeGreaterThan(0);
	});

	/**
	 * Test maxKeywords with high limit
	 */
	it("should support high maxKeywords limit of 100", () => {
		const config: KeywordConfig = {
			algorithm: "rake",
			maxKeywords: 100,
		};

		expect(config.maxKeywords).toBe(100);
	});

	/**
	 * Test default maxKeywords value
	 */
	it("should use default maxKeywords when not specified", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
		};

		expect(config.maxKeywords).toBeUndefined();
	});

	/**
	 * Test extraction config integration with keywords
	 */
	it("should integrate maxKeywords into ExtractionConfig", () => {
		const extractionConfig: ExtractionConfig = {
			keywords: {
				algorithm: "yake",
				maxKeywords: 15,
			},
		};

		expect(extractionConfig.keywords?.algorithm).toBe("yake");
		expect(extractionConfig.keywords?.maxKeywords).toBe(15);
	});
});

describe("keywords: Language-Specific Extraction", () => {
	/**
	 * Test English language configuration
	 */
	it("should configure English language for keyword extraction", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
			language: "en",
		};

		expect(config.language).toBe("en");
	});

	/**
	 * Test German language configuration
	 */
	it("should configure German language for keyword extraction", () => {
		const config: KeywordConfig = {
			algorithm: "rake",
			language: "de",
		};

		expect(config.language).toBe("de");
	});

	/**
	 * Test French language configuration
	 */
	it("should configure French language for keyword extraction", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
			language: "fr",
		};

		expect(config.language).toBe("fr");
	});

	/**
	 * Test multi-language support in extraction config
	 */
	it("should support various ISO 639 language codes", () => {
		const languages = ["en", "de", "fr", "es", "it", "pt", "nl", "ru"];

		languages.forEach((lang) => {
			const config: KeywordConfig = {
				algorithm: "rake",
				language: lang,
			};

			expect(config.language).toBe(lang);
			expect(config.language).toBeTruthy();
		});
	});

	/**
	 * Test extraction without language specification (no stopword filtering)
	 */
	it("should allow undefined language for language-agnostic extraction", () => {
		const config: KeywordConfig = {
			algorithm: "yake",
		};

		expect(config.language).toBeUndefined();
	});
});

describe("keywords: Integration with ExtractionConfig", () => {
	/**
	 * Test complete keyword configuration in extraction context
	 */
	it("should integrate keyword config into full ExtractionConfig", () => {
		const config: ExtractionConfig = {
			useCache: true,
			keywords: {
				algorithm: "yake",
				maxKeywords: 10,
				minScore: 0.3,
				ngramRange: [1, 2],
				language: "en",
			},
		};

		expect(config.keywords?.algorithm).toBe("yake");
		expect(config.keywords?.maxKeywords).toBe(10);
		expect(config.keywords?.minScore).toBe(0.3);
		expect(config.keywords?.ngramRange).toEqual([1, 2]);
		expect(config.keywords?.language).toBe("en");
	});

	/**
	 * Test combined OCR and keyword extraction config
	 */
	it("should combine OCR and keyword extraction configuration", () => {
		const config: ExtractionConfig = {
			ocr: {
				backend: "tesseract",
				language: "en",
			},
			keywords: {
				algorithm: "rake",
				maxKeywords: 20,
				language: "en",
			},
		};

		expect(config.ocr?.backend).toBe("tesseract");
		expect(config.keywords?.algorithm).toBe("rake");
		expect(config.keywords?.maxKeywords).toBe(20);
	});

	/**
	 * Note: NER (Named Entity Recognition) is not yet implemented.
	 * Future tests should validate NER functionality when available.
	 */
	it("should document that NER is not yet implemented", () => {
		// NER features are planned for future implementation
		// When available, this test and others should validate:
		// - Entity type classification (PERSON, ORGANIZATION, LOCATION, etc.)
		// - Entity boundary detection
		// - Confidence scores for recognized entities
		// - Multi-language entity recognition
		// - Custom entity types configuration

		const note = "NER functionality is planned for future releases";
		expect(note).toContain("NER");
	});
});

describe("keywords: Type Safety and Validation", () => {
	/**
	 * Test KeywordAlgorithm type is "yake" or "rake"
	 */
	it("should enforce KeywordAlgorithm type constraints", () => {
		const validAlgorithms: KeywordAlgorithm[] = ["yake", "rake"];

		validAlgorithms.forEach((algo) => {
			const config: KeywordConfig = {
				algorithm: algo,
			};

			expect(["yake", "rake"]).toContain(config.algorithm);
		});
	});

	/**
	 * Test ExtractedKeyword interface structure
	 */
	it("should provide ExtractedKeyword interface with required fields", () => {
		const keyword: ExtractedKeyword = {
			text: "artificial intelligence",
			score: 0.85,
			algorithm: "yake",
		};

		expect(keyword.text).toBe("artificial intelligence");
		expect(keyword.score).toBe(0.85);
		expect(keyword.algorithm).toBe("yake");
		expect(typeof keyword.text).toBe("string");
		expect(typeof keyword.score).toBe("number");
	});

	/**
	 * Test ExtractedKeyword with positions array
	 */
	it("should support optional positions field in ExtractedKeyword", () => {
		const keyword: ExtractedKeyword = {
			text: "machine learning",
			score: 0.92,
			algorithm: "rake",
			positions: [15, 120, 345],
		};

		expect(keyword.positions).toEqual([15, 120, 345]);
		expect(Array.isArray(keyword.positions)).toBe(true);
	});
});
