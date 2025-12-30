/**
 * HtmlConversionOptions configuration tests
 *
 * Tests for HtmlConversionOptions feature that allows users to configure
 * HTML-to-Markdown conversion parameters with comprehensive formatting options.
 */

import { describe, it, expect } from "vitest";
import type {
	HtmlConversionOptions,
	HtmlPreprocessingOptions,
	ExtractionConfig,
} from "@kreuzberg/core";

describe("WASM: HtmlConversionOptions", () => {
	describe("type definitions", () => {
		it("should define valid HtmlConversionOptions type", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "spaces",
				listIndentWidth: 2,
				escapeAsterisks: true,
				escapeUnderscores: true,
				wrap: false,
				wrapWidth: 80,
			};

			expect(config.headingStyle).toBe("atx");
			expect(config.listIndentType).toBe("spaces");
			expect(config.listIndentWidth).toBe(2);
			expect(config.escapeAsterisks).toBe(true);
		});

		it("should support optional fields", () => {
			const minimalConfig: HtmlConversionOptions = {};

			expect(minimalConfig.headingStyle).toBeUndefined();
			expect(minimalConfig.listIndentType).toBeUndefined();
			expect(minimalConfig.escapeAsterisks).toBeUndefined();
		});

		it("should support different heading styles", () => {
			const atx: HtmlConversionOptions = { headingStyle: "atx" };
			const underlined: HtmlConversionOptions = { headingStyle: "underlined" };
			const atxClosed: HtmlConversionOptions = { headingStyle: "atx_closed" };

			expect(atx.headingStyle).toBe("atx");
			expect(underlined.headingStyle).toBe("underlined");
			expect(atxClosed.headingStyle).toBe("atx_closed");
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "tabs",
				listIndentWidth: 4,
				escapeAsterisks: false,
				autolinks: true,
			};

			const json = JSON.stringify(config);
			const parsed: HtmlConversionOptions = JSON.parse(json);

			expect(parsed.headingStyle).toBe("atx");
			expect(parsed.listIndentType).toBe("tabs");
			expect(parsed.listIndentWidth).toBe(4);
			expect(parsed.escapeAsterisks).toBe(false);
			expect(parsed.autolinks).toBe(true);
		});

		it("should handle undefined fields in serialization", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: undefined,
				escapeAsterisks: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("listIndentType");
			expect(json).toContain("headingStyle");
		});

		it("should serialize preprocessing options", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				preprocessing: {
					enabled: true,
					preset: "standard",
					removeNavigation: true,
					removeForms: false,
				},
			};

			const json = JSON.stringify(config);
			const parsed: HtmlConversionOptions = JSON.parse(json);

			expect(parsed.preprocessing?.enabled).toBe(true);
			expect(parsed.preprocessing?.preset).toBe("standard");
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "spaces",
				listIndentWidth: 2,
				escapeAsterisks: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.headingStyle).toBe("atx");
			expect(cloned.listIndentType).toBe("spaces");
			expect(cloned.listIndentWidth).toBe(2);
			expect(cloned.escapeAsterisks).toBe(true);
		});

		it("should handle nested preprocessing options", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				preprocessing: {
					enabled: true,
					preset: "aggressive",
					removeNavigation: true,
					removeForms: true,
				},
			};

			const cloned = structuredClone(config);

			expect(cloned.preprocessing?.enabled).toBe(true);
			expect(cloned.preprocessing?.preset).toBe("aggressive");
		});

		it("should preserve complex HTML conversion configs", () => {
			const extractionConfig: ExtractionConfig = {
				htmlOptions: {
					headingStyle: "underlined",
					listIndentType: "tabs",
					listIndentWidth: 4,
					preprocessing: {
						enabled: true,
						preset: "standard",
						removeNavigation: true,
					},
					escapeAsterisks: true,
					escapeUnderscores: true,
					wrap: true,
					wrapWidth: 100,
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.htmlOptions?.headingStyle).toBe("underlined");
			expect(cloned.htmlOptions?.preprocessing?.removeNavigation).toBe(true);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: HtmlConversionOptions[] = Array.from(
				{ length: 1000 },
				() => ({
					headingStyle: "atx" as "atx" | "underlined" | "atx_closed",
					listIndentType: "spaces" as "spaces" | "tabs",
					listIndentWidth: 2,
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.headingStyle).toBe("atx");
			});
		});

		it("should handle large configuration objects", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "spaces",
				stripTags: Array.from({ length: 100 }, (_, i) => `tag${i}`),
				preserveTags: Array.from({ length: 100 }, (_, i) => `keep${i}`),
				keepInlineImagesIn: Array.from({ length: 50 }, (_, i) => `elem${i}`),
			};

			expect(config.stripTags?.length).toBe(100);
			expect(config.preserveTags?.length).toBe(100);
		});
	});

	describe("type safety", () => {
		it("should enforce headingStyle as valid string when defined", () => {
			const config: HtmlConversionOptions = { headingStyle: "atx" };
			if (config.headingStyle !== undefined) {
				expect([
					"atx",
					"underlined",
					"atx_closed",
				]).toContain(config.headingStyle);
			}
		});

		it("should enforce listIndentType as valid string when defined", () => {
			const config: HtmlConversionOptions = { listIndentType: "spaces" };
			if (config.listIndentType !== undefined) {
				expect(["spaces", "tabs"]).toContain(config.listIndentType);
			}
		});

		it("should enforce listIndentWidth as number when defined", () => {
			const config: HtmlConversionOptions = { listIndentWidth: 2 };
			if (config.listIndentWidth !== undefined) {
				expect(typeof config.listIndentWidth).toBe("number");
			}
		});

		it("should enforce escapeAsterisks as boolean when defined", () => {
			const config: HtmlConversionOptions = { escapeAsterisks: true };
			if (config.escapeAsterisks !== undefined) {
				expect(typeof config.escapeAsterisks).toBe("boolean");
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				htmlOptions: {
					headingStyle: "atx",
					listIndentType: "spaces",
					listIndentWidth: 2,
				},
			};

			expect(config.htmlOptions).toBeDefined();
			expect(config.htmlOptions?.headingStyle).toBe("atx");
			expect(config.htmlOptions?.listIndentWidth).toBe(2);
		});

		it("should handle null HTML options config", () => {
			const config: ExtractionConfig = {
				htmlOptions: null as unknown as HtmlConversionOptions,
			};

			expect(config.htmlOptions).toBeNull();
		});

		it("should support HTML options with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				htmlOptions: {
					headingStyle: "underlined",
					escapeAsterisks: true,
				},
				enableQualityProcessing: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.htmlOptions?.headingStyle).toBe("underlined");
			expect(config.enableQualityProcessing).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "spaces",
				listIndentWidth: 2,
				escapeAsterisks: true,
				escapeUnderscores: true,
				escapeMisc: true,
				escapeAscii: false,
				codeLanguage: "javascript",
				autolinks: true,
				defaultTitle: true,
				brInTables: false,
				hocrSpatialTables: true,
				highlightStyle: "bold",
				extractMetadata: true,
				whitespaceMode: "normalized",
				stripNewlines: false,
				wrap: true,
				wrapWidth: 80,
				convertAsInline: false,
				subSymbol: "~",
				supSymbol: "^",
				newlineStyle: "spaces",
				codeBlockStyle: "backticks",
				debug: false,
			};

			expect(config).toHaveProperty("headingStyle");
			expect(config).toHaveProperty("listIndentType");
			expect(config).toHaveProperty("escapeAsterisks");
			expect(config).toHaveProperty("escapeUnderscores");
		});
	});

	describe("edge cases", () => {
		it("should handle zero list indent width", () => {
			const config: HtmlConversionOptions = {
				listIndentType: "spaces",
				listIndentWidth: 0,
			};

			expect(config.listIndentWidth).toBe(0);
		});

		it("should handle very large list indent width", () => {
			const config: HtmlConversionOptions = {
				listIndentType: "spaces",
				listIndentWidth: 999,
			};

			expect(config.listIndentWidth).toBe(999);
		});

		it("should handle zero wrap width", () => {
			const config: HtmlConversionOptions = {
				wrap: true,
				wrapWidth: 0,
			};

			expect(config.wrapWidth).toBe(0);
		});

		it("should handle very large wrap width", () => {
			const config: HtmlConversionOptions = {
				wrap: true,
				wrapWidth: 10000,
			};

			expect(config.wrapWidth).toBe(10000);
		});

		it("should handle empty lists", () => {
			const config: HtmlConversionOptions = {
				stripTags: [],
				preserveTags: [],
				keepInlineImagesIn: [],
			};

			expect(config.stripTags).toEqual([]);
			expect(config.preserveTags).toEqual([]);
			expect(config.keepInlineImagesIn).toEqual([]);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "spaces",
				listIndentWidth: 2,
			};

			const updated: HtmlConversionOptions = {
				...original,
				listIndentWidth: 4,
			};

			expect(original.listIndentWidth).toBe(2);
			expect(updated.listIndentWidth).toBe(4);
			expect(updated.headingStyle).toBe("atx");
		});

		it("should support heading style updates", () => {
			const original: HtmlConversionOptions = {
				headingStyle: "atx" as "atx" | "underlined" | "atx_closed",
			};

			const updated: HtmlConversionOptions = {
				...original,
				headingStyle: "underlined",
			};

			expect(original.headingStyle).toBe("atx");
			expect(updated.headingStyle).toBe("underlined");
		});

		it("should support tag list updates", () => {
			const original: HtmlConversionOptions = {
				stripTags: ["div", "span"],
			};

			const updated: HtmlConversionOptions = {
				...original,
				stripTags: [...(original.stripTags || []), "p"],
			};

			expect(original.stripTags).toEqual(["div", "span"]);
			expect(updated.stripTags).toEqual(["div", "span", "p"]);
		});

		it("should support nested preprocessing updates", () => {
			const original: HtmlConversionOptions = {
				headingStyle: "atx",
				preprocessing: {
					enabled: true,
					preset: "standard",
					removeNavigation: false,
				},
			};

			const updated: HtmlConversionOptions = {
				...original,
				preprocessing: {
					...original.preprocessing,
					removeNavigation: true,
				},
			};

			expect(original.preprocessing?.removeNavigation).toBe(false);
			expect(updated.preprocessing?.removeNavigation).toBe(true);
			expect(updated.preprocessing?.preset).toBe("standard");
		});
	});

	describe("practical scenarios", () => {
		it("should support standard HTML-to-Markdown conversion", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "spaces",
				listIndentWidth: 2,
				escapeAsterisks: true,
				escapeUnderscores: true,
				wrap: false,
			};

			expect(config.headingStyle).toBe("atx");
		});

		it("should support aggressive HTML cleanup", () => {
			const config: HtmlConversionOptions = {
				preprocessing: {
					enabled: true,
					preset: "aggressive",
					removeNavigation: true,
					removeForms: true,
				},
				stripTags: ["script", "style", "meta"],
				stripNewlines: true,
			};

			expect(config.preprocessing?.preset).toBe("aggressive");
		});

		it("should support custom HTML handling", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "underlined",
				listIndentType: "tabs",
				listIndentWidth: 4,
				escapeAsterisks: false,
				autolinks: true,
				highlightStyle: "bold",
				codeBlockStyle: "tildes",
			};

			expect(config.listIndentType).toBe("tabs");
			expect(config.codeBlockStyle).toBe("tildes");
		});

		it("should support comprehensive conversion configuration", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				listIndentType: "spaces",
				listIndentWidth: 2,
				escapeAsterisks: true,
				escapeUnderscores: true,
				escapeMisc: true,
				codeLanguage: "javascript",
				autolinks: true,
				brInTables: true,
				highlightStyle: "bold",
				extractMetadata: true,
				wrap: true,
				wrapWidth: 80,
				codeBlockStyle: "backticks",
				preprocessing: {
					enabled: true,
					preset: "standard",
					removeNavigation: true,
					removeForms: false,
				},
			};

			expect(config.headingStyle).toBe("atx");
			expect(config.preprocessing?.preset).toBe("standard");
		});
	});
});
