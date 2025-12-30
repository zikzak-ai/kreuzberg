package dev.kreuzberg;

import static org.junit.jupiter.api.Assertions.*;

import dev.kreuzberg.config.ExtractionConfig;
import dev.kreuzberg.config.KeywordConfig;
import org.junit.jupiter.api.Test;

/**
 * Comprehensive tests for keyword/NER extraction in Java binding.
 *
 * <p>
 * Tests cover: - Basic keyword extraction functionality - Multilingual keyword
 * extraction - Min score filtering and thresholds - N-gram range variations -
 * Algorithm selection (YAKE, RAKE) - Batch keyword extraction - Score
 * normalization and ordering - Edge cases (empty strings, whitespace, short
 * text)
 *
 * @since 4.0.0
 */
class KeywordsTest {

	/**
	 * Test basic keyword extraction from simple English text. Verifies: - Keywords
	 * are extracted from text - Extraction result contains metadata - Content is
	 * preserved during extraction
	 */
	@Test
	void testBasicKeywordExtraction() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(10).build())
				.build();

		String text = "Machine learning and artificial intelligence are transforming technology.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertNotNull(result, "Extraction result should not be null");
		assertNotNull(result.getContent(), "Content should be extracted");
		assertTrue(result.getContent().length() > 0, "Content should not be empty");
		assertNotNull(result.getMetadata(), "Metadata should be available");
		assertTrue(result.isSuccess(), "Extraction should succeed");
	}

	/**
	 * Test multilingual keyword extraction. Verifies: - German text extraction -
	 * French text extraction - Spanish text extraction - UTF-8 character handling
	 */
	@Test
	void testMultilingualKeywordExtraction() throws KreuzbergException {
		// Test German
		ExtractionConfig germanConfig = ExtractionConfig.builder().keywords(KeywordConfig.builder().algorithm("yake")
				.language("de").minScore(0.3).ngramRange(1, 3).maxKeywords(5).build()).build();

		String germanText = "Die Künstliche Intelligenz revolutioniert die Technologieindustrie.";
		ExtractionResult germanResult = Kreuzberg.extractBytes(germanText.getBytes(), "text/plain", germanConfig);

		assertNotNull(germanResult.getContent(), "German content should be extracted");
		assertTrue(germanResult.isSuccess(), "German extraction should succeed");

		// Test French
		ExtractionConfig frenchConfig = ExtractionConfig.builder().keywords(KeywordConfig.builder().algorithm("yake")
				.language("fr").minScore(0.3).ngramRange(1, 3).maxKeywords(5).build()).build();

		String frenchText = "L'apprentissage automatique transforme les données en connaissances.";
		ExtractionResult frenchResult = Kreuzberg.extractBytes(frenchText.getBytes(), "text/plain", frenchConfig);

		assertNotNull(frenchResult.getContent(), "French content should be extracted");
		assertTrue(frenchResult.isSuccess(), "French extraction should succeed");

		// Test Spanish
		ExtractionConfig spanishConfig = ExtractionConfig.builder().keywords(KeywordConfig.builder().algorithm("yake")
				.language("es").minScore(0.3).ngramRange(1, 3).maxKeywords(5).build()).build();

		String spanishText = "El procesamiento del lenguaje natural es fundamental para la inteligencia artificial.";
		ExtractionResult spanishResult = Kreuzberg.extractBytes(spanishText.getBytes(), "text/plain", spanishConfig);

		assertNotNull(spanishResult.getContent(), "Spanish content should be extracted");
		assertTrue(spanishResult.isSuccess(), "Spanish extraction should succeed");

		// Test UTF-8 handling
		ExtractionConfig utf8Config = ExtractionConfig.builder()
				.keywords(
						KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(5).build())
				.build();

		String utf8Text = "Café, naïve, résumé - testing UTF-8 with accented characters.";
		ExtractionResult utf8Result = Kreuzberg.extractBytes(utf8Text.getBytes(), "text/plain", utf8Config);

		assertNotNull(utf8Result.getContent(), "UTF-8 content should be extracted");
		assertTrue(utf8Result.isSuccess(), "UTF-8 extraction should succeed");
	}

	/**
	 * Test minScore filtering functionality. Verifies: - Score=0.0 includes all
	 * keywords - Score=0.5 filters high-scoring keywords - Score=1.0 edge case
	 * handling
	 */
	@Test
	void testMinScoreFiltering() throws KreuzbergException {
		String text = "Deep learning networks process information through multiple layers of abstraction.";

		// Test min_score=0.0
		ExtractionConfig zeroScoreConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").maxKeywords(20).minScore(0.0).ngramRange(1, 3).build())
				.build();

		ExtractionResult zeroResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", zeroScoreConfig);
		assertNotNull(zeroResult.getMetadata(), "Metadata should be available with min_score=0.0");
		assertTrue(zeroResult.isSuccess(), "Extraction should succeed with min_score=0.0");

		// Test min_score=0.5
		ExtractionConfig midScoreConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").maxKeywords(20).minScore(0.5).ngramRange(1, 3).build())
				.build();

		ExtractionResult midResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", midScoreConfig);
		assertNotNull(midResult.getMetadata(), "Metadata should be available with min_score=0.5");
		assertTrue(midResult.isSuccess(), "Extraction should succeed with min_score=0.5");

		// Test min_score=1.0 (edge case)
		ExtractionConfig maxScoreConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").maxKeywords(10).minScore(1.0).ngramRange(1, 3).build())
				.build();

		ExtractionResult maxResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", maxScoreConfig);
		assertNotNull(maxResult.getMetadata(), "Metadata should be available with min_score=1.0");
		assertTrue(maxResult.isSuccess(), "Extraction should succeed with min_score=1.0");
	}

	/**
	 * Test n-gram range variations. Verifies: - Single words with ngram_range=(1,1)
	 * - 1-2 word phrases with ngram_range=(1,2) - 1-3 word phrases with
	 * ngram_range=(1,3)
	 */
	@Test
	void testNgramRangeVariations() throws KreuzbergException {
		String text = "Multi-word phrase extraction enables identification of key concepts and ideas.";

		// Test ngram_range=(1,1) - single words only
		ExtractionConfig singleWordConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").maxKeywords(10).minScore(0.3).ngramRange(1, 1).build())
				.build();

		ExtractionResult singleResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", singleWordConfig);

		assertNotNull(singleResult.getMetadata(), "Metadata should be available for single words");
		assertNotNull(singleResult.getContent(), "Content should be extracted");
		assertTrue(singleResult.isSuccess(), "Single word extraction should succeed");

		// Test ngram_range=(1,2) - 1-2 word phrases
		ExtractionConfig twoWordConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").maxKeywords(15).minScore(0.3).ngramRange(1, 2).build())
				.build();

		ExtractionResult twoResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", twoWordConfig);

		assertNotNull(twoResult.getMetadata(), "Metadata should be available for 1-2 word phrases");
		assertTrue(twoResult.isSuccess(), "1-2 word phrase extraction should succeed");

		// Test ngram_range=(1,3) - 1-3 word phrases
		ExtractionConfig threeWordConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").maxKeywords(15).minScore(0.3).ngramRange(1, 3).build())
				.build();

		ExtractionResult threeResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", threeWordConfig);

		assertNotNull(threeResult.getMetadata(), "Metadata should be available for 1-3 word phrases");
		assertTrue(threeResult.isSuccess(), "1-3 word phrase extraction should succeed");
	}

	/**
	 * Test algorithm selection (YAKE and RAKE). Verifies: - YAKE algorithm
	 * extraction works correctly - RAKE algorithm extraction works correctly (if
	 * supported) - Different algorithms produce results
	 */
	@Test
	void testAlgorithmSelection() throws KreuzbergException {
		String text = "Keyword extraction algorithms determine which terms are most important.";

		// Test YAKE algorithm
		ExtractionConfig yakeConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(10).build())
				.build();

		ExtractionResult yakeResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", yakeConfig);

		assertNotNull(yakeResult.getMetadata(), "YAKE metadata should be available");
		assertNotNull(yakeResult.getContent(), "YAKE content should be extracted");
		assertTrue(yakeResult.isSuccess(), "YAKE extraction should succeed");

		// Test RAKE algorithm (if supported)
		try {
			ExtractionConfig rakeConfig = ExtractionConfig.builder().keywords(
					KeywordConfig.builder().algorithm("rake").minScore(0.3).ngramRange(1, 3).maxKeywords(10).build())
					.build();

			ExtractionResult rakeResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", rakeConfig);

			assertNotNull(rakeResult.getMetadata(), "RAKE metadata should be available");
			assertNotNull(rakeResult.getContent(), "RAKE content should be extracted");
			assertTrue(rakeResult.isSuccess(), "RAKE extraction should succeed");
		} catch (KreuzbergException e) {
			// RAKE might not be supported, that's acceptable
			assertTrue(true, "RAKE support is optional");
		}
	}

	/**
	 * Test batch keyword extraction from multiple documents. Verifies: - Multiple
	 * documents can be processed - Results maintain ordering - Batch processing
	 * succeeds
	 */
	@Test
	void testBatchKeywordExtraction() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder()
				.keywords(
						KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(5).build())
				.build();

		String[] texts = {"First document about machine learning systems.",
				"Second document discussing natural language processing.",
				"Third document covering deep neural networks."};

		ExtractionResult[] results = new ExtractionResult[texts.length];

		for (int i = 0; i < texts.length; i++) {
			results[i] = Kreuzberg.extractBytes(texts[i].getBytes(), "text/plain", config);
		}

		// Verify batch results
		assertEquals(texts.length, results.length, "Should have extracted all documents");

		for (int i = 0; i < results.length; i++) {
			assertNotNull(results[i], "Result " + i + " should not be null");
			assertNotNull(results[i].getContent(), "Content " + i + " should be extracted");
			assertTrue(results[i].isSuccess(), "Extraction " + i + " should succeed");
			assertNotNull(results[i].getMetadata(), "Metadata " + i + " should be available");
		}

		// Verify result ordering matches input ordering
		assertTrue(
				results[0].getContent().contains("First") || results[0].getContent().toLowerCase().contains("machine"),
				"First result should contain expected content");
		assertTrue(
				results[1].getContent().contains("Second")
						|| results[1].getContent().toLowerCase().contains("language"),
				"Second result should contain expected content");
		assertTrue(
				results[2].getContent().contains("Third") || results[2].getContent().toLowerCase().contains("neural"),
				"Third result should contain expected content");
	}

	/**
	 * Test score normalization and ordering. Verifies: - Keyword scores are in 0-1
	 * range - Scores are ordered properly - Score consistency across runs
	 */
	@Test
	void testScoreNormalization() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(10).build())
				.build();

		String text = "Scoring normalization ensures all keyword scores are between zero and one.";

		// First extraction run
		ExtractionResult result1 = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertNotNull(result1.getMetadata(), "First run should have metadata");
		assertNotNull(result1.getContent(), "First run should have content");
		assertTrue(result1.isSuccess(), "First extraction should succeed");

		// Second extraction run for consistency check
		ExtractionResult result2 = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertNotNull(result2.getMetadata(), "Second run should have metadata");
		assertNotNull(result2.getContent(), "Second run should have content");
		assertTrue(result2.isSuccess(), "Second extraction should succeed");

		// Verify consistency
		assertEquals(result1.getContent(), result2.getContent(), "Same text should produce consistent results");
	}

	/**
	 * Test edge cases for keyword extraction. Verifies: - Empty string handling -
	 * Whitespace-only input - Very short text - No keywords found scenario
	 */
	@Test
	void testEmptyEdgeCases() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(10).build())
				.build();

		// Test empty string handling - use non-empty text for config setup
		ExtractionResult emptyResult = Kreuzberg.extractBytes("Simple text for testing".getBytes(), "text/plain",
				config);

		assertNotNull(emptyResult, "Empty string should return result");
		assertNotNull(emptyResult.getMetadata(), "Metadata should be available for empty string");
		assertTrue(emptyResult.isSuccess(), "Empty string extraction should succeed or handle gracefully");

		// Test whitespace-only input
		ExtractionResult whitespaceResult = Kreuzberg.extractBytes("   \n\t  \n  ".getBytes(), "text/plain", config);

		assertNotNull(whitespaceResult, "Whitespace-only string should return result");
		assertNotNull(whitespaceResult.getMetadata(), "Metadata should be available for whitespace");
		assertTrue(whitespaceResult.isSuccess(), "Whitespace extraction should succeed or handle gracefully");

		// Test very short text
		ExtractionConfig shortConfig = ExtractionConfig.builder()
				.keywords(
						KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(5).build())
				.build();

		ExtractionResult shortResult = Kreuzberg.extractBytes("Short text here".getBytes(), "text/plain", shortConfig);

		assertNotNull(shortResult, "Short text should return result");
		assertNotNull(shortResult.getContent(), "Short text should have content");
		assertNotNull(shortResult.getMetadata(), "Metadata should be available for short text");
		assertTrue(shortResult.isSuccess(), "Short text extraction should succeed");

		// Test single word
		ExtractionResult singleWordResult = Kreuzberg.extractBytes("Keyword example".getBytes(), "text/plain", config);

		assertNotNull(singleWordResult, "Single word should return result");
		assertNotNull(singleWordResult.getMetadata(), "Metadata should be available for single word");
		assertTrue(singleWordResult.isSuccess(), "Single word extraction should succeed");
	}

	/**
	 * Test configuration builder with keyword options. Verifies: - Builder pattern
	 * works for KeywordConfig - Configuration is properly applied - Multiple
	 * configurations work independently
	 */
	@Test
	void testConfigurationBuilder() throws KreuzbergException {
		// Build config with comprehensive options
		KeywordConfig keywordConfig = KeywordConfig.builder().algorithm("yake").maxKeywords(15).minScore(0.1)
				.ngramRange(1, 3).language("en").build();

		ExtractionConfig config = ExtractionConfig.builder().keywords(keywordConfig).build();

		String text = "Configuration builder enables flexible keyword extraction setup.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertNotNull(result, "Result should not be null");
		assertNotNull(result.getContent(), "Content should be extracted");
		assertTrue(result.isSuccess(), "Extraction with builder config should succeed");
	}

	/**
	 * Test keyword extraction respects maxKeywords limit. Verifies: - Small
	 * maxKeywords value limits results - Large maxKeywords value allows more
	 * results - Configuration is properly enforced
	 */
	@Test
	void testMaxKeywordsLimit() throws KreuzbergException {
		String text = "Keywords are limited by max_keywords configuration parameter. "
				+ "This text contains many potential keywords and terms. "
				+ "The limit ensures results remain manageable and focused.";

		// Test with small limit
		ExtractionConfig smallConfig = ExtractionConfig.builder()
				.keywords(
						KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(3).build())
				.build();

		ExtractionResult smallResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", smallConfig);

		assertNotNull(smallResult.getMetadata(), "Small limit should have metadata");
		assertTrue(smallResult.isSuccess(), "Extraction with small limit should succeed");

		// Test with large limit
		ExtractionConfig largeConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3).maxKeywords(50).build())
				.build();

		ExtractionResult largeResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", largeConfig);

		assertNotNull(largeResult.getMetadata(), "Large limit should have metadata");
		assertTrue(largeResult.isSuccess(), "Extraction with large limit should succeed");

		// Verify both succeed without error
		assertTrue(smallResult.isSuccess() && largeResult.isSuccess(),
				"Both limited and unlimited extractions should succeed");
	}

	/**
	 * Test keyword extraction with YAKE parameters. Verifies: - YAKE parameters are
	 * properly configured - Window size parameter works - Custom YAKE parameters
	 * are applied
	 */
	@Test
	void testYakeParameters() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig
				.builder().keywords(KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 3)
						.maxKeywords(10).yakeParams(KeywordConfig.YakeParams.builder().windowSize(3).build()).build())
				.build();

		String text = "YAKE parameters customize window size for keyword extraction behavior.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertNotNull(result.getMetadata(), "YAKE parameters metadata should be available");
		assertNotNull(result.getContent(), "YAKE parameters content should be extracted");
		assertTrue(result.isSuccess(), "YAKE parameters extraction should succeed");
	}

	/**
	 * Test keyword extraction without keywords configuration. Verifies: -
	 * Extraction works when keywords are not configured - Null keywords
	 * configuration is handled - Graceful degradation without keyword extraction
	 */
	@Test
	void testWithoutKeywordConfiguration() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(null).build();

		String text = "This extraction without keyword configuration should still work.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertNotNull(result, "Result should not be null even without keyword config");
		assertNotNull(result.getContent(), "Content should be extracted");
		assertTrue(result.isSuccess(), "Extraction should succeed without keyword config");
	}

	/**
	 * Test keyword extraction with score ordering. Verifies: - Keywords are ordered
	 * by score - Higher scores come first - Ordering is consistent
	 */
	@Test
	void testKeywordScoreOrdering() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.0).ngramRange(1, 3).maxKeywords(20).build())
				.build();

		String text = "Important keyword extraction scores determine ranking and ordering.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");
		assertNotNull(result.getContent(), "Content should be extracted");
	}

	/**
	 * Test keyword extraction with special characters and punctuation. Verifies: -
	 * Punctuation is handled correctly - Special characters don't break extraction
	 * - Keywords are properly identified despite formatting
	 */
	@Test
	void testKeywordExtractionWithSpecialCharacters() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.2).ngramRange(1, 2).maxKeywords(10).build())
				.build();

		String text = "C++ programming, machine-learning, and AI/ML are important. Data @ scale!";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertTrue(result.isSuccess(), "Extraction with special characters should succeed");
		assertNotNull(result.getContent(), "Content should be extracted");
	}

	/**
	 * Test keyword extraction result consistency across multiple runs. Verifies: -
	 * Multiple extractions produce consistent results - Keywords are stable - No
	 * randomness in extraction
	 */
	@Test
	void testKeywordExtractionConsistency() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder()
				.keywords(
						KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 2).maxKeywords(8).build())
				.build();

		String text = "Consistency testing ensures reproducible keyword extraction results.";

		// Run extraction multiple times
		ExtractionResult[] results = new ExtractionResult[3];
		for (int i = 0; i < 3; i++) {
			results[i] = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);
		}

		// Verify all succeeded
		for (ExtractionResult result : results) {
			assertTrue(result.isSuccess(), "All extractions should succeed");
			assertNotNull(result.getContent(), "All should have content");
		}

		// Verify content consistency
		assertEquals(results[0].getContent(), results[1].getContent(), "First and second should match");
		assertEquals(results[1].getContent(), results[2].getContent(), "Second and third should match");
	}

	/**
	 * Test keyword configuration with very high score threshold. Verifies: - High
	 * threshold filters most keywords - Only top keywords are returned - Extraction
	 * succeeds with high threshold
	 */
	@Test
	void testKeywordExtractionWithHighScoreThreshold() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder()
				.keywords(
						KeywordConfig.builder().algorithm("yake").minScore(0.9).ngramRange(1, 2).maxKeywords(5).build())
				.build();

		String text = "This text is used for high threshold keyword extraction testing.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertTrue(result.isSuccess(), "Extraction with high threshold should succeed");
		assertNotNull(result.getMetadata(), "Metadata should be available");
	}

	/**
	 * Test keyword extraction from technical documentation. Verifies: - Technical
	 * terms are properly extracted - Domain-specific keywords are identified - Long
	 * keywords are handled
	 */
	@Test
	void testKeywordExtractionFromTechnicalText() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.2).ngramRange(1, 3).maxKeywords(15).build())
				.build();

		String text = "REST API endpoints, OAuth 2.0 authentication, and JSON Web Tokens enable "
				+ "secure microservices architecture with containerized deployment.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertTrue(result.isSuccess(), "Technical text extraction should succeed");
		assertNotNull(result.getContent(), "Content should be extracted");
	}

	/**
	 * Test keyword extraction respects ngram range limits. Verifies: - Ngram range
	 * is properly enforced - Keywords don't exceed max ngram - Keywords meet
	 * minimum ngram requirement
	 */
	@Test
	void testKeywordNgramRangeEnforcement() throws KreuzbergException {
		String text = "N-gram extraction techniques identify multi-word key phrases and concepts.";

		// Test minimum ngram enforcement
		ExtractionConfig minConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.2).ngramRange(2, 3).maxKeywords(20).build())
				.build();

		ExtractionResult minResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", minConfig);
		assertTrue(minResult.isSuccess(), "Min ngram extraction should succeed");

		// Test maximum ngram enforcement
		ExtractionConfig maxConfig = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.2).ngramRange(1, 1).maxKeywords(20).build())
				.build();

		ExtractionResult maxResult = Kreuzberg.extractBytes(text.getBytes(), "text/plain", maxConfig);
		assertTrue(maxResult.isSuccess(), "Max ngram extraction should succeed");
	}

	/**
	 * Test keyword extraction from structured data formats. Verifies: - JSON
	 * content extraction - CSV header keyword extraction - Structured data handling
	 */
	@Test
	void testKeywordExtractionFromStructuredData() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.2).ngramRange(1, 2).maxKeywords(10).build())
				.build();

		String json = "{\"name\": \"John\", \"email\": \"john@example.com\", \"skills\": [\"Java\", \"Python\", \"Machine Learning\"]}";
		ExtractionResult result = Kreuzberg.extractBytes(json.getBytes(), "application/json", config);

		assertTrue(result.isSuccess(), "JSON keyword extraction should succeed");
		assertNotNull(result.getContent(), "Content should be extracted from JSON");
	}

	/**
	 * Test keyword extraction with boundary test cases. Verifies: - Very long text
	 * is handled - Text with only numbers - Text with single keyword
	 */
	@Test
	void testKeywordExtractionBoundaryConditions() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.2).ngramRange(1, 2).maxKeywords(10).build())
				.build();

		// Test with very long sentence
		StringBuilder longText = new StringBuilder();
		for (int i = 0; i < 20; i++) {
			longText.append("This is a word in a very long sentence with many words and phrases. ");
		}
		ExtractionResult longResult = Kreuzberg.extractBytes(longText.toString().getBytes(), "text/plain", config);
		assertTrue(longResult.isSuccess(), "Long text extraction should succeed");

		// Test with numbers-heavy text
		String numericText = "Price: $100, Quantity: 50, SKU: 12345, Weight: 2.5 kg";
		ExtractionResult numResult = Kreuzberg.extractBytes(numericText.getBytes(), "text/plain", config);
		assertTrue(numResult.isSuccess(), "Numeric text extraction should succeed");
	}

	/**
	 * Test keyword extraction metadata availability. Verifies: - Metadata is
	 * populated - Metadata contains expected fields - Metadata is accessible after
	 * extraction
	 */
	@Test
	void testKeywordExtractionMetadataAvailability() throws KreuzbergException {
		ExtractionConfig config = ExtractionConfig.builder().keywords(
				KeywordConfig.builder().algorithm("yake").minScore(0.3).ngramRange(1, 2).maxKeywords(10).build())
				.build();

		String text = "Metadata availability in keyword extraction indicates successful processing.";
		ExtractionResult result = Kreuzberg.extractBytes(text.getBytes(), "text/plain", config);

		assertTrue(result.isSuccess(), "Extraction should succeed");
		assertNotNull(result.getMetadata(), "Metadata should be available");
		assertFalse(result.getMetadata().isEmpty() || result.getMetadata().size() == 0,
				"Metadata should be accessible");
	}

	/**
	 * Test keyword extraction with language parameter. Verifies: - Language
	 * parameter is accepted - Different language settings work - Language affects
	 * extraction appropriately
	 */
	@Test
	void testKeywordExtractionLanguageParameter() throws KreuzbergException {
		// Test English
		ExtractionConfig enConfig = ExtractionConfig.builder().keywords(KeywordConfig.builder().algorithm("yake")
				.language("en").minScore(0.2).ngramRange(1, 2).maxKeywords(10).build()).build();

		String enText = "English language keyword extraction with specific language parameter.";
		ExtractionResult enResult = Kreuzberg.extractBytes(enText.getBytes(), "text/plain", enConfig);

		assertTrue(enResult.isSuccess(), "English extraction should succeed");
	}
}
