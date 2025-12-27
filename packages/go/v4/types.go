package kreuzberg

import "encoding/json"

// ExtractionResult mirrors the Rust ExtractionResult struct returned by the core API.
type ExtractionResult struct {
	// Content is the extracted text content from the document.
	Content string `json:"content"`
	// MimeType is the MIME type of the processed document (e.g., "application/pdf").
	MimeType string `json:"mime_type"`
	// Metadata contains extracted document metadata and format-specific information.
	Metadata Metadata `json:"metadata"`
	// Tables contains all tables detected in the document.
	Tables []Table `json:"tables"`
	// DetectedLanguages lists all language codes identified in the document content.
	DetectedLanguages []string `json:"detected_languages,omitempty"`
	// Chunks contains text chunks if chunking was enabled in ExtractionConfig.
	Chunks []Chunk `json:"chunks,omitempty"`
	// Images contains extracted images if image extraction was enabled in ExtractionConfig.
	Images []ExtractedImage `json:"images,omitempty"`
	// Pages contains per-page content and metadata if page extraction was enabled in ExtractionConfig.
	Pages []PageContent `json:"pages,omitempty"`
	// Success indicates whether extraction completed successfully.
	Success bool `json:"success"`
}

// Table represents a detected table in the source document.
type Table struct {
	// Cells is a 2D array of table cell content.
	Cells [][]string `json:"cells"`
	// Markdown is the Markdown representation of the table.
	Markdown string `json:"markdown"`
	// PageNumber is the page number where the table was found (1-indexed).
	PageNumber int `json:"page_number"`
}

// Chunk contains chunked content plus optional embeddings and metadata.
type Chunk struct {
	// Content is the text content of this chunk.
	Content string `json:"content"`
	// Embedding is the vector embedding for this chunk if embedding was enabled in ExtractionConfig.
	Embedding []float32 `json:"embedding,omitempty"`
	// Metadata contains positional information about this chunk within the document.
	Metadata ChunkMetadata `json:"metadata"`
}

// ChunkMetadata provides positional information for a chunk.
type ChunkMetadata struct {
	// ByteStart is the byte offset where this chunk begins in the document.
	ByteStart uint64 `json:"byte_start"`
	// ByteEnd is the byte offset where this chunk ends in the document.
	ByteEnd uint64 `json:"byte_end"`
	// TokenCount is the approximate number of tokens in this chunk (if available).
	TokenCount *int `json:"token_count,omitempty"`
	// ChunkIndex is the zero-based index of this chunk within the document.
	ChunkIndex int `json:"chunk_index"`
	// TotalChunks is the total number of chunks in the document.
	TotalChunks int `json:"total_chunks"`
	// FirstPage is the first page number containing this chunk (1-indexed, if available).
	FirstPage *uint64 `json:"first_page,omitempty"`
	// LastPage is the last page number containing this chunk (1-indexed, if available).
	LastPage *uint64 `json:"last_page,omitempty"`
}

// ExtractedImage represents an extracted image, optionally with nested OCR results.
type ExtractedImage struct {
	// Data is the raw image data in the specified format.
	Data []byte `json:"data"`
	// Format is the image format (e.g., "jpeg", "png", "webp").
	Format string `json:"format"`
	// ImageIndex is the zero-based index of this image within the document.
	ImageIndex int `json:"image_index"`
	// PageNumber is the page number where this image was found (1-indexed, if available).
	PageNumber *int `json:"page_number,omitempty"`
	// Width is the image width in pixels (if available).
	Width *uint32 `json:"width,omitempty"`
	// Height is the image height in pixels (if available).
	Height *uint32 `json:"height,omitempty"`
	// Colorspace describes the image color space (e.g., "RGB", "CMYK").
	Colorspace *string `json:"colorspace,omitempty"`
	// BitsPerComponent is the number of bits per color component (if available).
	BitsPerComponent *uint32 `json:"bits_per_component,omitempty"`
	// IsMask indicates if this image is a mask or transparency layer.
	IsMask bool `json:"is_mask"`
	// Description is an optional description or alt-text for the image.
	Description *string `json:"description,omitempty"`
	// OCRResult contains OCR extraction results if OCR was applied to this image.
	OCRResult *ExtractionResult `json:"ocr_result,omitempty"`
}

