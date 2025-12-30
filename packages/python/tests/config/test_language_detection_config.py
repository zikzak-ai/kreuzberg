"""Tests for LanguageDetectionConfig configuration."""

from __future__ import annotations

from kreuzberg import ExtractionConfig, LanguageDetectionConfig


def test_language_detection_config_default_construction() -> None:
    """LanguageDetectionConfig should have sensible defaults."""
    config = LanguageDetectionConfig()
    assert config.enabled is True
    assert config.min_confidence == 0.8
    assert config.detect_multiple is False


def test_language_detection_config_custom_values() -> None:
    """LanguageDetectionConfig should accept custom values."""
    config = LanguageDetectionConfig(
        enabled=False,
        min_confidence=0.9,
        detect_multiple=True,
    )
    assert config.enabled is False
    assert config.min_confidence == 0.9
    assert config.detect_multiple is True


def test_language_detection_config_enabled() -> None:
    """LanguageDetectionConfig should support enabling/disabling."""
    config = LanguageDetectionConfig(enabled=True)
    assert config.enabled is True

    config = LanguageDetectionConfig(enabled=False)
    assert config.enabled is False


def test_language_detection_config_min_confidence_zero() -> None:
    """LanguageDetectionConfig should accept min_confidence of 0.0."""
    config = LanguageDetectionConfig(min_confidence=0.0)
    assert config.min_confidence == 0.0


def test_language_detection_config_min_confidence_mid_range() -> None:
    """LanguageDetectionConfig should accept mid-range confidence."""
    config = LanguageDetectionConfig(min_confidence=0.5)
    assert config.min_confidence == 0.5


def test_language_detection_config_min_confidence_high() -> None:
    """LanguageDetectionConfig should accept high confidence."""
    config = LanguageDetectionConfig(min_confidence=0.95)
    assert config.min_confidence == 0.95


def test_language_detection_config_min_confidence_one() -> None:
    """LanguageDetectionConfig should accept min_confidence of 1.0."""
    config = LanguageDetectionConfig(min_confidence=1.0)
    assert config.min_confidence == 1.0


def test_language_detection_config_detect_single_language() -> None:
    """LanguageDetectionConfig should support single language detection."""
    config = LanguageDetectionConfig(detect_multiple=False)
    assert config.detect_multiple is False


def test_language_detection_config_detect_multiple_languages() -> None:
    """LanguageDetectionConfig should support multiple language detection."""
    config = LanguageDetectionConfig(detect_multiple=True)
    assert config.detect_multiple is True


def test_language_detection_config_disabled() -> None:
    """LanguageDetectionConfig should support complete disabling."""
    config = LanguageDetectionConfig(enabled=False)
    assert config.enabled is False


def test_language_detection_config_enabled_strict() -> None:
    """LanguageDetectionConfig should support strict detection."""
    config = LanguageDetectionConfig(
        enabled=True,
        min_confidence=0.95,
        detect_multiple=False,
    )
    assert config.enabled is True
    assert config.min_confidence == 0.95
    assert config.detect_multiple is False


def test_language_detection_config_enabled_lenient() -> None:
    """LanguageDetectionConfig should support lenient detection."""
    config = LanguageDetectionConfig(
        enabled=True,
        min_confidence=0.5,
        detect_multiple=True,
    )
    assert config.enabled is True
    assert config.min_confidence == 0.5
    assert config.detect_multiple is True


def test_language_detection_config_in_extraction_config() -> None:
    """ExtractionConfig should properly nest LanguageDetectionConfig."""
    lang_detect = LanguageDetectionConfig(enabled=True, min_confidence=0.9)
    extraction = ExtractionConfig(language_detection=lang_detect)
    assert extraction.language_detection is not None
    assert extraction.language_detection.enabled is True
    assert extraction.language_detection.min_confidence == 0.9


def test_language_detection_config_multilingual_scenario() -> None:
    """LanguageDetectionConfig should support multilingual documents."""
    config = LanguageDetectionConfig(
        enabled=True,
        min_confidence=0.7,
        detect_multiple=True,
    )
    assert config.enabled is True
    assert config.detect_multiple is True
    assert config.min_confidence == 0.7


def test_language_detection_config_single_language_strict() -> None:
    """LanguageDetectionConfig should support single language strict mode."""
    config = LanguageDetectionConfig(
        enabled=True,
        min_confidence=0.9,
        detect_multiple=False,
    )
    assert config.detect_multiple is False
    assert config.min_confidence == 0.9


def test_language_detection_config_various_confidence_levels() -> None:
    """LanguageDetectionConfig should accept various confidence levels."""
    for conf in [0.0, 0.25, 0.5, 0.75, 1.0]:
        config = LanguageDetectionConfig(min_confidence=conf)
        assert config.min_confidence == conf


def test_language_detection_config_edge_case_very_low_confidence() -> None:
    """LanguageDetectionConfig should accept very low confidence."""
    config = LanguageDetectionConfig(min_confidence=0.01)
    assert config.min_confidence == 0.01


def test_language_detection_config_edge_case_near_one() -> None:
    """LanguageDetectionConfig should accept confidence near 1.0."""
    config = LanguageDetectionConfig(min_confidence=0.99)
    assert config.min_confidence == 0.99


def test_language_detection_config_all_parameters() -> None:
    """LanguageDetectionConfig should work with all parameters specified."""
    config = LanguageDetectionConfig(
        enabled=True,
        min_confidence=0.8,
        detect_multiple=True,
    )

    assert config.enabled is True
    assert config.min_confidence == 0.8
    assert config.detect_multiple is True


def test_language_detection_config_realistic_multilingual_doc() -> None:
    """LanguageDetectionConfig should support realistic multilingual scenario."""
    config = LanguageDetectionConfig(
        enabled=True,
        min_confidence=0.7,
        detect_multiple=True,
    )

    assert config.enabled is True
    assert config.min_confidence == 0.7
    assert config.detect_multiple is True
