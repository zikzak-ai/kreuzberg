"""Tests for ImageExtractionConfig configuration."""

from __future__ import annotations

from kreuzberg import ExtractionConfig, ImageExtractionConfig


def test_image_extraction_config_default_construction() -> None:
    """ImageExtractionConfig should have sensible defaults."""
    config = ImageExtractionConfig()
    assert config.extract_images is True
    assert config.target_dpi == 300
    assert config.max_image_dimension == 4096
    assert config.auto_adjust_dpi is True
    assert config.min_dpi == 72
    assert config.max_dpi == 600


def test_image_extraction_config_custom_values() -> None:
    """ImageExtractionConfig should accept custom values."""
    config = ImageExtractionConfig(
        extract_images=False,
        target_dpi=150,
        max_image_dimension=2048,
    )
    assert config.extract_images is False
    assert config.target_dpi == 150
    assert config.max_image_dimension == 2048


def test_image_extraction_config_disable_extraction() -> None:
    """ImageExtractionConfig should support disabling extraction."""
    config = ImageExtractionConfig(extract_images=False)
    assert config.extract_images is False


def test_image_extraction_config_dpi_settings() -> None:
    """ImageExtractionConfig should support DPI customization."""
    config = ImageExtractionConfig(
        target_dpi=600,
        min_dpi=100,
        max_dpi=1200,
    )
    assert config.target_dpi == 600
    assert config.min_dpi == 100
    assert config.max_dpi == 1200


def test_image_extraction_config_dimension_limits() -> None:
    """ImageExtractionConfig should support dimension limiting."""
    config = ImageExtractionConfig(max_image_dimension=1024)
    assert config.max_image_dimension == 1024


def test_image_extraction_config_auto_adjust_dpi() -> None:
    """ImageExtractionConfig should support auto DPI adjustment."""
    config = ImageExtractionConfig(auto_adjust_dpi=True)
    assert config.auto_adjust_dpi is True

    config = ImageExtractionConfig(auto_adjust_dpi=False)
    assert config.auto_adjust_dpi is False


def test_image_extraction_config_very_high_dpi() -> None:
    """ImageExtractionConfig should accept very high DPI values."""
    config = ImageExtractionConfig(target_dpi=1200, max_dpi=2400)
    assert config.target_dpi == 1200
    assert config.max_dpi == 2400


def test_image_extraction_config_very_low_dpi() -> None:
    """ImageExtractionConfig should accept very low DPI values."""
    config = ImageExtractionConfig(target_dpi=72, min_dpi=36)
    assert config.target_dpi == 72
    assert config.min_dpi == 36


def test_image_extraction_config_large_dimension() -> None:
    """ImageExtractionConfig should accept large image dimensions."""
    config = ImageExtractionConfig(max_image_dimension=8192)
    assert config.max_image_dimension == 8192


def test_image_extraction_config_small_dimension() -> None:
    """ImageExtractionConfig should accept small image dimensions."""
    config = ImageExtractionConfig(max_image_dimension=256)
    assert config.max_image_dimension == 256


def test_image_extraction_config_in_extraction_config() -> None:
    """ExtractionConfig should properly nest ImageExtractionConfig."""
    images = ImageExtractionConfig(extract_images=True, target_dpi=300)
    extraction = ExtractionConfig(images=images)
    assert extraction.images is not None
    assert extraction.images.extract_images is True
    assert extraction.images.target_dpi == 300


def test_image_extraction_config_high_quality_settings() -> None:
    """ImageExtractionConfig should support high-quality settings."""
    config = ImageExtractionConfig(
        extract_images=True,
        target_dpi=600,
        max_image_dimension=8192,
        auto_adjust_dpi=False,
        min_dpi=200,
        max_dpi=2000,
    )
    assert config.target_dpi == 600
    assert config.max_image_dimension == 8192
    assert config.auto_adjust_dpi is False
    assert config.min_dpi == 200
    assert config.max_dpi == 2000


def test_image_extraction_config_low_quality_settings() -> None:
    """ImageExtractionConfig should support low-quality settings."""
    config = ImageExtractionConfig(
        extract_images=True,
        target_dpi=100,
        max_image_dimension=512,
        auto_adjust_dpi=True,
        min_dpi=50,
        max_dpi=150,
    )
    assert config.target_dpi == 100
    assert config.max_image_dimension == 512
    assert config.min_dpi == 50
    assert config.max_dpi == 150


def test_image_extraction_config_min_dpi_greater_than_max() -> None:
    """ImageExtractionConfig should accept min_dpi > max_dpi (edge case)."""
    config = ImageExtractionConfig(min_dpi=600, max_dpi=300)
    assert config.min_dpi == 600
    assert config.max_dpi == 300


def test_image_extraction_config_equal_min_max_dpi() -> None:
    """ImageExtractionConfig should accept equal min and max DPI."""
    config = ImageExtractionConfig(min_dpi=300, max_dpi=300)
    assert config.min_dpi == config.max_dpi


def test_image_extraction_config_all_parameters() -> None:
    """ImageExtractionConfig should work with all parameters specified."""
    config = ImageExtractionConfig(
        extract_images=True,
        target_dpi=300,
        max_image_dimension=4096,
        auto_adjust_dpi=True,
        min_dpi=72,
        max_dpi=600,
    )

    assert config.extract_images is True
    assert config.target_dpi == 300
    assert config.max_image_dimension == 4096
    assert config.auto_adjust_dpi is True
    assert config.min_dpi == 72
    assert config.max_dpi == 600


def test_image_extraction_config_boundary_dimension() -> None:
    """ImageExtractionConfig should accept boundary dimension values."""
    config = ImageExtractionConfig(max_image_dimension=1)
    assert config.max_image_dimension == 1

    config = ImageExtractionConfig(max_image_dimension=65536)
    assert config.max_image_dimension == 65536


def test_image_extraction_config_realistic_pdf_scenario() -> None:
    """ImageExtractionConfig should support realistic PDF scenario."""
    config = ImageExtractionConfig(
        extract_images=True,
        target_dpi=300,
        max_image_dimension=4096,
        auto_adjust_dpi=True,
    )

    assert config.extract_images is True
    assert config.target_dpi == 300
    assert config.max_image_dimension == 4096
