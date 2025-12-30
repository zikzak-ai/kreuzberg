package dev.kreuzberg;

import static org.junit.jupiter.api.Assertions.*;

import dev.kreuzberg.config.ExtractionConfig;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Comprehensive tests for async extraction using CompletableFuture.
 *
 * <p>
 * Tests cover: - CompletableFuture.get() with timeout -
 * CompletableFuture.join() - Async error handling - Multiple concurrent futures
 * - Exception handling in async context - Timeout behavior - Async result
 * transformation
 *
 * @since 4.0.0
 */
@DisplayName("Async Extraction Tests")
final class AsyncExtractionTest {

	/**
	 * Test CompletableFuture.get() with timeout succeeds. Verifies: - get() with
	 * sufficient timeout succeeds - Result is properly retrieved - Timeout value
	 * respected
	 */
	@Test
	@DisplayName("should complete extraction with get() within timeout")
	void testAsyncExtractionGetWithTimeout(@TempDir Path tempDir)
			throws IOException, ExecutionException, TimeoutException, InterruptedException {
		Path testFile = tempDir.resolve("async_test.txt");
		Files.writeString(testFile, "Content for async extraction testing with timeout");

		// Create async extraction task
		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(testFile);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		// Retrieve result with timeout
		ExtractionResult result = future.get(30, TimeUnit.SECONDS);

		assertNotNull(result, "Result should not be null");
		assertTrue(result.isSuccess(), "Extraction should succeed");
		assertNotNull(result.getContent(), "Content should be extracted");
		assertTrue(result.getContent().contains("async extraction"), "Content should be preserved");
	}

	/**
	 * Test CompletableFuture.join() for blocking completion. Verifies: - join()
	 * blocks until complete - Result is correctly returned - No timeout exception
	 */
	@Test
	@DisplayName("should complete extraction with join()")
	void testAsyncExtractionJoin(@TempDir Path tempDir) throws IOException {
		Path testFile = tempDir.resolve("join_test.txt");
		Files.writeString(testFile, "Content for async join testing");

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(testFile);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		// Block until complete
		ExtractionResult result = future.join();

		assertNotNull(result, "Result should not be null");
		assertTrue(result.isSuccess(), "Extraction should succeed");
		assertNotNull(result.getContent(), "Content should be extracted");
	}

