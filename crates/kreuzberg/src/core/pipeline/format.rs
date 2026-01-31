//! Output format conversion for extraction results.
//!
//! This module handles conversion of extraction results to various output formats
//! (Plain, Djot, Markdown, HTML) with proper error handling and metadata recording.

use crate::core::config::OutputFormat;
use crate::types::ExtractionResult;
use std::borrow::Cow;

/// Apply output format conversion to the extraction result.
///
/// This function converts the result's content field based on the configured output format:
/// - `Plain`: No conversion (default)
/// - `Djot`: Use djot_content if available, otherwise keep plain text
/// - `Markdown`: Convert to Markdown format (uses djot as it's similar)
/// - `Html`: Convert to HTML format
///
/// Skips conversion if content was already formatted during extraction (e.g., HTML extractor
/// already produced djot or markdown output).
///
/// # Arguments
///
/// * `result` - The extraction result to modify
/// * `output_format` - The desired output format
pub fn apply_output_format(result: &mut ExtractionResult, output_format: OutputFormat) {
    // Check if content was already formatted during extraction
    let already_formatted = match &*result.mime_type {
        "text/markdown" if output_format == OutputFormat::Markdown => true,
        "text/djot" if output_format == OutputFormat::Djot => true,
        _ => false,
    };

    if already_formatted {
        return; // Skip re-conversion
    }

    match output_format {
        OutputFormat::Plain => {
            // Default - no conversion needed
        }
        OutputFormat::Djot => {
            // Convert the extraction result to djot markup
            match crate::extractors::djot_format::extraction_result_to_djot(result) {
                Ok(djot_markup) => {
                    result.content = djot_markup;
                }
                Err(e) => {
                    // Keep original content on error, record error in metadata
                    result.metadata.additional.insert(
                        Cow::Borrowed("output_format_error"),
                        serde_json::Value::String(format!("Failed to convert to djot: {}", e)),
                    );
                }
            }
        }
        OutputFormat::Markdown => {
            // Djot is syntactically similar to Markdown, so we use djot output as a
            // reasonable approximation. Full Markdown conversion would require a
            // dedicated converter that handles the syntactic differences (e.g.,
            // emphasis markers are swapped: djot uses _ for emphasis and * for strong,
            // while CommonMark uses * for emphasis and ** for strong).
            if result.djot_content.is_some() {
                match crate::extractors::djot_format::extraction_result_to_djot(result) {
                    Ok(djot_markup) => {
                        result.content = djot_markup;
                    }
                    Err(e) => {
                        // Keep original content on error, record error in metadata
                        result.metadata.additional.insert(
                            Cow::Borrowed("output_format_error"),
                            serde_json::Value::String(format!("Failed to convert to markdown: {}", e)),
                        );
                    }
                }
            }
            // For non-djot documents, content remains as-is
        }
        OutputFormat::Html => {
            // Convert to HTML format
            if result.djot_content.is_some() {
                // First generate djot markup, then convert to HTML
                match crate::extractors::djot_format::extraction_result_to_djot(result) {
                    Ok(djot_markup) => {
                        match crate::extractors::djot_format::djot_to_html(&djot_markup) {
                            Ok(html) => {
                                result.content = html;
                            }
                            Err(e) => {
                                // Keep original content on error, record error in metadata
                                result.metadata.additional.insert(
                                    Cow::Borrowed("output_format_error"),
                                    serde_json::Value::String(format!("Failed to convert djot to HTML: {}", e)),
                                );
                            }
                        }
                    }
                    Err(e) => {
                        // Keep original content on error, record error in metadata
                        result.metadata.additional.insert(
                            Cow::Borrowed("output_format_error"),
                            serde_json::Value::String(format!("Failed to generate djot for HTML conversion: {}", e)),
                        );
                    }
                }
            } else {
                // For non-djot documents, wrap plain text in basic HTML
                let escaped_content = html_escape(&result.content);
                result.content = format!("<pre>{}</pre>", escaped_content);
            }
        }
    }
}

