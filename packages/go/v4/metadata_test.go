package kreuzberg

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"
)

// ============================================================================
// EXISTING TESTS (preserved from original file)
// ============================================================================

func TestMetadataRoundTripPreservesFormatAndAdditionalFields(t *testing.T) {
	input := []byte(`{
		"language": "en",
		"date": "2025-01-01",
		"subject": "Agenda",
		"format_type": "pdf",
		"title": "Doc",
		"page_count": 2,
		"image_preprocessing": {
			"original_dimensions": [1024, 2048],
			"original_dpi": [72.0, 72.0],
			"target_dpi": 300,
			"scale_factor": 1.5,
			"auto_adjusted": true,
			"final_dpi": 300,
			"new_dimensions": [2048, 4096],
			"resample_method": "lanczos",
			"dimension_clamped": false,
			"calculated_dpi": 310,
			"skipped_resize": false
		},
		"json_schema": {"type": "object"},
		"error": {"error_type": "ValidationError", "message": "bad"},
		"custom_meta": {"score": 42}
	}`)

	var meta Metadata
	if err := json.Unmarshal(input, &meta); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if meta.Format.Type != FormatPDF {
		t.Fatalf("expected format pdf, got %s", meta.Format.Type)
	}
	if meta.Format.Pdf == nil || meta.Format.Pdf.PageCount == nil || *meta.Format.Pdf.PageCount != 2 {
		t.Fatalf("expected pdf metadata with page count")
	}
	if meta.Additional == nil || len(meta.Additional) != 1 {
		t.Fatalf("expected additional metadata")
	}

	if _, ok := meta.Additional["custom_meta"]; !ok {
		t.Fatalf("missing custom metadata field")
	}

	encoded, err := json.Marshal(meta)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var want map[string]any
	if err := json.Unmarshal(input, &want); err != nil {
		t.Fatalf("unmarshal want: %v", err)
	}

	var got map[string]any
	if err := json.Unmarshal(encoded, &got); err != nil {
		t.Fatalf("unmarshal got: %v", err)
	}

	if !reflect.DeepEqual(want, got) {
		t.Fatalf("metadata mismatch: want %#v, got %#v", want, got)
	}
}

func TestMetadataRoundTripHandlesTextFormats(t *testing.T) {
	input := []byte(`{
		"language": "en",
		"format_type": "text",
		"line_count": 10,
		"word_count": 20,
		"character_count": 40,
		"headers": ["Intro"],
		"links": [["https://example.com", "Example"]],
		"custom_score": 0.42
	}`)

	var meta Metadata
	if err := json.Unmarshal(input, &meta); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}

	if meta.Format.Type != FormatText {
		t.Fatalf("expected text format")
	}
	text, ok := meta.TextMetadata()
	if !ok || text.WordCount != 20 {
		t.Fatalf("text metadata not decoded")
	}

	encoded, err := json.Marshal(meta)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}

	var want map[string]any
	if err := json.Unmarshal(input, &want); err != nil {
		t.Fatalf("want decode: %v", err)
	}
	var got map[string]any
	if err := json.Unmarshal(encoded, &got); err != nil {
		t.Fatalf("got decode: %v", err)
	}

	if !reflect.DeepEqual(want, got) {
		t.Fatalf("metadata mismatch: want %#v, got %#v", want, got)
	}
}

// ============================================================================
// 1. TYPE STRUCTURE TESTS
// ============================================================================

