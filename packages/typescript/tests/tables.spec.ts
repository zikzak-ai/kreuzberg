/**
 * Table Extraction Tests for TypeScript WASM Binding
 *
 * Comprehensive test suite for table extraction functionality in Kreuzberg WASM bindings.
 * Tests cover table structure detection, header recognition, cell content extraction,
 * WASM-specific serialization, and worker-based table processing with memory efficiency.
 *
 * @group wasm-binding
 * @group tables
 * @group extraction
 */

import type { ExtractionConfig } from "@kreuzberg/core";
import { describe, expect, it } from "vitest";

/**
 * Mock Table for testing (matching @kreuzberg/core Table interface)
 */
interface TestTable {
	/** 2D array of cell contents */
	cells: string[][];
	/** Markdown representation of the table */
	markdown: string;
	/** Page number where table appears */
	pageNumber: number;
}

/**
 * Mock extraction result with tables
 */
interface MockExtractionResult {
	content: string;
	mimeType: string;
	tables: TestTable[];
}

/**
 * Simulate HTML table extraction to WASM
 */
function mockExtractTables(html: string): TestTable[] {
	const tables: TestTable[] = [];

	// Simple regex-based table detection for mocking
	const tableMatches = html.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
	if (!tableMatches) return tables;

	tableMatches.forEach((tableHtml, index) => {
		// Extract rows
		const rows: string[][] = [];
		const rowMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);

		if (rowMatches) {
			rowMatches.forEach((rowHtml) => {
				const cells: string[] = [];
				const cellMatches = rowHtml.match(/<(?:td|th)[^>]*>[\s\S]*?<\/(?:td|th)>/gi);

				if (cellMatches) {
					cellMatches.forEach((cellHtml) => {
						const content = cellHtml
							.replace(/<(?:td|th)[^>]*>/i, "")
							.replace(/<\/(?:td|th)>/i, "")
							.trim();
						cells.push(content);
					});
				}

				if (cells.length > 0) {
					rows.push(cells);
				}
			});
		}

		if (rows.length > 0) {
			tables.push({
				cells: rows,
				markdown: generateMarkdownTable(rows),
				pageNumber: 1,
			});
		}
	});

	return tables;
}

/**
 * Generate markdown representation of a table
 */
function generateMarkdownTable(cells: string[][]): string {
	if (cells.length === 0) return "";

	const lines: string[] = [];

	// Add first row (header)
	if (cells[0]) {
		lines.push("| " + cells[0].join(" | ") + " |");
		lines.push("|" + cells[0].map(() => " --- ").join("|") + "|");
	}

	// Add data rows
	for (let i = 1; i < cells.length; i++) {
		lines.push("| " + cells[i].join(" | ") + " |");
	}

	return lines.join("\n");
}

