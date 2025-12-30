using System;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for HierarchyConfig.
/// Tests PDF hierarchy detection, clustering, and OCR coverage settings.
/// </summary>
public class HierarchyConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new HierarchyConfig();

        Assert.Null(config.Enabled);
        Assert.Null(config.KClusters);
        Assert.Null(config.IncludeBbox);
        Assert.Null(config.OcrCoverageThreshold);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 8,
            IncludeBbox = true,
            OcrCoverageThreshold = 0.75f
        };

        Assert.True(config.Enabled);
        Assert.Equal(8, config.KClusters);
        Assert.True(config.IncludeBbox);
        Assert.Equal(0.75f, config.OcrCoverageThreshold);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 10,
            IncludeBbox = false,
            OcrCoverageThreshold = 0.8f
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<HierarchyConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.Enabled, restored.Enabled);
        Assert.Equal(original.KClusters, restored.KClusters);
        Assert.Equal(original.IncludeBbox, restored.IncludeBbox);
        Assert.Equal(original.OcrCoverageThreshold, restored.OcrCoverageThreshold);
    }

    [Fact]
    public void Enabled_ShouldControlHierarchyDetection()
    {
        var configEnabled = new HierarchyConfig { Enabled = true };
        var configDisabled = new HierarchyConfig { Enabled = false };

        Assert.True(configEnabled.Enabled);
        Assert.False(configDisabled.Enabled);
    }

    [Fact]
    public void KClusters_ShouldAcceptValidValues()
    {
        var config1 = new HierarchyConfig { KClusters = 2 };
        var config2 = new HierarchyConfig { KClusters = 8 };
        var config3 = new HierarchyConfig { KClusters = 16 };
        var config4 = new HierarchyConfig { KClusters = 32 };

        Assert.Equal(2, config1.KClusters);
        Assert.Equal(8, config2.KClusters);
        Assert.Equal(16, config3.KClusters);
        Assert.Equal(32, config4.KClusters);
    }

    [Fact]
    public void IncludeBbox_ShouldControlBoundingBoxInclusion()
    {
        var configIncluded = new HierarchyConfig { IncludeBbox = true };
        var configExcluded = new HierarchyConfig { IncludeBbox = false };

        Assert.True(configIncluded.IncludeBbox);
        Assert.False(configExcluded.IncludeBbox);
    }

    [Fact]
    public void OcrCoverageThreshold_ShouldAcceptValidRange()
    {
        var config1 = new HierarchyConfig { OcrCoverageThreshold = 0.0f };
        var config2 = new HierarchyConfig { OcrCoverageThreshold = 0.5f };
        var config3 = new HierarchyConfig { OcrCoverageThreshold = 0.95f };
        var config4 = new HierarchyConfig { OcrCoverageThreshold = 1.0f };

        Assert.Equal(0.0f, config1.OcrCoverageThreshold);
        Assert.Equal(0.5f, config2.OcrCoverageThreshold);
        Assert.Equal(0.95f, config3.OcrCoverageThreshold);
        Assert.Equal(1.0f, config4.OcrCoverageThreshold);
    }

    [Fact]
    public void HighOcrThreshold_WithSmallClusters()
    {
        var config = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 4,
            OcrCoverageThreshold = 0.9f
        };

        Assert.True(config.Enabled);
        Assert.Equal(4, config.KClusters);
        Assert.Equal(0.9f, config.OcrCoverageThreshold);
    }

    [Fact]
    public void LowOcrThreshold_WithLargeClusters()
    {
        var config = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 20,
            OcrCoverageThreshold = 0.3f
        };

        Assert.True(config.Enabled);
        Assert.Equal(20, config.KClusters);
        Assert.Equal(0.3f, config.OcrCoverageThreshold);
    }

    [Fact]
    public void Nesting_ShouldWorkInPdfConfig()
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
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(HierarchyConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "HierarchyConfig should have at least one settable property");

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
        var config = new HierarchyConfig
        {
            Enabled = null,
            KClusters = null,
            IncludeBbox = null,
            OcrCoverageThreshold = null
        };

        Assert.Null(config.Enabled);
        Assert.Null(config.KClusters);
        Assert.Null(config.IncludeBbox);
        Assert.Null(config.OcrCoverageThreshold);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 10,
            IncludeBbox = true
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("\"enabled\"", json);
        Assert.Contains("\"k_clusters\"", json);
        Assert.Contains("\"include_bbox\"", json);
        Assert.Contains("true", json);
        Assert.Contains("10", json);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 12,
            IncludeBbox = true,
            OcrCoverageThreshold = 0.85f
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<HierarchyConfig>(json);

        Assert.NotNull(restored);
        Assert.True(restored.Enabled);
        Assert.Equal(12, restored.KClusters);
        Assert.True(restored.IncludeBbox);
        Assert.Equal(0.85f, restored.OcrCoverageThreshold);
    }

    [Fact]
    public void MinimalClustering()
    {
        var config = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 2
        };

        Assert.True(config.Enabled);
        Assert.Equal(2, config.KClusters);
    }

    [Fact]
    public void AggressiveClustering()
    {
        var config = new HierarchyConfig
        {
            Enabled = true,
            KClusters = 64
        };

        Assert.True(config.Enabled);
        Assert.Equal(64, config.KClusters);
    }
}
