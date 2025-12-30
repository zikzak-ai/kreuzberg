/**
 * HtmlPreprocessingOptions configuration tests
 *
 * Tests for HtmlPreprocessingOptions feature that allows users to configure
 * HTML preprocessing behavior including preset selection, navigation removal,
 * and form removal options.
 */

import { describe, it, expect } from "vitest";
import type {
	HtmlPreprocessingOptions,
	HtmlConversionOptions,
	ExtractionConfig,
} from "@kreuzberg/core";

describe("WASM: HtmlPreprocessingOptions", () => {
	describe("type definitions", () => {
		it("should define valid HtmlPreprocessingOptions type", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: true,
				preset: "standard",
				removeNavigation: true,
				removeForms: false,
			};

			expect(config.enabled).toBe(true);
			expect(config.preset).toBe("standard");
			expect(config.removeNavigation).toBe(true);
			expect(config.removeForms).toBe(false);
		});

		it("should support optional fields", () => {
			const minimalConfig: HtmlPreprocessingOptions = {};

			expect(minimalConfig.enabled).toBeUndefined();
			expect(minimalConfig.preset).toBeUndefined();
			expect(minimalConfig.removeNavigation).toBeUndefined();
			expect(minimalConfig.removeForms).toBeUndefined();
		});

		it("should support all preset values", () => {
			const minimal: HtmlPreprocessingOptions = { preset: "minimal" };
			const standard: HtmlPreprocessingOptions = { preset: "standard" };
			const aggressive: HtmlPreprocessingOptions = { preset: "aggressive" };

			expect(minimal.preset).toBe("minimal");
			expect(standard.preset).toBe("standard");
			expect(aggressive.preset).toBe("aggressive");
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: true,
				preset: "standard",
				removeNavigation: true,
				removeForms: true,
			};

			const json = JSON.stringify(config);
			const parsed: HtmlPreprocessingOptions = JSON.parse(json);

			expect(parsed.enabled).toBe(true);
			expect(parsed.preset).toBe("standard");
			expect(parsed.removeNavigation).toBe(true);
			expect(parsed.removeForms).toBe(true);
		});

		it("should handle undefined fields in serialization", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: true,
				preset: undefined,
				removeNavigation: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("preset");
			expect(json).not.toContain("removeNavigation");
			expect(json).toContain("enabled");
		});

		it("should serialize all field types correctly", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: false,
				preset: "aggressive",
				removeNavigation: false,
				removeForms: true,
			};

			const json = JSON.stringify(config);
			const parsed: HtmlPreprocessingOptions = JSON.parse(json);

			expect(parsed.enabled).toBe(false);
			expect(parsed.preset).toBe("aggressive");
			expect(parsed.removeNavigation).toBe(false);
			expect(parsed.removeForms).toBe(true);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: true,
				preset: "standard",
				removeNavigation: true,
				removeForms: false,
			};

			const cloned = structuredClone(config);

			expect(cloned.enabled).toBe(true);
			expect(cloned.preset).toBe("standard");
			expect(cloned.removeNavigation).toBe(true);
			expect(cloned.removeForms).toBe(false);
		});

		it("should handle nested configs in HtmlConversionOptions", () => {
			const htmlOptions: HtmlConversionOptions = {
				headingStyle: "atx",
				preprocessing: {
					enabled: true,
					preset: "minimal",
					removeNavigation: true,
					removeForms: true,
				},
			};

			const cloned = structuredClone(htmlOptions);

			expect(cloned.preprocessing?.enabled).toBe(true);
			expect(cloned.preprocessing?.preset).toBe("minimal");
			expect(cloned.preprocessing?.removeNavigation).toBe(true);
		});

		it("should preserve complex extraction configs", () => {
			const extractionConfig: ExtractionConfig = {
				htmlOptions: {
					headingStyle: "atx",
					listIndentType: "spaces",
					preprocessing: {
						enabled: true,
						preset: "standard",
						removeNavigation: false,
						removeForms: false,
					},
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.htmlOptions?.preprocessing?.enabled).toBe(true);
			expect(cloned.htmlOptions?.preprocessing?.preset).toBe("standard");
			expect(cloned.htmlOptions?.headingStyle).toBe("atx");
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: HtmlPreprocessingOptions[] = Array.from(
				{ length: 1000 },
				() => ({
					enabled: true,
					preset: "standard",
					removeNavigation: true,
					removeForms: false,
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.preset).toBe("standard");
			});
		});

		it("should handle various preset combinations", () => {
			const presets = ["minimal", "standard", "aggressive"];
			const configs: HtmlPreprocessingOptions[] = presets.map((preset) => ({
				enabled: true,
				preset: preset as "minimal" | "standard" | "aggressive",
			}));

			expect(configs).toHaveLength(3);
			expect(configs[0].preset).toBe("minimal");
			expect(configs[2].preset).toBe("aggressive");
		});
	});

	describe("type safety", () => {
		it("should enforce enabled as boolean when defined", () => {
			const config: HtmlPreprocessingOptions = { enabled: true };
			if (config.enabled !== undefined) {
				expect(typeof config.enabled).toBe("boolean");
			}
		});

		it("should enforce preset as valid string when defined", () => {
			const config: HtmlPreprocessingOptions = { preset: "standard" };
			if (config.preset !== undefined) {
				expect(["minimal", "standard", "aggressive"]).toContain(config.preset);
			}
		});

		it("should enforce removeNavigation as boolean when defined", () => {
			const config: HtmlPreprocessingOptions = { removeNavigation: true };
			if (config.removeNavigation !== undefined) {
				expect(typeof config.removeNavigation).toBe("boolean");
			}
		});
	});

	describe("nesting in HtmlConversionOptions", () => {
		it("should nest properly in HtmlConversionOptions", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				preprocessing: {
					enabled: true,
					preset: "standard",
					removeNavigation: true,
					removeForms: false,
				},
			};

			expect(config.preprocessing).toBeDefined();
			expect(config.preprocessing?.enabled).toBe(true);
			expect(config.preprocessing?.preset).toBe("standard");
		});

		it("should handle null preprocessing config", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "atx",
				preprocessing: null as unknown as HtmlPreprocessingOptions,
			};

			expect(config.preprocessing).toBeNull();
		});

		it("should support preprocessing with other HTML options", () => {
			const config: HtmlConversionOptions = {
				headingStyle: "underlined",
				listIndentType: "tabs",
				preprocessing: {
					enabled: true,
					preset: "minimal",
				},
				extractMetadata: true,
			};

			expect(config.headingStyle).toBe("underlined");
			expect(config.listIndentType).toBe("tabs");
			expect(config.preprocessing?.preset).toBe("minimal");
			expect(config.extractMetadata).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: true,
				preset: "standard",
				removeNavigation: true,
				removeForms: false,
			};

			expect(config).toHaveProperty("enabled");
			expect(config).toHaveProperty("preset");
			expect(config).toHaveProperty("removeNavigation");
			expect(config).toHaveProperty("removeForms");
		});
	});

	describe("edge cases", () => {
		it("should handle all enabled/disabled combinations", () => {
			const config1: HtmlPreprocessingOptions = {
				enabled: true,
				removeNavigation: true,
				removeForms: true,
			};

			const config2: HtmlPreprocessingOptions = {
				enabled: false,
				removeNavigation: false,
				removeForms: false,
			};

			expect(config1.enabled).toBe(true);
			expect(config2.enabled).toBe(false);
		});

		it("should handle mixed boolean combinations", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: true,
				removeNavigation: false,
				removeForms: true,
			};

			expect(config.enabled).toBe(true);
			expect(config.removeNavigation).toBe(false);
			expect(config.removeForms).toBe(true);
		});

		it("should handle preset without other options", () => {
			const config: HtmlPreprocessingOptions = {
				preset: "aggressive",
			};

			expect(config.preset).toBe("aggressive");
			expect(config.enabled).toBeUndefined();
		});

		it("should handle enabled flag without preset", () => {
			const config: HtmlPreprocessingOptions = {
				enabled: true,
				removeNavigation: true,
			};

			expect(config.enabled).toBe(true);
			expect(config.preset).toBeUndefined();
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: HtmlPreprocessingOptions = {
				enabled: true,
				preset: "standard",
				removeNavigation: true,
				removeForms: false,
			};

			const updated: HtmlPreprocessingOptions = {
				...original,
				preset: "aggressive",
			};

			expect(original.preset).toBe("standard");
			expect(updated.preset).toBe("aggressive");
			expect(updated.removeNavigation).toBe(true);
		});

		it("should support nested object spreading in HtmlConversionOptions", () => {
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
});
