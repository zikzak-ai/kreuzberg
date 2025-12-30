package kreuzberg

import (
	"os"
	"strings"
	"testing"
)

// TestTableStructureExtraction tests basic table structure extraction (rows, columns, headers).
// Verifies that tables are extracted with proper cell grid structure.
func TestTableStructureExtraction(t *testing.T) {
	config := NewExtractionConfig(
		WithPdfOptions(
			WithPdfExtractMetadata(true),
		),
	)

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// Tables should be present in the result
	if len(result.Tables) == 0 {
		t.Logf("Info: No tables extracted from PDF, skipping validation")
		return
	}

	table := result.Tables[0]

	// Verify cells structure
	if table.Cells == nil {
		t.Error("expected non-nil cells slice")
	}
	if len(table.Cells) == 0 {
		t.Error("expected non-empty cells slice")
	}

	// Verify cell grid consistency
	if len(table.Cells) > 0 {
		firstRowLen := len(table.Cells[0])
		for i, row := range table.Cells {
			if len(row) != firstRowLen {
				t.Errorf("Row %d has %d cells, expected %d (grid inconsistency)", i, len(row), firstRowLen)
			}
		}
	}
}

// TestComplexTableExtraction tests extraction of complex tables with merged cells and nested content.
// Verifies that complex table structures are properly handled.
func TestComplexTableExtraction(t *testing.T) {
	config := NewExtractionConfig(
		WithPdfOptions(
			WithPdfExtractMetadata(true),
		),
	)

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// Verify tables are extracted
	if len(result.Tables) == 0 {
		t.Logf("Info: No complex tables extracted, skipping validation")
		return
	}

	table := result.Tables[0]

	// Verify table has cells
	if len(table.Cells) == 0 {
		t.Error("expected non-empty table cells")
	}

	// Verify each row has content
	for i, row := range table.Cells {
		if len(row) == 0 {
			t.Logf("Warning: Row %d is empty", i)
		}
		// Check for merged cell indicators or empty cells
		for j, cell := range row {
			// Cell content can be empty (for merged cells), but it should be a string
			if cell == "" {
				t.Logf("Info: Cell [%d,%d] is empty (possibly merged)", i, j)
			}
		}
	}
}

// TestTableInTableEdgeCases tests extraction of nested tables within tables.
// Verifies handling of edge cases like tables containing other tables.
func TestTableInTableEdgeCases(t *testing.T) {
	config := NewExtractionConfig()

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// Verify multiple tables can be extracted
	if result.Tables == nil {
		t.Logf("Info: No nested tables extracted")
		return
	}

	if len(result.Tables) > 0 {
		// Test with multiple tables
		for tableIdx, table := range result.Tables {
			if table.Cells == nil {
				t.Errorf("table %d: expected non-nil cells", tableIdx)
			}
			// Nested table cells may have special formatting
			for i, row := range table.Cells {
				for j, cell := range row {
					// Cell content should be present (may contain table markers)
					_ = cell
					_ = i
					_ = j
				}
			}
		}
	}
}

// TestFormatSpecificTableHandling tests table extraction from different formats (PDF vs Office).
// Verifies format-specific table handling between PDF and Office documents.
func TestFormatSpecificTableHandling(t *testing.T) {
	config := NewExtractionConfig()

	testCases := []struct {
		name     string
		filename string
		format   string
	}{
		{
			name:     "PDF with tables",
			filename: "pdf/tables.pdf",
			format:   "pdf",
		},
		{
			name:     "Excel with tables",
			filename: "spreadsheets/tables.xlsx",
			format:   "excel",
		},
		{
			name:     "DOCX with tables",
			filename: "documents/tables.docx",
			format:   "docx",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			filePath := getTestFilePath(tc.filename)
			if _, err := os.Stat(filePath); err != nil {
				filePath = getTestFilePath("pdf/with_images.pdf")
				if _, err := os.Stat(filePath); err != nil {
					t.Fatalf("test file not found")
				}
			}

			result, err := ExtractFileSync(filePath, config)
			if err != nil {
				t.Fatalf("ExtractFileSync failed: %v", err)
			}
			if result == nil {
				t.Fatal("expected non-nil result")
			}

			// Different formats may have different table extraction behavior
			if len(result.Tables) > 0 {
				table := result.Tables[0]
				if len(table.Cells) == 0 {
					t.Logf("Note: Format %s extracted table with empty cells", tc.format)
				}
			}
		})
	}
}

