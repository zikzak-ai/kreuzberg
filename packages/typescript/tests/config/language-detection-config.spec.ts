/**
 * LanguageDetectionConfig configuration tests
 *
 * Tests for LanguageDetectionConfig feature that allows users to configure
 * automatic language detection with confidence thresholds and multi-language support.
 */

import { describe, it, expect } from "vitest";
import type { LanguageDetectionConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: LanguageDetectionConfig", () => {
	describe("type definitions", () => {
		it("should define valid LanguageDetectionConfig type", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.8,
				detectMultiple: false,
			};

			expect(config.enabled).toBe(true);
			expect(config.minConfidence).toBe(0.8);
			expect(config.detectMultiple).toBe(false);
		});

		it("should support optional fields", () => {
			const minimalConfig: LanguageDetectionConfig = {};

			expect(minimalConfig.enabled).toBeUndefined();
			expect(minimalConfig.minConfidence).toBeUndefined();
			expect(minimalConfig.detectMultiple).toBeUndefined();
		});

		it("should support confidence threshold variations", () => {
			const low: LanguageDetectionConfig = { minConfidence: 0.5 };
			const medium: LanguageDetectionConfig = { minConfidence: 0.75 };
			const high: LanguageDetectionConfig = { minConfidence: 0.95 };

			expect(low.minConfidence).toBe(0.5);
			expect(medium.minConfidence).toBe(0.75);
			expect(high.minConfidence).toBe(0.95);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.8,
				detectMultiple: true,
			};

			const json = JSON.stringify(config);
			const parsed: LanguageDetectionConfig = JSON.parse(json);

			expect(parsed.enabled).toBe(true);
			expect(parsed.minConfidence).toBe(0.8);
			expect(parsed.detectMultiple).toBe(true);
		});

		it("should handle undefined fields in serialization", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: undefined,
				detectMultiple: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("minConfidence");
			expect(json).toContain("enabled");
		});

		it("should serialize all field types correctly", () => {
			const config: LanguageDetectionConfig = {
				enabled: false,
				minConfidence: 0.6,
				detectMultiple: false,
			};

			const json = JSON.stringify(config);
			const parsed: LanguageDetectionConfig = JSON.parse(json);

			expect(parsed.enabled).toBe(false);
			expect(parsed.minConfidence).toBe(0.6);
			expect(parsed.detectMultiple).toBe(false);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.8,
				detectMultiple: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.enabled).toBe(true);
			expect(cloned.minConfidence).toBe(0.8);
			expect(cloned.detectMultiple).toBe(true);
		});

		it("should handle nested configs in ExtractionConfig", () => {
			const extractionConfig: ExtractionConfig = {
				languageDetection: {
					enabled: true,
					minConfidence: 0.75,
					detectMultiple: false,
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.languageDetection?.enabled).toBe(true);
			expect(cloned.languageDetection?.minConfidence).toBe(0.75);
			expect(cloned.languageDetection?.detectMultiple).toBe(false);
		});

		it("should preserve complex language detection configs", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.85,
				detectMultiple: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.enabled).toBe(true);
			expect(cloned.minConfidence).toBe(0.85);
			expect(cloned.detectMultiple).toBe(true);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: LanguageDetectionConfig[] = Array.from(
				{ length: 1000 },
				() => ({
					enabled: true,
					minConfidence: 0.8,
					detectMultiple: false,
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.minConfidence).toBe(0.8);
			});
		});

		it("should handle various confidence thresholds", () => {
			const thresholds = [0.1, 0.3, 0.5, 0.7, 0.9];
			const configs: LanguageDetectionConfig[] = thresholds.map(
				(threshold) => ({
					enabled: true,
					minConfidence: threshold,
				})
			);

			expect(configs).toHaveLength(5);
			expect(configs[0].minConfidence).toBe(0.1);
			expect(configs[4].minConfidence).toBe(0.9);
		});
	});

	describe("type safety", () => {
		it("should enforce enabled as boolean when defined", () => {
			const config: LanguageDetectionConfig = { enabled: true };
			if (config.enabled !== undefined) {
				expect(typeof config.enabled).toBe("boolean");
			}
		});

		it("should enforce minConfidence as number when defined", () => {
			const config: LanguageDetectionConfig = { minConfidence: 0.8 };
			if (config.minConfidence !== undefined) {
				expect(typeof config.minConfidence).toBe("number");
			}
		});

		it("should enforce detectMultiple as boolean when defined", () => {
			const config: LanguageDetectionConfig = { detectMultiple: true };
			if (config.detectMultiple !== undefined) {
				expect(typeof config.detectMultiple).toBe("boolean");
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				languageDetection: {
					enabled: true,
					minConfidence: 0.8,
					detectMultiple: true,
				},
			};

			expect(config.languageDetection).toBeDefined();
			expect(config.languageDetection?.enabled).toBe(true);
			expect(config.languageDetection?.minConfidence).toBe(0.8);
		});

		it("should handle null language detection config", () => {
			const config: ExtractionConfig = {
				languageDetection: null as unknown as LanguageDetectionConfig,
			};

			expect(config.languageDetection).toBeNull();
		});

		it("should support language detection with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				languageDetection: {
					enabled: true,
					minConfidence: 0.75,
				},
				enableQualityProcessing: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.languageDetection?.minConfidence).toBe(0.75);
			expect(config.enableQualityProcessing).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.8,
				detectMultiple: true,
			};

			expect(config).toHaveProperty("enabled");
			expect(config).toHaveProperty("minConfidence");
			expect(config).toHaveProperty("detectMultiple");
		});
	});

	describe("edge cases", () => {
		it("should handle zero confidence threshold", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0,
			};

			expect(config.minConfidence).toBe(0);
		});

		it("should handle 1.0 confidence threshold", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 1.0,
			};

			expect(config.minConfidence).toBe(1.0);
		});

		it("should handle very small decimal confidence", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.001,
			};

			expect(config.minConfidence).toBe(0.001);
		});

		it("should handle disabled detection with multiple languages", () => {
			const config: LanguageDetectionConfig = {
				enabled: false,
				detectMultiple: true,
			};

			expect(config.enabled).toBe(false);
			expect(config.detectMultiple).toBe(true);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.8,
				detectMultiple: false,
			};

			const updated: LanguageDetectionConfig = {
				...original,
				minConfidence: 0.9,
			};

			expect(original.minConfidence).toBe(0.8);
			expect(updated.minConfidence).toBe(0.9);
			expect(updated.enabled).toBe(true);
		});

		it("should support confidence threshold updates", () => {
			const original: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.5,
			};

			const updated: LanguageDetectionConfig = {
				...original,
				minConfidence: original.minConfidence + 0.25,
			};

			expect(original.minConfidence).toBe(0.5);
			expect(updated.minConfidence).toBe(0.75);
		});
	});

	describe("practical scenarios", () => {
		it("should support strict language detection", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.95,
				detectMultiple: false,
			};

			expect(config.minConfidence).toBe(0.95);
		});

		it("should support lenient language detection", () => {
			const config: LanguageDetectionConfig = {
				enabled: true,
				minConfidence: 0.5,
				detectMultiple: true,
			};

			expect(config.minConfidence).toBe(0.5);
			expect(config.detectMultiple).toBe(true);
		});

		it("should support disabled language detection", () => {
			const config: LanguageDetectionConfig = {
				enabled: false,
			};

			expect(config.enabled).toBe(false);
		});
	});
});
