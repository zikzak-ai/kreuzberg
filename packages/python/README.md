# Kreuzberg Python Binding

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

High-performance document intelligence library for Python. Extract text, metadata, tables, images, and keywords from 56+ file formats including PDF, Office documents, and images. Native bindings with async/await support, multiple OCR backends, vector embeddings, and extensible plugin system.

> **Version 4.0.0 Release Candidate**
> Kreuzberg v4.0.0 is in **Release Candidate** stage. Bugs and breaking changes are expected. Please test and [report any issues](https://github.com/kreuzberg-dev/kreuzberg/issues).

## Installation

### From PyPI (Recommended)

Install the latest stable release:

```bash
pip install kreuzberg
```

Install with OCR backend support:

```bash
# With EasyOCR support
pip install kreuzberg[easyocr]

# With PaddleOCR support
pip install kreuzberg[paddleocr]

# With all optional dependencies
pip install kreuzberg[all]
```

### Install from Source

Clone the repository and build from source:

```bash
git clone https://github.com/kreuzberg-dev/kreuzberg.git
cd kreuzberg/packages/python
pip install -e .
```

### System Requirements

- **Python 3.10+** (3.11+ recommended for best performance)
- **Rust toolchain** (for building from source): [Install Rust](https://rustup.rs/)
- Optional: [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) for native OCR support
- Optional: [ONNX Runtime](https://github.com/microsoft/onnxruntime) version 1.21 or lower for vector embeddings
- Optional: [FFmpeg](https://ffmpeg.org/download.html) for audio/video extraction

### Dependency Installation by Platform

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Download and install from [Tesseract GitHub](https://github.com/tesseract-ocr/tesseract/releases)

## Quick Start

### Basic Text Extraction

Extract text and metadata from any supported document:

```python
import asyncio
from kreuzberg import extract_file, ExtractionConfig

async def main() -> None:
    # Simple extraction with caching and quality processing
    config = ExtractionConfig(
        use_cache=True,
        enable_quality_processing=True
    )
    result = await extract_file("document.pdf", config=config)

    print(f"Content: {result.content}")
    print(f"Author: {result.metadata.author}")
    print(f"Format: {result.metadata.format_type}")

asyncio.run(main())
```

### Keyword Extraction

Extract meaningful keywords and named entities from documents:

```python
import asyncio
from kreuzberg import extract_file, ExtractionConfig, KeywordConfig, KeywordAlgorithm

async def main() -> None:
    config = ExtractionConfig(
        keywords=KeywordConfig(
            algorithm=KeywordAlgorithm.Yake,
            max_keywords=10,
            min_score=0.1
        )
    )
    result = await extract_file("document.pdf", config=config)

    print(f"Keywords: {result.metadata.keywords}")

asyncio.run(main())
```

### Image Extraction

Extract images from PDFs and Office documents:

```python
import asyncio
from kreuzberg import extract_file, ExtractionConfig, ImageExtractionConfig

async def main() -> None:
    config = ExtractionConfig(
        images=ImageExtractionConfig(
            extract_images=True,
            target_dpi=150
        )
    )
    result = await extract_file("document.pdf", config=config)

    print(f"Images found: {len(result.images)}")
    for img in result.images:
        print(f"  - Format: {img.format}, Dimensions: {img.width}x{img.height}")

asyncio.run(main())
```

### Table Extraction

Extract structured table data with full preservation:

```python
import asyncio
from kreuzberg import extract_file

async def main() -> None:
    result = await extract_file("spreadsheet.xlsx")

    print(f"Tables found: {len(result.tables)}")
    for table in result.tables:
        print(f"  - Rows: {len(table.rows)}, Columns: {len(table.rows[0]) if table.rows else 0}")
        print(f"    Markdown:\n{table.markdown}")

asyncio.run(main())
```

### Vector Embeddings

Generate vector embeddings for semantic search and similarity:

```python
import asyncio
from kreuzberg import extract_file, ExtractionConfig, ChunkingConfig, EmbeddingConfig, EmbeddingModelType

async def main() -> None:
    model = EmbeddingModelType.preset("balanced")
    config = ExtractionConfig(
        chunking=ChunkingConfig(
            max_chars=512,
            max_overlap=100,
            embedding=EmbeddingConfig(
                model=model,
                normalize=True
            )
        )
    )
    result = await extract_file("document.pdf", config=config)

    # Access chunk embeddings for similarity search
    for chunk in result.chunks:
        print(f"Chunk: {chunk.text[:50]}...")
        print(f"Embedding dimensions: {len(chunk.embedding) if chunk.embedding else 0}")

asyncio.run(main())
```

### OCR for Scanned Documents

Process scanned PDFs and images with OCR:

```python
import asyncio
from kreuzberg import extract_file, ExtractionConfig, OcrConfig, TesseractConfig

async def main() -> None:
    config = ExtractionConfig(
        force_ocr=True,
        ocr=OcrConfig(
            backend="tesseract",  # or "easyocr", "paddleocr"
            language="eng",
            tesseract_config=TesseractConfig(psm=3)
        )
    )
    result = await extract_file("scanned.pdf", config=config)

    print(f"Text: {result.content}")
    print(f"Detected Languages: {result.detected_languages}")

asyncio.run(main())
```

### Batch Processing

Process multiple documents concurrently:

```python
import asyncio
from pathlib import Path
from kreuzberg import extract_file

async def main() -> None:
    files = list(Path("documents/").glob("*.pdf"))

    # Process files concurrently for better performance
    tasks = [extract_file(str(f)) for f in files]
    results = await asyncio.gather(*tasks)

    for result, file in zip(results, files):
        print(f"{file.name}: {len(result.content)} characters")

asyncio.run(main())
```

## Configuration Guide

### Core Configuration Options

Kreuzberg provides fine-grained control over extraction behavior:

```python
from kreuzberg import ExtractionConfig, ChunkingConfig, LanguageDetectionConfig

config = ExtractionConfig(
    # Performance
    use_cache=True,
    enable_quality_processing=True,

    # Language and OCR
    language_detection=LanguageDetectionConfig(
        detect_languages=True,
        enable_language_specific_processing=True
    ),

    # Text chunking for embeddings
    chunking=ChunkingConfig(
        max_chars=512,
        max_overlap=100
    ),

    # Quality thresholds
    min_text_quality_score=0.5,
    confidence_threshold=0.7
)
```

### Extraction Configuration

Key configuration parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `use_cache` | bool | False | Enable caching of extraction results |
| `enable_quality_processing` | bool | False | Apply quality filters to output |
| `force_ocr` | bool | False | Always use OCR even for selectable text |
| `min_text_quality_score` | float | 0.0 | Minimum quality threshold (0.0-1.0) |
| `confidence_threshold` | float | 0.0 | Confidence threshold for extraction |

### OCR Configuration

Configure OCR behavior:

```python
from kreuzberg import OcrConfig, TesseractConfig

ocr_config = OcrConfig(
    backend="tesseract",  # "tesseract", "easyocr", "paddleocr"
    language="eng",        # ISO 639-1 language code
    tesseract_config=TesseractConfig(
        psm=3,  # Page segmentation mode
        oem=1   # OCR engine mode
    )
)
```

### Chunking Configuration

Split text into semantic chunks for embeddings:

```python
from kreuzberg import ChunkingConfig, EmbeddingConfig

chunking_config = ChunkingConfig(
    max_chars=512,      # Maximum chunk size
    max_overlap=100,    # Overlap between chunks
    embedding=EmbeddingConfig(
        normalize=True,  # L2 normalization
        model=model      # Embedding model
    )
)
```

## Advanced Features

### Page Extraction with PageConfig

Extract pages with page markers to track document structure:

```python
import asyncio
from kreuzberg import extract_file, ExtractionConfig, PageConfig

async def main() -> None:
    """Extract pages with boundary tracking and page markers."""
    config = ExtractionConfig(
        pages=PageConfig(
            extract_pages=True,           # Enable page tracking
            insert_page_markers=True,     # Insert [PAGE-X] markers in content
            marker_format="[PAGE-{page_number}]"  # Custom marker format
        )
    )
    result = await extract_file("document.pdf", config=config)

    # Content now includes page markers
    print(f"Content with page markers:\n{result.content[:500]}")

asyncio.run(main())
```

### Custom PostProcessor Registration

Register custom post-processors to enrich extraction results:

```python
import asyncio
from kreuzberg import (
    extract_file,
    ExtractionConfig,
    register_post_processor,
    PostProcessorProtocol,
    ExtractionResult,
)

class MetadataEnricher:
    """Custom post-processor that enriches document metadata."""

    def name(self) -> str:
        """Return unique processor name."""
        return "metadata_enricher"

    def processing_stage(self) -> str:
        """Process in the middle stage."""
        return "middle"

    def process(self, result: ExtractionResult) -> ExtractionResult:
        """Add custom metadata to extraction results."""
        # Extract custom metrics
        word_count = len(result.content.split())
        char_count = len(result.content)

        # Add enriched metadata
        result.metadata["custom_word_count"] = word_count
        result.metadata["custom_char_count"] = char_count
        result.metadata["custom_processor"] = "enabled"

        return result

    def initialize(self) -> None:
        """Initialize processor (called on registration)."""
        print("MetadataEnricher initialized")

    def shutdown(self) -> None:
        """Cleanup (called on unregistration)."""
        print("MetadataEnricher shutdown")


async def main() -> None:
    """Register custom processor and use it."""
    # Register the custom post-processor once
    enricher = MetadataEnricher()
    register_post_processor(enricher)

    # Extract with the custom post-processor
    config = ExtractionConfig(use_cache=True)
    result = await extract_file("document.pdf", config=config)

    # Access custom metadata
    print(f"Words: {result.metadata['custom_word_count']}")
    print(f"Chars: {result.metadata['custom_char_count']}")

asyncio.run(main())
```

### Custom Validator Registration

Register custom validators to validate extraction results:

```python
import asyncio
from kreuzberg import (
    extract_file,
    ExtractionConfig,
    register_validator,
    ValidationError,
)

class ContentQualityValidator:
    """Custom validator for content quality checks."""

    def name(self) -> str:
        """Return unique validator name."""
        return "content_quality_validator"

    def priority(self) -> int:
        """Run early in validation chain (higher = earlier)."""
        return 100

    def should_validate(self, result: dict) -> bool:
        """Check if validation should run."""
        # Skip validation for certain document types
        return result.get("metadata", {}).get("format_type") != "plain/text"

    def validate(self, result: dict) -> None:
        """Validate extraction quality.

        Raises ValidationError if content doesn't meet quality standards.
        """
        content = result.get("content", "")

        # Check minimum content length
        if len(content) < 100:
            raise ValidationError(
                f"Extracted content too short ({len(content)} chars, minimum 100)",
                context={"actual_length": len(content), "minimum": 100}
            )

        # Check for suspicious patterns
        if content.count("  ") > len(content) * 0.1:
            raise ValidationError(
                "Content has excessive whitespace",
                context={"double_space_ratio": content.count("  ") / len(content)}
            )

    def initialize(self) -> None:
        """Initialize validator."""
        pass

    def shutdown(self) -> None:
        """Cleanup validator."""
        pass


async def main() -> None:
    """Register validator and handle validation errors."""
    # Register the custom validator
    validator = ContentQualityValidator()
    register_validator(validator)

    config = ExtractionConfig()

    try:
        result = await extract_file("document.pdf", config=config)
        print(f"Validation passed: {len(result.content)} chars extracted")
    except ValidationError as e:
        print(f"Validation failed: {e}")

asyncio.run(main())
```

### Embedding Preset Listing and Usage

List available embedding presets and use them for semantic search:

```python
import asyncio
from kreuzberg import (
    extract_file,
    ExtractionConfig,
    ChunkingConfig,
    EmbeddingConfig,
    list_embedding_presets,
    get_embedding_preset,
)

async def main() -> None:
    """List available presets and use one for embeddings."""
    # List all available embedding presets
    presets = list_embedding_presets()
    print(f"Available embedding presets: {presets}")

    # Get details about each preset
    print("\nPreset Details:")
    for preset_name in presets:
        preset = get_embedding_preset(preset_name)
        print(f"  {preset.name}:")
        print(f"    Model: {preset.model_name}")
        print(f"    Dimensions: {preset.dimensions}")
        print(f"    Chunk size: {preset.chunk_size}")
        print(f"    Description: {preset.description}")

    # Use a specific preset for extraction
    config = ExtractionConfig(
        chunking=ChunkingConfig(
            max_chars=512,
            embedding=EmbeddingConfig(
                model=get_embedding_preset("balanced")
            )
        )
    )

    result = await extract_file("document.pdf", config=config)

    # Access embeddings for semantic search
    print(f"\nGenerated {len(result.chunks)} chunks with embeddings")
    for i, chunk in enumerate(result.chunks[:3]):
        embedding_size = len(chunk.embedding) if chunk.embedding else 0
        print(f"Chunk {i}: {chunk.text[:50]}... (embedding size: {embedding_size})")

asyncio.run(main())
```

### Configuration File Loading (TOML/YAML/JSON)

Load extraction configuration from files:

```python
import asyncio
from pathlib import Path
from kreuzberg import (
    extract_file,
    discover_extraction_config,
    load_extraction_config_from_file,
)

async def main() -> None:
    """Load configuration from files."""

    # Method 1: Auto-discover configuration from environment
    # Searches for kreuzberg.toml, kreuzberg.yaml, or kreuzberg.json
    config = discover_extraction_config()
    if config:
        print("Auto-discovered configuration")
        result = await extract_file("document.pdf", config=config)
    else:
        print("No configuration file found")

    # Method 2: Load from a specific file
    # Supports TOML, YAML, and JSON formats
    config_file = Path("config/extraction.toml")
    if config_file.exists():
        config = load_extraction_config_from_file(config_file)
        result = await extract_file("document.pdf", config=config)
        print(f"Loaded config from {config_file}")

asyncio.run(main())
```

**Example configuration files:**

`kreuzberg.toml`:
```toml
use_cache = true
enable_quality_processing = true
min_text_quality_score = 0.5

[language_detection]
detect_languages = true

[chunking]
max_chars = 512
max_overlap = 100
```

`kreuzberg.yaml`:
```yaml
use_cache: true
enable_quality_processing: true
min_text_quality_score: 0.5

language_detection:
  detect_languages: true

chunking:
  max_chars: 512
  max_overlap: 100
```

`kreuzberg.json`:
```json
{
  "use_cache": true,
  "enable_quality_processing": true,
  "min_text_quality_score": 0.5,
  "language_detection": {
    "detect_languages": true
  },
  "chunking": {
    "max_chars": 512,
    "max_overlap": 100
  }
}
```

### Advanced Error Handling Patterns

Comprehensive error handling with different error types:

```python
import asyncio
from kreuzberg import (
    extract_file,
    ExtractionConfig,
    get_last_error_code,
    get_error_details,
    classify_error,
    error_code_name,
    KreuzbergError,
    ValidationError,
    ParsingError,
    OCRError,
    MissingDependencyError,
    CacheError,
    ErrorCode,
)

async def main() -> None:
    """Demonstrate comprehensive error handling."""

    config = ExtractionConfig(force_ocr=True)

    try:
        result = await extract_file("document.pdf", config=config)
        print(f"Extraction successful: {len(result.content)} chars")

    # Handle validation errors (invalid config, parameters)
    except ValidationError as e:
        print(f"Validation Error: {e.message}")
        if e.context:
            print(f"  Context: {e.context}")

    # Handle parsing errors (corrupt files, unsupported formats)
    except ParsingError as e:
        print(f"Parsing Error: {e.message}")
        error_code = get_last_error_code()
        print(f"  Error Code: {error_code_name(error_code)}")

    # Handle OCR errors (OCR backend failures)
    except OCRError as e:
        print(f"OCR Error: {e.message}")
        details = get_error_details()
        print(f"  Details: {details['message']}")

    # Handle missing dependencies
    except MissingDependencyError as e:
        print(f"Missing Dependency: {e.message}")
        if e.context:
            install_cmd = e.context.get("install_command")
            print(f"  Install with: {install_cmd}")

    # Handle cache errors
    except CacheError as e:
        print(f"Cache Error: {e.message}")

    # Catch all Kreuzberg errors
    except KreuzbergError as e:
        print(f"Kreuzberg Error: {type(e).__name__}")
        print(f"  Message: {e.message}")
        print(f"  Context: {e.context}")

        # Get detailed error information
        code = get_last_error_code()
        details = get_error_details()

        print(f"  Error Code: {code} ({error_code_name(code)})")
        print(f"  Details: {details}")

    # Handle generic exceptions
    except Exception as e:
        print(f"Unexpected Error: {type(e).__name__}: {str(e)}")

        # Classify unknown error messages
        classification = classify_error(str(e))
        print(f"  Classified as: {error_code_name(classification)}")

asyncio.run(main())
```

### Next Steps

- **[Complete API Reference](https://kreuzberg.dev/reference/api-python/)** - All classes and methods
- **[Configuration Documentation](https://kreuzberg.dev/configuration/)** - Detailed configuration guide
- **[Examples & Guides](https://kreuzberg.dev/guides/)** - Real-world examples
- **[Troubleshooting](https://kreuzberg.dev/troubleshooting/)** - Common issues and solutions

## Testing

### Running Tests

Run the full test suite:

```bash
pytest tests/
```

Run specific test categories:

```bash
# Core binding tests
pytest tests/binding/

# Only fast tests (skip slow and integration tests)
pytest tests/ -m "not slow"

# Specific feature tests
pytest tests/binding/test_keywords.py
pytest tests/binding/test_images.py
pytest tests/binding/test_tables.py
pytest tests/binding/test_embeddings.py
pytest tests/binding/test_error_handling.py
```

### Test Coverage

Kreuzberg has comprehensive test coverage:

- **Keywords Tests** - Keyword and NER extraction across multiple languages
- **Images Tests** - Image extraction, format detection, and metadata
- **Tables Tests** - Table structure preservation and Markdown conversion
- **Embeddings Tests** - Vector generation and normalization correctness
- **Error Handling Tests** - Configuration validation and error scenarios
- **OCR Tests** - Multiple OCR backends (Tesseract, EasyOCR, PaddleOCR)
- **Integration Tests** - End-to-end extraction workflows
- **CLI Tests** - Command-line interface and server functionality

### Writing Tests

Tests use pytest and follow async patterns:

```python
import pytest
from kreuzberg import extract_file, ExtractionConfig

@pytest.mark.asyncio
async def test_custom_feature():
    config = ExtractionConfig(...)
    result = await extract_file("test.pdf", config=config)
    assert result.content is not None
```

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

- **Async/Await** - Non-blocking document processing with concurrent operations

- **Plugin System** - Extensible post-processing for custom text transformation

- **Embeddings** - Generate vector embeddings using ONNX Runtime models

- **Batch Processing** - Efficiently process multiple documents in parallel

- **Memory Efficient** - Stream large files without loading entirely into memory

- **Language Detection** - Detect and support multiple languages in documents

- **Configuration** - Fine-grained control over extraction behavior

### Performance Characteristics

| Format | Speed | Memory | Notes |
|--------|-------|--------|-------|
| **PDF (text)** | 10-100 MB/s | ~50MB per doc | Fastest extraction |
| **Office docs** | 20-200 MB/s | ~100MB per doc | DOCX, XLSX, PPTX |
| **Images (OCR)** | 1-5 MB/s | Variable | Depends on OCR backend |
| **Archives** | 5-50 MB/s | ~200MB per doc | ZIP, TAR, etc. |
| **Web formats** | 50-200 MB/s | Streaming | HTML, XML, JSON |

## OCR Support

Kreuzberg supports multiple OCR backends for extracting text from scanned documents and images:

- **Tesseract**

- **Easyocr**

- **Paddleocr**

### OCR Configuration Example

```python
import asyncio
from kreuzberg import extract_file

async def main() -> None:
    result = await extract_file("document.pdf")
    print(result.content)

asyncio.run(main())
```

## Async Support

This binding provides full async/await support for non-blocking document processing:

```python
import asyncio
from pathlib import Path
from kreuzberg import extract_file

async def main() -> None:
    file_path: Path = Path("document.pdf")

    result = await extract_file(file_path)

    print(f"Content: {result.content}")
    print(f"MIME Type: {result.metadata.format_type}")
    print(f"Tables: {len(result.tables)}")

asyncio.run(main())
```

## Plugin System

Kreuzberg supports extensible post-processing plugins for custom text transformation and filtering.

For detailed plugin documentation, visit [Plugin System Guide](https://kreuzberg.dev/plugins/).

## Embeddings Support

Generate vector embeddings for extracted text using the built-in ONNX Runtime support. Requires ONNX Runtime installation.

**[Embeddings Guide](https://kreuzberg.dev/features/#embeddings)**

## Batch Processing

Process multiple documents efficiently:

```python
import asyncio
from kreuzberg import extract_file, ExtractionConfig, OcrConfig, TesseractConfig

async def main() -> None:
    config = ExtractionConfig(
        force_ocr=True,
        ocr=OcrConfig(
            backend="tesseract",
            language="eng",
            tesseract_config=TesseractConfig(psm=3)
        )
    )
    result = await extract_file("scanned.pdf", config=config)
    print(result.content)
    print(f"Detected Languages: {result.detected_languages}")

asyncio.run(main())
```

## Configuration

For advanced configuration options including language detection, table extraction, OCR settings, and more:

**[Configuration Guide](https://kreuzberg.dev/configuration/)**

## Documentation

- **[Official Documentation](https://kreuzberg.dev/)**
- **[API Reference](https://kreuzberg.dev/reference/api-python/)**
- **[Examples & Guides](https://kreuzberg.dev/guides/)**

## Troubleshooting

For common issues and solutions, visit [Troubleshooting Guide](https://kreuzberg.dev/troubleshooting/).

## Contributing

Contributions are welcome! See [Contributing Guide](https://github.com/kreuzberg-dev/kreuzberg/blob/main/CONTRIBUTING.md).

## License

MIT License - see LICENSE file for details.

## Support

- **Discord Community**: [Join our Discord](https://discord.gg/pXxagNK2zN)
- **GitHub Issues**: [Report bugs](https://github.com/kreuzberg-dev/kreuzberg/issues)
- **Discussions**: [Ask questions](https://github.com/kreuzberg-dev/kreuzberg/discussions)
