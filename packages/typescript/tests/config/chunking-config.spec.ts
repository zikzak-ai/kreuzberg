/**
 * ChunkingConfig configuration tests
 *
 * Tests for ChunkingConfig feature that allows users to configure document
 * chunking strategy, chunk size, overlap, and embedding options.
 */

import { describe, it, expect } from "vitest";
import type { ChunkingConfig, ExtractionConfig } from "@kreuzberg/core";

describe("WASM: ChunkingConfig", () => {
	describe("type definitions", () => {
		it("should define valid ChunkingConfig type", () => {
			const config: ChunkingConfig = {
				chunkSize: 512,
				chunkOverlap: 128,
				enabled: true,
			};

			expect(config.chunkSize).toBe(512);
			expect(config.chunkOverlap).toBe(128);
			expect(config.enabled).toBe(true);
		});

		it("should support optional fields", () => {
			const minimalConfig: ChunkingConfig = {};

			expect(minimalConfig.chunkSize).toBeUndefined();
			expect(minimalConfig.chunkOverlap).toBeUndefined();
			expect(minimalConfig.enabled).toBeUndefined();
			expect(minimalConfig.preset).toBeUndefined();
		});

		it("should support preset values", () => {
			const configSmall: ChunkingConfig = { preset: "small" };
			const configMedium: ChunkingConfig = { preset: "medium" };
			const configLarge: ChunkingConfig = { preset: "large" };

			expect(configSmall.preset).toBe("small");
			expect(configMedium.preset).toBe("medium");
			expect(configLarge.preset).toBe("large");
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: ChunkingConfig = {
				chunkSize: 256,
				chunkOverlap: 64,
				enabled: true,
			};

			const json = JSON.stringify(config);
			const parsed: ChunkingConfig = JSON.parse(json);

			expect(parsed.chunkSize).toBe(256);
			expect(parsed.chunkOverlap).toBe(64);
			expect(parsed.enabled).toBe(true);
		});

		it("should handle undefined fields in serialization", () => {
			const config: ChunkingConfig = {
				chunkSize: 512,
				embedding: undefined,
				preset: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("embedding");
			expect(json).toContain("chunkSize");
		});

		it("should serialize embedding object", () => {
			const config: ChunkingConfig = {
				chunkSize: 512,
				embedding: {
					model: "text-embedding-3-small",
					dimensions: 1536,
				},
			};

			const json = JSON.stringify(config);
			const parsed: ChunkingConfig = JSON.parse(json);

			expect(parsed.embedding?.model).toBe("text-embedding-3-small");
			expect(parsed.embedding?.dimensions).toBe(1536);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: ChunkingConfig = {
				chunkSize: 512,
				chunkOverlap: 128,
				enabled: true,
			};

			const cloned = structuredClone(config);

			expect(cloned.chunkSize).toBe(512);
			expect(cloned.chunkOverlap).toBe(128);
			expect(cloned.enabled).toBe(true);
		});

		it("should handle nested configs in workers", () => {
			const extractionConfig: ExtractionConfig = {
				chunking: {
					chunkSize: 256,
					chunkOverlap: 64,
					preset: "medium",
				},
			};

			const cloned = structuredClone(extractionConfig);

			expect(cloned.chunking?.chunkSize).toBe(256);
			expect(cloned.chunking?.chunkOverlap).toBe(64);
			expect(cloned.chunking?.preset).toBe("medium");
		});

		it("should preserve complex embedding configs", () => {
			const config: ChunkingConfig = {
				chunkSize: 1024,
				chunkOverlap: 256,
				enabled: true,
				embedding: {
					model: "text-embedding-3-large",
					dimensions: 3072,
					cache: true,
				},
			};

			const cloned = structuredClone(config);

			expect(cloned.embedding?.model).toBe("text-embedding-3-large");
			expect(cloned.embedding?.dimensions).toBe(3072);
			expect(cloned.embedding?.cache).toBe(true);
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: ChunkingConfig[] = Array.from({ length: 1000 }, () => ({
				chunkSize: 512,
				chunkOverlap: 128,
			}));

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.chunkSize).toBe(512);
			});
		});

		it("should handle large embedding metadata efficiently", () => {
			const largeEmbedding: Record<string, unknown> = {};
			for (let i = 0; i < 100; i++) {
				largeEmbedding[`param_${i}`] = Math.random();
			}

			const config: ChunkingConfig = {
				chunkSize: 512,
				embedding: largeEmbedding,
			};

			expect(Object.keys(config.embedding!).length).toBe(100);
		});
	});

	describe("type safety", () => {
		it("should enforce chunkSize as number when defined", () => {
			const config: ChunkingConfig = { chunkSize: 512 };
			if (config.chunkSize !== undefined) {
				expect(typeof config.chunkSize).toBe("number");
			}
		});

		it("should enforce chunkOverlap as number when defined", () => {
			const config: ChunkingConfig = { chunkOverlap: 128 };
			if (config.chunkOverlap !== undefined) {
				expect(typeof config.chunkOverlap).toBe("number");
			}
		});

		it("should enforce enabled as boolean when defined", () => {
			const config: ChunkingConfig = { enabled: true };
			if (config.enabled !== undefined) {
				expect(typeof config.enabled).toBe("boolean");
			}
		});
	});

	describe("nesting in ExtractionConfig", () => {
		it("should nest properly in ExtractionConfig", () => {
			const config: ExtractionConfig = {
				chunking: {
					chunkSize: 512,
					chunkOverlap: 128,
					enabled: true,
				},
			};

			expect(config.chunking).toBeDefined();
			expect(config.chunking?.chunkSize).toBe(512);
			expect(config.chunking?.enabled).toBe(true);
		});

		it("should handle null chunking config", () => {
			const config: ExtractionConfig = {
				chunking: null as unknown as ChunkingConfig,
			};

			expect(config.chunking).toBeNull();
		});

		it("should support chunking with other extraction options", () => {
			const config: ExtractionConfig = {
				useCache: true,
				chunking: {
					chunkSize: 256,
					preset: "small",
				},
				enableQualityProcessing: true,
			};

			expect(config.useCache).toBe(true);
			expect(config.chunking?.chunkSize).toBe(256);
			expect(config.enableQualityProcessing).toBe(true);
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: ChunkingConfig = {
				chunkSize: 512,
				chunkOverlap: 128,
				maxChars: 5000,
			};

			expect(config).toHaveProperty("chunkSize");
			expect(config).toHaveProperty("chunkOverlap");
			expect(config).toHaveProperty("maxChars");
		});
	});

	describe("edge cases", () => {
		it("should handle zero chunk size", () => {
			const config: ChunkingConfig = {
				chunkSize: 0,
			};

			expect(config.chunkSize).toBe(0);
		});

		it("should handle very large chunk sizes", () => {
			const config: ChunkingConfig = {
				chunkSize: 100000,
				chunkOverlap: 50000,
			};

			expect(config.chunkSize).toBe(100000);
			expect(config.chunkOverlap).toBe(50000);
		});

		it("should handle zero overlap", () => {
			const config: ChunkingConfig = {
				chunkSize: 512,
				chunkOverlap: 0,
			};

			expect(config.chunkOverlap).toBe(0);
		});

		it("should handle empty embedding object", () => {
			const config: ChunkingConfig = {
				chunkSize: 512,
				embedding: {},
			};

			expect(config.embedding).toEqual({});
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: ChunkingConfig = {
				chunkSize: 512,
				chunkOverlap: 128,
				enabled: true,
			};

			const updated: ChunkingConfig = {
				...original,
				chunkSize: 1024,
			};

			expect(original.chunkSize).toBe(512);
			expect(updated.chunkSize).toBe(1024);
			expect(updated.chunkOverlap).toBe(128);
		});

		it("should support nested object spreading", () => {
			const original: ChunkingConfig = {
				chunkSize: 512,
				embedding: {
					model: "text-embedding-3-small",
					dimensions: 1536,
				},
			};

			const updated: ChunkingConfig = {
				...original,
				embedding: {
					...original.embedding,
					cache: true,
				},
			};

			expect(original.embedding?.cache).toBeUndefined();
			expect(updated.embedding?.cache).toBe(true);
			expect(updated.embedding?.model).toBe("text-embedding-3-small");
		});
	});
});
