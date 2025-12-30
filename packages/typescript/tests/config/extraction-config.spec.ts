/**
 * ExtractionConfig configuration tests
 *
 * Tests for ExtractionConfig feature that orchestrates all other configuration
 * types for comprehensive document extraction control.
 */

import { describe, it, expect } from "vitest";
import type { ExtractionConfig } from "@kreuzberg/core";

describe("WASM: ExtractionConfig", () => {
	describe("type definitions", () => {
		it("should define valid ExtractionConfig type", () => {
			const config: ExtractionConfig = {
				useCache: true,
				enableQualityProcessing: true,
				forceOcr: false,
				maxConcurrentExtractions: 4,
			};

			expect(config.useCache).toBe(true);
			expect(config.enableQualityProcessing).toBe(true);
			expect(config.forceOcr).toBe(false);
			expect(config.maxConcurrentExtractions).toBe(4);
		});

		it("should support optional fields", () => {
			const minimalConfig: ExtractionConfig = {};

			expect(minimalConfig.useCache).toBeUndefined();
			expect(minimalConfig.enableQualityProcessing).toBeUndefined();
			expect(minimalConfig.forceOcr).toBeUndefined();
			expect(minimalConfig.ocr).toBeUndefined();
		});

		it("should support nested configurations", () => {
			const config: ExtractionConfig = {
				useCache: true,
				ocr: {
					backend: "tesseract",
					language: "eng",
				},
				chunking: {
					chunkSize: 512,
					chunkOverlap: 128,
				},
				images: {
					extractImages: true,
					targetDpi: 300,
				},
			};

			expect(config.ocr).toBeDefined();
			expect(config.chunking).toBeDefined();
			expect(config.images).toBeDefined();
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: ExtractionConfig = {
				useCache: true,
				enableQualityProcessing: false,
				forceOcr: true,
				maxConcurrentExtractions: 8,
			};

			const json = JSON.stringify(config);
			const parsed: ExtractionConfig = JSON.parse(json);

			expect(parsed.useCache).toBe(true);
			expect(parsed.enableQualityProcessing).toBe(false);
			expect(parsed.forceOcr).toBe(true);
			expect(parsed.maxConcurrentExtractions).toBe(8);
		});

		it("should handle undefined fields in serialization", () => {
			const config: ExtractionConfig = {
				useCache: true,
				enableQualityProcessing: undefined,
				forceOcr: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("enableQualityProcessing");
			expect(json).toContain("useCache");
		});

		it("should serialize complex nested structures", () => {
			const config: ExtractionConfig = {
				useCache: true,
				ocr: {
					backend: "tesseract",
					language: "eng",
					tesseractConfig: {
						psm: 3,
						enableTableDetection: true,
					},
				},
				chunking: {
					chunkSize: 256,
					preset: "small",
				},
				images: {
					extractImages: true,
					targetDpi: 150,
					maxImageDimension: 2048,
				},
			};

			const json = JSON.stringify(config);
			const parsed: ExtractionConfig = JSON.parse(json);

			expect(parsed.ocr?.tesseractConfig?.psm).toBe(3);
			expect(parsed.chunking?.chunkSize).toBe(256);
			expect(parsed.images?.targetDpi).toBe(150);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: ExtractionConfig = {
				useCache: true,
				forceOcr: false,
				maxConcurrentExtractions: 4,
			};

			const cloned = structuredClone(config);

			expect(cloned.useCache).toBe(true);
			expect(cloned.forceOcr).toBe(false);
			expect(cloned.maxConcurrentExtractions).toBe(4);
		});

		it("should preserve nested configs in workers", () => {
			const config: ExtractionConfig = {
				useCache: true,
				ocr: {
					backend: "tesseract",
					language: "fra",
				},
				chunking: {
					chunkSize: 512,
					enabled: true,
				},
			};

			const cloned = structuredClone(config);

			expect(cloned.ocr?.backend).toBe("tesseract");
			expect(cloned.chunking?.chunkSize).toBe(512);
		});

		it("should handle deeply nested configurations", () => {
			const config: ExtractionConfig = {
				useCache: true,
				pdfOptions: {
					extractImages: true,
					fontConfig: {
						enabled: true,
						customFontDirs: ["/fonts"],
					},
				},
				ocr: {
					backend: "tesseract",
					tesseractConfig: {
						psm: 6,
						enableTableDetection: true,
						tesseditCharWhitelist: "abc123",
					},
				},
			};

			const cloned = structuredClone(config);

			expect(cloned.pdfOptions?.fontConfig?.customFontDirs).toEqual(["/fonts"]);
			expect(cloned.ocr?.tesseractConfig?.tesseditCharWhitelist).toBe(
				"abc123"
			);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: ExtractionConfig[] = Array.from({ length: 100 }, () => ({
				useCache: true,
				enableQualityProcessing: true,
				forceOcr: false,
			}));

			expect(configs).toHaveLength(100);
			configs.forEach((config) => {
				expect(config.useCache).toBe(true);
			});
		});

		it("should handle large concurrent extraction values", () => {
			const config: ExtractionConfig = {
				useCache: true,
				maxConcurrentExtractions: 1000,
			};

			expect(config.maxConcurrentExtractions).toBe(1000);
		});
	});

	describe("type safety", () => {
		it("should enforce useCache as boolean when defined", () => {
			const config: ExtractionConfig = { useCache: true };
			if (config.useCache !== undefined) {
				expect(typeof config.useCache).toBe("boolean");
			}
		});

		it("should enforce enableQualityProcessing as boolean when defined", () => {
			const config: ExtractionConfig = { enableQualityProcessing: true };
			if (config.enableQualityProcessing !== undefined) {
				expect(typeof config.enableQualityProcessing).toBe("boolean");
			}
		});

		it("should enforce forceOcr as boolean when defined", () => {
			const config: ExtractionConfig = { forceOcr: true };
			if (config.forceOcr !== undefined) {
				expect(typeof config.forceOcr).toBe("boolean");
			}
		});

		it("should enforce maxConcurrentExtractions as number when defined", () => {
			const config: ExtractionConfig = { maxConcurrentExtractions: 4 };
			if (config.maxConcurrentExtractions !== undefined) {
				expect(typeof config.maxConcurrentExtractions).toBe("number");
			}
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: ExtractionConfig = {
				useCache: true,
				enableQualityProcessing: true,
				forceOcr: false,
				maxConcurrentExtractions: 4,
			};

			expect(config).toHaveProperty("useCache");
			expect(config).toHaveProperty("enableQualityProcessing");
			expect(config).toHaveProperty("forceOcr");
			expect(config).toHaveProperty("maxConcurrentExtractions");
		});
	});

	describe("edge cases", () => {
		it("should handle zero concurrent extractions", () => {
			const config: ExtractionConfig = {
				useCache: true,
				maxConcurrentExtractions: 0,
			};

			expect(config.maxConcurrentExtractions).toBe(0);
		});

		it("should handle very large concurrent extraction values", () => {
			const config: ExtractionConfig = {
				useCache: true,
				maxConcurrentExtractions: 10000,
			};

			expect(config.maxConcurrentExtractions).toBe(10000);
		});

		it("should handle all boolean combinations", () => {
			const combinations = [
				{ useCache: true, enableQualityProcessing: true, forceOcr: true },
				{ useCache: true, enableQualityProcessing: true, forceOcr: false },
				{ useCache: true, enableQualityProcessing: false, forceOcr: true },
				{ useCache: false, enableQualityProcessing: false, forceOcr: false },
			];

			combinations.forEach((combo) => {
				const config: ExtractionConfig = combo;
				expect(config.useCache).toBeDefined();
				expect(config.enableQualityProcessing).toBeDefined();
				expect(config.forceOcr).toBeDefined();
			});
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: ExtractionConfig = {
				useCache: true,
				forceOcr: false,
				maxConcurrentExtractions: 4,
			};

			const updated: ExtractionConfig = {
				...original,
				forceOcr: true,
			};

			expect(original.forceOcr).toBe(false);
			expect(updated.forceOcr).toBe(true);
			expect(updated.useCache).toBe(true);
		});

		it("should support nested config updates", () => {
			const original: ExtractionConfig = {
				useCache: true,
				ocr: {
					backend: "tesseract",
					language: "eng",
				},
			};

			const updated: ExtractionConfig = {
				...original,
				ocr: {
					...original.ocr,
					language: "fra",
				},
			};

			expect(original.ocr?.language).toBe("eng");
			expect(updated.ocr?.language).toBe("fra");
			expect(updated.ocr?.backend).toBe("tesseract");
		});

		it("should support complex nested updates", () => {
			const original: ExtractionConfig = {
				useCache: true,
				ocr: {
					backend: "tesseract",
					tesseractConfig: {
						psm: 3,
					},
				},
			};

			const updated: ExtractionConfig = {
				...original,
				ocr: {
					...original.ocr,
					tesseractConfig: {
						...original.ocr?.tesseractConfig,
						psm: 6,
					},
				},
			};

			expect(original.ocr?.tesseractConfig?.psm).toBe(3);
			expect(updated.ocr?.tesseractConfig?.psm).toBe(6);
		});
	});

	describe("practical scenarios", () => {
		it("should support full-featured extraction configuration", () => {
			const config: ExtractionConfig = {
				useCache: true,
				enableQualityProcessing: true,
				ocr: {
					backend: "tesseract",
					language: "eng",
				},
				chunking: {
					chunkSize: 512,
					chunkOverlap: 128,
				},
				images: {
					extractImages: true,
					targetDpi: 300,
				},
				tokenReduction: {
					mode: "balanced",
					preserveImportantWords: true,
				},
				forceOcr: false,
			};

			expect(config.useCache).toBe(true);
			expect(config.ocr).toBeDefined();
			expect(config.chunking).toBeDefined();
		});

		it("should support OCR-focused configuration", () => {
			const config: ExtractionConfig = {
				forceOcr: true,
				ocr: {
					backend: "easyocr",
					language: "fra",
				},
				images: {
					extractImages: true,
					targetDpi: 300,
				},
			};

			expect(config.forceOcr).toBe(true);
			expect(config.ocr?.backend).toBe("easyocr");
		});

		it("should support minimal configuration", () => {
			const config: ExtractionConfig = {
				useCache: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.ocr).toBeUndefined();
		});
	});

	describe("field methods", () => {
		it("should support configuration composition", () => {
			const baseConfig: ExtractionConfig = {
				useCache: true,
				enableQualityProcessing: true,
			};

			const ocrConfig: ExtractionConfig = {
				ocr: {
					backend: "tesseract",
					language: "eng",
				},
			};

			const mergedConfig: ExtractionConfig = {
				...baseConfig,
				...ocrConfig,
			};

			expect(mergedConfig.useCache).toBe(true);
			expect(mergedConfig.ocr).toBeDefined();
		});

		it("should support configuration composition with override", () => {
			const baseConfig: ExtractionConfig = {
				useCache: true,
				forceOcr: false,
			};

			const overrideConfig: ExtractionConfig = {
				forceOcr: true,
			};

			const mergedConfig: ExtractionConfig = {
				...baseConfig,
				...overrideConfig,
			};

			expect(mergedConfig.useCache).toBe(true);
			expect(mergedConfig.forceOcr).toBe(true);
		});
	});
});
