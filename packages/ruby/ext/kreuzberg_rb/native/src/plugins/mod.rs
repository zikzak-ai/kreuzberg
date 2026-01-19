//! Plugin management for Kreuzberg
//!
//! Handles registration and management of custom plugins including post-processors,
//! validators, and OCR backends.

pub mod post_processor;
pub mod validator;
pub mod ocr_backend;

pub use post_processor::register_post_processor;
pub use validator::register_validator;
pub use ocr_backend::{register_ocr_backend, unregister_ocr_backend, list_ocr_backends, clear_ocr_backends};

// Plugin registry functions
pub use kreuzberg::{
    get_post_processor_registry, get_validator_registry,
};

use magnus::Error;

/// Unregister a post-processor plugin by name
pub fn unregister_post_processor(name: String) -> Result<(), Error> {
    let registry = get_post_processor_registry();
    registry
        .write()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .unregister(&name)
        .map_err(crate::error_handling::kreuzberg_error)?;

    Ok(())
}

/// Unregister a validator plugin by name
pub fn unregister_validator(name: String) -> Result<(), Error> {
    let registry = get_validator_registry();
    registry
        .write()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .unregister(&name)
        .map_err(crate::error_handling::kreuzberg_error)?;

    Ok(())
}

/// Clear all post-processors
pub fn clear_post_processors() -> Result<(), Error> {
    let registry = get_post_processor_registry();
    registry
        .write()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .clear()
        .map_err(crate::error_handling::kreuzberg_error)?;

    Ok(())
}

/// Clear all validators
pub fn clear_validators() -> Result<(), Error> {
    let registry = get_validator_registry();
    registry
        .write()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .clear()
        .map_err(crate::error_handling::kreuzberg_error)?;

    Ok(())
}

/// List registered post-processors
pub fn list_post_processors() -> Result<Vec<String>, Error> {
    let registry = get_post_processor_registry();
    let read_guard = registry
        .read()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?;
    Ok(read_guard.list_processors())
}

/// List registered validators
pub fn list_validators() -> Result<Vec<String>, Error> {
    let registry = get_validator_registry();
    let read_guard = registry
        .read()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?;
    Ok(read_guard.list_validators())
}

/// List registered document extractors
pub fn list_document_extractors() -> Result<Vec<String>, Error> {
    kreuzberg::get_document_extractor_registry()
        .read()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .list_extractors()
        .map_err(crate::error_handling::kreuzberg_error)
}

/// Unregister a document extractor
pub fn unregister_document_extractor(name: String) -> Result<(), Error> {
    kreuzberg::get_document_extractor_registry()
        .write()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .unregister(&name)
        .map_err(crate::error_handling::kreuzberg_error)?;

    Ok(())
}

/// Clear all document extractors
pub fn clear_document_extractors() -> Result<(), Error> {
    kreuzberg::get_document_extractor_registry()
        .write()
        .map_err(|e| crate::error_handling::runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .clear()
        .map_err(crate::error_handling::kreuzberg_error)?;

    Ok(())
}
