package dev.kreuzberg.config;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Comprehensive EmbeddingConfig tests.
 *
 * <p>
 * Tests for embedding generation configuration including model selection,
 * normalization, batch size, dimensions, caching, and download progress.
 */
@DisplayName("EmbeddingConfig Tests")
final class EmbeddingConfigTest {

	@Test
	@DisplayName("should create config with default values")
	void shouldCreateWithDefaults() {
		EmbeddingConfig config = EmbeddingConfig.builder().build();

		assertNull(config.getModel());
		assertThat(config.getNormalize()).isTrue();
		assertThat(config.getBatchSize()).isEqualTo(32);
		assertNull(config.getDimensions());
		assertThat(config.getUseCache()).isTrue();
		assertThat(config.getShowDownloadProgress()).isFalse();
		assertNull(config.getCacheDir());
	}

	@Test
	@DisplayName("should set model name")
	void shouldSetModel() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("all-MiniLM-L6-v2").build();

		assertThat(config.getModel()).isEqualTo("all-MiniLM-L6-v2");
	}

	@Test
	@DisplayName("should set normalize flag")
	void shouldSetNormalize() {
		EmbeddingConfig config = EmbeddingConfig.builder().normalize(false).build();

		assertThat(config.getNormalize()).isFalse();
	}

	@Test
	@DisplayName("should set batch size")
	void shouldSetBatchSize() {
		EmbeddingConfig config = EmbeddingConfig.builder().batchSize(64).build();

		assertThat(config.getBatchSize()).isEqualTo(64);
	}

	@Test
	@DisplayName("should set dimensions")
	void shouldSetDimensions() {
		EmbeddingConfig config = EmbeddingConfig.builder().dimensions(384).build();

		assertThat(config.getDimensions()).isEqualTo(384);
	}

	@Test
	@DisplayName("should set use cache flag")
	void shouldSetUseCache() {
		EmbeddingConfig config = EmbeddingConfig.builder().useCache(false).build();

		assertThat(config.getUseCache()).isFalse();
	}

	@Test
	@DisplayName("should set show download progress flag")
	void shouldSetShowDownloadProgress() {
		EmbeddingConfig config = EmbeddingConfig.builder().showDownloadProgress(true).build();

		assertThat(config.getShowDownloadProgress()).isTrue();
	}

	@Test
	@DisplayName("should set cache directory")
	void shouldSetCacheDir() {
		EmbeddingConfig config = EmbeddingConfig.builder().cacheDir("/custom/cache/path").build();

		assertThat(config.getCacheDir()).isEqualTo("/custom/cache/path");
	}

	@Test
	@DisplayName("should create config with all parameters")
	void shouldCreateWithAllParameters() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("all-mpnet-base-v2").normalize(true).batchSize(128)
				.dimensions(768).useCache(true).showDownloadProgress(true).cacheDir("/tmp/embeddings").build();

		assertThat(config.getModel()).isEqualTo("all-mpnet-base-v2");
		assertThat(config.getNormalize()).isTrue();
		assertThat(config.getBatchSize()).isEqualTo(128);
		assertThat(config.getDimensions()).isEqualTo(768);
		assertThat(config.getUseCache()).isTrue();
		assertThat(config.getShowDownloadProgress()).isTrue();
		assertThat(config.getCacheDir()).isEqualTo("/tmp/embeddings");
	}

	@Test
	@DisplayName("should convert to map representation")
	void shouldConvertToMap() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("test-model").normalize(true).batchSize(64)
				.dimensions(512).build();

		Map<String, Object> map = config.toMap();

		assertThat(map).containsEntry("model", "test-model").containsEntry("normalize", true)
				.containsEntry("batch_size", 64).containsEntry("dimensions", 512).containsEntry("use_cache", true)
				.containsEntry("show_download_progress", false);
	}

	@Test
	@DisplayName("should support builder method chaining")
	void shouldSupportBuilderChaining() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("chain-model").batchSize(256).normalize(false).build();

		assertThat(config.getModel()).isEqualTo("chain-model");
		assertThat(config.getBatchSize()).isEqualTo(256);
		assertThat(config.getNormalize()).isFalse();
	}

	@Test
	@DisplayName("should handle null model")
	void shouldHandleNullModel() {
		EmbeddingConfig config = EmbeddingConfig.builder().model(null).build();

		assertNull(config.getModel());
	}

	@Test
	@DisplayName("should handle null cache directory")
	void shouldHandleNullCacheDir() {
		EmbeddingConfig config = EmbeddingConfig.builder().cacheDir(null).build();

		assertNull(config.getCacheDir());
	}

	@Test
	@DisplayName("should create independent builder instances")
	void shouldCreateIndependentBuilderInstances() {
		EmbeddingConfig config1 = EmbeddingConfig.builder().model("model1").build();
		EmbeddingConfig config2 = EmbeddingConfig.builder().model("model2").build();

		assertThat(config1.getModel()).isNotEqualTo(config2.getModel());
	}

	@Test
	@DisplayName("should support common model names")
	void shouldSupportCommonModelNames() {
		EmbeddingConfig config1 = EmbeddingConfig.builder().model("all-MiniLM-L6-v2").dimensions(384).build();
		EmbeddingConfig config2 = EmbeddingConfig.builder().model("all-MiniLM-L12-v2").dimensions(384).build();
		EmbeddingConfig config3 = EmbeddingConfig.builder().model("all-mpnet-base-v2").dimensions(768).build();
		EmbeddingConfig config4 = EmbeddingConfig.builder().model("paraphrase-MiniLM-L6-v2").dimensions(384).build();
		EmbeddingConfig config5 = EmbeddingConfig.builder().model("multi-qa-MiniLM-L6-cos-v1").dimensions(384).build();

		assertThat(config1.getModel()).isEqualTo("all-MiniLM-L6-v2");
		assertThat(config2.getModel()).isEqualTo("all-MiniLM-L12-v2");
		assertThat(config3.getModel()).isEqualTo("all-mpnet-base-v2");
		assertThat(config4.getModel()).isEqualTo("paraphrase-MiniLM-L6-v2");
		assertThat(config5.getModel()).isEqualTo("multi-qa-MiniLM-L6-cos-v1");
	}

	@Test
	@DisplayName("should support various batch sizes")
	void shouldSupportVariousBatchSizes() {
		EmbeddingConfig config1 = EmbeddingConfig.builder().batchSize(1).build();
		EmbeddingConfig config2 = EmbeddingConfig.builder().batchSize(16).build();
		EmbeddingConfig config3 = EmbeddingConfig.builder().batchSize(64).build();
		EmbeddingConfig config4 = EmbeddingConfig.builder().batchSize(128).build();
		EmbeddingConfig config5 = EmbeddingConfig.builder().batchSize(512).build();

		assertThat(config1.getBatchSize()).isEqualTo(1);
		assertThat(config2.getBatchSize()).isEqualTo(16);
		assertThat(config3.getBatchSize()).isEqualTo(64);
		assertThat(config4.getBatchSize()).isEqualTo(128);
		assertThat(config5.getBatchSize()).isEqualTo(512);
	}

	@Test
	@DisplayName("should support common embedding dimensions")
	void shouldSupportCommonDimensions() {
		EmbeddingConfig config1 = EmbeddingConfig.builder().dimensions(384).build();
		EmbeddingConfig config2 = EmbeddingConfig.builder().dimensions(512).build();
		EmbeddingConfig config3 = EmbeddingConfig.builder().dimensions(768).build();
		EmbeddingConfig config4 = EmbeddingConfig.builder().dimensions(1024).build();
		EmbeddingConfig config5 = EmbeddingConfig.builder().dimensions(1536).build();

		assertThat(config1.getDimensions()).isEqualTo(384);
		assertThat(config2.getDimensions()).isEqualTo(512);
		assertThat(config3.getDimensions()).isEqualTo(768);
		assertThat(config4.getDimensions()).isEqualTo(1024);
		assertThat(config5.getDimensions()).isEqualTo(1536);
	}

	@Test
	@DisplayName("should create from map with all fields")
	void shouldCreateFromMapWithAllFields() {
		Map<String, Object> map = Map.of("model", "test-model", "normalize", true, "batch_size", 64, "dimensions", 512,
				"use_cache", false, "show_download_progress", true, "cache_dir", "/test/cache");

		EmbeddingConfig config = EmbeddingConfig.fromMap(map);

		assertThat(config.getModel()).isEqualTo("test-model");
		assertThat(config.getNormalize()).isTrue();
		assertThat(config.getBatchSize()).isEqualTo(64);
		assertThat(config.getDimensions()).isEqualTo(512);
		assertThat(config.getUseCache()).isFalse();
		assertThat(config.getShowDownloadProgress()).isTrue();
		assertThat(config.getCacheDir()).isEqualTo("/test/cache");
	}

	@Test
	@DisplayName("should create from map with partial fields")
	void shouldCreateFromMapWithPartialFields() {
		Map<String, Object> map = Map.of("model", "partial-model", "batch_size", 32);

		EmbeddingConfig config = EmbeddingConfig.fromMap(map);

		assertThat(config.getModel()).isEqualTo("partial-model");
		assertThat(config.getBatchSize()).isEqualTo(32);
		assertThat(config.getNormalize()).isTrue(); // default value
	}

	@Test
	@DisplayName("should return null from map when input is null")
	void shouldReturnNullFromNullMap() {
		EmbeddingConfig config = EmbeddingConfig.fromMap(null);

		assertNull(config);
	}

	@Test
	@DisplayName("should handle missing fields in fromMap")
	void shouldHandleMissingFieldsInFromMap() {
		Map<String, Object> map = Map.of("model", "minimal-model");

		EmbeddingConfig config = EmbeddingConfig.fromMap(map);

		assertThat(config.getModel()).isEqualTo("minimal-model");
		assertThat(config.getNormalize()).isTrue();
		assertThat(config.getBatchSize()).isEqualTo(32);
	}

	@Test
	@DisplayName("should only include non-null fields in toMap")
	void shouldOnlyIncludeNonNullFieldsInToMap() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("test-model").normalize(true).build();

		Map<String, Object> map = config.toMap();

		assertThat(map).containsKey("model").containsKey("normalize").containsKey("batch_size").containsKey("use_cache")
				.containsKey("show_download_progress").doesNotContainKey("dimensions").doesNotContainKey("cache_dir");
	}

	@Test
	@DisplayName("should support integration with ExtractionConfig")
	void shouldSupportIntegrationWithExtractionConfig() {
		EmbeddingConfig embeddingConfig = EmbeddingConfig.builder().model("integration-model").batchSize(64)
				.normalize(true).build();

		ExtractionConfig extractionConfig = ExtractionConfig.builder().embedding(embeddingConfig).build();

		assertNotNull(extractionConfig.getEmbedding());
		assertThat(extractionConfig.getEmbedding().getModel()).isEqualTo("integration-model");
		assertThat(extractionConfig.getEmbedding().getBatchSize()).isEqualTo(64);
	}

	@Test
	@DisplayName("should handle boolean conversion from Number in fromMap")
	void shouldHandleNumberToBoolean() {
		Map<String, Object> map = Map.of("model", "bool-test", "batch_size", 64L); // Long instead of Integer

		EmbeddingConfig config = EmbeddingConfig.fromMap(map);

		assertThat(config.getModel()).isEqualTo("bool-test");
		assertThat(config.getBatchSize()).isEqualTo(64);
	}

	@Test
	@DisplayName("should configure for lightweight model")
	void shouldConfigureForLightweightModel() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("all-MiniLM-L6-v2").dimensions(384).batchSize(64)
				.normalize(true).useCache(true).build();

		assertThat(config.getModel()).isEqualTo("all-MiniLM-L6-v2");
		assertThat(config.getDimensions()).isEqualTo(384);
		assertThat(config.getBatchSize()).isEqualTo(64);
	}

	@Test
	@DisplayName("should configure for high-quality model")
	void shouldConfigureForHighQualityModel() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("all-mpnet-base-v2").dimensions(768).batchSize(32)
				.normalize(true).showDownloadProgress(true).build();

		assertThat(config.getModel()).isEqualTo("all-mpnet-base-v2");
		assertThat(config.getDimensions()).isEqualTo(768);
		assertThat(config.getBatchSize()).isEqualTo(32);
		assertThat(config.getShowDownloadProgress()).isTrue();
	}

	@Test
	@DisplayName("should configure for Q&A optimized model")
	void shouldConfigureForQAModel() {
		EmbeddingConfig config = EmbeddingConfig.builder().model("multi-qa-MiniLM-L6-cos-v1").dimensions(384)
				.batchSize(128).normalize(true).useCache(true).cacheDir("/qa/cache").build();

		assertThat(config.getModel()).isEqualTo("multi-qa-MiniLM-L6-cos-v1");
		assertThat(config.getDimensions()).isEqualTo(384);
		assertThat(config.getBatchSize()).isEqualTo(128);
		assertThat(config.getCacheDir()).isEqualTo("/qa/cache");
	}
}
