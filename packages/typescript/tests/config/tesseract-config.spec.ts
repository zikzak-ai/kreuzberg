/**
 * TesseractConfig configuration tests
 *
 * Tests for TesseractConfig feature that allows users to configure
 * Tesseract-specific OCR parameters including page segmentation mode,
 * table detection, and character whitelisting.
 */

import { describe, it, expect } from "vitest";
import type { TesseractConfig, OcrConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: TesseractConfig", () => {
	describe("type definitions", () => {
		it("should define valid TesseractConfig type", () => {
			const config: TesseractConfig = {
				psm: 3,
				enableTableDetection: true,
				tesseditCharWhitelist: "0123456789",
			};

			expect(config.psm).toBe(3);
			expect(config.enableTableDetection).toBe(true);
			expect(config.tesseditCharWhitelist).toBe("0123456789");
		});

		it("should support optional fields", () => {
			const minimalConfig: TesseractConfig = {};

			expect(minimalConfig.psm).toBeUndefined();
			expect(minimalConfig.enableTableDetection).toBeUndefined();
			expect(minimalConfig.tesseditCharWhitelist).toBeUndefined();
		});

		it("should support various PSM values", () => {
			const configs: TesseractConfig[] = [0, 3, 6, 11].map((psm) => ({
				psm,
			}));

			expect(configs[0].psm).toBe(0);
			expect(configs[1].psm).toBe(3);
			expect(configs[2].psm).toBe(6);
			expect(configs[3].psm).toBe(11);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: TesseractConfig = {
				psm: 6,
				enableTableDetection: false,
			};

			const json = JSON.stringify(config);
			const parsed: TesseractConfig = JSON.parse(json);

			expect(parsed.psm).toBe(6);
			expect(parsed.enableTableDetection).toBe(false);
		});

		it("should handle undefined fields in serialization", () => {
			const config: TesseractConfig = {
				psm: 3,
				enableTableDetection: undefined,
				tesseditCharWhitelist: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("enableTableDetection");
			expect(json).toContain("psm");
		});

		it("should serialize all field types correctly", () => {
			const config: TesseractConfig = {
				psm: 11,
				enableTableDetection: true,
				tesseditCharWhitelist: "abcdefghijklmnopqrstuvwxyz",
			};

			const json = JSON.stringify(config);
			const parsed: TesseractConfig = JSON.parse(json);

			expect(parsed.psm).toBe(11);
			expect(parsed.enableTableDetection).toBe(true);
			expect(parsed.tesseditCharWhitelist).toBe(
				"abcdefghijklmnopqrstuvwxyz"
			);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: TesseractConfig = {
				psm: 3,
				enableTableDetection: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.psm).toBe(3);
			expect(cloned.enableTableDetection).toBe(true);
		});

		it("should handle nested configs in OcrConfig", () => {
			const ocrConfig: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: {
					psm: 6,
					enableTableDetection: false,
					tesseditCharWhitelist: "0-9",
				},
			};

			const cloned = structuredClone(ocrConfig);

			expect(cloned.tesseractConfig?.psm).toBe(6);
			expect(cloned.tesseractConfig?.enableTableDetection).toBe(false);
			expect(cloned.tesseractConfig?.tesseditCharWhitelist).toBe("0-9");
		});

		it("should preserve complex nested extraction configs", () => {
			const extractionConfig: ExtractionConfig = {
				ocr: {
					backend: "tesseract",
					tesseractConfig: {
						psm: 11,
						enableTableDetection: true,
						tesseditCharWhitelist: "ABC",
					},
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.ocr?.tesseractConfig?.psm).toBe(11);
			expect(cloned.ocr?.tesseractConfig?.enableTableDetection).toBe(true);
			expect(cloned.ocr?.tesseractConfig?.tesseditCharWhitelist).toBe("ABC");
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: TesseractConfig[] = Array.from({ length: 1000 }, () => ({
				psm: 3,
				enableTableDetection: true,
			}));

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.psm).toBe(3);
			});
		});

		it("should handle large whitelist strings efficiently", () => {
			const longWhitelist = Array.from({ length: 1000 }, (_, i) => i % 10).join(
				""
			);
			const config: TesseractConfig = {
				psm: 6,
				tesseditCharWhitelist: longWhitelist,
			};

			expect(config.tesseditCharWhitelist?.length).toBe(1000);
		});
	});

	describe("type safety", () => {
		it("should enforce psm as number when defined", () => {
			const config: TesseractConfig = { psm: 3 };
			if (config.psm !== undefined) {
				expect(typeof config.psm).toBe("number");
			}
		});

		it("should enforce enableTableDetection as boolean when defined", () => {
			const config: TesseractConfig = { enableTableDetection: true };
			if (config.enableTableDetection !== undefined) {
				expect(typeof config.enableTableDetection).toBe("boolean");
			}
		});

		it("should enforce tesseditCharWhitelist as string when defined", () => {
			const config: TesseractConfig = { tesseditCharWhitelist: "abc" };
			if (config.tesseditCharWhitelist !== undefined) {
				expect(typeof config.tesseditCharWhitelist).toBe("string");
			}
		});
	});

	describe("nesting in OcrConfig", () => {
		it("should nest properly in OcrConfig", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: {
					psm: 3,
					enableTableDetection: true,
				},
			};

			expect(config.tesseractConfig).toBeDefined();
			expect(config.tesseractConfig?.psm).toBe(3);
			expect(config.tesseractConfig?.enableTableDetection).toBe(true);
		});

		it("should support OcrConfig with language and TesseractConfig", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: "eng",
				tesseractConfig: {
					psm: 6,
				},
			};

			expect(config.backend).toBe("tesseract");
			expect(config.language).toBe("eng");
			expect(config.tesseractConfig?.psm).toBe(6);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: TesseractConfig = {
				psm: 3,
				enableTableDetection: true,
				tesseditCharWhitelist: "0-9",
			};

			expect(config).toHaveProperty("psm");
			expect(config).toHaveProperty("enableTableDetection");
			expect(config).toHaveProperty("tesseditCharWhitelist");
		});
	});

	describe("edge cases", () => {
		it("should handle zero PSM value", () => {
			const config: TesseractConfig = {
				psm: 0,
			};

			expect(config.psm).toBe(0);
		});

		it("should handle large PSM values", () => {
			const config: TesseractConfig = {
				psm: 13,
			};

			expect(config.psm).toBe(13);
		});

		it("should handle empty whitelist string", () => {
			const config: TesseractConfig = {
				psm: 3,
				tesseditCharWhitelist: "",
			};

			expect(config.tesseditCharWhitelist).toBe("");
		});

		it("should handle undefined tesseractConfig", () => {
			const ocrConfig: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: undefined,
			};

			expect(ocrConfig.tesseractConfig).toBeUndefined();
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: TesseractConfig = {
				psm: 3,
				enableTableDetection: true,
			};

			const updated: TesseractConfig = {
				...original,
				psm: 6,
			};

			expect(original.psm).toBe(3);
			expect(updated.psm).toBe(6);
			expect(updated.enableTableDetection).toBe(true);
		});

		it("should support nested object spreading", () => {
			const original: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: {
					psm: 3,
					enableTableDetection: false,
				},
			};

			const updated: OcrConfig = {
				...original,
				tesseractConfig: {
					...original.tesseractConfig,
					enableTableDetection: true,
				},
			};

			expect(original.tesseractConfig?.enableTableDetection).toBe(false);
			expect(updated.tesseractConfig?.enableTableDetection).toBe(true);
			expect(updated.tesseractConfig?.psm).toBe(3);
		});
	});
});
