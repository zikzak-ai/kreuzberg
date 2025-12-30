# Go

<div align="center" style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 20px 0;">
  <!-- Language Bindings -->
  <a href="https://crates.io/crates/kreuzberg">
    <img src="https://img.shields.io/crates/v/kreuzberg?label=Rust&color=007ec6" alt="Rust">
  </a>
  <a href="https://hex.pm/packages/kreuzberg">
    <img src="https://img.shields.io/hexpm/v/kreuzberg?label=Elixir&color=007ec6" alt="Elixir">
  </a>
  <a href="https://pypi.org/project/kreuzberg/">
    <img src="https://img.shields.io/pypi/v/kreuzberg?label=Python&color=007ec6" alt="Python">
  </a>
  <a href="https://www.npmjs.com/package/@kreuzberg/node">
    <img src="https://img.shields.io/npm/v/@kreuzberg/node?label=Node.js&color=007ec6" alt="Node.js">
  </a>
  <a href="https://www.npmjs.com/package/@kreuzberg/wasm">
    <img src="https://img.shields.io/npm/v/@kreuzberg/wasm?label=WASM&color=007ec6" alt="WASM">
  </a>

<a href="https://central.sonatype.com/artifact/dev.kreuzberg/kreuzberg">
    <img src="https://img.shields.io/maven-central/v/dev.kreuzberg/kreuzberg?label=Java&color=007ec6" alt="Java">
  </a>
  <a href="https://github.com/kreuzberg-dev/kreuzberg/releases">
    <img src="https://img.shields.io/github/v/tag/kreuzberg-dev/kreuzberg?label=Go&color=007ec6&filter=v4.0.0-*" alt="Go">
  </a>
  <a href="https://www.nuget.org/packages/Kreuzberg/">
    <img src="https://img.shields.io/nuget/v/Kreuzberg?label=C%23&color=007ec6" alt="C#">
  </a>
  <a href="https://packagist.org/packages/kreuzberg/kreuzberg">
    <img src="https://img.shields.io/packagist/v/kreuzberg/kreuzberg?label=PHP&color=007ec6" alt="PHP">
  </a>
  <a href="https://rubygems.org/gems/kreuzberg">
    <img src="https://img.shields.io/gem/v/kreuzberg?label=Ruby&color=007ec6" alt="Ruby">
  </a>

<!-- Project Info -->

<a href="https://github.com/kreuzberg-dev/kreuzberg/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="https://docs.kreuzberg.dev">
    <img src="https://img.shields.io/badge/docs-kreuzberg.dev-blue" alt="Documentation">
  </a>
</div>

<img width="1128" height="191" alt="Banner2" src="https://github.com/user-attachments/assets/419fc06c-8313-4324-b159-4b4d3cfce5c0" />

<div align="center" style="margin-top: 20px;">
  <a href="https://discord.gg/pXxagNK2zN">
      <img height="22" src="https://img.shields.io/badge/Discord-Join%20our%20community-7289da?logo=discord&logoColor=white" alt="Discord">
  </a>
</div>

Extract text, tables, images, and metadata from 56 file formats including PDF, Office documents, and images. Go bindings with context-aware async support, idiomatic functional options API, and CGO-based native performance.

