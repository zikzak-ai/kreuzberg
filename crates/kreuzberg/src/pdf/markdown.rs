//! PDF-to-Markdown renderer using character-level font analysis.
//!
//! Converts PDF documents into structured markdown by analyzing per-character
//! font metrics (size, bold, italic, baseline position) to reconstruct headings,
//! paragraphs, inline formatting, and list items.

use crate::pdf::error::Result;
use crate::pdf::hierarchy::{
    BoundingBox, CharData, TextBlock, assign_heading_levels_smart, cluster_font_sizes, extract_chars_with_fonts,
};
use pdfium_render::prelude::*;

// Threshold constants for spatial analysis
/// Baseline Y tolerance as a fraction of the smaller font size for same-line grouping.
const BASELINE_Y_TOLERANCE_FRACTION: f32 = 0.5;
/// Gap threshold as a fraction of the average font size for word-break detection.
const WORD_GAP_FRACTION: f32 = 0.3;
/// Multiplier for median line spacing to detect paragraph breaks.
const PARAGRAPH_GAP_MULTIPLIER: f32 = 1.5;
/// Font size change threshold (in points) to trigger a paragraph break.
const FONT_SIZE_CHANGE_THRESHOLD: f32 = 1.5;
/// Left indent change threshold (in points) to trigger a paragraph break.
const LEFT_INDENT_CHANGE_THRESHOLD: f32 = 10.0;
/// Maximum word count for a paragraph to qualify as a heading.
const MAX_HEADING_WORD_COUNT: usize = 12;
/// Minimum gutter width as multiple of average character width for column boundary detection.
const MIN_GUTTER_WIDTH_MULTIPLIER: f32 = 2.0;
/// Minimum fraction of page height that a gutter must span.
const MIN_GUTTER_HEIGHT_FRACTION: f32 = 0.6;
/// Histogram bin width in points for x-position projection.
const COLUMN_HISTOGRAM_BIN_WIDTH: f32 = 5.0;
/// Maximum number of lines for a paragraph to be classified as a list item.
const MAX_LIST_ITEM_LINES: usize = 5;
/// Maximum distance multiplier relative to average inter-cluster gap for heading assignment.
const MAX_HEADING_DISTANCE_MULTIPLIER: f32 = 2.0;

/// A detected column region on a page.
#[derive(Debug, Clone)]
struct ColumnRegion {
    x_min: f32,
    x_max: f32,
}

/// A single word extracted from PDF character data.
#[derive(Debug, Clone)]
struct PdfWord {
    text: String,
    x_start: f32,
    #[allow(dead_code)]
    x_end: f32,
    baseline_y: f32,
    font_size: f32,
    is_bold: bool,
    is_italic: bool,
}

/// A line of text composed of words sharing a common baseline.
#[derive(Debug, Clone)]
struct PdfLine {
    words: Vec<PdfWord>,
    baseline_y: f32,
    #[allow(dead_code)]
    y_top: f32,
    #[allow(dead_code)]
    y_bottom: f32,
    dominant_font_size: f32,
    is_bold: bool,
    is_italic: bool,
}

/// A paragraph composed of lines, with optional heading classification.
#[derive(Debug, Clone)]
struct PdfParagraph {
    lines: Vec<PdfLine>,
    dominant_font_size: f32,
    heading_level: Option<u8>,
    #[allow(dead_code)]
    is_bold: bool,
    #[allow(dead_code)]
    is_italic: bool,
    is_list_item: bool,
}

/// Detect column boundaries by finding vertical gutters in character x-positions.
/// Returns column regions sorted left-to-right. Single-column pages return one region.
fn detect_columns(chars: &[CharData], page_width: f32, page_height: f32) -> Vec<ColumnRegion> {
    if chars.is_empty() || page_width <= 0.0 || page_height <= 0.0 {
        return vec![ColumnRegion {
            x_min: 0.0,
            x_max: page_width,
        }];
    }

    let avg_char_width = chars
        .iter()
        .filter(|c| !c.text.trim().is_empty())
        .map(|c| c.width)
        .sum::<f32>()
        / chars.iter().filter(|c| !c.text.trim().is_empty()).count().max(1) as f32;
    let min_gutter_width = avg_char_width * MIN_GUTTER_WIDTH_MULTIPLIER;

    // Build histogram of character presence per x-bin, tracking y-span
    let num_bins = ((page_width / COLUMN_HISTOGRAM_BIN_WIDTH).ceil() as usize).max(1);
    let mut bin_y_min = vec![f32::INFINITY; num_bins];
    let mut bin_y_max = vec![f32::NEG_INFINITY; num_bins];
    let mut bin_count = vec![0u32; num_bins];

    for ch in chars {
        if ch.text.trim().is_empty() {
            continue;
        }
        let bin_start = ((ch.x / COLUMN_HISTOGRAM_BIN_WIDTH).floor() as usize).min(num_bins - 1);
        let bin_end = (((ch.x + ch.width) / COLUMN_HISTOGRAM_BIN_WIDTH).ceil() as usize).min(num_bins);
        for b in bin_start..bin_end {
            bin_y_min[b] = bin_y_min[b].min(ch.baseline_y);
            bin_y_max[b] = bin_y_max[b].max(ch.baseline_y);
            bin_count[b] += 1;
        }
    }

    // Find gutter regions: consecutive empty bins
    let mut gutters: Vec<(f32, f32)> = Vec::new();
    let mut gutter_start: Option<usize> = None;

    for (i, &count) in bin_count.iter().enumerate() {
        if count == 0 {
            if gutter_start.is_none() {
                gutter_start = Some(i);
            }
        } else if let Some(start) = gutter_start {
            let x_start = start as f32 * COLUMN_HISTOGRAM_BIN_WIDTH;
            let x_end = i as f32 * COLUMN_HISTOGRAM_BIN_WIDTH;
            if x_end - x_start >= min_gutter_width {
                // Check that columns adjacent to the gutter span enough page height.
                // Accumulate y-span across all bins in the left/right column region,
                // not just the single adjacent bin, for robustness.
                let left_y_min = bin_y_min[..start].iter().copied().fold(f32::INFINITY, f32::min);
                let left_y_max = bin_y_max[..start].iter().copied().fold(f32::NEG_INFINITY, f32::max);
                let left_span = if left_y_max > left_y_min {
                    (left_y_max - left_y_min).abs()
                } else {
                    0.0
                };

                let right_y_min = bin_y_min[i..].iter().copied().fold(f32::INFINITY, f32::min);
                let right_y_max = bin_y_max[i..].iter().copied().fold(f32::NEG_INFINITY, f32::max);
                let right_span = if right_y_max > right_y_min {
                    (right_y_max - right_y_min).abs()
                } else {
                    0.0
                };

                if left_span.max(right_span) >= page_height * MIN_GUTTER_HEIGHT_FRACTION {
                    gutters.push((x_start, x_end));
                }
            }
            gutter_start = None;
        }
    }

    if gutters.is_empty() {
        return vec![ColumnRegion {
            x_min: 0.0,
            x_max: page_width,
        }];
    }

    // Build column regions from gutters
    let mut columns: Vec<ColumnRegion> = Vec::new();
    let mut prev_x = 0.0_f32;
    for (gl, gr) in &gutters {
        if *gl > prev_x {
            columns.push(ColumnRegion {
                x_min: prev_x,
                x_max: *gl,
            });
        }
        prev_x = *gr;
    }
    if prev_x < page_width {
        columns.push(ColumnRegion {
            x_min: prev_x,
            x_max: page_width,
        });
    }

    // Filter out columns with no characters
    columns.retain(|col| {
        chars
            .iter()
            .any(|c| !c.text.trim().is_empty() && c.x >= col.x_min && c.x < col.x_max)
    });

    if columns.is_empty() {
        vec![ColumnRegion {
            x_min: 0.0,
            x_max: page_width,
        }]
    } else {
        columns
    }
}

