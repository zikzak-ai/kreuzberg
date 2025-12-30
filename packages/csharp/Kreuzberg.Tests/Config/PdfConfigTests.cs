using System;
using System.Collections.Generic;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for PdfConfig.
/// Tests PDF-specific options like image extraction, encryption, and hierarchy detection.
/// </summary>
public class PdfConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new PdfConfig();

        Assert.Null(config.ExtractImages);
        Assert.Null(config.Passwords);
        Assert.Null(config.ExtractMetadata);
        Assert.Null(config.FontConfig);
        Assert.Null(config.Hierarchy);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var fontConfig = new FontConfig { FontFallbackEnabled = true };
        var hierarchyConfig = new HierarchyConfig { Enabled = true };

        var config = new PdfConfig
        {
            ExtractImages = true,
            Passwords = new List<string> { "pass123" },
            ExtractMetadata = true,
            FontConfig = fontConfig,
            Hierarchy = hierarchyConfig
        };

        Assert.True(config.ExtractImages);
        Assert.NotNull(config.Passwords);
        Assert.Single(config.Passwords);
        Assert.True(config.ExtractMetadata);
        Assert.NotNull(config.FontConfig);
        Assert.NotNull(config.Hierarchy);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new PdfConfig
        {
            ExtractImages = true,
            ExtractMetadata = false,
            Passwords = new List<string> { "password1", "password2" }
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<PdfConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.ExtractImages, restored.ExtractImages);
        Assert.Equal(original.ExtractMetadata, restored.ExtractMetadata);
        Assert.Equal(2, restored.Passwords?.Count);
    }

    [Fact]
    public void Serialize_ShouldIncludeNestedConfigs()
    {
        var config = new PdfConfig
        {
            ExtractImages = true,
            FontConfig = new FontConfig { FontFallbackEnabled = true },
            Hierarchy = new HierarchyConfig { Enabled = true, KClusters = 10 }
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<PdfConfig>(json);

        Assert.NotNull(restored?.FontConfig);
        Assert.True(restored.FontConfig.FontFallbackEnabled);
        Assert.NotNull(restored.Hierarchy);
        Assert.Equal(10, restored.Hierarchy.KClusters);
    }

    [Fact]
    public void ExtractImages_ShouldControlImageExtraction()
    {
        var configEnabled = new PdfConfig { ExtractImages = true };
        var configDisabled = new PdfConfig { ExtractImages = false };

        Assert.True(configEnabled.ExtractImages);
        Assert.False(configDisabled.ExtractImages);
    }

    [Fact]
    public void ExtractMetadata_ShouldControlMetadataExtraction()
    {
        var configEnabled = new PdfConfig { ExtractMetadata = true };
        var configDisabled = new PdfConfig { ExtractMetadata = false };

        Assert.True(configEnabled.ExtractMetadata);
        Assert.False(configDisabled.ExtractMetadata);
    }

    [Fact]
    public void Passwords_ShouldAcceptMultiplePasswords()
    {
        var passwords = new List<string> { "pass1", "pass2", "pass3" };
        var config = new PdfConfig { Passwords = passwords };

        Assert.NotNull(config.Passwords);
        Assert.Equal(3, config.Passwords.Count);
        Assert.Contains("pass2", config.Passwords);
    }

    [Fact]
    public void FontConfig_ShouldNestProperly()
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
    public void Hierarchy_ShouldNestProperly()
    {
        var hierarchyConfig = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 8,
            IncludeBbox = true
        };
        var pdfConfig = new PdfConfig { Hierarchy = hierarchyConfig };

        Assert.True(pdfConfig.Hierarchy?.Enabled);
        Assert.Equal(8, pdfConfig.Hierarchy?.KClusters);
        Assert.True(pdfConfig.Hierarchy?.IncludeBbox);
    }

    [Fact]
    public void Nesting_ShouldWorkInExtractionConfig()
    {
        var pdfConfig = new PdfConfig
        {
            ExtractImages = true,
            ExtractMetadata = true
        };
        var extractionConfig = new ExtractionConfig { PdfOptions = pdfConfig };

        Assert.True(extractionConfig.PdfOptions?.ExtractImages);
        Assert.True(extractionConfig.PdfOptions?.ExtractMetadata);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(PdfConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "PdfConfig should have at least one settable property");

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
        var config = new PdfConfig
        {
            ExtractImages = null,
            Passwords = null,
            ExtractMetadata = null,
            FontConfig = null,
            Hierarchy = null
        };

        Assert.Null(config.ExtractImages);
        Assert.Null(config.Passwords);
        Assert.Null(config.ExtractMetadata);
        Assert.Null(config.FontConfig);
        Assert.Null(config.Hierarchy);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new PdfConfig
        {
            ExtractImages = true,
            ExtractMetadata = true,
            Passwords = new List<string> { "test" }
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("extract_images", json);
        Assert.Contains("extract_metadata", json);
        Assert.Contains("passwords", json);
        Assert.Contains("true", json);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new PdfConfig
        {
            ExtractImages = true,
            ExtractMetadata = true,
            Passwords = new List<string> { "pwd1", "pwd2" },
            FontConfig = new FontConfig { FontFallbackEnabled = true },
            Hierarchy = new HierarchyConfig { Enabled = true, KClusters = 10 }
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<PdfConfig>(json);

        Assert.NotNull(restored);
        Assert.True(restored.ExtractImages);
        Assert.True(restored.ExtractMetadata);
        Assert.Equal(2, restored.Passwords?.Count);
        Assert.NotNull(restored.FontConfig);
        Assert.NotNull(restored.Hierarchy);
    }
}
