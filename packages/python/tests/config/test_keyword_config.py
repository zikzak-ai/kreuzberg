"""Tests for KeywordConfig configuration."""

from __future__ import annotations

from kreuzberg import ExtractionConfig, KeywordAlgorithm, KeywordConfig, RakeParams, YakeParams


def test_keyword_config_default_construction() -> None:
    """KeywordConfig should have sensible defaults."""
    config = KeywordConfig()
    assert config.max_keywords == 10
    assert config.min_score == 0.0
    assert config.ngram_range == (1, 3)
    assert config.language == "en"
    assert config.yake_params is None
    assert config.rake_params is None


def test_keyword_config_custom_values() -> None:
    """KeywordConfig should accept custom values."""
    config = KeywordConfig(
        max_keywords=20,
        min_score=0.5,
        ngram_range=(1, 2),
        language="de",
    )
    assert config.max_keywords == 20
    assert config.min_score == 0.5
    assert config.ngram_range == (1, 2)
    assert config.language == "de"


def test_keyword_config_max_keywords() -> None:
    """KeywordConfig should support various max_keywords values."""
    for max_kw in [1, 5, 10, 50, 100]:
        config = KeywordConfig(max_keywords=max_kw)
        assert config.max_keywords == max_kw


def test_keyword_config_min_score_zero() -> None:
    """KeywordConfig should accept min_score of 0.0."""
    config = KeywordConfig(min_score=0.0)
    assert config.min_score == 0.0


def test_keyword_config_min_score_mid_range() -> None:
    """KeywordConfig should accept mid-range min_score."""
    config = KeywordConfig(min_score=0.5)
    assert config.min_score == 0.5


def test_keyword_config_min_score_high() -> None:
    """KeywordConfig should accept high min_score."""
    config = KeywordConfig(min_score=0.95)
    assert abs(config.min_score - 0.95) < 0.01


def test_keyword_config_ngram_range_unigram() -> None:
    """KeywordConfig should support unigram range."""
    config = KeywordConfig(ngram_range=(1, 1))
    assert config.ngram_range == (1, 1)


def test_keyword_config_ngram_range_bigram() -> None:
    """KeywordConfig should support bigram range."""
    config = KeywordConfig(ngram_range=(2, 2))
    assert config.ngram_range == (2, 2)


def test_keyword_config_ngram_range_trigram() -> None:
    """KeywordConfig should support trigram range."""
    config = KeywordConfig(ngram_range=(1, 3))
    assert config.ngram_range == (1, 3)


def test_keyword_config_ngram_range_up_to_4grams() -> None:
    """KeywordConfig should support 4-gram range."""
    config = KeywordConfig(ngram_range=(1, 4))
    assert config.ngram_range == (1, 4)


def test_keyword_config_with_yake_params() -> None:
    """KeywordConfig should properly nest YakeParams."""
    yake = YakeParams(window_size=3)
    config = KeywordConfig(yake_params=yake)
    assert config.yake_params is not None
    assert config.yake_params.window_size == 3


def test_keyword_config_with_rake_params() -> None:
    """KeywordConfig should properly nest RakeParams."""
    rake = RakeParams(min_word_length=2, max_words_per_phrase=5)
    config = KeywordConfig(rake_params=rake)
    assert config.rake_params is not None
    assert config.rake_params.min_word_length == 2
    assert config.rake_params.max_words_per_phrase == 5


def test_keyword_config_language_codes() -> None:
    """KeywordConfig should accept various language codes."""
    languages = ["en", "de", "fr", "es", "it"]
    for lang in languages:
        config = KeywordConfig(language=lang)
        assert config.language == lang


def test_keyword_config_none_language() -> None:
    """KeywordConfig should handle None language appropriately."""
    config = KeywordConfig(language=None)
    # language defaults to "en" even if None is passed
    assert config.language in [None, "en"]


def test_keyword_config_none_yake_params() -> None:
    """KeywordConfig should handle None yake_params appropriately."""
    config = KeywordConfig(yake_params=None)
    assert config.yake_params is None


def test_keyword_config_none_rake_params() -> None:
    """KeywordConfig should handle None rake_params appropriately."""
    config = KeywordConfig(rake_params=None)
    assert config.rake_params is None


def test_keyword_config_in_extraction_config() -> None:
    """ExtractionConfig should properly nest KeywordConfig."""
    keywords = KeywordConfig(max_keywords=20)
    extraction = ExtractionConfig(keywords=keywords)
    assert extraction.keywords is not None
    assert extraction.keywords.max_keywords == 20


def test_keyword_config_with_yake_algorithm() -> None:
    """KeywordConfig should work with YAKE algorithm."""
    yake = YakeParams(window_size=2)
    config = KeywordConfig(
        algorithm=KeywordAlgorithm.Yake,
        max_keywords=15,
        yake_params=yake,
    )
    assert config.yake_params is not None
    assert config.yake_params.window_size == 2


def test_keyword_config_with_rake_algorithm() -> None:
    """KeywordConfig should work with RAKE algorithm."""
    rake = RakeParams(min_word_length=3, max_words_per_phrase=4)
    config = KeywordConfig(
        algorithm=KeywordAlgorithm.Rake,
        max_keywords=25,
        rake_params=rake,
    )
    assert config.rake_params is not None
    assert config.rake_params.min_word_length == 3


def test_keyword_config_large_max_keywords() -> None:
    """KeywordConfig should accept large max_keywords values."""
    config = KeywordConfig(max_keywords=1000)
    assert config.max_keywords == 1000


def test_keyword_config_single_keyword() -> None:
    """KeywordConfig should accept single keyword."""
    config = KeywordConfig(max_keywords=1)
    assert config.max_keywords == 1


def test_keyword_config_all_parameters() -> None:
    """KeywordConfig should work with all parameters specified."""
    yake = YakeParams(window_size=3)
    rake = RakeParams(min_word_length=2, max_words_per_phrase=4)

    config = KeywordConfig(
        algorithm=KeywordAlgorithm.Yake,
        max_keywords=30,
        min_score=0.3,
        ngram_range=(1, 2),
        language="fr",
        yake_params=yake,
        rake_params=rake,
    )

    assert config.max_keywords == 30
    assert abs(config.min_score - 0.3) < 0.01
    assert config.ngram_range == (1, 2)
    assert config.language == "fr"
    assert config.yake_params is not None
    assert config.rake_params is not None


def test_keyword_config_realistic_nlp_scenario() -> None:
    """KeywordConfig should support realistic NLP scenario."""
    config = KeywordConfig(
        max_keywords=25,
        min_score=0.2,
        ngram_range=(1, 3),
        language="en",
        yake_params=YakeParams(window_size=2),
    )

    assert config.max_keywords == 25
    assert abs(config.min_score - 0.2) < 0.01
    assert config.yake_params is not None