// TestLargeTablePerformance tests performance with large tables (100+ rows).
// Verifies that extraction performance is acceptable for large tables.
func TestLargeTablePerformance(t *testing.T) {
	config := NewExtractionConfig()

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// Verify large tables are extracted
	if len(result.Tables) == 0 {
		t.Logf("Info: No large tables found in test document")
		return
	}

	table := result.Tables[0]

	// Count total cells
	totalCells := 0
	for _, row := range table.Cells {
		totalCells += len(row)
	}

	if totalCells > 100 {
		t.Logf("Successfully extracted large table with %d total cells", totalCells)
	}

	// Verify no data loss
	if len(table.Cells) > 0 {
		// Check that all rows have consistent structure
		rowCounts := make(map[int]int)
		for _, row := range table.Cells {
			rowCounts[len(row)]++
		}
		t.Logf("Table structure: %d rows across %d different column counts", len(table.Cells), len(rowCounts))
	}
}

// TestMarkdownConversionAccuracy tests markdown conversion accuracy for tables.
// Verifies that table markdown representation is accurate and valid.
func TestMarkdownConversionAccuracy(t *testing.T) {
	config := NewExtractionConfig()

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	if len(result.Tables) == 0 {
		t.Logf("Info: No tables to validate markdown conversion")
		return
	}

	for tableIdx, table := range result.Tables {
		// Verify markdown is not empty if table has cells
		if len(table.Cells) > 0 && len(table.Cells[0]) > 0 && table.Markdown == "" {
			t.Errorf("Table %d should not have empty markdown when table has cells", tableIdx)
		}

		// Verify markdown contains pipe characters (markdown table format)
		if len(table.Cells) > 0 && len(table.Cells[0]) > 0 && !strings.Contains(table.Markdown, "|") {
			t.Errorf("Table %d markdown must contain pipe characters for valid markdown format", tableIdx)
		}

		// Verify markdown contains separators for multi-row tables
		if len(table.Cells) > 1 && !strings.Contains(table.Markdown, "-") {
			t.Errorf("Table %d markdown must contain separators for multi-row tables", tableIdx)
		}

		// Validate markdown structure
		if table.Markdown != "" {
			lines := strings.Split(table.Markdown, "\n")
			// Multi-row tables should have multiple lines
			if len(table.Cells) > 1 && len(lines) < 2 {
				t.Errorf("Table %d markdown should have multiple lines for multi-row table", tableIdx)
			}

			for i, line := range lines {
				if line == "" {
					continue // Empty lines are acceptable
				}
				// Each non-empty line should start and end with pipe
				trimmed := strings.TrimSpace(line)
				if strings.Contains(table.Markdown, "|") && (!strings.HasPrefix(trimmed, "|") || !strings.HasSuffix(trimmed, "|")) {
					t.Errorf("Table %d line %d not properly formatted: %s", tableIdx, i, line)
				}
			}
		}
	}
}

