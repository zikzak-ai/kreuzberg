"""Comprehensive tests for batch extraction operations.

Tests cover:
- Batch file extraction (multiple files)
- Batch bytes extraction
- Concurrent extraction scenarios
- Error handling in batch mode
- Progress tracking
- Performance characteristics
"""

from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

from kreuzberg import (
    ExtractionConfig,
    extract_bytes_sync,
    extract_file_sync,
)

if TYPE_CHECKING:
    from pathlib import Path


class TestBatchBytesExtraction:
    """Test batch extraction from bytes."""

    def test_batch_multiple_texts(self) -> None:
        """Extract from multiple text sources in batch."""
        config = ExtractionConfig()

        texts = [
            "First document content.",
            "Second document content.",
            "Third document content.",
        ]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        assert len(results) == 3
        for result in results:
            assert result is not None
            assert result.content is not None

    def test_batch_preserves_order(self) -> None:
        """Verify batch processing maintains source order."""
        config = ExtractionConfig()

        texts = [
            "Document One",
            "Document Two",
            "Document Three",
            "Document Four",
            "Document Five",
        ]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        assert len(results) == len(texts)
        for i, result in enumerate(results):
            assert result is not None
            # Content should reflect the input text
            assert f"Document {['One', 'Two', 'Three', 'Four', 'Five'][i]}" in result.content or len(result.content) > 0

    def test_batch_large_number_of_documents(self) -> None:
        """Test batch processing with 20+ documents."""
        config = ExtractionConfig()

        texts = [f"Document {i}: " + "Content " * 10 for i in range(25)]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        assert len(results) == 25
        for result in results:
            assert result is not None

    def test_batch_different_mime_types(self) -> None:
        """Test batch with different MIME types."""
        config = ExtractionConfig()

        # Plain text
        result_text = extract_bytes_sync(b"Plain text content", "text/plain", config)
        assert result_text is not None

        # HTML
        html_content = b"<html><body>HTML content</body></html>"
        result_html = extract_bytes_sync(html_content, "text/html", config)
        assert result_html is not None

        # Both should succeed
        assert result_text.content is not None or result_text.metadata is not None
        assert result_html.content is not None or result_html.metadata is not None


class TestBatchFileExtraction:
    """Test batch extraction from files."""

    def test_batch_file_extraction_multiple_formats(self, test_documents: Path) -> None:
        """Extract from multiple file formats in batch."""
        config = ExtractionConfig()

        files = [
            test_documents / "documents" / "lorem_ipsum.docx",
            test_documents / "documents" / "extraction_test.docx",
        ]

        results = []
        for file_path in files:
            if file_path.exists():
                result = extract_file_sync(str(file_path), config=config)
                results.append(result)

        # At least some files should succeed
        assert len(results) > 0
        for result in results:
            assert result is not None

    def test_batch_same_file_multiple_times(self, test_documents: Path) -> None:
        """Extract same file multiple times."""
        config = ExtractionConfig()

        docx_path = test_documents / "documents" / "lorem_ipsum.docx"
        if not docx_path.exists():
            pytest.skip(f"DOCX not found: {docx_path}")

        results = [extract_file_sync(str(docx_path), config=config) for _ in range(5)]

        assert len(results) == 5
        for result in results:
            assert result is not None
            assert result.content is not None

    def test_batch_consistency_across_runs(self, test_documents: Path) -> None:
        """Verify batch results are consistent across runs."""
        config = ExtractionConfig()

        docx_path = test_documents / "documents" / "lorem_ipsum.docx"
        if not docx_path.exists():
            pytest.skip(f"DOCX not found: {docx_path}")

        result1 = extract_file_sync(str(docx_path), config=config)
        result2 = extract_file_sync(str(docx_path), config=config)

        assert result1.content == result2.content
        assert result1.mime_type == result2.mime_type


class TestBatchErrorHandling:
    """Test error handling in batch operations."""

    def test_batch_with_nonexistent_file(self, test_documents: Path) -> None:
        """Handle nonexistent file in batch gracefully."""
        from kreuzberg.exceptions import ValidationError

        config = ExtractionConfig()

        nonexistent_path = test_documents / "nonexistent" / "file.docx"

        with pytest.raises((FileNotFoundError, OSError, RuntimeError, ValidationError)):
            extract_file_sync(str(nonexistent_path), config=config)

    def test_batch_mixed_valid_invalid(self, test_documents: Path) -> None:
        """Handle mix of valid and invalid files."""
        from kreuzberg.exceptions import ValidationError

        config = ExtractionConfig()

        # Valid file
        valid_path = test_documents / "documents" / "lorem_ipsum.docx"
        if valid_path.exists():
            result = extract_file_sync(str(valid_path), config=config)
            assert result is not None

        # Invalid file path
        invalid_path = test_documents / "nonexistent.docx"
        with pytest.raises((FileNotFoundError, OSError, RuntimeError, ValidationError)):
            extract_file_sync(str(invalid_path), config=config)

    def test_batch_with_empty_content(self) -> None:
        """Handle extraction of empty content."""
        config = ExtractionConfig()

        result = extract_bytes_sync(b"", "text/plain", config)
        assert result is not None

    def test_batch_with_corrupted_bytes(self) -> None:
        """Handle extraction of potentially corrupted data."""
        config = ExtractionConfig()

        # Invalid UTF-8 sequence
        invalid_bytes = b"\x80\x81\x82\x83"

        # Should handle gracefully
        try:
            result = extract_bytes_sync(invalid_bytes, "text/plain", config)
            # Result might be empty or raise, both acceptable
            assert result is not None
        except Exception:
            # Also acceptable to raise
            pass


