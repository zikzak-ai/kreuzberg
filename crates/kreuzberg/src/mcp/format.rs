//! MCP response formatting and configuration helpers.
//!
//! This module provides utilities for formatting extraction results and building configurations.

use crate::{ExtractionConfig, ExtractionResult as KreuzbergResult};

/// Merge two extraction configurations, with override values taking precedence.
///
/// This function performs a field-by-field merge where override fields replace
/// base config fields when they differ from their defaults. This allows partial
/// config updates while preserving unspecified fields from the base config.
///
/// # Strategy
///
/// For each field in ExtractionConfig:
/// - If the override field is non-default, use the override value
/// - If the override field is default, use the base config value
/// - For Option types, override takes precedence if Some
/// - For boolean types, override takes precedence if true (or explicitly set)
///
/// # Examples
///
/// ```rust,no_run
/// use kreuzberg::{ExtractionConfig, OutputFormat};
///
/// let mut base = ExtractionConfig::default();
/// base.use_cache = true;
///
/// let override_json = serde_json::json!({
///     "force_ocr": true,
/// });
///
/// let override_config: ExtractionConfig =
///     serde_json::from_value(override_json).unwrap();
///
/// let merged = merge_configs(&base, &override_config);
/// assert_eq!(merged.use_cache, true);  // from base
/// assert_eq!(merged.force_ocr, true);  // from override
/// ```
fn merge_configs(base: &ExtractionConfig, override_config: &ExtractionConfig) -> ExtractionConfig {
    ExtractionConfig {
        // Boolean fields: use override if true, otherwise use base
        use_cache: if override_config.use_cache == ExtractionConfig::default().use_cache {
            base.use_cache
        } else {
            override_config.use_cache
        },
        enable_quality_processing: if override_config.enable_quality_processing
            == ExtractionConfig::default().enable_quality_processing
        {
            base.enable_quality_processing
        } else {
            override_config.enable_quality_processing
        },
        force_ocr: if override_config.force_ocr {
            true
        } else {
            base.force_ocr
        },

        // Option fields: override takes precedence if Some, otherwise use base
        ocr: override_config.ocr.clone().or_else(|| base.ocr.clone()),
        chunking: override_config.chunking.clone().or_else(|| base.chunking.clone()),
        images: override_config.images.clone().or_else(|| base.images.clone()),

        #[cfg(feature = "pdf")]
        pdf_options: override_config
            .pdf_options
            .clone()
            .or_else(|| base.pdf_options.clone()),

        token_reduction: override_config
            .token_reduction
            .clone()
            .or_else(|| base.token_reduction.clone()),
        language_detection: override_config
            .language_detection
            .clone()
            .or_else(|| base.language_detection.clone()),
        pages: override_config.pages.clone().or_else(|| base.pages.clone()),

        #[cfg(any(feature = "keywords-yake", feature = "keywords-rake"))]
        keywords: override_config.keywords.clone().or_else(|| base.keywords.clone()),

        postprocessor: override_config
            .postprocessor
            .clone()
            .or_else(|| base.postprocessor.clone()),

        #[cfg(feature = "html")]
        html_options: override_config
            .html_options
            .clone()
            .or_else(|| base.html_options.clone()),

        // Numeric option fields: override takes precedence if Some
        max_concurrent_extractions: override_config
            .max_concurrent_extractions
            .or(base.max_concurrent_extractions),

        // Enum fields: override takes precedence if not default
        result_format: if override_config.result_format == ExtractionConfig::default().result_format {
            base.result_format
        } else {
            override_config.result_format
        },
        output_format: if override_config.output_format == ExtractionConfig::default().output_format {
            base.output_format
        } else {
            override_config.output_format
        },
    }
}

/// Build extraction config from MCP parameters.
///
/// Merges the provided config JSON (if any) with the default config using field-by-field
/// merge semantics. Unspecified fields in the JSON preserve their values from the default config.
pub(super) fn build_config(
    default_config: &ExtractionConfig,
    config_json: Option<serde_json::Value>,
) -> Result<ExtractionConfig, String> {
    if let Some(json) = config_json {
        // Attempt to deserialize the provided config JSON
        match serde_json::from_value::<ExtractionConfig>(json) {
            Ok(provided_config) => {
                // Merge: provided config overrides default, but default is preserved for unspecified fields
                Ok(merge_configs(default_config, &provided_config))
            }
            Err(e) => Err(format!("Invalid extraction config: {}", e)),
        }
    } else {
        // No config provided, use default
        Ok(default_config.clone())
    }
}

