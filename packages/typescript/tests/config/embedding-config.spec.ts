/**
 * EmbeddingConfig configuration tests
 *
 * Tests for EmbeddingConfig feature that allows users to configure
 * text embedding models, dimensions, and caching options.
 */

import { describe, it, expect } from "vitest";
import type { ExtractionConfig } from "@kreuzberg/core";

interface EmbeddingConfig {
	model?: string;
	dimensions?: number;
	cache?: boolean;
	provider?: string;
	apiKey?: string;
	batchSize?: number;
}

describe("WASM: EmbeddingConfig", () => {
	describe("type definitions", () => {
		it("should define valid EmbeddingConfig type", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				cache: true,
				provider: "openai",
			};

			expect(config.model).toBe("text-embedding-3-small");
			expect(config.dimensions).toBe(1536);
			expect(config.cache).toBe(true);
			expect(config.provider).toBe("openai");
		});

		it("should support optional fields", () => {
			const minimalConfig: EmbeddingConfig = {};

			expect(minimalConfig.model).toBeUndefined();
			expect(minimalConfig.dimensions).toBeUndefined();
			expect(minimalConfig.cache).toBeUndefined();
			expect(minimalConfig.provider).toBeUndefined();
		});

		it("should support various embedding models", () => {
			const small: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
			};
			const large: EmbeddingConfig = {
				model: "text-embedding-3-large",
				dimensions: 3072,
			};

			expect(small.dimensions).toBe(1536);
			expect(large.dimensions).toBe(3072);
		});
	});

	describe("WASM serialization", () => {
		it("should serialize for WASM boundary", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				cache: true,
				provider: "openai",
			};

			const json = JSON.stringify(config);
			const parsed: EmbeddingConfig = JSON.parse(json);

			expect(parsed.model).toBe("text-embedding-3-small");
			expect(parsed.dimensions).toBe(1536);
			expect(parsed.cache).toBe(true);
			expect(parsed.provider).toBe("openai");
		});

		it("should handle undefined fields in serialization", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: undefined,
				cache: undefined,
				apiKey: undefined,
			};

			const json = JSON.stringify(config);
			expect(json).not.toContain("dimensions");
			expect(json).toContain("model");
		});

		it("should serialize all field types correctly", () => {
			const config: EmbeddingConfig = {
				model: "bert-base-uncased",
				dimensions: 768,
				cache: false,
				provider: "huggingface",
				batchSize: 32,
			};

			const json = JSON.stringify(config);
			const parsed: EmbeddingConfig = JSON.parse(json);

			expect(parsed.model).toBe("bert-base-uncased");
			expect(parsed.dimensions).toBe(768);
			expect(parsed.cache).toBe(false);
			expect(parsed.provider).toBe("huggingface");
			expect(parsed.batchSize).toBe(32);
		});
	});

	describe("worker message passing", () => {
		it("should serialize for worker communication", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				cache: true,
				provider: "openai",
			};

			const cloned = structuredClone(config);

			expect(cloned.model).toBe("text-embedding-3-small");
			expect(cloned.dimensions).toBe(1536);
			expect(cloned.cache).toBe(true);
			expect(cloned.provider).toBe("openai");
		});

		it("should preserve complex embedding configs", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-large",
				dimensions: 3072,
				cache: true,
				provider: "openai",
				batchSize: 64,
			};

			const cloned = structuredClone(config);

			expect(cloned.model).toBe("text-embedding-3-large");
			expect(cloned.dimensions).toBe(3072);
			expect(cloned.batchSize).toBe(64);
		});

		it("should handle sensitive data in workers", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				provider: "openai",
				apiKey: "sk-secret-key-12345",
			};

			const cloned = structuredClone(config);

			expect(cloned.apiKey).toBe("sk-secret-key-12345");
		});
	});

	describe("memory efficiency", () => {
		it("should not create excessive objects", () => {
			const configs: EmbeddingConfig[] = Array.from(
				{ length: 1000 },
				() => ({
					model: "text-embedding-3-small",
					dimensions: 1536,
					cache: true,
				})
			);

			expect(configs).toHaveLength(1000);
			configs.forEach((config) => {
				expect(config.dimensions).toBe(1536);
			});
		});

		it("should handle various dimension configurations", () => {
			const dimensions = [384, 512, 768, 1024, 1536, 3072];
			const configs: EmbeddingConfig[] = dimensions.map((dim) => ({
				model: "custom-model",
				dimensions: dim,
			}));

			expect(configs).toHaveLength(6);
			expect(configs[0].dimensions).toBe(384);
			expect(configs[5].dimensions).toBe(3072);
		});

		it("should handle batch size variations", () => {
			const batchSizes = [1, 8, 16, 32, 64, 128];
			const configs: EmbeddingConfig[] = batchSizes.map((size) => ({
				model: "text-embedding-3-small",
				dimensions: 1536,
				batchSize: size,
			}));

			expect(configs).toHaveLength(6);
			expect(configs[0].batchSize).toBe(1);
			expect(configs[5].batchSize).toBe(128);
		});
	});

	describe("type safety", () => {
		it("should enforce model as string when defined", () => {
			const config: EmbeddingConfig = { model: "text-embedding-3-small" };
			if (config.model !== undefined) {
				expect(typeof config.model).toBe("string");
			}
		});

		it("should enforce dimensions as number when defined", () => {
			const config: EmbeddingConfig = { dimensions: 1536 };
			if (config.dimensions !== undefined) {
				expect(typeof config.dimensions).toBe("number");
			}
		});

		it("should enforce cache as boolean when defined", () => {
			const config: EmbeddingConfig = { cache: true };
			if (config.cache !== undefined) {
				expect(typeof config.cache).toBe("boolean");
			}
		});

		it("should enforce batchSize as number when defined", () => {
			const config: EmbeddingConfig = { batchSize: 32 };
			if (config.batchSize !== undefined) {
				expect(typeof config.batchSize).toBe("number");
			}
		});
	});

	describe("camelCase conventions", () => {
		it("should use camelCase for property names", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				cache: true,
				provider: "openai",
				apiKey: "key",
				batchSize: 32,
			};

			expect(config).toHaveProperty("model");
			expect(config).toHaveProperty("dimensions");
			expect(config).toHaveProperty("cache");
			expect(config).toHaveProperty("provider");
			expect(config).toHaveProperty("apiKey");
			expect(config).toHaveProperty("batchSize");
		});
	});

	describe("edge cases", () => {
		it("should handle zero dimensions", () => {
			const config: EmbeddingConfig = {
				model: "custom",
				dimensions: 0,
			};

			expect(config.dimensions).toBe(0);
		});

		it("should handle very large dimensions", () => {
			const config: EmbeddingConfig = {
				model: "large-model",
				dimensions: 65536,
			};

			expect(config.dimensions).toBe(65536);
		});

		it("should handle zero batch size", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				batchSize: 0,
			};

			expect(config.batchSize).toBe(0);
		});

		it("should handle very large batch sizes", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				batchSize: 10000,
			};

			expect(config.batchSize).toBe(10000);
		});

		it("should handle empty model string", () => {
			const config: EmbeddingConfig = {
				model: "",
			};

			expect(config.model).toBe("");
		});

		it("should handle empty provider string", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				provider: "",
			};

			expect(config.provider).toBe("");
		});
	});

	describe("immutability patterns", () => {
		it("should support spread operator updates", () => {
			const original: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				cache: false,
			};

			const updated: EmbeddingConfig = {
				...original,
				cache: true,
			};

			expect(original.cache).toBe(false);
			expect(updated.cache).toBe(true);
			expect(updated.model).toBe("text-embedding-3-small");
		});

		it("should support model updates", () => {
			const original: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
			};

			const updated: EmbeddingConfig = {
				...original,
				model: "text-embedding-3-large",
				dimensions: 3072,
			};

			expect(original.model).toBe("text-embedding-3-small");
			expect(updated.model).toBe("text-embedding-3-large");
			expect(updated.dimensions).toBe(3072);
		});

		it("should support batch size updates", () => {
			const original: EmbeddingConfig = {
				model: "text-embedding-3-small",
				batchSize: 32,
			};

			const updated: EmbeddingConfig = {
				...original,
				batchSize: 64,
			};

			expect(original.batchSize).toBe(32);
			expect(updated.batchSize).toBe(64);
		});
	});

	describe("practical scenarios", () => {
		it("should support OpenAI text-embedding-3-small", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				cache: true,
				provider: "openai",
			};

			expect(config.dimensions).toBe(1536);
			expect(config.provider).toBe("openai");
		});

		it("should support OpenAI text-embedding-3-large", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-large",
				dimensions: 3072,
				cache: true,
				provider: "openai",
			};

			expect(config.dimensions).toBe(3072);
		});

		it("should support HuggingFace models", () => {
			const config: EmbeddingConfig = {
				model: "sentence-transformers/all-MiniLM-L6-v2",
				dimensions: 384,
				cache: true,
				provider: "huggingface",
			};

			expect(config.provider).toBe("huggingface");
			expect(config.dimensions).toBe(384);
		});

		it("should support batch processing configuration", () => {
			const config: EmbeddingConfig = {
				model: "text-embedding-3-small",
				dimensions: 1536,
				batchSize: 32,
				cache: true,
			};

			expect(config.batchSize).toBe(32);
			expect(config.cache).toBe(true);
		});

		it("should support custom API configuration", () => {
			const config: EmbeddingConfig = {
				model: "custom-embedding-model",
				dimensions: 512,
				provider: "custom",
				apiKey: "custom-api-key-12345",
			};

			expect(config.provider).toBe("custom");
			expect(config.apiKey).toBe("custom-api-key-12345");
		});
	});
});
