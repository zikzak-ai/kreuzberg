```rust title="Element-Based Output (Rust)"
use kreuzberg::{extract_file_sync, ExtractionConfig, OutputFormat};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Configure element-based output
    let config = ExtractionConfig {
        output_format: OutputFormat::ElementBased,
        ..Default::default()
    };

    // Extract document
    let result = extract_file_sync("document.pdf", Some(config))?;

    // Access elements
    if let Some(elements) = result.elements {
        for element in &elements {
            println!("Type: {:?}", element.element_type);
            println!("Text: {}", &element.text[..100.min(element.text.len())]);

            if let Some(page) = element.metadata.page_number {
                println!("Page: {}", page);
            }

            if let Some(coords) = &element.metadata.coordinates {
                println!("Coords: ({}, {}) - ({}, {})",
                    coords.left, coords.top, coords.right, coords.bottom);
            }

            println!("---");
        }

        // Filter by element type
        let titles: Vec<_> = elements.iter()
            .filter(|e| matches!(e.element_type, kreuzberg::types::ElementType::Title))
            .collect();

        for title in titles {
            let level = title.metadata.additional.get("level")
                .and_then(|v| v.as_str())
                .unwrap_or("unknown");
            println!("[{}] {}", level, title.text);
        }
    }

    Ok(())
}
```