// Metadata aggregates document metadata and format-specific payloads.
type Metadata struct {
	// Language is the detected primary language code (e.g., "en", "de").
	Language *string `json:"language,omitempty"`
	// Date is the document creation or publication date if available.
	Date *string `json:"date,omitempty"`
	// Subject is the document subject if available.
	Subject *string `json:"subject,omitempty"`
	// Format contains format-specific metadata (PDF, Excel, Email, etc.) accessed via FormatType() accessor methods.
	Format FormatMetadata `json:"-"`
	// ImagePreprocessing contains OCR image preprocessing metadata if OCR was applied.
	ImagePreprocessing *ImagePreprocessingMetadata `json:"image_preprocessing,omitempty"`
	// JSONSchema contains a JSON schema for structured extraction if applicable.
	JSONSchema json.RawMessage `json:"json_schema,omitempty"`
	// Error contains error information if extraction failed for this document.
	Error *ErrorMetadata `json:"error,omitempty"`
	// PageStructure contains page/slide/sheet structure information if available.
	PageStructure *PageStructure `json:"page_structure,omitempty"`
	// Additional contains any additional format-specific metadata fields.
	Additional map[string]json.RawMessage `json:"-"`
}

// FormatMetadata represents the discriminated union of metadata formats.
type FormatMetadata struct {
	// Type indicates which format metadata field is populated.
	Type FormatType
	// Pdf is populated when Type is FormatPDF.
	Pdf *PdfMetadata
	// Excel is populated when Type is FormatExcel.
	Excel *ExcelMetadata
	// Email is populated when Type is FormatEmail.
	Email *EmailMetadata
	// Pptx is populated when Type is FormatPPTX.
	Pptx *PptxMetadata
	// Archive is populated when Type is FormatArchive.
	Archive *ArchiveMetadata
	// Image is populated when Type is FormatImage.
	Image *ImageMetadata
	// XML is populated when Type is FormatXML.
	XML *XMLMetadata
	// Text is populated when Type is FormatText.
	Text *TextMetadata
	// HTML is populated when Type is FormatHTML.
	HTML *HtmlMetadata
	// OCR is populated when Type is FormatOCR.
	OCR *OcrMetadata
}

// FormatType enumerates supported metadata discriminators.
type FormatType string

const (
	FormatUnknown FormatType = ""
	FormatPDF     FormatType = "pdf"
	FormatExcel   FormatType = "excel"
	FormatEmail   FormatType = "email"
	FormatPPTX    FormatType = "pptx"
	FormatArchive FormatType = "archive"
	FormatImage   FormatType = "image"
	FormatXML     FormatType = "xml"
	FormatText    FormatType = "text"
	FormatHTML    FormatType = "html"
	FormatOCR     FormatType = "ocr"
)

// FormatType returns the discriminated format string.
func (m Metadata) FormatType() FormatType {
	return m.Format.Type
}

// PdfMetadata returns the PDF metadata if present.
func (m Metadata) PdfMetadata() (*PdfMetadata, bool) {
	return m.Format.Pdf, m.Format.Type == FormatPDF && m.Format.Pdf != nil
}

// ExcelMetadata returns the Excel metadata if present.
func (m Metadata) ExcelMetadata() (*ExcelMetadata, bool) {
	return m.Format.Excel, m.Format.Type == FormatExcel && m.Format.Excel != nil
}

// EmailMetadata returns the Email metadata if present.
func (m Metadata) EmailMetadata() (*EmailMetadata, bool) {
	return m.Format.Email, m.Format.Type == FormatEmail && m.Format.Email != nil
}

