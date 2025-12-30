/**
 * KeywordConfig configuration tests
 *
 * Tests for KeywordConfig feature that allows users to configure keyword
 * extraction algorithms, scoring thresholds, and language-specific settings.
 */

import { describe, it, expect } from "vitest";
import type {
	KeywordConfig,
	KeywordAlgorithm,
	YakeParams,
	RakeParams,
	ExtractionConfig,
} from "@kreuzberg/core";

describe("WASM: KeywordConfig", () => {
	describe("type definitions", () => {
		it("should define valid KeywordConfig type", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 10,
				minScore: 0.0,
				ngramRange: [1, 3],
				language: "en",
			};

			expect(config.algorithm).toBe("yake");
			expect(config.maxKeywords).toBe(10);
			expect(config.minScore).toBe(0.0);
			expect(config.ngramRange).toEqual([1, 3]);
			expect(config.language).toBe("en");
		});

		it("should support optional fields", () => {
			const minimalConfig: KeywordConfig = {};

			expect(minimalConfig.algorithm).toBeUndefined();
			expect(minimalConfig.maxKeywords).toBeUndefined();
			expect(minimalConfig.minScore).toBeUndefined();
		});

		it("should support different algorithms", () => {
			const yakeConfig: KeywordConfig = { algorithm: "yake" };
			const rakeConfig: KeywordConfig = { algorithm: "rake" };

			expect(yakeConfig.algorithm).toBe("yake");
			expect(rakeConfig.algorithm).toBe("rake");
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 15,
				minScore: 0.1,
				ngramRange: [1, 2],
				language: "en",
			};

			const json = JSON.stringify(config);
			const parsed: KeywordConfig = JSON.parse(json);

			expect(parsed.algorithm).toBe("yake");
			expect(parsed.maxKeywords).toBe(15);
			expect(parsed.minScore).toBe(0.1);
			expect(parsed.ngramRange).toEqual([1, 2]);
			expect(parsed.language).toBe("en");
		});

		it("should handle undefined fields in serialization", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: undefined,
				minScore: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("maxKeywords");
			expect(json).toContain("algorithm");
		});

		it("should serialize YAKE algorithm parameters", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				yakeParams: {
					windowSize: 3,
				},
			};

			const json = JSON.stringify(config);
			const parsed: KeywordConfig = JSON.parse(json);

			expect(parsed.yakeParams?.windowSize).toBe(3);
		});

		it("should serialize RAKE algorithm parameters", () => {
			const config: KeywordConfig = {
				algorithm: "rake",
				rakeParams: {
					minWordLength: 2,
					maxWordsPerPhrase: 4,
				},
			};

			const json = JSON.stringify(config);
			const parsed: KeywordConfig = JSON.parse(json);

			expect(parsed.rakeParams?.minWordLength).toBe(2);
			expect(parsed.rakeParams?.maxWordsPerPhrase).toBe(4);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 10,
				minScore: 0.1,
				ngramRange: [1, 3],
			};

			const cloned = structuredClone(config);

			expect(cloned.algorithm).toBe("yake");
			expect(cloned.maxKeywords).toBe(10);
			expect(cloned.ngramRange).toEqual([1, 3]);
		});

		it("should handle nested configs in ExtractionConfig", () => {
			const extractionConfig: ExtractionConfig = {
				keywords: {
					algorithm: "rake",
					maxKeywords: 20,
					language: "de",
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.keywords?.algorithm).toBe("rake");
			expect(cloned.keywords?.maxKeywords).toBe(20);
			expect(cloned.keywords?.language).toBe("de");
		});

		it("should preserve complex keyword configs with parameters", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 25,
				minScore: 0.5,
				ngramRange: [1, 4],
				language: "fr",
				yakeParams: {
					windowSize: 4,
				},
			};

			const cloned = structuredClone(config);

			expect(cloned.yakeParams?.windowSize).toBe(4);
			expect(cloned.ngramRange).toEqual([1, 4]);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: KeywordConfig[] = Array.from({ length: 1000 }, () => ({
				algorithm: "yake" as KeywordAlgorithm,
				maxKeywords: 10,
			}));

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.algorithm).toBe("yake");
			});
		});

		it("should handle various language codes", () => {
			const languages = ["en", "de", "fr", "es", "it", "pt", "ja", "zh"];
			const configs: KeywordConfig[] = languages.map((lang) => ({
				algorithm: "yake" as KeywordAlgorithm,
				language: lang,
			}));

			expect(configs).toHaveLength(8);
			expect(configs[0].language).toBe("en");
			expect(configs[7].language).toBe("zh");
		});
	});

	describe("type safety", () => {
		it("should enforce algorithm as valid string when defined", () => {
			const config: KeywordConfig = { algorithm: "yake" };
			if (config.algorithm !== undefined) {
				expect(["yake", "rake"]).toContain(config.algorithm);
			}
		});

		it("should enforce maxKeywords as number when defined", () => {
			const config: KeywordConfig = { maxKeywords: 10 };
			if (config.maxKeywords !== undefined) {
				expect(typeof config.maxKeywords).toBe("number");
			}
		});

		it("should enforce minScore as number when defined", () => {
			const config: KeywordConfig = { minScore: 0.5 };
			if (config.minScore !== undefined) {
				expect(typeof config.minScore).toBe("number");
			}
		});

		it("should enforce ngramRange as tuple when defined", () => {
			const config: KeywordConfig = { ngramRange: [1, 3] };
			if (config.ngramRange !== undefined) {
				expect(Array.isArray(config.ngramRange)).toBe(true);
				expect(config.ngramRange).toHaveLength(2);
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				keywords: {
					algorithm: "yake",
					maxKeywords: 15,
					minScore: 0.1,
				},
			};

			expect(config.keywords).toBeDefined();
			expect(config.keywords?.algorithm).toBe("yake");
			expect(config.keywords?.maxKeywords).toBe(15);
		});

		it("should handle null keyword config", () => {
			const config: ExtractionConfig = {
				keywords: null as unknown as KeywordConfig,
			};

			expect(config.keywords).toBeNull();
		});

		it("should support keywords with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				keywords: {
					algorithm: "rake",
					maxKeywords: 20,
				},
				enableQualityProcessing: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.keywords?.algorithm).toBe("rake");
			expect(config.enableQualityProcessing).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 10,
				minScore: 0.0,
				ngramRange: [1, 3],
				language: "en",
				yakeParams: {
					windowSize: 2,
				},
				rakeParams: {
					minWordLength: 1,
					maxWordsPerPhrase: 3,
				},
			};

			expect(config).toHaveProperty("algorithm");
			expect(config).toHaveProperty("maxKeywords");
			expect(config).toHaveProperty("minScore");
			expect(config).toHaveProperty("ngramRange");
			expect(config).toHaveProperty("yakeParams");
			expect(config).toHaveProperty("rakeParams");
		});
	});

	describe("edge cases", () => {
		it("should handle zero maxKeywords", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 0,
			};

			expect(config.maxKeywords).toBe(0);
		});

		it("should handle very large maxKeywords", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 10000,
			};

			expect(config.maxKeywords).toBe(10000);
		});

		it("should handle zero minScore", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				minScore: 0.0,
			};

			expect(config.minScore).toBe(0.0);
		});

		it("should handle 1.0 minScore", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				minScore: 1.0,
			};

			expect(config.minScore).toBe(1.0);
		});

		it("should handle ngram ranges", () => {
			const configs: KeywordConfig[] = [
				{ ngramRange: [1, 1] },
				{ ngramRange: [1, 2] },
				{ ngramRange: [1, 3] },
				{ ngramRange: [2, 4] },
			];

			expect(configs).toHaveLength(4);
			expect(configs[0].ngramRange).toEqual([1, 1]);
			expect(configs[3].ngramRange).toEqual([2, 4]);
		});

		it("should handle empty language string", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				language: "",
			};

			expect(config.language).toBe("");
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 10,
				minScore: 0.1,
			};

			const updated: KeywordConfig = {
				...original,
				maxKeywords: 20,
			};

			expect(original.maxKeywords).toBe(10);
			expect(updated.maxKeywords).toBe(20);
			expect(updated.algorithm).toBe("yake");
		});

		it("should support algorithm switching updates", () => {
			const original: KeywordConfig = {
				algorithm: "yake" as KeywordAlgorithm,
				yakeParams: {
					windowSize: 2,
				},
			};

			const updated: KeywordConfig = {
				...original,
				algorithm: "rake" as KeywordAlgorithm,
			};

			expect(original.algorithm).toBe("yake");
			expect(updated.algorithm).toBe("rake");
		});

		it("should support ngram range updates", () => {
			const original: KeywordConfig = {
				algorithm: "yake",
				ngramRange: [1, 2],
			};

			const updated: KeywordConfig = {
				...original,
				ngramRange: [1, 4],
			};

			expect(original.ngramRange).toEqual([1, 2]);
			expect(updated.ngramRange).toEqual([1, 4]);
		});

		it("should support nested parameter updates", () => {
			const original: KeywordConfig = {
				algorithm: "yake",
				yakeParams: {
					windowSize: 2,
				},
			};

			const updated: KeywordConfig = {
				...original,
				yakeParams: {
					...original.yakeParams,
					windowSize: 3,
				},
			};

			expect(original.yakeParams?.windowSize).toBe(2);
			expect(updated.yakeParams?.windowSize).toBe(3);
		});
	});

	describe("practical scenarios", () => {
		it("should support default YAKE extraction", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 10,
				minScore: 0.0,
				ngramRange: [1, 3],
			};

			expect(config.algorithm).toBe("yake");
		});

		it("should support RAKE with custom parameters", () => {
			const config: KeywordConfig = {
				algorithm: "rake",
				maxKeywords: 20,
				rakeParams: {
					minWordLength: 3,
					maxWordsPerPhrase: 5,
				},
			};

			expect(config.rakeParams?.minWordLength).toBe(3);
		});

		it("should support multilingual keyword extraction", () => {
			const languages = {
				en: { algorithm: "yake" as KeywordAlgorithm, language: "en" },
				de: { algorithm: "yake" as KeywordAlgorithm, language: "de" },
				fr: { algorithm: "yake" as KeywordAlgorithm, language: "fr" },
			};

			Object.values(languages).forEach((config) => {
				expect(config.algorithm).toBe("yake");
			});
		});

		it("should support strict scoring threshold", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 5,
				minScore: 0.7,
			};

			expect(config.minScore).toBe(0.7);
		});

		it("should support comprehensive keyword configuration", () => {
			const config: KeywordConfig = {
				algorithm: "yake",
				maxKeywords: 25,
				minScore: 0.5,
				ngramRange: [1, 4],
				language: "en",
				yakeParams: {
					windowSize: 4,
				},
			};

			expect(config.ngramRange).toEqual([1, 4]);
			expect(config.yakeParams?.windowSize).toBe(4);
		});
	});
});