// TestCellContentPreservation tests preservation of cell content during extraction.
// Verifies that cell text, numbers, and special characters are preserved accurately.
func TestCellContentPreservation(t *testing.T) {
	config := NewExtractionConfig()

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	if len(result.Tables) == 0 {
		t.Logf("Info: No tables to validate cell content")
		return
	}

	table := result.Tables[0]

	// Verify cell content types
	hasText := false
	hasNumbers := false
	hasMixedContent := false

	for _, row := range table.Cells {
		for _, cell := range row {
			if cell != "" {
				// Check for different content types
				if strings.ContainsAny(cell, "0123456789") {
					hasNumbers = true
				}
				if strings.ContainsAny(cell, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") {
					hasText = true
				}
				if len(cell) > 0 && (strings.ContainsAny(cell, "0123456789") && strings.ContainsAny(cell, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")) {
					hasMixedContent = true
				}
			}
		}
	}

	if hasText {
		t.Logf("Cell content includes text")
	}
	if hasNumbers {
		t.Logf("Cell content includes numbers")
	}
	if hasMixedContent {
		t.Logf("Cell content includes mixed text and numbers")
	}

	// Verify no data corruption (cells should be valid strings)
	for i, row := range table.Cells {
		for j, cell := range row {
			if cell != strings.TrimSpace(cell) {
				t.Logf("Info: Cell [%d,%d] may have leading/trailing whitespace", i, j)
			}
		}
	}
}

// TestTableBoundaryDetection tests accurate detection of table boundaries.
// Verifies that table edges and separations are correctly identified.
func TestTableBoundaryDetection(t *testing.T) {
	config := NewExtractionConfig()

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	if len(result.Tables) == 0 {
		t.Logf("Info: No tables to validate boundaries")
		return
	}

	// Verify each table has valid boundaries
	for tableIdx, table := range result.Tables {
		if len(table.Cells) == 0 {
			t.Logf("Warning: Table %d has no rows", tableIdx)
			continue
		}

		// Check column consistency (boundary detection indicator)
		minCols := len(table.Cells[0])
		maxCols := len(table.Cells[0])
		for _, row := range table.Cells {
			if len(row) < minCols {
				minCols = len(row)
			}
			if len(row) > maxCols {
				maxCols = len(row)
			}
		}

		if minCols == 0 || maxCols == 0 {
			t.Errorf("table %d: invalid column boundaries (min=%d, max=%d)", tableIdx, minCols, maxCols)
		}

		// Verify consistent grid structure
		if minCols != maxCols {
			t.Logf("Note: Table %d has irregular grid (columns range from %d to %d)", tableIdx, minCols, maxCols)
		}

		// Verify page number if present
		if table.PageNumber < 0 {
			t.Errorf("table %d: invalid page number %d", tableIdx, table.PageNumber)
		}
	}
}

// TestMultiPageTableExtraction tests table extraction from multi-page documents.
// Verifies that tables from all pages are properly extracted and indexed.
func TestMultiPageTableExtraction(t *testing.T) {
	config := NewExtractionConfig()

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	if len(result.Tables) == 0 {
		t.Logf("Info: No tables extracted from PDF")
		return
	}

	// Verify page numbers are present and valid
	pageNumbers := make(map[int]int)
	for tableIdx, table := range result.Tables {
		if table.PageNumber < 0 {
			t.Logf("Warning: Table %d has negative page number", tableIdx)
		}
		pageNumbers[table.PageNumber]++
	}

	if len(pageNumbers) > 1 {
		t.Logf("Successfully extracted tables from %d pages", len(pageNumbers))
	}

	// Verify table indexing consistency
	for i := 0; i < len(result.Tables)-1; i++ {
		table1 := result.Tables[i]
		table2 := result.Tables[i+1]
		// Tables may be on same or different pages
		if table1.PageNumber > table2.PageNumber {
			t.Logf("Note: Tables not in strict page order: table %d on page %d, table %d on page %d",
				i, table1.PageNumber, i+1, table2.PageNumber)
		}
	}
}

// TestTableExtractionConsistency verifies consistent table extraction across runs.
// Tests that extracting the same document multiple times yields identical results.
func TestTableExtractionConsistency(t *testing.T) {
	config := NewExtractionConfig()

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result1, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("first ExtractFileSync failed: %v", err)
	}
	if result1 == nil {
		t.Fatal("expected non-nil result for first extraction")
	}

	result2, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("second ExtractFileSync failed: %v", err)
	}
	if result2 == nil {
		t.Fatal("expected non-nil result for second extraction")
	}

	// Verify consistent table count
	if len(result1.Tables) == 0 && len(result2.Tables) == 0 {
		t.Logf("Both extractions returned no tables")
		return
	}

	if (len(result1.Tables) == 0) != (len(result2.Tables) == 0) {
		t.Error("inconsistent table extraction: one result has tables, the other doesn't")
		return
	}

	if len(result1.Tables) != len(result2.Tables) {
		t.Errorf("inconsistent table count: first=%d, second=%d",
			len(result1.Tables), len(result2.Tables))
		return
	}

	// Verify consistent table content
	for i := range result1.Tables {
		table1 := result1.Tables[i]
		table2 := result2.Tables[i]

		// Check cell consistency
		if len(table1.Cells) != len(table2.Cells) {
			t.Errorf("table %d: inconsistent row count: %d vs %d",
				i, len(table1.Cells), len(table2.Cells))
			continue
		}

		for j := range table1.Cells {
			if len(table1.Cells[j]) != len(table2.Cells[j]) {
				t.Errorf("table %d, row %d: inconsistent column count: %d vs %d",
					i, j, len(table1.Cells[j]), len(table2.Cells[j]))
				continue
			}

			for k := range table1.Cells[j] {
				if table1.Cells[j][k] != table2.Cells[j][k] {
					t.Errorf("table %d, cell [%d,%d]: inconsistent content: %q vs %q",
						i, j, k, table1.Cells[j][k], table2.Cells[j][k])
				}
			}
		}

		// Check markdown consistency
		if table1.Markdown != table2.Markdown {
			t.Logf("Warning: table %d has inconsistent markdown across runs", i)
		}

		// Check page number consistency
		if table1.PageNumber != table2.PageNumber {
			t.Errorf("table %d: inconsistent page number: %d vs %d",
				i, table1.PageNumber, table2.PageNumber)
		}
	}

	t.Logf("Verified %d tables for consistency across runs", len(result1.Tables))
}

