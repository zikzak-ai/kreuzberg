```typescript title="WASM"
import { batchExtractFilesSync, initWasm } from "@kreuzberg/wasm";

await initWasm();

const fileInputs = document.getElementById("files") as HTMLInputElement;
const files = Array.from(fileInputs.files || []);

const results = batchExtractFilesSync(files);

results.forEach((result, i) => {
  console.log(`File ${i + 1}: ${result.content.length} characters`);
});
```
