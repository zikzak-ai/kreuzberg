"""Tests for ImagePreprocessingConfig configuration."""

from __future__ import annotations

from kreuzberg import ImagePreprocessingConfig, TesseractConfig


def test_image_preprocessing_config_default_construction() -> None:
    """ImagePreprocessingConfig should have sensible defaults."""
    config = ImagePreprocessingConfig()
    assert config.target_dpi == 300
    assert config.auto_rotate is True
    assert config.deskew is True
    assert config.denoise is False
    assert config.contrast_enhance is False
    assert config.binarization_method == "otsu"
    assert config.invert_colors is False
    # Verify all expected attributes exist
    assert hasattr(config, "target_dpi")
    assert hasattr(config, "auto_rotate")


def test_image_preprocessing_config_custom_values() -> None:
    """ImagePreprocessingConfig should accept custom values."""
    config = ImagePreprocessingConfig(
        target_dpi=150,
        auto_rotate=True,
        deskew=True,
        denoise=True,
    )
    assert config.target_dpi == 150
    assert config.auto_rotate is True
    assert config.deskew is True
    assert config.denoise is True


def test_image_preprocessing_config_dpi_settings() -> None:
    """ImagePreprocessingConfig should support various DPI settings."""
    for dpi in [72, 150, 300, 600, 1200]:
        config = ImagePreprocessingConfig(target_dpi=dpi)
        assert config.target_dpi == dpi


def test_image_preprocessing_config_rotation() -> None:
    """ImagePreprocessingConfig should support auto-rotation."""
    config = ImagePreprocessingConfig(auto_rotate=True)
    assert config.auto_rotate is True

    config = ImagePreprocessingConfig(auto_rotate=False)
    assert config.auto_rotate is False


def test_image_preprocessing_config_deskew() -> None:
    """ImagePreprocessingConfig should support deskewing."""
    config = ImagePreprocessingConfig(deskew=True)
    assert config.deskew is True


def test_image_preprocessing_config_denoise() -> None:
    """ImagePreprocessingConfig should support denoising."""
    config = ImagePreprocessingConfig(denoise=True)
    assert config.denoise is True


def test_image_preprocessing_config_contrast_enhancement() -> None:
    """ImagePreprocessingConfig should support contrast enhancement."""
    config = ImagePreprocessingConfig(contrast_enhance=True)
    assert config.contrast_enhance is True


def test_image_preprocessing_config_binarization_methods() -> None:
    """ImagePreprocessingConfig should support various binarization methods."""
    methods = ["auto", "otsu", "adaptive", "threshold"]
    for method in methods:
        config = ImagePreprocessingConfig(binarization_method=method)
        assert config.binarization_method == method


def test_image_preprocessing_config_color_inversion() -> None:
    """ImagePreprocessingConfig should support color inversion."""
    config = ImagePreprocessingConfig(invert_colors=True)
    assert config.invert_colors is True

    config = ImagePreprocessingConfig(invert_colors=False)
    assert config.invert_colors is False


def test_image_preprocessing_config_aggressive_preprocessing() -> None:
    """ImagePreprocessingConfig should support aggressive preprocessing."""
    config = ImagePreprocessingConfig(
        target_dpi=300,
        auto_rotate=True,
        deskew=True,
        denoise=True,
        contrast_enhance=True,
        binarization_method="otsu",
        invert_colors=False,
    )
    assert config.auto_rotate is True
    assert config.deskew is True
    assert config.denoise is True
    assert config.contrast_enhance is True
    assert config.binarization_method == "otsu"


def test_image_preprocessing_config_minimal_preprocessing() -> None:
    """ImagePreprocessingConfig should support minimal preprocessing."""
    config = ImagePreprocessingConfig(
        target_dpi=300,
        auto_rotate=False,
        deskew=False,
        denoise=False,
        contrast_enhance=False,
        binarization_method="auto",
    )
    assert config.auto_rotate is False
    assert config.deskew is False
    assert config.denoise is False
    assert config.contrast_enhance is False


def test_image_preprocessing_config_in_tesseract_config() -> None:
    """TesseractConfig should properly nest ImagePreprocessingConfig."""
    preprocessing = ImagePreprocessingConfig(denoise=True, contrast_enhance=True)
    tess = TesseractConfig(preprocessing=preprocessing)
    assert tess.preprocessing is not None
    assert tess.preprocessing.denoise is True
    assert tess.preprocessing.contrast_enhance is True


def test_image_preprocessing_config_high_dpi() -> None:
    """ImagePreprocessingConfig should accept high DPI values."""
    config = ImagePreprocessingConfig(target_dpi=2400)
    assert config.target_dpi == 2400


def test_image_preprocessing_config_very_low_dpi() -> None:
    """ImagePreprocessingConfig should accept very low DPI values."""
    config = ImagePreprocessingConfig(target_dpi=36)
    assert config.target_dpi == 36


def test_image_preprocessing_config_all_filters_enabled() -> None:
    """ImagePreprocessingConfig should work with all filters enabled."""
    config = ImagePreprocessingConfig(
        target_dpi=300,
        auto_rotate=True,
        deskew=True,
        denoise=True,
        contrast_enhance=True,
        binarization_method="adaptive",
        invert_colors=True,
    )

    assert config.target_dpi == 300
    assert config.auto_rotate is True
    assert config.deskew is True
    assert config.denoise is True
    assert config.contrast_enhance is True
    assert config.binarization_method == "adaptive"
    assert config.invert_colors is True


def test_image_preprocessing_config_custom_binarization_method() -> None:
    """ImagePreprocessingConfig should accept custom binarization methods."""
    config = ImagePreprocessingConfig(binarization_method="custom_method")
    assert config.binarization_method == "custom_method"


def test_image_preprocessing_config_empty_binarization_method() -> None:
    """ImagePreprocessingConfig should accept empty binarization method."""
    config = ImagePreprocessingConfig(binarization_method="")
    assert config.binarization_method == ""


def test_image_preprocessing_config_realistic_low_quality_scan() -> None:
    """ImagePreprocessingConfig should support low-quality scan scenario."""
    config = ImagePreprocessingConfig(
        target_dpi=300,
        auto_rotate=True,
        deskew=True,
        denoise=True,
        contrast_enhance=True,
        binarization_method="otsu",
    )

    assert config.auto_rotate is True
    assert config.deskew is True
    assert config.denoise is True
    assert config.contrast_enhance is True


def test_image_preprocessing_config_realistic_hd_scan() -> None:
    """ImagePreprocessingConfig should support high-quality scan scenario."""
    config = ImagePreprocessingConfig(
        target_dpi=600,
        auto_rotate=False,
        deskew=False,
        denoise=False,
        contrast_enhance=False,
    )

    assert config.target_dpi == 600
    assert config.auto_rotate is False
