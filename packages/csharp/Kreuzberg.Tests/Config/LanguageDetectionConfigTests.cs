using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for LanguageDetectionConfig.
/// Tests language detection settings, confidence thresholds, and multi-language detection.
/// </summary>
public class LanguageDetectionConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new LanguageDetectionConfig();

        Assert.Null(config.Enabled);
        Assert.Null(config.MinConfidence);
        Assert.Null(config.DetectMultiple);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.7,
            DetectMultiple = true
        };

        Assert.True(config.Enabled);
        Assert.Equal(0.7, config.MinConfidence);
        Assert.True(config.DetectMultiple);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new LanguageDetectionConfig
        {
            Enabled = false,
            MinConfidence = 0.5,
            DetectMultiple = false
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<LanguageDetectionConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.Enabled, restored.Enabled);
        Assert.Equal(original.MinConfidence, restored.MinConfidence);
        Assert.Equal(original.DetectMultiple, restored.DetectMultiple);
    }

    [Fact]
    public void Enabled_ShouldControlLanguageDetection()
    {
        var configEnabled = new LanguageDetectionConfig { Enabled = true };
        var configDisabled = new LanguageDetectionConfig { Enabled = false };

        Assert.True(configEnabled.Enabled);
        Assert.False(configDisabled.Enabled);
    }

    [Fact]
    public void MinConfidence_ShouldAcceptValidRange()
    {
        var config1 = new LanguageDetectionConfig { MinConfidence = 0.0 };
        var config2 = new LanguageDetectionConfig { MinConfidence = 0.5 };
        var config3 = new LanguageDetectionConfig { MinConfidence = 0.95 };
        var config4 = new LanguageDetectionConfig { MinConfidence = 1.0 };

        Assert.Equal(0.0, config1.MinConfidence);
        Assert.Equal(0.5, config2.MinConfidence);
        Assert.Equal(0.95, config3.MinConfidence);
        Assert.Equal(1.0, config4.MinConfidence);
    }

    [Fact]
    public void DetectMultiple_ShouldControlMultiLanguageDetection()
    {
        var configSingle = new LanguageDetectionConfig { DetectMultiple = false };
        var configMultiple = new LanguageDetectionConfig { DetectMultiple = true };

        Assert.False(configSingle.DetectMultiple);
        Assert.True(configMultiple.DetectMultiple);
    }

    [Fact]
    public void Nesting_ShouldWorkInExtractionConfig()
    {
        var langDetectionConfig = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.8,
            DetectMultiple = true
        };
        var extractionConfig = new ExtractionConfig { LanguageDetection = langDetectionConfig };

        Assert.True(extractionConfig.LanguageDetection?.Enabled);
        Assert.Equal(0.8, extractionConfig.LanguageDetection?.MinConfidence);
        Assert.True(extractionConfig.LanguageDetection?.DetectMultiple);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(LanguageDetectionConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "LanguageDetectionConfig should have at least one settable property");

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
        var config = new LanguageDetectionConfig
        {
            Enabled = null,
            MinConfidence = null,
            DetectMultiple = null
        };

        Assert.Null(config.Enabled);
        Assert.Null(config.MinConfidence);
        Assert.Null(config.DetectMultiple);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.75,
            DetectMultiple = true
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("\"enabled\"", json);
        Assert.Contains("\"min_confidence\"", json);
        Assert.Contains("\"detect_multiple\"", json);
        Assert.Contains("true", json);
        Assert.Contains("0.75", json);
    }

    [Fact]
    public void HighConfidenceThreshold_ShouldWork()
    {
        var config = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.99
        };

        Assert.True(config.Enabled);
        Assert.Equal(0.99, config.MinConfidence);
    }

    [Fact]
    public void LowConfidenceThreshold_ShouldWork()
    {
        var config = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.1
        };

        Assert.True(config.Enabled);
        Assert.Equal(0.1, config.MinConfidence);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.85,
            DetectMultiple = true
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<LanguageDetectionConfig>(json);

        Assert.NotNull(restored);
        Assert.True(restored.Enabled);
        Assert.Equal(0.85, restored.MinConfidence);
        Assert.True(restored.DetectMultiple);
    }

    [Fact]
    public void StrictConfiguration_HighThresholdNoMultiple()
    {
        var config = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.95,
            DetectMultiple = false
        };

        Assert.True(config.Enabled);
        Assert.Equal(0.95, config.MinConfidence);
        Assert.False(config.DetectMultiple);
    }

    [Fact]
    public void PermissiveConfiguration_LowThresholdWithMultiple()
    {
        var config = new LanguageDetectionConfig
        {
            Enabled = true,
            MinConfidence = 0.3,
            DetectMultiple = true
        };

        Assert.True(config.Enabled);
        Assert.Equal(0.3, config.MinConfidence);
        Assert.True(config.DetectMultiple);
    }
}
