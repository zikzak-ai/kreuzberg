"""Tests for OcrConfig configuration."""

from __future__ import annotations

from kreuzberg import ExtractionConfig, ImagePreprocessingConfig, OcrConfig, TesseractConfig


def test_ocr_config_default_construction() -> None:
    """OcrConfig should have sensible defaults."""
    config = OcrConfig()
    assert config.backend == "tesseract"
    assert config.language == "eng"
    assert config.tesseract_config is None


def test_ocr_config_custom_values() -> None:
    """OcrConfig should accept custom values."""
    config = OcrConfig(backend="easyocr", language="fra")
    assert config.backend == "easyocr"
    assert config.language == "fra"


def test_ocr_config_with_tesseract_backend() -> None:
    """OcrConfig should work with tesseract backend."""
    config = OcrConfig(backend="tesseract", language="deu")
    assert config.backend == "tesseract"
    assert config.language == "deu"


def test_ocr_config_with_easyocr_backend() -> None:
    """OcrConfig should work with easyocr backend."""
    config = OcrConfig(backend="easyocr", language="chi_sim")
    assert config.backend == "easyocr"
    assert config.language == "chi_sim"


def test_ocr_config_with_paddleocr_backend() -> None:
    """OcrConfig should work with paddleocr backend."""
    config = OcrConfig(backend="paddleocr", language="eng")
    assert config.backend == "paddleocr"
    assert config.language == "eng"


def test_ocr_config_with_tesseract_config() -> None:
    """OcrConfig should properly nest TesseractConfig."""
    tess_config = TesseractConfig(psm=6, oem=2)
    config = OcrConfig(tesseract_config=tess_config)
    assert config.tesseract_config is not None
    assert config.tesseract_config.psm == 6
    assert config.tesseract_config.oem == 2


def test_ocr_config_language_three_letter_code() -> None:
    """OcrConfig should accept three-letter language codes."""
    config = OcrConfig(language="eng")
    assert config.language == "eng"

    config = OcrConfig(language="deu")
    assert config.language == "deu"

    config = OcrConfig(language="fra")
    assert config.language == "fra"


def test_ocr_config_language_two_letter_code() -> None:
    """OcrConfig should accept two-letter language codes."""
    config = OcrConfig(language="en")
    assert config.language == "en"

    config = OcrConfig(language="de")
    assert config.language == "de"


def test_ocr_config_none_tesseract_config() -> None:
    """OcrConfig should handle None tesseract_config appropriately."""
    config = OcrConfig(tesseract_config=None)
    assert config.tesseract_config is None


def test_ocr_config_in_extraction_config() -> None:
    """ExtractionConfig should properly nest OcrConfig."""
    ocr = OcrConfig(backend="tesseract", language="eng")
    extraction = ExtractionConfig(ocr=ocr)
    assert extraction.ocr is not None
    assert extraction.ocr.backend == "tesseract"
    assert extraction.ocr.language == "eng"


def test_ocr_config_complex_language_combination() -> None:
    """OcrConfig should accept complex language combinations."""
    config = OcrConfig(language="eng+fra+deu")
    assert config.language == "eng+fra+deu"


def test_ocr_config_with_tesseract_and_preprocessing() -> None:
    """OcrConfig should work with TesseractConfig containing preprocessing."""
    tess = TesseractConfig(preprocessing=ImagePreprocessingConfig(denoise=True, contrast_enhance=True))
    config = OcrConfig(backend="tesseract", tesseract_config=tess)
    assert config.tesseract_config is not None
    assert config.tesseract_config.preprocessing is not None
    assert config.tesseract_config.preprocessing.denoise is True


def test_ocr_config_backend_case_sensitivity() -> None:
    """OcrConfig backend names should be case-sensitive strings."""
    config1 = OcrConfig(backend="tesseract")
    config2 = OcrConfig(backend="easyocr")
    assert config1.backend != config2.backend


def test_ocr_config_empty_language_string() -> None:
    """OcrConfig should accept empty language string."""
    config = OcrConfig(language="")
    assert config.language == ""


def test_ocr_config_special_characters_in_language() -> None:
    """OcrConfig should accept special characters in language."""
    config = OcrConfig(language="zh-Hans")
    assert config.language == "zh-Hans"


def test_ocr_config_with_all_parameters() -> None:
    """OcrConfig should work with all parameters specified."""
    tess = TesseractConfig(
        psm=3,
        oem=2,
        min_confidence=0.7,
        preprocessing=ImagePreprocessingConfig(denoise=True),
    )
    config = OcrConfig(
        backend="tesseract",
        language="eng",
        tesseract_config=tess,
    )

    assert config.backend == "tesseract"
    assert config.language == "eng"
    assert config.tesseract_config is not None
    assert config.tesseract_config.psm == 3
    assert config.tesseract_config.oem == 2
    assert config.tesseract_config.min_confidence == 0.7