/// Split characters into column groups based on detected column regions.
fn split_chars_by_columns<'a>(chars: &'a [CharData], columns: &[ColumnRegion]) -> Vec<Vec<&'a CharData>> {
    let mut column_chars: Vec<Vec<&CharData>> = vec![Vec::new(); columns.len()];
    for ch in chars {
        if ch.text.trim().is_empty() {
            continue;
        }
        let center_x = ch.x + ch.width / 2.0;
        let mut assigned = false;
        for (i, col) in columns.iter().enumerate() {
            if center_x >= col.x_min && center_x < col.x_max {
                column_chars[i].push(ch);
                assigned = true;
                break;
            }
        }
        if !assigned {
            let nearest = columns
                .iter()
                .enumerate()
                .min_by(|(_, a), (_, b)| {
                    let da = (center_x - (a.x_min + a.x_max) / 2.0).abs();
                    let db = (center_x - (b.x_min + b.x_max) / 2.0).abs();
                    da.partial_cmp(&db).unwrap_or(std::cmp::Ordering::Equal)
                })
                .map(|(i, _)| i)
                .unwrap_or(0);
            column_chars[nearest].push(ch);
        }
    }
    column_chars
}

/// Render an entire PDF document as markdown using character-level font analysis.
///
/// Extracts characters from every page, clusters font sizes globally to determine
/// heading levels, then assembles structured markdown with headings, paragraphs,
/// bold/italic inline formatting, and list items.
///
/// # Arguments
///
/// * `document` - The PDF document to render
/// * `k_clusters` - Number of clusters for font-size k-means (typically 3-5)
///
/// # Returns
///
/// A `Result<String>` containing the full markdown text of the document.
pub fn render_document_as_markdown(document: &PdfDocument, k_clusters: usize) -> Result<String> {
    let pages = document.pages();
    let page_count = pages.len();

    // Stage 1: Extract chars from all pages
    let mut all_page_chars: Vec<Vec<CharData>> = Vec::with_capacity(page_count as usize);
    let mut page_dimensions: Vec<(f32, f32)> = Vec::with_capacity(page_count as usize);
    for i in 0..page_count {
        let page = pages.get(i).map_err(|e| {
            crate::pdf::error::PdfError::TextExtractionFailed(format!("Failed to get page {}: {:?}", i, e))
        })?;
        let chars = extract_chars_with_fonts(&page)?;
        page_dimensions.push((page.width().value, page.height().value));
        all_page_chars.push(chars);
    }

    // Stage 2: Global font-size clustering
    // Build lightweight TextBlocks from all chars - only font_size matters for clustering.
    // Text and bbox are unused by the clustering algorithm, so we use empty defaults
    // to avoid heap-allocating a String per character (100k+ chars in large PDFs).
    let mut all_blocks: Vec<TextBlock> = Vec::new();
    let empty_bbox = BoundingBox {
        left: 0.0,
        top: 0.0,
        right: 0.0,
        bottom: 0.0,
    };
    for page_chars in &all_page_chars {
        for ch in page_chars {
            if ch.text.trim().is_empty() || ch.text.chars().any(|c| c.is_control()) {
                continue; // Skip whitespace/control chars for clustering
            }
            all_blocks.push(TextBlock {
                text: String::new(),
                bbox: empty_bbox,
                font_size: ch.font_size,
            });
        }
    }

    let heading_map = if all_blocks.is_empty() {
        Vec::new()
    } else {
        let clusters = cluster_font_sizes(&all_blocks, k_clusters)?;
        assign_heading_levels_smart(&clusters)
    };

    // Stage 3: Per-page structured extraction
    let mut all_page_paragraphs: Vec<Vec<PdfParagraph>> = Vec::new();
    for (page_idx, page_chars) in all_page_chars.iter().enumerate() {
        let (page_w, page_h) = page_dimensions[page_idx];
        let columns = detect_columns(page_chars, page_w, page_h);

        let mut page_paragraphs: Vec<PdfParagraph> = Vec::new();

        if columns.len() <= 1 {
            // Single column: existing path
            let words = chars_to_words(page_chars);
            let lines = words_to_lines(words);
            let mut paragraphs = lines_to_paragraphs(lines);
            classify_paragraphs(&mut paragraphs, &heading_map);
            page_paragraphs = paragraphs;
        } else {
            // Multi-column: process each column independently
            let column_char_groups = split_chars_by_columns(page_chars, &columns);
            for col_chars in &column_char_groups {
                if col_chars.is_empty() {
                    continue;
                }
                let owned: Vec<CharData> = col_chars.iter().map(|c| (*c).clone()).collect();
                let words = chars_to_words(&owned);
                let lines = words_to_lines(words);
                let mut paragraphs = lines_to_paragraphs(lines);
                classify_paragraphs(&mut paragraphs, &heading_map);
                page_paragraphs.extend(paragraphs);
            }
        }

        all_page_paragraphs.push(page_paragraphs);
    }

    // Stage 4: Assemble markdown
    Ok(assemble_markdown(all_page_paragraphs))
}

/// Returns true if the character is a CJK ideograph, Hiragana, Katakana, or Hangul.
/// Used for word boundary detection — CJK characters don't use spaces between words.
fn is_cjk_char(c: char) -> bool {
    let cp = c as u32;
    matches!(cp,
        0x4E00..=0x9FFF     // CJK Unified Ideographs
        | 0x3040..=0x309F   // Hiragana
        | 0x30A0..=0x30FF   // Katakana
        | 0xAC00..=0xD7AF   // Hangul Syllables
        | 0x3400..=0x4DBF   // CJK Extension A
        | 0xF900..=0xFAFF   // CJK Compatibility Ideographs
        | 0x20000..=0x2A6DF // CJK Extension B
        | 0x2A700..=0x2B73F // CJK Extension C
        | 0x2B740..=0x2B81F // CJK Extension D
        | 0x2B820..=0x2CEAF // CJK Extension E
        | 0x2CEB0..=0x2EBEF // CJK Extension F
        | 0x30000..=0x3134F // CJK Extension G
        | 0x31350..=0x323AF // CJK Extension H
        | 0x2F800..=0x2FA1F // CJK Compatibility Ideographs Supplement
    )
}