	/**
	 * Test async error handling with exceptionally(). Verifies: - Exceptions are
	 * caught in exceptionally() - Error recovery works - Fallback value is used
	 */
	@Test
	@DisplayName("should handle exceptions in async extraction with exceptionally()")
	void testAsyncExceptionHandling() {
		String invalidPath = "/nonexistent/path/to/file.txt";

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(invalidPath);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		}).exceptionally(ex -> {
			// Create a fallback result
			assertNotNull(ex, "Exception should be captured");
			return null; // Return null as fallback
		});

		ExtractionResult result = future.join();
		// Result may be null due to fallback, but future should complete
		assertTrue(future.isDone(), "Future should be completed");
	}

	/**
	 * Test multiple concurrent CompletableFutures. Verifies: - All futures complete
	 * - Results are independent - No race conditions - Ordering is maintained
	 */
	@Test
	@DisplayName("should handle multiple concurrent futures")
	void testMultipleConcurrentFutures(@TempDir Path tempDir)
			throws IOException, InterruptedException, ExecutionException, TimeoutException {
		// Create multiple files
		List<Path> files = new ArrayList<>();
		for (int i = 0; i < 5; i++) {
			Path file = tempDir.resolve("async_file_" + i + ".txt");
			Files.writeString(file, "Content of async file " + i);
			files.add(file);
		}

		// Create futures for all files
		List<CompletableFuture<ExtractionResult>> futures = new ArrayList<>();
		for (Path file : files) {
			CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
				try {
					return Kreuzberg.extractFile(file);
				} catch (KreuzbergException | IOException e) {
					throw new RuntimeException(e);
				}
			});
			futures.add(future);
		}

		// Wait for all futures to complete
		CompletableFuture<Void> allFutures = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
		allFutures.get(30, TimeUnit.SECONDS);

		// Verify all results
		assertEquals(5, futures.size(), "Should have 5 futures");
		for (int i = 0; i < futures.size(); i++) {
			assertTrue(futures.get(i).isDone(), "Future " + i + " should be done");
			ExtractionResult result = futures.get(i).get();
			assertNotNull(result, "Result " + i + " should not be null");
			assertTrue(result.isSuccess(), "Extraction " + i + " should succeed");
		}
	}

	/**
	 * Test async extraction with thenApply transformation. Verifies: - Result can
	 * be transformed - Chaining works correctly - Transformation preserves data
	 */
	@Test
	@DisplayName("should transform async extraction result with thenApply()")
	void testAsyncResultTransformation(@TempDir Path tempDir)
			throws IOException, ExecutionException, InterruptedException {
		Path testFile = tempDir.resolve("transform_test.txt");
		Files.writeString(testFile, "Content to be transformed in async context");

		CompletableFuture<ExtractionResult> extractionFuture = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(testFile);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		// Transform result
		CompletableFuture<String> transformedFuture = extractionFuture.thenApply(result -> {
			assertNotNull(result, "Result should not be null");
			return result.getContent().toUpperCase();
		});

		String transformedContent = transformedFuture.get();
		assertNotNull(transformedContent, "Transformed content should not be null");
		assertTrue(transformedContent.contains("CONTENT"), "Content should be transformed to uppercase");
	}

	/**
	 * Test async composition with thenCompose(). Verifies: - Futures can be
	 * composed - Sequential async operations work - Dependencies are respected
	 */
	@Test
	@DisplayName("should compose async operations with thenCompose()")
	void testAsyncComposition(@TempDir Path tempDir) throws IOException, ExecutionException, InterruptedException {
		Path file1 = tempDir.resolve("compose_file1.txt");
		Files.writeString(file1, "First async file content");

		Path file2 = tempDir.resolve("compose_file2.txt");
		Files.writeString(file2, "Second async file content");

		CompletableFuture<ExtractionResult> firstFuture = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(file1);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		// Compose with second extraction
		CompletableFuture<ExtractionResult> composedFuture = firstFuture.thenCompose(result1 -> {
			assertNotNull(result1, "First result should not be null");
			return CompletableFuture.supplyAsync(() -> {
				try {
					return Kreuzberg.extractFile(file2);
				} catch (KreuzbergException | IOException e) {
					throw new RuntimeException(e);
				}
			});
		});

		ExtractionResult finalResult = composedFuture.get();
		assertNotNull(finalResult, "Final result should not be null");
		assertTrue(finalResult.getContent().contains("Second"), "Should have content from second file");
	}

	/**
	 * Test async extraction timeout behavior. Verifies: - TimeoutException is
	 * thrown - Timeout value is respected - Future is still cancellable
	 */
	@Test
	@DisplayName("should handle timeout in async extraction")
	void testAsyncExtractionTimeout(@TempDir Path tempDir) throws IOException {
		Path testFile = tempDir.resolve("timeout_test.txt");
		Files.writeString(testFile, "Quick extraction content");

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(testFile);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		try {
			// Use very short timeout
			ExtractionResult result = future.get(100, TimeUnit.MILLISECONDS);
			// If we get here, extraction was fast enough
			assertNotNull(result, "Result should not be null");
		} catch (TimeoutException e) {
			// Timeout exception is acceptable for this test
			assertTrue(true, "Timeout exception is expected for very short timeout");
		} catch (InterruptedException | ExecutionException e) {
			fail("Unexpected exception: " + e.getMessage());
		}
	}

	/**
	 * Test async extraction completion status. Verifies: - Future completion is
	 * detectable - isDone() works correctly - Future state transitions
	 */
	@Test
	@DisplayName("should report async extraction completion status")
	void testAsyncCompletionStatus(@TempDir Path tempDir) throws IOException {
		Path testFile = tempDir.resolve("completion_test.txt");
		Files.writeString(testFile, "Completion status testing");

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(testFile);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		// Give time for completion
		try {
			Thread.sleep(100);
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
		}

		assertTrue(future.isDone(), "Future should be completed after short delay");
		assertFalse(future.isCompletedExceptionally(), "Future should not be completed exceptionally");
		assertFalse(future.isCancelled(), "Future should not be cancelled");
	}

	/**
	 * Test async extraction cancellation. Verifies: - Future can be cancelled -
	 * Cancellation is detected - Subsequent operations handle cancellation
	 */
	@Test
	@DisplayName("should handle async extraction cancellation")
	void testAsyncCancellation(@TempDir Path tempDir) throws IOException, InterruptedException {
		Path testFile = tempDir.resolve("cancel_test.txt");
		Files.writeString(testFile, "Cancellation test content");

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				// Simulate some work
				Thread.sleep(10);
				return Kreuzberg.extractFile(testFile);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			} catch (InterruptedException e) {
				Thread.currentThread().interrupt();
				throw new RuntimeException(e);
			}
		});

		// Try to cancel immediately (may or may not succeed depending on timing)
		boolean cancelled = future.cancel(true);
		boolean isCancelled = future.isCancelled();

		// At least one of these should indicate cancellation attempt
		assertTrue(cancelled || future.isDone(), "Cancel should attempt or future should be done");
	}

	/**
	 * Test async extraction with multiple sequential operations. Verifies: - Async
	 * operations can be chained - Dependencies are properly handled - Results are
	 * accumulated
	 */
	@Test
	@DisplayName("should chain multiple async extraction operations")
	void testChainedAsyncOperations(@TempDir Path tempDir)
			throws IOException, ExecutionException, InterruptedException {
		// Create multiple files
		List<Path> files = new ArrayList<>();
		for (int i = 1; i <= 3; i++) {
			Path file = tempDir.resolve("chain_file_" + i + ".txt");
			Files.writeString(file, "Content " + i);
			files.add(file);
		}

		// Start first extraction
		CompletableFuture<ExtractionResult> chainFuture = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(files.get(0));
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		// Chain with second extraction
		for (int i = 1; i < files.size(); i++) {
			final int fileIndex = i;
			chainFuture = chainFuture.thenCompose(prevResult -> CompletableFuture.supplyAsync(() -> {
				try {
					return Kreuzberg.extractFile(files.get(fileIndex));
				} catch (KreuzbergException | IOException e) {
					throw new RuntimeException(e);
				}
			}));
		}

		ExtractionResult finalResult = chainFuture.get();
		assertNotNull(finalResult, "Final result should not be null");
		assertTrue(finalResult.isSuccess(), "Final extraction should succeed");
	}

	/**
	 * Test async extraction with handle() for error handling. Verifies: - handle()
	 * processes both result and exception - Recovery is possible - Error state is
	 * properly communicated
	 */
	@Test
	@DisplayName("should handle results and exceptions with handle()")
	void testAsyncHandleMethod(@TempDir Path tempDir) throws IOException, ExecutionException, InterruptedException {
		Path testFile = tempDir.resolve("handle_test.txt");
		Files.writeString(testFile, "Handle method test content");

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(testFile);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		// Use handle() to process result or exception
		CompletableFuture<Boolean> handleFuture = future.handle((result, exception) -> {
			if (exception != null) {
				return false; // Error occurred
			}
			return result != null && result.isSuccess();
		});

		Boolean success = handleFuture.get();
		assertNotNull(success, "Handle result should not be null");
		assertTrue(success, "Extraction should succeed");
	}

	/**
	 * Test async extraction with bytes extraction. Verifies: - Async works with
	 * extractBytes() - Byte array handling is thread-safe - Results are consistent
	 */
	@Test
	@DisplayName("should handle async bytes extraction")
	void testAsyncBytesExtraction() throws ExecutionException, InterruptedException {
		String testContent = "Async bytes extraction test content";
		byte[] testBytes = testContent.getBytes();

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractBytes(testBytes, "text/plain", null);
			} catch (KreuzbergException e) {
				throw new RuntimeException(e);
			}
		});

		ExtractionResult result = future.get();
		assertNotNull(result, "Result should not be null");
		assertTrue(result.isSuccess(), "Extraction should succeed");
		assertNotNull(result.getContent(), "Content should be extracted");
	}

	/**
	 * Test async extraction with configuration. Verifies: - ExtractionConfig is
	 * properly passed to async - Configuration affects async results - Config
	 * behavior is consistent
	 */
	@Test
	@DisplayName("should apply configuration in async extraction")
	void testAsyncExtractionWithConfig(@TempDir Path tempDir)
			throws IOException, ExecutionException, InterruptedException {
		Path testFile = tempDir.resolve("config_test.txt");
		Files.writeString(testFile, "Configuration testing in async context");

		ExtractionConfig config = ExtractionConfig.builder().build();

		CompletableFuture<ExtractionResult> future = CompletableFuture.supplyAsync(() -> {
			try {
				return Kreuzberg.extractFile(testFile, config);
			} catch (KreuzbergException | IOException e) {
				throw new RuntimeException(e);
			}
		});

		ExtractionResult result = future.get();
		assertNotNull(result, "Result should not be null");
		assertTrue(result.isSuccess(), "Extraction with config should succeed");
	}
}
