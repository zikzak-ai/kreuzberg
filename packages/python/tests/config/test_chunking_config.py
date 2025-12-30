"""Tests for ChunkingConfig configuration."""

from __future__ import annotations

from kreuzberg import ChunkingConfig, EmbeddingConfig, EmbeddingModelType, ExtractionConfig


def test_chunking_config_default_construction() -> None:
    """ChunkingConfig should have sensible defaults."""
    config = ChunkingConfig()
    assert config.max_chars == 1000
    assert config.max_overlap == 200
    assert config.embedding is None
    assert config.preset is None


def test_chunking_config_custom_values() -> None:
    """ChunkingConfig should accept custom values."""
    config = ChunkingConfig(max_chars=512, max_overlap=100)
    assert config.max_chars == 512
    assert config.max_overlap == 100


def test_chunking_config_large_chunk_size() -> None:
    """ChunkingConfig should accept large chunk sizes."""
    config = ChunkingConfig(max_chars=10000)
    assert config.max_chars == 10000


def test_chunking_config_small_chunk_size() -> None:
    """ChunkingConfig should accept small chunk sizes."""
    config = ChunkingConfig(max_chars=100)
    assert config.max_chars == 100


def test_chunking_config_zero_overlap() -> None:
    """ChunkingConfig should accept zero overlap."""
    config = ChunkingConfig(max_overlap=0)
    assert config.max_overlap == 0


def test_chunking_config_large_overlap() -> None:
    """ChunkingConfig should accept large overlap."""
    config = ChunkingConfig(max_chars=1000, max_overlap=500)
    assert config.max_overlap == 500


def test_chunking_config_with_embedding() -> None:
    """ChunkingConfig should properly nest EmbeddingConfig."""
    embedding = EmbeddingConfig()
    config = ChunkingConfig(embedding=embedding)
    assert config.embedding is not None
    assert config.embedding.normalize is True


def test_chunking_config_with_custom_embedding() -> None:
    """ChunkingConfig should work with custom EmbeddingConfig."""
    embedding = EmbeddingConfig(
        model=EmbeddingModelType.preset("compact"),
        normalize=False,
        batch_size=64,
    )
    config = ChunkingConfig(embedding=embedding)
    assert config.embedding is not None
    assert config.embedding.normalize is False
    assert config.embedding.batch_size == 64


def test_chunking_config_none_embedding() -> None:
    """ChunkingConfig should handle None embedding appropriately."""
    config = ChunkingConfig(embedding=None)
    assert config.embedding is None


def test_chunking_config_preset_parameter() -> None:
    """ChunkingConfig should accept preset parameter."""
    config = ChunkingConfig(preset="semantic")
    assert config.preset == "semantic"


def test_chunking_config_preset_none() -> None:
    """ChunkingConfig should handle None preset appropriately."""
    config = ChunkingConfig(preset=None)
    assert config.preset is None


def test_chunking_config_in_extraction_config() -> None:
    """ExtractionConfig should properly nest ChunkingConfig."""
    chunking = ChunkingConfig(max_chars=512, max_overlap=100)
    extraction = ExtractionConfig(chunking=chunking)
    assert extraction.chunking is not None
    assert extraction.chunking.max_chars == 512
    assert extraction.chunking.max_overlap == 100


def test_chunking_config_overlap_greater_than_chunk() -> None:
    """ChunkingConfig should accept overlap greater than chunk size."""
    config = ChunkingConfig(max_chars=100, max_overlap=150)
    assert config.max_overlap == 150


def test_chunking_config_equal_overlap_and_chunk() -> None:
    """ChunkingConfig should accept overlap equal to chunk size."""
    config = ChunkingConfig(max_chars=500, max_overlap=500)
    assert config.max_chars == config.max_overlap


def test_chunking_config_very_large_numbers() -> None:
    """ChunkingConfig should accept very large numbers."""
    config = ChunkingConfig(max_chars=1000000, max_overlap=500000)
    assert config.max_chars == 1000000
    assert config.max_overlap == 500000


def test_chunking_config_various_presets() -> None:
    """ChunkingConfig should accept various preset names."""
    presets = ["semantic", "balanced", "compact", "large"]
    for preset in presets:
        config = ChunkingConfig(preset=preset)
        assert config.preset == preset


def test_chunking_config_custom_preset_name() -> None:
    """ChunkingConfig should accept custom preset names."""
    config = ChunkingConfig(preset="my_custom_preset")
    assert config.preset == "my_custom_preset"


def test_chunking_config_with_all_parameters() -> None:
    """ChunkingConfig should work with all parameters specified."""
    embedding = EmbeddingConfig(
        model=EmbeddingModelType.preset("balanced"),
        batch_size=32,
    )
    config = ChunkingConfig(
        max_chars=2048,
        max_overlap=512,
        embedding=embedding,
        preset=None,
    )

    assert config.max_chars == 2048
    assert config.max_overlap == 512
    assert config.embedding is not None
    assert config.preset is None


def test_chunking_config_edge_case_single_char_chunk() -> None:
    """ChunkingConfig should accept single character chunks."""
    config = ChunkingConfig(max_chars=1)
    assert config.max_chars == 1


def test_chunking_config_realistic_nlp_scenario() -> None:
    """ChunkingConfig should support realistic NLP scenario."""
    config = ChunkingConfig(
        max_chars=512,
        max_overlap=100,
        embedding=EmbeddingConfig(
            model=EmbeddingModelType.preset("balanced"),
            normalize=True,
            batch_size=32,
        ),
    )

    assert config.max_chars == 512
    assert config.max_overlap == 100
    assert config.embedding is not None
    assert config.embedding.normalize is True
    assert config.embedding.batch_size == 32
