using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for TokenReductionConfig.
/// Tests token reduction modes and word preservation settings.
/// </summary>
public class TokenReductionConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new TokenReductionConfig();

        Assert.Null(config.Mode);
        Assert.Null(config.PreserveImportantWords);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new TokenReductionConfig
        {
            Mode = "aggressive",
            PreserveImportantWords = true
        };

        Assert.Equal("aggressive", config.Mode);
        Assert.True(config.PreserveImportantWords);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new TokenReductionConfig
        {
            Mode = "balanced",
            PreserveImportantWords = false
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<TokenReductionConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.Mode, restored.Mode);
        Assert.Equal(original.PreserveImportantWords, restored.PreserveImportantWords);
    }

    [Theory]
    [InlineData("none")]
    [InlineData("aggressive")]
    [InlineData("balanced")]
    [InlineData("conservative")]
    public void Mode_ShouldAcceptValidValues(string mode)
    {
        var config = new TokenReductionConfig { Mode = mode };

        Assert.Equal(mode, config.Mode);
    }

    [Fact]
    public void PreserveImportantWords_ShouldControlWordPreservation()
    {
        var configPreserve = new TokenReductionConfig { PreserveImportantWords = true };
        var configNoPreserve = new TokenReductionConfig { PreserveImportantWords = false };

        Assert.True(configPreserve.PreserveImportantWords);
        Assert.False(configNoPreserve.PreserveImportantWords);
    }

    [Fact]
    public void AggressiveMode_WithPreservation()
    {
        var config = new TokenReductionConfig
        {
            Mode = "aggressive",
            PreserveImportantWords = true
        };

        Assert.Equal("aggressive", config.Mode);
        Assert.True(config.PreserveImportantWords);
    }

    [Fact]
    public void BalancedMode_WithoutPreservation()
    {
        var config = new TokenReductionConfig
        {
            Mode = "balanced",
            PreserveImportantWords = false
        };

        Assert.Equal("balanced", config.Mode);
        Assert.False(config.PreserveImportantWords);
    }

    [Fact]
    public void Nesting_ShouldWorkInExtractionConfig()
    {
        var tokenReductionConfig = new TokenReductionConfig
        {
            Mode = "balanced",
            PreserveImportantWords = true
        };
        var extractionConfig = new ExtractionConfig { TokenReduction = tokenReductionConfig };

        Assert.Equal("balanced", extractionConfig.TokenReduction?.Mode);
        Assert.True(extractionConfig.TokenReduction?.PreserveImportantWords);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(TokenReductionConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "TokenReductionConfig should have at least one settable property");

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
        var config = new TokenReductionConfig
        {
            Mode = null,
            PreserveImportantWords = null
        };

        Assert.Null(config.Mode);
        Assert.Null(config.PreserveImportantWords);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new TokenReductionConfig
        {
            Mode = "aggressive",
            PreserveImportantWords = true
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("\"mode\"", json);
        Assert.Contains("\"preserve_important_words\"", json);
        Assert.Contains("\"aggressive\"", json);
        Assert.Contains("true", json);
    }

    [Fact]
    public void NoReductionMode_ShouldBeValid()
    {
        var config = new TokenReductionConfig
        {
            Mode = "none",
            PreserveImportantWords = false
        };

        Assert.Equal("none", config.Mode);
        Assert.False(config.PreserveImportantWords);
    }

    [Fact]
    public void ConservativeMode_WithWordPreservation()
    {
        var config = new TokenReductionConfig
        {
            Mode = "conservative",
            PreserveImportantWords = true
        };

        Assert.Equal("conservative", config.Mode);
        Assert.True(config.PreserveImportantWords);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new TokenReductionConfig
        {
            Mode = "balanced",
            PreserveImportantWords = true
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<TokenReductionConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal("balanced", restored.Mode);
        Assert.True(restored.PreserveImportantWords);
    }
}
