using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for OcrConfig.
/// Tests backend selection, language configuration, and Tesseract nesting.
/// </summary>
public class OcrConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new OcrConfig();

        Assert.Null(config.Backend);
        Assert.Null(config.Language);
        Assert.Null(config.TesseractConfig);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new OcrConfig
        {
            Backend = "tesseract",
            Language = "eng"
        };

        Assert.Equal("tesseract", config.Backend);
        Assert.Equal("eng", config.Language);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new OcrConfig
        {
            Backend = "tesseract",
            Language = "eng"
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<OcrConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.Backend, restored.Backend);
        Assert.Equal(original.Language, restored.Language);
    }

    [Fact]
    public void Serialize_ShouldIncludeTesseractConfig()
    {
        var config = new OcrConfig
        {
            Backend = "tesseract",
            TesseractConfig = new TesseractConfig
            {
                Psm = 6,
                Language = "eng"
            }
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<OcrConfig>(json);

        Assert.NotNull(restored?.TesseractConfig);
        Assert.Equal(6, restored.TesseractConfig.Psm);
        Assert.Equal("eng", restored.TesseractConfig.Language);
    }

    [Fact]
    public void Immutability_ShouldEnforceInitOnly()
    {
        var config = new OcrConfig { Backend = "tesseract" };

        var backendProperty = typeof(OcrConfig).GetProperty("Backend");
        var setMethod = backendProperty?.GetSetMethod();

        Assert.NotNull(setMethod);
        Assert.True(setMethod.ReturnParameter
            .GetRequiredCustomModifiers()
            .Any(m => m.Name == "IsExternalInit"),
            "Backend must have init-only accessor");
    }

    [Fact]
    public void NullHandling_ShouldHandleNullableFields()
    {
        var config = new OcrConfig
        {
            Backend = null,
            Language = null,
            TesseractConfig = null
        };

        Assert.Null(config.Backend);
        Assert.Null(config.Language);
        Assert.Null(config.TesseractConfig);
    }

    [Theory]
    [InlineData("tesseract")]
    [InlineData("paddle")]
    [InlineData("easyocr")]
    public void Backend_ShouldAcceptValidValues(string backend)
    {
        var config = new OcrConfig { Backend = backend };

        Assert.Equal(backend, config.Backend);
    }

    [Theory]
    [InlineData("eng")]
    [InlineData("fra")]
    [InlineData("deu")]
    [InlineData("spa")]
    [InlineData("chi_sim")]
    public void Language_ShouldAcceptValidLanguageCodes(string language)
    {
        var config = new OcrConfig { Language = language };

        Assert.Equal(language, config.Language);
    }

    [Fact]
    public void Nesting_ShouldWorkInExtractionConfig()
    {
        var ocrConfig = new OcrConfig { Backend = "paddle", Language = "fra" };
        var extractionConfig = new ExtractionConfig { Ocr = ocrConfig };

        Assert.Equal("paddle", extractionConfig.Ocr?.Backend);
        Assert.Equal("fra", extractionConfig.Ocr?.Language);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(OcrConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "OcrConfig should have at least one settable property");

        foreach (var prop in properties)
        {
            var hasInitOnly = prop.SetMethod.ReturnParameter?
                .GetRequiredCustomModifiers()
                .Any(m => m.Name == "IsExternalInit") ?? false;

            Assert.True(hasInitOnly, $"{prop.Name} must have init-only accessor");
        }
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new OcrConfig { Backend = "tesseract", Language = "eng" };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("\"backend\"", json);
        Assert.Contains("\"language\"", json);
        Assert.Contains("\"tesseract\"", json);
        Assert.Contains("\"eng\"", json);
    }
}
