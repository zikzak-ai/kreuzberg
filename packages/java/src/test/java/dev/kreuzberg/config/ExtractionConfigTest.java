package dev.kreuzberg.config;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Comprehensive ExtractionConfig tests.
 *
 * <p>
 * Tests for the main extraction configuration that integrates all
 * sub-configurations including OCR, chunking, language detection, PDF options,
 * image extraction, preprocessing, post-processing, token reduction, HTML
 * options, keywords, and pages.
 */
@DisplayName("ExtractionConfig Tests")
final class ExtractionConfigTest {

	@Test
	@DisplayName("should create config with default values")
	void shouldCreateWithDefaults() {
		ExtractionConfig config = ExtractionConfig.builder().build();

		assertThat(config.isUseCache()).isTrue();
		assertThat(config.isEnableQualityProcessing()).isFalse();
		assertThat(config.isForceOcr()).isFalse();
		assertNull(config.getOcr());
		assertNull(config.getChunking());
		assertNull(config.getLanguageDetection());
		assertNull(config.getPdfOptions());
		assertNull(config.getImageExtraction());
		assertNull(config.getImagePreprocessing());
		assertNull(config.getPostprocessor());
		assertNull(config.getTokenReduction());
		assertNull(config.getPages());
	}

	@Test
	@DisplayName("should disable use cache")
	void shouldDisableUseCache() {
		ExtractionConfig config = ExtractionConfig.builder().useCache(false).build();

		assertThat(config.isUseCache()).isFalse();
	}

	@Test
	@DisplayName("should enable quality processing")
	void shouldEnableQualityProcessing() {
		ExtractionConfig config = ExtractionConfig.builder().enableQualityProcessing(true).build();

		assertThat(config.isEnableQualityProcessing()).isTrue();
	}

	@Test
	@DisplayName("should enable force OCR")
	void shouldEnableForceOcr() {
		ExtractionConfig config = ExtractionConfig.builder().forceOcr(true).build();

		assertThat(config.isForceOcr()).isTrue();
	}

	@Test
	@DisplayName("should set OCR config")
	void shouldSetOcrConfig() {
		OcrConfig ocrConfig = OcrConfig.builder().backend("tesseract").build();
		ExtractionConfig config = ExtractionConfig.builder().ocr(ocrConfig).build();

		assertNotNull(config.getOcr());
		assertThat(config.getOcr().getBackend()).isEqualTo("tesseract");
	}

	@Test
	@DisplayName("should set chunking config")
	void shouldSetChunkingConfig() {
		ChunkingConfig chunkingConfig = ChunkingConfig.builder().maxChars(2000).build();
		ExtractionConfig config = ExtractionConfig.builder().chunking(chunkingConfig).build();

		assertNotNull(config.getChunking());
		assertThat(config.getChunking().getMaxChars()).isEqualTo(2000);
	}

	@Test
	@DisplayName("should set language detection config")
	void shouldSetLanguageDetectionConfig() {
		LanguageDetectionConfig langConfig = LanguageDetectionConfig.builder().enabled(true).build();
		ExtractionConfig config = ExtractionConfig.builder().languageDetection(langConfig).build();

		assertNotNull(config.getLanguageDetection());
		assertThat(config.getLanguageDetection().isEnabled()).isTrue();
	}

	@Test
	@DisplayName("should set PDF options config")
	void shouldSetPdfOptionsConfig() {
		PdfConfig pdfConfig = PdfConfig.builder().extractImages(true).build();
		ExtractionConfig config = ExtractionConfig.builder().pdfOptions(pdfConfig).build();

		assertNotNull(config.getPdfOptions());
		assertThat(config.getPdfOptions().isExtractImages()).isTrue();
	}

	@Test
	@DisplayName("should set image extraction config")
	void shouldSetImageExtractionConfig() {
		ImageExtractionConfig imageExtConfig = ImageExtractionConfig.builder().targetDpi(600).build();
		ExtractionConfig config = ExtractionConfig.builder().imageExtraction(imageExtConfig).build();

		assertNotNull(config.getImageExtraction());
		assertThat(config.getImageExtraction().getTargetDpi()).isEqualTo(600);
	}

	@Test
	@DisplayName("should set image preprocessing config")
	void shouldSetImagePreprocessingConfig() {
		ImagePreprocessingConfig imgPreConfig = ImagePreprocessingConfig.builder().denoise(true).build();
		ExtractionConfig config = ExtractionConfig.builder().imagePreprocessing(imgPreConfig).build();

		assertNotNull(config.getImagePreprocessing());
		assertThat(config.getImagePreprocessing().isDenoise()).isTrue();
	}

	@Test
	@DisplayName("should set post-processor config")
	void shouldSetPostProcessorConfig() {
		PostProcessorConfig postConfig = PostProcessorConfig.builder().enabled(true).build();
		ExtractionConfig config = ExtractionConfig.builder().postprocessor(postConfig).build();

		assertNotNull(config.getPostprocessor());
		assertThat(config.getPostprocessor().isEnabled()).isTrue();
	}

	@Test
	@DisplayName("should set token reduction config")
	void shouldSetTokenReductionConfig() {
		TokenReductionConfig tokenConfig = TokenReductionConfig.builder().mode("moderate").build();
		ExtractionConfig config = ExtractionConfig.builder().tokenReduction(tokenConfig).build();

		assertNotNull(config.getTokenReduction());
		assertThat(config.getTokenReduction().getMode()).isEqualTo("moderate");
	}

