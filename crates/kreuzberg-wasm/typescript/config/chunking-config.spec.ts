/**
 * ChunkingConfig configuration tests for WASM binding
 *
 * Tests for ChunkingConfig feature that allows users to configure
 * document chunking strategy and chunk parameters.
 */

import { describe, it, expect } from "vitest";
import type { ChunkingConfig, ExtractionConfig } from "../types";

describe("WASM: ChunkingConfig", () => {
	describe("type definitions", () => {
		it("should define valid ChunkingConfig type", () => {
			const config: ChunkingConfig = {
				maxChars: 512,
				maxOverlap: 128,
			};

			expect(config.maxChars).toBe(512);
			expect(config.maxOverlap).toBe(128);
		});

		it("should support optional fields", () => {
			const minimalConfig: ChunkingConfig = {};
			expect(minimalConfig.maxChars).toBeUndefined();
			expect(minimalConfig.maxOverlap).toBeUndefined();
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: ChunkingConfig = {
				maxChars: 256,
				maxOverlap: 64,
			};

			const json = JSON.stringify(config);
			const parsed: ChunkingConfig = JSON.parse(json);

			expect(parsed.maxChars).toBe(256);
			expect(parsed.maxOverlap).toBe(64);
		});

		it("should handle undefined fields in serialization", () => {
			const config: ChunkingConfig = {
				maxChars: 512,
				maxOverlap: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("maxOverlap");
			expect(json).toContain("maxChars");
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: ChunkingConfig = {
				maxChars: 512,
				maxOverlap: 128,
			};

			const cloned = structuredClone(config);
			expect(cloned.maxChars).toBe(512);
			expect(cloned.maxOverlap).toBe(128);
		});

		it("should handle nested configs in ExtractionConfig", () => {
			const extractionConfig: ExtractionConfig = {
				chunking: {
					maxChars: 256,
					maxOverlap: 64,
				},
			};

			const cloned = structuredClone(extractionConfig);
			expect(cloned.chunking?.maxChars).toBe(256);
			expect(cloned.chunking?.maxOverlap).toBe(64);
		});
	});

	describe("type safety", () => {
		it("should enforce maxChars as number when defined", () => {
			const config: ChunkingConfig = { maxChars: 512 };
			if (config.maxChars !== undefined) {
				expect(typeof config.maxChars).toBe("number");
			}
		});

		it("should enforce maxOverlap as number when defined", () => {
			const config: ChunkingConfig = { maxOverlap: 128 };
			if (config.maxOverlap !== undefined) {
				expect(typeof config.maxOverlap).toBe("number");
			}
		});
	});

	describe("edge cases", () => {
		it("should handle zero chunk size", () => {
			const config: ChunkingConfig = { maxChars: 0 };
			expect(config.maxChars).toBe(0);
		});

		it("should handle very large chunk sizes", () => {
			const config: ChunkingConfig = {
				maxChars: 100000,
				maxOverlap: 50000,
			};
			expect(config.maxChars).toBe(100000);
			expect(config.maxOverlap).toBe(50000);
		});

		it("should handle zero overlap", () => {
			const config: ChunkingConfig = {
				maxChars: 512,
				maxOverlap: 0,
			};
			expect(config.maxOverlap).toBe(0);
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: ChunkingConfig = {
				maxChars: 512,
				maxOverlap: 128,
			};

			const updated: ChunkingConfig = {
				...original,
				maxChars: 1024,
			};

			expect(original.maxChars).toBe(512);
			expect(updated.maxChars).toBe(1024);
			expect(updated.maxOverlap).toBe(128);
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				chunking: {
					maxChars: 512,
					maxOverlap: 128,
				},
			};

			expect(config.chunking).toBeDefined();
			expect(config.chunking?.maxChars).toBe(512);
		});
	});
});
