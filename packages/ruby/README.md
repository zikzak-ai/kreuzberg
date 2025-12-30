# Ruby

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

Extract text, tables, images, and metadata from 56 file formats including PDF, Office documents, and images. Ruby bindings with idiomatic Ruby API and native performance.

> **Version 4.0.0 Release Candidate**
> Kreuzberg v4.0.0 is in **Release Candidate** stage. Bugs and breaking changes are expected.
> This is a pre-release version. Please test the library and [report any issues](https://github.com/kreuzberg-dev/kreuzberg/issues) you encounter.

## Installation

### Package Installation

Install via one of the supported package managers:

**gem:**

```bash
gem install kreuzberg
```

**Bundler:**

```ruby
gem 'kreuzberg'
```

### System Requirements

- **Ruby 2.7+** required
- Optional: [ONNX Runtime](https://github.com/microsoft/onnxruntime/releases) version 1.21 or lower for embeddings support
- Optional: [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) for OCR functionality

## Quick Start

### Basic Extraction

Extract text, metadata, and structure from any supported document format:

```ruby
require 'kreuzberg'

result = Kreuzberg.extract_file_sync(path: 'document.pdf')

puts "Content:"
puts result.content

puts "\nMetadata:"
puts "Title: #{result.metadata&.dig('title')}"
puts "Author: #{result.metadata&.dig('author')}"

puts "\nTables found: #{result.tables.length}"
puts "Images found: #{result.images.length}"
```

### Common Use Cases

#### Extract with Custom Configuration

Most use cases benefit from configuration to control extraction behavior:

**With OCR (for scanned documents):**

```ruby
require 'kreuzberg'

ocr_config = Kreuzberg::Config::OCR.new(
  backend: 'tesseract',
  language: 'eng'
)

config = Kreuzberg::Config::Extraction.new(ocr: ocr_config)
result = Kreuzberg.extract_file_sync(path: 'scanned.pdf', config: config)

puts "Extracted text from scanned document:"
puts result.content
puts "Used OCR backend: tesseract"
```

#### Table Extraction

See [Table Extraction Guide](https://kreuzberg.dev/features/table-extraction/) for detailed examples.

#### Processing Multiple Files

```ruby
require 'kreuzberg'

puts "Kreuzberg version: #{Kreuzberg::VERSION}"
puts "FFI bindings loaded successfully"

result = Kreuzberg.extract_file_sync(path: 'sample.pdf')
puts "Installation verified! Extracted #{result.content.length} characters"
```

#### Async Processing

For non-blocking document processing:

```ruby
require 'kreuzberg'

config = Kreuzberg::Config::Extraction.new(
  use_cache: true,
  enable_quality_processing: true
)

result = Kreuzberg.extract_file_sync(path: 'contract.pdf', config: config)

puts "Extracted #{result.content.length} characters"
puts "Quality score: #{result.metadata&.dig('quality_score')}"
puts "Processing time: #{result.metadata&.dig('processing_time')}ms"
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

### OCR Configuration Example

```ruby
require 'kreuzberg'

ocr_config = Kreuzberg::Config::OCR.new(
  backend: 'tesseract',
  language: 'eng'
)

config = Kreuzberg::Config::Extraction.new(ocr: ocr_config)
result = Kreuzberg.extract_file_sync(path: 'scanned.pdf', config: config)

puts "Extracted text from scanned document:"
puts result.content
puts "Used OCR backend: tesseract"
```

## Async Support

This binding provides full async/await support for non-blocking document processing:

```ruby
require 'kreuzberg'

config = Kreuzberg::Config::Extraction.new(
  use_cache: true,
  enable_quality_processing: true
)

result = Kreuzberg.extract_file_sync(path: 'contract.pdf', config: config)

puts "Extracted #{result.content.length} characters"
puts "Quality score: #{result.metadata&.dig('quality_score')}"
puts "Processing time: #{result.metadata&.dig('processing_time')}ms"
```

## Plugin System

Kreuzberg supports extensible post-processing plugins for custom text transformation and filtering.

For detailed plugin documentation, visit [Plugin System Guide](https://kreuzberg.dev/plugins/).

## Embeddings Support

Generate vector embeddings for extracted text using the built-in ONNX Runtime support. Requires ONNX Runtime installation.

**[Embeddings Guide](https://kreuzberg.dev/features/#embeddings)**

## Advanced Examples

### Embeddings with Model Configuration

Generate embeddings for document chunks with custom model configuration:

```ruby
require 'kreuzberg'

# Configure embedding model with custom parameters
embedding_config = Kreuzberg::Config::Embedding.new(
  model: { type: :preset, name: 'balanced' },
  normalize: true,
  batch_size: 32,
  show_download_progress: false
)

# Enable chunking with embeddings
chunking_config = Kreuzberg::Config::Chunking.new(
  max_chars: 1024,
  max_overlap: 256,
  embedding: embedding_config
)

config = Kreuzberg::Config::Extraction.new(chunking: chunking_config)
result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: config)

# Access chunks with embeddings
result.chunks.each_with_index do |chunk, idx|
  puts "Chunk #{idx}:"
  puts "  Content: #{chunk.content[0..50]}..."
  puts "  Tokens: #{chunk.token_count}"
  puts "  Pages: #{chunk.first_page}-#{chunk.last_page}"
  if chunk.embedding
    puts "  Embedding dimensions: #{chunk.embedding.length}"
  end
end
```

### Keywords Extraction (YAKE and RAKE)

Extract keywords using YAKE and RAKE algorithms:

```ruby
require 'kreuzberg'

# Extract keywords using YAKE algorithm
yake_config = Kreuzberg::Config::Keywords.new(
  algorithm: 'yake',
  max_keywords: 10,
  min_score: 0.1,
  yake_params: Kreuzberg::Config::KeywordYakeParams.new(window_size: 3)
)

config = Kreuzberg::Config::Extraction.new(keywords: yake_config)
result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: config)

# Extract keywords using RAKE algorithm
rake_config = Kreuzberg::Config::Keywords.new(
  algorithm: 'rake',
  max_keywords: 15,
  language: 'english',
  rake_params: Kreuzberg::Config::KeywordRakeParams.new(
    min_word_length: 3,
    max_words_per_phrase: 5
  )
)

config = Kreuzberg::Config::Extraction.new(keywords: rake_config)
result = Kreuzberg.extract_file_sync(path: 'report.docx', config: config)

puts "Keywords extracted for document"
```

### Pages Extraction with PageConfig

Extract and organize content by pages:

```ruby
require 'kreuzberg'

# Enable per-page extraction with markers
page_config = Kreuzberg::Config::PageConfig.new(
  extract_pages: true,
  insert_page_markers: true,
  marker_format: "\n\n=== PAGE {page_num} ===\n\n"
)

config = Kreuzberg::Config::Extraction.new(pages: page_config)
result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: config)