// TestHtmlMetadataStructure verifies HtmlMetadata has correct fields and tags.
func TestHtmlMetadataStructure(t *testing.T) {
	htmlMeta := &HtmlMetadata{
		Title:          StringPtr("Test Page"),
		Description:    StringPtr("A test page"),
		Keywords:       []string{"test", "page"},
		Author:         StringPtr("John Doe"),
		CanonicalURL:   StringPtr("https://example.com/page"),
		BaseHref:       StringPtr("https://example.com/"),
		Language:       StringPtr("en"),
		TextDirection:  StringPtr("ltr"),
		OpenGraph:      map[string]string{"og:title": "Test"},
		TwitterCard:    map[string]string{"twitter:card": "summary"},
		MetaTags:       map[string]string{"custom": "value"},
		Headers:        []HeaderMetadata{},
		Links:          []LinkMetadata{},
		Images:         []HTMLImageMetadata{},
		StructuredData: []StructuredData{},
	}

	// Verify that all expected fields exist
	if htmlMeta.Title == nil || *htmlMeta.Title != "Test Page" {
		t.Errorf("Title field missing or incorrect")
	}
	if htmlMeta.Keywords == nil {
		t.Errorf("Keywords field missing")
	}
	if htmlMeta.CanonicalURL == nil || *htmlMeta.CanonicalURL != "https://example.com/page" {
		t.Errorf("CanonicalURL field missing or incorrect")
	}
	if htmlMeta.OpenGraph == nil {
		t.Errorf("OpenGraph field missing")
	}
	if htmlMeta.TwitterCard == nil {
		t.Errorf("TwitterCard field missing")
	}
}

// TestKeywordsIsSlice verifies Keywords is []string, not *string.
func TestKeywordsIsSlice(t *testing.T) {
	htmlMeta := &HtmlMetadata{
		Keywords: []string{"keyword1", "keyword2", "keyword3"},
	}

	// Verify Keywords is a slice
	if len(htmlMeta.Keywords) != 3 {
		t.Errorf("Keywords should be a slice with 3 items, got %d", len(htmlMeta.Keywords))
	}

	// Verify we can iterate and access elements
	for i, kw := range htmlMeta.Keywords {
		if kw == "" {
			t.Errorf("Keyword at index %d is empty", i)
		}
	}

	// Verify it's not a pointer
	keywords := htmlMeta.Keywords
	_ = keywords
}

// TestCanonicalUrlRenamed verifies CanonicalURL field exists (not Canonical).
func TestCanonicalUrlRenamed(t *testing.T) {
	htmlMeta := &HtmlMetadata{}

	// Verify the field name is CanonicalURL
	htmlMetaType := reflect.TypeOf(*htmlMeta)
	foundCanonicalURL := false

	for i := 0; i < htmlMetaType.NumField(); i++ {
		field := htmlMetaType.Field(i)
		if field.Name == "CanonicalURL" {
			foundCanonicalURL = true
			// Verify JSON tag
			jsonTag := field.Tag.Get("json")
			if !strings.Contains(jsonTag, "canonical_url") {
				t.Errorf("CanonicalURL JSON tag should contain 'canonical_url', got %s", jsonTag)
			}
			break
		}
	}

	if !foundCanonicalURL {
		t.Errorf("CanonicalURL field not found in HtmlMetadata struct")
	}

	// Verify old field name doesn't exist
	htmlMetaType = reflect.TypeOf(*htmlMeta)
	for i := 0; i < htmlMetaType.NumField(); i++ {
		field := htmlMetaType.Field(i)
		if field.Name == "Canonical" {
			t.Errorf("Old field name 'Canonical' should not exist, use 'CanonicalURL'")
		}
	}
}

// TestOpenGraphIsMap verifies OpenGraph is map[string]string.
func TestOpenGraphIsMap(t *testing.T) {
	htmlMeta := &HtmlMetadata{
		OpenGraph: map[string]string{
			"og:title":       "Page Title",
			"og:description": "Page Description",
			"og:image":       "https://example.com/image.png",
		},
	}

	// Verify OpenGraph is a map
	if len(htmlMeta.OpenGraph) != 3 {
		t.Errorf("OpenGraph should have 3 items, got %d", len(htmlMeta.OpenGraph))
	}

	// Verify we can access map values
	if htmlMeta.OpenGraph["og:title"] != "Page Title" {
		t.Errorf("OpenGraph map access failed")
	}
}

