//! Regression tests for PPTX/PPSX extraction bugs
//!
//! GitHub Issue #321: PPTX extraction fails on shapes without txBody (image placeholders) + PPSX not supported
//!
//! Bug 1: "No txBody found" - PPTX extraction fails when any shape lacks a text body
//! Bug 2: PPSX not supported - PowerPoint Show files rejected entirely

#![cfg(feature = "office")]

use kreuzberg::{ExtractionConfig, extract_file};
use std::io::Write;
use tempfile::NamedTempFile;
use zip::CompressionMethod;
use zip::write::{FileOptions, ZipWriter};

/// Test that PPSX (PowerPoint Show) files are extracted correctly.
///
/// PPSX files use MIME type `application/vnd.openxmlformats-officedocument.presentationml.slideshow`
/// instead of PPTX's `application/vnd.openxmlformats-officedocument.presentationml.presentation`.
///
/// The internal structure is identical to PPTX - same slide XML format.
///
/// GitHub Issue #321 Bug 2
#[tokio::test]
async fn test_ppsx_slideshow_extraction() {
    let workspace_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("Operation failed")
        .parent()
        .expect("Operation failed");
    let test_file = workspace_root.join("test_documents/presentations/sample.ppsx");

    if !test_file.exists() {
        println!("Skipping test: PPSX test file not found at {:?}", test_file);
        return;
    }

    let result = extract_file(&test_file, None, &ExtractionConfig::default()).await;

    match result {
        Ok(extraction) => {
            assert!(!extraction.content.is_empty(), "PPSX content should not be empty");
            println!("✅ PPSX extraction succeeded!");
            println!("   Content length: {} chars", extraction.content.len());
            println!(
                "   Content preview: {}",
                &extraction.content[..extraction.content.len().min(200)]
            );
        }
        Err(e) => {
            panic!(
                "PPSX extraction failed with error: {:?}\n\
                 This is GitHub Issue #321 Bug 2: PPSX files should be supported.\n\
                 PPSX MIME type (application/vnd.openxmlformats-officedocument.presentationml.slideshow) \
                 needs to be added to extension-to-MIME mapping.",
                e
            );
        }
    }
}

/// Test that PPSX files can be extracted when MIME type is explicitly provided.
///
/// This validates that the PPTX extractor can handle PPSX content correctly
/// (the XML structure is identical), even if MIME detection fails.
///
/// GitHub Issue #321 Bug 2
#[tokio::test]
async fn test_ppsx_with_explicit_mime_type() {
    let workspace_root = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("Operation failed")
        .parent()
        .expect("Operation failed");
    let test_file = workspace_root.join("test_documents/presentations/sample.ppsx");

    if !test_file.exists() {
        println!("Skipping test: PPSX test file not found at {:?}", test_file);
        return;
    }

    // Explicitly provide the PPSX MIME type
    let result = extract_file(
        &test_file,
        Some("application/vnd.openxmlformats-officedocument.presentationml.slideshow"),
        &ExtractionConfig::default(),
    )
    .await;

    match result {
        Ok(extraction) => {
            assert!(!extraction.content.is_empty(), "PPSX content should not be empty");
            println!("✅ PPSX extraction with explicit MIME type succeeded!");
        }
        Err(e) => {
            panic!(
                "PPSX extraction with explicit MIME type failed: {:?}\n\
                 The PPTX extractor should handle PPSX content (identical XML structure).",
                e
            );
        }
    }
}

