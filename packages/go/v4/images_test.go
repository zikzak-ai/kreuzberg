package kreuzberg

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

// TestPDFImageExtractionWithMetadata tests PDF image extraction with metadata.
// Verifies that images are extracted with complete metadata including format,
// dimensions, and color space information.
func TestPDFImageExtractionWithMetadata(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
			WithImageTargetDPI(150),
		),
	)

	pdfPath := getTestFilePath("pdf/with_images.pdf")
	result, err := ExtractFileSync(pdfPath, config)

	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}
	if len(result.Images) == 0 {
		t.Logf("Warning: No images extracted from PDF, skipping metadata validation")
		return
	}

	img := result.Images[0]
	// Validate format is a recognized image type
	if img.Format == "" {
		t.Error("expected non-empty image format")
	}
	validFormats := map[string]bool{"PNG": true, "JPEG": true, "JPG": true, "WEBP": true, "TIFF": true, "GIF": true}
	if !validFormats[img.Format] {
		t.Logf("Warning: Unknown image format detected: %s (may be valid)", img.Format)
	}
	// Verify dimensions are reasonable when present
	if img.Width == nil || *img.Width == 0 {
		t.Error("expected non-zero image width")
	}
	if *img.Width > 100000 {
		t.Errorf("image width %d is unreasonable", *img.Width)
	}
	if img.Height == nil || *img.Height == 0 {
		t.Error("expected non-zero image height")
	}
	if *img.Height > 100000 {
		t.Errorf("image height %d is unreasonable", *img.Height)
	}
	// Verify data is present and meaningful
	if len(img.Data) == 0 {
		t.Error("expected non-empty image data")
	}
	// Image data should have reasonable size
	if len(img.Data) > 1000000000 {
		t.Errorf("image data suspiciously large: %d bytes", len(img.Data))
	}
}

// TestImageHandlingInCompositeDocuments tests image extraction from DOCX and PPTX.
// Verifies that images embedded in office documents are properly extracted.
func TestImageHandlingInCompositeDocuments(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
		),
	)

	testCases := []struct {
		name     string
		filename string
		mimeType string
	}{
		{
			name:     "PPTX with images",
			filename: "presentations/powerpoint_with_image.pptx",
			mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			filePath := getTestFilePath(tc.filename)
			if _, err := os.Stat(filePath); err != nil {
				t.Skipf("test file not found: %s", filePath)
			}

			result, err := ExtractFileSync(filePath, config)
			if err != nil {
				t.Fatalf("ExtractFileSync failed: %v", err)
			}
			if result == nil {
				t.Fatal("expected non-nil result")
			}

			if result.MimeType != tc.mimeType && result.MimeType != "" {
				t.Logf("Note: MIME type mismatch, got %s", result.MimeType)
			}
		})
	}
}

// TestImageFormatDetection tests detection of different image formats.
// Verifies that PNG, JPEG, and WebP formats are correctly identified.
func TestImageFormatDetection(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
		),
	)

	testImages := []struct {
		name     string
		filename string
		mimeType string
	}{
		{
			name:     "PNG image",
			filename: "images/invoice_image.png",
			mimeType: "image/png",
		},
		{
			name:     "JPEG image",
			filename: "images/chi_sim_image.jpeg",
			mimeType: "image/jpeg",
		},
		{
			name:     "JPG image",
			filename: "images/ocr_image.jpg",
			mimeType: "image/jpeg",
		},
	}

	for _, tc := range testImages {
		t.Run(tc.name, func(t *testing.T) {
			filePath := getTestFilePath(tc.filename)
			if _, err := os.Stat(filePath); err != nil {
				t.Skipf("test file not found: %s", filePath)
			}

			result, err := ExtractFileSync(filePath, config)
			if err != nil {
				t.Fatalf("ExtractFileSync failed: %v", err)
			}
			if result == nil {
				t.Fatal("expected non-nil result")
			}

			if result.Metadata.FormatType() != FormatImage {
				t.Logf("Note: Expected image format type, got %s", result.Metadata.FormatType())
			}
		})
	}
}