// PptxMetadata returns the PPTX metadata if present.
func (m Metadata) PptxMetadata() (*PptxMetadata, bool) {
	return m.Format.Pptx, m.Format.Type == FormatPPTX && m.Format.Pptx != nil
}

// ArchiveMetadata returns the archive metadata if present.
func (m Metadata) ArchiveMetadata() (*ArchiveMetadata, bool) {
	return m.Format.Archive, m.Format.Type == FormatArchive && m.Format.Archive != nil
}

// ImageMetadata returns the image metadata if present.
func (m Metadata) ImageMetadata() (*ImageMetadata, bool) {
	return m.Format.Image, m.Format.Type == FormatImage && m.Format.Image != nil
}

// XMLMetadata returns the XML metadata if present.
func (m Metadata) XMLMetadata() (*XMLMetadata, bool) {
	return m.Format.XML, m.Format.Type == FormatXML && m.Format.XML != nil
}

// TextMetadata returns the text metadata if present.
func (m Metadata) TextMetadata() (*TextMetadata, bool) {
	return m.Format.Text, m.Format.Type == FormatText && m.Format.Text != nil
}

// HTMLMetadata returns the HTML metadata if present.
func (m Metadata) HTMLMetadata() (*HtmlMetadata, bool) {
	return m.Format.HTML, m.Format.Type == FormatHTML && m.Format.HTML != nil
}

// OcrMetadata returns the OCR metadata if present.
func (m Metadata) OcrMetadata() (*OcrMetadata, bool) {
	return m.Format.OCR, m.Format.Type == FormatOCR && m.Format.OCR != nil
}

// PdfMetadata contains metadata extracted from PDF documents.
type PdfMetadata struct {
	// Title is the document title from PDF metadata.
	Title *string `json:"title,omitempty"`
	// Subject is the document subject from PDF metadata.
	Subject *string `json:"subject,omitempty"`
	// Authors is a list of document authors.
	Authors []string `json:"authors,omitempty"`
	// Keywords contains document keywords from PDF metadata.
	Keywords []string `json:"keywords,omitempty"`
	// CreatedAt is the document creation timestamp.
	CreatedAt *string `json:"created_at,omitempty"`
	// ModifiedAt is the document last modification timestamp.
	ModifiedAt *string `json:"modified_at,omitempty"`
	// CreatedBy is the name of the application that created the document.
	CreatedBy *string `json:"created_by,omitempty"`
	// Producer is the name of the application that produced the PDF.
	Producer *string `json:"producer,omitempty"`
	// PageCount is the total number of pages in the PDF.
	PageCount *int `json:"page_count,omitempty"`
	// PDFVersion is the PDF version (e.g., "1.4", "1.7").
	PDFVersion *string `json:"pdf_version,omitempty"`
	// IsEncrypted indicates if the PDF is password-protected.
	IsEncrypted *bool `json:"is_encrypted,omitempty"`
	// Width is the page width in points (1/72 of an inch).
	Width *int64 `json:"width,omitempty"`
	// Height is the page height in points (1/72 of an inch).
	Height *int64 `json:"height,omitempty"`
	// Summary is an optional AI-generated or provided summary of the document.
	Summary *string `json:"summary,omitempty"`
}

// ExcelMetadata lists sheets inside spreadsheet documents.
type ExcelMetadata struct {
	// SheetCount is the number of sheets in the spreadsheet.
	SheetCount int `json:"sheet_count"`
	// SheetNames lists the names of all sheets in the spreadsheet.
	SheetNames []string `json:"sheet_names"`
}

// EmailMetadata captures envelope data for EML/MSG messages.
type EmailMetadata struct {
	// FromEmail is the sender's email address.
	FromEmail *string `json:"from_email,omitempty"`
	// FromName is the sender's display name.
	FromName *string `json:"from_name,omitempty"`
	// ToEmails is a list of recipient email addresses.
	ToEmails []string `json:"to_emails"`
	// CcEmails is a list of CC recipient email addresses.
	CcEmails []string `json:"cc_emails"`
	// BccEmails is a list of BCC recipient email addresses.
	BccEmails []string `json:"bcc_emails"`
	// MessageID is the message ID from the email headers.
	MessageID *string `json:"message_id,omitempty"`
	// Attachments lists the filenames of email attachments.
	Attachments []string `json:"attachments"`
}