/// Test that PPTX files with image placeholder shapes (no txBody) are extracted correctly.
///
/// Some shapes in PPTX files, like image placeholders (`<p:ph type="pic"/>`), don't have
/// `<p:txBody>` children because they're designed to hold images, not text.
///
/// The parser should skip shapes without txBody gracefully instead of failing.
///
/// GitHub Issue #321 Bug 1
#[tokio::test]
async fn test_pptx_with_image_placeholder_no_txbody() {
    // Create a minimal PPTX with a shape that has no txBody (image placeholder)
    let mut temp_file = NamedTempFile::with_suffix(".pptx").expect("Failed to create temp file");

    {
        let mut zip = ZipWriter::new(&mut temp_file);
        let options: FileOptions<()> = FileOptions::default().compression_method(CompressionMethod::Stored);

        // Add [Content_Types].xml
        zip.start_file("[Content_Types].xml", options).expect("Operation failed");
        zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>"#).expect("Operation failed");

        // Add _rels/.rels
        zip.start_file("_rels/.rels", options).expect("Operation failed");
        zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>"#).expect("Operation failed");

        // Add ppt/presentation.xml
        zip.start_file("ppt/presentation.xml", options).expect("Operation failed");
        zip.write_all(
            br#"<?xml version="1.0" encoding="UTF-8"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
  </p:sldIdLst>
</p:presentation>"#,
        )
        .expect("Operation failed");

        // Add ppt/_rels/presentation.xml.rels
        zip.start_file("ppt/_rels/presentation.xml.rels", options).expect("Operation failed");
        zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>"#).expect("Operation failed");

        // Add ppt/slides/slide1.xml with a shape WITHOUT txBody (image placeholder)
        // This is the critical test case - a <p:sp> element with no <p:txBody>
        zip.start_file("ppt/slides/slide1.xml", options).expect("Operation failed");
        zip.write_all(
            br#"<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>

      <!-- Normal text shape WITH txBody - this should be extracted -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="0"/>
            <a:ext cx="100000" cy="100000"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US"/>
              <a:t>This is the title text</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- IMAGE PLACEHOLDER shape WITHOUT txBody - this caused the "No txBody found" error -->
      <!-- This is a valid PPTX structure - image placeholders don't contain text -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="99" name="Image Placeholder"/>
          <p:cNvSpPr>
            <a:spLocks noGrp="1"/>
          </p:cNvSpPr>
          <p:nvPr>
            <p:ph type="pic" idx="1"/>
          </p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="0"/>
            <a:ext cx="100000" cy="100000"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <!-- NOTE: No <p:txBody> here - this is valid for image placeholders -->
      </p:sp>

      <!-- Another normal text shape - should also be extracted -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="0" y="200000"/>
            <a:ext cx="100000" cy="100000"/>
          </a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US"/>
              <a:t>Content after image placeholder</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

    </p:spTree>
  </p:cSld>
</p:sld>"#,
        )
        .expect("Operation failed");

        // Add ppt/slides/_rels/slide1.xml.rels (empty)
        zip.start_file("ppt/slides/_rels/slide1.xml.rels", options).expect("Operation failed");
        zip.write_all(
            br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>"#,
        )
        .expect("Operation failed");

        zip.finish().expect("Operation failed");
    }

    // Extract the PPTX file
    let result = extract_file(
        temp_file.path(),
        Some("application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        &ExtractionConfig::default(),
    )
    .await;

    match result {
        Ok(extraction) => {
            assert!(!extraction.content.is_empty(), "Content should not be empty");

            // Verify we extracted text from shapes that DO have txBody
            assert!(
                extraction.content.contains("title text"),
                "Should extract text from first shape with txBody. Got: {}",
                extraction.content
            );
            assert!(
                extraction.content.contains("Content after"),
                "Should extract text from shape after image placeholder. Got: {}",
                extraction.content
            );

            println!("✅ PPTX with image placeholder (no txBody) extraction succeeded!");
            println!("   Content: {}", extraction.content);
        }
        Err(e) => {
            let error_msg = format!("{:?}", e);
            if error_msg.contains("No txBody found") {
                panic!(
                    "PPTX extraction failed with 'No txBody found' error!\n\
                     This is GitHub Issue #321 Bug 1.\n\
                     The parser should skip shapes without txBody (image placeholders) \
                     instead of failing.\n\
                     Error: {:?}",
                    e
                );
            } else {
                panic!("PPTX extraction failed with unexpected error: {:?}", e);
            }
        }
    }
}

/// Test extraction of PPTX with multiple shapes, some with txBody, some without.
///
/// This test verifies that:
/// 1. Shapes WITH txBody are extracted
/// 2. Shapes WITHOUT txBody (image placeholders, etc.) are skipped gracefully
/// 3. The extraction continues and doesn't fail on the first shape without txBody
///
/// GitHub Issue #321 Bug 1
#[tokio::test]
async fn test_pptx_mixed_shapes_extraction() {
    // Create a PPTX with multiple slides, each containing mixed shapes
    let mut temp_file = NamedTempFile::with_suffix(".pptx").expect("Failed to create temp file");

    {
        let mut zip = ZipWriter::new(&mut temp_file);
        let options: FileOptions<()> = FileOptions::default().compression_method(CompressionMethod::Stored);

        // Add [Content_Types].xml
        zip.start_file("[Content_Types].xml", options).expect("Operation failed");
        zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>"#).expect("Operation failed");

        // Add _rels/.rels
        zip.start_file("_rels/.rels", options).expect("Operation failed");
        zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>"#).expect("Operation failed");

        // Add ppt/presentation.xml
        zip.start_file("ppt/presentation.xml", options).expect("Operation failed");
        zip.write_all(
            br#"<?xml version="1.0" encoding="UTF-8"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
                xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId2"/>
  </p:sldIdLst>
</p:presentation>"#,
        )
        .expect("Operation failed");

        // Add ppt/_rels/presentation.xml.rels
        zip.start_file("ppt/_rels/presentation.xml.rels", options).expect("Operation failed");
        zip.write_all(br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>"#).expect("Operation failed");

        // Add slide with various shapes - some with txBody, some without
        zip.start_file("ppt/slides/slide1.xml", options).expect("Operation failed");
        zip.write_all(
            br#"<?xml version="1.0" encoding="UTF-8"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>

      <!-- Shape 1: Normal text -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/><a:lstStyle/>
          <a:p><a:r><a:t>First Text Shape</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>

      <!-- Shape 2: Image placeholder (NO txBody) -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="10" name="Picture Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="pic"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
      </p:sp>

      <!-- Shape 3: Another text shape -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Body"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/><a:lstStyle/>
          <a:p><a:r><a:t>Second Text Shape</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>

      <!-- Shape 4: Chart placeholder (NO txBody) -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="11" name="Chart Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="chart"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
      </p:sp>

      <!-- Shape 5: Content placeholder (NO txBody - empty) -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="12" name="Content Placeholder"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="body"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr/>
      </p:sp>

      <!-- Shape 6: Final text shape -->
      <p:sp>
        <p:nvSpPr><p:cNvPr id="4" name="Footer"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/><a:lstStyle/>
          <a:p><a:r><a:t>Third Text Shape</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>

    </p:spTree>
  </p:cSld>
</p:sld>"#,
        )
        .expect("Operation failed");

        // Add empty rels
        zip.start_file("ppt/slides/_rels/slide1.xml.rels", options).expect("Operation failed");
        zip.write_all(
            br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>"#,
        )
        .expect("Operation failed");

        zip.finish().expect("Operation failed");
    }

    let result = extract_file(
        temp_file.path(),
        Some("application/vnd.openxmlformats-officedocument.presentationml.presentation"),
        &ExtractionConfig::default(),
    )
    .await;

    match result {
        Ok(extraction) => {
            // All three text shapes should be extracted
            assert!(
                extraction.content.contains("First Text Shape"),
                "Should extract first text shape"
            );
            assert!(
                extraction.content.contains("Second Text Shape"),
                "Should extract second text shape (after image placeholder)"
            );
            assert!(
                extraction.content.contains("Third Text Shape"),
                "Should extract third text shape (after multiple placeholders)"
            );

            println!("✅ PPTX mixed shapes extraction succeeded!");
            println!("   All text shapes extracted despite image/chart/content placeholders without txBody");
        }
        Err(e) => {
            panic!(
                "PPTX extraction failed: {:?}\n\
                 Shapes without txBody should be skipped gracefully.",
                e
            );
        }
    }
}
