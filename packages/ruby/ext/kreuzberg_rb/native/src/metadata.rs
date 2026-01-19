//! Metadata handling and document format detection
//!
//! Provides utilities for MIME type detection, format validation, and extension mapping.

use crate::error_handling::runtime_error;
use magnus::{Error, Ruby};

/// Detect MIME type from bytes
pub fn detect_mime_type_from_bytes(bytes: String) -> Result<String, Error> {
    let bytes_vec = bytes.into_bytes();
    kreuzberg::mime::detect_mime_type_from_bytes(&bytes_vec)
        .map_err(|e| runtime_error(format!("Failed to detect MIME type: {}", e)))
}

/// Detect MIME type from file path
pub fn detect_mime_type_from_path_native(path: String) -> Result<String, Error> {
    kreuzberg::mime::detect_mime_type_from_path(&path)
        .map_err(|e| runtime_error(format!("Failed to detect MIME type from path: {}", e)))
}

/// Validate MIME type
pub fn validate_mime_type_native(mime_type: String) -> Result<String, Error> {
    if kreuzberg::mime::is_supported_mime_type(&mime_type) {
        Ok(mime_type)
    } else {
        Err(runtime_error(format!("Unsupported MIME type: {}", mime_type)))
    }
}

/// Get file extensions for a given MIME type
pub fn get_extensions_for_mime_native(mime_type: String) -> Result<Vec<String>, Error> {
    kreuzberg::mime::get_extensions_for_mime(&mime_type)
        .map_err(|e| runtime_error(format!("Failed to get extensions: {}", e)))
}
