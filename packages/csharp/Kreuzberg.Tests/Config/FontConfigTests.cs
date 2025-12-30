using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for FontConfig.
/// Tests font fallback settings and custom font directory paths.
/// </summary>
public class FontConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new FontConfig();

        Assert.Null(config.FontFallbackEnabled);
        Assert.Null(config.FontDir);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new FontConfig
        {
            FontFallbackEnabled = true,
            FontDir = "/usr/share/fonts"
        };

        Assert.True(config.FontFallbackEnabled);
        Assert.Equal("/usr/share/fonts", config.FontDir);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new FontConfig
        {
            FontFallbackEnabled = false,
            FontDir = "/opt/custom/fonts"
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<FontConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.FontFallbackEnabled, restored.FontFallbackEnabled);
        Assert.Equal(original.FontDir, restored.FontDir);
    }

    [Fact]
    public void FontFallbackEnabled_ShouldControlFallback()
    {
        var configEnabled = new FontConfig { FontFallbackEnabled = true };
        var configDisabled = new FontConfig { FontFallbackEnabled = false };

        Assert.True(configEnabled.FontFallbackEnabled);
        Assert.False(configDisabled.FontFallbackEnabled);
    }

    [Fact]
    public void FontDir_ShouldAcceptValidPaths()
    {
        var config1 = new FontConfig { FontDir = "/usr/share/fonts" };
        var config2 = new FontConfig { FontDir = "/opt/custom/fonts" };
        var config3 = new FontConfig { FontDir = "C:\\Windows\\Fonts" };
        var config4 = new FontConfig { FontDir = "./local/fonts" };

        Assert.Equal("/usr/share/fonts", config1.FontDir);
        Assert.Equal("/opt/custom/fonts", config2.FontDir);
        Assert.Equal("C:\\Windows\\Fonts", config3.FontDir);
        Assert.Equal("./local/fonts", config4.FontDir);
    }

    [Fact]
    public void FontDir_CanBeRelativePath()
    {
        var config = new FontConfig { FontDir = "./fonts" };

        Assert.Equal("./fonts", config.FontDir);
    }

    [Fact]
    public void FontDir_CanBeAbsolutePath()
    {
        var config = new FontConfig { FontDir = "/absolute/path/to/fonts" };

        Assert.Equal("/absolute/path/to/fonts", config.FontDir);
    }

    [Fact]
    public void FontDir_CanBeEmpty()
    {
        var config = new FontConfig { FontDir = string.Empty };

        Assert.Equal(string.Empty, config.FontDir);
    }

    [Fact]
    public void Nesting_ShouldWorkInPdfConfig()
    {
        var fontConfig = new FontConfig
        {
            FontFallbackEnabled = true,
            FontDir = "/usr/share/fonts"
        };
        var pdfConfig = new PdfConfig { FontConfig = fontConfig };

        Assert.True(pdfConfig.FontConfig?.FontFallbackEnabled);
        Assert.Equal("/usr/share/fonts", pdfConfig.FontConfig?.FontDir);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(FontConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "FontConfig should have at least one settable property");

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
        var config = new FontConfig
        {
            FontFallbackEnabled = null,
            FontDir = null
        };

        Assert.Null(config.FontFallbackEnabled);
        Assert.Null(config.FontDir);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new FontConfig
        {
            FontFallbackEnabled = true,
            FontDir = "/usr/share/fonts"
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("font_fallback_enabled", json);
        Assert.Contains("font_dir", json);
        Assert.Contains("true", json);
        Assert.Contains("/usr/share/fonts", json);
    }

    [Fact]
    public void UnixFontPath_ShouldBeValid()
    {
        var config = new FontConfig
        {
            FontFallbackEnabled = true,
            FontDir = "/usr/share/fonts/truetype"
        };

        Assert.True(config.FontFallbackEnabled);
        Assert.Equal("/usr/share/fonts/truetype", config.FontDir);
    }

    [Fact]
    public void WindowsFontPath_ShouldBeValid()
    {
        var config = new FontConfig
        {
            FontFallbackEnabled = false,
            FontDir = "C:\\Windows\\Fonts"
        };

        Assert.False(config.FontFallbackEnabled);
        Assert.Equal("C:\\Windows\\Fonts", config.FontDir);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new FontConfig
        {
            FontFallbackEnabled = true,
            FontDir = "/custom/fonts"
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<FontConfig>(json);

        Assert.NotNull(restored);
        Assert.True(restored.FontFallbackEnabled);
        Assert.Equal("/custom/fonts", restored.FontDir);
    }

    [Fact]
    public void FallbackOnlyWithoutCustomDir()
    {
        var config = new FontConfig
        {
            FontFallbackEnabled = true,
            FontDir = null
        };

        Assert.True(config.FontFallbackEnabled);
        Assert.Null(config.FontDir);
    }

    [Fact]
    public void CustomDirWithoutFallback()
    {
        var config = new FontConfig
        {
            FontFallbackEnabled = false,
            FontDir = "/special/fonts"
        };

        Assert.False(config.FontFallbackEnabled);
        Assert.Equal("/special/fonts", config.FontDir);
    }
}
