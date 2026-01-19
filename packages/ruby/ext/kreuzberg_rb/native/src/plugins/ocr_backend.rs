//! OCR backend plugin registration and management

use crate::error_handling::{kreuzberg_error, runtime_error};
use magnus::{Error, Value};

/// Register an OCR backend plugin
pub fn register_ocr_backend(_name: String, _backend: Value) -> Result<(), Error> {
    // OCR backend registration would be implemented here
    // For now, return placeholder
    Err(runtime_error("OCR backend registration not yet implemented"))
}

/// Unregister an OCR backend
pub fn unregister_ocr_backend(_name: String) -> Result<(), Error> {
    let registry = kreuzberg::get_ocr_backend_registry();
    registry
        .write()
        .map_err(|e| runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .unregister(_name.as_str())
        .map_err(kreuzberg_error)?;

    Ok(())
}

/// List registered OCR backends
pub fn list_ocr_backends() -> Result<Vec<String>, Error> {
    let registry = kreuzberg::get_ocr_backend_registry();
    let read_guard = registry
        .read()
        .map_err(|e| runtime_error(format!("Failed to acquire registry lock: {}", e)))?;
    Ok(read_guard.list_backends())
}

/// Clear all OCR backends
pub fn clear_ocr_backends() -> Result<(), Error> {
    let registry = kreuzberg::get_ocr_backend_registry();
    registry
        .write()
        .map_err(|e| runtime_error(format!("Failed to acquire registry lock: {}", e)))?
        .clear()
        .map_err(kreuzberg_error)?;

    Ok(())
}
