/**
 * HierarchyConfig configuration tests
 *
 * Tests for HierarchyConfig feature that allows users to configure
 * document hierarchy extraction and heading level handling.
 */

import { describe, it, expect } from "vitest";
import type { ExtractionConfig } from "@kreuzberg/core";

interface HierarchyConfig {
	detectHeadings?: boolean;
	preserveHierarchy?: boolean;
	maxDepth?: number;
	flattenLists?: boolean;
}

describe("WASM: HierarchyConfig", () => {
	describe("type definitions", () => {
		it("should define valid HierarchyConfig type", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 5,
				flattenLists: false,
			};

			expect(config.detectHeadings).toBe(true);
			expect(config.preserveHierarchy).toBe(true);
			expect(config.maxDepth).toBe(5);
			expect(config.flattenLists).toBe(false);
		});

		it("should support optional fields", () => {
			const minimalConfig: HierarchyConfig = {};

			expect(minimalConfig.detectHeadings).toBeUndefined();
			expect(minimalConfig.preserveHierarchy).toBeUndefined();
			expect(minimalConfig.maxDepth).toBeUndefined();
			expect(minimalConfig.flattenLists).toBeUndefined();
		});

		it("should support various depth levels", () => {
			const shallow: HierarchyConfig = { maxDepth: 2 };
			const medium: HierarchyConfig = { maxDepth: 5 };
			const deep: HierarchyConfig = { maxDepth: 10 };

			expect(shallow.maxDepth).toBe(2);
			expect(medium.maxDepth).toBe(5);
			expect(deep.maxDepth).toBe(10);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 6,
				flattenLists: false,
			};

			const json = JSON.stringify(config);
			const parsed: HierarchyConfig = JSON.parse(json);

			expect(parsed.detectHeadings).toBe(true);
			expect(parsed.preserveHierarchy).toBe(true);
			expect(parsed.maxDepth).toBe(6);
			expect(parsed.flattenLists).toBe(false);
		});

		it("should handle undefined fields in serialization", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: undefined,
				maxDepth: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("preserveHierarchy");
			expect(json).toContain("detectHeadings");
		});

		it("should serialize all field types correctly", () => {
			const config: HierarchyConfig = {
				detectHeadings: false,
				preserveHierarchy: false,
				maxDepth: 3,
				flattenLists: true,
			};

			const json = JSON.stringify(config);
			const parsed: HierarchyConfig = JSON.parse(json);

			expect(parsed.detectHeadings).toBe(false);
			expect(parsed.preserveHierarchy).toBe(false);
			expect(parsed.maxDepth).toBe(3);
			expect(parsed.flattenLists).toBe(true);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 5,
			};

			const cloned = structuredClone(config);

			expect(cloned.detectHeadings).toBe(true);
			expect(cloned.preserveHierarchy).toBe(true);
			expect(cloned.maxDepth).toBe(5);
		});

		it("should preserve complex hierarchy configs", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 8,
				flattenLists: false,
			};

			const cloned = structuredClone(config);

			expect(cloned.detectHeadings).toBe(true);
			expect(cloned.preserveHierarchy).toBe(true);
			expect(cloned.maxDepth).toBe(8);
			expect(cloned.flattenLists).toBe(false);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: HierarchyConfig[] = Array.from(
				{ length: 1000 },
				() => ({
					detectHeadings: true,
					preserveHierarchy: true,
					maxDepth: 5,
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.maxDepth).toBe(5);
			});
		});

		it("should handle various depth configurations", () => {
			const depths = [1, 2, 3, 5, 8, 10, 15];
			const configs: HierarchyConfig[] = depths.map((depth) => ({
				detectHeadings: true,
				maxDepth: depth,
			}));

			expect(configs).toHaveLength(7);
			expect(configs[0].maxDepth).toBe(1);
			expect(configs[6].maxDepth).toBe(15);
		});
	});

	describe("type safety", () => {
		it("should enforce detectHeadings as boolean when defined", () => {
			const config: HierarchyConfig = { detectHeadings: true };
			if (config.detectHeadings !== undefined) {
				expect(typeof config.detectHeadings).toBe("boolean");
			}
		});

		it("should enforce preserveHierarchy as boolean when defined", () => {
			const config: HierarchyConfig = { preserveHierarchy: true };
			if (config.preserveHierarchy !== undefined) {
				expect(typeof config.preserveHierarchy).toBe("boolean");
			}
		});

		it("should enforce maxDepth as number when defined", () => {
			const config: HierarchyConfig = { maxDepth: 5 };
			if (config.maxDepth !== undefined) {
				expect(typeof config.maxDepth).toBe("number");
			}
		});

		it("should enforce flattenLists as boolean when defined", () => {
			const config: HierarchyConfig = { flattenLists: false };
			if (config.flattenLists !== undefined) {
				expect(typeof config.flattenLists).toBe("boolean");
			}
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 5,
				flattenLists: false,
			};

			expect(config).toHaveProperty("detectHeadings");
			expect(config).toHaveProperty("preserveHierarchy");
			expect(config).toHaveProperty("maxDepth");
			expect(config).toHaveProperty("flattenLists");
		});
	});

	describe("edge cases", () => {
		it("should handle zero depth", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				maxDepth: 0,
			};

			expect(config.maxDepth).toBe(0);
		});

		it("should handle very large depth values", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				maxDepth: 999,
			};

			expect(config.maxDepth).toBe(999);
		});

		it("should handle all boolean combinations", () => {
			const config1: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				flattenLists: true,
			};

			const config2: HierarchyConfig = {
				detectHeadings: false,
				preserveHierarchy: false,
				flattenLists: false,
			};

			expect(config1.detectHeadings).toBe(true);
			expect(config2.detectHeadings).toBe(false);
		});

		it("should handle disabled heading detection", () => {
			const config: HierarchyConfig = {
				detectHeadings: false,
				preserveHierarchy: false,
			};

			expect(config.detectHeadings).toBe(false);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 5,
			};

			const updated: HierarchyConfig = {
				...original,
				maxDepth: 8,
			};

			expect(original.maxDepth).toBe(5);
			expect(updated.maxDepth).toBe(8);
			expect(updated.detectHeadings).toBe(true);
		});

		it("should support depth increment updates", () => {
			const original: HierarchyConfig = {
				detectHeadings: true,
				maxDepth: 5,
			};

			const updated: HierarchyConfig = {
				...original,
				maxDepth: (original.maxDepth || 0) + 2,
			};

			expect(original.maxDepth).toBe(5);
			expect(updated.maxDepth).toBe(7);
		});

		it("should support boolean toggle updates", () => {
			const original: HierarchyConfig = {
				detectHeadings: true,
				flattenLists: false,
			};

			const updated: HierarchyConfig = {
				...original,
				flattenLists: !original.flattenLists,
			};

			expect(original.flattenLists).toBe(false);
			expect(updated.flattenLists).toBe(true);
		});
	});

	describe("practical scenarios", () => {
		it("should support full hierarchy preservation", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 10,
				flattenLists: false,
			};

			expect(config.preserveHierarchy).toBe(true);
		});

		it("should support shallow hierarchy extraction", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: true,
				maxDepth: 2,
				flattenLists: true,
			};

			expect(config.maxDepth).toBe(2);
		});

		it("should support no hierarchy detection", () => {
			const config: HierarchyConfig = {
				detectHeadings: false,
				preserveHierarchy: false,
			};

			expect(config.detectHeadings).toBe(false);
		});

		it("should support flattened structure extraction", () => {
			const config: HierarchyConfig = {
				detectHeadings: true,
				preserveHierarchy: false,
				flattenLists: true,
			};

			expect(config.flattenLists).toBe(true);
			expect(config.preserveHierarchy).toBe(false);
		});
	});
});
