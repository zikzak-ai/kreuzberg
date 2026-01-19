//! Validation functions for configuration and formats
//!
//! Provides validation for MIME types, formats, and other configuration parameters.

pub use kreuzberg_ffi::{
    kreuzberg_validate_binarization_method, kreuzberg_validate_ocr_backend,
    kreuzberg_validate_language_code, kreuzberg_validate_token_reduction_level,
    kreuzberg_validate_tesseract_psm, kreuzberg_validate_tesseract_oem,
    kreuzberg_validate_output_format, kreuzberg_validate_confidence, kreuzberg_validate_dpi,
    kreuzberg_validate_chunking_params, kreuzberg_get_valid_binarization_methods,
    kreuzberg_get_valid_language_codes, kreuzberg_get_valid_ocr_backends,
    kreuzberg_get_valid_token_reduction_levels,
};

// These validation functions are called through FFI re-exports from kreuzberg_ffi
// They will be registered as native Ruby methods in lib.rs
