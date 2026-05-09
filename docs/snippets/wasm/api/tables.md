```typescript title="WASM"
import { extractFileSync, initWasm } from "@kreuzberg/wasm";

await initWasm();

const fileInput = document.getElementById("file") as HTMLInputElement;
const file = fileInput.files?.[0];

if (file) {
  const result = extractFileSync(file);

  result.tables.forEach((table) => {
    console.log(`Table with ${table.cells.length} rows`);
    console.log(table.markdown);
    table.cells.forEach((row) => {
      console.log(row);
    });
  });
}
```