# Access extracted pages
if result.pages
  result.pages.each do |page|
    puts "Page #{page.page_number}:"
    puts "  Content length: #{page.content.length}"
    puts "  Tables: #{page.tables.length}"
    puts "  Images: #{page.images.length}"
  end
end

puts "Total pages: #{result.page_count}"
```

### Custom PostProcessor Implementation

Create and register custom post-processors for text transformation:

```ruby
require 'kreuzberg'

# Define a custom post-processor class
class MarkdownEnhancerPostProcessor
  include Kreuzberg::PostProcessorProtocol

  def call(result)
    # Enhance extracted content with markdown formatting
    enhanced = result.dup

    if enhanced['content']
      # Add markdown headers for detected structure
      enhanced['content'] = enhance_with_markdown(enhanced['content'])
    end

    enhanced
  end

  private

  def enhance_with_markdown(content)
    # Example: Convert section breaks to markdown headers
    content
      .split("\n\n")
      .map { |paragraph| paragraph.length > 100 ? "## #{paragraph[0..30]}...\n\n#{paragraph}" : paragraph }
      .join("\n\n")
  end
end

# Use custom post-processor in configuration
processor = MarkdownEnhancerPostProcessor.new
postprocessor_config = Kreuzberg::Config::PostProcessor.new(enabled: true)
config = Kreuzberg::Config::Extraction.new(postprocessor: postprocessor_config)

