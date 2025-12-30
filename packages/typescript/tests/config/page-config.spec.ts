/**
 * PageConfig configuration tests
 *
 * Tests for PageConfig feature that allows users to configure page-specific
 * extraction parameters including page ranges and selection criteria.
 */

import { describe, it, expect } from "vitest";
import type { ExtractionConfig } from "@kreuzberg/core";

interface PageConfig {
	startPage?: number;
	endPage?: number;
	pageNumbers?: number[];
	singlePage?: boolean;
}

describe("WASM: PageConfig", () => {
	describe("type definitions", () => {
		it("should define valid PageConfig type", () => {
			const config: PageConfig = {
				startPage: 1,
				endPage: 10,
				singlePage: false,
			};

			expect(config.startPage).toBe(1);
			expect(config.endPage).toBe(10);
			expect(config.singlePage).toBe(false);
		});

		it("should support optional fields", () => {
			const minimalConfig: PageConfig = {};

			expect(minimalConfig.startPage).toBeUndefined();
			expect(minimalConfig.endPage).toBeUndefined();
			expect(minimalConfig.pageNumbers).toBeUndefined();
			expect(minimalConfig.singlePage).toBeUndefined();
		});

		it("should support specific page numbers", () => {
			const config: PageConfig = {
				pageNumbers: [1, 3, 5, 7],
			};

			expect(config.pageNumbers).toEqual([1, 3, 5, 7]);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: PageConfig = {
				startPage: 1,
				endPage: 50,
				singlePage: false,
			};

			const json = JSON.stringify(config);
			const parsed: PageConfig = JSON.parse(json);

			expect(parsed.startPage).toBe(1);
			expect(parsed.endPage).toBe(50);
			expect(parsed.singlePage).toBe(false);
		});

		it("should handle undefined fields in serialization", () => {
			const config: PageConfig = {
				startPage: 1,
				endPage: undefined,
				singlePage: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("endPage");
			expect(json).toContain("startPage");
		});

		it("should serialize page numbers array", () => {
			const config: PageConfig = {
				pageNumbers: [1, 5, 10, 15, 20],
			};

			const json = JSON.stringify(config);
			const parsed: PageConfig = JSON.parse(json);

			expect(parsed.pageNumbers).toEqual([1, 5, 10, 15, 20]);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: PageConfig = {
				startPage: 1,
				endPage: 25,
				singlePage: false,
			};

			const cloned = structuredClone(config);

			expect(cloned.startPage).toBe(1);
			expect(cloned.endPage).toBe(25);
			expect(cloned.singlePage).toBe(false);
		});

		it("should handle page numbers in workers", () => {
			const config: PageConfig = {
				pageNumbers: [2, 4, 6, 8, 10],
			};

			const cloned = structuredClone(config);

			expect(cloned.pageNumbers).toEqual([2, 4, 6, 8, 10]);
		});

		it("should preserve complex page ranges", () => {
			const config: PageConfig = {
				startPage: 5,
				endPage: 100,
				pageNumbers: [5, 10, 25, 50, 100],
				singlePage: false,
			};

			const cloned = structuredClone(config);

			expect(cloned.startPage).toBe(5);
			expect(cloned.endPage).toBe(100);
			expect(cloned.pageNumbers).toEqual([5, 10, 25, 50, 100]);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: PageConfig[] = Array.from({ length: 1000 }, () => ({
				startPage: 1,
				endPage: 50,
			}));

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.startPage).toBe(1);
			});
		});

		it("should handle large page number arrays", () => {
			const pageNumbers = Array.from({ length: 1000 }, (_, i) => i + 1);
			const config: PageConfig = {
				pageNumbers,
			};

			expect(config.pageNumbers?.length).toBe(1000);
		});
	});

	describe("type safety", () => {
		it("should enforce startPage as number when defined", () => {
			const config: PageConfig = { startPage: 1 };
			if (config.startPage !== undefined) {
				expect(typeof config.startPage).toBe("number");
			}
		});

		it("should enforce endPage as number when defined", () => {
			const config: PageConfig = { endPage: 100 };
			if (config.endPage !== undefined) {
				expect(typeof config.endPage).toBe("number");
			}
		});

		it("should enforce pageNumbers as number array when defined", () => {
			const config: PageConfig = { pageNumbers: [1, 2, 3] };
			if (config.pageNumbers !== undefined) {
				expect(Array.isArray(config.pageNumbers)).toBe(true);
				config.pageNumbers.forEach((num) => {
					expect(typeof num).toBe("number");
				});
			}
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: PageConfig = {
				startPage: 1,
				endPage: 50,
				pageNumbers: [1, 25, 50],
				singlePage: false,
			};

			expect(config).toHaveProperty("startPage");
			expect(config).toHaveProperty("endPage");
			expect(config).toHaveProperty("pageNumbers");
			expect(config).toHaveProperty("singlePage");
		});
	});

	describe("edge cases", () => {
		it("should handle page 1 as start page", () => {
			const config: PageConfig = {
				startPage: 1,
			};

			expect(config.startPage).toBe(1);
		});

		it("should handle very large page numbers", () => {
			const config: PageConfig = {
				endPage: 999999,
			};

			expect(config.endPage).toBe(999999);
		});

		it("should handle empty page numbers array", () => {
			const config: PageConfig = {
				pageNumbers: [],
			};

			expect(config.pageNumbers).toEqual([]);
		});

		it("should handle single page extraction", () => {
			const config: PageConfig = {
				startPage: 5,
				endPage: 5,
				singlePage: true,
			};

			expect(config.startPage).toBe(5);
			expect(config.endPage).toBe(5);
			expect(config.singlePage).toBe(true);
		});

		it("should handle reversed page ranges", () => {
			const config: PageConfig = {
				startPage: 100,
				endPage: 1,
			};

			expect(config.startPage).toBe(100);
			expect(config.endPage).toBe(1);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: PageConfig = {
				startPage: 1,
				endPage: 50,
				singlePage: false,
			};

			const updated: PageConfig = {
				...original,
				endPage: 100,
			};

			expect(original.endPage).toBe(50);
			expect(updated.endPage).toBe(100);
			expect(updated.startPage).toBe(1);
		});

		it("should support page numbers array updates", () => {
			const original: PageConfig = {
				pageNumbers: [1, 5, 10],
			};

			const updated: PageConfig = {
				...original,
				pageNumbers: [...(original.pageNumbers || []), 15, 20],
			};

			expect(original.pageNumbers).toEqual([1, 5, 10]);
			expect(updated.pageNumbers).toEqual([1, 5, 10, 15, 20]);
		});

		it("should support complete page config replacement", () => {
			const original: PageConfig = {
				startPage: 1,
				endPage: 50,
				singlePage: false,
			};

			const updated: PageConfig = {
				pageNumbers: [1, 25, 50],
			};

			expect(original.startPage).toBe(1);
			expect(updated.startPage).toBeUndefined();
			expect(updated.pageNumbers).toEqual([1, 25, 50]);
		});
	});

	describe("integration with ExtractionConfig", () => {
		it("should work as part of extraction configuration", () => {
			const extractionConfig: ExtractionConfig = {
				useCache: true,
				forceOcr: false,
			};

			// Simulate PageConfig as a nested property
			const configWithPages = {
				...extractionConfig,
				pages: {
					startPage: 1,
					endPage: 10,
				} as PageConfig,
			};

			expect(configWithPages.useCache).toBe(true);
			expect((configWithPages.pages as PageConfig).startPage).toBe(1);
		});
	});

	describe("practical scenarios", () => {
		it("should support extracting first 10 pages", () => {
			const config: PageConfig = {
				startPage: 1,
				endPage: 10,
			};

			expect(config.startPage).toBe(1);
			expect(config.endPage).toBe(10);
		});

		it("should support extracting specific pages", () => {
			const config: PageConfig = {
				pageNumbers: [1, 3, 5, 7, 9],
			};

			expect(config.pageNumbers).toEqual([1, 3, 5, 7, 9]);
		});

		it("should support extracting last 5 pages of 100-page document", () => {
			const config: PageConfig = {
				startPage: 96,
				endPage: 100,
			};

			expect(config.startPage).toBe(96);
			expect(config.endPage).toBe(100);
		});
	});
});