// ArchiveMetadata summarizes archive contents.
type ArchiveMetadata struct {
	// Format is the archive type (e.g., "zip", "tar", "tar.gz").
	Format string `json:"format"`
	// FileCount is the number of files in the archive.
	FileCount int `json:"file_count"`
	// FileList contains the names of all files in the archive.
	FileList []string `json:"file_list"`
	// TotalSize is the uncompressed total size in bytes.
	TotalSize int `json:"total_size"`
	// CompressedSize is the compressed size in bytes (if available).
	CompressedSize *int `json:"compressed_size,omitempty"`
}

// ImageMetadata describes standalone image documents.
type ImageMetadata struct {
	// Width is the image width in pixels.
	Width uint32 `json:"width"`
	// Height is the image height in pixels.
	Height uint32 `json:"height"`
	// Format is the image format (e.g., "jpeg", "png").
	Format string `json:"format"`
	// EXIF contains EXIF metadata from the image (key-value pairs).
	EXIF map[string]string `json:"exif"`
}

// XMLMetadata provides statistics for XML documents.
type XMLMetadata struct {
	// ElementCount is the total number of XML elements in the document.
	ElementCount int `json:"element_count"`
	// UniqueElements lists all unique XML element tag names.
	UniqueElements []string `json:"unique_elements"`
}

// TextMetadata contains counts for plain text and Markdown documents.
type TextMetadata struct {
	// LineCount is the number of lines in the text.
	LineCount int `json:"line_count"`
	// WordCount is the number of words in the text.
	WordCount int `json:"word_count"`
	// CharacterCount is the number of characters in the text.
	CharacterCount int `json:"character_count"`
	// Headers lists all headings found in the text (for Markdown).
	Headers []string `json:"headers,omitempty"`
	// Links is a list of [text, URL] pairs for all hyperlinks.
	Links [][2]string `json:"links,omitempty"`
	// CodeBlocks is a list of [language, code] pairs for all code blocks.
	CodeBlocks [][2]string `json:"code_blocks,omitempty"`
}

//revive:disable-next-line var-naming
type HtmlMetadata struct {
	// Title is the HTML page title from the <title> tag.
	Title *string `json:"title,omitempty"`
	// Description is the meta description tag content.
	Description *string `json:"description,omitempty"`
	// Keywords is an array of meta keywords from the keywords tag.
	Keywords []string `json:"keywords,omitempty"`
	// Author is the meta author tag content.
	Author *string `json:"author,omitempty"`
	// CanonicalURL is the canonical URL for the page.
	CanonicalURL *string `json:"canonical_url,omitempty"`
	// BaseHref is the base URL for relative links.
	BaseHref *string `json:"base_href,omitempty"`
	// Language is the language code of the page.
	Language *string `json:"language,omitempty"`
	// TextDirection is the text direction (e.g., "ltr", "rtl").
	TextDirection *string `json:"text_direction,omitempty"`
	// OpenGraph contains Open Graph meta tags as key-value pairs.
	OpenGraph map[string]string `json:"open_graph,omitempty"`
	// TwitterCard contains Twitter card meta tags as key-value pairs.
	TwitterCard map[string]string `json:"twitter_card,omitempty"`
	// MetaTags contains additional meta tags as key-value pairs.
	MetaTags map[string]string `json:"meta_tags,omitempty"`
	// Headers lists all headings found in the HTML document.
	Headers []HeaderMetadata `json:"headers,omitempty"`
	// Links lists all links found in the HTML document.
	Links []LinkMetadata `json:"links,omitempty"`
	// Images lists all images found in the HTML document.
	Images []HTMLImageMetadata `json:"images,omitempty"`
	// StructuredData contains structured data found in the HTML document.
	StructuredData []StructuredData `json:"structured_data,omitempty"`
}