result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: config)
puts result.content
```

### Custom Validator Implementation

Create and register validators to ensure extraction quality:

```ruby
require 'kreuzberg'

# Define a custom validator class
class ContentQualityValidator
  include Kreuzberg::ValidatorProtocol

  MIN_CONTENT_LENGTH = 100
  MIN_METADATA_FIELDS = 2

  def call(result)
    # Validate extracted content meets quality standards
    content = result['content'].to_s
    metadata = result['metadata'].to_h

    if content.length < MIN_CONTENT_LENGTH
      raise Kreuzberg::Errors::ValidationError,
            "Content too short: #{content.length} bytes (minimum: #{MIN_CONTENT_LENGTH})"
    end

    if metadata.length < MIN_METADATA_FIELDS
      raise Kreuzberg::Errors::ValidationError,
            "Insufficient metadata: #{metadata.length} fields (minimum: #{MIN_METADATA_FIELDS})"
    end

    # Validation passed
    nil
  end
end

# Use validator in extraction workflow
validator = ContentQualityValidator.new
config = Kreuzberg::Config::Extraction.new(enable_quality_processing: true)

begin
  result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: config)
  validator.call(result.to_h)
  puts "Extraction passed quality validation"
rescue Kreuzberg::Errors::ValidationError => e
  puts "Validation failed: #{e.message}"
end
```

### Config File Loading (from_file and discover)

Load configuration from TOML, YAML, or JSON files:

```ruby
require 'kreuzberg'

# Load configuration from a specific file
# Supports: .toml, .yaml/.yml, .json
config = Kreuzberg::Config::Extraction.from_file('config/kreuzberg.toml')

# Example: config/kreuzberg.toml
# use_cache = true
# force_ocr = false
# enable_quality_processing = true
#
# [chunking]
# max_chars = 1024
# max_overlap = 256
#
# [ocr]
# backend = "tesseract"
# language = "eng"
#
# [language_detection]
# enabled = true
# min_confidence = 0.7

result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: config)
puts "Extracted with config from file"

# Auto-discover configuration in project hierarchy
discovered_config = Kreuzberg::Config::Extraction.discover
if discovered_config
  puts "Found configuration at project root"
  result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: discovered_config)
else
  puts "No configuration file found, using defaults"
  result = Kreuzberg.extract_file_sync(path: 'document.pdf')
end
```

### Fiber-Based Async Patterns

Use Ruby Fibers for efficient async extraction workflows:

```ruby
require 'kreuzberg'

# Create async extraction workflow using Fibers
def extract_documents_async(file_paths)
  fibers = file_paths.map do |path|
    Fiber.new do
      config = Kreuzberg::Config::Extraction.new(
        use_cache: true,
        enable_quality_processing: true
      )

      # Extract asynchronously
      result = Kreuzberg.extract_file(path: path, config: config)

      {
        path: path,
        content_length: result.content.length,
        tables: result.tables.length,
        languages: result.detected_languages
      }
    end
  end

  # Resume all fibers and collect results
  results = fibers.map do |fiber|
    Fiber.yield fiber.resume if fiber.alive?
  end

  results.compact
end

# Usage
file_paths = ['document1.pdf', 'document2.docx', 'document3.xlsx']
results = extract_documents_async(file_paths)

results.each do |result|
  puts "#{result[:path]}: #{result[:content_length]} characters"
end
```

### Table Extraction Detailed Usage

Extract and access table structure and cell data:

```ruby
require 'kreuzberg'

# Configure table extraction
config = Kreuzberg::Config::Extraction.new(
  pdf_options: Kreuzberg::Config::PDF.new(extract_images: true)
)

result = Kreuzberg.extract_file_sync(path: 'spreadsheet.pdf', config: config)