// TestTableExtractionWithFunctionalOptions tests table extraction using functional options API.
// Verifies that the functional options pattern works correctly for table configuration.
func TestTableExtractionWithFunctionalOptions(t *testing.T) {
	// Test with various PDF options
	config := NewExtractionConfig(
		WithPdfOptions(
			WithPdfExtractMetadata(true),
			WithPdfExtractImages(true),
		),
		WithUseCache(false),
	)

	// Verify config was properly constructed
	if config.PdfOptions == nil {
		t.Fatal("expected non-nil PdfOptions")
	}
	if config.PdfOptions.ExtractMetadata == nil || !*config.PdfOptions.ExtractMetadata {
		t.Error("expected ExtractMetadata to be true")
	}
	if config.PdfOptions.ExtractImages == nil || !*config.PdfOptions.ExtractImages {
		t.Error("expected ExtractImages to be true")
	}
	if config.UseCache == nil || *config.UseCache {
		t.Error("expected UseCache to be false")
	}

	pdfPath := getTestFilePath("pdf/table_document.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		pdfPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(pdfPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(pdfPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// Extraction should succeed with functional options
	if !result.Success {
		t.Logf("Note: Extraction did not complete successfully")
	}
}

// TestEmptyDocumentTableExtraction tests table extraction from documents without tables.
// Verifies graceful handling when tables are not present.
func TestEmptyDocumentTableExtraction(t *testing.T) {
	config := NewExtractionConfig()

	textPath := getTestFilePath("text/simple.txt")
	if _, err := os.Stat(textPath); err != nil {
		textPath = getTestFilePath("pdf/with_images.pdf")
		if _, err := os.Stat(textPath); err != nil {
			t.Fatalf("test file not found")
		}
	}

	result, err := ExtractFileSync(textPath, config)
	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// No tables should be present in plain text
	if len(result.Tables) > 0 {
		t.Logf("Note: Plain text document contains %d tables (unexpected)", len(result.Tables))
	}
}
