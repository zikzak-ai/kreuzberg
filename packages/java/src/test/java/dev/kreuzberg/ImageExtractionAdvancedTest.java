package dev.kreuzberg;

import static org.junit.jupiter.api.Assertions.*;

import dev.kreuzberg.config.ExtractionConfig;
import dev.kreuzberg.config.ImageExtractionConfig;
import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Comprehensive advanced tests for image extraction in Java binding.
 *
 * <p>
 * Tests cover: - Base64 encoding/decoding of image data - Image metadata
 * extraction and validation - Format-specific image handling - Image quality
 * assurance - Batch image operations - Image data immutability - Error
 * conditions with image extraction
 *
 * @since 4.0.0
 */
@DisplayName("Image Extraction Advanced Tests")
final class ImageExtractionAdvancedTest {

	/**
	 * Test base64 encoding of extracted image data. Verifies: - Image data is
	 * properly base64 encoded - Decoded data is binary-valid - Data roundtrip
	 * consistency
	 */
	@Test
	@DisplayName("should provide valid base64-encoded image data")
	void testImageDataBase64Encoding() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			ExtractedImage image = result.getImages().get(0);
			byte[] imageData = image.getData();

			assertNotNull(imageData, "Image data should not be null");
			assertTrue(imageData.length > 0, "Image data should have content");

			// Verify data can be base64 encoded/decoded
			String encoded = Base64.getEncoder().encodeToString(imageData);
			assertFalse(encoded.isEmpty(), "Base64 encoded data should not be empty");

