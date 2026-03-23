//! Integration tests verifying DocumentStructure output for all migrated extractors.

mod helpers;

use kreuzberg::core::config::ExtractionConfig;
use kreuzberg::core::extractor::extract_file;
use kreuzberg::rendering::render_to_markdown;
use kreuzberg::types::document_structure::NodeContent;

/// Helper: check whether a document contains at least one node matching a predicate.
fn has_node_type(
    doc: &kreuzberg::types::document_structure::DocumentStructure,
    predicate: fn(&NodeContent) -> bool,
) -> bool {
    doc.nodes.iter().any(|n| predicate(&n.content))
}

/// Build an `ExtractionConfig` with document structure enabled.
fn config_with_structure() -> ExtractionConfig {
    ExtractionConfig {
        include_document_structure: true,
        ..Default::default()
    }
}

// ============================================================================
// 1. DOCX
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_docx() {
    let path = helpers::get_test_file_path("docx/unit_test_headers.docx");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("DOCX extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert!(
        !doc.nodes.is_empty(),
        "document nodes should be non-empty for DOCX"
    );
    assert_eq!(
        doc.source_format.as_deref(),
        Some("docx"),
        "source_format should be 'docx'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Heading { .. })),
        "DOCX with headers should contain Heading nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 2. PPTX
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_pptx() {
    let path = helpers::get_test_file_path("pptx/powerpoint_sample.ppsx");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("PPTX extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("pptx"),
        "source_format should be 'pptx'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Slide { .. })),
        "PPTX should contain Slide nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 3. HTML
// ============================================================================

#[cfg(feature = "html")]
#[tokio::test]
async fn test_document_structure_html() {
    let path = helpers::get_test_file_path("html/html.htm");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("HTML extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("html"),
        "source_format should be 'html'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Heading { .. })),
        "HTML should contain Heading nodes"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Paragraph { .. })),
        "HTML should contain Paragraph nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 4. LaTeX
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_latex() {
    let path = helpers::get_test_file_path("latex/basic_sections.tex");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("LaTeX extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("latex"),
        "source_format should be 'latex'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Heading { .. })),
        "LaTeX with \\section commands should contain Heading nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 5. RST
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_rst() {
    let path = helpers::get_test_file_path("rst/restructured_text.rst");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("RST extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("rst"),
        "source_format should be 'rst'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Heading { .. })),
        "RST should contain Heading nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 6. Org Mode
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_orgmode() {
    let path = helpers::get_test_file_path("org/comprehensive.org");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("OrgMode extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("orgmode"),
        "source_format should be 'orgmode'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Heading { .. })),
        "OrgMode with * headings should contain Heading nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 7. EPUB
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_epub() {
    let path = helpers::get_test_file_path("epub/features.epub");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("EPUB extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("epub"),
        "source_format should be 'epub'"
    );
    assert!(
        !doc.nodes.is_empty(),
        "document nodes should be non-empty for EPUB"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 8. Excel
// ============================================================================

#[cfg(any(feature = "excel", feature = "excel-wasm"))]
#[tokio::test]
async fn test_document_structure_excel() {
    let path = helpers::get_test_file_path("xlsx/excel_multi_sheet.xlsx");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("Excel extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("excel"),
        "source_format should be 'excel'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Table { .. })),
        "Excel should contain Table nodes from sheet data"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Heading { .. })),
        "Excel should contain Heading nodes from sheet names"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 9. CSV
// ============================================================================

#[tokio::test]
async fn test_document_structure_csv() {
    let path = helpers::get_test_file_path("csv/data_table.csv");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("CSV extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("csv"),
        "source_format should be 'csv'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Table { .. })),
        "CSV should contain Table nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 10. Email
// ============================================================================

#[cfg(feature = "email")]
#[tokio::test]
async fn test_document_structure_email() {
    let path = helpers::get_test_file_path("email/fake_email.msg");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("Email extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("email"),
        "source_format should be 'email'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::MetadataBlock { .. })),
        "Email should contain MetadataBlock nodes from headers"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Paragraph { .. })),
        "Email should contain Paragraph nodes from body"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 11. BibTeX
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_bibtex() {
    let path = helpers::get_test_file_path("bibtex/comprehensive.bib");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("BibTeX extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("bibtex"),
        "source_format should be 'bibtex'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Citation { .. })),
        "BibTeX should contain Citation nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 12. Jupyter
// ============================================================================

#[cfg(feature = "office")]
#[tokio::test]
async fn test_document_structure_jupyter() {
    let path = helpers::get_test_file_path("jupyter/mime.ipynb");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("Jupyter extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("jupyter"),
        "source_format should be 'jupyter'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Code { .. })),
        "Jupyter should contain Code nodes from code cells"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 13. PlainText
// ============================================================================

#[tokio::test]
async fn test_document_structure_plaintext() {
    let path = helpers::get_test_file_path("text/contract.txt");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("PlainText extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    assert_eq!(
        doc.source_format.as_deref(),
        Some("text"),
        "source_format should be 'text'"
    );
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Paragraph { .. })),
        "PlainText should contain Paragraph nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}

// ============================================================================
// 14. Markdown
// ============================================================================

#[tokio::test]
async fn test_document_structure_markdown() {
    let path = helpers::get_test_file_path("markdown/comprehensive.md");
    if !path.exists() {
        return;
    }

    let config = config_with_structure();
    let result = extract_file(&path, None, &config)
        .await
        .expect("Markdown extraction should succeed");

    assert!(result.document.is_some(), "document should be populated");
    let doc = result.document.as_ref().unwrap();

    // When the `office` feature is enabled, the EnhancedMarkdownExtractor takes
    // priority and delegates document structure to the pipeline fallback, which
    // does not set source_format. The basic MarkdownExtractor (always registered)
    // sets source_format = "markdown" natively.
    if doc.source_format.is_some() {
        assert_eq!(
            doc.source_format.as_deref(),
            Some("markdown"),
            "source_format should be 'markdown' when set"
        );
    }
    assert!(
        doc.validate().is_ok(),
        "document structure validation should pass"
    );
    assert!(
        has_node_type(doc, |c| matches!(c, NodeContent::Heading { .. }))
            || has_node_type(doc, |c| matches!(c, NodeContent::Paragraph { .. })),
        "Markdown should contain Heading or Paragraph nodes"
    );

    let md = render_to_markdown(doc);
    assert!(
        !md.trim().is_empty(),
        "render_to_markdown should produce non-empty output"
    );
}
