```typescript title="WASM"
import { batchExtractBytesSync, initWasm } from "@kreuzberg/wasm";

await initWasm();

const urls = ["document1.pdf", "document2.pdf"];
const requests = await Promise.all(
  urls.map(async (url) => {
    const resp = await fetch(url);
    return { data: new Uint8Array(await resp.arrayBuffer()), mimeType: "application/pdf" };
  })
);

const results = batchExtractBytesSync(requests);

results.forEach((result, i) => {
  console.log(`Document ${i + 1}: ${result.content.length} characters`);
});
```
