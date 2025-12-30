/**
 * ImageExtractionConfig configuration tests
 *
 * Tests for ImageExtractionConfig feature that allows users to configure
 * image extraction parameters including DPI, dimensions, and auto-adjustment.
 */

import { describe, it, expect } from "vitest";
import type { ImageExtractionConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: ImageExtractionConfig", () => {
	describe("type definitions", () => {
		it("should define valid ImageExtractionConfig type", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 300,
				maxImageDimension: 4096,
				autoAdjustDpi: true,
			};

			expect(config.extractImages).toBe(true);
			expect(config.targetDpi).toBe(300);
			expect(config.maxImageDimension).toBe(4096);
			expect(config.autoAdjustDpi).toBe(true);
		});

		it("should support optional fields", () => {
			const minimalConfig: ImageExtractionConfig = {};

			expect(minimalConfig.extractImages).toBeUndefined();
			expect(minimalConfig.targetDpi).toBeUndefined();
			expect(minimalConfig.maxImageDimension).toBeUndefined();
			expect(minimalConfig.autoAdjustDpi).toBeUndefined();
		});

		it("should support DPI range parameters", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				minDpi: 100,
				maxDpi: 600,
			};

			expect(config.minDpi).toBe(100);
			expect(config.maxDpi).toBe(600);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 300,
				maxImageDimension: 2048,
			};

			const json = JSON.stringify(config);
			const parsed: ImageExtractionConfig = JSON.parse(json);

			expect(parsed.extractImages).toBe(true);
			expect(parsed.targetDpi).toBe(300);
			expect(parsed.maxImageDimension).toBe(2048);
		});

		it("should handle undefined fields in serialization", () => {
			const config: ImageExtractionConfig = {
				extractImages: false,
				targetDpi: undefined,
				autoAdjustDpi: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("targetDpi");
			expect(json).toContain("extractImages");
		});

		it("should serialize all field types correctly", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 150,
				maxImageDimension: 8192,
				autoAdjustDpi: false,
				minDpi: 72,
				maxDpi: 1200,
			};

			const json = JSON.stringify(config);
			const parsed: ImageExtractionConfig = JSON.parse(json);

			expect(parsed.extractImages).toBe(true);
			expect(parsed.targetDpi).toBe(150);
			expect(parsed.maxImageDimension).toBe(8192);
			expect(parsed.autoAdjustDpi).toBe(false);
			expect(parsed.minDpi).toBe(72);
			expect(parsed.maxDpi).toBe(1200);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 300,
				maxImageDimension: 4096,
			};

			const cloned = structuredClone(config);

			expect(cloned.extractImages).toBe(true);
			expect(cloned.targetDpi).toBe(300);
			expect(cloned.maxImageDimension).toBe(4096);
		});

		it("should handle nested configs in workers", () => {
			const extractionConfig: ExtractionConfig = {
				images: {
					extractImages: true,
					targetDpi: 200,
					autoAdjustDpi: true,
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.images?.extractImages).toBe(true);
			expect(cloned.images?.targetDpi).toBe(200);
			expect(cloned.images?.autoAdjustDpi).toBe(true);
		});

		it("should preserve complex DPI range configs", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 300,
				minDpi: 100,
				maxDpi: 600,
				maxImageDimension: 4096,
				autoAdjustDpi: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.minDpi).toBe(100);
			expect(cloned.maxDpi).toBe(600);
			expect(cloned.targetDpi).toBe(300);
			expect(cloned.autoAdjustDpi).toBe(true);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: ImageExtractionConfig[] = Array.from(
				{ length: 1000 },
				() => ({
					extractImages: true,
					targetDpi: 300,
					maxImageDimension: 4096,
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.targetDpi).toBe(300);
			});
		});

		it("should handle varied DPI configurations", () => {
			const dpiValues = [72, 100, 150, 200, 300, 600];
			const configs: ImageExtractionConfig[] = dpiValues.map((dpi) => ({
				extractImages: true,
				targetDpi: dpi,
			}));

			expect(configs).toHaveLength(6);
			expect(configs[0].targetDpi).toBe(72);
			expect(configs[5].targetDpi).toBe(600);
		});
	});

	describe("type safety", () => {
		it("should enforce extractImages as boolean when defined", () => {
			const config: ImageExtractionConfig = { extractImages: true };
			if (config.extractImages !== undefined) {
				expect(typeof config.extractImages).toBe("boolean");
			}
		});

		it("should enforce targetDpi as number when defined", () => {
			const config: ImageExtractionConfig = { targetDpi: 300 };
			if (config.targetDpi !== undefined) {
				expect(typeof config.targetDpi).toBe("number");
			}
		});

		it("should enforce maxImageDimension as number when defined", () => {
			const config: ImageExtractionConfig = { maxImageDimension: 4096 };
			if (config.maxImageDimension !== undefined) {
				expect(typeof config.maxImageDimension).toBe("number");
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				images: {
					extractImages: true,
					targetDpi: 300,
					maxImageDimension: 4096,
				},
			};

			expect(config.images).toBeDefined();
			expect(config.images?.extractImages).toBe(true);
			expect(config.images?.targetDpi).toBe(300);
		});

		it("should handle null image config", () => {
			const config: ExtractionConfig = {
				images: null as unknown as ImageExtractionConfig,
			};

			expect(config.images).toBeNull();
		});

		it("should support images with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				images: {
					extractImages: true,
					targetDpi: 200,
				},
				forceOcr: false,
			};

			expect(config.useCache).toBe(true);
			expect(config.images?.targetDpi).toBe(200);
			expect(config.forceOcr).toBe(false);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 300,
				maxImageDimension: 4096,
				autoAdjustDpi: true,
				minDpi: 100,
				maxDpi: 600,
			};

			expect(config).toHaveProperty("extractImages");
			expect(config).toHaveProperty("targetDpi");
			expect(config).toHaveProperty("maxImageDimension");
			expect(config).toHaveProperty("autoAdjustDpi");
			expect(config).toHaveProperty("minDpi");
			expect(config).toHaveProperty("maxDpi");
		});
	});

	describe("edge cases", () => {
		it("should handle zero target DPI", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 0,
			};

			expect(config.targetDpi).toBe(0);
		});

		it("should handle very high DPI values", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 9600,
				maxDpi: 9600,
			};

			expect(config.targetDpi).toBe(9600);
			expect(config.maxDpi).toBe(9600);
		});

		it("should handle very large image dimensions", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				maxImageDimension: 65536,
			};

			expect(config.maxImageDimension).toBe(65536);
		});

		it("should handle minDpi equal to maxDpi", () => {
			const config: ImageExtractionConfig = {
				extractImages: true,
				minDpi: 300,
				maxDpi: 300,
			};

			expect(config.minDpi).toBe(300);
			expect(config.maxDpi).toBe(300);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: ImageExtractionConfig = {
				extractImages: true,
				targetDpi: 300,
				maxImageDimension: 4096,
			};

			const updated: ImageExtractionConfig = {
				...original,
				targetDpi: 600,
			};

			expect(original.targetDpi).toBe(300);
			expect(updated.targetDpi).toBe(600);
			expect(updated.extractImages).toBe(true);
		});

		it("should support partial updates with DPI ranges", () => {
			const original: ImageExtractionConfig = {
				extractImages: true,
				minDpi: 100,
				maxDpi: 600,
				targetDpi: 300,
			};

			const updated: ImageExtractionConfig = {
				...original,
				minDpi: 150,
				maxDpi: 800,
			};

			expect(original.minDpi).toBe(100);
			expect(updated.minDpi).toBe(150);
			expect(updated.maxDpi).toBe(800);
			expect(updated.targetDpi).toBe(300);
		});
	});
});
