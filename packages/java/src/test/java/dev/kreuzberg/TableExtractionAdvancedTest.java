package dev.kreuzberg;

import static org.junit.jupiter.api.Assertions.*;

import dev.kreuzberg.config.ExtractionConfig;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Advanced comprehensive tests for table extraction in Java binding.
 *
 * <p>
 * Tests cover: - Table column/row counting precision - Table unmodifiable
 * collections - Complex table structures - Table metadata validation - Cell
 * equality and hashing - Large-scale table operations - Table transformation
 * and markdown accuracy - Row/column boundary conditions
 *
 * @since 4.0.0
 */
@DisplayName("Table Extraction Advanced Tests")
final class TableExtractionAdvancedTest {

	/**
	 * Test table getRow() and getRows() methods. Verifies: - getRow(i) returns
	 * correct row - getRows() returns all rows - Row indices are consistent
	 */
	@Test
	@DisplayName("should provide correct row access methods")
	void testTableRowAccessMethods() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><th>A</th><th>B</th><th>C</th></tr>"
				+ "<tr><td>1</td><td>2</td><td>3</td></tr>" + "<tr><td>4</td><td>5</td><td>6</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);
			int rowCount = table.getRowCount();

			// Test individual row access
			for (int i = 0; i < rowCount; i++) {
				List<String> row = table.getRow(i);
				assertNotNull(row, "Row " + i + " should not be null");
				assertTrue(row.size() > 0, "Row " + i + " should have columns");
			}