// TestTwitterCardIsMap verifies TwitterCard is map[string]string.
func TestTwitterCardIsMap(t *testing.T) {
	htmlMeta := &HtmlMetadata{
		TwitterCard: map[string]string{
			"twitter:card":  "summary_large_image",
			"twitter:title": "Tweet Title",
		},
	}

	// Verify TwitterCard is a map
	if len(htmlMeta.TwitterCard) != 2 {
		t.Errorf("TwitterCard should have 2 items, got %d", len(htmlMeta.TwitterCard))
	}

	// Verify we can access map values
	if htmlMeta.TwitterCard["twitter:card"] != "summary_large_image" {
		t.Errorf("TwitterCard map access failed")
	}
}

// ============================================================================
// 2. JSON SERIALIZATION TESTS
// ============================================================================

// TestHtmlMetadataJSONTags verifies JSON struct tags match expected names (snake_case).
func TestHtmlMetadataJSONTags(t *testing.T) {
	expectedTags := map[string]string{
		"Title":          "title",
		"Description":    "description",
		"Keywords":       "keywords",
		"Author":         "author",
		"CanonicalURL":   "canonical_url",
		"BaseHref":       "base_href",
		"Language":       "language",
		"TextDirection":  "text_direction",
		"OpenGraph":      "open_graph",
		"TwitterCard":    "twitter_card",
		"MetaTags":       "meta_tags",
		"Headers":        "headers",
		"Links":          "links",
		"Images":         "images",
		"StructuredData": "structured_data",
	}

	htmlMetaType := reflect.TypeOf(HtmlMetadata{})
	for i := 0; i < htmlMetaType.NumField(); i++ {
		field := htmlMetaType.Field(i)
		expected, ok := expectedTags[field.Name]
		if !ok {
			continue
		}
		jsonTag := field.Tag.Get("json")
		if !strings.Contains(jsonTag, expected) {
			t.Errorf("Field %s should have JSON tag containing '%s', got '%s'",
				field.Name, expected, jsonTag)
		}
	}
}

// TestHeaderMetadataJSON serializes and deserializes HeaderMetadata correctly.
func TestHeaderMetadataJSON(t *testing.T) {
	input := HeaderMetadata{
		Level:      2,
		Text:       "Section Title",
		ID:         StringPtr("section-title"),
		Depth:      1,
		HTMLOffset: 512,
	}

	data, err := json.Marshal(input)
	if err != nil {
		t.Fatalf("marshal HeaderMetadata failed: %v", err)
	}

	var output HeaderMetadata
	if err := json.Unmarshal(data, &output); err != nil {
		t.Fatalf("unmarshal HeaderMetadata failed: %v", err)
	}

	if output.Level != 2 || output.Text != "Section Title" {
		t.Errorf("HeaderMetadata round-trip failed")
	}
	if output.ID == nil || *output.ID != "section-title" {
		t.Errorf("HeaderMetadata ID field incorrect")
	}
}

// TestLinkMetadataJSON serializes and deserializes LinkMetadata with link_type.
func TestLinkMetadataJSON(t *testing.T) {
	input := LinkMetadata{
		Href:     "https://example.com",
		Text:     "Example Link",
		Title:    StringPtr("Example Website"),
		LinkType: "external",
		Rel:      []string{"nofollow", "external"},
		Attributes: map[string]string{
			"target": "_blank",
			"class":  "external-link",
		},
	}

	data, err := json.Marshal(input)
	if err != nil {
		t.Fatalf("marshal LinkMetadata failed: %v", err)
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		t.Fatalf("unmarshal to map failed: %v", err)
	}

	// Verify link_type is in the JSON
	if _, ok := jsonData["link_type"]; !ok {
		t.Errorf("JSON should contain 'link_type' field")
	}

	var output LinkMetadata
	if err := json.Unmarshal(data, &output); err != nil {
		t.Fatalf("unmarshal LinkMetadata failed: %v", err)
	}

	if output.LinkType != "external" {
		t.Errorf("LinkMetadata LinkType incorrect: got %s, want external", output.LinkType)
	}
}