	@Test
	@DisplayName("should set keyword config")
	void shouldSetKeywordConfig() {
		KeywordConfig keywordConfig = KeywordConfig.builder().algorithm("yake").build();
		ExtractionConfig config = ExtractionConfig.builder().keywords(keywordConfig).build();

		assertNotNull(config.getKeywords());
		assertThat(config.getKeywords().toMap().get("algorithm")).isEqualTo("yake");
	}

	@Test
	@DisplayName("should set page config")
	void shouldSetPageConfig() {
		PageConfig pageConfig = PageConfig.builder().extractPages(true).build();
		ExtractionConfig config = ExtractionConfig.builder().pages(pageConfig).build();

		assertNotNull(config.getPages());
		assertThat(config.getPages().isExtractPages()).isTrue();
	}

	@Test
	@DisplayName("should set max concurrent extractions")
	void shouldSetMaxConcurrentExtractions() {
		ExtractionConfig config = ExtractionConfig.builder().maxConcurrentExtractions(4).build();

		assertThat(config.getMaxConcurrentExtractions()).isEqualTo(4);
	}

	@Test
	@DisplayName("should create config with all parameters")
	void shouldCreateWithAllParameters() {
		OcrConfig ocrConfig = OcrConfig.builder().backend("tesseract").build();
		ChunkingConfig chunkingConfig = ChunkingConfig.builder().maxChars(2000).build();
		LanguageDetectionConfig langConfig = LanguageDetectionConfig.builder().enabled(true).build();
		PdfConfig pdfConfig = PdfConfig.builder().extractImages(true).build();
		ImageExtractionConfig imageExtConfig = ImageExtractionConfig.builder().targetDpi(600).build();
		ImagePreprocessingConfig imgPreConfig = ImagePreprocessingConfig.builder().denoise(true).build();
		PostProcessorConfig postConfig = PostProcessorConfig.builder().enabled(true).build();
		TokenReductionConfig tokenConfig = TokenReductionConfig.builder().mode("moderate").build();
		PageConfig pageConfig = PageConfig.builder().extractPages(true).build();

		ExtractionConfig config = ExtractionConfig.builder().useCache(true).enableQualityProcessing(true).forceOcr(true)
				.ocr(ocrConfig).chunking(chunkingConfig).languageDetection(langConfig).pdfOptions(pdfConfig)
				.imageExtraction(imageExtConfig).imagePreprocessing(imgPreConfig).postprocessor(postConfig)
				.tokenReduction(tokenConfig).pages(pageConfig).maxConcurrentExtractions(4).build();

		assertThat(config.isUseCache()).isTrue();
		assertThat(config.isEnableQualityProcessing()).isTrue();
		assertThat(config.isForceOcr()).isTrue();
		assertNotNull(config.getOcr());
		assertNotNull(config.getChunking());
		assertNotNull(config.getLanguageDetection());
		assertNotNull(config.getPdfOptions());
		assertNotNull(config.getImageExtraction());
		assertNotNull(config.getImagePreprocessing());
		assertNotNull(config.getPostprocessor());
		assertNotNull(config.getTokenReduction());
		assertNotNull(config.getPages());
		assertThat(config.getMaxConcurrentExtractions()).isEqualTo(4);
	}

	@Test
	@DisplayName("should convert to map representation")
	void shouldConvertToMap() {
		OcrConfig ocrConfig = OcrConfig.builder().backend("tesseract").build();
		ExtractionConfig config = ExtractionConfig.builder().useCache(true).forceOcr(false).ocr(ocrConfig).build();

		java.util.Map<String, Object> map = config.toMap();

		assertThat(map).containsKey("use_cache").containsKey("force_ocr");
	}

	@Test
	@DisplayName("should support builder method chaining")
	void shouldSupportBuilderChaining() {
		OcrConfig ocrConfig = OcrConfig.builder().backend("tesseract").build();
		ExtractionConfig config = ExtractionConfig.builder().useCache(false).enableQualityProcessing(true)
				.forceOcr(true).ocr(ocrConfig).build();

		assertThat(config.isUseCache()).isFalse();
		assertThat(config.isEnableQualityProcessing()).isTrue();
		assertThat(config.isForceOcr()).isTrue();
		assertNotNull(config.getOcr());
	}

	@Test
	@DisplayName("should handle nested configuration objects")
	void shouldHandleNestedConfigs() {
		OcrConfig ocrConfig = OcrConfig.builder().backend("tesseract").build();
		PdfConfig pdfConfig = PdfConfig.builder().extractImages(true).build();
		ExtractionConfig config = ExtractionConfig.builder().ocr(ocrConfig).pdfOptions(pdfConfig).build();

		assertNotNull(config.getOcr());
		assertNotNull(config.getPdfOptions());
		assertThat(config.getOcr().getBackend()).isEqualTo("tesseract");
		assertThat(config.getPdfOptions().isExtractImages()).isTrue();
	}

	@Test
	@DisplayName("should create independent builder instances")
	void shouldCreateIndependentBuilderInstances() {
		ExtractionConfig config1 = ExtractionConfig.builder().useCache(true).build();
		ExtractionConfig config2 = ExtractionConfig.builder().useCache(false).build();

		assertThat(config1.isUseCache()).isNotEqualTo(config2.isUseCache());
	}

	@Test
	@DisplayName("should handle optional sub-configurations")
	void shouldHandleOptionalConfigs() {
		ExtractionConfig config = ExtractionConfig.builder().build();

		assertNull(config.getOcr());
		assertNull(config.getChunking());
		assertNull(config.getLanguageDetection());
		assertNull(config.getPdfOptions());
		assertNull(config.getImageExtraction());
		assertNull(config.getImagePreprocessing());
		assertNull(config.getPostprocessor());
		assertNull(config.getTokenReduction());
		assertNull(config.getKeywords());
		assertNull(config.getPages());
	}
}
