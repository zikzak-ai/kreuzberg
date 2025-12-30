/**
 * FontConfig configuration tests
 *
 * Tests for FontConfig feature that allows users to enable/disable custom
 * font provider and add custom font directories.
 */

import { describe, it, expect } from "vitest";
import type { FontConfig, PdfConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: FontConfig", () => {
	describe("type definitions", () => {
		it("should define valid FontConfig type", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["/usr/share/fonts", "~/fonts"],
			};

			expect(config.enabled).toBe(true);
			expect(config.customFontDirs).toEqual(["/usr/share/fonts", "~/fonts"]);
		});

		it("should support optional fields", () => {
			const minimalConfig: FontConfig = {};

			expect(minimalConfig.enabled).toBeUndefined();
			expect(minimalConfig.customFontDirs).toBeUndefined();
		});

		it("should support various directory paths", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: [
					"/usr/share/fonts",
					"/usr/local/share/fonts",
					"~/fonts",
					"./fonts",
					"/path/with/spaces/fonts",
				],
			};

			expect(config.customFontDirs).toHaveLength(5);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["/fonts1", "/fonts2"],
			};

			const json = JSON.stringify(config);
			const parsed: FontConfig = JSON.parse(json);

			expect(parsed.enabled).toBe(true);
			expect(parsed.customFontDirs).toEqual(["/fonts1", "/fonts2"]);
		});

		it("should handle undefined fields in serialization", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("customFontDirs");
			expect(json).toContain("enabled");
		});

		it("should serialize all field types correctly", () => {
			const config: FontConfig = {
				enabled: false,
				customFontDirs: ["/custom/fonts/path"],
			};

			const json = JSON.stringify(config);
			const parsed: FontConfig = JSON.parse(json);

			expect(parsed.enabled).toBe(false);
			expect(parsed.customFontDirs).toEqual(["/custom/fonts/path"]);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["/fonts"],
			};

			const cloned = structuredClone(config);

			expect(cloned.enabled).toBe(true);
			expect(cloned.customFontDirs).toEqual(["/fonts"]);
		});

		it("should handle nested configs in PdfConfig", () => {
			const pdfConfig: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/usr/share/fonts"],
				},
			};

			const cloned = structuredClone(pdfConfig);

			expect(cloned.fontConfig?.enabled).toBe(true);
			expect(cloned.fontConfig?.customFontDirs).toEqual([
				"/usr/share/fonts",
			]);
		});

		it("should preserve complex font configurations", () => {
			const extractionConfig: ExtractionConfig = {
				pdfOptions: {
					extractImages: true,
					fontConfig: {
						enabled: true,
						customFontDirs: ["/fonts1", "/fonts2", "/fonts3"],
					},
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.pdfOptions?.fontConfig?.customFontDirs).toEqual([
				"/fonts1",
				"/fonts2",
				"/fonts3",
			]);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: FontConfig[] = Array.from({ length: 1000 }, () => ({
				enabled: true,
				customFontDirs: ["/fonts"],
			}));

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.enabled).toBe(true);
			});
		});

		it("should handle large font directory lists", () => {
			const fontDirs = Array.from(
				{ length: 100 },
				(_, i) => `/fonts/dir${i}`
			);
			const config: FontConfig = {
				enabled: true,
				customFontDirs: fontDirs,
			};

			expect(config.customFontDirs?.length).toBe(100);
		});

		it("should handle long path strings", () => {
			const longPath =
				"/very/long/path/".repeat(10) + "fonts/directory";
			const config: FontConfig = {
				enabled: true,
				customFontDirs: [longPath],
			};

			expect(config.customFontDirs?.[0]).toBe(longPath);
		});
	});

	describe("type safety", () => {
		it("should enforce enabled as boolean when defined", () => {
			const config: FontConfig = { enabled: true };
			if (config.enabled !== undefined) {
				expect(typeof config.enabled).toBe("boolean");
			}
		});

		it("should enforce customFontDirs as string array when defined", () => {
			const config: FontConfig = { customFontDirs: ["/fonts"] };
			if (config.customFontDirs !== undefined) {
				expect(Array.isArray(config.customFontDirs)).toBe(true);
				config.customFontDirs.forEach((dir) => {
					expect(typeof dir).toBe("string");
				});
			}
		});
	});

	describe("nesting in PdfConfig", () => {
		it("should nest properly in PdfConfig", () => {
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/fonts"],
				},
			};

			expect(config.fontConfig).toBeDefined();
			expect(config.fontConfig?.enabled).toBe(true);
			expect(config.fontConfig?.customFontDirs).toEqual(["/fonts"]);
		});

		it("should handle null font config", () => {
			const config: PdfConfig = {
				extractImages: true,
				fontConfig: null as unknown as FontConfig,
			};

			expect(config.fontConfig).toBeNull();
		});

		it("should support font config with other PDF options", () => {
			const config: PdfConfig = {
				extractImages: true,
				passwords: ["pwd"],
				extractMetadata: true,
				fontConfig: {
					enabled: true,
					customFontDirs: ["/fonts"],
				},
			};

			expect(config.extractImages).toBe(true);
			expect(config.fontConfig?.enabled).toBe(true);
			expect(config.passwords).toEqual(["pwd"]);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["/fonts"],
			};

			expect(config).toHaveProperty("enabled");
			expect(config).toHaveProperty("customFontDirs");
		});
	});

	describe("edge cases", () => {
		it("should handle empty font directories array", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: [],
			};

			expect(config.customFontDirs).toEqual([]);
			expect(config.customFontDirs?.length).toBe(0);
		});

		it("should handle single font directory", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["/single/fonts"],
			};

			expect(config.customFontDirs).toEqual(["/single/fonts"]);
		});

		it("should handle absolute paths", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["/usr/share/fonts", "/usr/local/share/fonts"],
			};

			expect(config.customFontDirs?.every((dir) => dir.startsWith("/"))).toBe(
				true
			);
		});

		it("should handle relative paths", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["./fonts", "../fonts", "~/fonts"],
			};

			expect(config.customFontDirs).toHaveLength(3);
		});

		it("should handle paths with spaces", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["/path with spaces/fonts"],
			};

			expect(config.customFontDirs?.[0]).toBe("/path with spaces/fonts");
		});

		it("should handle disabled fonts with directories", () => {
			const config: FontConfig = {
				enabled: false,
				customFontDirs: ["/fonts"],
			};

			expect(config.enabled).toBe(false);
			expect(config.customFontDirs).toEqual(["/fonts"]);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: FontConfig = {
				enabled: true,
				customFontDirs: ["/fonts"],
			};

			const updated: FontConfig = {
				...original,
				enabled: false,
			};

			expect(original.enabled).toBe(true);
			expect(updated.enabled).toBe(false);
			expect(updated.customFontDirs).toEqual(["/fonts"]);
		});

		it("should support font directory array updates", () => {
			const original: FontConfig = {
				enabled: true,
				customFontDirs: ["/fonts1"],
			};

			const updated: FontConfig = {
				...original,
				customFontDirs: [...(original.customFontDirs || []), "/fonts2"],
			};

			expect(original.customFontDirs).toEqual(["/fonts1"]);
			expect(updated.customFontDirs).toEqual(["/fonts1", "/fonts2"]);
		});

		it("should support removing font directories", () => {
			const original: FontConfig = {
				enabled: true,
				customFontDirs: ["/fonts1", "/fonts2", "/fonts3"],
			};

			const updated: FontConfig = {
				...original,
				customFontDirs: (original.customFontDirs || []).filter(
					(dir) => !dir.includes("fonts2")
				),
			};

			expect(original.customFontDirs).toEqual(["/fonts1", "/fonts2", "/fonts3"]);
			expect(updated.customFontDirs).toEqual(["/fonts1", "/fonts3"]);
		});

		it("should support nested FontConfig spreading in PdfConfig", () => {
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

	describe("practical scenarios", () => {
		it("should support system font directories", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: [
					"/usr/share/fonts",
					"/usr/local/share/fonts",
					"~/.fonts",
				],
			};

			expect(config.customFontDirs).toHaveLength(3);
		});

		it("should support project-specific fonts", () => {
			const config: FontConfig = {
				enabled: true,
				customFontDirs: ["./assets/fonts", "./node_modules/@company/fonts"],
			};

			expect(config.customFontDirs).toHaveLength(2);
		});

		it("should support disabled custom fonts", () => {
			const config: FontConfig = {
				enabled: false,
			};

			expect(config.enabled).toBe(false);
		});
	});
});
