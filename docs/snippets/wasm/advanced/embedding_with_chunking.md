```typescript title="WASM - Chunks with Embedding Support"
import init, { extractBytes } from "kreuzberg-wasm";

await init();

const config = {
  chunking: {
    maxChars: 512,
    chunkOverlap: 128,
  },
};

const bytes = new Uint8Array(buffer);
const result = await extractBytes(bytes, "application/pdf", config);

// Each chunk can optionally contain an embedding vector
// In WASM, embeddings require external embedding service
result.chunks?.forEach((chunk) => {
  const hasEmbedding = chunk.embedding && chunk.embedding.length > 0;
  console.log(`Chunk ${chunk.metadata?.chunkIndex}: ${chunk.content.length} chars${hasEmbedding ? ` + ${chunk.embedding!.length}-dim embedding` : ""}`);
});

// Example: Add embeddings using external service
const chunkTexts = result.chunks?.map(c => c.content) || [];
console.log(`Text chunks ready for embedding: ${chunkTexts.length}`);

// Process embeddings externally (e.g., Hugging Face, OpenAI, local model)
// const embeddings = await externalEmbeddingService.embed(chunkTexts);
// Then associate embeddings with chunks
```

```typescript title="WASM - Chunk Embeddings for Vector Store"
import init, { extractBytes } from "kreuzberg-wasm";

await init();

const config = {
  chunking: {
    maxChars: 600,
    chunkOverlap: 150,
    trim: true,
  },
};

const bytes = new Uint8Array(buffer);
const result = await extractBytes(bytes, "text/markdown", config);

interface VectorStoreEntry {
  id: string;
  text: string;
  embedding?: number[];
  metadata: {
    chunk_index: number;
    content_hash: string;
  };
}

// Prepare chunks for vector embedding and storage
const entries: VectorStoreEntry[] = result.chunks?.map((chunk, idx) => {
  // Compute a simple hash of the content for deduplication
  const encoder = new TextEncoder();
  const data = encoder.encode(chunk.content);
  const hashBuffer = new Uint8Array(data).reduce((acc, byte) => acc + byte, 0);
  
  return {
    id: `chunk_${idx}`,
    text: chunk.content,
    metadata: {
      chunk_index: chunk.metadata?.chunkIndex || idx,
      content_hash: hashBuffer.toString(16),
    },
  };
}) || [];

console.log(`Created ${entries.length} vector store entries`);
entries.slice(0, 2).forEach(e => {
  console.log(`  ${e.id}: "${e.text.substring(0, 50)}..."`);
});
```

<!-- snippet:syntax-only --> - Embeddings require external embedding service or ONNX Runtime models not available in standard WASM builds.