/// Returns true if a space should be inserted between two adjacent words.
/// CJK words should not have spaces between them.
fn needs_space_between(prev: &str, next: &str) -> bool {
    let prev_ends_cjk = prev.chars().last().is_some_and(is_cjk_char);
    let next_starts_cjk = next.chars().next().is_some_and(is_cjk_char);
    // No space when both sides are CJK
    !(prev_ends_cjk && next_starts_cjk)
}

/// Convert raw character data into words by detecting spatial gaps.
///
/// Characters are sorted by baseline_y then x. Characters sharing a baseline
/// (within tolerance) are grouped into lines, then split into words when the
/// horizontal gap exceeds a fraction of the average font size.
fn chars_to_words(chars: &[CharData]) -> Vec<PdfWord> {
    if chars.is_empty() {
        return Vec::new();
    }

    // Filter out control characters (CR, LF, tab, etc.) but keep spaces as word-break signals.
    let filtered: Vec<&CharData> = chars
        .iter()
        .filter(|c| c.text.chars().all(|ch| !ch.is_control()))
        .collect();

    if filtered.is_empty() {
        return Vec::new();
    }

    // Sort by baseline_y DESCENDING (top-to-bottom reading order), then x ascending.
    // PDF coordinates have y=0 at page bottom, increasing upward, so larger y = higher on page.
    let mut sorted = filtered;
    sorted.sort_by(|a, b| {
        b.baseline_y
            .partial_cmp(&a.baseline_y)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| a.x.partial_cmp(&b.x).unwrap_or(std::cmp::Ordering::Equal))
    });

    let mut words: Vec<PdfWord> = Vec::new();
    let mut word_chars: Vec<&CharData> = Vec::new();

    for ch in &sorted {
        // Space characters act as explicit word breaks
        if ch.text.trim().is_empty() {
            if !word_chars.is_empty() {
                words.push(finalize_word(&word_chars));
                word_chars.clear();
            }
            continue;
        }

        if word_chars.is_empty() {
            word_chars.push(ch);
            continue;
        }

        let prev = word_chars.last().unwrap();

        // Check if same baseline
        let min_fs = prev.font_size.min(ch.font_size).max(1.0);
        let same_line = (prev.baseline_y - ch.baseline_y).abs() < BASELINE_Y_TOLERANCE_FRACTION * min_fs;

        if same_line {
            // CJK characters always form word boundaries — each CJK char is its own word.
            // Check if either the previous or current character is CJK.
            let prev_is_cjk = prev.text.chars().any(is_cjk_char);
            let curr_is_cjk = ch.text.chars().any(is_cjk_char);

            if prev_is_cjk || curr_is_cjk {
                // Always break word at CJK character boundaries
                words.push(finalize_word(&word_chars));
                word_chars.clear();
            } else {
                // Check horizontal gap for word break (non-CJK logic)
                let prev_end = prev.x + prev.width;
                let gap = ch.x - prev_end;
                let avg_fs = ((prev.font_size + ch.font_size) / 2.0).max(1.0);

                if gap > WORD_GAP_FRACTION * avg_fs {
                    words.push(finalize_word(&word_chars));
                    word_chars.clear();
                }
            }
        } else {
            // Different line => finalize word
            words.push(finalize_word(&word_chars));
            word_chars.clear();
        }

        word_chars.push(ch);
    }

    if !word_chars.is_empty() {
        words.push(finalize_word(&word_chars));
    }

    words
}

/// Build a PdfWord from a sequence of characters.
fn finalize_word(chars: &[&CharData]) -> PdfWord {
    let text: String = chars.iter().map(|c| c.text.as_str()).collect();
    let x_start = chars.iter().map(|c| c.x).fold(f32::INFINITY, f32::min);
    let x_end = chars.iter().map(|c| c.x + c.width).fold(f32::NEG_INFINITY, f32::max);
    let baseline_y = chars.iter().map(|c| c.baseline_y).sum::<f32>() / chars.len() as f32;
    let font_size = chars.iter().map(|c| c.font_size).sum::<f32>() / chars.len() as f32;

    let bold_count = chars.iter().filter(|c| c.is_bold).count();
    let italic_count = chars.iter().filter(|c| c.is_italic).count();
    let majority = chars.len() / 2;

    PdfWord {
        text,
        x_start,
        x_end,
        baseline_y,
        font_size,
        is_bold: bold_count > majority,
        is_italic: italic_count > majority,
    }
}

/// Group words into lines by baseline proximity.
fn words_to_lines(words: Vec<PdfWord>) -> Vec<PdfLine> {
    if words.is_empty() {
        return Vec::new();
    }

    // Sort words by baseline_y DESCENDING (top-to-bottom), then x_start ascending.
    let mut sorted = words;
    sorted.sort_by(|a, b| {
        b.baseline_y
            .partial_cmp(&a.baseline_y)
            .unwrap_or(std::cmp::Ordering::Equal)
            .then_with(|| a.x_start.partial_cmp(&b.x_start).unwrap_or(std::cmp::Ordering::Equal))
    });

    let mut lines: Vec<PdfLine> = Vec::new();
    let mut current_words: Vec<PdfWord> = vec![sorted.remove(0)];

    for word in sorted {
        let current_baseline = current_words.iter().map(|w| w.baseline_y).sum::<f32>() / current_words.len() as f32;
        let min_fs = current_words
            .iter()
            .map(|w| w.font_size)
            .fold(f32::INFINITY, f32::min)
            .min(word.font_size)
            .max(1.0);

        if (word.baseline_y - current_baseline).abs() < BASELINE_Y_TOLERANCE_FRACTION * min_fs {
            current_words.push(word);
        } else {
            lines.push(finalize_line(current_words));
            current_words = vec![word];
        }
    }

    if !current_words.is_empty() {
        lines.push(finalize_line(current_words));
    }

    lines
}

