using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for EmbeddingConfig.
/// Tests embedding model configuration, batch sizing, normalization, and caching.
/// </summary>
public class EmbeddingConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new EmbeddingConfig();

        Assert.Null(config.Model);
        Assert.Null(config.BatchSize);
        Assert.Null(config.Normalize);
        Assert.Null(config.Dimensions);
        Assert.Null(config.UseCache);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new EmbeddingConfig
        {
            Model = "text-embedding-ada-002",
            BatchSize = 32,
            Normalize = true,
            Dimensions = 1536,
            UseCache = true
        };

        Assert.Equal("text-embedding-ada-002", config.Model);
        Assert.Equal(32, config.BatchSize);
        Assert.True(config.Normalize);
        Assert.Equal(1536, config.Dimensions);
        Assert.True(config.UseCache);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new EmbeddingConfig
        {
            Model = "default",
            BatchSize = 64,
            Normalize = false,
            Dimensions = 384,
            UseCache = false
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<EmbeddingConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.Model, restored.Model);
        Assert.Equal(original.BatchSize, restored.BatchSize);
        Assert.Equal(original.Normalize, restored.Normalize);
        Assert.Equal(original.Dimensions, restored.Dimensions);
        Assert.Equal(original.UseCache, restored.UseCache);
    }

    [Theory]
    [InlineData("default")]
    [InlineData("balanced")]
    [InlineData("compact")]
    [InlineData("large")]
    [InlineData("text-embedding-ada-002")]
    [InlineData("all-MiniLM-L6-v2")]
    public void Model_ShouldAcceptValidValues(string model)
    {
        var config = new EmbeddingConfig { Model = model };

        Assert.Equal(model, config.Model);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(8)]
    [InlineData(16)]
    [InlineData(32)]
    [InlineData(64)]
    [InlineData(128)]
    public void BatchSize_ShouldAcceptValidValues(int batchSize)
    {
        var config = new EmbeddingConfig { BatchSize = batchSize };

        Assert.Equal(batchSize, config.BatchSize);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Normalize_ShouldAcceptBooleanValues(bool normalize)
    {
        var config = new EmbeddingConfig { Normalize = normalize };

        Assert.Equal(normalize, config.Normalize);
    }

    [Theory]
    [InlineData(384)]
    [InlineData(512)]
    [InlineData(768)]
    [InlineData(1024)]
    [InlineData(1536)]
    [InlineData(2048)]
    [InlineData(3072)]
    public void Dimensions_ShouldAcceptValidValues(int dimensions)
    {
        var config = new EmbeddingConfig { Dimensions = dimensions };

        Assert.Equal(dimensions, config.Dimensions);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void UseCache_ShouldAcceptBooleanValues(bool useCache)
    {
        var config = new EmbeddingConfig { UseCache = useCache };

        Assert.Equal(useCache, config.UseCache);
    }

    [Fact]
    public void Nesting_ShouldWorkInChunkingConfig()
    {
        var embeddingConfig = new EmbeddingConfig
        {
            Model = "balanced",
            BatchSize = 32,
            Normalize = true,
            Dimensions = 768
        };
        var chunkingConfig = new ChunkingConfig { Embedding = embeddingConfig };

        Assert.Equal("balanced", chunkingConfig.Embedding?.Model);
        Assert.Equal(32, chunkingConfig.Embedding?.BatchSize);
        Assert.True(chunkingConfig.Embedding?.Normalize);
        Assert.Equal(768, chunkingConfig.Embedding?.Dimensions);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(EmbeddingConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "EmbeddingConfig should have at least one settable property");

        foreach (var prop in properties)
        {
            var hasInitOnly = prop.SetMethod.ReturnParameter?
                .GetRequiredCustomModifiers()
                .Any(m => m.Name == "IsExternalInit") ?? false;

            Assert.True(hasInitOnly, $"{prop.Name} must have init-only accessor");
        }
    }

    [Fact]
    public void NullHandling_ShouldHandleAllNullableFields()
    {
        var config = new EmbeddingConfig
        {
            Model = null,
            BatchSize = null,
            Normalize = null,
            Dimensions = null,
            UseCache = null
        };

        Assert.Null(config.Model);
        Assert.Null(config.BatchSize);
        Assert.Null(config.Normalize);
        Assert.Null(config.Dimensions);
        Assert.Null(config.UseCache);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new EmbeddingConfig
        {
            Model = "test-model",
            BatchSize = 16,
            Normalize = true,
            Dimensions = 512,
            UseCache = false
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("\"model\"", json);
        Assert.Contains("\"batch_size\"", json);
        Assert.Contains("\"normalize\"", json);
        Assert.Contains("\"dimensions\"", json);
        Assert.Contains("\"use_cache\"", json);
        Assert.Contains("\"test-model\"", json);
        Assert.Contains("16", json);
        Assert.Contains("true", json);
        Assert.Contains("512", json);
        Assert.Contains("false", json);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new EmbeddingConfig
        {
            Model = "all-mpnet-base-v2",
            BatchSize = 64,
            Normalize = true,
            Dimensions = 768,
            UseCache = true
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<EmbeddingConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal("all-mpnet-base-v2", restored.Model);
        Assert.Equal(64, restored.BatchSize);
        Assert.True(restored.Normalize);
        Assert.Equal(768, restored.Dimensions);
        Assert.True(restored.UseCache);
    }

    [Fact]
    public void DefaultPreset_Configuration()
    {
        var config = new EmbeddingConfig
        {
            Model = "default",
            BatchSize = 32,
            Normalize = true
        };

        Assert.Equal("default", config.Model);
        Assert.Equal(32, config.BatchSize);
        Assert.True(config.Normalize);
    }

    [Fact]
    public void BalancedPreset_Configuration()
    {
        var config = new EmbeddingConfig
        {
            Model = "balanced",
            BatchSize = 32,
            Normalize = true,
            Dimensions = 768
        };

        Assert.Equal("balanced", config.Model);
        Assert.Equal(768, config.Dimensions);
    }

    [Fact]
    public void CompactPreset_Configuration()
    {
        var config = new EmbeddingConfig
        {
            Model = "compact",
            BatchSize = 64,
            Normalize = true,
            Dimensions = 384
        };

        Assert.Equal("compact", config.Model);
        Assert.Equal(384, config.Dimensions);
    }

    [Fact]
    public void LargePreset_Configuration()
    {
        var config = new EmbeddingConfig
        {
            Model = "large",
            BatchSize = 16,
            Normalize = true,
            Dimensions = 1536
        };

        Assert.Equal("large", config.Model);
        Assert.Equal(1536, config.Dimensions);
    }

    [Fact]
    public void OpenAiModel_Configuration()
    {
        var config = new EmbeddingConfig
        {
            Model = "text-embedding-ada-002",
            BatchSize = 100,
            Normalize = false,
            Dimensions = 1536,
            UseCache = true
        };

        Assert.Equal("text-embedding-ada-002", config.Model);
        Assert.Equal(1536, config.Dimensions);
        Assert.False(config.Normalize);
    }

    [Fact]
    public void HuggingFaceModel_Configuration()
    {
        var config = new EmbeddingConfig
        {
            Model = "sentence-transformers/all-MiniLM-L6-v2",
            BatchSize = 32,
            Normalize = true,
            Dimensions = 384
        };

        Assert.Equal("sentence-transformers/all-MiniLM-L6-v2", config.Model);
        Assert.Equal(384, config.Dimensions);
    }

    [Fact]
    public void MinimalConfiguration_OnlyModel()
    {
        var config = new EmbeddingConfig { Model = "default" };

        Assert.Equal("default", config.Model);
        Assert.Null(config.BatchSize);
        Assert.Null(config.Normalize);
        Assert.Null(config.Dimensions);
        Assert.Null(config.UseCache);
    }

    [Fact]
    public void WithNormalization_Enabled()
    {
        var config = new EmbeddingConfig
        {
            Model = "balanced",
            Normalize = true
        };

        Assert.True(config.Normalize);
    }

    [Fact]
    public void WithNormalization_Disabled()
    {
        var config = new EmbeddingConfig
        {
            Model = "balanced",
            Normalize = false
        };

        Assert.False(config.Normalize);
    }

    [Fact]
    public void WithCaching_Enabled()
    {
        var config = new EmbeddingConfig
        {
            Model = "compact",
            UseCache = true
        };

        Assert.True(config.UseCache);
    }

    [Fact]
    public void WithCaching_Disabled()
    {
        var config = new EmbeddingConfig
        {
            Model = "compact",
            UseCache = false
        };

        Assert.False(config.UseCache);
    }

    [Fact]
    public void Integration_WithChunkingConfigSerialization()
    {
        var embeddingConfig = new EmbeddingConfig
        {
            Model = "balanced",
            BatchSize = 32,
            Normalize = true,
            Dimensions = 768,
            UseCache = true
        };

        var chunkingConfig = new ChunkingConfig
        {
            MaxChars = 512,
            MaxOverlap = 50,
            Embedding = embeddingConfig
        };

        var json = JsonSerializer.Serialize(chunkingConfig);
        var restored = JsonSerializer.Deserialize<ChunkingConfig>(json);

        Assert.NotNull(restored);
        Assert.NotNull(restored.Embedding);
        Assert.Equal("balanced", restored.Embedding.Model);
        Assert.Equal(32, restored.Embedding.BatchSize);
        Assert.True(restored.Embedding.Normalize);
        Assert.Equal(768, restored.Embedding.Dimensions);
        Assert.True(restored.Embedding.UseCache);
    }

    [Fact]
    public void Integration_WithExtractionConfigSerialization()
    {
        var embeddingConfig = new EmbeddingConfig
        {
            Model = "default",
            BatchSize = 64,
            Normalize = true
        };

        var chunkingConfig = new ChunkingConfig
        {
            MaxChars = 1000,
            Embedding = embeddingConfig
        };

        var extractionConfig = new ExtractionConfig
        {
            Chunking = chunkingConfig,
            UseCache = true
        };

        var json = JsonSerializer.Serialize(extractionConfig);
        var restored = JsonSerializer.Deserialize<ExtractionConfig>(json);

        Assert.NotNull(restored);
        Assert.NotNull(restored.Chunking);
        Assert.NotNull(restored.Chunking.Embedding);
        Assert.Equal("default", restored.Chunking.Embedding.Model);
        Assert.Equal(64, restored.Chunking.Embedding.BatchSize);
        Assert.True(restored.Chunking.Embedding.Normalize);
    }

    [Fact]
    public void ZeroBatchSize_IsValid()
    {
        var config = new EmbeddingConfig { BatchSize = 0 };

        Assert.Equal(0, config.BatchSize);
    }

    [Fact]
    public void ZeroDimensions_IsValid()
    {
        var config = new EmbeddingConfig { Dimensions = 0 };

        Assert.Equal(0, config.Dimensions);
    }

    [Fact]
    public void EmptyModelString_IsValid()
    {
        var config = new EmbeddingConfig { Model = string.Empty };

        Assert.Equal(string.Empty, config.Model);
    }

    [Fact]
    public void CustomModelIdentifier_IsSupported()
    {
        var config = new EmbeddingConfig { Model = "custom/my-model-v1" };

        Assert.Equal("custom/my-model-v1", config.Model);
    }

    [Fact]
    public void LargeBatchSize_IsSupported()
    {
        var config = new EmbeddingConfig { BatchSize = 1000 };

        Assert.Equal(1000, config.BatchSize);
    }

    [Fact]
    public void LargeDimensions_IsSupported()
    {
        var config = new EmbeddingConfig { Dimensions = 4096 };

        Assert.Equal(4096, config.Dimensions);
    }
}