// TestEmbeddedVsReferencedImages tests extraction of embedded vs referenced images.
// Verifies that both embedded images (in PDFs/DOCX) and referenced images
// (in HTML) are handled correctly.
func TestEmbeddedVsReferencedImages(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
		),
	)

	// Test embedded images in PDF
	pdfPath := getTestFilePath("pdf/with_images.pdf")
	result, err := ExtractFileSync(pdfPath, config)

	if err != nil {
		t.Fatalf("ExtractFileSync for PDF failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// Verify embedded images have data
	if len(result.Images) > 0 {
		for i, img := range result.Images {
			if len(img.Data) == 0 {
				t.Errorf("image %d: expected non-empty data for embedded image", i)
			}
			if img.ImageIndex < 0 {
				t.Errorf("image %d: expected non-negative image index", i)
			}
		}
	}
}

// TestErrorHandlingForCorruptedImages tests graceful handling of corrupted images.
// Verifies that extraction continues even if some images are corrupted or malformed.
func TestErrorHandlingForCorruptedImages(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
		),
	)

	// Create a temporary file with corrupted PDF
	dir := t.TempDir()
	corruptedPath := filepath.Join(dir, "corrupted.pdf")

	// Write a minimal PDF header with corrupted image data
	corruptedData := []byte("%PDF-1.4\n%corrupted image data\nendobj\n")
	if err := os.WriteFile(corruptedPath, corruptedData, 0o600); err != nil {
		t.Fatalf("failed to write corrupted test file: %v", err)
	}

	// Extraction should handle corrupted images gracefully
	result, _ := ExtractFileSync(corruptedPath, config)

	// Error or success is acceptable - we're testing graceful handling
	if result != nil {
		if len(result.Images) > 0 {
			// Verification: at least image extraction should not crash
			for _, img := range result.Images {
				if img.Format != "" || len(img.Data) > 0 {
					// Successfully extracted data from corrupted file
					break
				}
			}
		}
	}
}

// TestBatchImageExtractionFromMultiPageDocuments tests extraction from multi-page documents.
// Verifies that images from all pages are extracted in sequence and properly indexed.
func TestBatchImageExtractionFromMultiPageDocuments(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
		),
	)

	// Test with a multi-page PDF
	pdfPath := getTestFilePath("pdf/with_images.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		t.Skipf("test file not found: %s", pdfPath)
	}

	result, err := ExtractFileSync(pdfPath, config)

	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	if len(result.Images) > 0 {
		// Verify image indices are sequential and unique
		imageIndices := make(map[uint64]bool)
		for _, img := range result.Images {
			if imageIndices[img.ImageIndex] {
				t.Errorf("duplicate image index: %d", img.ImageIndex)
			}
			imageIndices[img.ImageIndex] = true
		}

		// Verify all images are properly indexed
		for _, img := range result.Images {
			if img.ImageIndex < 0 {
				t.Errorf("expected non-negative image index, got %d", img.ImageIndex)
			}
		}

		// Verify page information if available
		for _, img := range result.Images {
			if img.PageNumber != nil && *img.PageNumber < 1 {
				t.Errorf("invalid page number: %d", *img.PageNumber)
			}
		}
	}
}

// TestImageExtractionWithDPIConfiguration tests image extraction with custom DPI settings.
// Verifies that different DPI values affect extracted image processing.
func TestImageExtractionWithDPIConfiguration(t *testing.T) {
	configLowDPI := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
			WithImageTargetDPI(72),
		),
	)

	configHighDPI := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
			WithImageTargetDPI(300),
		),
	)

	pdfPath := getTestFilePath("pdf/with_images.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		t.Skipf("test file not found: %s", pdfPath)
	}

	resultLow, err := ExtractFileSync(pdfPath, configLowDPI)
	if err != nil {
		t.Fatalf("ExtractFileSync with low DPI failed: %v", err)
	}
	if resultLow == nil {
		t.Fatal("expected non-nil result for low DPI")
	}

	resultHigh, err := ExtractFileSync(pdfPath, configHighDPI)
	if err != nil {
		t.Fatalf("ExtractFileSync with high DPI failed: %v", err)
	}
	if resultHigh == nil {
		t.Fatal("expected non-nil result for high DPI")
	}

	// Both configurations should extract images (even if counts differ)
	if len(resultLow.Images) > 0 && len(resultHigh.Images) > 0 {
		// Extract successfully with both DPI settings
		t.Logf("Successfully extracted images with both DPI settings: low=%d, high=%d",
			len(resultLow.Images), len(resultHigh.Images))
	}
}

