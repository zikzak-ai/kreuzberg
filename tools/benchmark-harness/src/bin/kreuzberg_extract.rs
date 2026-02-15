//! Kreuzberg Rust extraction subprocess for fair benchmarking.
//!
//! This binary runs kreuzberg extraction in a subprocess, matching the same
//! protocol used by Python/Node/Ruby extraction scripts. This ensures fair
//! timing comparisons by including subprocess overhead equally for all frameworks.
//!
//! Protocol:
//! - Prints "READY" on startup
//! - Reads file paths from stdin (one per line)
//! - Outputs JSON to stdout: {"content": "...", "_extraction_time_ms": 123.4, "_ocr_used": false}
//! - On error: {"error": "message"}

use kreuzberg::{ExtractionConfig, extract_file_sync};
use serde_json::json;
use std::io::{self, BufRead, Write};
use std::time::Instant;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let ocr_enabled = args.iter().any(|a| a == "--ocr");

    let config = ExtractionConfig {
        use_cache: false,
        ..Default::default()
    };

    // Signal readiness
    println!("READY");
    io::stdout().flush().unwrap();

    let stdin = io::stdin();
    for line in stdin.lock().lines() {
        let file_path = match line {
            Ok(l) => l.trim().to_string(),
            Err(_) => break,
        };

        if file_path.is_empty() {
            continue;
        }

        let start = Instant::now();
        match extract_file_sync(&file_path, None, &config) {
            Ok(result) => {
                let duration_ms = start.elapsed().as_secs_f64() * 1000.0;
                let ocr_used = ocr_enabled
                    && matches!(
                        &result.metadata.format,
                        Some(kreuzberg::FormatMetadata::Ocr(_)) | Some(kreuzberg::FormatMetadata::Image(_))
                    );

                let output = json!({
                    "content": result.content,
                    "_extraction_time_ms": duration_ms,
                    "_ocr_used": ocr_used,
                });
                println!("{}", output);
                io::stdout().flush().unwrap();
            }
            Err(e) => {
                let output = json!({
                    "error": format!("{}", e),
                });
                println!("{}", output);
                io::stdout().flush().unwrap();
            }
        }
    }
}
