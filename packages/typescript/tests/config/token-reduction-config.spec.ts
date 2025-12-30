/**
 * TokenReductionConfig configuration tests
 *
 * Tests for TokenReductionConfig feature that allows users to configure
 * token reduction strategies and important word preservation for text optimization.
 */

import { describe, it, expect } from "vitest";
import type { TokenReductionConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: TokenReductionConfig", () => {
	describe("type definitions", () => {
		it("should define valid TokenReductionConfig type", () => {
			const config: TokenReductionConfig = {
				mode: "aggressive",
				preserveImportantWords: true,
			};

			expect(config.mode).toBe("aggressive");
			expect(config.preserveImportantWords).toBe(true);
		});

		it("should support optional fields", () => {
			const minimalConfig: TokenReductionConfig = {};

			expect(minimalConfig.mode).toBeUndefined();
			expect(minimalConfig.preserveImportantWords).toBeUndefined();
		});

		it("should support different reduction modes", () => {
			const conservative: TokenReductionConfig = { mode: "conservative" };
			const balanced: TokenReductionConfig = { mode: "balanced" };
			const aggressive: TokenReductionConfig = { mode: "aggressive" };

			expect(conservative.mode).toBe("conservative");
			expect(balanced.mode).toBe("balanced");
			expect(aggressive.mode).toBe("aggressive");
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: TokenReductionConfig = {
				mode: "balanced",
				preserveImportantWords: true,
			};

			const json = JSON.stringify(config);
			const parsed: TokenReductionConfig = JSON.parse(json);

			expect(parsed.mode).toBe("balanced");
			expect(parsed.preserveImportantWords).toBe(true);
		});

		it("should handle undefined fields in serialization", () => {
			const config: TokenReductionConfig = {
				mode: "aggressive",
				preserveImportantWords: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("preserveImportantWords");
			expect(json).toContain("mode");
		});

		it("should serialize all field types correctly", () => {
			const config: TokenReductionConfig = {
				mode: "conservative",
				preserveImportantWords: false,
			};

			const json = JSON.stringify(config);
			const parsed: TokenReductionConfig = JSON.parse(json);

			expect(parsed.mode).toBe("conservative");
			expect(parsed.preserveImportantWords).toBe(false);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: TokenReductionConfig = {
				mode: "balanced",
				preserveImportantWords: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.mode).toBe("balanced");
			expect(cloned.preserveImportantWords).toBe(true);
		});

		it("should handle nested configs in ExtractionConfig", () => {
			const extractionConfig: ExtractionConfig = {
				tokenReduction: {
					mode: "aggressive",
					preserveImportantWords: true,
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.tokenReduction?.mode).toBe("aggressive");
			expect(cloned.tokenReduction?.preserveImportantWords).toBe(true);
		});

		it("should preserve complex token reduction configs", () => {
			const config: TokenReductionConfig = {
				mode: "balanced",
				preserveImportantWords: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.mode).toBe("balanced");
			expect(cloned.preserveImportantWords).toBe(true);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: TokenReductionConfig[] = Array.from(
				{ length: 1000 },
				() => ({
					mode: "balanced",
					preserveImportantWords: true,
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.mode).toBe("balanced");
			});
		});

		it("should handle various mode configurations", () => {
			const modes = ["conservative", "balanced", "aggressive"];
			const configs: TokenReductionConfig[] = modes.map((mode) => ({
				mode,
			}));

			expect(configs).toHaveLength(3);
			expect(configs[0].mode).toBe("conservative");
			expect(configs[2].mode).toBe("aggressive");
		});
	});

	describe("type safety", () => {
		it("should enforce mode as string when defined", () => {
			const config: TokenReductionConfig = { mode: "balanced" };
			if (config.mode !== undefined) {
				expect(typeof config.mode).toBe("string");
			}
		});

		it("should enforce preserveImportantWords as boolean when defined", () => {
			const config: TokenReductionConfig = { preserveImportantWords: true };
			if (config.preserveImportantWords !== undefined) {
				expect(typeof config.preserveImportantWords).toBe("boolean");
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				tokenReduction: {
					mode: "aggressive",
					preserveImportantWords: true,
				},
			};

			expect(config.tokenReduction).toBeDefined();
			expect(config.tokenReduction?.mode).toBe("aggressive");
			expect(config.tokenReduction?.preserveImportantWords).toBe(true);
		});

		it("should handle null token reduction config", () => {
			const config: ExtractionConfig = {
				tokenReduction: null as unknown as TokenReductionConfig,
			};

			expect(config.tokenReduction).toBeNull();
		});

		it("should support token reduction with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				tokenReduction: {
					mode: "balanced",
					preserveImportantWords: true,
				},
				enableQualityProcessing: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.tokenReduction?.mode).toBe("balanced");
			expect(config.enableQualityProcessing).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: TokenReductionConfig = {
				mode: "aggressive",
				preserveImportantWords: true,
			};

			expect(config).toHaveProperty("mode");
			expect(config).toHaveProperty("preserveImportantWords");
		});
	});

	describe("edge cases", () => {
		it("should handle empty mode string", () => {
			const config: TokenReductionConfig = {
				mode: "",
			};

			expect(config.mode).toBe("");
		});

		it("should handle custom mode values", () => {
			const config: TokenReductionConfig = {
				mode: "custom-mode",
			};

			expect(config.mode).toBe("custom-mode");
		});

		it("should handle very long mode strings", () => {
			const longMode = "a".repeat(1000);
			const config: TokenReductionConfig = {
				mode: longMode,
			};

			expect(config.mode).toBe(longMode);
		});

		it("should handle disabled word preservation", () => {
			const config: TokenReductionConfig = {
				mode: "aggressive",
				preserveImportantWords: false,
			};

			expect(config.preserveImportantWords).toBe(false);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: TokenReductionConfig = {
				mode: "balanced",
				preserveImportantWords: false,
			};

			const updated: TokenReductionConfig = {
				...original,
				mode: "aggressive",
			};

			expect(original.mode).toBe("balanced");
			expect(updated.mode).toBe("aggressive");
			expect(updated.preserveImportantWords).toBe(false);
		});

		it("should support word preservation updates", () => {
			const original: TokenReductionConfig = {
				mode: "aggressive",
				preserveImportantWords: false,
			};

			const updated: TokenReductionConfig = {
				...original,
				preserveImportantWords: true,
			};

			expect(original.preserveImportantWords).toBe(false);
			expect(updated.preserveImportantWords).toBe(true);
			expect(updated.mode).toBe("aggressive");
		});
	});

	describe("practical scenarios", () => {
		it("should support conservative token reduction", () => {
			const config: TokenReductionConfig = {
				mode: "conservative",
				preserveImportantWords: true,
			};

			expect(config.mode).toBe("conservative");
		});

		it("should support balanced token reduction", () => {
			const config: TokenReductionConfig = {
				mode: "balanced",
				preserveImportantWords: true,
			};

			expect(config.mode).toBe("balanced");
		});

		it("should support aggressive token reduction", () => {
			const config: TokenReductionConfig = {
				mode: "aggressive",
				preserveImportantWords: true,
			};

			expect(config.mode).toBe("aggressive");
		});

		it("should support reduction without word preservation", () => {
			const config: TokenReductionConfig = {
				mode: "aggressive",
				preserveImportantWords: false,
			};

			expect(config.preserveImportantWords).toBe(false);
		});
	});
});
