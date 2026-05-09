```typescript title="WASM"
import { extractFileSync, initWasm } from "@kreuzberg/wasm";

await initWasm();

const fileInput = document.getElementById("file") as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  const result = extractFileSync(file);
  console.log(result.content);
  console.log(`Tables: ${result.tables.length}`);
  console.log(`Metadata: ${JSON.stringify(result.metadata)}`);
}
```