// HeaderMetadata represents a heading element in HTML.
type HeaderMetadata struct {
	// Level is the heading level (1-6 for h1-h6).
	Level uint8 `json:"level"`
	// Text is the heading text content.
	Text string `json:"text"`
	// ID is the heading element ID attribute (if present).
	ID *string `json:"id,omitempty"`
	// Depth is the nesting depth of the heading.
	Depth int `json:"depth"`
	// HTMLOffset is the byte offset of the heading in the HTML source.
	HTMLOffset int `json:"html_offset"`
}

// LinkMetadata represents a hyperlink in HTML.
type LinkMetadata struct {
	// Href is the target URL of the link.
	Href string `json:"href"`
	// Text is the link text content.
	Text string `json:"text"`
	// Title is the link title attribute (if present).
	Title *string `json:"title,omitempty"`
	// LinkType is the type of link (e.g., "internal", "external").
	LinkType string `json:"link_type"`
	// Rel contains the rel attribute values as an array.
	Rel []string `json:"rel,omitempty"`
	// Attributes contains additional link attributes.
	Attributes map[string]string `json:"attributes,omitempty"`
}

// HTMLImageMetadata represents an image element in HTML.
type HTMLImageMetadata struct {
	// Src is the image source URL.
	Src string `json:"src"`
	// Alt is the image alt text (if present).
	Alt *string `json:"alt,omitempty"`
	// Title is the image title attribute (if present).
	Title *string `json:"title,omitempty"`
	// Dimensions is the [width, height] of the image (if available).
	Dimensions *[2]int `json:"dimensions,omitempty"`
	// ImageType is the type of image (e.g., "jpg", "png").
	ImageType string `json:"image_type"`
	// Attributes contains additional image attributes.
	Attributes map[string]string `json:"attributes,omitempty"`
}

// StructuredData represents structured data (JSON-LD, microdata, etc.) in HTML.
type StructuredData struct {
	// DataType is the type of structured data (e.g., "json_ld", "microdata").
	DataType string `json:"data_type"`
	// RawJSON is the raw JSON representation of the structured data.
	RawJSON string `json:"raw_json"`
	// SchemaType is the schema type (e.g., "Article", "Product") if applicable.
	SchemaType *string `json:"schema_type,omitempty"`
}

// PptxMetadata summarizes slide decks.
type PptxMetadata struct {
	// Title is the presentation title.
	Title *string `json:"title,omitempty"`
	// Author is the presentation author.
	Author *string `json:"author,omitempty"`
	// Description is the presentation description.
	Description *string `json:"description,omitempty"`
	// Summary is an optional AI-generated or provided summary.
	Summary *string `json:"summary,omitempty"`
	// Fonts is a list of font names used in the presentation.
	Fonts []string `json:"fonts"`
}

// OcrMetadata records OCR settings/results associated with an extraction.
type OcrMetadata struct {
	// Language is the language code used for OCR (e.g., "eng").
	Language string `json:"language"`
	// PSM is the Page Segmentation Mode used for OCR (Tesseract PSM value).
	PSM int `json:"psm"`
	// OutputFormat is the OCR output format used.
	OutputFormat string `json:"output_format"`
	// TableCount is the number of tables detected during OCR.
	TableCount int `json:"table_count"`
	// TableRows is the number of rows detected in tables (if available).
	TableRows *int `json:"table_rows,omitempty"`
	// TableCols is the number of columns detected in tables (if available).
	TableCols *int `json:"table_cols,omitempty"`
}

