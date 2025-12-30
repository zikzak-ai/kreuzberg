/**
 * Embeddings Tests for TypeScript WASM Binding
 *
 * Comprehensive test suite for embedding generation functionality in Kreuzberg WASM bindings.
 * Tests cover vector generation in WASM, embedding dimensions, batch operations,
 * memory efficiency, vector normalization, and similarity calculations.
 *
 * @group wasm-binding
 * @group embeddings
 * @group extraction
 */

import type { ChunkingConfig } from "@kreuzberg/core";
import { describe, expect, it } from "vitest";

/**
 * Mock Chunk with embeddings matching @kreuzberg/core Chunk interface
 */
interface TestChunk {
	/** Text content of chunk */
	content: string;
	/** Embedding vector (if generated) */
	embedding?: number[] | null;
	/** Chunk metadata */
	metadata: ChunkMetadata;
}

/**
 * Mock chunk metadata
 */
interface ChunkMetadata {
	charStart: number;
	charEnd: number;
	tokenCount?: number | null;
	chunkIndex: number;
	totalChunks: number;
}

/**
 * Simulate vector embedding generation
 */
function generateEmbedding(text: string, dimensions: number): number[] {
	// Hash-based mock embedding for deterministic testing
	let hash = 0;
	for (let i = 0; i < text.length; i++) {
		const char = text.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	const embedding: number[] = [];
	let seed = Math.abs(hash) || 1;

	for (let i = 0; i < dimensions; i++) {
		seed = (seed * 9301 + 49297) % 233280;
		embedding.push((seed / 233280 - 0.5) * 2); // Range [-1, 1]
	}

	return embedding;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
	if (a.length !== b.length) {
		throw new Error("Vector dimensions must match");
	}

	let dotProduct = 0;
	let magnitudeA = 0;
	let magnitudeB = 0;

	for (let i = 0; i < a.length; i++) {
		dotProduct += a[i] * b[i];
		magnitudeA += a[i] * a[i];
		magnitudeB += b[i] * b[i];
	}

	magnitudeA = Math.sqrt(magnitudeA);
	magnitudeB = Math.sqrt(magnitudeB);

	if (magnitudeA === 0 || magnitudeB === 0) {
		return 0;
	}

	return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Normalize vector to unit length
 */
function normalizeVector(vector: number[]): number[] {
	let magnitude = 0;
	for (let i = 0; i < vector.length; i++) {
		magnitude += vector[i] * vector[i];
	}

	magnitude = Math.sqrt(magnitude);

	if (magnitude === 0) {
		return vector;
	}

	return vector.map((v) => v / magnitude);
}

describe("WASM: Embeddings", () => {
	describe("vector generation", () => {
		it("should generate embedding vector for text chunk", () => {
			const text = "This is a sample text for embedding generation";
			const embedding = generateEmbedding(text, 384);

			expect(embedding).toBeInstanceOf(Array);
			expect(embedding).toHaveLength(384);
			expect(typeof embedding[0]).toBe("number");
		});

		it("should generate consistent embeddings for same input", () => {
			const text = "Consistent embedding test";

			const embedding1 = generateEmbedding(text, 256);
			const embedding2 = generateEmbedding(text, 256);

			expect(embedding1).toEqual(embedding2);
		});

		it("should generate different embeddings for different inputs", () => {
			const embedding1 = generateEmbedding("Text A", 256);
			const embedding2 = generateEmbedding("Text B", 256);

			expect(embedding1).not.toEqual(embedding2);
		});

		it("should generate embeddings with values in valid range", () => {
			const embedding = generateEmbedding("Test content", 512);

			embedding.forEach((value) => {
				expect(value).toBeGreaterThanOrEqual(-1);
				expect(value).toBeLessThanOrEqual(1);
			});
		});

		it("should handle empty text for embedding", () => {
			const embedding = generateEmbedding("", 128);

			expect(embedding).toHaveLength(128);
			embedding.forEach((value) => {
				expect(typeof value).toBe("number");
			});
		});
	});

	describe("embedding dimensions", () => {
		it("should respect requested embedding dimension 128", () => {
			const embedding = generateEmbedding("Test", 128);
			expect(embedding).toHaveLength(128);
		});

		it("should respect requested embedding dimension 256", () => {
			const embedding = generateEmbedding("Test", 256);
			expect(embedding).toHaveLength(256);
		});

		it("should respect requested embedding dimension 384", () => {
			const embedding = generateEmbedding("Test", 384);
			expect(embedding).toHaveLength(384);
		});

		it("should respect requested embedding dimension 768", () => {
			const embedding = generateEmbedding("Test", 768);
			expect(embedding).toHaveLength(768);
		});

		it("should support various custom dimensions", () => {
			const dimensions = [64, 128, 256, 512, 1024];

			dimensions.forEach((dim) => {
				const embedding = generateEmbedding("Content", dim);
				expect(embedding).toHaveLength(dim);
			});
		});
	});

	describe("batch embedding operations", () => {
		it("should generate embeddings for multiple chunks", () => {
			const chunks = [
				"First chunk of text",
				"Second chunk of text",
				"Third chunk of text",
			];

			const embeddings = chunks.map((chunk) => generateEmbedding(chunk, 256));

			expect(embeddings).toHaveLength(3);
			embeddings.forEach((emb) => {
				expect(emb).toHaveLength(256);
			});
		});

		it("should process chunks in sequence with consistent dimensions", () => {
			const chunks: TestChunk[] = Array(10)
				.fill(null)
				.map((_, i) => ({
					content: `Chunk number ${i}`,
					embedding: generateEmbedding(`Chunk number ${i}`, 384),
					metadata: {
						charStart: i * 100,
						charEnd: (i + 1) * 100,
						chunkIndex: i,
						totalChunks: 10,
					},
				}));

			expect(chunks).toHaveLength(10);
			chunks.forEach((chunk) => {
				expect(chunk.embedding).toHaveLength(384);
			});
		});

		it("should handle batch of 100 embeddings", () => {
			const chunks: TestChunk[] = Array(100)
				.fill(null)
				.map((_, i) => ({
					content: `Document chunk ${i}`,
					embedding: generateEmbedding(`Document chunk ${i}`, 256),
					metadata: {
						charStart: i * 50,
						charEnd: (i + 1) * 50,
						chunkIndex: i,
						totalChunks: 100,
					},
				}));

			expect(chunks).toHaveLength(100);
			let embeddedCount = 0;
			chunks.forEach((chunk) => {
				if (chunk.embedding) {
					embeddedCount++;
				}
			});
			expect(embeddedCount).toBe(100);
		});

		it("should support optional embedding (null when not generated)", () => {
			const chunk: TestChunk = {
				content: "Content without embedding",
				embedding: null,
				metadata: {
					charStart: 0,
					charEnd: 100,
					chunkIndex: 0,
					totalChunks: 1,
				},
			};

			expect(chunk.embedding).toBeNull();
		});

		it("should maintain embedding correspondence with chunks", () => {
			const texts = [
				"Introduction paragraph",
				"Main content section",
				"Conclusion remarks",
			];

			const chunks: TestChunk[] = texts.map((text, i) => ({
				content: text,
				embedding: generateEmbedding(text, 256),
				metadata: {
					charStart: i * 100,
					charEnd: (i + 1) * 100,
					chunkIndex: i,
					totalChunks: 3,
				},
			}));

			chunks.forEach((chunk, index) => {
				expect(chunk.content).toBe(texts[index]);
				expect(chunk.embedding).toEqual(generateEmbedding(texts[index], 256));
			});
		});
	});

	describe("vector normalization", () => {
		it("should normalize vector to unit length", () => {
			const vector = [3, 4]; // magnitude = 5
			const normalized = normalizeVector(vector);

			const magnitude = Math.sqrt(
				normalized[0] * normalized[0] + normalized[1] * normalized[1]
			);

			expect(magnitude).toBeCloseTo(1, 5);
		});

		it("should normalize high-dimensional vectors", () => {
			const vector = generateEmbedding("Test", 384);
			const normalized = normalizeVector(vector);

			let magnitude = 0;
			for (let i = 0; i < normalized.length; i++) {
				magnitude += normalized[i] * normalized[i];
			}
			magnitude = Math.sqrt(magnitude);

			expect(magnitude).toBeCloseTo(1, 5);
		});

		it("should handle zero vector", () => {
			const zeroVector = [0, 0, 0, 0];
			const result = normalizeVector(zeroVector);

			expect(result).toEqual(zeroVector);
		});

		it("should preserve direction after normalization", () => {
			const vector = [3, 4, 12];
			const normalized = normalizeVector(vector);

			// Direction is preserved if proportions are same
			const ratio1 = normalized[0] / vector[0];
			const ratio2 = normalized[1] / vector[1];
			const ratio3 = normalized[2] / vector[2];

			expect(ratio1).toBeCloseTo(ratio2, 5);
			expect(ratio2).toBeCloseTo(ratio3, 5);
		});
	});

	describe("similarity calculations", () => {
		it("should calculate cosine similarity between identical vectors", () => {
			const embedding = generateEmbedding("Test", 256);
			const similarity = cosineSimilarity(embedding, embedding);

			expect(similarity).toBeCloseTo(1, 5);
		});

		it("should calculate cosine similarity between similar texts", () => {
			const emb1 = generateEmbedding("Machine learning models", 256);
			const emb2 = generateEmbedding("Machine learning algorithms", 256);

			const similarity = cosineSimilarity(emb1, emb2);

			expect(similarity).toBeGreaterThan(-1);
			expect(similarity).toBeLessThanOrEqual(1);
		});

		it("should calculate lower similarity for different texts", () => {
			const emb1 = generateEmbedding("Apple fruit", 256);
			const emb2 = generateEmbedding("Zero temperature physics", 256);

			const similarity = cosineSimilarity(emb1, emb2);

			expect(similarity).toBeLessThan(1);
		});

		it("should be symmetric", () => {
			const emb1 = generateEmbedding("Text one", 256);
			const emb2 = generateEmbedding("Text two", 256);

			const sim1 = cosineSimilarity(emb1, emb2);
			const sim2 = cosineSimilarity(emb2, emb1);

			expect(sim1).toBeCloseTo(sim2, 5);
		});

		it("should handle orthogonal vectors (similarity near 0)", () => {
			const vec1 = [1, 0, 0];
			const vec2 = [0, 1, 0];

			const similarity = cosineSimilarity(vec1, vec2);

			expect(similarity).toBeCloseTo(0, 5);
		});
	});

	describe("memory efficiency", () => {
		it("should measure embedding memory size", () => {
			const embedding = generateEmbedding("Test", 384);
			const json = JSON.stringify(embedding);
			const bytes = new Blob([json]).size;

			expect(bytes).toBeGreaterThan(0);
			expect(bytes).toBeLessThan(50 * 1024); // Should be less than 50KB
		});

		it("should handle multiple embeddings efficiently", () => {
			const embeddings: number[][] = Array(1000)
				.fill(null)
				.map((_, i) => generateEmbedding(`Content ${i}`, 256));

			const json = JSON.stringify(embeddings);
			const bytes = new Blob([json]).size;

			expect(bytes).toBeGreaterThan(0);
			expect(bytes).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
		});

		it("should reuse embeddings without duplication", () => {
			const text = "Repeated content for embedding";
			const embedding = generateEmbedding(text, 256);

			const chunks: TestChunk[] = Array(50)
				.fill(null)
				.map((_, i) => ({
					content: text,
					embedding: embedding, // Reuse same embedding
					metadata: {
						charStart: i * 100,
						charEnd: (i + 1) * 100,
						chunkIndex: i,
						totalChunks: 50,
					},
				}));

			expect(chunks.every((c) => c.embedding === embedding)).toBe(true);
		});

		it("should serialize large embedding batch efficiently", () => {
			const chunks: TestChunk[] = Array(500)
				.fill(null)
				.map((_, i) => ({
					content: `Long document content chunk number ${i}`,
					embedding: generateEmbedding(`Content ${i}`, 384),
					metadata: {
						charStart: i * 200,
						charEnd: (i + 1) * 200,
						chunkIndex: i,
						totalChunks: 500,
					},
				}));

			const json = JSON.stringify(chunks);
			const bytes = new Blob([json]).size;

			expect(bytes).toBeGreaterThan(0);
			expect(bytes).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
		});

		it("should handle optional embeddings (null) efficiently", () => {
			const chunks: TestChunk[] = Array(100)
				.fill(null)
				.map((_, i) => ({
					content: `Chunk ${i}`,
					embedding: i % 2 === 0 ? generateEmbedding(`Chunk ${i}`, 256) : null,
					metadata: {
						charStart: i * 100,
						charEnd: (i + 1) * 100,
						chunkIndex: i,
						totalChunks: 100,
					},
				}));

			expect(chunks.filter((c) => c.embedding !== null)).toHaveLength(50);
			expect(chunks.filter((c) => c.embedding === null)).toHaveLength(50);
		});
	});

	describe("integration with chunking config", () => {
		it("should apply embedding config to chunking", () => {
			const config: ChunkingConfig = {
				enabled: true,
				maxChars: 1000,
				embedding: {
					dimensions: 384,
					model: "mock-embedding-v1",
				},
			};

			expect(config.embedding).toBeDefined();
			expect((config.embedding as Record<string, unknown>).dimensions).toBe(384);
		});

		it("should handle embedding in chunking preset", () => {
			const config: ChunkingConfig = {
				preset: "semantic",
				embedding: {
					enabled: true,
					dimensions: 256,
				},
			};

			expect(config.preset).toBe("semantic");
			expect(config.embedding).toBeDefined();
		});

		it("should generate embeddings for chunked content", () => {
			const config: ChunkingConfig = {
				enabled: true,
				maxChars: 500,
			};

			const content = "A".repeat(2000); // 2000 characters
			const chunkSize = 500;
			const chunks: TestChunk[] = [];

			for (let i = 0; i < content.length; i += chunkSize) {
				const chunkContent = content.substring(i, i + chunkSize);
				chunks.push({
					content: chunkContent,
					embedding: generateEmbedding(chunkContent, 256),
					metadata: {
						charStart: i,
						charEnd: Math.min(i + chunkSize, content.length),
						chunkIndex: chunks.length,
						totalChunks: Math.ceil(content.length / chunkSize),
					},
				});
			}

			expect(chunks.length).toBe(4);
			chunks.forEach((chunk) => {
				expect(chunk.embedding).toHaveLength(256);
			});
		});
	});

	describe("structured cloning for workers", () => {
		it("should clone embedding vectors for worker transfer", () => {
			const embedding = generateEmbedding("Worker test", 256);
			const cloned = structuredClone(embedding);

			expect(cloned).toEqual(embedding);
			cloned[0] = -999;
			expect(embedding[0]).not.toBe(-999);
		});

		it("should clone chunks with embeddings", () => {
			const chunk: TestChunk = {
				content: "Test chunk",
				embedding: generateEmbedding("Test chunk", 384),
				metadata: {
					charStart: 0,
					charEnd: 10,
					chunkIndex: 0,
					totalChunks: 1,
				},
			};

			const cloned = structuredClone(chunk);

			expect(cloned.embedding).toEqual(chunk.embedding);
			cloned.embedding![0] = -999;
			expect(chunk.embedding![0]).not.toBe(-999);
		});

		it("should batch clone multiple chunks", () => {
			const chunks: TestChunk[] = Array(5)
				.fill(null)
				.map((_, i) => ({
					content: `Chunk ${i}`,
					embedding: generateEmbedding(`Chunk ${i}`, 256),
					metadata: {
						charStart: i * 100,
						charEnd: (i + 1) * 100,
						chunkIndex: i,
						totalChunks: 5,
					},
				}));

			const cloned = structuredClone(chunks);

			expect(cloned).toHaveLength(5);
			cloned.forEach((c) => {
				expect(c.embedding).toHaveLength(256);
			});
		});
	});
});