> **Version 4.0.0 Release Candidate**
> Kreuzberg v4.0.0 is in **Release Candidate** stage. Bugs and breaking changes are expected.
> This is a pre-release version. Please test the library and [report any issues](https://github.com/kreuzberg-dev/kreuzberg/issues) you encounter.
>
> **Breaking Change**: v4.0.0 introduces the functional options pattern for configuration. See [MIGRATION_v4.md](./MIGRATION_v4.md) for migration from v3.x.

## Installation

### Go Package

Install with go get:

```bash
go get github.com/kreuzberg-dev/kreuzberg/packages/go/v4
```

### Native Library

The Go binding requires the Kreuzberg FFI library. Use one of these approaches:

#### Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/kreuzberg-dev/kreuzberg.git
cd kreuzberg

# Run the installer (detects platform, downloads pre-built or builds from source)
./scripts/go/install-binaries.sh

# Follow the printed instructions to set environment variables
```

#### Manual Setup

Download pre-built FFI libraries from [releases](https://github.com/kreuzberg-dev/kreuzberg/releases):

```bash
# Download for your platform
curl -LO https://github.com/kreuzberg-dev/kreuzberg/releases/download/v4.0.0/go-ffi-linux-x86_64.tar.gz

# Extract and install
tar -xzf go-ffi-linux-x86_64.tar.gz
cd kreuzberg-ffi
sudo cp -r lib/* /usr/local/lib/
sudo cp -r include/* /usr/local/include/
sudo ldconfig  # Linux only

# Verify
pkg-config --modversion kreuzberg-ffi
```

#### Build from Source

```bash
# In the Kreuzberg repository
cargo build -p kreuzberg-ffi --release

# Set environment for development
export PKG_CONFIG_PATH="$PWD/crates/kreuzberg-ffi:$PKG_CONFIG_PATH"
export LD_LIBRARY_PATH="$PWD/target/release"  # Linux
export DYLD_FALLBACK_LIBRARY_PATH="$PWD/target/release"  # macOS
```

### System Requirements

- **Go 1.19+** required
- **Platform**: Linux (x86_64), macOS (arm64/x86_64), Windows (x86_64)
- **Optional**: [ONNX Runtime](https://github.com/microsoft/onnxruntime/releases) for embeddings support
- **Optional**: [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) for OCR functionality

## Quick Start

### Minimal Example

Extract text from any supported document format with defaults:

```go
package main

import (
	"fmt"
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	// nil config uses Kreuzberg defaults
	result, err := v4.ExtractFileSync("document.pdf", nil)
	if err != nil {
		log.Fatalf("extraction failed: %v", err)
	}

	fmt.Println(result.Content)
}
```

### With Configuration

The new functional options API makes configuration clean and readable:

```go
package main

import (
	"fmt"
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	// Build configuration with functional options
	config := v4.NewExtractionConfig(
		v4.WithUseCache(true),
		v4.WithEnableQualityProcessing(true),
	)

	result, err := v4.ExtractFileSync("document.pdf", config)
	if err != nil {
		log.Fatalf("extraction failed: %v", err)
	}

	fmt.Println("Content:")
	fmt.Println(result.Content)

	fmt.Println("\nMetadata:")
	for key, value := range result.Metadata {
		fmt.Printf("%s: %v\n", key, value)
	}

	fmt.Printf("\nTables: %d, Images: %d\n", len(result.Tables), len(result.Images))
}
```

### Common Use Cases

#### Extract with OCR (Scanned Documents)

```go
package main

import (
	"fmt"
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	config := v4.NewExtractionConfig(
		v4.WithForceOCR(true),
		v4.WithOCR(
			v4.WithOCRBackend("tesseract"),
			v4.WithOCRLanguage("eng"),
		),
	)

	result, err := v4.ExtractFileSync("scanned.pdf", config)
	if err != nil {
		log.Fatalf("ocr extraction failed: %v", err)
	}

	fmt.Println("Extracted from scanned document:")
	fmt.Println(result.Content)
}
```

#### Advanced OCR Configuration

```go
package main

import (
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	config := v4.NewExtractionConfig(
		v4.WithOCR(
			v4.WithOCRBackend("tesseract"),
			v4.WithOCRLanguage("eng"),
			v4.WithTesseract(
				v4.WithTesseractLanguage("eng"),
				v4.WithTesseractPSM(3),
				v4.WithTesseractMinConfidence(0.75),
				v4.WithTesseractEnableTableDetection(true),
				v4.WithTesseractTableMinConfidence(0.8),
			),
		),
	)

	result, err := v4.ExtractFileSync("complex.pdf", config)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Extracted %d characters, %d tables\n",
		len(result.Content), len(result.Tables))
}
```

#### Table Extraction

```go
package main

import (
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	config := v4.NewExtractionConfig(
		v4.WithChunking(
			v4.WithChunkingEnabled(true),
			v4.WithChunkSize(2000),
		),
	)

	result, err := v4.ExtractFileSync("spreadsheet.xlsx", config)
	if err != nil {
		log.Fatal(err)
	}

	for _, table := range result.Tables {
		log.Printf("Table: %d rows x %d cols\n",
			len(table.Rows), len(table.Rows[0].Cells))
	}
}
```

#### Batch Processing

```go
package main

import (
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	config := v4.NewExtractionConfig(
		v4.WithUseCache(true),
		v4.WithMaxConcurrentExtractions(4),
	)

	files := []string{"doc1.pdf", "doc2.docx", "doc3.xlsx"}
	results, err := v4.BatchExtractFilesSync(files, config)
	if err != nil {
		log.Fatal(err)
	}

	for i, result := range results {
		if result != nil {
			log.Printf("[%d] %s: %d bytes", i, result.MimeType, len(result.Content))
		}
	}
}
```

#### Language Detection & Keyword Extraction

```go
package main

import (
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	config := v4.NewExtractionConfig(
		v4.WithLanguageDetection(
			v4.WithLanguageDetectionEnabled(true),
		),
		v4.WithKeywords(
			v4.WithKeywordsEnabled(true),
		),
	)

	result, err := v4.ExtractFileSync("article.pdf", config)
	if err != nil {
		log.Fatal(err)
	}

	if lang, ok := result.Metadata["language"]; ok {
		log.Println("Detected language:", lang)
	}

	for _, keyword := range result.Keywords {
		log.Printf("  %s (score: %.2f)\n", keyword.Text, keyword.Score)
	}
}
```

#### Quality Processing

```go
package main

import (
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	config := v4.NewExtractionConfig(
		v4.WithEnableQualityProcessing(true),
		v4.WithUseCache(true),
		v4.WithTokenReduction(
			v4.WithTokenReductionEnabled(true),
		),
	)

	result, err := v4.ExtractFileSync("document.pdf", config)
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Quality score: %v\n", result.Metadata["quality_score"])
	log.Printf("Processing time: %vms\n", result.Metadata["processing_time"])
}
```

#### Embeddings Full Workflow

```go
package main

import (
	"fmt"
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	// Configure chunking with embedding generation
	config := v4.NewExtractionConfig(
		v4.WithChunking(
			v4.WithChunkingEnabled(true),
			v4.WithChunkSize(512),
			v4.WithChunkOverlap(50),
			v4.WithEmbedding(
				v4.WithEmbeddingModel(
					v4.WithEmbeddingModelType("onnx"),
					v4.WithEmbeddingModelName("jina-embeddings-v2-small-en"),
				),
				v4.WithEmbeddingNormalize(true),
				v4.WithEmbeddingBatchSize(32),
				v4.WithShowDownloadProgress(true),
				v4.WithCacheDir("/tmp/embeddings_cache"),
			),
		),
	)

	result, err := v4.ExtractFileSync("document.pdf", config)
	if err != nil {
		log.Fatalf("extraction failed: %v", err)
	}

	fmt.Printf("Document extracted: %d characters\n", len(result.Content))
	fmt.Printf("Total chunks: %d\n", len(result.Chunks))

	// Access embeddings from chunks
	if len(result.Chunks) > 0 {
		for i, chunk := range result.Chunks {
			fmt.Printf("Chunk %d: %d chars, %d dimensions\n",
				i, len(chunk.Content), len(chunk.Embedding))
			// Embedding is a []float32 - use for similarity search, RAG, etc.
		}
	}
}
```

#### Image Extraction with Metadata

```go
package main

import (
	"fmt"
	"log"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	// Configure image extraction with metadata
	config := v4.NewExtractionConfig(
		v4.WithImages(
			v4.WithExtractImages(true),
			v4.WithImageTargetDPI(150),
			v4.WithMaxImageDimension(4000),
			v4.WithAutoAdjustDPI(true),
		),
		v4.WithPdfOptions(
			v4.WithPdfExtractMetadata(true),
		),
	)

	result, err := v4.ExtractFileSync("document.pdf", config)
	if err != nil {
		log.Fatalf("extraction failed: %v", err)
	}

	fmt.Printf("Extracted %d images from document\n", len(result.Images))

	// Access image metadata
	for i, img := range result.Images {
		fmt.Printf("\nImage %d:\n", i)
		fmt.Printf("  Format: %s\n", img.Format)
		if img.Width != nil && img.Height != nil {
			fmt.Printf("  Dimensions: %dx%d\n", *img.Width, *img.Height)
		}
		fmt.Printf("  Size: %d bytes\n", len(img.Data))
		if img.PageNumber != nil {
			fmt.Printf("  Page: %d\n", *img.PageNumber)
		}
		if img.Colorspace != nil {
			fmt.Printf("  Colorspace: %s\n", *img.Colorspace)
		}
	}

	// Access document-level image metadata if available
	if imgMeta, ok := result.Metadata.ImageMetadata(); ok {
		fmt.Printf("\nDocument Image Metadata:\n")
		fmt.Printf("  Document Size: %dx%d\n", imgMeta.Width, imgMeta.Height)
		fmt.Printf("  Format: %s\n", imgMeta.Format)
		if len(imgMeta.EXIF) > 0 {
			fmt.Printf("  EXIF Data:\n")
			for key, val := range imgMeta.EXIF {
				fmt.Printf("    %s: %s\n", key, val)
			}
		}
	}
}
```

#### Plugin Registration Patterns

```go
package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	// Register custom post-processor plugins
	config := v4.NewExtractionConfig(
		v4.WithPostprocessor(
			v4.WithPostProcessorEnabled(true),
			v4.WithEnabledProcessors([]string{
				"lowercase",      // Built-in processor
				"remove_extra_spaces",
				"custom_validator",  // Custom plugin
			}),
		),
	)

	result, err := v4.ExtractFileSync("document.pdf", config)
	if err != nil {
		log.Fatalf("extraction failed: %v", err)
	}

	// Post-processors have transformed the extracted content
	fmt.Printf("Processed content (first 200 chars):\n")
	if len(result.Content) > 200 {
		fmt.Println(result.Content[:200])
	} else {
		fmt.Println(result.Content)
	}
}

// Example of a post-processor validator callback pattern
// (If the library supports custom validators)
func exampleValidatorCallback(content string) (string, error) {
	// Custom validation logic
	if strings.TrimSpace(content) == "" {
		return "", fmt.Errorf("content is empty after processing")
	}
	return content, nil
}
```

#### Page-Based Extraction

```go
package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
	// Configure page extraction with markers
	config := v4.NewExtractionConfig(
		v4.WithPages(
			v4.WithExtractPages(true),
			v4.WithInsertPageMarkers(true),
			v4.WithMarkerFormat("--- PAGE %d ---"),
		),
	)

	result, err := v4.ExtractFileSync("multi_page.pdf", config)
	if err != nil {
		log.Fatalf("extraction failed: %v", err)
	}

	fmt.Printf("Total content: %d characters\n", len(result.Content))

	// Content now includes page markers
	lines := strings.Split(result.Content, "\n")
	pageCount := 0
	for _, line := range lines {
		if strings.Contains(line, "PAGE") {
			pageCount++
			fmt.Printf("Found: %s\n", line)
		}
	}

	fmt.Printf("Document has %d pages\n", pageCount)

	// Access per-page content by splitting on markers
	pages := strings.Split(result.Content, "--- PAGE")
	fmt.Printf("Split into %d sections\n", len(pages))

	for i, page := range pages {
		if i > 0 { // Skip initial empty split
			contentLen := len(strings.TrimSpace(page))
			fmt.Printf("Page %d: %d characters\n", i, contentLen)
		}
	}
}
```

### Next Steps

- **[Installation Guide](https://kreuzberg.dev/getting-started/installation/)** - Platform-specific setup
- **[API Documentation](https://kreuzberg.dev/api/)** - Complete API reference
- **[Examples & Guides](https://kreuzberg.dev/guides/)** - Full code examples and usage guides
- **[Configuration Guide](https://kreuzberg.dev/configuration/)** - Advanced configuration options
- **[Troubleshooting](https://kreuzberg.dev/troubleshooting/)** - Common issues and solutions

## Features

### Supported File Formats (56+)

56 file formats across 8 major categories with intelligent format detection and comprehensive metadata extraction.

#### Office Documents

| Category | Formats | Capabilities |
|----------|---------|--------------|
| **Word Processing** | `.docx`, `.odt` | Full text, tables, images, metadata, styles |
| **Spreadsheets** | `.xlsx`, `.xlsm`, `.xlsb`, `.xls`, `.xla`, `.xlam`, `.xltm`, `.ods` | Sheet data, formulas, cell metadata, charts |
| **Presentations** | `.pptx`, `.ppt`, `.ppsx` | Slides, speaker notes, images, metadata |
| **PDF** | `.pdf` | Text, tables, images, metadata, OCR support |
| **eBooks** | `.epub`, `.fb2` | Chapters, metadata, embedded resources |

#### Images (OCR-Enabled)

| Category | Formats | Features |
|----------|---------|----------|
| **Raster** | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.tiff`, `.tif` | OCR, table detection, EXIF metadata, dimensions, color space |
| **Advanced** | `.jp2`, `.jpx`, `.jpm`, `.mj2`, `.pnm`, `.pbm`, `.pgm`, `.ppm` | OCR, table detection, format-specific metadata |
| **Vector** | `.svg` | DOM parsing, embedded text, graphics metadata |

#### Web & Data

| Category | Formats | Features |
|----------|---------|----------|
| **Markup** | `.html`, `.htm`, `.xhtml`, `.xml`, `.svg` | DOM parsing, metadata (Open Graph, Twitter Card), link extraction |
| **Structured Data** | `.json`, `.yaml`, `.yml`, `.toml`, `.csv`, `.tsv` | Schema detection, nested structures, validation |
| **Text & Markdown** | `.txt`, `.md`, `.markdown`, `.rst`, `.org`, `.rtf` | CommonMark, GFM, reStructuredText, Org Mode |

#### Email & Archives

| Category | Formats | Features |
|----------|---------|----------|
| **Email** | `.eml`, `.msg` | Headers, body (HTML/plain), attachments, threading |
| **Archives** | `.zip`, `.tar`, `.tgz`, `.gz`, `.7z` | File listing, nested archives, metadata |

#### Academic & Scientific

| Category | Formats | Features |
|----------|---------|----------|
| **Citations** | `.bib`, `.biblatex`, `.ris`, `.enw`, `.csl` | Bibliography parsing, citation extraction |
| **Scientific** | `.tex`, `.latex`, `.typst`, `.jats`, `.ipynb`, `.docbook` | LaTeX, Jupyter notebooks, PubMed JATS |
| **Documentation** | `.opml`, `.pod`, `.mdoc`, `.troff` | Technical documentation formats |

**[Complete Format Reference](https://kreuzberg.dev/reference/formats/)**

### Key Capabilities

- **Text Extraction** - Extract all text content with position and formatting information

- **Metadata Extraction** - Retrieve document properties, creation date, author, etc.

- **Table Extraction** - Parse tables with structure and cell content preservation

- **Image Extraction** - Extract embedded images and render page previews

- **OCR Support** - Integrate multiple OCR backends for scanned documents

- **Concurrent Processing** - Goroutine-based parallelism with context cancellation

- **Plugin System** - Extensible post-processing for custom text transformation

- **Batch Processing** - Efficiently process multiple documents in parallel

- **Memory Efficient** - Stream large files without loading entirely into memory

- **Language Detection** - Detect and support multiple languages in documents

- **Configuration** - Fine-grained control over extraction behavior

### Concurrency Model

**Go Uses Context-Based Cancellation (Not Async/Await)**

Unlike Python and Node.js bindings, Go does NOT support async/await or Promise-based operations. Instead, Go uses:

- ✅ **Context-based pre-operation cancellation** - Check `ctx.Err()` before starting extraction
- ✅ **Goroutines for parallelism** - Use goroutines and sync.WaitGroup for concurrent processing
- ❌ **No mid-operation cancellation** - Once extraction starts, it runs to completion

**Comparison Table**

| Feature | Go (context.Context) | Python (async/await) | Node.js (Promises) |
|---------|---------------------|---------------------|-------------------|
| **Cancellation Timing** | Before operation starts | During operation (can suspend) | During operation (can suspend) |
| **Syntax** | `ExtractFileWithContext(ctx, path, cfg)` | `await extract_file(path, cfg)` | `await extractFile(path, cfg)` |
| **Parallel Execution** | Manual goroutines + WaitGroup | asyncio.gather() / TaskGroup | Promise.all() |
| **Timeout Pattern** | `context.WithTimeout()` | asyncio.wait_for() | Promise.race() with timeout |
| **Mid-Operation Cancel** | ❌ No | ✅ Yes | ✅ Yes |

**Example: Concurrent Extraction with Timeout**

```go
package main

import (
    "context"
    "fmt"
    "sync"
    "time"

    "github.com/kreuzberg-dev/kreuzberg/packages/go/v4"
)

func main() {
    files := []string{"doc1.pdf", "doc2.pdf", "doc3.pdf"}

    // Create context with 30-second timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    var wg sync.WaitGroup
    results := make([]*kreuzberg.ExtractionResult, len(files))

    for i, path := range files {
        wg.Add(1)
        go func(idx int, p string) {
            defer wg.Done()

            // Context check happens BEFORE extraction starts
            // If context is already cancelled/expired, extraction won't start
            result, err := kreuzberg.ExtractFileWithContext(ctx, p, nil)
            if err != nil {
                fmt.Printf("Error extracting %s: %v\n", p, err)
                return
            }
            results[idx] = result
        }(i, path)
    }

    wg.Wait()
    fmt.Printf("Extracted %d documents\n", len(results))
}
```

**Migration Note**: If migrating from Python or Node.js:
- Replace `await extractFile()` with manual goroutines + WaitGroup pattern (see example above)
- Replace `asyncio.gather()` / `Promise.all()` with goroutines + channels or WaitGroup
- Use `context.WithTimeout()` instead of Promise.race() or asyncio.wait_for()
- Remember: Context cancellation is checked BEFORE extraction, not during

### Performance Characteristics

| Format | Speed | Memory | Notes |
|--------|-------|--------|-------|
| **PDF (text)** | 10-100 MB/s | ~50MB per doc | Fastest extraction |
| **Office docs** | 20-200 MB/s | ~100MB per doc | DOCX, XLSX, PPTX |
| **Images (OCR)** | 1-5 MB/s | Variable | Depends on OCR backend |
| **Archives** | 5-50 MB/s | ~200MB per doc | ZIP, TAR, etc. |
| **Web formats** | 50-200 MB/s | Streaming | HTML, XML, JSON |

## Key Features

### Supported File Formats

Extract text, tables, and metadata from 56+ file formats:

**Office Documents**: PDF, DOCX, XLSX, PPTX, and more
**Images**: PNG, JPG, WEBP, TIFF, SVG (with OCR support)
**Web**: HTML, XML, JSON, YAML, CSV, Markdown
**Email & Archives**: EML, MSG, ZIP, TAR, 7Z
**Academic**: LaTeX, Jupyter notebooks, citations

[Complete format reference](https://kreuzberg.dev/reference/formats/)

### Core Capabilities

- **Text Extraction** - Full content with position information
- **Metadata Extraction** - Document properties, dates, author
- **Table Extraction** - Structure-preserving table parsing
- **Image Extraction** - Embedded images with metadata
- **OCR Support** - Tesseract backend for scanned documents
- **Language Detection** - Automatic language identification
- **Keyword Extraction** - YAKE and RAKE algorithms
- **Batch Processing** - Process multiple files efficiently
- **Concurrent Extraction** - Parallel document processing
- **Token Reduction** - Reduce text for LLM optimization
- **Plugin System** - Custom post-processing pipelines

### Functional Options API

All configuration uses the idiomatic functional options pattern for clean, readable code:

```go
config := v4.NewExtractionConfig(
    v4.WithOCR(
        v4.WithOCRBackend("tesseract"),
        v4.WithOCRLanguage("eng"),
    ),
    v4.WithKeywords(
        v4.WithKeywordsEnabled(true),
    ),
)
```

This approach is:
- **Type-safe**: Compiler catches misconfigurations
- **Self-documenting**: Option names describe what they do
- **Composable**: Mix and match any options
- **Extensible**: Adding options never breaks existing code

See [MIGRATION_v4.md](./MIGRATION_v4.md) for migration from v3.x pointer helpers.

## Testing

The Go binding includes comprehensive test coverage across 18 test suites (9,705 lines):

- **Batch Processing** - Multiple file extraction
- **Concurrent Operations** - Goroutine-safe extraction
- **Configuration & Results** - Config validation, result integrity
- **Embeddings** - Vector generation and caching
- **Error Handling** - Exception propagation, recovery
- **Extraction** - All 56+ format support
- **Images** - Embedded image extraction and EXIF
- **Keywords** - YAKE and RAKE algorithms
- **Memory Safety** - Goroutine leaks, cleanup verification
- **Metadata** - Document properties extraction
- **OCR** - Tesseract integration
- **Pages** - Page range handling
- **Plugins** - Custom plugin execution
- **Tables** - Table structure preservation
- **Validation** - Input/output validation

Run tests:

```bash
# Standard tests
go test ./...

# With coverage
go test -cover ./...

# Specific test
go test -run TestExtractFile ./...
```

## Configuration API Reference

### ExtractionConfig Options

| Option | Type | Purpose |
|--------|------|---------|
| `WithUseCache()` | bool | Enable caching of extraction results |
| `WithEnableQualityProcessing()` | bool | Enable quality enhancement |
| `WithForceOCR()` | bool | Force OCR on all documents |
| `WithOCR()` | ...OCROption | Configure OCR backend and settings |
| `WithChunking()` | ...ChunkingOption | Split text into chunks |
| `WithImages()` | ...ImageExtractionOption | Configure image extraction |
| `WithPdfOptions()` | ...PdfOption | PDF-specific settings |
| `WithTokenReduction()` | ...TokenReductionOption | Reduce tokens for LLM |
| `WithLanguageDetection()` | ...LanguageDetectionOption | Detect document language |
| `WithKeywords()` | ...KeywordOption | Extract keywords (YAKE/RAKE) |
| `WithPostprocessor()` | ...PostProcessorOption | Apply post-processing |
| `WithHTMLOptions()` | ...HTMLConversionOption | HTML conversion settings |
| `WithPages()` | ...PageOption | Specify page ranges |
| `WithMaxConcurrentExtractions()` | int | Limit concurrent operations |

### OCR Options

| Option | Type | Purpose |
|--------|------|---------|
| `WithOCRBackend()` | string | OCR backend ("tesseract") |
| `WithOCRLanguage()` | string | Language code (e.g., "eng", "deu") |
| `WithTesseract()` | ...TesseractOption | Tesseract-specific settings |

### Tesseract Options

| Option | Type | Purpose |
|--------|------|---------|
| `WithTesseractLanguage()` | string | Tesseract language |
| `WithTesseractPSM()` | int | Page segmentation mode (0-13) |
| `WithTesseractOEM()` | int | OCR engine mode |
| `WithTesseractMinConfidence()` | float64 | Minimum confidence (0-1) |
| `WithTesseractEnableTableDetection()` | bool | Detect tables in OCR |
| `WithTesseractTableMinConfidence()` | float64 | Table detection threshold |
| `WithTesseractUseCache()` | bool | Cache OCR results |

See GoDoc for complete option reference:
[pkg.go.dev/github.com/kreuzberg-dev/kreuzberg/packages/go/v4](https://pkg.go.dev/github.com/kreuzberg-dev/kreuzberg/packages/go/v4)

## Troubleshooting

### Installation Issues

| Error | Solution |
|-------|----------|
| `pkg-config: kreuzberg-ffi not found` | Set `PKG_CONFIG_PATH` to include installation directory or run installer script |
| `dlopen: image not found` (macOS) | Set `DYLD_FALLBACK_LIBRARY_PATH=$PWD/target/release` |
| `cannot open shared object` (Linux) | Set `LD_LIBRARY_PATH=$PWD/target/release` |
| Windows build fails | Use MSVC build (`x86_64-pc-windows-msvc`) for full support |

### Configuration Issues

| Error | Solution |
|-------|----------|
| `undefined: BoolPtr` | Update to v4.0.0 functional options: use `WithUseCache(true)` instead |
| `wrong number of arguments to NewExtractionConfig` | Options must be functions: `NewExtractionConfig(v4.WithUseCache(true))` |
| `undefined: WithMyOption` | Check option name or file a [GitHub issue](https://github.com/kreuzberg-dev/kreuzberg/issues) |

### Runtime Issues

| Error | Solution |
|-------|----------|
| `Missing dependency: tesseract` | Install: `brew install tesseract` (macOS), `apt install tesseract-ocr` (Linux) |
| `Missing dependency: onnxruntime` | Install: `brew install onnxruntime` (macOS), `apt install libonnxruntime` (Linux) |
| Embeddings unavailable on Windows MinGW | Use Windows MSVC build for embeddings support |
| Memory growth in long-running jobs | Enable caching and disable quality processing if not needed |

### Performance

| Issue | Solution |
|-------|----------|
| Slow extraction | Enable caching: `WithUseCache(true)` |
| High memory usage | Reduce `MaxConcurrentExtractions` or disable unnecessary features |
| OCR very slow | Reduce Tesseract PSM (0 is fastest, 13 is most thorough) |
| Timeouts on large files | Increase context timeout or use batch processing with limits |

For more help:
- **Issues**: [GitHub Issues](https://github.com/kreuzberg-dev/kreuzberg/issues)
- **Discord**: [Join Community](https://discord.gg/pXxagNK2zN)
- **Migration**: [MIGRATION_v4.md](./MIGRATION_v4.md) for v3.x to v4.0 upgrades

## Documentation

- **[Official Site](https://kreuzberg.dev/)** - Complete documentation
- **[GoDoc](https://pkg.go.dev/github.com/kreuzberg-dev/kreuzberg/packages/go/v4)** - API reference
- **[Format Support](https://kreuzberg.dev/reference/formats/)** - All supported formats
- **[Configuration Guide](https://kreuzberg.dev/configuration/)** - Detailed option reference
- **[Examples](https://github.com/kreuzberg-dev/kreuzberg/tree/main/examples/go)** - Code examples

## Contributing

Contributions are welcome! See [Contributing Guide](https://github.com/kreuzberg-dev/kreuzberg/blob/main/CONTRIBUTING.md).

## License

MIT License - see LICENSE file for details.

## Support

- **Discord Community**: [Join our Discord](https://discord.gg/pXxagNK2zN)
- **GitHub Issues**: [Report bugs](https://github.com/kreuzberg-dev/kreuzberg/issues)
- **Discussions**: [Ask questions](https://github.com/kreuzberg-dev/kreuzberg/discussions)
