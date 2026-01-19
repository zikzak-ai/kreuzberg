//! OCR configuration.
//!
//! Defines OCR-specific configuration including backend selection, language settings,
//! and Tesseract-specific parameters.

use serde::{Deserialize, Serialize};

/// OCR configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OcrConfig {
    /// OCR backend: tesseract, easyocr, paddleocr
    #[serde(default = "default_tesseract_backend")]
    pub backend: String,

    /// Language code (e.g., "eng", "deu")
    #[serde(default = "default_eng")]
    pub language: String,

    /// Tesseract-specific configuration (optional)
    #[serde(default)]
    pub tesseract_config: Option<crate::types::TesseractConfig>,
}

impl Default for OcrConfig {
    fn default() -> Self {
        Self {
            backend: default_tesseract_backend(),
            language: default_eng(),
            tesseract_config: None,
        }
    }
}

fn default_tesseract_backend() -> String {
    "tesseract".to_string()
}

fn default_eng() -> String {
    "eng".to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ocr_config_default() {
        let config = OcrConfig::default();
        assert_eq!(config.backend, "tesseract");
        assert_eq!(config.language, "eng");
        assert!(config.tesseract_config.is_none());
    }

    #[test]
    fn test_ocr_config_with_tesseract() {
        let config = OcrConfig {
            backend: "tesseract".to_string(),
            language: "fra".to_string(),
            tesseract_config: None,
        };
        assert_eq!(config.backend, "tesseract");
        assert_eq!(config.language, "fra");
    }
}
