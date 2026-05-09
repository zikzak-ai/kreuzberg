```typescript title="TypeScript"
import { extractFileSync } from "@kreuzberg/node";

const result = extractFileSync("document.pdf");

result.tables.forEach((table) => {
  console.log(`Table with ${table.cells.length} rows`);
  console.log(table.markdown);

  table.cells.forEach((row) => {
    console.log(row.join(" | "));
  });
});
```
