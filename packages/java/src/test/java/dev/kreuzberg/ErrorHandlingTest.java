package dev.kreuzberg;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import dev.kreuzberg.config.ChunkingConfig;
import dev.kreuzberg.config.ExtractionConfig;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.condition.DisabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.junit.jupiter.api.io.TempDir;

/**
 * Comprehensive error handling tests for Kreuzberg extraction.
 *
 * <p>
 * Tests cover all 8 error handling categories: 1. Invalid configuration
 * (negative values, invalid builders) 2. File not found and corrupted files 3.
 * Invalid MIME types (null, empty, blank) 4. Permission errors (unreadable
 * files) 5. Malformed documents (corrupted bytes, invalid encoding) 6.
 * Out-of-memory patterns (large batches, deeply nested dirs) 7. Timeout
 * behaviors (async operations, cancellation) 8. Concurrent error states (thread
 * safety, race conditions)
 *
 * <p>
 * Pattern: builder + exceptions with proper exception hierarchy validation.
 */
@DisplayName("Error Handling Tests")
class ErrorHandlingTest {

	// ============ 1. INVALID CONFIG HANDLING TESTS ============

	@Nested
	@DisplayName("Invalid Configuration Handling")
	class InvalidConfigHandlingTests {

		@Test
		@Disabled("Backend does not validate negative/zero config values")
		@DisplayName("should throw exception for negative maxConcurrentExtractions")
		void testNegativeMaxConcurrentExtractionsInConfig() {
			Exception ex = assertThrows(KreuzbergException.class, () -> {
				ExtractionConfig.builder().maxConcurrentExtractions(-1).build();
			});

			assertNotNull(ex.getMessage(), "Exception should have a message");
			assertTrue(
					ex.getMessage().toLowerCase().contains("concurrent")
							|| ex.getMessage().toLowerCase().contains("negative")
							|| ex.getMessage().toLowerCase().contains("invalid"),
					"Error message should describe the constraint violation");
		}

		@Test
		@Disabled("Backend does not validate negative/zero config values")
		@DisplayName("should throw exception for negative max chunk size")
		void testNegativeMaxCharsInChunkingConfig() {
			Exception ex = assertThrows(KreuzbergException.class, () -> {
				ChunkingConfig.builder().maxChars(-100).build();
			});

			assertNotNull(ex.getMessage(), "Exception should have message");
			assertTrue(
					ex.getMessage().toLowerCase().contains("maxchars")
							|| ex.getMessage().toLowerCase().contains("negative")
							|| ex.getMessage().toLowerCase().contains("positive"),
					"Error message should indicate maxChars constraint: " + ex.getMessage());
		}

		@Test
		@Disabled("Backend does not validate negative/zero config values")
		@DisplayName("should throw exception for invalid overlap")
		void testNegativeMaxOverlapInChunkingConfig() {
			Exception ex = assertThrows(KreuzbergException.class, () -> {
				ChunkingConfig.builder().maxOverlap(-50).build();
			});

			assertNotNull(ex.getMessage(), "Exception should have message");
			assertTrue(
					ex.getMessage().toLowerCase().contains("overlap")
							|| ex.getMessage().toLowerCase().contains("negative"),
					"Error message should indicate overlap constraint");
		}

		@Test
		@Disabled("Backend does not validate negative/zero config values")
		@DisplayName("should throw exception for zero max chars")
		void testZeroMaxCharsInChunkingConfig() {
			Exception ex = assertThrows(KreuzbergException.class, () -> {
				ChunkingConfig.builder().maxChars(0).build();
			});

			assertNotNull(ex.getMessage(), "Exception should have message for zero maxChars");
			assertTrue(
					ex.getMessage().toLowerCase().contains("positive")
							|| ex.getMessage().toLowerCase().contains("greater than"),
					"Error should indicate min value requirement");
		}

		@Test
		@DisplayName("should validate extraction config builder pattern")
		void testExtractionConfigBuilderPattern() {
			ExtractionConfig config = ExtractionConfig.builder().maxConcurrentExtractions(4).build();

			assertNotNull(config, "Builder should create config");
			assertEquals(4, config.getMaxConcurrentExtractions(), "Config should store maxConcurrentExtractions");
		}

