/**
 * PdfConfig configuration tests
 *
 * Tests for PdfConfig feature that allows users to configure PDF-specific
 * extraction options including image extraction, passwords, metadata, and fonts.
 */

import { describe, it, expect } from "vitest";
import type { PdfConfig, FontConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: PdfConfig", () => {
	describe("type definitions", () => {
		it("should define valid PdfConfig type", () => {
			const config: PdfConfig = {
				extractImages: true,
				passwords: ["password123"],
				extractMetadata: true,
			};

			expect(config.extractImages).toBe(true);
			expect(config.passwords).toEqual(["password123"]);
			expect(config.extractMetadata).toBe(true);
		});

		it("should support optional fields", () => {
			const minimalConfig: PdfConfig = {};

			expect(minimalConfig.extractImages).toBeUndefined();
			expect(minimalConfig.passwords).toBeUndefined();
			expect(minimalConfig.extractMetadata).toBeUndefined();
			expect(minimalConfig.fontConfig).toBeUndefined();
		});

		it("should support nested FontConfig", () => {
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/usr/share/fonts"],
				},
			};

			expect(config.fontConfig).toBeDefined();
			expect(config.fontConfig?.enabled).toBe(true);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: PdfConfig = {
				extractImages: true,
				passwords: ["pass1", "pass2"],
				extractMetadata: false,
			};

			const json = JSON.stringify(config);
			const parsed: PdfConfig = JSON.parse(json);

			expect(parsed.extractImages).toBe(true);
			expect(parsed.passwords).toEqual(["pass1", "pass2"]);
			expect(parsed.extractMetadata).toBe(false);
		});

		it("should handle undefined fields in serialization", () => {
			const config: PdfConfig = {
				extractImages: true,
				passwords: undefined,
				extractMetadata: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("passwords");
			expect(json).toContain("extractImages");
		});

		it("should serialize FontConfig nested object", () => {
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/fonts/custom"],
				},
			};

			const json = JSON.stringify(config);
			const parsed: PdfConfig = JSON.parse(json);

			expect(parsed.fontConfig?.enabled).toBe(true);
			expect(parsed.fontConfig?.customFontDirs).toEqual(["/fonts/custom"]);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: PdfConfig = {
				extractImages: true,
				passwords: ["secret"],
				extractMetadata: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.extractImages).toBe(true);
			expect(cloned.passwords).toEqual(["secret"]);
			expect(cloned.extractMetadata).toBe(true);
		});

		it("should handle nested FontConfig in workers", () => {
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/path/to/fonts"],
				},
			};

			const cloned = structuredClone(config);

			expect(cloned.fontConfig?.enabled).toBe(true);
			expect(cloned.fontConfig?.customFontDirs).toEqual(["/path/to/fonts"]);
		});

		it("should preserve complex nested extraction configs", () => {
			const extractionConfig: ExtractionConfig = {
				pdfOptions: {
					extractImages: true,
					passwords: ["pwd1", "pwd2"],
					extractMetadata: true,
					fontConfig: {
						enabled: true,
						customFontDirs: ["/fonts"],
					},
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.pdfOptions?.fontConfig?.enabled).toBe(true);
			expect(cloned.pdfOptions?.passwords).toEqual(["pwd1", "pwd2"]);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: PdfConfig[] = Array.from({ length: 1000 }, () => ({
				extractImages: true,
				extractMetadata: false,
			}));

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.extractImages).toBe(true);
			});
		});

		it("should handle multiple passwords efficiently", () => {
			const passwords = Array.from({ length: 100 }, (_, i) => `password${i}`);
			const config: PdfConfig = {
				extractImages: true,
				passwords,
			};

			expect(config.passwords?.length).toBe(100);
		});

		it("should handle multiple font directories", () => {
			const fontDirs = Array.from(
				{ length: 50 },
				(_, i) => `/fonts/dir${i}`
			);
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: fontDirs,
				},
			};

			expect(config.fontConfig?.customFontDirs?.length).toBe(50);
		});
	});

	describe("type safety", () => {
		it("should enforce extractImages as boolean when defined", () => {
			const config: PdfConfig = { extractImages: true };
			if (config.extractImages !== undefined) {
				expect(typeof config.extractImages).toBe("boolean");
			}
		});

		it("should enforce passwords as string array when defined", () => {
			const config: PdfConfig = { passwords: ["pass"] };
			if (config.passwords !== undefined) {
				expect(Array.isArray(config.passwords)).toBe(true);
				config.passwords.forEach((pwd) => {
					expect(typeof pwd).toBe("string");
				});
			}
		});

		it("should enforce extractMetadata as boolean when defined", () => {
			const config: PdfConfig = { extractMetadata: true };
			if (config.extractMetadata !== undefined) {
				expect(typeof config.extractMetadata).toBe("boolean");
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				pdfOptions: {
					extractImages: true,
					passwords: ["secret"],
					extractMetadata: true,
				},
			};

			expect(config.pdfOptions).toBeDefined();
			expect(config.pdfOptions?.extractImages).toBe(true);
			expect(config.pdfOptions?.passwords).toEqual(["secret"]);
		});

		it("should handle null PDF config", () => {
			const config: ExtractionConfig = {
				pdfOptions: null as unknown as PdfConfig,
			};

			expect(config.pdfOptions).toBeNull();
		});

		it("should support PDF options with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				pdfOptions: {
					extractImages: true,
					extractMetadata: false,
				},
				forceOcr: false,
			};

			expect(config.useCache).toBe(true);
			expect(config.pdfOptions?.extractImages).toBe(true);
			expect(config.forceOcr).toBe(false);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: PdfConfig = {
				extractImages: true,
				extractMetadata: true,
				fontConfig: {
					enabled: true,
					customFontDirs: [],
				},
			};

			expect(config).toHaveProperty("extractImages");
			expect(config).toHaveProperty("extractMetadata");
			expect(config).toHaveProperty("fontConfig");
			expect(config.fontConfig).toHaveProperty("customFontDirs");
		});
	});

	describe("edge cases", () => {
		it("should handle empty passwords array", () => {
			const config: PdfConfig = {
				extractImages: true,
				passwords: [],
			};

			expect(config.passwords).toEqual([]);
		});

		it("should handle single password", () => {
			const config: PdfConfig = {
				extractImages: true,
				passwords: ["onlypassword"],
			};

			expect(config.passwords).toEqual(["onlypassword"]);
		});

		it("should handle very long password strings", () => {
			const longPassword = "a".repeat(1000);
			const config: PdfConfig = {
				extractImages: true,
				passwords: [longPassword],
			};

			expect(config.passwords?.[0]).toBe(longPassword);
		});

		it("should handle undefined fontConfig", () => {
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: undefined,
			};

			expect(config.fontConfig).toBeUndefined();
		});

		it("should handle empty font directories", () => {
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: [],
				},
			};

			expect(config.fontConfig?.customFontDirs).toEqual([]);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: PdfConfig = {
				extractImages: true,
				extractMetadata: false,
			};

			const updated: PdfConfig = {
				...original,
				extractMetadata: true,
			};

			expect(original.extractMetadata).toBe(false);
			expect(updated.extractMetadata).toBe(true);
			expect(updated.extractImages).toBe(true);
		});

		it("should support password array updates", () => {
			const original: PdfConfig = {
				extractImages: true,
				passwords: ["pass1"],
			};

			const updated: PdfConfig = {
				...original,
				passwords: [...(original.passwords || []), "pass2"],
			};

			expect(original.passwords).toEqual(["pass1"]);
			expect(updated.passwords).toEqual(["pass1", "pass2"]);
		});

		it("should support nested FontConfig spreading", () => {
			const original: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/fonts"],
				},
			};

			const updated: PdfConfig = {
				...original,
				fontConfig: {
					...original.fontConfig,
					customFontDirs: [
						...(original.fontConfig?.customFontDirs || []),
						"/more-fonts",
					],
				},
			};

			expect(original.fontConfig?.customFontDirs).toEqual(["/fonts"]);
			expect(updated.fontConfig?.customFontDirs).toEqual([
				"/fonts",
				"/more-fonts",
			]);
		});
	});

	describe("integration scenarios", () => {
		it("should support password-protected PDF extraction", () => {
			const config: PdfConfig = {
				extractImages: false,
				passwords: ["securepassword"],
				extractMetadata: true,
			};

			expect(config.passwords).toEqual(["securepassword"]);
		});

		it("should support custom font PDF extraction", () => {
			const config: PdfConfig = {
				extractImages: true,
				extractMetadata: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/usr/share/fonts", "~/custom-fonts"],
				},
			};

			expect(config.fontConfig?.enabled).toBe(true);
			expect(config.fontConfig?.customFontDirs).toHaveLength(2);
		});
	});
});
