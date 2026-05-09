```typescript title="WASM"
import { extractFile, initWasm } from "@kreuzberg/wasm";

await initWasm();

const fileInput = document.getElementById("file") as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  const result = await extractFile(file);
  const content = result.content;
  const tableCount = result.tables.length;

  console.log(`Content length: ${content.length} characters`);
  console.log(`Tables: ${tableCount}`);
}
```