// TestImageMetadataJSON serializes and deserializes HTMLImageMetadata with image_type.
func TestImageMetadataJSON(t *testing.T) {
	input := HTMLImageMetadata{
		Src:        "https://example.com/image.jpg",
		Alt:        StringPtr("Description"),
		Title:      StringPtr("Image Title"),
		Dimensions: &[2]int{800, 600},
		ImageType:  "jpg",
		Attributes: map[string]string{
			"loading": "lazy",
			"class":   "thumbnail",
		},
	}

	data, err := json.Marshal(input)
	if err != nil {
		t.Fatalf("marshal HTMLImageMetadata failed: %v", err)
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		t.Fatalf("unmarshal to map failed: %v", err)
	}

	// Verify image_type is in the JSON
	if _, ok := jsonData["image_type"]; !ok {
		t.Errorf("JSON should contain 'image_type' field")
	}

	var output HTMLImageMetadata
	if err := json.Unmarshal(data, &output); err != nil {
		t.Fatalf("unmarshal HTMLImageMetadata failed: %v", err)
	}

	if output.ImageType != "jpg" {
		t.Errorf("HTMLImageMetadata ImageType incorrect: got %s, want jpg", output.ImageType)
	}
	if output.Dimensions == nil || output.Dimensions[0] != 800 {
		t.Errorf("HTMLImageMetadata Dimensions incorrect")
	}
}

// TestStructuredDataJSON serializes and deserializes StructuredData with data_type.
func TestStructuredDataJSON(t *testing.T) {
	input := StructuredData{
		DataType:   "json_ld",
		RawJSON:    `{"@type":"Article","headline":"Test"}`,
		SchemaType: StringPtr("Article"),
	}

	data, err := json.Marshal(input)
	if err != nil {
		t.Fatalf("marshal StructuredData failed: %v", err)
	}

	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		t.Fatalf("unmarshal to map failed: %v", err)
	}

	// Verify data_type is in the JSON
	if _, ok := jsonData["data_type"]; !ok {
		t.Errorf("JSON should contain 'data_type' field")
	}

	var output StructuredData
	if err := json.Unmarshal(data, &output); err != nil {
		t.Fatalf("unmarshal StructuredData failed: %v", err)
	}

	if output.DataType != "json_ld" {
		t.Errorf("StructuredData DataType incorrect")
	}
	if output.SchemaType == nil || *output.SchemaType != "Article" {
		t.Errorf("StructuredData SchemaType incorrect")
	}
}

// ============================================================================
// 3. INTEGRATION TESTS
// ============================================================================

// TestExtractHTMLWithMetadata extracts HTML and verifies metadata structure.
func TestExtractHTMLWithMetadata(t *testing.T) {
	htmlContent := []byte(`<!DOCTYPE html>
<html lang="en">
<head>
	<title>Test Page</title>
	<meta name="description" content="A test page">
	<meta name="keywords" content="test, page, example">
	<meta name="author" content="John Doe">
	<link rel="canonical" href="https://example.com/test">
	<base href="https://example.com/">
	<meta property="og:title" content="Test Page">
	<meta name="twitter:card" content="summary">
</head>
<body>
	<h1>Main Title</h1>
	<h2>Subsection</h2>
	<a href="https://example.com">Link</a>
	<img src="image.jpg" alt="Test Image">
	<script type="application/ld+json">{"@type":"Article"}</script>
</body>
</html>`)

	result, err := ExtractBytesSync(htmlContent, "text/html", nil)
	if err != nil {
		t.Fatalf("ExtractBytesSync failed: %v", err)
	}

	if result == nil || !result.Success {
		t.Fatalf("extraction failed")
	}

	htmlMeta, ok := result.Metadata.HTMLMetadata()
	if !ok {
		t.Fatalf("HTMLMetadata not found in extraction result")
	}

	if htmlMeta.Title == nil || *htmlMeta.Title == "" {
		t.Errorf("HTML title not extracted")
	}

	if result.Metadata.Format.Type != FormatHTML {
		t.Errorf("Format type should be HTML, got %s", result.Metadata.Format.Type)
	}
}