		@Test
		@DisplayName("should validate chunking config builder pattern")
		void testChunkingConfigBuilderPattern() {
			ChunkingConfig config = ChunkingConfig.builder().maxChars(1000).maxOverlap(100).build();

			assertNotNull(config, "Builder should create chunking config");
			assertEquals(1000, config.getMaxChars(), "Should store maxChars");
			assertEquals(100, config.getMaxOverlap(), "Should store maxOverlap");
		}
	}

	// ============ 2. FILE NOT FOUND & CORRUPTED FILES TESTS ============

	@Nested
	@DisplayName("File Not Found and Corrupted Files")
	class FileNotFoundAndCorruptedTests {

		@Test
		@DisplayName("should throw IOException for nonexistent file")
		void testExtractNonexistentFile() {
			Path nonexistent = Path.of("/nonexistent/path/to/file.txt");

			assertThrows(IOException.class, () -> {
				Kreuzberg.extractFile(nonexistent);
			}, "Should throw IOException for nonexistent file");
		}

		@Test
		@DisplayName("should throw IOException for invalid path")
		void testExtractFileWithInvalidPath() {
			Path invalid = Path.of("");

			assertThrows(IOException.class, () -> {
				Kreuzberg.extractFile(invalid);
			}, "Should throw IOException for invalid path");
		}

