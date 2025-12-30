using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for ImagePreprocessingConfig.
/// Tests image enhancement options like rotation, deskew, denoise, and contrast.
/// </summary>
public class ImagePreprocessingConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new ImagePreprocessingConfig();

        Assert.Null(config.TargetDpi);
        Assert.Null(config.AutoRotate);
        Assert.Null(config.Deskew);
        Assert.Null(config.Denoise);
        Assert.Null(config.ContrastEnhance);
        Assert.Null(config.BinarizationMode);
        Assert.Null(config.InvertColors);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new ImagePreprocessingConfig
        {
            TargetDpi = 300,
            AutoRotate = true,
            Deskew = true,
            Denoise = true,
            ContrastEnhance = true,
            BinarizationMode = "otsu",
            InvertColors = false
        };

        Assert.Equal(300, config.TargetDpi);
        Assert.True(config.AutoRotate);
        Assert.True(config.Deskew);
        Assert.True(config.Denoise);
        Assert.True(config.ContrastEnhance);
        Assert.Equal("otsu", config.BinarizationMode);
        Assert.False(config.InvertColors);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new ImagePreprocessingConfig
        {
            TargetDpi = 250,
            AutoRotate = true,
            Deskew = true,
            Denoise = false
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<ImagePreprocessingConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.TargetDpi, restored.TargetDpi);
        Assert.Equal(original.AutoRotate, restored.AutoRotate);
        Assert.Equal(original.Deskew, restored.Deskew);
        Assert.Equal(original.Denoise, restored.Denoise);
    }

    [Theory]
    [InlineData(72)]
    [InlineData(150)]
    [InlineData(300)]
    [InlineData(600)]
    public void TargetDpi_ShouldAcceptValidValues(int dpi)
    {
        var config = new ImagePreprocessingConfig { TargetDpi = dpi };

        Assert.Equal(dpi, config.TargetDpi);
    }

    [Fact]
    public void AutoRotate_ShouldControlRotationCorrection()
    {
        var configEnabled = new ImagePreprocessingConfig { AutoRotate = true };
        var configDisabled = new ImagePreprocessingConfig { AutoRotate = false };

        Assert.True(configEnabled.AutoRotate);
        Assert.False(configDisabled.AutoRotate);
    }

    [Fact]
    public void Deskew_ShouldControlSkewCorrection()
    {
        var configEnabled = new ImagePreprocessingConfig { Deskew = true };
        var configDisabled = new ImagePreprocessingConfig { Deskew = false };

        Assert.True(configEnabled.Deskew);
        Assert.False(configDisabled.Deskew);
    }

    [Fact]
    public void Denoise_ShouldControlNoiseReduction()
    {
        var configEnabled = new ImagePreprocessingConfig { Denoise = true };
        var configDisabled = new ImagePreprocessingConfig { Denoise = false };

        Assert.True(configEnabled.Denoise);
        Assert.False(configDisabled.Denoise);
    }

    [Fact]
    public void ContrastEnhance_ShouldControlContrastAdjustment()
    {
        var configEnabled = new ImagePreprocessingConfig { ContrastEnhance = true };
        var configDisabled = new ImagePreprocessingConfig { ContrastEnhance = false };

        Assert.True(configEnabled.ContrastEnhance);
        Assert.False(configDisabled.ContrastEnhance);
    }

    [Theory]
    [InlineData("otsu")]
    [InlineData("adaptive")]
    [InlineData("threshold")]
    public void BinarizationMode_ShouldAcceptValidMethods(string method)
    {
        var config = new ImagePreprocessingConfig { BinarizationMode = method };

        Assert.Equal(method, config.BinarizationMode);
    }

    [Fact]
    public void InvertColors_ShouldControlColorInversion()
    {
        var configInverted = new ImagePreprocessingConfig { InvertColors = true };
        var configNormal = new ImagePreprocessingConfig { InvertColors = false };

        Assert.True(configInverted.InvertColors);
        Assert.False(configNormal.InvertColors);
    }

    [Fact]
    public void Nesting_ShouldWorkInTesseractConfig()
    {
        var preprocessingConfig = new ImagePreprocessingConfig
        {
            TargetDpi = 300,
            AutoRotate = true,
            Deskew = true
        };
        var tesseractConfig = new TesseractConfig
        {
            Preprocessing = preprocessingConfig
        };

        Assert.Equal(300, tesseractConfig.Preprocessing?.TargetDpi);
        Assert.True(tesseractConfig.Preprocessing?.AutoRotate);
        Assert.True(tesseractConfig.Preprocessing?.Deskew);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(ImagePreprocessingConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "ImagePreprocessingConfig should have at least one settable property");

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
        var config = new ImagePreprocessingConfig
        {
            TargetDpi = null,
            AutoRotate = null,
            Deskew = null,
            Denoise = null,
            ContrastEnhance = null,
            BinarizationMode = null,
            InvertColors = null
        };

        Assert.Null(config.TargetDpi);
        Assert.Null(config.AutoRotate);
        Assert.Null(config.Deskew);
        Assert.Null(config.Denoise);
        Assert.Null(config.ContrastEnhance);
        Assert.Null(config.BinarizationMode);
        Assert.Null(config.InvertColors);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new ImagePreprocessingConfig
        {
            TargetDpi = 300,
            AutoRotate = true,
            Deskew = true
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("target_dpi", json);
        Assert.Contains("auto_rotate", json);
        Assert.Contains("deskew", json);
        Assert.Contains("true", json);
        Assert.Contains("300", json);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new ImagePreprocessingConfig
        {
            TargetDpi = 300,
            AutoRotate = true,
            Deskew = true,
            Denoise = true,
            ContrastEnhance = true,
            BinarizationMode = "otsu",
            InvertColors = false
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<ImagePreprocessingConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(300, restored.TargetDpi);
        Assert.True(restored.AutoRotate);
        Assert.True(restored.Deskew);
        Assert.True(restored.Denoise);
        Assert.True(restored.ContrastEnhance);
        Assert.Equal("otsu", restored.BinarizationMode);
        Assert.False(restored.InvertColors);
    }
}
