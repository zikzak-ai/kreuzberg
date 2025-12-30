using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for ImageExtractionConfig.
/// Tests image extraction parameters, DPI settings, and dimension constraints.
/// </summary>
public class ImageExtractionConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new ImageExtractionConfig();

        Assert.Null(config.ExtractImages);
        Assert.Null(config.TargetDpi);
        Assert.Null(config.MaxImageDimension);
        Assert.Null(config.AutoAdjustDpi);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new ImageExtractionConfig
        {
            ExtractImages = true,
            TargetDpi = 300,
            MaxImageDimension = 4096,
            AutoAdjustDpi = true,
            MinDpi = 72,
            MaxDpi = 600
        };

        Assert.True(config.ExtractImages);
        Assert.Equal(300, config.TargetDpi);
        Assert.Equal(4096, config.MaxImageDimension);
        Assert.True(config.AutoAdjustDpi);
        Assert.Equal(72, config.MinDpi);
        Assert.Equal(600, config.MaxDpi);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new ImageExtractionConfig
        {
            ExtractImages = true,
            TargetDpi = 150,
            MaxImageDimension = 2048
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<ImageExtractionConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.ExtractImages, restored.ExtractImages);
        Assert.Equal(original.TargetDpi, restored.TargetDpi);
        Assert.Equal(original.MaxImageDimension, restored.MaxImageDimension);
    }

    [Theory]
    [InlineData(72)]
    [InlineData(150)]
    [InlineData(300)]
    [InlineData(600)]
    public void TargetDpi_ShouldAcceptValidValues(int dpi)
    {
        var config = new ImageExtractionConfig { TargetDpi = dpi };

        Assert.Equal(dpi, config.TargetDpi);
    }

    [Theory]
    [InlineData(256)]
    [InlineData(1024)]
    [InlineData(4096)]
    [InlineData(8192)]
    public void MaxImageDimension_ShouldAcceptValidValues(int dimension)
    {
        var config = new ImageExtractionConfig { MaxImageDimension = dimension };

        Assert.Equal(dimension, config.MaxImageDimension);
    }

    [Fact]
    public void ExtractImages_ShouldAcceptBooleanValues()
    {
        var configEnabled = new ImageExtractionConfig { ExtractImages = true };
        var configDisabled = new ImageExtractionConfig { ExtractImages = false };

        Assert.True(configEnabled.ExtractImages);
        Assert.False(configDisabled.ExtractImages);
    }

    [Fact]
    public void AutoAdjustDpi_ShouldControlDpiAdjustment()
    {
        var configAuto = new ImageExtractionConfig { AutoAdjustDpi = true };
        var configManual = new ImageExtractionConfig { AutoAdjustDpi = false };

        Assert.True(configAuto.AutoAdjustDpi);
        Assert.False(configManual.AutoAdjustDpi);
    }

    [Fact]
    public void MinMaxDpi_ShouldConstrainDpiRange()
    {
        var config = new ImageExtractionConfig
        {
            MinDpi = 72,
            MaxDpi = 600,
            TargetDpi = 300
        };

        Assert.Equal(72, config.MinDpi);
        Assert.Equal(600, config.MaxDpi);
        Assert.Equal(300, config.TargetDpi);
    }

    [Fact]
    public void Nesting_ShouldWorkInExtractionConfig()
    {
        var imageConfig = new ImageExtractionConfig
        {
            ExtractImages = true,
            TargetDpi = 300,
            MaxImageDimension = 2048
        };
        var extractionConfig = new ExtractionConfig { Images = imageConfig };

        Assert.True(extractionConfig.Images?.ExtractImages);
        Assert.Equal(300, extractionConfig.Images?.TargetDpi);
        Assert.Equal(2048, extractionConfig.Images?.MaxImageDimension);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(ImageExtractionConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "ImageExtractionConfig should have at least one settable property");

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
        var config = new ImageExtractionConfig
        {
            ExtractImages = null,
            TargetDpi = null,
            MaxImageDimension = null,
            AutoAdjustDpi = null,
            MinDpi = null,
            MaxDpi = null
        };

        Assert.Null(config.ExtractImages);
        Assert.Null(config.TargetDpi);
        Assert.Null(config.MaxImageDimension);
        Assert.Null(config.AutoAdjustDpi);
        Assert.Null(config.MinDpi);
        Assert.Null(config.MaxDpi);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new ImageExtractionConfig
        {
            ExtractImages = true,
            TargetDpi = 300
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("extract_images", json);
        Assert.Contains("target_dpi", json);
        Assert.Contains("true", json);
        Assert.Contains("300", json);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new ImageExtractionConfig
        {
            ExtractImages = true,
            TargetDpi = 250,
            MaxImageDimension = 3000,
            AutoAdjustDpi = true,
            MinDpi = 100,
            MaxDpi = 500
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<ImageExtractionConfig>(json);

        Assert.NotNull(restored);
        Assert.True(restored.ExtractImages);
        Assert.Equal(250, restored.TargetDpi);
        Assert.Equal(3000, restored.MaxImageDimension);
        Assert.True(restored.AutoAdjustDpi);
        Assert.Equal(100, restored.MinDpi);
        Assert.Equal(500, restored.MaxDpi);
    }
}