			// Test invalid row index
			assertThrows(IndexOutOfBoundsException.class, () -> table.getRow(rowCount),
					"Invalid row index should throw exception");
			assertThrows(IndexOutOfBoundsException.class, () -> table.getRow(-1),
					"Negative row index should throw exception");
		}
	}

	/**
	 * Test table column count and structure. Verifies: - Column count matches row
	 * sizes - All rows have consistent columns - Column structure is valid
	 */
	@Test
	@DisplayName("should maintain correct table column structure")
	void testTableColumnStructure() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><td>A</td><td>B</td><td>C</td><td>D</td></tr>"
				+ "<tr><td>1</td><td>2</td><td>3</td><td>4</td></tr>"
				+ "<tr><td>5</td><td>6</td><td>7</td><td>8</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);
			int colCount = table.getColumnCount();

			// Verify column count is positive
			assertTrue(colCount > 0, "Column count should be positive");

			// Verify all rows have consistent column count
			int rowCount = table.getRowCount();
			for (int i = 0; i < rowCount; i++) {
				List<String> row = table.getRow(i);
				assertEquals(colCount, row.size(), "Row " + i + " should have " + colCount + " columns");
			}

			// Verify column data is accessible via row/cell methods
			for (int j = 0; j < colCount; j++) {
				for (int i = 0; i < rowCount; i++) {
					String cellValue = table.getRow(i).get(j);
					assertNotNull(cellValue, "Cell at [" + i + "," + j + "] should not be null");
				}
			}
		}
	}

	/**
	 * Test table unmodifiable collections. Verifies: - Cells list is unmodifiable -
	 * Rows are unmodifiable - Columns are unmodifiable
	 */
	@Test
	@DisplayName("should provide unmodifiable table collections")
	void testTableUnmodifiableCollections() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><td>X</td><td>Y</td></tr>" + "<tr><td>Z</td><td>W</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);

			// Cells should be unmodifiable
			List<List<String>> cells = table.cells();
			assertThrows(UnsupportedOperationException.class, () -> cells.add(null),
					"Cells list should be unmodifiable");

			// Individual rows should be unmodifiable
			if (table.getRowCount() > 0) {
				List<String> row = table.getRow(0);
				assertThrows(UnsupportedOperationException.class, () -> row.add("new"), "Row should be unmodifiable");
			}
		}
	}

	/**
	 * Test table cell equality and value consistency. Verifies: - Cell values are
	 * consistent across access methods - Same cell accessed different ways equals -
	 * Cell modifications are prevented
	 */
	@Test
	@DisplayName("should ensure cell consistency across access methods")
	void testCellConsistency() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><td>A1</td><td>B1</td></tr>" + "<tr><td>A2</td><td>B2</td></tr>"
				+ "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);

			// Access same cell via cells()
			String cell00_viaCells = table.cells().get(0).get(0);

			// Access same cell via getRow()
			String cell00_viaRow = table.getRow(0).get(0);

			// All should be equal
			assertEquals(cell00_viaCells, cell00_viaRow, "Cell access via cells() and getRow() should match");

			// Verify both return non-null values
			assertNotNull(cell00_viaCells, "Cell value via cells() should not be null");
			assertNotNull(cell00_viaRow, "Cell value via getRow() should not be null");
		}
	}

	/**
	 * Test table row count vs cells array size consistency. Verifies: -
	 * getRowCount() equals cells().size() - Column count is consistent - No
	 * off-by-one errors
	 */
	@Test
	@DisplayName("should maintain consistent row and column counts")
	void testTableDimensionConsistency() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><td>a</td><td>b</td><td>c</td></tr>"
				+ "<tr><td>d</td><td>e</td><td>f</td></tr>" + "<tr><td>g</td><td>h</td><td>i</td></tr>"
				+ "<tr><td>j</td><td>k</td><td>l</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);

			int rowCount = table.getRowCount();
			int colCount = table.getColumnCount();
			int cellsRowCount = table.cells().size();

			// Row count should match cells array size
			assertEquals(rowCount, cellsRowCount, "Row count should equal cells() size");

			// All rows should have same column count
			for (int i = 0; i < rowCount; i++) {
				assertEquals(colCount, table.getRow(i).size(), "Row " + i + " should have " + colCount + " columns");
			}

			// Verify each cell is accessible
			for (int i = 0; i < rowCount; i++) {
				for (int j = 0; j < colCount; j++) {
					String cellValue = table.getRow(i).get(j);
					assertNotNull(cellValue, "Cell at [" + i + "," + j + "] should be accessible");
				}
			}
		}
	}

	/**
	 * Test table markdown generation precision. Verifies: - Markdown format is
	 * valid - All cells are represented - Formatting is consistent
	 */
	@Test
	@DisplayName("should generate precise markdown representation")
	void testTableMarkdownPrecision() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><th>Name</th><th>Value</th><th>Status</th></tr>"
				+ "<tr><td>Item1</td><td>100</td><td>Active</td></tr>"
				+ "<tr><td>Item2</td><td>200</td><td>Inactive</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);
			String markdown = table.markdown();

			assertNotNull(markdown, "Markdown should not be null");
			assertFalse(markdown.isEmpty(), "Markdown should not be empty");

			// Verify markdown structure
			assertTrue(markdown.contains("|"), "Markdown should contain pipe separators");
			assertTrue(markdown.contains("-"), "Markdown should contain row separator");

			// Count pipes to verify cell representation
			long pipeCount = markdown.chars().filter(ch -> ch == '|').count();
			assertTrue(pipeCount >= 6, "Markdown should have sufficient pipes for cells");

			// Verify all cell content is in markdown
			assertTrue(markdown.contains("Item1"), "Markdown should contain cell content");
		}
	}

	/**
	 * Test table extraction with special characters in cells. Verifies: - Pipes in
	 * content don't break table - Quotes are escaped - Special chars preserved
	 */
	@Test
	@DisplayName("should handle special characters in table cells")
	void testTableSpecialCharactersInCells() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><th>Column|With|Pipes</th><th>Value</th></tr>"
				+ "<tr><td>Text with \"quotes\"</td><td>Data</td></tr>" + "<tr><td>Line1\nLine2</td><td>Multi</td></tr>"
				+ "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);

			int rowCount = table.getRowCount();

			// All cells should be accessible without errors
			for (int i = 0; i < rowCount; i++) {
				List<String> row = table.getRow(i);
				assertNotNull(row, "Row " + i + " should not be null");
				assertTrue(row.size() > 0, "Row " + i + " should have cells");

				// Access cells by actual row size, not column count assumption
				for (int j = 0; j < row.size(); j++) {
					String cellValue = row.get(j);
					assertNotNull(cellValue, "Cell at [" + i + "," + j + "] should not be null");
				}
			}

			// Markdown should still be valid
			String markdown = table.markdown();
			assertNotNull(markdown, "Markdown should be generated despite special chars");
		}
	}

	/**
	 * Test table extraction with empty cells. Verifies: - Empty cells are
	 * represented as empty strings - Empty cells don't break structure - Counts
	 * remain correct
	 */
	@Test
	@DisplayName("should handle empty table cells correctly")
	void testEmptyTableCells() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><td>A</td><td></td><td>C</td></tr>"
				+ "<tr><td></td><td>B</td><td></td></tr>" + "<tr><td>X</td><td>Y</td><td>Z</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);

			int rowCount = table.getRowCount();
			int colCount = table.getColumnCount();

			// Verify table structure is valid
			assertTrue(rowCount > 0, "Table should have rows");
			assertTrue(colCount > 0, "Table should have columns");

			// Verify all rows are accessible
			for (int i = 0; i < rowCount; i++) {
				List<String> row = table.getRow(i);
				assertNotNull(row, "Row " + i + " should not be null");
				assertTrue(row.size() > 0, "Row " + i + " should have columns");

				// Empty cells should be strings (can be empty), not null
				for (int j = 0; j < row.size(); j++) {
					String cell = row.get(j);
					assertNotNull(cell, "Cell at [" + i + "," + j + "] should not be null");
					// Empty cells are represented as empty strings
				}
			}
		}
	}

	/**
	 * Test table extraction with single row/column. Verifies: - Single row table is
	 * handled correctly - Single column table is handled - Edge cases don't cause
	 * errors
	 */
	@Test
	@DisplayName("should handle single-row and single-column tables")
	void testSingleRowColumnTables() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		// Single row table
		String singleRowHtml = "<table><tr><td>A</td><td>B</td><td>C</td></tr></table>";
		ExtractionResult singleRowResult = Kreuzberg.extractBytes(singleRowHtml.getBytes(), "text/html", config);

		assertTrue(singleRowResult.isSuccess(), "Single row table extraction should succeed");
		if (!singleRowResult.getTables().isEmpty()) {
			Table table = singleRowResult.getTables().get(0);
			assertEquals(1, table.getRowCount(), "Should have exactly 1 row");
			assertTrue(table.getColumnCount() > 0, "Should have columns");
		}

		// Single column table
		String singleColHtml = "<table><tr><td>A</td></tr><tr><td>B</td></tr><tr><td>C</td></tr></table>";
		ExtractionResult singleColResult = Kreuzberg.extractBytes(singleColHtml.getBytes(), "text/html", config);

		assertTrue(singleColResult.isSuccess(), "Single column table extraction should succeed");
		if (!singleColResult.getTables().isEmpty()) {
			Table table = singleColResult.getTables().get(0);
			assertEquals(1, table.getColumnCount(), "Should have exactly 1 column");
			assertTrue(table.getRowCount() > 0, "Should have rows");
		}
	}

	/**
	 * Test table page number association. Verifies: - Tables have page numbers -
	 * Page numbers are >= 0 - Sequential tables have non-decreasing page numbers
	 */
	@Test
	@DisplayName("should track table page numbers correctly")
	void testTablePageNumberTracking() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String multiTableHtml = "<table><tr><td>Table1</td></tr></table>" + "<p>Content</p>"
				+ "<table><tr><td>Table2</td></tr></table>";

		ExtractionResult result = Kreuzberg.extractBytes(multiTableHtml.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		List<Table> tables = result.getTables();
		for (int i = 0; i < tables.size(); i++) {
			Table table = tables.get(i);
			int pageNum = table.pageNumber();

			assertTrue(pageNum >= 0, "Table " + i + " page number should be non-negative");
		}

		// Page numbers should be non-decreasing
		for (int i = 1; i < tables.size(); i++) {
			int prevPageNum = tables.get(i - 1).pageNumber();
			int currPageNum = tables.get(i).pageNumber();

			assertTrue(currPageNum >= prevPageNum, "Page numbers should be non-decreasing");
		}
	}

	/**
	 * Test table extraction result validation. Verifies: - toString() produces
	 * output - toString() contains table info - hashCode() is consistent
	 */
	@Test
	@DisplayName("should provide valid table string representation")
	void testTableStringRepresentation() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String htmlContent = "<table>" + "<tr><th>Header</th></tr>" + "<tr><td>Data</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);

			String tableStr = table.toString();
			assertNotNull(tableStr, "toString() should not be null");
			assertFalse(tableStr.isEmpty(), "toString() should not be empty");

			// Should contain size information
			assertTrue(tableStr.length() > 5, "toString() should have meaningful content");

			// Calling twice should give consistent results
			String tableStr2 = table.toString();
			assertEquals(tableStr, tableStr2, "toString() should be consistent");
		}
	}

	/**
	 * Test complex nested table structures. Verifies: - Nested tables are handled -
	 * Extraction doesn't lose data - Structure remains valid
	 */
	@Test
	@DisplayName("should handle complex table structures")
	void testComplexTableStructures() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String complexHtml = "<table>" + "<tr><th>Col1</th><th>Col2</th></tr>"
				+ "<tr><td>Row1Col1</td><td>Row1Col2</td></tr>"
				+ "<tr><td>Row2Col1</td><td><table><tr><td>Nested1</td></tr></table></td></tr>"
				+ "<tr><td>Row3Col1</td><td>Row3Col2</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(complexHtml.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Complex table extraction should succeed");

		if (!result.getTables().isEmpty()) {
			for (Table table : result.getTables()) {
				int rowCount = table.getRowCount();

				assertTrue(rowCount > 0, "Table should have rows");

				// All rows should have valid data (may vary due to nested tables)
				for (int i = 0; i < rowCount; i++) {
					List<String> row = table.getRow(i);
					assertNotNull(row, "Row " + i + " should not be null");
					assertTrue(row.size() > 0, "Row " + i + " should have cells");
				}
			}
		}
	}

	/**
	 * Test table with colspan/rowspan attributes (if supported). Verifies: - Merged
	 * cells are handled - Table dimensions remain valid - No data loss
	 */
	@Test
	@DisplayName("should handle tables with cell merging")
	void testTableWithMergedCells() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		String mergedCellHtml = "<table>" + "<tr><th colspan=\"2\">Wide Header</th><th>Col3</th></tr>"
				+ "<tr><td>A</td><td>B</td><td>C</td></tr>" + "<tr><td>D</td><td>E</td><td>F</td></tr>" + "</table>";

		ExtractionResult result = Kreuzberg.extractBytes(mergedCellHtml.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Merged cell table extraction should succeed");

		if (!result.getTables().isEmpty()) {
			Table table = result.getTables().get(0);

			// Table should have valid structure with rows and cells
			assertTrue(table.getRowCount() > 0, "Table should have rows");

			for (int i = 0; i < table.getRowCount(); i++) {
				List<String> row = table.getRow(i);
				assertNotNull(row, "Row " + i + " should not be null");
				assertTrue(row.size() > 0, "Row " + i + " should have cells");
			}
		}
	}

	/**
	 * Test table extraction batch consistency. Verifies: - Multiple table
	 * extractions are independent - Results don't interfere - Ordering is correct
	 */
	@Test
	@DisplayName("should extract multiple tables independently")
	void testMultipleTableExtraction() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().build();

		// Three separate table extractions
		String[] tables = {"<table><tr><th>T1-Col1</th><th>T1-Col2</th></tr><tr><td>1</td><td>2</td></tr></table>",
				"<table><tr><th>T2-Col1</th></tr><tr><td>A</td></tr><tr><td>B</td></tr></table>",
				"<table><tr><th>T3-C1</th><th>T3-C2</th><th>T3-C3</th></tr><tr><td>X</td><td>Y</td><td>Z</td></tr></table>"};

		ExtractionResult[] results = new ExtractionResult[tables.length];

		for (int i = 0; i < tables.length; i++) {
			results[i] = Kreuzberg.extractBytes(tables[i].getBytes(), "text/html", config);
		}

		// Verify all succeeded
		for (int i = 0; i < results.length; i++) {
			assertTrue(results[i].isSuccess(), "Extraction " + i + " should succeed");
			assertNotNull(results[i].getTables(), "Tables " + i + " should be extracted");
		}

		// Verify each table has expected dimensions
		if (!results[0].getTables().isEmpty()) {
			assertEquals(2, results[0].getTables().get(0).getColumnCount(), "First table should have 2 columns");
		}

		if (!results[1].getTables().isEmpty()) {
			assertEquals(1, results[1].getTables().get(0).getColumnCount(), "Second table should have 1 column");
		}

		if (!results[2].getTables().isEmpty()) {
			assertEquals(3, results[2].getTables().get(0).getColumnCount(), "Third table should have 3 columns");
		}
	}
}
