/**
 * OcrConfig configuration tests
 *
 * Tests for OcrConfig feature that allows users to configure OCR backend,
 * language settings, and Tesseract-specific options for document processing.
 */

import { describe, it, expect } from "vitest";
import type { OcrConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: OcrConfig", () => {
	describe("type definitions", () => {
		it("should define valid OcrConfig type", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: "eng",
			};

			expect(config.backend).toBe("tesseract");
			expect(config.language).toBe("eng");
		});

		it("should support optional fields", () => {
			const minimalConfig: OcrConfig = {
				backend: "tesseract",
			};

			expect(minimalConfig.backend).toBe("tesseract");
			expect(minimalConfig.language).toBeUndefined();
			expect(minimalConfig.tesseractConfig).toBeUndefined();
		});

		it("should support all backend types", () => {
			const tesseract: OcrConfig = { backend: "tesseract" };
			const easyocr: OcrConfig = { backend: "easyocr" };
			const paddleocr: OcrConfig = { backend: "paddleocr" };

			expect([tesseract, easyocr, paddleocr]).toHaveLength(3);
			expect(tesseract.backend).toBe("tesseract");
			expect(easyocr.backend).toBe("easyocr");
			expect(paddleocr.backend).toBe("paddleocr");
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: "eng",
			};

			const json = JSON.stringify(config);
			const parsed: OcrConfig = JSON.parse(json);

			expect(parsed.backend).toBe(config.backend);
			expect(parsed.language).toBe(config.language);
		});

		it("should handle undefined fields in serialization", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("language");
			expect(json).toContain("backend");
		});

		it("should serialize tesseractConfig nested object", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: {
					psm: 3,
					enableTableDetection: true,
				},
			};

			const json = JSON.stringify(config);
			const parsed: OcrConfig = JSON.parse(json);

			expect(parsed.tesseractConfig?.psm).toBe(3);
			expect(parsed.tesseractConfig?.enableTableDetection).toBe(true);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: "eng",
			};

			const cloned = structuredClone(config);

			expect(cloned.backend).toBe(config.backend);
			expect(cloned.language).toBe(config.language);
		});

		it("should handle nested configs in workers", () => {
			const extractionConfig: ExtractionConfig = {
				ocr: {
					backend: "tesseract",
					language: "fra",
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.ocr?.backend).toBe("tesseract");
			expect(cloned.ocr?.language).toBe("fra");
		});

		it("should preserve complex nested structures", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: "deu",
				tesseractConfig: {
					psm: 6,
					enableTableDetection: false,
					tesseditCharWhitelist: "0123456789",
				},
			};

			const cloned = structuredClone(config);

			expect(cloned.tesseractConfig?.psm).toBe(6);
			expect(cloned.tesseractConfig?.enableTableDetection).toBe(false);
			expect(cloned.tesseractConfig?.tesseditCharWhitelist).toBe("0123456789");
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: OcrConfig[] = Array.from({ length: 1000 }, () => ({
				backend: "tesseract",
				language: "eng",
			}));

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.backend).toBe("tesseract");
			});
		});

		it("should handle multiple language configurations", () => {
			const languages = ["eng", "fra", "deu", "ita", "spa"];
			const configs: OcrConfig[] = languages.map((lang) => ({
				backend: "tesseract",
				language: lang,
			}));

			expect(configs).toHaveLength(5);
			expect(configs[0].language).toBe("eng");
			expect(configs[4].language).toBe("spa");
		});
	});

	describe("type safety", () => {
		it("should enforce backend as string", () => {
			const config: OcrConfig = { backend: "tesseract" };
			expect(typeof config.backend).toBe("string");
		});

		it("should enforce language as string when defined", () => {
			const config: OcrConfig = { backend: "tesseract", language: "eng" };
			if (config.language !== undefined) {
				expect(typeof config.language).toBe("string");
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				ocr: {
					backend: "tesseract",
					language: "eng",
				},
			};

			expect(config.ocr).toBeDefined();
			expect(config.ocr?.backend).toBe("tesseract");
			expect(config.ocr?.language).toBe("eng");
		});

		it("should handle null OCR config", () => {
			const config: ExtractionConfig = {
				ocr: null as unknown as OcrConfig,
			};

			expect(config.ocr).toBeNull();
		});

		it("should support OCR with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				ocr: {
					backend: "easyocr",
					language: "fra",
				},
				forceOcr: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.ocr?.backend).toBe("easyocr");
			expect(config.forceOcr).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: {
					psm: 3,
					enableTableDetection: true,
					tesseditCharWhitelist: "0-9",
				},
			};

			expect(config).toHaveProperty("backend");
			expect(config).toHaveProperty("tesseractConfig");
			expect(config.tesseractConfig).toHaveProperty("psm");
			expect(config.tesseractConfig).toHaveProperty("enableTableDetection");
		});
	});

	describe("edge cases", () => {
		it("should handle empty string language", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: "",
			};

			expect(config.language).toBe("");
		});

		it("should handle undefined tesseractConfig", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: undefined,
			};

			expect(config.tesseractConfig).toBeUndefined();
		});

		it("should handle multiple language codes", () => {
			const config: OcrConfig = {
				backend: "tesseract",
				language: "eng+fra+deu",
			};

			expect(config.language).toBe("eng+fra+deu");
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: OcrConfig = {
				backend: "tesseract",
				language: "eng",
			};

			const updated: OcrConfig = {
				...original,
				language: "fra",
			};

			expect(original.language).toBe("eng");
			expect(updated.language).toBe("fra");
			expect(updated.backend).toBe("tesseract");
		});

		it("should support object spreading with nested config", () => {
			const original: OcrConfig = {
				backend: "tesseract",
				tesseractConfig: {
					psm: 3,
				},
			};

			const updated: OcrConfig = {
				...original,
				tesseractConfig: {
					...original.tesseractConfig,
					psm: 6,
				},
			};

			expect(original.tesseractConfig?.psm).toBe(3);
			expect(updated.tesseractConfig?.psm).toBe(6);
		});
	});
});