/// Escape HTML special characters in a string.
fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Metadata;

    #[test]
    fn test_apply_output_format_plain() {
        let mut result = ExtractionResult {
            content: "Hello World".to_string(),
            mime_type: Cow::Borrowed("text/plain"),
            metadata: Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            djot_content: None,
            elements: None,
        };

        apply_output_format(&mut result, OutputFormat::Plain);

        // Plain format should not modify content
        assert_eq!(result.content, "Hello World");
    }

    #[test]
    fn test_apply_output_format_djot_with_djot_content() {
        use crate::types::{BlockType, DjotContent, FormattedBlock, InlineElement, InlineType};

        let mut result = ExtractionResult {
            content: "Hello World".to_string(),
            mime_type: Cow::Borrowed("text/djot"),
            metadata: Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            elements: None,
            djot_content: Some(DjotContent {
                plain_text: "Hello World".to_string(),
                blocks: vec![FormattedBlock {
                    block_type: BlockType::Heading,
                    level: Some(1),
                    inline_content: vec![InlineElement {
                        element_type: InlineType::Text,
                        content: "Hello World".to_string(),
                        attributes: None,
                        metadata: None,
                    }],
                    attributes: None,
                    language: None,
                    code: None,
                    children: vec![],
                }],
                metadata: Metadata::default(),
                tables: vec![],
                images: vec![],
                links: vec![],
                footnotes: vec![],
                attributes: Vec::new(),
            }),
        };

        apply_output_format(&mut result, OutputFormat::Djot);

        // The content should still be present (the function preserves content)
        assert!(!result.content.is_empty());
    }

    #[test]
    fn test_apply_output_format_djot_without_djot_content() {
        let mut result = ExtractionResult {
            content: "Hello World".to_string(),
            mime_type: Cow::Borrowed("text/plain"),
            metadata: Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            djot_content: None,
            elements: None,
        };

        apply_output_format(&mut result, OutputFormat::Djot);

        // Without djot_content, content is converted to djot paragraphs
        // extraction_result_to_djot creates paragraphs from plain text
        assert!(result.content.contains("Hello World"));
    }

    #[test]
    fn test_apply_output_format_html() {
        let mut result = ExtractionResult {
            content: "Hello World".to_string(),
            mime_type: Cow::Borrowed("text/plain"),
            metadata: Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            djot_content: None,
            elements: None,
        };

        apply_output_format(&mut result, OutputFormat::Html);

        // For non-djot documents, HTML wraps content in <pre> tags
        assert!(result.content.contains("<pre>"));
        assert!(result.content.contains("Hello World"));
        assert!(result.content.contains("</pre>"));
    }

    #[test]
    fn test_apply_output_format_html_escapes_special_chars() {
        let mut result = ExtractionResult {
            content: "<script>alert('XSS')</script>".to_string(),
            mime_type: Cow::Borrowed("text/plain"),
            metadata: Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            djot_content: None,
            elements: None,
        };

        apply_output_format(&mut result, OutputFormat::Html);

        // HTML special characters should be escaped
        assert!(result.content.contains("&lt;"));
        assert!(result.content.contains("&gt;"));
        assert!(!result.content.contains("<script>"));
    }

    #[test]
    fn test_apply_output_format_markdown() {
        let mut result = ExtractionResult {
            content: "Hello World".to_string(),
            mime_type: Cow::Borrowed("text/plain"),
            metadata: Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            djot_content: None,
            elements: None,
        };

        apply_output_format(&mut result, OutputFormat::Markdown);

        // For non-djot documents without djot_content, markdown keeps content as-is
        assert_eq!(result.content, "Hello World");
    }

    #[test]
    fn test_apply_output_format_preserves_metadata() {
        use ahash::AHashMap;
        let mut additional = AHashMap::new();
        additional.insert(Cow::Borrowed("custom_key"), serde_json::json!("custom_value"));
        let metadata = Metadata {
            title: Some("Test Title".to_string()),
            additional,
            ..Default::default()
        };

        let mut result = ExtractionResult {
            content: "Hello World".to_string(),
            mime_type: Cow::Borrowed("text/plain"),
            metadata,
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            djot_content: None,
            elements: None,
        };

        apply_output_format(&mut result, OutputFormat::Djot);

        // Metadata should be preserved
        assert_eq!(result.metadata.title, Some("Test Title".to_string()));
        assert_eq!(
            result.metadata.additional.get("custom_key"),
            Some(&serde_json::json!("custom_value"))
        );
    }

    #[test]
    fn test_apply_output_format_preserves_tables() {
        use crate::types::Table;

        let table = Table {
            cells: vec![vec!["A".to_string(), "B".to_string()]],
            markdown: "| A | B |".to_string(),
            page_number: 1,
        };

        let mut result = ExtractionResult {
            content: "Hello World".to_string(),
            mime_type: Cow::Borrowed("text/plain"),
            metadata: Metadata::default(),
            tables: vec![table],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            djot_content: None,
            elements: None,
        };

        apply_output_format(&mut result, OutputFormat::Html);

        // Tables should be preserved
        assert_eq!(result.tables.len(), 1);
        assert_eq!(result.tables[0].cells[0][0], "A");
    }

    #[test]
    fn test_apply_output_format_preserves_djot_content() {
        use crate::types::{BlockType, DjotContent, FormattedBlock, InlineElement, InlineType};

        let djot_content = DjotContent {
            plain_text: "test".to_string(),
            blocks: vec![FormattedBlock {
                block_type: BlockType::Paragraph,
                level: None,
                inline_content: vec![InlineElement {
                    element_type: InlineType::Text,
                    content: "test".to_string(),
                    attributes: None,
                    metadata: None,
                }],
                attributes: None,
                language: None,
                code: None,
                children: vec![],
            }],
            metadata: Metadata::default(),
            tables: vec![],
            images: vec![],
            links: vec![],
            footnotes: vec![],
            attributes: Vec::new(),
        };

        let mut result = ExtractionResult {
            content: "test".to_string(),
            mime_type: Cow::Borrowed("text/djot"),
            metadata: Metadata::default(),
            tables: vec![],
            detected_languages: None,
            chunks: None,
            images: None,
            pages: None,
            elements: None,
            djot_content: Some(djot_content),
        };

        apply_output_format(&mut result, OutputFormat::Djot);

        // djot_content should still be present after format application
        assert!(result.djot_content.is_some());
        assert_eq!(result.djot_content.as_ref().unwrap().blocks.len(), 1);
    }
}
