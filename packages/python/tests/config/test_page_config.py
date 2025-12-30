"""Tests for PageConfig configuration."""

from __future__ import annotations

from kreuzberg import ExtractionConfig, PageConfig


def test_page_config_default_construction() -> None:
    """PageConfig should have sensible defaults."""
    config = PageConfig()
    assert config.extract_pages is False
    assert config.insert_page_markers is False
    assert config.marker_format == "\n\n<!-- PAGE {page_num} -->\n\n"


def test_page_config_custom_values() -> None:
    """PageConfig should accept custom values."""
    config = PageConfig(
        extract_pages=True,
        insert_page_markers=True,
    )
    assert config.extract_pages is True
    assert config.insert_page_markers is True


def test_page_config_page_extraction_enabled() -> None:
    """PageConfig should support page extraction."""
    config = PageConfig(extract_pages=True)
    assert config.extract_pages is True


def test_page_config_page_extraction_disabled() -> None:
    """PageConfig should support disabling page extraction."""
    config = PageConfig(extract_pages=False)
    assert config.extract_pages is False


def test_page_config_page_markers_enabled() -> None:
    """PageConfig should support page marker insertion."""
    config = PageConfig(insert_page_markers=True)
    assert config.insert_page_markers is True


def test_page_config_page_markers_disabled() -> None:
    """PageConfig should support disabling page markers."""
    config = PageConfig(insert_page_markers=False)
    assert config.insert_page_markers is False


def test_page_config_custom_marker_format() -> None:
    """PageConfig should support custom marker formats."""
    config = PageConfig(marker_format="==== PAGE {page_num} ====")
    assert config.marker_format == "==== PAGE {page_num} ===="


def test_page_config_marker_format_variations() -> None:
    """PageConfig should support various marker format variations."""
    formats = [
        "--- PAGE {page_num} ---",
        "\\nPAGE: {page_num}\\n",
        "[PAGE {page_num}]",
        "## Page {page_num}",
    ]
    for fmt in formats:
        config = PageConfig(marker_format=fmt)
        assert config.marker_format == fmt


def test_page_config_marker_format_without_placeholder() -> None:
    """PageConfig should accept marker format without placeholder."""
    config = PageConfig(marker_format="=== PAGE BREAK ===")
    assert config.marker_format == "=== PAGE BREAK ==="


def test_page_config_empty_marker_format() -> None:
    """PageConfig should accept empty marker format."""
    config = PageConfig(marker_format="")
    assert config.marker_format == ""


def test_page_config_both_extraction_and_markers() -> None:
    """PageConfig should support both extraction and markers."""
    config = PageConfig(
        extract_pages=True,
        insert_page_markers=True,
    )
    assert config.extract_pages is True
    assert config.insert_page_markers is True


def test_page_config_extraction_without_markers() -> None:
    """PageConfig should support extraction without markers."""
    config = PageConfig(
        extract_pages=True,
        insert_page_markers=False,
    )
    assert config.extract_pages is True
    assert config.insert_page_markers is False


def test_page_config_markers_without_extraction() -> None:
    """PageConfig should support markers without extraction."""
    config = PageConfig(
        extract_pages=False,
        insert_page_markers=True,
    )
    assert config.extract_pages is False
    assert config.insert_page_markers is True


def test_page_config_in_extraction_config() -> None:
    """ExtractionConfig should properly nest PageConfig."""
    pages = PageConfig(extract_pages=True)
    extraction = ExtractionConfig(pages=pages)
    assert extraction.pages is not None
    assert extraction.pages.extract_pages is True


def test_page_config_with_custom_marker_in_extraction() -> None:
    """ExtractionConfig should properly nest PageConfig with custom markers."""
    pages = PageConfig(
        extract_pages=True,
        insert_page_markers=True,
        marker_format="[PAGE {page_num}]",
    )
    extraction = ExtractionConfig(pages=pages)
    assert extraction.pages is not None
    assert extraction.pages.marker_format == "[PAGE {page_num}]"


def test_page_config_multiline_marker_format() -> None:
    """PageConfig should support multiline marker formats."""
    config = PageConfig(marker_format="\n\n=== PAGE {page_num} ===\n\n")
    assert "\n" in config.marker_format
    assert "{page_num}" in config.marker_format


def test_page_config_special_characters_in_marker() -> None:
    """PageConfig should support special characters in marker."""
    config = PageConfig(marker_format="⟶ PAGE {page_num} ⟵")
    assert config.marker_format == "⟶ PAGE {page_num} ⟵"


def test_page_config_markdown_style_marker() -> None:
    """PageConfig should support markdown-style markers."""
    config = PageConfig(marker_format="# Page {page_num}")
    assert config.marker_format == "# Page {page_num}"


def test_page_config_html_style_marker() -> None:
    """PageConfig should support HTML-style markers."""
    config = PageConfig(marker_format="<!-- PAGE {page_num} -->")
    assert config.marker_format == "<!-- PAGE {page_num} -->"


def test_page_config_all_parameters() -> None:
    """PageConfig should work with all parameters specified."""
    config = PageConfig(
        extract_pages=True,
        insert_page_markers=True,
        marker_format="\n\n[PAGE {page_num}]\n\n",
    )

    assert config.extract_pages is True
    assert config.insert_page_markers is True
    assert config.marker_format == "\n\n[PAGE {page_num}]\n\n"


def test_page_config_realistic_pdf_scenario() -> None:
    """PageConfig should support realistic PDF extraction scenario."""
    config = PageConfig(
        extract_pages=True,
        insert_page_markers=True,
        marker_format="\n\n<!-- PAGE {page_num} -->\n\n",
    )

    assert config.extract_pages is True
    assert config.insert_page_markers is True
    assert "{page_num}" in config.marker_format
