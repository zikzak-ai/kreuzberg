```typescript title="WASM"
import { extractBytesSync, initWasm } from "@kreuzberg/wasm";

await initWasm();

const response = await fetch("document.pdf");
const buffer = await response.arrayBuffer();
const data = new Uint8Array(buffer);

const result = extractBytesSync(data, "application/pdf");
console.log(result.content);
```
