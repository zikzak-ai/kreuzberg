```typescript title="WASM"
import { initWasm, extractBytes } from '@kreuzberg/wasm';

await initWasm();

const bytes = new Uint8Array(
	await fetch('report.xlsx').then((r) => r.arrayBuffer()),
);

const result = await extractBytes(
	bytes,
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
);

console.log(result.content);
console.log(`Tables: ${result.tables.length}`);

for (const table of result.tables) {
	console.log(`Sheet (Page ${table.pageNumber}):`);
	console.log(table.markdown);
}
```
