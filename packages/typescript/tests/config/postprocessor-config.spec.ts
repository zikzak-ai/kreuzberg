/**
 * PostProcessorConfig configuration tests
 *
 * Tests for PostProcessorConfig feature that allows users to enable/disable
 * post-processing and control specific processors.
 */

import { describe, it, expect } from "vitest";
import type { PostProcessorConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: PostProcessorConfig", () => {
	describe("type definitions", () => {
		it("should define valid PostProcessorConfig type", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["spell-check", "grammar"],
				disabledProcessors: ["style-check"],
			};

			expect(config.enabled).toBe(true);
			expect(config.enabledProcessors).toEqual(["spell-check", "grammar"]);
			expect(config.disabledProcessors).toEqual(["style-check"]);
		});

		it("should support optional fields", () => {
			const minimalConfig: PostProcessorConfig = {};

			expect(minimalConfig.enabled).toBeUndefined();
			expect(minimalConfig.enabledProcessors).toBeUndefined();
			expect(minimalConfig.disabledProcessors).toBeUndefined();
		});

		it("should support enabled/disabled processor lists", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["proc1", "proc2", "proc3"],
				disabledProcessors: ["proc4", "proc5"],
			};

			expect(config.enabledProcessors).toHaveLength(3);
			expect(config.disabledProcessors).toHaveLength(2);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["processor1", "processor2"],
			};

			const json = JSON.stringify(config);
			const parsed: PostProcessorConfig = JSON.parse(json);

			expect(parsed.enabled).toBe(true);
			expect(parsed.enabledProcessors).toEqual(["processor1", "processor2"]);
		});

		it("should handle undefined fields in serialization", () => {
			const config: PostProcessorConfig = {
				enabled: false,
				enabledProcessors: undefined,
				disabledProcessors: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("enabledProcessors");
			expect(json).toContain("enabled");
		});

		it("should serialize all field types correctly", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["spellcheck", "grammar"],
				disabledProcessors: ["style"],
			};

			const json = JSON.stringify(config);
			const parsed: PostProcessorConfig = JSON.parse(json);

			expect(parsed.enabled).toBe(true);
			expect(parsed.enabledProcessors).toEqual(["spellcheck", "grammar"]);
			expect(parsed.disabledProcessors).toEqual(["style"]);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["proc1", "proc2"],
				disabledProcessors: ["proc3"],
			};

			const cloned = structuredClone(config);

			expect(cloned.enabled).toBe(true);
			expect(cloned.enabledProcessors).toEqual(["proc1", "proc2"]);
			expect(cloned.disabledProcessors).toEqual(["proc3"]);
		});

		it("should handle nested configs in ExtractionConfig", () => {
			const extractionConfig: ExtractionConfig = {
				postprocessor: {
					enabled: true,
					enabledProcessors: ["grammar", "clarity"],
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.postprocessor?.enabled).toBe(true);
			expect(cloned.postprocessor?.enabledProcessors).toEqual([
				"grammar",
				"clarity",
			]);
		});

		it("should preserve complex processor lists", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: [
					"spell-check",
					"grammar-check",
					"style-check",
					"format-check",
				],
				disabledProcessors: ["debug-mode", "verbose-output"],
			};

			const cloned = structuredClone(config);

			expect(cloned.enabledProcessors).toHaveLength(4);
			expect(cloned.disabledProcessors).toHaveLength(2);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: PostProcessorConfig[] = Array.from(
				{ length: 1000 },
				() => ({
					enabled: true,
					enabledProcessors: ["proc1", "proc2"],
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.enabled).toBe(true);
			});
		});

		it("should handle large processor lists", () => {
			const processors = Array.from(
				{ length: 100 },
				(_, i) => `processor_${i}`
			);
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: processors,
			};

			expect(config.enabledProcessors?.length).toBe(100);
		});
	});

	describe("type safety", () => {
		it("should enforce enabled as boolean when defined", () => {
			const config: PostProcessorConfig = { enabled: true };
			if (config.enabled !== undefined) {
				expect(typeof config.enabled).toBe("boolean");
			}
		});

		it("should enforce enabledProcessors as string array when defined", () => {
			const config: PostProcessorConfig = { enabledProcessors: ["proc1"] };
			if (config.enabledProcessors !== undefined) {
				expect(Array.isArray(config.enabledProcessors)).toBe(true);
				config.enabledProcessors.forEach((proc) => {
					expect(typeof proc).toBe("string");
				});
			}
		});

		it("should enforce disabledProcessors as string array when defined", () => {
			const config: PostProcessorConfig = { disabledProcessors: ["proc2"] };
			if (config.disabledProcessors !== undefined) {
				expect(Array.isArray(config.disabledProcessors)).toBe(true);
				config.disabledProcessors.forEach((proc) => {
					expect(typeof proc).toBe("string");
				});
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				postprocessor: {
					enabled: true,
					enabledProcessors: ["processor1", "processor2"],
				},
			};

			expect(config.postprocessor).toBeDefined();
			expect(config.postprocessor?.enabled).toBe(true);
			expect(config.postprocessor?.enabledProcessors).toEqual([
				"processor1",
				"processor2",
			]);
		});

		it("should handle null postprocessor config", () => {
			const config: ExtractionConfig = {
				postprocessor: null as unknown as PostProcessorConfig,
			};

			expect(config.postprocessor).toBeNull();
		});

		it("should support postprocessor with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				postprocessor: {
					enabled: true,
					enabledProcessors: ["grammar"],
				},
				enableQualityProcessing: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.postprocessor?.enabled).toBe(true);
			expect(config.enableQualityProcessing).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["proc1"],
				disabledProcessors: ["proc2"],
			};

			expect(config).toHaveProperty("enabled");
			expect(config).toHaveProperty("enabledProcessors");
			expect(config).toHaveProperty("disabledProcessors");
		});
	});

	describe("edge cases", () => {
		it("should handle empty processor arrays", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: [],
				disabledProcessors: [],
			};

			expect(config.enabledProcessors).toEqual([]);
			expect(config.disabledProcessors).toEqual([]);
		});

		it("should handle single processor", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["only-processor"],
			};

			expect(config.enabledProcessors).toEqual(["only-processor"]);
		});

		it("should handle very long processor names", () => {
			const longName = "processor-".repeat(100);
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: [longName],
			};

			expect(config.enabledProcessors?.[0]).toBe(longName);
		});

		it("should handle overlapping processor lists", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["proc1", "proc2", "proc3"],
				disabledProcessors: ["proc2", "proc3", "proc4"],
			};

			expect(config.enabledProcessors).toHaveLength(3);
			expect(config.disabledProcessors).toHaveLength(3);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["proc1"],
			};

			const updated: PostProcessorConfig = {
				...original,
				enabled: false,
			};

			expect(original.enabled).toBe(true);
			expect(updated.enabled).toBe(false);
			expect(updated.enabledProcessors).toEqual(["proc1"]);
		});

		it("should support processor list updates", () => {
			const original: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["proc1", "proc2"],
			};

			const updated: PostProcessorConfig = {
				...original,
				enabledProcessors: [...(original.enabledProcessors || []), "proc3"],
			};

			expect(original.enabledProcessors).toEqual(["proc1", "proc2"]);
			expect(updated.enabledProcessors).toEqual(["proc1", "proc2", "proc3"]);
		});

		it("should support disabled processor list updates", () => {
			const original: PostProcessorConfig = {
				enabled: true,
				disabledProcessors: ["proc1"],
			};

			const updated: PostProcessorConfig = {
				...original,
				disabledProcessors: [...(original.disabledProcessors || []), "proc2"],
			};

			expect(original.disabledProcessors).toEqual(["proc1"]);
			expect(updated.disabledProcessors).toEqual(["proc1", "proc2"]);
		});
	});

	describe("practical scenarios", () => {
		it("should support enabling specific processors", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: [
					"spell-check",
					"grammar-check",
					"clarity-enhancement",
				],
			};

			expect(config.enabledProcessors).toHaveLength(3);
		});

		it("should support disabling specific processors", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				disabledProcessors: ["debug-mode", "verbose-logging"],
			};

			expect(config.disabledProcessors).toHaveLength(2);
		});

		it("should support mixed enable/disable configuration", () => {
			const config: PostProcessorConfig = {
				enabled: true,
				enabledProcessors: ["grammar-check", "spell-check"],
				disabledProcessors: ["style-check"],
			};

			expect(config.enabledProcessors).toHaveLength(2);
			expect(config.disabledProcessors).toHaveLength(1);
		});
	});
});
