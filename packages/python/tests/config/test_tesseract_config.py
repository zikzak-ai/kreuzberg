"""Tests for TesseractConfig configuration."""

from __future__ import annotations

from kreuzberg import ImagePreprocessingConfig, OcrConfig, TesseractConfig


def test_tesseract_config_default_construction() -> None:
    """TesseractConfig should have sensible defaults."""
    config = TesseractConfig()
    assert config.language == "eng"
    assert config.psm == 3
    assert config.output_format == "markdown"
    assert config.oem == 3
    assert config.min_confidence == 0.0
    assert config.preprocessing is None
    assert config.enable_table_detection is True
    assert config.table_min_confidence == 0.0
    assert config.use_cache is True


def test_tesseract_config_custom_values() -> None:
    """TesseractConfig should accept custom values."""
    config = TesseractConfig(
        language="deu",
        psm=6,
        oem=2,
        min_confidence=0.7,
    )
    assert config.language == "deu"
    assert config.psm == 6
    assert config.oem == 2
    assert config.min_confidence == 0.7


def test_tesseract_config_psm_modes() -> None:
    """TesseractConfig should accept valid PSM values."""
    for psm in [0, 3, 6, 11]:
        config = TesseractConfig(psm=psm)
        assert config.psm == psm


def test_tesseract_config_oem_modes() -> None:
    """TesseractConfig should accept valid OEM values."""
    for oem in [0, 1, 2, 3]:
        config = TesseractConfig(oem=oem)
        assert config.oem == oem


def test_tesseract_config_with_preprocessing() -> None:
    """TesseractConfig should properly nest ImagePreprocessingConfig."""
    preprocessing = ImagePreprocessingConfig(denoise=True, contrast_enhance=True)
    config = TesseractConfig(preprocessing=preprocessing)
    assert config.preprocessing is not None
    assert config.preprocessing.denoise is True
    assert config.preprocessing.contrast_enhance is True


def test_tesseract_config_table_detection() -> None:
    """TesseractConfig should support table detection."""
    config = TesseractConfig(
        enable_table_detection=True,
        table_min_confidence=0.8,
        table_column_threshold=20,
        table_row_threshold_ratio=0.75,
    )
    assert config.enable_table_detection is True
    assert config.table_min_confidence == 0.8
    assert config.table_column_threshold == 20
    assert config.table_row_threshold_ratio == 0.75


def test_tesseract_config_char_whitelist() -> None:
    """TesseractConfig should support character whitelist."""
    config = TesseractConfig(tessedit_char_whitelist="0123456789")
    assert config.tessedit_char_whitelist == "0123456789"


def test_tesseract_config_char_blacklist() -> None:
    """TesseractConfig should support character blacklist."""
    config = TesseractConfig(tessedit_char_blacklist="@#$%")
    assert config.tessedit_char_blacklist == "@#$%"


def test_tesseract_config_dictionary_correction() -> None:
    """TesseractConfig should support dictionary correction."""
    config = TesseractConfig(tessedit_enable_dict_correction=True)
    assert config.tessedit_enable_dict_correction is True


def test_tesseract_config_language_model() -> None:
    """TesseractConfig should support language model settings."""
    config = TesseractConfig(language_model_ngram_on=False)
    assert config.language_model_ngram_on is False


def test_tesseract_config_multiple_languages() -> None:
    """TesseractConfig should support multiple language codes."""
    config = TesseractConfig(language="eng+fra+deu")
    assert config.language == "eng+fra+deu"


def test_tesseract_config_min_confidence_boundary_zero() -> None:
    """TesseractConfig should accept min_confidence of 0.0."""
    config = TesseractConfig(min_confidence=0.0)
    assert config.min_confidence == 0.0


def test_tesseract_config_min_confidence_boundary_one() -> None:
    """TesseractConfig should accept min_confidence of 1.0."""
    config = TesseractConfig(min_confidence=1.0)
    assert config.min_confidence == 1.0


def test_tesseract_config_table_min_confidence_mid_range() -> None:
    """TesseractConfig should accept table_min_confidence in mid-range."""
    config = TesseractConfig(table_min_confidence=0.65)
    assert config.table_min_confidence == 0.65


def test_tesseract_config_cache_control() -> None:
    """TesseractConfig should support cache control."""
    config = TesseractConfig(use_cache=False)
    assert config.use_cache is False


def test_tesseract_config_none_preprocessing() -> None:
    """TesseractConfig should handle None preprocessing appropriately."""
    config = TesseractConfig(preprocessing=None)
    assert config.preprocessing is None


def test_tesseract_config_in_ocr_config() -> None:
    """OcrConfig should properly nest TesseractConfig."""
    tess = TesseractConfig(psm=6, enable_table_detection=True)
    ocr = OcrConfig(backend="tesseract", tesseract_config=tess)
    assert ocr.tesseract_config is not None
    assert ocr.tesseract_config.psm == 6
    assert ocr.tesseract_config.enable_table_detection is True


def test_tesseract_config_word_rejection_settings() -> None:
    """TesseractConfig should support word rejection settings."""
    config = TesseractConfig(
        tessedit_dont_blkrej_good_wds=True,
        tessedit_dont_rowrej_good_wds=True,
    )
    assert config.tessedit_dont_blkrej_good_wds is True
    assert config.tessedit_dont_rowrej_good_wds is True


def test_tesseract_config_template_and_model_settings() -> None:
    """TesseractConfig should support template and model settings."""
    config = TesseractConfig(
        classify_use_pre_adapted_templates=True,
        tessedit_use_primary_params_model=True,
    )
    assert config.classify_use_pre_adapted_templates is True
    assert config.tessedit_use_primary_params_model is True


def test_tesseract_config_space_and_thresholding() -> None:
    """TesseractConfig should support space and thresholding settings."""
    config = TesseractConfig(
        textord_space_size_is_variable=True,
        thresholding_method=True,
    )
    assert config.textord_space_size_is_variable is True
    assert config.thresholding_method is True


def test_tesseract_config_output_formats() -> None:
    """TesseractConfig should support different output formats."""
    config = TesseractConfig(output_format="plaintext")
    assert config.output_format == "plaintext"


def test_tesseract_config_complex_preprocessing() -> None:
    """TesseractConfig should work with complex preprocessing."""
    preprocessing = ImagePreprocessingConfig(
        target_dpi=300,
        auto_rotate=True,
        deskew=True,
        denoise=True,
        contrast_enhance=True,
        binarization_method="otsu",
        invert_colors=False,
    )
    config = TesseractConfig(preprocessing=preprocessing)
    assert config.preprocessing is not None
    assert config.preprocessing.target_dpi == 300
    assert config.preprocessing.auto_rotate is True
    assert config.preprocessing.deskew is True
