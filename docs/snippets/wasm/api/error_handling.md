```typescript title="WASM"
import { extractFileSync, initWasm } from "@kreuzberg/wasm";

await initWasm();

const fileInput = document.getElementById("file") as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  try {
    const result = extractFileSync(file);
    console.log(`Extracted: ${result.content.length} characters`);
  } catch (error) {
    console.error("Extraction failed:", (error as Error).message);
  }
}
```
