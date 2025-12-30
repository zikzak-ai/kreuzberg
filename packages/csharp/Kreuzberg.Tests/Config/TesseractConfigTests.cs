using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for TesseractConfig.
/// Tests OCR engine parameters, PSM/OEM modes, and image preprocessing.
/// </summary>
public class TesseractConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new TesseractConfig();

        Assert.Null(config.Language);
        Assert.Null(config.Psm);
        Assert.Null(config.Oem);
        Assert.Null(config.MinConfidence);
        Assert.Null(config.Preprocessing);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new TesseractConfig
        {
            Language = "eng",
            Psm = 6,
            Oem = 1,
            MinConfidence = 0.7
        };

        Assert.Equal("eng", config.Language);
        Assert.Equal(6, config.Psm);
        Assert.Equal(1, config.Oem);
        Assert.Equal(0.7, config.MinConfidence);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new TesseractConfig
        {
            Language = "fra",
            Psm = 11,
            Oem = 3,
            MinConfidence = 0.85
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<TesseractConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.Language, restored.Language);
        Assert.Equal(original.Psm, restored.Psm);
        Assert.Equal(original.Oem, restored.Oem);
        Assert.Equal(original.MinConfidence, restored.MinConfidence);
    }

    [Fact]
    public void Serialize_ShouldIncludePreprocessing()
    {
        var config = new TesseractConfig
        {
            Language = "eng",
            Psm = 6,
            Preprocessing = new ImagePreprocessingConfig
            {
                AutoRotate = true,
                Deskew = true,
                TargetDpi = 300
            }
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<TesseractConfig>(json);

        Assert.NotNull(restored?.Preprocessing);
        Assert.True(restored.Preprocessing.AutoRotate);
        Assert.True(restored.Preprocessing.Deskew);
        Assert.Equal(300, restored.Preprocessing.TargetDpi);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(13)]
    public void Psm_ShouldAcceptValidValues(int psm)
    {
        var config = new TesseractConfig { Psm = psm };

        Assert.Equal(psm, config.Psm);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    public void Oem_ShouldAcceptValidValues(int oem)
    {
        var config = new TesseractConfig { Oem = oem };

        Assert.Equal(oem, config.Oem);
    }

    [Fact]
    public void MinConfidence_ShouldAcceptValidRange()
    {
        var config1 = new TesseractConfig { MinConfidence = 0.0 };
        var config2 = new TesseractConfig { MinConfidence = 0.5 };
        var config3 = new TesseractConfig { MinConfidence = 1.0 };

        Assert.Equal(0.0, config1.MinConfidence);
        Assert.Equal(0.5, config2.MinConfidence);
        Assert.Equal(1.0, config3.MinConfidence);
    }

    [Fact]
    public void TableDetection_ShouldAcceptConfiguration()
    {
        var config = new TesseractConfig
        {
            EnableTableDetection = true,
            TableMinConfidence = 0.6,
            TableColumnThreshold = 50,
            TableRowThresholdRatio = 0.8
        };

        Assert.True(config.EnableTableDetection);
        Assert.Equal(0.6, config.TableMinConfidence);
        Assert.Equal(50, config.TableColumnThreshold);
        Assert.Equal(0.8, config.TableRowThresholdRatio);
    }

    [Fact]
    public void TesseractParameters_ShouldAcceptCharacterWhitelist()
    {
        var config = new TesseractConfig
        {
            TesseditCharWhitelist = "0123456789"
        };

        Assert.Equal("0123456789", config.TesseditCharWhitelist);
    }

    [Fact]
    public void TesseractParameters_ShouldAcceptCharacterBlacklist()
    {
        var config = new TesseractConfig
        {
            TesseditCharBlacklist = "!@#$%"
        };

        Assert.Equal("!@#$%", config.TesseditCharBlacklist);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(TesseractConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "TesseractConfig should have at least one settable property");

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
        var config = new TesseractConfig
        {
            Language = null,
            Psm = null,
            Oem = null,
            MinConfidence = null,
            Preprocessing = null,
            TesseditCharWhitelist = null,
            TesseditCharBlacklist = null
        };

        Assert.Null(config.Language);
        Assert.Null(config.Psm);
        Assert.Null(config.Oem);
        Assert.Null(config.MinConfidence);
        Assert.Null(config.Preprocessing);
        Assert.Null(config.TesseditCharWhitelist);
        Assert.Null(config.TesseditCharBlacklist);
    }

    [Fact]
    public void Nesting_ShouldWorkInOcrConfig()
    {
        var tesseractConfig = new TesseractConfig
        {
            Psm = 6,
            Language = "eng",
            MinConfidence = 0.75
        };
        var ocrConfig = new OcrConfig
        {
            Backend = "tesseract",
            TesseractConfig = tesseractConfig
        };

        Assert.Equal(6, ocrConfig.TesseractConfig?.Psm);
        Assert.Equal("eng", ocrConfig.TesseractConfig?.Language);
        Assert.Equal(0.75, ocrConfig.TesseractConfig?.MinConfidence);
    }
}