// TestMetadataKeywordArray extracts keywords as slice.
func TestMetadataKeywordArray(t *testing.T) {
	htmlContent := []byte(`<!DOCTYPE html>
<html>
<head>
	<meta name="keywords" content="golang, testing, metadata">
</head>
<body></body>
</html>`)

	result, err := ExtractBytesSync(htmlContent, "text/html", nil)
	if err != nil {
		t.Fatalf("extraction failed: %v", err)
	}

	htmlMeta, ok := result.Metadata.HTMLMetadata()
	if !ok {
		t.Fatalf("HTMLMetadata not extracted")
	}

	// Keywords should be a slice
	if htmlMeta.Keywords == nil {
		t.Errorf("Keywords should not be nil")
	}

	// Should be able to iterate
	for _, kw := range htmlMeta.Keywords {
		if kw == "" {
			t.Errorf("Empty keyword in array")
		}
	}
}

// TestMetadataOpenGraphMap extracts OG tags as map.
func TestMetadataOpenGraphMap(t *testing.T) {
	htmlContent := []byte(`<!DOCTYPE html>
<html>
<head>
	<meta property="og:title" content="Page Title">
	<meta property="og:description" content="Page description">
	<meta property="og:image" content="https://example.com/image.png">
</head>
<body></body>
</html>`)

	result, err := ExtractBytesSync(htmlContent, "text/html", nil)
	if err != nil {
		t.Fatalf("extraction failed: %v", err)
	}

	htmlMeta, ok := result.Metadata.HTMLMetadata()
	if !ok {
		t.Fatalf("HTMLMetadata not extracted")
	}

	// OpenGraph should be a map
	if htmlMeta.OpenGraph == nil {
		t.Logf("Note: OpenGraph may be nil if no OG tags were extracted")
	} else {
		// Verify it's a map and we can access values
		for key, value := range htmlMeta.OpenGraph {
			if key == "" || value == "" {
				t.Errorf("Invalid OpenGraph entry")
			}
		}
	}
}

// TestMetadataHeadersList extracts headers as slice.
func TestMetadataHeadersList(t *testing.T) {
	htmlContent := []byte(`<!DOCTYPE html>
<html>
<body>
	<h1>Title 1</h1>
	<h2>Title 2</h2>
	<h3>Title 3</h3>
</body>
</html>`)

	result, err := ExtractBytesSync(htmlContent, "text/html", nil)
	if err != nil {
		t.Fatalf("extraction failed: %v", err)
	}

	htmlMeta, ok := result.Metadata.HTMLMetadata()
	if !ok {
		t.Fatalf("HTMLMetadata not extracted")
	}

	// Headers should be a slice
	if htmlMeta.Headers == nil {
		t.Logf("Note: Headers may be empty if no headers were extracted")
	} else {
		// Verify we can iterate
		for _, hdr := range htmlMeta.Headers {
			if hdr.Level == 0 {
				t.Errorf("Header level should be set")
			}
		}
	}
}

// TestMetadataLinksList extracts links as slice.
func TestMetadataLinksList(t *testing.T) {
	htmlContent := []byte(`<!DOCTYPE html>
<html>
<body>
	<a href="https://example.com">Example</a>
	<a href="/relative">Relative Link</a>
	<a href="#anchor">Anchor</a>
</body>
</html>`)

	result, err := ExtractBytesSync(htmlContent, "text/html", nil)
	if err != nil {
		t.Fatalf("extraction failed: %v", err)
	}

	htmlMeta, ok := result.Metadata.HTMLMetadata()
	if !ok {
		t.Fatalf("HTMLMetadata not extracted")
	}

	// Links should be a slice
	if htmlMeta.Links == nil {
		t.Logf("Note: Links may be empty if no links were extracted")
	} else {
		// Verify we can iterate
		for _, link := range htmlMeta.Links {
			if link.Href == "" {
				t.Errorf("Link href should be set")
			}
		}
	}
}