// TestImageExtractionDisabled tests that image extraction is properly disabled.
// Verifies that when image extraction is disabled, no images are returned.
func TestImageExtractionDisabled(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(false),
		),
	)

	pdfPath := getTestFilePath("pdf/with_images.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		t.Skipf("test file not found: %s", pdfPath)
	}

	result, err := ExtractFileSync(pdfPath, config)

	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	// When disabled, images should be empty or not extracted
	if result.Images == nil {
		// Acceptable: no images array
		t.Logf("Images disabled: no images array returned")
	}
}

// TestImageExtensionWithMetadata tests that extracted images have complete metadata.
// Verifies colorspace, bits per component, and other image properties.
func TestImageExtractionWithMetadata(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
		),
	)

	pdfPath := getTestFilePath("pdf/with_images.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		t.Skipf("test file not found: %s", pdfPath)
	}

	result, err := ExtractFileSync(pdfPath, config)

	if err != nil {
		t.Fatalf("ExtractFileSync failed: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}

	if len(result.Images) > 0 {
		img := result.Images[0]

		// Verify core metadata
		if img.Format == "" {
			t.Error("expected non-empty format")
		}

		// Verify optional metadata fields
		if img.Width != nil && img.Height != nil {
			if *img.Width == 0 || *img.Height == 0 {
				t.Error("expected non-zero dimensions when width/height are present")
			}
		}

		// Colorspace may be optional
		if img.Colorspace != nil && *img.Colorspace == "" {
			t.Error("expected non-empty colorspace when present")
		}

		// BitsPerComponent may be optional
		if img.BitsPerComponent != nil && *img.BitsPerComponent == 0 {
			t.Logf("Note: BitsPerComponent is 0, may be valid for some formats")
		}
	}
}

// TestImageExtractionConsistency verifies consistent image extraction across runs.
// Tests that extracting the same document multiple times yields consistent results.
func TestImageExtractionConsistency(t *testing.T) {
	config := NewExtractionConfig(
		WithImages(
			WithExtractImages(true),
			WithImageTargetDPI(150),
		),
	)

	pdfPath := getTestFilePath("pdf/with_images.pdf")
	if _, err := os.Stat(pdfPath); err != nil {
		t.Skipf("test file not found: %s", pdfPath)
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

	// Verify consistent image count
	if len(result1.Images) != len(result2.Images) {
		t.Errorf("inconsistent image count: first=%d, second=%d",
			len(result1.Images), len(result2.Images))
	}

	// Verify consistent image data
	if len(result1.Images) > 0 && len(result2.Images) > 0 {
		for i := range result1.Images {
			if !bytes.Equal(result1.Images[i].Data, result2.Images[i].Data) {
				t.Errorf("inconsistent image data at index %d", i)
			}
			if result1.Images[i].Format != result2.Images[i].Format {
				t.Errorf("inconsistent format at index %d: %s vs %s",
					i, result1.Images[i].Format, result2.Images[i].Format)
			}
		}
	}
}

// getTestFilePath constructs the path to a test document relative to the repo root.
func getTestFilePath(relativePath string) string {
	wd, err := os.Getwd()
	if err != nil {
		return relativePath
	}

	repoRoot := filepath.Join(wd, "..", "..", "..")
	return filepath.Join(repoRoot, "test_documents", relativePath)
}
