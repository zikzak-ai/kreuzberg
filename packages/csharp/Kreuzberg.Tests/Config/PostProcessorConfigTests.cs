using System;
using System.Collections.Generic;
using System.Text.Json;
using Xunit;

namespace Kreuzberg.Tests.Config;

/// <summary>
/// Comprehensive configuration tests for PostProcessorConfig.
/// Tests post-processor enablement, processor lists, and filtering options.
/// </summary>
public class PostProcessorConfigTests
{
    [Fact]
    public void Constructor_ShouldCreateWithDefaults()
    {
        var config = new PostProcessorConfig();

        Assert.Null(config.Enabled);
        Assert.Null(config.EnabledProcessors);
        Assert.Null(config.DisabledProcessors);
    }

    [Fact]
    public void Constructor_ShouldCreateWithCustomValues()
    {
        var config = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = new List<string> { "processor1", "processor2" },
            DisabledProcessors = new List<string> { "processor3" }
        };

        Assert.True(config.Enabled);
        Assert.NotNull(config.EnabledProcessors);
        Assert.Equal(2, config.EnabledProcessors.Count);
        Assert.NotNull(config.DisabledProcessors);
        Assert.Single(config.DisabledProcessors);
    }

    [Fact]
    public void Serialize_ShouldRoundTrip()
    {
        var original = new PostProcessorConfig
        {
            Enabled = false,
            EnabledProcessors = new List<string> { "cleaner" },
            DisabledProcessors = new List<string> { "formatter", "optimizer" }
        };

        var json = JsonSerializer.Serialize(original);
        var restored = JsonSerializer.Deserialize<PostProcessorConfig>(json);

        Assert.NotNull(restored);
        Assert.Equal(original.Enabled, restored.Enabled);
        Assert.Equal(1, restored.EnabledProcessors?.Count);
        Assert.Equal(2, restored.DisabledProcessors?.Count);
    }

    [Fact]
    public void Enabled_ShouldControlPostProcessing()
    {
        var configEnabled = new PostProcessorConfig { Enabled = true };
        var configDisabled = new PostProcessorConfig { Enabled = false };

        Assert.True(configEnabled.Enabled);
        Assert.False(configDisabled.Enabled);
    }

    [Fact]
    public void EnabledProcessors_ShouldAcceptMultipleProcessors()
    {
        var processors = new List<string> { "cleaner", "formatter", "validator" };
        var config = new PostProcessorConfig { EnabledProcessors = processors };

        Assert.NotNull(config.EnabledProcessors);
        Assert.Equal(3, config.EnabledProcessors.Count);
        Assert.Contains("formatter", config.EnabledProcessors);
    }

    [Fact]
    public void DisabledProcessors_ShouldAcceptMultipleProcessors()
    {
        var processors = new List<string> { "optimizer", "compressor" };
        var config = new PostProcessorConfig { DisabledProcessors = processors };

        Assert.NotNull(config.DisabledProcessors);
        Assert.Equal(2, config.DisabledProcessors.Count);
        Assert.Contains("optimizer", config.DisabledProcessors);
    }

    [Fact]
    public void EnabledAndDisabledProcessors_CanCoexist()
    {
        var config = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = new List<string> { "proc1", "proc2" },
            DisabledProcessors = new List<string> { "proc3", "proc4" }
        };

        Assert.True(config.Enabled);
        Assert.Equal(2, config.EnabledProcessors?.Count);
        Assert.Equal(2, config.DisabledProcessors?.Count);
    }

    [Fact]
    public void EmptyProcessorLists_ShouldBeValid()
    {
        var config = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = new List<string>(),
            DisabledProcessors = new List<string>()
        };

        Assert.True(config.Enabled);
        Assert.Empty(config.EnabledProcessors!);
        Assert.Empty(config.DisabledProcessors!);
    }

    [Fact]
    public void Nesting_ShouldWorkInExtractionConfig()
    {
        var postProcessorConfig = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = new List<string> { "cleanup" }
        };
        var extractionConfig = new ExtractionConfig { Postprocessor = postProcessorConfig };

        Assert.True(extractionConfig.Postprocessor?.Enabled);
        Assert.Single(extractionConfig.Postprocessor?.EnabledProcessors!);
    }

    [Fact]
    public void AllPropertiesAreInitOnly()
    {
        var properties = typeof(PostProcessorConfig)
            .GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance)
            .Where(p => p.SetMethod != null)
            .ToList();

        Assert.True(properties.Count > 0, "PostProcessorConfig should have at least one settable property");

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
        var config = new PostProcessorConfig
        {
            Enabled = null,
            EnabledProcessors = null,
            DisabledProcessors = null
        };

        Assert.Null(config.Enabled);
        Assert.Null(config.EnabledProcessors);
        Assert.Null(config.DisabledProcessors);
    }

    [Fact]
    public void Serialization_ShouldUseJsonPropertyNames()
    {
        var config = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = new List<string> { "cleaner" }
        };
        var json = JsonSerializer.Serialize(config);

        Assert.Contains("\"enabled\"", json);
        Assert.Contains("\"enabled_processors\"", json);
        Assert.Contains("true", json);
        Assert.Contains("\"cleaner\"", json);
    }

    [Fact]
    public void ProcessorNames_CanBeLongStrings()
    {
        var config = new PostProcessorConfig
        {
            EnabledProcessors = new List<string>
            {
                "custom_text_cleaner_v2",
                "intelligent_content_formatter_enhanced"
            }
        };

        Assert.Equal(2, config.EnabledProcessors?.Count);
        Assert.Contains("custom_text_cleaner_v2", config.EnabledProcessors!);
    }

    [Fact]
    public void CompleteConfiguration_WithAllFields()
    {
        var config = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = new List<string> { "cleaner", "formatter" },
            DisabledProcessors = new List<string> { "optimizer" }
        };

        var json = JsonSerializer.Serialize(config);
        var restored = JsonSerializer.Deserialize<PostProcessorConfig>(json);

        Assert.NotNull(restored);
        Assert.True(restored.Enabled);
        Assert.Equal(2, restored.EnabledProcessors?.Count);
        Assert.Single(restored.DisabledProcessors!);
    }

    [Fact]
    public void OnlyEnabledProcessors()
    {
        var config = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = new List<string> { "processor1", "processor2", "processor3" },
            DisabledProcessors = null
        };

        Assert.True(config.Enabled);
        Assert.Equal(3, config.EnabledProcessors?.Count);
        Assert.Null(config.DisabledProcessors);
    }

    [Fact]
    public void OnlyDisabledProcessors()
    {
        var config = new PostProcessorConfig
        {
            Enabled = true,
            EnabledProcessors = null,
            DisabledProcessors = new List<string> { "processor4", "processor5" }
        };

        Assert.True(config.Enabled);
        Assert.Null(config.EnabledProcessors);
        Assert.Equal(2, config.DisabledProcessors?.Count);
    }
}