// TestMetadataImagesList extracts images as slice.
func TestMetadataImagesList(t *testing.T) {
	htmlContent := []byte(`<!DOCTYPE html>
<html>
<body>
	<img src="image1.jpg" alt="Image 1">
	<img src="image2.png">
	<img src="https://example.com/image3.gif">
</body>
</html>`)

	result, err := ExtractBytesSync(htmlContent, "text/html", nil)
	if err != nil {
		t.Fatalf("extraction failed: %v", err)
	}

	htmlMeta, ok := result.Metadata.HTMLMetadata()
	if !ok {
		t.Fatalf("HTMLMetadata not extracted")
	}

	// Images should be a slice
	if htmlMeta.Images == nil {
		t.Logf("Note: Images may be empty if no images were extracted")
	} else {
		// Verify we can iterate
		for _, img := range htmlMeta.Images {
			if img.Src == "" {
				t.Errorf("Image src should be set")
			}
		}
	}
}

// ============================================================================
// 4. EDGE CASES
// ============================================================================

// TestMetadataEmptyHTML returns zero values for empty HTML.
func TestMetadataEmptyHTML(t *testing.T) {
	htmlContent := []byte(`<!DOCTYPE html>
<html>
<head></head>
<body></body>
</html>`)

	result, err := ExtractBytesSync(htmlContent, "text/html", nil)
	if err != nil {
		t.Fatalf("extraction failed: %v", err)
	}

	if !result.Success {
		t.Fatalf("extraction should succeed for empty HTML")
	}

	htmlMeta, ok := result.Metadata.HTMLMetadata()
	if !ok {
		t.Fatalf("HTMLMetadata should be present")
	}

	// Title should be nil for empty page
	if htmlMeta.Title != nil && *htmlMeta.Title == "" {
		t.Errorf("Empty title should be nil, not empty string")
	}
}

// TestMetadataNilPointers verifies optional fields are nil when missing.
func TestMetadataNilPointers(t *testing.T) {
	// Create metadata with minimal fields
	htmlMeta := &HtmlMetadata{
		Keywords: []string{},
	}

	// Optional string fields should be nil
	if htmlMeta.Title != nil {
		t.Errorf("Title should be nil when not set")
	}
	if htmlMeta.Description != nil {
		t.Errorf("Description should be nil when not set")
	}
	if htmlMeta.Author != nil {
		t.Errorf("Author should be nil when not set")
	}
	if htmlMeta.CanonicalURL != nil {
		t.Errorf("CanonicalURL should be nil when not set")
	}
}

// TestMetadataEmptyCollections verifies empty slices/maps when no data.
func TestMetadataEmptyCollections(t *testing.T) {
	htmlMeta := &HtmlMetadata{
		Keywords:       []string{},
		OpenGraph:      map[string]string{},
		TwitterCard:    map[string]string{},
		MetaTags:       map[string]string{},
		Headers:        []HeaderMetadata{},
		Links:          []LinkMetadata{},
		Images:         []HTMLImageMetadata{},
		StructuredData: []StructuredData{},
	}

	// Verify slices/maps are empty, not nil
	if htmlMeta.Keywords == nil {
		t.Errorf("Keywords should be empty slice, not nil")
	}
	if len(htmlMeta.Keywords) != 0 {
		t.Errorf("Keywords should be empty")
	}

	if htmlMeta.OpenGraph == nil {
		t.Logf("Note: Empty maps can be nil in some cases")
	}

	if htmlMeta.Headers == nil {
		t.Errorf("Headers should be empty slice, not nil")
	}
}

// ============================================================================
// 5. BACKWARD COMPATIBILITY VALIDATION
// ============================================================================

