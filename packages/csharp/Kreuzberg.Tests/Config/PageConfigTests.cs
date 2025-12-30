using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for PageConfig.
/// Tests page extraction, page markers, and page tracking options.
/// </summary>
public class PageConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new PageConfig();

        Assert.Null(config.ExtractPages);
        Assert.Null(config.InsertPageMarkers);
        Assert.Null(config.MarkerFormat);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new PageConfig
        {
            ExtractPages = true,
            InsertPageMarkers = true,
            MarkerFormat = "[PAGE_{0}]"
        };

        Assert.True(config.ExtractPages);
        Assert.True(config.InsertPageMarkers);
        Assert.Equal("[PAGE_{0}]", config.MarkerFormat);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new PageConfig
        {
            ExtractPages = true,
            InsertPageMarkers = false,
            MarkerFormat = "---Page {0}---"
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<PageConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.ExtractPages, restored.ExtractPages);
        Assert.Equal(original.InsertPageMarkers, restored.InsertPageMarkers);
        Assert.Equal(original.MarkerFormat, restored.MarkerFormat);
    }

    [Fact]
    public void ExtractPages_ShouldControlPageExtraction()
    {
        var configEnabled = new PageConfig { ExtractPages = true };
        var configDisabled = new PageConfig { ExtractPages = false };

        Assert.True(configEnabled.ExtractPages);
        Assert.False(configDisabled.ExtractPages);
    }

    [Fact]
    public void InsertPageMarkers_ShouldControlMarkerInsertion()
    {
        var configEnabled = new PageConfig { InsertPageMarkers = true };
        var configDisabled = new PageConfig { InsertPageMarkers = false };

        Assert.True(configEnabled.InsertPageMarkers);
        Assert.False(configDisabled.InsertPageMarkers);
    }

    [Theory]
    [InlineData("[PAGE_N]")]
    [InlineData("Page: N")]
    [InlineData("---Page {0}---")]
    [InlineData("\\n===== PAGE {0} =====\\n")]
    public void MarkerFormat_ShouldAcceptValidFormats(string format)
    {
        var config = new PageConfig { MarkerFormat = format };

        Assert.Equal(format, config.MarkerFormat);
    }

    [Fact]
    public void Nesting_ShouldWorkInExtractionConfig()
    {
        var pageConfig = new PageConfig
        {
            ExtractPages = true,
            InsertPageMarkers = true,
            MarkerFormat = "[PAGE_{0}]"
        };
        var extractionConfig = new ExtractionConfig { Pages = pageConfig };

        Assert.True(extractionConfig.Pages?.ExtractPages);
        Assert.True(extractionConfig.Pages?.InsertPageMarkers);
        Assert.Equal("[PAGE_{0}]", extractionConfig.Pages?.MarkerFormat);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(PageConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "PageConfig should have at least one settable property");

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
        var config = new PageConfig
        {
            ExtractPages = null,
            InsertPageMarkers = null,
            MarkerFormat = null
        };

        Assert.Null(config.ExtractPages);
        Assert.Null(config.InsertPageMarkers);
        Assert.Null(config.MarkerFormat);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new PageConfig
        {
            ExtractPages = true,
            InsertPageMarkers = true,
            MarkerFormat = "[PAGE_N]"
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("extract_pages", json);
        Assert.Contains("insert_page_markers", json);
        Assert.Contains("marker_format", json);
        Assert.Contains("true", json);
        Assert.Contains("[PAGE_N]", json);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new PageConfig
        {
            ExtractPages = true,
            InsertPageMarkers = true,
            MarkerFormat = "---Page {0}---"
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<PageConfig>(json);

        Assert.NotNull(restored);
        Assert.True(restored.ExtractPages);
        Assert.True(restored.InsertPageMarkers);
        Assert.Equal("---Page {0}---", restored.MarkerFormat);
    }

    [Fact]
    public void MarkerFormat_CanBeEmpty()
    {
        var config = new PageConfig { MarkerFormat = string.Empty };

        Assert.Equal(string.Empty, config.MarkerFormat);
    }

    [Fact]
    public void PartialConfiguration_ShouldWork()
    {
        var config1 = new PageConfig { ExtractPages = true };
        var config2 = new PageConfig { InsertPageMarkers = true };
        var config3 = new PageConfig { MarkerFormat = "[PAGE]" };

        Assert.True(config1.ExtractPages);
        Assert.Null(config1.InsertPageMarkers);

        Assert.Null(config2.ExtractPages);
        Assert.True(config2.InsertPageMarkers);

        Assert.Equal("[PAGE]", config3.MarkerFormat);
        Assert.Null(config3.ExtractPages);
    }
}