/// Build a PdfLine from a set of words, sorting them left-to-right.
fn finalize_line(mut words: Vec<PdfWord>) -> PdfLine {
    // Sort words left-to-right within the line
    words.sort_by(|a, b| a.x_start.partial_cmp(&b.x_start).unwrap_or(std::cmp::Ordering::Equal));

    let baseline_y = words.iter().map(|w| w.baseline_y).sum::<f32>() / words.len() as f32;
    let y_top = words
        .iter()
        .map(|w| w.baseline_y - w.font_size)
        .fold(f32::INFINITY, f32::min);
    let y_bottom = words.iter().map(|w| w.baseline_y).fold(f32::NEG_INFINITY, f32::max);

    // Dominant font size: most frequent (rounded to nearest 0.5)
    let dominant_font_size = dominant_font_size_of_words(&words);

    let bold_count = words.iter().filter(|w| w.is_bold).count();
    let italic_count = words.iter().filter(|w| w.is_italic).count();
    let majority = words.len().div_ceil(2);

    PdfLine {
        baseline_y,
        y_top,
        y_bottom,
        dominant_font_size,
        is_bold: bold_count >= majority,
        is_italic: italic_count >= majority,
        words,
    }
}

/// Compute the dominant (most frequent) font size from a set of words.
fn dominant_font_size_of_words(words: &[PdfWord]) -> f32 {
    if words.is_empty() {
        return 0.0;
    }
    // Round font sizes to nearest 0.5pt for grouping
    let mut counts: Vec<(i32, usize)> = Vec::new();
    for w in words {
        let key = (w.font_size * 2.0).round() as i32;
        if let Some(entry) = counts.iter_mut().find(|(k, _)| *k == key) {
            entry.1 += 1;
        } else {
            counts.push((key, 1));
        }
    }
    counts.sort_by(|a, b| b.1.cmp(&a.1));
    counts[0].0 as f32 / 2.0
}

/// Group lines into paragraphs based on vertical gaps, font size changes, and indentation.
fn lines_to_paragraphs(lines: Vec<PdfLine>) -> Vec<PdfParagraph> {
    if lines.is_empty() {
        return Vec::new();
    }

    if lines.len() == 1 {
        return vec![finalize_paragraph(lines)];
    }

    // Compute baseline line spacing for paragraph break detection.
    // We use the MINIMUM of filtered spacings:
    // - Filter out tiny gaps (< 40% of avg font size) to exclude superscripts/subscripts
    // - Use the minimum of remaining gaps as baseline line spacing
    // - Threshold = minimum * 1.5 catches paragraph-level gaps
    // We avoid the median (fails for memos where most lines are standalone paragraphs)
    // and raw minimum (fails when superscripts create tiny gaps).
    let avg_font_size = lines.iter().map(|l| l.dominant_font_size).sum::<f32>() / lines.len() as f32;

    let mut spacings: Vec<f32> = Vec::new();
    for pair in lines.windows(2) {
        let gap = (pair[1].baseline_y - pair[0].baseline_y).abs();
        // Filter out tiny gaps below 40% of avg font size (likely superscripts/artifacts)
        if gap > avg_font_size * 0.4 {
            spacings.push(gap);
        }
    }

    let base_spacing = if spacings.is_empty() {
        // Fallback: use average font size as spacing estimate
        avg_font_size
    } else {
        spacings.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
        // Use minimum of filtered spacings as line spacing baseline.
        // The 40% superscript filter above already removes tiny artifact gaps,
        // so the minimum here is the tightest real line spacing.
        spacings[0]
    };

    let paragraph_gap_threshold = base_spacing * PARAGRAPH_GAP_MULTIPLIER;

    let mut paragraphs: Vec<PdfParagraph> = Vec::new();
    let mut current_lines: Vec<PdfLine> = vec![lines[0].clone()];

    for line in lines.into_iter().skip(1) {
        let prev = current_lines.last().unwrap();

        let vertical_gap = (line.baseline_y - prev.baseline_y).abs();
        let font_size_change = (line.dominant_font_size - prev.dominant_font_size).abs();

        // Compute left indent change
        let prev_left = prev.words.first().map(|w| w.x_start).unwrap_or(0.0);
        let curr_left = line.words.first().map(|w| w.x_start).unwrap_or(0.0);
        let indent_change = (curr_left - prev_left).abs();

        // Paragraph break detection:
        // 1. Vertical gap alone exceeds threshold (primary signal)
        // 2. Font size change OR indent change, but ONLY when combined with at least
        //    some vertical gap (> base_spacing * 0.8). This prevents over-splitting
        //    when font size varies within tightly-spaced lines (e.g., slide decks,
        //    multi-column academic papers with footnotes/captions).
        let has_significant_gap = vertical_gap > paragraph_gap_threshold;
        let has_some_gap = vertical_gap > base_spacing * 0.8;
        let has_font_change = font_size_change > FONT_SIZE_CHANGE_THRESHOLD;
        let has_indent_change = indent_change > LEFT_INDENT_CHANGE_THRESHOLD;

        let is_paragraph_break = has_significant_gap || (has_some_gap && (has_font_change || has_indent_change));

        if is_paragraph_break {
            paragraphs.push(finalize_paragraph(current_lines));
            current_lines = vec![line];
        } else {
            current_lines.push(line);
        }
    }

    if !current_lines.is_empty() {
        paragraphs.push(finalize_paragraph(current_lines));
    }

    paragraphs
}

/// Build a PdfParagraph from a set of lines.
fn finalize_paragraph(lines: Vec<PdfLine>) -> PdfParagraph {
    let dominant_font_size = if lines.is_empty() {
        0.0
    } else {
        // Use the font size that appears in the most lines
        let mut fs_counts: Vec<(i32, usize)> = Vec::new();
        for l in &lines {
            let key = (l.dominant_font_size * 2.0).round() as i32;
            if let Some(entry) = fs_counts.iter_mut().find(|(k, _)| *k == key) {
                entry.1 += 1;
            } else {
                fs_counts.push((key, 1));
            }
        }
        fs_counts.sort_by(|a, b| b.1.cmp(&a.1));
        fs_counts[0].0 as f32 / 2.0
    };

    let bold_count = lines.iter().filter(|l| l.is_bold).count();
    let italic_count = lines.iter().filter(|l| l.is_italic).count();
    let majority = lines.len().div_ceil(2);

    // Detect list items: first word of first line starts with bullet or number prefix
    let is_list_item = lines.len() <= MAX_LIST_ITEM_LINES
        && lines
            .first()
            .and_then(|l| l.words.first())
            .map(|w| is_list_prefix(&w.text))
            .unwrap_or(false);

    PdfParagraph {
        dominant_font_size,
        heading_level: None, // Set during classification
        is_bold: bold_count >= majority,
        is_italic: italic_count >= majority,
        is_list_item,
        lines,
    }
}

/// Check if a word text looks like a list item prefix.
fn is_list_prefix(text: &str) -> bool {
    let trimmed = text.trim();
    if trimmed == "-" || trimmed == "*" || trimmed == "\u{2022}" {
        return true;
    }
    // Check for numbered list: "1." "2)" "10." etc.
    let bytes = trimmed.as_bytes();
    if bytes.is_empty() {
        return false;
    }
    // Find where digits end
    let digit_end = bytes.iter().position(|&b| !b.is_ascii_digit()).unwrap_or(bytes.len());
    if digit_end > 0 && digit_end < bytes.len() {
        let suffix = bytes[digit_end];
        return suffix == b'.' || suffix == b')';
    }
    false
}