# Access extracted tables
result.tables.each_with_index do |table, table_idx|
  puts "Table #{table_idx} (Page #{table.page_number}):"

  # Access table cells (2D array)
  table.cells.each_with_index do |row, row_idx|
    puts "  Row #{row_idx}:"
    row.each_with_index do |cell, col_idx|
      puts "    [#{col_idx}] #{cell}"
    end
  end

  # Access markdown representation
  puts "\nMarkdown format:"
  puts table.markdown
end

# Extract tables from specific pages
page_config = Kreuzberg::Config::PageConfig.new(extract_pages: true)
config = Kreuzberg::Config::Extraction.new(pages: page_config)
result = Kreuzberg.extract_file_sync(path: 'data.xlsx', config: config)

if result.pages
  result.pages.each do |page|
    page.tables.each do |table|
      puts "Table on page #{page.page_number}:"
      puts "  Dimensions: #{table.cells.length} rows x #{table.cells.first&.length || 0} columns"
    end
  end
end
```

### Image Extraction and Saving

Extract images and save them to disk:

```ruby
require 'kreuzberg'

# Configure image extraction with high DPI
image_config = Kreuzberg::Config::ImageExtraction.new(
  extract_images: true,
  target_dpi: 300,
  max_image_dimension: 2000,
  auto_adjust_dpi: true
)

config = Kreuzberg::Config::Extraction.new(image_extraction: image_config)
result = Kreuzberg.extract_file_sync(path: 'document.pdf', config: config)

# Save extracted images
output_dir = 'extracted_images'
Dir.mkdir(output_dir) unless Dir.exist?(output_dir)

result.images.each_with_index do |image, idx|
  # Generate filename
  filename = "image_p#{image.page_number}_#{image.image_index}.#{image.format}"
  filepath = File.join(output_dir, filename)

  # Save image data
  File.write(filepath, image.data, mode: 'wb')

  puts "Saved: #{filename}"
  puts "  Page: #{image.page_number}"
  puts "  Format: #{image.format}"
  puts "  Dimensions: #{image.width}x#{image.height}"
  puts "  Colorspace: #{image.colorspace}"

  # Process OCR result if available
  if image.ocr_result
    puts "  OCR Text: #{image.ocr_result['text'][0..50]}..."
  end
end
```

### Language Detection Configuration

Configure and use language detection:

```ruby
require 'kreuzberg'

# Enable language detection with confidence threshold
lang_detection_config = Kreuzberg::Config::LanguageDetection.new(
  enabled: true,
  min_confidence: 0.8,
  detect_multiple: true
)

config = Kreuzberg::Config::Extraction.new(
  language_detection: lang_detection_config
)

result = Kreuzberg.extract_file_sync(path: 'multilingual.pdf', config: config)

# Access detected languages
puts "Primary language: #{result.detected_language}"
puts "All detected languages: #{result.detected_languages.join(', ')}"

# Access language from metadata
if result.metadata.is_a?(Hash)
  puts "Language from metadata: #{result.metadata['language']}"
end

# Combine with keyword extraction for specific language
keywords_config = Kreuzberg::Config::Keywords.new(
  algorithm: 'yake',
  language: 'de',  # German keywords
  max_keywords: 10
)

config = Kreuzberg::Config::Extraction.new(
  language_detection: lang_detection_config,
  keywords: keywords_config
)

result = Kreuzberg.extract_file_sync(path: 'german_document.pdf', config: config)
puts "Keywords extracted for: #{result.detected_language}"
```

## Batch Processing

Process multiple documents efficiently:

```ruby
require 'kreuzberg'

puts "Kreuzberg version: #{Kreuzberg::VERSION}"
puts "FFI bindings loaded successfully"

result = Kreuzberg.extract_file_sync(path: 'sample.pdf')
puts "Installation verified! Extracted #{result.content.length} characters"
```

## Configuration

For advanced configuration options including language detection, table extraction, OCR settings, and more:

**[Configuration Guide](https://kreuzberg.dev/configuration/)**

## Documentation

- **[Official Documentation](https://kreuzberg.dev/)**
- **[API Reference](https://kreuzberg.dev/reference/api-ruby/)**
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
