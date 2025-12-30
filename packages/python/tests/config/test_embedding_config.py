"""Tests for EmbeddingConfig configuration."""

from __future__ import annotations

from kreuzberg import ChunkingConfig, EmbeddingConfig


def test_embedding_config_default_construction() -> None:
    """EmbeddingConfig should have sensible defaults."""
    config = EmbeddingConfig()
    assert config.normalize is True
    assert config.batch_size == 32


def test_embedding_config_custom_values() -> None:
    """EmbeddingConfig should accept custom values."""
    config = EmbeddingConfig(
        normalize=False,
        batch_size=64,
    )
    assert config.normalize is False
    assert config.batch_size == 64


def test_embedding_config_normalize_true() -> None:
    """EmbeddingConfig should support normalization."""
    config = EmbeddingConfig(normalize=True)
    assert config.normalize is True


def test_embedding_config_normalize_false() -> None:
    """EmbeddingConfig should support skipping normalization."""
    config = EmbeddingConfig(normalize=False)
    assert config.normalize is False


def test_embedding_config_batch_size_small() -> None:
    """EmbeddingConfig should support small batch sizes."""
    config = EmbeddingConfig(batch_size=1)
    assert config.batch_size == 1


def test_embedding_config_batch_size_standard() -> None:
    """EmbeddingConfig should support standard batch sizes."""
    config = EmbeddingConfig(batch_size=32)
    assert config.batch_size == 32


def test_embedding_config_batch_size_large() -> None:
    """EmbeddingConfig should support large batch sizes."""
    config = EmbeddingConfig(batch_size=512)
    assert config.batch_size == 512


def test_embedding_config_batch_size_very_large() -> None:
    """EmbeddingConfig should support very large batch sizes."""
    config = EmbeddingConfig(batch_size=10000)
    assert config.batch_size == 10000


def test_embedding_config_in_chunking_config() -> None:
    """ChunkingConfig should properly nest EmbeddingConfig."""
    embedding = EmbeddingConfig(normalize=True, batch_size=64)
    chunking = ChunkingConfig(embedding=embedding)
    assert chunking.embedding is not None
    assert chunking.embedding.normalize is True
    assert chunking.embedding.batch_size == 64


def test_embedding_config_high_memory_settings() -> None:
    """EmbeddingConfig should support high-memory settings."""
    config = EmbeddingConfig(
        batch_size=256,
        normalize=True,
    )
    assert config.batch_size == 256


def test_embedding_config_low_memory_settings() -> None:
    """EmbeddingConfig should support low-memory settings."""
    config = EmbeddingConfig(
        batch_size=4,
        normalize=True,
    )
    assert config.batch_size == 4


def test_embedding_config_various_batch_sizes() -> None:
    """EmbeddingConfig should accept various batch sizes."""
    for batch_size in [1, 4, 8, 16, 32, 64, 128, 256, 512]:
        config = EmbeddingConfig(batch_size=batch_size)
        assert config.batch_size == batch_size


def test_embedding_config_all_parameters() -> None:
    """EmbeddingConfig should work with all parameters specified."""
    config = EmbeddingConfig(
        normalize=True,
        batch_size=64,
    )

    assert config.normalize is True
    assert config.batch_size == 64


def test_embedding_config_realistic_semantic_search() -> None:
    """EmbeddingConfig should support realistic semantic search scenario."""
    config = EmbeddingConfig(
        normalize=True,
        batch_size=32,
    )

    assert config.normalize is True
    assert config.batch_size == 32


def test_embedding_config_realistic_production_setup() -> None:
    """EmbeddingConfig should support realistic production setup."""
    config = EmbeddingConfig(
        normalize=True,
        batch_size=128,
    )

    assert config.batch_size == 128