/// Classify paragraphs as headings or body using the global heading map.
fn classify_paragraphs(paragraphs: &mut [PdfParagraph], heading_map: &[(f32, Option<u8>)]) {
    for para in paragraphs.iter_mut() {
        // Count total words in the paragraph
        let word_count: usize = para.lines.iter().map(|l| l.words.len()).sum();

        // Look up this paragraph's dominant font size in the heading map
        let heading_level = find_heading_level(para.dominant_font_size, heading_map);

        if let Some(level) = heading_level {
            // Only assign heading if the paragraph is short enough
            if word_count <= MAX_HEADING_WORD_COUNT {
                para.heading_level = Some(level);
            }
        }
    }
}

/// Find the heading level for a given font size by matching against the cluster centroids.
fn find_heading_level(font_size: f32, heading_map: &[(f32, Option<u8>)]) -> Option<u8> {
    if heading_map.is_empty() {
        return None;
    }
    if heading_map.len() == 1 {
        return heading_map[0].1;
    }

    // Find closest centroid
    let mut best_distance = f32::INFINITY;
    let mut best_level: Option<u8> = None;
    for &(centroid, level) in heading_map {
        let dist = (font_size - centroid).abs();
        if dist < best_distance {
            best_distance = dist;
            best_level = level;
        }
    }

    // Compute average inter-cluster gap
    let mut centroids: Vec<f32> = heading_map.iter().map(|(c, _)| *c).collect();
    centroids.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let gaps: Vec<f32> = centroids.windows(2).map(|w| (w[1] - w[0]).abs()).collect();
    let avg_gap = if gaps.is_empty() {
        f32::INFINITY
    } else {
        gaps.iter().sum::<f32>() / gaps.len() as f32
    };

    // Reject matches that are too far from any centroid
    if best_distance > MAX_HEADING_DISTANCE_MULTIPLIER * avg_gap {
        return None;
    }

    best_level
}

/// Assemble final markdown string from classified paragraphs across all pages.
fn assemble_markdown(pages: Vec<Vec<PdfParagraph>>) -> String {
    let mut output = String::new();

    for (page_idx, paragraphs) in pages.iter().enumerate() {
        if page_idx > 0 && !output.is_empty() {
            output.push_str("\n\n");
        }

        for (para_idx, para) in paragraphs.iter().enumerate() {
            if para_idx > 0 {
                output.push_str("\n\n");
            }

            if let Some(level) = para.heading_level {
                // Heading: prefix with # symbols
                let prefix = "#".repeat(level as usize);
                let text = join_line_texts(&para.lines);
                output.push_str(&prefix);
                output.push(' ');
                output.push_str(&text);
            } else if para.is_list_item {
                // List items: preserve each line individually
                for (line_idx, line) in para.lines.iter().enumerate() {
                    if line_idx > 0 {
                        output.push('\n');
                    }
                    let text = render_line_with_inline_markup(line);
                    output.push_str(&text);
                }
            } else {
                // Body paragraph: join lines with space, apply inline markup
                let text = render_paragraph_with_inline_markup(para);
                output.push_str(&text);
            }
        }
    }

    output
}

/// Join lines into a single string (no inline markup).
/// Respects CJK spacing — no space inserted between adjacent CJK words.
fn join_line_texts(lines: &[PdfLine]) -> String {
    let all_words: Vec<&str> = lines
        .iter()
        .flat_map(|l| l.words.iter().map(|w| w.text.as_str()))
        .collect();
    join_words_cjk_aware(&all_words)
}

/// Join word texts with spaces, but omit the space when both adjacent words are CJK.
fn join_words_cjk_aware(words: &[&str]) -> String {
    if words.is_empty() {
        return String::new();
    }
    let mut result = String::from(words[0]);
    for pair in words.windows(2) {
        if needs_space_between(pair[0], pair[1]) {
            result.push(' ');
        }
        result.push_str(pair[1]);
    }
    result
}

/// Render a single line with bold/italic inline markup.
fn render_line_with_inline_markup(line: &PdfLine) -> String {
    render_words_with_markup(&line.words)
}

/// Render an entire body paragraph with inline bold/italic markup.
///
/// Lines are joined with a single space; consecutive bold or italic words
/// are grouped into a single `**...**` or `*...*` run.
fn render_paragraph_with_inline_markup(para: &PdfParagraph) -> String {
    // Collect all words across lines
    let all_words: Vec<&PdfWord> = para.lines.iter().flat_map(|l| l.words.iter()).collect();
    render_words_with_markup_refs(&all_words)
}

/// Render a slice of words with run-length-encoded bold/italic markup.
fn render_words_with_markup(words: &[PdfWord]) -> String {
    let refs: Vec<&PdfWord> = words.iter().collect();
    render_words_with_markup_refs(&refs)
}