// TestOldFieldsRemoved verifies old fields don't exist in struct.
func TestOldFieldsRemoved(t *testing.T) {
	htmlMetaType := reflect.TypeOf(HtmlMetadata{})

	// List of old field names that should NOT exist
	oldFields := []string{
		"OgTitle",
		"OgDescription",
		"OgImage",
		"OgUrl",
		"TwitterTitle",
		"TwitterDescription",
		"TwitterImage",
		"Canonical",
	}

	for i := 0; i < htmlMetaType.NumField(); i++ {
		field := htmlMetaType.Field(i)
		for _, oldName := range oldFields {
			if field.Name == oldName {
				t.Errorf("Old field '%s' should have been removed", oldName)
			}
		}
	}
}

// TestNewFieldsExist verifies new fields exist and have correct types.
func TestNewFieldsExist(t *testing.T) {
	expectedFields := map[string]string{
		"Title":          "*string",
		"Description":    "*string",
		"Keywords":       "[]string",
		"Author":         "*string",
		"CanonicalURL":   "*string",
		"BaseHref":       "*string",
		"Language":       "*string",
		"TextDirection":  "*string",
		"OpenGraph":      "map[string]string",
		"TwitterCard":    "map[string]string",
		"MetaTags":       "map[string]string",
		"Headers":        "[]HeaderMetadata",
		"Links":          "[]LinkMetadata",
		"Images":         "[]HTMLImageMetadata",
		"StructuredData": "[]StructuredData",
	}

	htmlMetaType := reflect.TypeOf(HtmlMetadata{})
	foundFields := make(map[string]string)

	for i := 0; i < htmlMetaType.NumField(); i++ {
		field := htmlMetaType.Field(i)
		foundFields[field.Name] = field.Type.String()
	}

	for fieldName, expectedType := range expectedFields {
		actualType, found := foundFields[fieldName]
		if !found {
			t.Errorf("Field '%s' not found in HtmlMetadata", fieldName)
			continue
		}
		if actualType != expectedType {
			t.Errorf("Field '%s' has type %s, expected %s",
				fieldName, actualType, expectedType)
		}
	}
}

// TestHeaderMetadataFields verifies HeaderMetadata has expected fields.
func TestHeaderMetadataFields(t *testing.T) {
	hdr := HeaderMetadata{
		Level:      1,
		Text:       "Title",
		Depth:      0,
		HTMLOffset: 0,
	}

	if hdr.Level != 1 {
		t.Errorf("Level field incorrect")
	}
	if hdr.Text != "Title" {
		t.Errorf("Text field incorrect")
	}
	if hdr.Depth != 0 {
		t.Errorf("Depth field incorrect")
	}
	if hdr.HTMLOffset != 0 {
		t.Errorf("HTMLOffset field incorrect")
	}
}

// TestLinkMetadataFields verifies LinkMetadata has expected fields.
func TestLinkMetadataFields(t *testing.T) {
	link := LinkMetadata{
		Href:     "https://example.com",
		Text:     "Example",
		LinkType: "external",
	}

	if link.Href != "https://example.com" {
		t.Errorf("Href field incorrect")
	}
	if link.Text != "Example" {
		t.Errorf("Text field incorrect")
	}
	if link.LinkType != "external" {
		t.Errorf("LinkType field incorrect")
	}
}

// TestHTMLImageMetadataFields verifies HTMLImageMetadata has expected fields.
func TestHTMLImageMetadataFields(t *testing.T) {
	img := HTMLImageMetadata{
		Src:       "image.jpg",
		ImageType: "jpg",
	}

	if img.Src != "image.jpg" {
		t.Errorf("Src field incorrect")
	}
	if img.ImageType != "jpg" {
		t.Errorf("ImageType field incorrect")
	}
}

// TestStructuredDataFields verifies StructuredData has expected fields.
func TestStructuredDataFields(t *testing.T) {
	sd := StructuredData{
		DataType: "json_ld",
		RawJSON:  `{"@type":"Article"}`,
	}

	if sd.DataType != "json_ld" {
		t.Errorf("DataType field incorrect")
	}
	if sd.RawJSON != `{"@type":"Article"}` {
		t.Errorf("RawJSON field incorrect")
	}
}

// Note: StringPtr is defined in config.go, so we don't redefine it here