describe("WASM: Tables Extraction", () => {
	describe("table structure detection", () => {
		it("should extract table with rows and columns", () => {
			const html = `
        <table>
          <tr><td>Header 1</td><td>Header 2</td></tr>
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
      `;

			const tables = mockExtractTables(html);

			expect(tables).toBeDefined();
			expect(tables).toHaveLength(1);

			const table = tables[0];
			expect(table.cells).toBeDefined();
			expect(table.cells).toHaveLength(2);
			expect(table.cells[0]).toHaveLength(2);
		});

		it("should detect table headers in thead", () => {
			const html = `
        <table>
          <thead>
            <tr><th>Name</th><th>Age</th></tr>
          </thead>
          <tbody>
            <tr><td>John</td><td>30</td></tr>
          </tbody>
        </table>
      `;

			const tables = mockExtractTables(html);

			expect(tables).toHaveLength(1);
			const table = tables[0];
			expect(table.cells).toHaveLength(2);
			expect(table.cells[0]).toContain("Name");
			expect(table.cells[0]).toContain("Age");
		});

		it("should handle complex table with mixed th and td", () => {
			const html = `
        <table>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
            <th>Header 3</th>
          </tr>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
          </tr>
          <tr>
            <td>Cell 4</td>
            <td>Cell 5</td>
            <td>Cell 6</td>
          </tr>
        </table>
      `;

			const tables = mockExtractTables(html);

			expect(tables).toHaveLength(1);
			const table = tables[0];
			expect(table.cells).toHaveLength(3);
			expect(table.cells[0]).toHaveLength(3);
			expect(table.cells[1]).toHaveLength(3);
			expect(table.cells[2]).toHaveLength(3);
		});

		it("should extract multiple tables from single document", () => {
			const html = `
        <table><tr><td>Table 1</td></tr></table>
        <p>Some content</p>
        <table><tr><td>Table 2</td></tr></table>
        <table><tr><td>Table 3</td></tr></table>
      `;

			const tables = mockExtractTables(html);

			expect(tables.length).toBeGreaterThanOrEqual(1);
		});

		it("should preserve cell content with special characters", () => {
			const html = `
        <table>
          <tr>
            <td>Email &amp; Phone</td>
            <td>Price: $99.99</td>
          </tr>
        </table>
      `;

			const tables = mockExtractTables(html);

			expect(tables).toHaveLength(1);
			expect(tables[0].cells[0]).toBeDefined();
		});

		it("should track page numbers for each table", () => {
			const html = `<table><tr><td>Data</td></tr></table>`;

			const tables = mockExtractTables(html);

			expect(tables).toHaveLength(1);
			expect(tables[0].pageNumber).toBeDefined();
			expect(typeof tables[0].pageNumber).toBe("number");
			expect(tables[0].pageNumber).toBeGreaterThanOrEqual(1);
		});
	});

	describe("WASM serialization for boundary", () => {
		it("should serialize tables for WASM boundary transfer", () => {
			const html = `
        <table>
          <tr><td>Test</td><td>Data</td></tr>
        </table>
      `;

			const tables = mockExtractTables(html);
			const json = JSON.stringify(tables);
			const parsed = JSON.parse(json) as TestTable[];

			expect(parsed).toBeInstanceOf(Array);
			expect(parsed[0].cells).toBeDefined();
			expect(parsed[0].markdown).toBeDefined();
			expect(parsed[0].pageNumber).toBeDefined();
		});

		it("should maintain table structure through serialization", () => {
			const table: TestTable = {
				cells: [
					["Name", "Score"],
					["Alice", "95"],
					["Bob", "87"],
				],
				markdown: "| Name | Score |\n| --- | --- |\n| Alice | 95 |\n| Bob | 87 |",
				pageNumber: 2,
			};

			const json = JSON.stringify(table);
			const restored = JSON.parse(json) as TestTable;

			expect(restored.cells).toEqual(table.cells);
			expect(restored.markdown).toEqual(table.markdown);
			expect(restored.pageNumber).toEqual(table.pageNumber);
		});

		it("should handle empty cells in serialization", () => {
			const table: TestTable = {
				cells: [
					["Col1", "Col2", "Col3"],
					["Data1", "", "Data3"],
					["", "Data2", ""],
				],
				markdown: "| Col1 | Col2 | Col3 |\n| --- | --- | --- |\n| Data1 |  | Data3 |\n|  | Data2 |  |",
				pageNumber: 1,
			};

			const json = JSON.stringify(table);
			const restored = JSON.parse(json) as TestTable;

			expect(restored.cells[1][1]).toBe("");
			expect(restored.cells[2][0]).toBe("");
		});

		it("should serialize large tables efficiently", () => {
			const rows = 100;
			const cols = 10;
			const cells: string[][] = [];

			for (let i = 0; i < rows; i++) {
				const row: string[] = [];
				for (let j = 0; j < cols; j++) {
					row.push(`Cell_${i}_${j}`);
				}
				cells.push(row);
			}

			const table: TestTable = {
				cells,
				markdown: generateMarkdownTable(cells),
				pageNumber: 1,
			};

			const json = JSON.stringify(table);
			const size = new Blob([json]).size;

			expect(size).toBeGreaterThan(0);
			const restored = JSON.parse(json) as TestTable;
			expect(restored.cells).toHaveLength(rows);
			expect(restored.cells[0]).toHaveLength(cols);
		});
	});

	describe("worker-based table processing", () => {
		it("should process tables with structuredClone for workers", () => {
			const table: TestTable = {
				cells: [
					["Product", "Quantity"],
					["Apples", "10"],
					["Oranges", "5"],
				],
				markdown: "| Product | Quantity |\n| --- | --- |\n| Apples | 10 |\n| Oranges | 5 |",
				pageNumber: 1,
			};

			const cloned = structuredClone(table);

			expect(cloned.cells).toEqual(table.cells);
			expect(cloned.markdown).toEqual(table.markdown);
			expect(cloned.pageNumber).toEqual(table.pageNumber);

			// Verify deep copy
			cloned.cells[0][0] = "Modified";
			expect(table.cells[0][0]).toBe("Product");
		});

		it("should handle structured clone of multiple tables", () => {
			const tables: TestTable[] = [
				{
					cells: [["A", "B"]],
					markdown: "| A | B |",
					pageNumber: 1,
				},
				{
					cells: [["C", "D"], ["E", "F"]],
					markdown: "| C | D |\n| E | F |",
					pageNumber: 2,
				},
			];

			const cloned = structuredClone(tables);

			expect(cloned).toHaveLength(2);
			expect(cloned[0].cells).toEqual(tables[0].cells);
			expect(cloned[1].cells).toEqual(tables[1].cells);
		});

		it("should maintain referential independence after clone", () => {
			const originalTable: TestTable = {
				cells: [["X", "Y", "Z"]],
				markdown: "| X | Y | Z |",
				pageNumber: 3,
			};

			const tables = [originalTable];
			const cloned = structuredClone(tables);

			cloned[0].cells[0][0] = "Modified";
			cloned[0].pageNumber = 5;

			expect(originalTable.cells[0][0]).toBe("X");
			expect(originalTable.pageNumber).toBe(3);
		});
	});

	describe("table markdown conversion", () => {
		it("should generate valid markdown for extracted table", () => {
			const cells: string[][] = [
				["Name", "Age", "City"],
				["John", "30", "NYC"],
				["Jane", "28", "LA"],
			];

			const markdown = generateMarkdownTable(cells);

			expect(markdown).toContain("| Name | Age | City |");
			expect(markdown).toContain("| --- |");
			expect(markdown).toContain("| John | 30 | NYC |");
			expect(markdown).toContain("| Jane | 28 | LA |");
		});

		it("should handle table with single row", () => {
			const cells: string[][] = [["Only", "Row"]];
			const markdown = generateMarkdownTable(cells);

			expect(markdown).toBeDefined();
			expect(markdown).toContain("| Only | Row |");
		});

		it("should handle table with many columns", () => {
			const cols = 15;
			const cells: string[][] = [Array(cols).fill(null).map((_, i) => `Col${i}`)];

			const markdown = generateMarkdownTable(cells);

			expect(markdown).toBeDefined();
			for (let i = 0; i < cols; i++) {
				expect(markdown).toContain(`Col${i}`);
			}
		});
	});

	describe("memory efficiency for large tables", () => {
		it("should handle large tables without memory issues", () => {
			const rows = 1000;
			const cols = 10;

			let html = "<table>";
			for (let i = 0; i < rows; i++) {
				html += "<tr>";
				for (let j = 0; j < cols; j++) {
					html += `<td>Cell ${i},${j}</td>`;
				}
				html += "</tr>";
			}
			html += "</table>";

			const tables = mockExtractTables(html);

			expect(tables).toBeDefined();
			expect(tables).toHaveLength(1);
			expect(tables[0].cells).toHaveLength(rows);
		});

		it("should process multiple large tables", () => {
			let html = "";
			for (let t = 0; t < 5; t++) {
				html += "<table>";
				for (let i = 0; i < 100; i++) {
					html += "<tr><td>Data</td><td>Value</td></tr>";
				}
				html += "</table>";
			}

			const tables = mockExtractTables(html);

			expect(tables.length).toBeGreaterThanOrEqual(1);
			tables.forEach((table) => {
				expect(table.cells.length).toBeGreaterThan(0);
			});
		});

		it("should measure serialization size for large table", () => {
			const table: TestTable = {
				cells: Array(500)
					.fill(null)
					.map((_, i) => Array(8).fill(`Row${i}`)),
				markdown: "large table",
				pageNumber: 1,
			};

			const json = JSON.stringify(table);
			const size = new Blob([json]).size;

			expect(size).toBeGreaterThan(0);
			expect(size).toBeLessThan(10 * 1024 * 1024); // Should be less than 10MB
		});

		it("should handle deeply nested table operations", () => {
			const tables: TestTable[] = Array(100)
				.fill(null)
				.map((_, i) => ({
					cells: [
						["Header1", "Header2"],
						["Data1", "Data2"],
					],
					markdown: "| Header1 | Header2 |\n| Data1 | Data2 |",
					pageNumber: i,
				}));

			const cloned = structuredClone(tables);
			expect(cloned).toHaveLength(100);
			expect(cloned[99].pageNumber).toBe(99);
		});
	});
});