/// Format extraction result as human-readable text.
pub(super) fn format_extraction_result(result: &KreuzbergResult) -> String {
    let mut response = String::new();

    response.push_str(&format!("Content ({} characters):\n", result.content.len()));
    response.push_str(&result.content);
    response.push_str("\n\n");

    response.push_str("Metadata:\n");
    response.push_str(&serde_json::to_string_pretty(&result.metadata).unwrap_or_default());
    response.push_str("\n\n");

    if !result.tables.is_empty() {
        response.push_str(&format!("Tables ({}):\n", result.tables.len()));
        for (i, table) in result.tables.iter().enumerate() {
            response.push_str(&format!("\nTable {} (page {}):\n", i + 1, table.page_number));
            response.push_str(&table.markdown);
            response.push('\n');
        }
    }

    response
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_config_with_no_config() {
        let default_config = ExtractionConfig::default();

        let config = build_config(&default_config, None).unwrap();
        assert_eq!(config.use_cache, default_config.use_cache);
    }

    #[test]
    fn test_build_config_with_config_json() {
        let default_config = ExtractionConfig::default();
        let config_json = serde_json::json!({
            "use_cache": false
        });

        let config = build_config(&default_config, Some(config_json)).unwrap();
        assert!(!config.use_cache);
    }

    #[test]
    fn test_build_config_with_invalid_config_json() {
        let default_config = ExtractionConfig::default();
        // Provide invalid type for a field (string instead of boolean)
        let config_json = serde_json::json!({
            "use_cache": "not_a_boolean"
        });

        let result = build_config(&default_config, Some(config_json));
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Invalid extraction config"));
    }

    #[test]
    fn test_build_config_preserves_default_config_settings() {
        let default_config = ExtractionConfig {
            use_cache: false,
            ..Default::default()
        };

        let config = build_config(&default_config, None).unwrap();

        assert!(!config.use_cache);
    }

    #[test]
    fn test_build_config_overrides_default_settings() {
        let default_config = ExtractionConfig {
            use_cache: true,
            ..Default::default()
        };

        let config_json = serde_json::json!({
            "use_cache": false
        });

        let config = build_config(&default_config, Some(config_json)).unwrap();
        assert!(!config.use_cache);
    }

    #[test]
    fn test_build_config_merges_partial_config() {
        // Base config with custom use_cache setting
        let default_config = ExtractionConfig {
            use_cache: false,
            enable_quality_processing: true,
            force_ocr: false,
            ..Default::default()
        };

        // Override only force_ocr
        let config_json = serde_json::json!({
            "force_ocr": true
        });

        let config = build_config(&default_config, Some(config_json)).unwrap();

        // use_cache should be preserved from default_config
        assert!(!config.use_cache, "use_cache should be preserved from default config");
        // enable_quality_processing should be preserved
        assert!(config.enable_quality_processing, "enable_quality_processing should be preserved");
        // force_ocr should be overridden
        assert!(config.force_ocr, "force_ocr should be overridden to true");
    }

    #[test]
    fn test_build_config_merges_nested_config() {
        let default_config = ExtractionConfig {
            use_cache: true,
            ..Default::default()
        };

        // Override output format only
        let config_json = serde_json::json!({
            "output_format": "markdown"
        });

        let config = build_config(&default_config, Some(config_json)).unwrap();

        // use_cache should be preserved
        assert!(config.use_cache, "use_cache should be preserved from default config");
        // output_format should be overridden
        assert_eq!(
            config.output_format,
            crate::core::config::formats::OutputFormat::Markdown,
            "output_format should be overridden to markdown"
        );
    }

    #[test]
    fn test_build_config_merges_with_custom_defaults() {
        // Create a default config with custom values
        let mut default_config = ExtractionConfig::default();
        default_config.use_cache = false;
        default_config.enable_quality_processing = true;
        default_config.force_ocr = false;

        // Provide partial override (only force_ocr)
        let config_json = serde_json::json!({
            "force_ocr": true,
        });

        let config = build_config(&default_config, Some(config_json)).unwrap();

        // force_ocr should be overridden
        assert!(config.force_ocr, "force_ocr should be overridden to true");
        // use_cache should be preserved from default_config
        assert!(!config.use_cache, "use_cache should be preserved from default config (false)");
        // enable_quality_processing should be preserved
        assert!(config.enable_quality_processing, "enable_quality_processing should be preserved (true)");
    }

    #[test]
    fn test_build_config_merges_multiple_fields() {
        let default_config = ExtractionConfig {
            use_cache: true,
            enable_quality_processing: false,
            force_ocr: true,
            ..Default::default()
        };

        // Override multiple fields
        let config_json = serde_json::json!({
            "use_cache": false,
            "output_format": "markdown",
        });

        let config = build_config(&default_config, Some(config_json)).unwrap();

        // use_cache should be overridden
        assert!(!config.use_cache, "use_cache should be overridden to false");
        // output_format should be overridden
        assert_eq!(
            config.output_format,
            crate::core::config::formats::OutputFormat::Markdown,
            "output_format should be overridden to markdown"
        );
        // force_ocr should be preserved (not in override)
        assert!(config.force_ocr, "force_ocr should be preserved from default config (true)");
        // enable_quality_processing should be preserved
        assert!(!config.enable_quality_processing, "enable_quality_processing should be preserved (false)");
    }

    #[test]
    fn test_format_extraction_result_with_content() {
        let result = KreuzbergResult {
            content: "Sample extracted text".to_string(),
            mime_type: "text/plain".to_string(),
            metadata: crate::Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            elements: None,
            djot_content: None,
        };

        let formatted = format_extraction_result(&result);

        assert!(formatted.contains("Content (21 characters)"));
        assert!(formatted.contains("Sample extracted text"));
        assert!(formatted.contains("Metadata:"));
    }

    #[test]
    fn test_format_extraction_result_with_tables() {
        let result = KreuzbergResult {
            content: "Document with tables".to_string(),
            mime_type: "application/pdf".to_string(),
            metadata: crate::Metadata::default(),
            tables: vec![
                crate::Table {
                    cells: vec![
                        vec!["Col1".to_string(), "Col2".to_string()],
                        vec!["A".to_string(), "B".to_string()],
                    ],
                    page_number: 1,
                    markdown: "| Col1 | Col2 |\n|------|------|\n| A    | B    |".to_string(),
                },
                crate::Table {
                    cells: vec![
                        vec!["X".to_string(), "Y".to_string()],
                        vec!["1".to_string(), "2".to_string()],
                    ],
                    page_number: 2,
                    markdown: "| X | Y |\n|---|---|\n| 1 | 2 |".to_string(),
                },
            ],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            elements: None,
            djot_content: None,
        };

        let formatted = format_extraction_result(&result);

        assert!(formatted.contains("Tables (2)"));
        assert!(formatted.contains("Table 1 (page 1)"));
        assert!(formatted.contains("Table 2 (page 2)"));
        assert!(formatted.contains("| Col1 | Col2 |"));
        assert!(formatted.contains("| X | Y |"));
    }

    #[test]
    fn test_format_extraction_result_empty_content() {
        let result = KreuzbergResult {
            content: String::new(),
            mime_type: "text/plain".to_string(),
            metadata: crate::Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            elements: None,
            djot_content: None,
        };

        let formatted = format_extraction_result(&result);

        assert!(formatted.contains("Content (0 characters)"));
        assert!(formatted.contains("Metadata:"));
    }

    #[test]
    fn test_format_extraction_result_no_tables() {
        let result = KreuzbergResult {
            content: "Simple text".to_string(),
            mime_type: "text/plain".to_string(),
            metadata: crate::Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            elements: None,
            djot_content: None,
        };

        let formatted = format_extraction_result(&result);

        assert!(formatted.contains("Simple text"));
        assert!(!formatted.contains("Tables"));
    }
}