// ImagePreprocessingMetadata tracks OCR preprocessing steps.
type ImagePreprocessingMetadata struct {
	// OriginalDimensions is the [width, height] of the original image.
	OriginalDimensions [2]int `json:"original_dimensions"`
	// OriginalDPI is the [x, y] DPI of the original image.
	OriginalDPI [2]float64 `json:"original_dpi"`
	// TargetDPI is the target DPI used for preprocessing.
	TargetDPI int `json:"target_dpi"`
	// ScaleFactor is the scaling factor applied to the image.
	ScaleFactor float64 `json:"scale_factor"`
	// AutoAdjusted indicates if DPI was automatically adjusted.
	AutoAdjusted bool `json:"auto_adjusted"`
	// FinalDPI is the final DPI after preprocessing.
	FinalDPI int `json:"final_dpi"`
	// NewDimensions is the [width, height] after resizing (if available).
	NewDimensions *[2]int `json:"new_dimensions,omitempty"`
	// ResampleMethod is the resampling algorithm used (e.g., "Bilinear").
	ResampleMethod string `json:"resample_method"`
	// DimensionClamped indicates if dimensions were clamped to limits.
	DimensionClamped bool `json:"dimension_clamped"`
	// CalculatedDPI is the calculated DPI value (if available).
	CalculatedDPI *int `json:"calculated_dpi,omitempty"`
	// SkippedResize indicates if resizing was skipped.
	SkippedResize bool `json:"skipped_resize"`
	// ResizeError contains an error message if resizing failed.
	ResizeError *string `json:"resize_error,omitempty"`
}

// ErrorMetadata describes failures in batch operations.
type ErrorMetadata struct {
	// ErrorType is the classification of the error (e.g., "ValidationError").
	ErrorType string `json:"error_type"`
	// Message is the error message.
	Message string `json:"message"`
}

// PageUnitType enumerates the types of paginated units in documents.
type PageUnitType string

const (
	PageUnitTypePage  PageUnitType = "page"
	PageUnitTypeSlide PageUnitType = "slide"
	PageUnitTypeSheet PageUnitType = "sheet"
)

// PageBoundary marks byte offset boundaries for a page in the extracted content.
type PageBoundary struct {
	// ByteStart is the byte offset where this page begins.
	ByteStart uint64 `json:"byte_start"`
	// ByteEnd is the byte offset where this page ends.
	ByteEnd uint64 `json:"byte_end"`
	// PageNumber is the page number (1-indexed).
	PageNumber uint64 `json:"page_number"`
}

// PageInfo provides metadata about an individual page/slide/sheet.
type PageInfo struct {
	// Number is the page/slide/sheet number (1-indexed).
	Number uint64 `json:"number"`
	// Title is the page title or slide name (if available).
	Title *string `json:"title,omitempty"`
	// Dimensions is the [width, height] of the page in points or units.
	Dimensions *[2]float64 `json:"dimensions,omitempty"`
	// ImageCount is the number of images on this page (if available).
	ImageCount *uint64 `json:"image_count,omitempty"`
	// Visible indicates if this page/slide is visible (if available).
	Visible *bool `json:"visible,omitempty"`
	// ContentType is the MIME type of the page content (if available).
	ContentType *string `json:"content_type,omitempty"`
}

// PageStructure describes the page/slide/sheet structure of a document.
type PageStructure struct {
	// TotalCount is the total number of pages/slides/sheets.
	TotalCount uint64 `json:"total_count"`
	// UnitType is the type of units (page, slide, or sheet).
	UnitType PageUnitType `json:"unit_type"`
	// Boundaries contains byte offset boundaries for each page.
	Boundaries []PageBoundary `json:"boundaries,omitempty"`
	// Pages contains metadata for each page.
	Pages []PageInfo `json:"pages,omitempty"`
}

// PageContent represents extracted content for a single page.
type PageContent struct {
	// PageNumber is the page number (1-indexed).
	PageNumber uint64 `json:"page_number"`
	// Content is the extracted text content for this page.
	Content string `json:"content"`
	// Tables are all tables detected on this page.
	Tables []Table `json:"tables,omitempty"`
	// Images are all images detected on this page.
	Images []ExtractedImage `json:"images,omitempty"`
}