/// Core inline markup renderer working on word references.
///
/// Groups consecutive words sharing the same bold/italic state, wraps groups
/// in `**...**` or `*...*` as appropriate. If an entire run is both bold and
/// italic, emits `***...***`.
fn render_words_with_markup_refs(words: &[&PdfWord]) -> String {
    if words.is_empty() {
        return String::new();
    }

    let mut result = String::new();
    let mut i = 0;

    while i < words.len() {
        let bold = words[i].is_bold;
        let italic = words[i].is_italic;

        // Find the run of words with the same formatting
        let run_start = i;
        while i < words.len() && words[i].is_bold == bold && words[i].is_italic == italic {
            i += 1;
        }

        let run_words: Vec<&str> = words[run_start..i].iter().map(|w| w.text.as_str()).collect();
        let run_text = join_words_cjk_aware(&run_words);

        if !result.is_empty() {
            // Determine if we need a space between the end of the previous run
            // and the start of this run
            let prev_end = words[run_start - 1].text.as_str();
            let next_start = words[run_start].text.as_str();
            if needs_space_between(prev_end, next_start) {
                result.push(' ');
            }
        }

        match (bold, italic) {
            (true, true) => {
                result.push_str("***");
                result.push_str(&run_text);
                result.push_str("***");
            }
            (true, false) => {
                result.push_str("**");
                result.push_str(&run_text);
                result.push_str("**");
            }
            (false, true) => {
                result.push('*');
                result.push_str(&run_text);
                result.push('*');
            }
            (false, false) => {
                result.push_str(&run_text);
            }
        }
    }

    result
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper to create a CharData with specified properties.
    fn make_char(text: &str, x: f32, baseline_y: f32, font_size: f32, is_bold: bool, is_italic: bool) -> CharData {
        CharData {
            text: text.to_string(),
            x,
            y: baseline_y + font_size * 0.2, // simulate y slightly above baseline
            font_size,
            width: font_size * 0.6,
            height: font_size,
            is_bold,
            is_italic,
            baseline_y,
        }
    }

    /// Helper to create a simple non-bold, non-italic char.
    fn plain_char(text: &str, x: f32, baseline_y: f32, font_size: f32) -> CharData {
        make_char(text, x, baseline_y, font_size, false, false)
    }

    #[test]
    fn test_chars_to_words() {
        // "Hi there" with a gap between "Hi" and "there"
        let fs = 12.0;
        let cw = fs * 0.6; // char width = 7.2

        let chars = vec![
            plain_char("H", 0.0, 100.0, fs),
            plain_char("i", cw, 100.0, fs),
            // gap > 0.3 * 12 = 3.6 between "i" end and "t" start
            plain_char("t", cw * 2.0 + 5.0, 100.0, fs),
            plain_char("h", cw * 3.0 + 5.0, 100.0, fs),
            plain_char("e", cw * 4.0 + 5.0, 100.0, fs),
            plain_char("r", cw * 5.0 + 5.0, 100.0, fs),
            plain_char("e", cw * 6.0 + 5.0, 100.0, fs),
        ];

        let words = chars_to_words(&chars);
        assert_eq!(words.len(), 2, "Expected 2 words, got {}", words.len());
        assert_eq!(words[0].text, "Hi");
        assert_eq!(words[1].text, "there");
    }

    #[test]
    fn test_words_to_lines() {
        // PDF coords: larger baseline_y = higher on page = comes first.
        // "Next" at baseline 115 is higher on page than "Hello world" at 100.
        let words = vec![
            PdfWord {
                text: "Hello".to_string(),
                x_start: 0.0,
                x_end: 30.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: false,
                is_italic: false,
            },
            PdfWord {
                text: "world".to_string(),
                x_start: 35.0,
                x_end: 65.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: false,
                is_italic: false,
            },
            PdfWord {
                text: "Next".to_string(),
                x_start: 0.0,
                x_end: 25.0,
                baseline_y: 115.0,
                font_size: 12.0,
                is_bold: false,
                is_italic: false,
            },
        ];

        let lines = words_to_lines(words);
        assert_eq!(lines.len(), 2, "Expected 2 lines, got {}", lines.len());
        // "Next" (baseline 115) comes first in descending sort
        assert_eq!(lines[0].words.len(), 1);
        assert_eq!(lines[0].words[0].text, "Next");
        assert_eq!(lines[1].words.len(), 2);
        assert_eq!(lines[1].words[0].text, "Hello");
        assert_eq!(lines[1].words[1].text, "world");
    }

    #[test]
    fn test_lines_to_paragraphs() {
        // Helper to create a simple line at a given baseline
        fn make_line(text: &str, baseline: f32) -> PdfLine {
            PdfLine {
                words: vec![PdfWord {
                    text: text.to_string(),
                    x_start: 0.0,
                    x_end: 30.0,
                    baseline_y: baseline,
                    font_size: 12.0,
                    is_bold: false,
                    is_italic: false,
                }],
                baseline_y: baseline,
                y_top: baseline - 12.0,
                y_bottom: baseline,
                dominant_font_size: 12.0,
                is_bold: false,
                is_italic: false,
            }
        }

        // Three lines in paragraph 1 (14pt spacing each), then a large 50pt gap,
        // then one line in paragraph 2. Median spacing is 14pt, threshold = 21pt.
        let lines = vec![
            make_line("First", 100.0),
            make_line("second", 114.0),   // 14pt gap
            make_line("third", 128.0),    // 14pt gap
            make_line("New para", 178.0), // 50pt gap -> paragraph break
        ];

        let paragraphs = lines_to_paragraphs(lines);
        assert_eq!(paragraphs.len(), 2, "Expected 2 paragraphs, got {}", paragraphs.len());
        assert_eq!(paragraphs[0].lines.len(), 3);
        assert_eq!(paragraphs[1].lines.len(), 1);
    }

    #[test]
    fn test_heading_classification() {
        // Simulate clusters: 24pt (2 members), 12pt (20 members)
        // Body should be 12pt (most frequent). 24pt should be H1.
        let clusters = vec![
            crate::pdf::hierarchy::FontSizeCluster {
                centroid: 24.0,
                members: vec![
                    TextBlock {
                        text: "Title".to_string(),
                        bbox: BoundingBox {
                            left: 0.0,
                            top: 0.0,
                            right: 100.0,
                            bottom: 24.0,
                        },
                        font_size: 24.0,
                    },
                    TextBlock {
                        text: "Subtitle".to_string(),
                        bbox: BoundingBox {
                            left: 0.0,
                            top: 30.0,
                            right: 100.0,
                            bottom: 54.0,
                        },
                        font_size: 24.0,
                    },
                ],
            },
            crate::pdf::hierarchy::FontSizeCluster {
                centroid: 12.0,
                members: (0..20)
                    .map(|i| TextBlock {
                        text: format!("body {}", i),
                        bbox: BoundingBox {
                            left: 0.0,
                            top: 60.0 + i as f32 * 14.0,
                            right: 400.0,
                            bottom: 72.0 + i as f32 * 14.0,
                        },
                        font_size: 12.0,
                    })
                    .collect(),
            },
        ];

        let heading_map = assign_heading_levels_smart(&clusters);
        assert_eq!(heading_map.len(), 2);

        // 24pt cluster -> H1
        let h24 = heading_map.iter().find(|(c, _)| (*c - 24.0).abs() < 0.1);
        assert!(h24.is_some(), "Should find 24pt cluster");
        assert_eq!(h24.unwrap().1, Some(1), "24pt should be H1");

        // 12pt cluster -> Body (None)
        let h12 = heading_map.iter().find(|(c, _)| (*c - 12.0).abs() < 0.1);
        assert!(h12.is_some(), "Should find 12pt cluster");
        assert_eq!(h12.unwrap().1, None, "12pt should be Body");
    }

    #[test]
    fn test_single_font_size_no_headings() {
        // All same font size -> single cluster -> no headings
        let clusters = vec![crate::pdf::hierarchy::FontSizeCluster {
            centroid: 12.0,
            members: (0..10)
                .map(|i| TextBlock {
                    text: format!("text {}", i),
                    bbox: BoundingBox {
                        left: 0.0,
                        top: i as f32 * 14.0,
                        right: 100.0,
                        bottom: 12.0 + i as f32 * 14.0,
                    },
                    font_size: 12.0,
                })
                .collect(),
        }];

        let heading_map = assign_heading_levels_smart(&clusters);
        assert_eq!(heading_map.len(), 1);
        assert_eq!(heading_map[0].1, None, "Single cluster should be body");
    }

    #[test]
    fn test_inline_bold_markup() {
        let words = vec![
            PdfWord {
                text: "Hello".to_string(),
                x_start: 0.0,
                x_end: 30.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: false,
                is_italic: false,
            },
            PdfWord {
                text: "bold".to_string(),
                x_start: 35.0,
                x_end: 55.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: true,
                is_italic: false,
            },
            PdfWord {
                text: "text".to_string(),
                x_start: 60.0,
                x_end: 80.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: true,
                is_italic: false,
            },
            PdfWord {
                text: "end".to_string(),
                x_start: 85.0,
                x_end: 105.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: false,
                is_italic: false,
            },
        ];

        let result = render_words_with_markup(&words);
        assert_eq!(result, "Hello **bold text** end");
    }

    #[test]
    fn test_inline_italic_and_bold_italic_markup() {
        let words = vec![
            PdfWord {
                text: "normal".to_string(),
                x_start: 0.0,
                x_end: 30.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: false,
                is_italic: false,
            },
            PdfWord {
                text: "italic".to_string(),
                x_start: 35.0,
                x_end: 65.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: false,
                is_italic: true,
            },
            PdfWord {
                text: "both".to_string(),
                x_start: 70.0,
                x_end: 90.0,
                baseline_y: 100.0,
                font_size: 12.0,
                is_bold: true,
                is_italic: true,
            },
        ];

        let result = render_words_with_markup(&words);
        assert_eq!(result, "normal *italic* ***both***");
    }

    #[test]
    fn test_markdown_assembly() {
        // Build synthetic paragraphs: one heading, one body
        let heading_para = PdfParagraph {
            lines: vec![PdfLine {
                words: vec![PdfWord {
                    text: "Introduction".to_string(),
                    x_start: 0.0,
                    x_end: 80.0,
                    baseline_y: 50.0,
                    font_size: 24.0,
                    is_bold: true,
                    is_italic: false,
                }],
                baseline_y: 50.0,
                y_top: 26.0,
                y_bottom: 50.0,
                dominant_font_size: 24.0,
                is_bold: true,
                is_italic: false,
            }],
            dominant_font_size: 24.0,
            heading_level: Some(1),
            is_bold: true,
            is_italic: false,
            is_list_item: false,
        };

        let body_para = PdfParagraph {
            lines: vec![
                PdfLine {
                    words: vec![
                        PdfWord {
                            text: "This".to_string(),
                            x_start: 0.0,
                            x_end: 25.0,
                            baseline_y: 80.0,
                            font_size: 12.0,
                            is_bold: false,
                            is_italic: false,
                        },
                        PdfWord {
                            text: "is".to_string(),
                            x_start: 30.0,
                            x_end: 40.0,
                            baseline_y: 80.0,
                            font_size: 12.0,
                            is_bold: false,
                            is_italic: false,
                        },
                    ],
                    baseline_y: 80.0,
                    y_top: 68.0,
                    y_bottom: 80.0,
                    dominant_font_size: 12.0,
                    is_bold: false,
                    is_italic: false,
                },
                PdfLine {
                    words: vec![PdfWord {
                        text: "body.".to_string(),
                        x_start: 0.0,
                        x_end: 30.0,
                        baseline_y: 94.0,
                        font_size: 12.0,
                        is_bold: false,
                        is_italic: false,
                    }],
                    baseline_y: 94.0,
                    y_top: 82.0,
                    y_bottom: 94.0,
                    dominant_font_size: 12.0,
                    is_bold: false,
                    is_italic: false,
                },
            ],
            dominant_font_size: 12.0,
            heading_level: None,
            is_bold: false,
            is_italic: false,
            is_list_item: false,
        };

        let markdown = assemble_markdown(vec![vec![heading_para, body_para]]);
        assert_eq!(markdown, "# Introduction\n\nThis is body.");
    }

    #[test]
    fn test_list_item_detection() {
        assert!(is_list_prefix("-"));
        assert!(is_list_prefix("*"));
        assert!(is_list_prefix("\u{2022}")); // bullet
        assert!(is_list_prefix("1."));
        assert!(is_list_prefix("10)"));
        assert!(!is_list_prefix("Hello"));
        assert!(!is_list_prefix(""));
    }

    #[test]
    fn test_empty_document() {
        let paragraphs: Vec<Vec<PdfParagraph>> = vec![vec![]];
        let markdown = assemble_markdown(paragraphs);
        assert_eq!(markdown, "");
    }

    #[test]
    fn test_chars_to_words_multiline() {
        // Characters on two different baselines should produce separate words.
        // PDF coords: larger baseline_y = higher on page = comes first in reading order.
        let fs = 12.0;
        let cw = fs * 0.6;
        let chars = vec![
            plain_char("A", 0.0, 100.0, fs),
            plain_char("B", cw, 100.0, fs),
            plain_char("C", 0.0, 120.0, fs), // higher baseline = higher on page
            plain_char("D", cw, 120.0, fs),
        ];

        let words = chars_to_words(&chars);
        assert_eq!(words.len(), 2, "Expected 2 words on different lines");
        // baseline 120 (higher on page) comes first in descending sort
        assert_eq!(words[0].text, "CD");
        assert_eq!(words[1].text, "AB");
    }

    #[test]
    fn test_body_is_most_frequent_cluster() {
        // Bug regression: 12pt body text (frequent) with 10pt captions (infrequent)
        // Body should be 12pt, not 10pt. 10pt should NOT be a heading.
        let clusters = vec![
            crate::pdf::hierarchy::FontSizeCluster {
                centroid: 12.0,
                members: (0..50)
                    .map(|i| TextBlock {
                        text: format!("body {}", i),
                        bbox: BoundingBox {
                            left: 0.0,
                            top: i as f32 * 14.0,
                            right: 400.0,
                            bottom: 12.0 + i as f32 * 14.0,
                        },
                        font_size: 12.0,
                    })
                    .collect(),
            },
            crate::pdf::hierarchy::FontSizeCluster {
                centroid: 10.0,
                members: (0..5)
                    .map(|i| TextBlock {
                        text: format!("caption {}", i),
                        bbox: BoundingBox {
                            left: 0.0,
                            top: 700.0 + i as f32 * 12.0,
                            right: 200.0,
                            bottom: 710.0 + i as f32 * 12.0,
                        },
                        font_size: 10.0,
                    })
                    .collect(),
            },
        ];

        let heading_map = assign_heading_levels_smart(&clusters);

        // 12pt (most frequent) should be body
        let h12 = heading_map.iter().find(|(c, _)| (*c - 12.0).abs() < 0.1);
        assert_eq!(h12.unwrap().1, None, "12pt (most frequent) should be body");

        // 10pt should also be body (smaller than body, not a heading)
        let h10 = heading_map.iter().find(|(c, _)| (*c - 10.0).abs() < 0.1);
        assert_eq!(h10.unwrap().1, None, "10pt (smaller than body) should NOT be a heading");
    }

    #[test]
    fn test_detect_columns_single_column() {
        let chars: Vec<CharData> = (0..20)
            .map(|i| CharData {
                text: "x".to_string(),
                x: i as f32 * 20.0,
                y: 500.0,
                font_size: 12.0,
                width: 7.0,
                height: 12.0,
                is_bold: false,
                is_italic: false,
                baseline_y: 500.0,
            })
            .collect();
        let columns = detect_columns(&chars, 400.0, 800.0);
        assert_eq!(columns.len(), 1);
    }

    #[test]
    fn test_detect_columns_two_columns() {
        let mut chars: Vec<CharData> = Vec::new();
        for row in 0..30 {
            let y = 700.0 - row as f32 * 20.0;
            for col in 0..10 {
                chars.push(CharData {
                    text: "a".to_string(),
                    x: 10.0 + col as f32 * 18.0,
                    y,
                    font_size: 12.0,
                    width: 7.0,
                    height: 12.0,
                    is_bold: false,
                    is_italic: false,
                    baseline_y: y,
                });
            }
            for col in 0..10 {
                chars.push(CharData {
                    text: "b".to_string(),
                    x: 300.0 + col as f32 * 18.0,
                    y,
                    font_size: 12.0,
                    width: 7.0,
                    height: 12.0,
                    is_bold: false,
                    is_italic: false,
                    baseline_y: y,
                });
            }
        }
        let columns = detect_columns(&chars, 500.0, 800.0);
        assert!(
            columns.len() >= 2,
            "Should detect at least 2 columns, got {}",
            columns.len()
        );
    }

    #[test]
    fn test_detect_columns_empty() {
        let columns = detect_columns(&[], 400.0, 800.0);
        assert_eq!(columns.len(), 1);
    }

    #[test]
    fn test_find_heading_level_outlier_rejected() {
        let heading_map = vec![(24.0, Some(1)), (12.0, None)];
        assert_eq!(find_heading_level(100.0, &heading_map), None);
    }

    #[test]
    fn test_find_heading_level_close_match() {
        let heading_map = vec![(24.0, Some(1)), (12.0, None)];
        assert_eq!(find_heading_level(23.5, &heading_map), Some(1));
    }

    #[test]
    fn test_is_cjk_char() {
        assert!(is_cjk_char('中')); // CJK Unified Ideograph
        assert!(is_cjk_char('あ')); // Hiragana
        assert!(is_cjk_char('ア')); // Katakana
        assert!(is_cjk_char('한')); // Hangul
        assert!(!is_cjk_char('A')); // Latin
        assert!(!is_cjk_char('1')); // Digit
        assert!(!is_cjk_char(' ')); // Space
    }

    #[test]
    fn test_chars_to_words_cjk_boundary() {
        // CJK characters should each become their own word
        let fs = 12.0;
        let cw = fs * 0.6;
        let chars = vec![
            CharData {
                text: "中".to_string(), // CJK
                x: 0.0,
                y: 100.0,
                font_size: fs,
                width: cw,
                height: fs,
                is_bold: false,
                is_italic: false,
                baseline_y: 100.0,
            },
            CharData {
                text: "文".to_string(), // CJK
                x: cw,
                y: 100.0,
                font_size: fs,
                width: cw,
                height: fs,
                is_bold: false,
                is_italic: false,
                baseline_y: 100.0,
            },
            CharData {
                text: "字".to_string(), // CJK
                x: cw * 2.0,
                y: 100.0,
                font_size: fs,
                width: cw,
                height: fs,
                is_bold: false,
                is_italic: false,
                baseline_y: 100.0,
            },
        ];

        let words = chars_to_words(&chars);
        assert_eq!(words.len(), 3, "Expected 3 CJK words, each character separate");
        assert_eq!(words[0].text, "中");
        assert_eq!(words[1].text, "文");
        assert_eq!(words[2].text, "字");
    }

    #[test]
    fn test_chars_to_words_cjk_latin_mixing() {
        // CJK and Latin should break at boundaries
        let fs = 12.0;
        let cw = fs * 0.6;
        let chars = vec![
            CharData {
                text: "A".to_string(),
                x: 0.0,
                y: 100.0,
                font_size: fs,
                width: cw,
                height: fs,
                is_bold: false,
                is_italic: false,
                baseline_y: 100.0,
            },
            CharData {
                text: "B".to_string(),
                x: cw,
                y: 100.0,
                font_size: fs,
                width: cw,
                height: fs,
                is_bold: false,
                is_italic: false,
                baseline_y: 100.0,
            },
            CharData {
                text: "中".to_string(), // CJK boundary break
                x: cw * 2.0,
                y: 100.0,
                font_size: fs,
                width: cw,
                height: fs,
                is_bold: false,
                is_italic: false,
                baseline_y: 100.0,
            },
            CharData {
                text: "C".to_string(), // Another boundary break
                x: cw * 3.0,
                y: 100.0,
                font_size: fs,
                width: cw,
                height: fs,
                is_bold: false,
                is_italic: false,
                baseline_y: 100.0,
            },
        ];

        let words = chars_to_words(&chars);
        assert_eq!(words.len(), 3, "Expected 3 words (AB, 中, C)");
        assert_eq!(words[0].text, "AB", "Latin characters should stay together");
        assert_eq!(words[1].text, "中", "CJK character should be separate");
        assert_eq!(words[2].text, "C", "Latin after CJK should be separate");
    }

    #[test]
    fn test_needs_space_between() {
        // CJK-CJK: no space
        assert!(!needs_space_between("中", "文"));
        assert!(!needs_space_between("あ", "い"));
        // Latin-Latin: space
        assert!(needs_space_between("hello", "world"));
        // CJK-Latin: space (CJK ends, Latin starts)
        assert!(needs_space_between("中", "hello"));
        // Latin-CJK: space (Latin ends, CJK starts)
        assert!(needs_space_between("hello", "中"));
    }

    #[test]
    fn test_join_words_cjk_aware() {
        // CJK words should be joined without spaces
        assert_eq!(join_words_cjk_aware(&["中", "文", "字"]), "中文字");
        // Latin words should be joined with spaces
        assert_eq!(join_words_cjk_aware(&["hello", "world"]), "hello world");
        // Mixed: CJK block then Latin
        assert_eq!(join_words_cjk_aware(&["中", "文", "test"]), "中文 test");
        // Mixed: Latin then CJK
        assert_eq!(join_words_cjk_aware(&["test", "中", "文"]), "test 中文");
        // Single word
        assert_eq!(join_words_cjk_aware(&["hello"]), "hello");
        // Empty
        assert_eq!(join_words_cjk_aware(&[]), "");
    }
}