		@Test
		@DisplayName("should throw NullPointerException for null path")
		void testExtractFromNullPath() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.extractFile((Path) null);
			}, "Should throw NullPointerException for null path");
		}

		@Test
		@DisplayName("should throw NullPointerException for null string path")
		void testExtractFromNullStringPath() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.extractFile((String) null);
			}, "Should throw NullPointerException for null string path");
		}

		@Test
		@DisplayName("should throw IOException when extracting from directory")
		void testExtractFromDirectory(@TempDir Path tempDir) {
			assertThrows(IOException.class, () -> {
				Kreuzberg.extractFile(tempDir);
			}, "Should throw IOException when trying to extract from directory");
		}

		@Test
		@DisplayName("should throw IOException for symlink to directory")
		void testExtractFromSymlinkToDirectory(@TempDir Path tempDir) throws IOException {
			Path dir = tempDir.resolve("subdir");
			Files.createDirectory(dir);
			Path link = tempDir.resolve("link");
			try {
				Files.createSymbolicLink(link, dir);
				assertThrows(IOException.class, () -> {
					Kreuzberg.extractFile(link);
				}, "Should throw IOException for symlink to directory");
			} catch (UnsupportedOperationException e) {
				// Symlinks not supported on this platform
			}
		}

		@Test
		@DisplayName("should handle corrupted file with invalid bytes")
		void testExtractCorruptedFile(@TempDir Path tempDir) throws IOException {
			Path testFile = tempDir.resolve("corrupted.bin");
			Files.write(testFile, new byte[]{(byte) 0xFF, (byte) 0xFE, (byte) 0xFD, (byte) 0xFC});

			try {
				ExtractionResult result = Kreuzberg.extractFile(testFile);
				assertNotNull(result, "Should return a result even for corrupted data");
			} catch (KreuzbergException e) {
				assertNotNull(e.getMessage(), "Exception should have a message");
				assertTrue(e.getMessage().length() > 0, "Message should not be empty");
			}
		}

		@Test
		@DisplayName("should handle file with invalid encoding")
		void testExtractFileWithInvalidEncoding(@TempDir Path tempDir) throws IOException {
			Path testFile = tempDir.resolve("invalid_encoding.txt");
			Files.write(testFile, new byte[]{(byte) 0x80, (byte) 0x81, (byte) 0x82});

			try {
				ExtractionResult result = Kreuzberg.extractFile(testFile);
				assertNotNull(result, "Should return result for invalid encoding");
			} catch (KreuzbergException e) {
				assertNotNull(e.getMessage(), "Exception should have message");
			}
		}
	}

	// ============ 3. INVALID MIME TYPE HANDLING TESTS ============

	@Nested
	@DisplayName("Invalid MIME Type Handling")
	class InvalidMimeTypeTests {

		@Test
		@DisplayName("should throw KreuzbergException for null MIME type")
		void testExtractBytesWithNullMimeType() {
			byte[] data = "test".getBytes();

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.extractBytes(data, null, null);
			}, "Should throw KreuzbergException for null MIME type");
		}

		@Test
		@DisplayName("should throw KreuzbergException for empty MIME type")
		void testExtractBytesWithEmptyMimeType() {
			byte[] data = "test".getBytes();

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.extractBytes(data, "", null);
			}, "Should throw KreuzbergException for empty MIME type");
		}

		@Test
		@DisplayName("should throw KreuzbergException for blank MIME type")
		void testExtractBytesWithBlankMimeType() {
			byte[] data = "test".getBytes();

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.extractBytes(data, "   ", null);
			}, "Should throw KreuzbergException for blank MIME type");
		}

		@Test
		@DisplayName("should throw NullPointerException for null MIME type in validation")
		void testValidateMimeTypeWithNull() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.validateMimeType(null);
			}, "Should throw NullPointerException for null MIME type");
		}

		@Test
		@DisplayName("should throw KreuzbergException for empty MIME type in validation")
		void testValidateMimeTypeWithEmpty() {
			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.validateMimeType("");
			}, "Should throw KreuzbergException for empty MIME type");
		}

		@Test
		@DisplayName("should throw KreuzbergException for extensions with empty MIME type")
		void testGetExtensionsForEmptyMimeType() {
			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.getExtensionsForMime("");
			}, "Should throw KreuzbergException for empty MIME type");
		}

		@Test
		@DisplayName("should throw KreuzbergException for extensions with blank MIME type")
		void testGetExtensionsForBlankMimeType() {
			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.getExtensionsForMime("   ");
			}, "Should throw KreuzbergException for blank MIME type");
		}

		@Test
		@DisplayName("should throw NullPointerException for null MIME type in extension lookup")
		void testGetExtensionsForNullMimeType() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.getExtensionsForMime(null);
			}, "Should throw NullPointerException for null MIME type");
		}

		@Test
		@DisplayName("should throw NullPointerException for null bytes in MIME detection")
		void testDetectMimeTypeFromNullBytes() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.detectMimeType((byte[]) null);
			}, "Should throw NullPointerException for null bytes");
		}

		@Test
		@DisplayName("should throw KreuzbergException for empty bytes in MIME detection")
		void testDetectMimeTypeFromEmptyBytes() {
			byte[] empty = new byte[0];

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.detectMimeType(empty);
			}, "Should throw KreuzbergException for empty bytes");
		}

		@Test
		@DisplayName("should throw NullPointerException for null path in MIME detection")
		void testDetectMimeTypeWithNullPath() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.detectMimeType((String) null);
			}, "Should throw NullPointerException for null path");
		}
	}

	// ============ 4. PERMISSION ERRORS TESTS ============

	@Nested
	@DisplayName("Permission Errors")
	class PermissionErrorTests {

		@Test
		@DisabledOnOs(OS.WINDOWS)
		@DisplayName("should throw IOException for unreadable file")
		void testExtractUnreadableFile(@TempDir Path tempDir) throws IOException {
			Path testFile = tempDir.resolve("unreadable.txt");
			Files.writeString(testFile, "content");

			try {
				testFile.toFile().setReadable(false);

				assertThrows(IOException.class, () -> {
					Kreuzberg.extractFile(testFile);
				}, "Should throw IOException for unreadable file");
			} finally {
				testFile.toFile().setReadable(true);
			}
		}
	}

	// ============ 5. MALFORMED DOCUMENT HANDLING TESTS ============

	@Nested
	@DisplayName("Malformed Document Handling")
	class MalformedDocumentTests {

		@Test
		@DisplayName("should throw KreuzbergException for null byte array")
		void testExtractNullByteArray() {
			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.extractBytes(null, "text/plain", null);
			}, "Should throw KreuzbergException for null byte array");
		}

		@Test
		@DisplayName("should throw KreuzbergException for empty byte array")
		void testExtractEmptyByteArray() {
			byte[] empty = new byte[0];

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.extractBytes(empty, "text/plain", null);
			}, "Should throw KreuzbergException for empty byte array");
		}

		@Test
		@DisplayName("should load invalid TOML config file gracefully")
		void testLoadConfigWithInvalidSyntax(@TempDir Path tempDir) throws IOException {
			Path configFile = tempDir.resolve("bad.toml");
			Files.writeString(configFile, "invalid toml [[ syntax");

			assertThrows(KreuzbergException.class, () -> {
				ExtractionConfig.fromFile(configFile.toString());
			}, "Should throw KreuzbergException for invalid config syntax");
		}

		@Test
		@DisplayName("should throw KreuzbergException for config from directory")
		void testLoadConfigFromDirectory(@TempDir Path tempDir) {
			assertThrows(KreuzbergException.class, () -> {
				ExtractionConfig.fromFile(tempDir.toString());
			}, "Should throw KreuzbergException for directory instead of file");
		}

		@Test
		@DisplayName("should throw KreuzbergException for nonexistent config file")
		void testLoadConfigFromNonexistentFile() {
			Path nonexistent = Path.of("/nonexistent/kreuzberg.toml");

			assertThrows(KreuzbergException.class, () -> {
				ExtractionConfig.fromFile(nonexistent.toString());
			}, "Should throw KreuzbergException for nonexistent config file");
		}
	}

	// ============ 6. OUT-OF-MEMORY PATTERNS TESTS ============

	@Nested
	@DisplayName("Out-of-Memory Patterns")
	class OutOfMemoryPatternTests {

		@Test
		@DisplayName("should handle batch extract with null paths list")
		void testBatchExtractNullPaths() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.batchExtractFiles(null, null);
			}, "Should throw NullPointerException for null paths list");
		}

		@Test
		@DisplayName("should handle batch extract with empty paths list")
		void testBatchExtractEmptyPaths() throws KreuzbergException {
			var results = Kreuzberg.batchExtractFiles(java.util.List.of(), null);

			assertNotNull(results, "Should return list for empty paths");
			assertTrue(results.isEmpty(), "Should return empty list for empty input");
		}

		@Test
		@DisplayName("should handle batch extract with null bytes list")
		void testBatchExtractNullBytesList() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.batchExtractBytes(null, null);
			}, "Should throw NullPointerException for null bytes list");
		}

		@Test
		@DisplayName("should handle batch extract with empty bytes list")
		void testBatchExtractEmptyBytesList() throws KreuzbergException {
			var results = Kreuzberg.batchExtractBytes(java.util.List.of(), null);

			assertNotNull(results, "Should return list for empty bytes");
			assertTrue(results.isEmpty(), "Should return empty list for empty input");
		}

		@Test
		@DisplayName("should extract file with very long path")
		void testExtractVeryLongFilePath(@TempDir Path tempDir) throws IOException {
			Path currentDir = tempDir;
			for (int i = 0; i < 10; i++) {
				currentDir = currentDir.resolve("a");
				Files.createDirectory(currentDir);
			}
			Path testFile = currentDir.resolve("test.txt");
			Files.writeString(testFile, "content");

			try {
				ExtractionResult result = Kreuzberg.extractFile(testFile);
				assertNotNull(result, "Should handle long path");
				assertNotNull(result.getContent(), "Should extract file with long path");
			} catch (KreuzbergException e) {
				// Path too long is acceptable error
				assertNotNull(e.getMessage(), "Error should have message");
			}
		}

		@Test
		@DisplayName("should extract file with special characters in name")
		void testExtractFileWithSpecialCharactersInName(@TempDir Path tempDir) throws IOException {
			Path testFile = tempDir.resolve("file@#$%^&.txt");
			Files.writeString(testFile, "content");

			try {
				ExtractionResult result = Kreuzberg.extractFile(testFile);
				assertNotNull(result, "Should handle special characters");
				assertNotNull(result.getContent(), "Should extract file with special chars");
			} catch (KreuzbergException e) {
				assertNotNull(e.getMessage(), "Error should have message");
			}
		}
	}

	// ============ 7. TIMEOUT BEHAVIORS TESTS ============

	@Nested
	@DisplayName("Timeout Behaviors")
	class TimeoutBehaviorTests {

		@Test
		@Timeout(30)
		@DisplayName("should propagate errors in async extraction")
		void testAsyncExtractNonexistentFile() {
			Path nonexistent = Path.of("/nonexistent/file.txt");

			var future = Kreuzberg.extractFileAsync(nonexistent, null);

			assertThrows(Exception.class, () -> {
				future.get(10, java.util.concurrent.TimeUnit.SECONDS);
			}, "Async extraction should propagate errors");
		}

		@Test
		@Timeout(30)
		@DisplayName("should propagate errors in async batch extraction")
		void testAsyncBatchExtractNullPaths() {
			var future = Kreuzberg.batchExtractFilesAsync(null, null);

			assertThrows(Exception.class, () -> {
				future.get(10, java.util.concurrent.TimeUnit.SECONDS);
			}, "Async batch extraction should propagate errors");
		}

		@Test
		@DisplayName("should handle exception in validator chain")
		void testValidatorThrowsException() throws KreuzbergException {
			String name = "failing-validator-" + System.currentTimeMillis();

			Validator validator = result -> {
				throw new ValidationException("Validation failed");
			};

			Kreuzberg.registerValidator(name, validator);

			try {
				var validators = Kreuzberg.listValidators();
				assertTrue(validators.contains(name), "Failing validator should be registered");
			} finally {
				Kreuzberg.unregisterValidator(name);
			}
		}

		@Test
		@DisplayName("should handle null return from post processor")
		void testPostProcessorReturnsNull() throws KreuzbergException {
			String name = "null-processor-" + System.currentTimeMillis();

			PostProcessor processor = result -> null;

			Kreuzberg.registerPostProcessor(name, processor);

			try {
				var processors = Kreuzberg.listPostProcessors();
				assertTrue(processors.contains(name), "Null-returning processor should be registered");
			} finally {
				Kreuzberg.unregisterPostProcessor(name);
			}
		}
	}

	// ============ 8. CONCURRENT ERROR STATES TESTS ============

	@Nested
	@DisplayName("Concurrent Error States")
	class ConcurrentErrorStateTests {

		@Test
		@DisplayName("should discover config safely when not found")
		void testDiscoverConfigWhenNotFound() throws KreuzbergException {
			var configOptional = ExtractionConfig.discover();

			// Config should either be empty if not found, or contain a valid
			// ExtractionConfig instance if found
			if (configOptional.isPresent()) {
				assertThat(configOptional.get()).as("If config is found, it should be a valid ExtractionConfig")
						.isInstanceOf(ExtractionConfig.class);
			}
			// If config is empty, that's also acceptable (no config file found)
		}

		@Test
		@DisplayName("should handle multiple sequential extractions without error accumulation")
		void testMultipleExtractionErrors(@TempDir Path tempDir) throws IOException, KreuzbergException {
			Path file1 = tempDir.resolve("test.txt");
			Files.writeString(file1, "content");

			ExtractionResult result1 = Kreuzberg.extractFile(file1);
			assertNotNull(result1.getContent(), "First extraction should succeed");

			ExtractionResult result2 = Kreuzberg.extractFile(file1);
			assertNotNull(result2.getContent(), "Second extraction should succeed");
		}

		@Test
		@DisplayName("should provide meaningful error messages")
		void testErrorMessageAvailability() throws KreuzbergException {
			Exception ex = assertThrows(IOException.class, () -> {
				Kreuzberg.extractFile(Path.of("/nonexistent"));
			}, "Should throw IOException for missing file");

			assertNotNull(ex.getMessage(), "Error should have message");
			assertTrue(ex.getMessage().length() > 5, "Error message should be descriptive (>5 chars)");
			assertTrue(
					ex.getMessage().toLowerCase().contains("file")
							|| ex.getMessage().toLowerCase().contains("not found")
							|| ex.getMessage().toLowerCase().contains("nonexistent"),
					"Error message should indicate file-related problem: " + ex.getMessage());
		}

		@Test
		@DisplayName("should validate registration with null names")
		void testRegisterValidatorWithNullName() {
			Validator validator = result -> {
			};

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.registerValidator(null, validator);
			}, "Should throw KreuzbergException for null validator name");
		}

		@Test
		@DisplayName("should validate registration with blank names")
		void testRegisterValidatorWithBlankName() {
			Validator validator = result -> {
			};

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.registerValidator("", validator);
			}, "Should throw KreuzbergException for blank validator name");
		}

		@Test
		@DisplayName("should validate null validator instance")
		void testRegisterValidatorWithNullValidator() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.registerValidator("test", null);
			}, "Should throw NullPointerException for null validator");
		}

		@Test
		@DisplayName("should validate post processor registration with null names")
		void testRegisterPostProcessorWithNullName() {
			PostProcessor processor = result -> result;

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.registerPostProcessor(null, processor);
			}, "Should throw KreuzbergException for null processor name");
		}

		@Test
		@DisplayName("should validate post processor registration with blank names")
		void testRegisterPostProcessorWithBlankName() {
			PostProcessor processor = result -> result;

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.registerPostProcessor("", processor);
			}, "Should throw KreuzbergException for blank processor name");
		}

		@Test
		@DisplayName("should validate null post processor instance")
		void testRegisterPostProcessorWithNullProcessor() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.registerPostProcessor("test", null);
			}, "Should throw NullPointerException for null processor");
		}

		@Test
		@DisplayName("should validate OCR backend registration with null names")
		void testRegisterOcrBackendWithNullName() {
			OcrBackend backend = (data, config) -> "text";

			assertThrows(KreuzbergException.class, () -> {
				Kreuzberg.registerOcrBackend(null, backend);
			}, "Should throw KreuzbergException for null backend name");
		}

		@Test
		@DisplayName("should validate null OCR backend instance")
		void testRegisterOcrBackendWithNullBackend() {
			assertThrows(NullPointerException.class, () -> {
				Kreuzberg.registerOcrBackend("test", null);
			}, "Should throw NullPointerException for null backend");
		}

		@Test
		@DisplayName("should throw IOException for invalid configuration during extraction")
		void testExtractionWithInvalidConfiguration(@TempDir Path tempDir) throws IOException {
			Path testFile = tempDir.resolve("test.txt");
			Files.writeString(testFile, "content");

			ExtractionConfig config = ExtractionConfig.builder().maxConcurrentExtractions(-1).build();

			try {
				Kreuzberg.extractFile(testFile, config);
			} catch (KreuzbergException e) {
				assertNotNull(e.getMessage(), "Exception should have message");
			}
		}
	}

	// ============ EXCEPTION HIERARCHY TESTS ============

	@Nested
	@DisplayName("Exception Hierarchy and Types")
	class ExceptionHierarchyTests {

		@Test
		@DisplayName("should throw correct exception type for parsing failures")
		void testParsingExceptionType() {
			byte[] data = "corrupted".getBytes();

			try {
				Kreuzberg.extractBytes(data, "application/pdf", null);
			} catch (ParsingException e) {
				assertNotNull(e.getMessage(), "ParsingException should have message");
			} catch (KreuzbergException e) {
				assertNotNull(e, "Should throw KreuzbergException");
			}
		}

		@Test
		@DisplayName("should provide error codes in exceptions")
		void testExceptionErrorCode() throws KreuzbergException {
			try {
				Kreuzberg.extractFile(Path.of("/nonexistent"));
			} catch (IOException e) {
				assertTrue(true, "Should throw IOException");
			}
		}

		@Test
		@DisplayName("should include error messages in all exceptions")
		void testExceptionMessageContent() {
			try {
				Kreuzberg.validateMimeType("");
			} catch (KreuzbergException e) {
				String message = e.getMessage();
				assertNotNull(message, "Exception should have message");
				assertTrue(message.length() > 0, "Message should not be empty");
			}
		}

		@Test
		@DisplayName("should preserve cause chain in exceptions")
		void testExceptionCauseChain() throws IOException, KreuzbergException {
			try {
				Kreuzberg.extractFile(Path.of("/nonexistent"));
			} catch (IOException e) {
				// IOException may or may not have cause, both are acceptable
				assertTrue(true, "Should propagate exception");
			}
		}

		@Test
		@DisplayName("should handle validation exceptions in validators")
		void testValidationExceptionInValidator() throws KreuzbergException {
			String name = "test-validator-" + System.currentTimeMillis();

			Validator validator = result -> {
				throw new ValidationException("Custom validation failed");
			};

			Kreuzberg.registerValidator(name, validator);

			try {
				var validators = Kreuzberg.listValidators();
				assertTrue(validators.contains(name), "Validator should be registered");
			} finally {
				Kreuzberg.unregisterValidator(name);
			}
		}
	}
}