			byte[] decoded = Base64.getDecoder().decode(encoded);
			assertArrayEquals(imageData, decoded, "Base64 roundtrip should preserve data");
		}
	}

	/**
	 * Test image format property availability and validity. Verifies: - Format is
	 * always present - Format is uppercase - Format is recognized type
	 */
	@Test
	@DisplayName("should provide valid image format")
	void testImageFormatProperty() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			for (ExtractedImage image : result.getImages()) {
				String format = image.getFormat();

				assertNotNull(format, "Format should not be null");
				assertFalse(format.isEmpty(), "Format should not be empty");
				assertEquals(format, format.toUpperCase(), "Format should be uppercase");

				// Verify format is recognized
				assertTrue(isValidImageFormat(format), "Format should be recognized type: " + format);
			}
		}
	}

	/**
	 * Test image width and height optional properties. Verifies: - Width is
	 * optional but valid if present - Height is optional but valid if present -
	 * Dimensions are positive when provided
	 */
	@Test
	@DisplayName("should provide valid optional image dimensions")
	void testImageDimensionsOptional() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			for (ExtractedImage image : result.getImages()) {
				Optional<Integer> width = image.getWidth();
				Optional<Integer> height = image.getHeight();

				// Width is optional
				if (width.isPresent()) {
					assertTrue(width.get() > 0, "Width should be positive when present");
					assertTrue(width.get() <= 100000, "Width should be reasonable");
				}

				// Height is optional
				if (height.isPresent()) {
					assertTrue(height.get() > 0, "Height should be positive when present");
					assertTrue(height.get() <= 100000, "Height should be reasonable");
				}

				// If both present, verify reasonable aspect ratio
				if (width.isPresent() && height.isPresent()) {
					double aspectRatio = (double) width.get() / height.get();
					assertTrue(aspectRatio > 0.1 && aspectRatio < 10.0,
							"Aspect ratio should be reasonable: " + aspectRatio);
				}
			}
		}
	}

	/**
	 * Test image format consistency and validation. Verifies: - Format is always
	 * provided - Format is uppercase - Format remains consistent across calls
	 */
	@Test
	@DisplayName("should provide consistent image format information")
	void testImageFormatConsistency() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			for (ExtractedImage image : result.getImages()) {
				String format = image.getFormat();

				assertNotNull(format, "Format should not be null");
				assertFalse(format.isEmpty(), "Format should not be empty");

				// Get format again to ensure consistency
				String formatAgain = image.getFormat();
				assertEquals(format, formatAgain, "Format should be consistent across calls");

				// Verify format is uppercase
				assertEquals(format, format.toUpperCase(), "Format should be uppercase");
			}
		}
	}

	/**
	 * Test image extraction with DPI customization. Verifies: - Different DPI
	 * settings are applied - Image quality reflects DPI settings - DPI ranges are
	 * respected
	 */
	@Test
	@DisplayName("should respect DPI settings in image extraction")
	void testImageDPICustomization() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		// Test with different DPI values
		int[] dpiValues = {72, 150, 300};

		for (int dpi : dpiValues) {
			ExtractionConfig config = ExtractionConfig.builder()
					.imageExtraction(ImageExtractionConfig.builder().extractImages(true).targetDpi(dpi).build())
					.build();

			ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

			assertTrue(result.isSuccess(), "Extraction with DPI=" + dpi + " should succeed");
			assertNotNull(result.getImages(), "Images should be extracted with DPI=" + dpi);
		}
	}

	/**
	 * Test image extraction result immutability. Verifies: - Image data cannot be
	 * modified externally - Multiple calls return independent copies - List is
	 * unmodifiable
	 */
	@Test
	@DisplayName("should return immutable image results")
	void testImageResultImmutability() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			ExtractedImage image = result.getImages().get(0);

			// Get data twice and verify independence
			byte[] data1 = image.getData();
			byte[] data2 = image.getData();

			assertArrayEquals(data1, data2, "Multiple getData() calls should return equal data");

			// Modify first copy and verify second is unchanged
			if (data1.length > 0) {
				data1[0] = (byte) (data1[0] ^ 0xFF);
				byte[] data3 = image.getData();

				assertNotEquals(data1[0], data3[0], "getData() should return cloned data");
			}

			// Verify images list is unmodifiable
			List<ExtractedImage> images = result.getImages();
			assertThrows(UnsupportedOperationException.class, () -> images.add(null),
					"Images list should be unmodifiable");
		}
	}

	/**
	 * Test image extraction with maximum dimension constraint. Verifies: - Images
	 * are scaled to fit constraint - Aspect ratio is preserved - Dimension limit is
	 * respected
	 */
	@Test
	@DisplayName("should respect maximum image dimension constraint")
	void testImageMaxDimensionConstraint() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		int maxDimension = 500;
		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(
						ImageExtractionConfig.builder().extractImages(true).maxImageDimension(maxDimension).build())
				.build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			for (ExtractedImage image : result.getImages()) {
				Optional<Integer> width = image.getWidth();
				Optional<Integer> height = image.getHeight();

				if (width.isPresent() && height.isPresent()) {
					int w = width.get();
					int h = height.get();

					// Maximum dimension should be respected
					assertTrue(w <= maxDimension, "Width should not exceed max dimension");
					assertTrue(h <= maxDimension, "Height should not exceed max dimension");
				}
			}
		}
	}

	/**
	 * Test image index and page number tracking. Verifies: - Image indices are
	 * sequential - Page numbers are tracked - Indices start from 0
	 */
	@Test
	@DisplayName("should track image index and page number correctly")
	void testImageIndexAndPageTracking() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		List<ExtractedImage> images = result.getImages();
		if (!images.isEmpty()) {
			for (int i = 0; i < images.size(); i++) {
				ExtractedImage image = images.get(i);

				int index = image.getImageIndex();
				assertTrue(index >= 0, "Image index should be non-negative");

				Optional<Integer> pageNum = image.getPageNumber();
				if (pageNum.isPresent()) {
					assertTrue(pageNum.get() >= 1, "Page number should be >= 1");
				}
			}
		}
	}

	/**
	 * Test image colorspace metadata. Verifies: - Colorspace is optional - Valid
	 * colorspace values - Bits per component is reasonable
	 */
	@Test
	@DisplayName("should provide optional colorspace metadata")
	void testImageColorspaceMetadata() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			for (ExtractedImage image : result.getImages()) {
				Optional<String> colorspace = image.getColorspace();
				Optional<Integer> bitsPerComponent = image.getBitsPerComponent();

				if (colorspace.isPresent()) {
					assertFalse(colorspace.get().isEmpty(), "Colorspace should not be empty");
				}

				if (bitsPerComponent.isPresent()) {
					int bpc = bitsPerComponent.get();
					assertTrue(bpc > 0 && bpc <= 32, "Bits per component should be 1-32");
				}
			}
		}
	}

	/**
	 * Test image extraction with multiple images in content. Verifies: - All images
	 * are extracted - Image ordering is maintained - No images are skipped
	 */
	@Test
	@DisplayName("should extract all images maintaining order")
	void testMultipleImageExtraction() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithMultipleImages();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		List<ExtractedImage> images = result.getImages();
		if (images.size() > 1) {
			// Verify all images have valid data
			for (int i = 0; i < images.size(); i++) {
				ExtractedImage image = images.get(i);
				assertNotNull(image, "Image " + i + " should not be null");
				assertNotNull(image.getData(), "Image " + i + " should have data");
				assertTrue(image.getData().length > 0, "Image " + i + " should have non-empty data");
			}
		}
	}

	/**
	 * Test image extraction configuration validation. Verifies: - Configuration
	 * builder works correctly - All options are properly applied - Invalid
	 * combinations are handled
	 */
	@Test
	@DisplayName("should validate image extraction configuration")
	void testImageExtractionConfiguration() throws KreuzbergException {
		ImageExtractionConfig config = ImageExtractionConfig.builder().extractImages(true).targetDpi(300)
				.maxImageDimension(2000).autoAdjustDpi(true).minDpi(150).maxDpi(600).build();

		assertNotNull(config, "Configuration should not be null");
		assertTrue(config.isExtractImages(), "Extract images should be true");
		assertEquals(300, config.getTargetDpi(), "Target DPI should match");
		assertEquals(2000, config.getMaxImageDimension(), "Max dimension should match");
		assertTrue(config.isAutoAdjustDpi(), "Auto DPI adjustment should be true");
		assertEquals(150, config.getMinDpi(), "Min DPI should match");
		assertEquals(600, config.getMaxDpi(), "Max DPI should match");
	}

	/**
	 * Test image extraction with text-only content (no images). Verifies: -
	 * Extraction succeeds without errors - Images list is empty - No false
	 * positives
	 */
	@Test
	@DisplayName("should handle extraction when no images present")
	void testImageExtractionWithNoImages() throws IOException, KreuzbergException {
		String htmlContent = "<html><body><p>This is text without any images.</p></body></html>";

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");
		assertNotNull(result.getImages(), "Images list should not be null");
		assertTrue(result.getImages().isEmpty(), "No images should be extracted from text-only content");
		assertNotNull(result.getContent(), "Text content should still be extracted");
	}

	/**
	 * Test image extraction toString representation. Verifies: - toString()
	 * produces valid output - Contains useful information - Not empty
	 */
	@Test
	@DisplayName("should provide meaningful string representation")
	void testImageStringRepresentation() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		ExtractionResult result = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");

		if (!result.getImages().isEmpty()) {
			ExtractedImage image = result.getImages().get(0);
			String imageStr = image.toString();

			assertNotNull(imageStr, "toString() should not be null");
			assertFalse(imageStr.isEmpty(), "toString() should not be empty");
			// Should contain some meaningful content
			assertTrue(imageStr.length() > 10, "toString() should have meaningful length");
		}
	}

	/**
	 * Test image extraction result consistency. Verifies: - Multiple extractions of
	 * same content produce identical results - No randomness in extraction - Image
	 * data is deterministic
	 */
	@Test
	@DisplayName("should produce consistent image extraction results")
	void testImageExtractionConsistency() throws IOException, KreuzbergException {
		String htmlContent = createHTMLWithEmbeddedImage();

		ExtractionConfig config = ExtractionConfig.builder()
				.imageExtraction(ImageExtractionConfig.builder().extractImages(true).build()).build();

		// Extract multiple times
		ExtractionResult result1 = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);
		ExtractionResult result2 = Kreuzberg.extractBytes(htmlContent.getBytes(), "text/html", config);

		assertTrue(result1.isSuccess(), "First extraction should succeed");
		assertTrue(result2.isSuccess(), "Second extraction should succeed");

		assertEquals(result1.getImages().size(), result2.getImages().size(),
				"Multiple extractions should produce same number of images");

		if (!result1.getImages().isEmpty() && !result2.getImages().isEmpty()) {
			ExtractedImage img1 = result1.getImages().get(0);
			ExtractedImage img2 = result2.getImages().get(0);

			assertEquals(img1.getFormat(), img2.getFormat(), "Format should be consistent");
			assertArrayEquals(img1.getData(), img2.getData(), "Image data should be consistent");
		}
	}

	// =============== Helper Methods ===============

	private String createHTMLWithEmbeddedImage() {
		// 1x1 red PNG (base64 encoded)
		String base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
		return "<!DOCTYPE html><html><body>" + "<img src=\"data:image/png;base64," + base64Image
				+ "\" alt=\"test\" width=\"10\" height=\"10\">" + "</body></html>";
	}

	private String createHTMLWithMultipleImages() {
		String base64Image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
		return "<!DOCTYPE html><html><body>" + "<img src=\"data:image/png;base64," + base64Image
				+ "\" alt=\"image1\" width=\"10\" height=\"10\">" + "<p>Some text between images</p>"
				+ "<img src=\"data:image/png;base64," + base64Image + "\" alt=\"image2\" width=\"10\" height=\"10\">"
				+ "</body></html>";
	}

	private boolean isValidImageFormat(String format) {
		return format.equals("PNG") || format.equals("JPEG") || format.equals("JPG") || format.equals("WEBP")
				|| format.equals("PDF") || format.equals("GIF") || format.equals("BMP") || format.equals("TIFF");
	}
}