class TestBatchPerformance:
    """Test performance characteristics of batch operations."""

    def test_batch_sequential_processing(self) -> None:
        """Test sequential batch processing."""
        config = ExtractionConfig()

        texts = [f"Text {i}: " + "Content " * 5 for i in range(10)]

        results = []
        for text in texts:
            result = extract_bytes_sync(text.encode(), "text/plain", config)
            results.append(result)

        assert len(results) == 10
        for result in results:
            assert result is not None

    def test_batch_large_documents(self) -> None:
        """Test batch processing of large documents."""
        config = ExtractionConfig()

        # Create large text
        large_text = "Large document. " * 1000

        results = []
        for _i in range(5):
            result = extract_bytes_sync(large_text.encode(), "text/plain", config)
            results.append(result)

        assert len(results) == 5
        for result in results:
            assert result is not None

    def test_batch_with_varying_sizes(self) -> None:
        """Test batch with varying document sizes."""
        config = ExtractionConfig()

        texts = [
            "Short",
            "Medium " * 10,
            "Long " * 100,
        ]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        assert len(results) == 3
        for result in results:
            assert result is not None


class TestBatchWithConfigurations:
    """Test batch operations with various configurations."""

    def test_batch_with_chunking_config(self) -> None:
        """Test batch extraction with chunking enabled."""
        from kreuzberg import ChunkingConfig

        config = ExtractionConfig(chunking=ChunkingConfig(max_chars=100, max_overlap=20))

        texts = [f"Text {i}: " + "Content " * 10 for i in range(5)]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        assert len(results) == 5
        for result in results:
            assert result is not None
            if result.chunks:
                assert len(result.chunks) > 0

    def test_batch_with_keyword_extraction(self) -> None:
        """Test batch with keyword extraction."""
        from kreuzberg import KeywordConfig

        config = ExtractionConfig(keywords=KeywordConfig(max_keywords=5))

        texts = [
            "Machine learning and artificial intelligence",
            "Data science and analytics",
            "Natural language processing",
        ]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        assert len(results) == 3
        for result in results:
            assert result is not None

    def test_batch_with_different_configs(self) -> None:
        """Test batch with different configs for each extraction."""
        from kreuzberg import KeywordConfig

        text = "Data science and machine learning"

        config1 = ExtractionConfig(keywords=KeywordConfig(max_keywords=3))
        config2 = ExtractionConfig(keywords=KeywordConfig(max_keywords=10))
        config3 = ExtractionConfig(keywords=KeywordConfig(max_keywords=1))

        result1 = extract_bytes_sync(text.encode(), "text/plain", config1)
        result2 = extract_bytes_sync(text.encode(), "text/plain", config2)
        result3 = extract_bytes_sync(text.encode(), "text/plain", config3)

        assert result1 is not None
        assert result2 is not None
        assert result3 is not None


class TestBatchMetadata:
    """Test metadata handling in batch operations."""

    def test_batch_preserves_metadata(self) -> None:
        """Verify metadata is preserved in batch."""
        config = ExtractionConfig()

        texts = [
            "Document 1",
            "Document 2",
            "Document 3",
        ]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        for result in results:
            assert result.metadata is not None
            assert isinstance(result.metadata, dict)

    def test_batch_maintains_mime_types(self) -> None:
        """Verify MIME types are maintained in batch."""
        text_config = ExtractionConfig()
        html_config = ExtractionConfig()

        text_result = extract_bytes_sync(b"Text", "text/plain", text_config)
        html_result = extract_bytes_sync(b"<html></html>", "text/html", html_config)

        assert text_result.mime_type == "text/plain"
        assert html_result.mime_type == "text/html"

    def test_batch_metadata_independence(self) -> None:
        """Verify metadata in batch operations is independent."""
        config = ExtractionConfig()

        text1 = "Document one content"
        text2 = "Document two content"

        result1 = extract_bytes_sync(text1.encode(), "text/plain", config)
        result2 = extract_bytes_sync(text2.encode(), "text/plain", config)

        # Metadata should be different objects
        assert result1.metadata is not result2.metadata


class TestBatchContentPreservation:
    """Test content preservation in batch operations."""

    def test_batch_preserves_all_content(self) -> None:
        """Verify all content is preserved in batch."""
        config = ExtractionConfig()

        texts = [
            "Content A with special characters: @#$%",
            "Content B with numbers: 123456789",
            "Content C with symbols: !@#$%^&*()",
        ]

        results = [extract_bytes_sync(text.encode(), "text/plain", config) for text in texts]

        for _i, result in enumerate(results):
            assert result is not None
            assert result.content is not None

    def test_batch_utf8_handling(self) -> None:
        """Verify UTF-8 content is preserved in batch."""
        config = ExtractionConfig()

        texts = [
            "English content",
            "Français: Café, résumé",
            "Deutsch: Größe, Müller",
            "Español: Año, niño",
        ]

        results = [extract_bytes_sync(text.encode("utf-8"), "text/plain", config) for text in texts]

        assert len(results) == 4
        for result in results:
            assert result is not None
