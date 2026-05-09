```go title="Go"
package main

import (
	"log"

	"github.com/kreuzberg-dev/kreuzberg/v5"
)

func main() {
	trueVal := true
	config := kreuzberg.ExtractionConfig{
		UseCache:                &trueVal,
		EnableQualityProcessing: &trueVal,
		Ocr: &kreuzberg.OcrConfig{
			Backend:   "tesseract",
			Languages: []string{"eng", "fra"},
		},
		Chunking: &kreuzberg.ChunkingConfig{
			MaxCharacters: 1000,
			Overlap:       200,
		},
	}

	result, err := kreuzberg.ExtractFileSync("document.pdf", nil, config)
	if err != nil {
		log.Fatalf("extraction failed: %v", err)
	}

	println("Content length:", len(result.Content))
	println("Chunks:", len(result.Chunks))
}
```
