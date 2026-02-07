//! Gzip decompression and extraction.
//!
//! Provides functions for decompressing gzip files and extracting
//! metadata and text content from the compressed data.

use super::{ArchiveEntry, ArchiveMetadata};
use crate::error::{KreuzbergError, Result};
use crate::extractors::security::SecurityLimits;
use flate2::read::GzDecoder;
use std::collections::HashMap;
use std::io::Read;

/// Decompress gzip bytes with a size limit to prevent decompression bombs.
fn decompress_gzip_limited(bytes: &[u8], max_size: u64) -> Result<Vec<u8>> {
    let decoder = GzDecoder::new(bytes);
    let mut limited = decoder.take(max_size + 1);
    let mut decompressed = Vec::new();
    limited
        .read_to_end(&mut decompressed)
        .map_err(|e| KreuzbergError::parsing(format!("Failed to decompress gzip: {}", e)))?;

    if decompressed.len() as u64 > max_size {
        return Err(KreuzbergError::validation(format!(
            "Gzip decompressed size exceeds {} byte limit",
            max_size
        )));
    }

    Ok(decompressed)
}

/// Decompress gzip bytes, returning the raw decompressed data.
pub fn decompress_gzip(bytes: &[u8], limits: &SecurityLimits) -> Result<Vec<u8>> {
    decompress_gzip_limited(bytes, limits.max_archive_size as u64)
}

/// Extract both metadata and text content from gzip in a single decompression pass.
///
/// This avoids the overhead of decompressing the data multiple times when both
/// metadata and text content are needed.
pub fn extract_gzip(bytes: &[u8], limits: &SecurityLimits) -> Result<(ArchiveMetadata, HashMap<String, String>)> {
    let decompressed = decompress_gzip_limited(bytes, limits.max_archive_size as u64)?;

    // Re-read header for filename (lightweight - no decompression)
    let mut decoder = GzDecoder::new(bytes);
    let mut _discard = [0u8; 1];
    let _ = decoder.read(&mut _discard); // trigger header read
    let filename = decoder
        .header()
        .and_then(|h| h.filename())
        .and_then(|f| std::str::from_utf8(f).ok())
        .unwrap_or("compressed_content")
        .to_string();

    let size = decompressed.len() as u64;

    let metadata = ArchiveMetadata {
        format: "GZIP".to_string(),
        file_list: vec![ArchiveEntry {
            path: filename.clone(),
            size,
            is_dir: false,
        }],
        file_count: 1,
        total_size: size,
    };

    let mut contents = HashMap::new();
    if let Ok(text) = String::from_utf8(decompressed) {
        contents.insert(filename, text);
    }

    Ok((metadata, contents))
}

/// Extract metadata from a gzip-compressed file.
///
/// Gzip wraps a single stream, so the metadata contains one entry
/// with the original filename (from gzip header) and decompressed size.
pub fn extract_gzip_metadata(bytes: &[u8], limits: &SecurityLimits) -> Result<ArchiveMetadata> {
    let decompressed = decompress_gzip_limited(bytes, limits.max_archive_size as u64)?;

    let mut decoder = GzDecoder::new(bytes);
    let mut _discard = [0u8; 1];
    let _ = decoder.read(&mut _discard);
    let filename = decoder
        .header()
        .and_then(|h| h.filename())
        .and_then(|f| std::str::from_utf8(f).ok())
        .unwrap_or("compressed_content")
        .to_string();

    let size = decompressed.len() as u64;

    Ok(ArchiveMetadata {
        format: "GZIP".to_string(),
        file_list: vec![ArchiveEntry {
            path: filename,
            size,
            is_dir: false,
        }],
        file_count: 1,
        total_size: size,
    })
}

/// Extract text content from a gzip-compressed file.
///
/// Decompresses and attempts to read the result as UTF-8 text.
pub fn extract_gzip_text_content(bytes: &[u8], limits: &SecurityLimits) -> Result<HashMap<String, String>> {
    let decompressed = decompress_gzip_limited(bytes, limits.max_archive_size as u64)?;

    let mut decoder = GzDecoder::new(bytes);
    let mut _discard = [0u8; 1];
    let _ = decoder.read(&mut _discard);
    let filename = decoder
        .header()
        .and_then(|h| h.filename())
        .and_then(|f| std::str::from_utf8(f).ok())
        .unwrap_or("compressed_content")
        .to_string();

    let mut contents = HashMap::new();
    if let Ok(text) = String::from_utf8(decompressed) {
        contents.insert(filename, text);
    }

    Ok(contents)
}
