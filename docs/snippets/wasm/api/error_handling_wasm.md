```typescript title="WASM"
import { extractBytes, initWasm } from "@kreuzberg/wasm";

await initWasm();

const response = await fetch("document.pdf");
const buffer = await response.arrayBuffer();
const data = new Uint8Array(buffer);

try {
  const result = await extractBytes(data, "application/pdf");
  console.log(`Success: ${result.content.length} characters`);
} catch (error) {
  if (error instanceof Error) {
    console.error("Extraction error:", error.message);
  }
}
```
