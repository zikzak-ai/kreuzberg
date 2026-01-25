# E2E Test Structure

This document provides a visual overview of the test structure across all three language bindings.

## Test Organization

### By Language and Test Class

```
e2e/
├── python/tests/test_config_parity.py
│   ├── TestOutputFormatParity (6 tests)
│   │   ├── test_output_format_plain_default
│   │   ├── test_output_format_serialization
│   │   ├── test_extraction_with_plain_format
│   │   ├── test_extraction_with_markdown_format
│   │   ├── test_extraction_with_html_format
│   │   └── test_output_format_affects_content
│   │
│   ├── TestResultFormatParity (6 tests)
│   │   ├── test_result_format_unified_default
│   │   ├── test_result_format_serialization
│   │   ├── test_extraction_with_unified_format
│   │   ├── test_extraction_with_elements_format
│   │   └── test_result_format_structure_variation
│   │
│   ├── TestConfigCombinations (4 tests)
│   │   ├── test_plain_unified_combination
│   │   ├── test_markdown_elements_combination
│   │   ├── test_html_unified_combination
│   │   └── test_config_merge_preserves_formats
│   │
│   ├── TestConfigSerialization (5 tests)
│   │   ├── test_output_format_to_json
│   │   ├── test_result_format_to_json
│   │   ├── test_from_json_with_output_format
│   │   ├── test_from_json_with_result_format
│   │   └── test_round_trip_serialization
│   │
│   └── TestErrorHandling (3 tests)
│       ├── test_invalid_output_format_rejected
│       ├── test_invalid_result_format_rejected
│       └── test_case_sensitivity_of_formats
│
├── typescript/tests/config-parity.spec.ts
│   ├── Output Format Parity Tests (6 tests)
│   │   ├── should have Plain as default output format
│   │   ├── should serialize outputFormat correctly
│   │   ├── should extract with Plain output format
│   │   ├── should extract with Markdown output format
│   │   ├── should extract with HTML output format
│   │   └── should produce content with different output formats
│   │
│   ├── Result Format Parity Tests (6 tests)
│   │   ├── should have Unified as default result format
│   │   ├── should serialize resultFormat correctly
│   │   ├── should extract with Unified result format
│   │   ├── should extract with Elements result format
│   │   └── should produce results with different result formats
│   │
│   ├── Config Combinations Tests (4 tests)
│   │   ├── should handle Plain with Unified combination
│   │   ├── should handle Markdown with Elements combination
│   │   ├── should handle HTML with Unified combination
│   │   └── should preserve format fields when merging configs
│   │
│   ├── Config Serialization Tests (3 tests)
│   │   ├── should serialize outputFormat to JSON
│   │   ├── should serialize resultFormat to JSON
│   │   └── should preserve formats through JSON round-trip
│   │
│   └── Error Handling Tests (3 tests)
│       ├── should reject invalid outputFormat values
│       ├── should reject invalid resultFormat values
│       └── should enforce case sensitivity for format names
│
└── ruby/spec/config_parity_spec.rb
    ├── OutputFormat Configuration (6 tests)
    │   ├── defaults: has Plain as default output_format
    │   ├── serialization: serializes output_format to JSON
    │   ├── extraction: extracts with Plain output format
    │   ├── extraction: extracts with Markdown output format
    │   ├── extraction: extracts with HTML output format
    │   └── format variations: produces different content...
    │
    ├── ResultFormat Configuration (6 tests)
    │   ├── defaults: has Unified as default result_format
    │   ├── serialization: serializes result_format to JSON
    │   ├── extraction: extracts with Unified result format
    │   ├── extraction: extracts with Elements result format
    │   └── format variations: produces results with different...
    │
    ├── Config Combinations (4 tests)
    │   ├── handles Plain with Unified combination
    │   ├── handles Markdown with Elements combination
    │   ├── handles HTML with Unified combination
    │   └── preserves format fields when merging configs
    │
    ├── Config Serialization (3 tests)
    │   ├── serializes output_format correctly
    │   ├── serializes result_format correctly
    │   └── preserves formats through JSON round-trip
    │
    └── Error Handling (3 tests)
        ├── rejects invalid output_format values
        ├── rejects invalid result_format values
        └── enforces case sensitivity for format names
```

## Test Execution Flow

### Shared Test Flow

Each language follows the same test pattern:

```
1. Default Values
   ├─ Check output_format defaults to "Plain"
   ├─ Check result_format defaults to "Unified"
   └─ Verify ExtractionConfig instantiation

2. Serialization
   ├─ Create config with custom format values
   ├─ Serialize to JSON (to_json / JSON.stringify)
   ├─ Verify JSON contains format fields
   └─ Deserialize back and verify values

3. Extraction Operations
   ├─ Load sample document (test_documents/text/report.txt)
   ├─ Create config with specific format
   ├─ Call extract_bytes_sync / extractBytesSync
   ├─ Verify result is valid ExtractionResult
   └─ Check content is not nil/null

4. Format Combinations
   ├─ Test Plain + Unified
   ├─ Test Markdown + Elements
   ├─ Test HTML + Unified
   └─ Verify all combinations work

5. Error Handling
   ├─ Try invalid format values
   ├─ Verify error is raised
   ├─ Check error message
   └─ Verify case sensitivity enforced
```

## Config Field Coverage

### output_format / outputFormat

Tested values:
- Plain (default)
- Markdown
- Html
- Djot (tested in error handling for unsupported values)

Tested operations:
- Default instantiation
- JSON serialization (field present in output)
- JSON deserialization (parsed from input)
- Extraction with each format
- Round-trip serialization

### result_format / resultFormat

Tested values:
- Unified (default)
- Elements

Tested operations:
- Default instantiation
- JSON serialization (field present in output)
- JSON deserialization (parsed from input)
- Extraction with each format
- Round-trip serialization

## Test Execution Matrix

### By Configuration Field

```
Output Format Tests:
  Plain      ✓ Default   ✓ Serializable  ✓ Extraction Works
  Markdown   ✓ Supported ✓ Serializable  ✓ Extraction Works
  Html       ✓ Supported ✓ Serializable  ✓ Extraction Works
  Djot       ✓ Defined   ✓ Serializable  ✓ May be optional
  Invalid    ✓ Rejected  ✓ Error Raised

Result Format Tests:
  Unified    ✓ Default   ✓ Serializable  ✓ Extraction Works
  Elements   ✓ Supported ✓ Serializable  ✓ Extraction Works
  Invalid    ✓ Rejected  ✓ Error Raised
```

### By Operation

```
Default Instantiation:
  Python   ✓ 2 tests
  TypeScript ✓ 2 tests
  Ruby     ✓ 2 tests
  Total: 6 tests

Serialization:
  Python   ✓ 5 tests
  TypeScript ✓ 3 tests
  Ruby     ✓ 3 tests
  Total: 11 tests

Extraction:
  Python   ✓ 8 tests
  TypeScript ✓ 8 tests
  Ruby     ✓ 8 tests
  Total: 24 tests

Config Merging:
  Python   ✓ 1 test
  TypeScript ✓ 1 test
  Ruby     ✓ 1 test
  Total: 3 tests

Error Handling:
  Python   ✓ 3 tests
  TypeScript ✓ 3 tests
  Ruby     ✓ 3 tests
  Total: 9 tests

Grand Total: 68 tests
```

## Language Convention Differences

### Naming Conventions

```python
# Python (snake_case)
config = ExtractionConfig(
    output_format="Markdown",
    result_format="Elements"
)
json_str = config.to_json()
result = extract_bytes_sync(doc, config, None)
```

```typescript
// TypeScript (camelCase)
const config = new ExtractionConfig({
  outputFormat: "Markdown",
  resultFormat: "Elements"
});
const json = JSON.stringify(config);
const result = extractBytesSync(doc, config, null);
```

```ruby
# Ruby (snake_case with underscore-separated method calls)
config = Kreuzberg::ExtractionConfig.new(
  output_format: "Markdown",
  result_format: "Elements"
)
json = config.to_json
result = Kreuzberg.extract_bytes(doc, config, nil)
```

## Test Dependencies

### Document Requirements

All tests use:
- `test_documents/text/report.txt` (if exists)
- Fallback: Auto-generated sample text

### Package Requirements

```
Python:
  - kreuzberg >= 4.2.0
  - pytest >= 7.4.0

TypeScript:
  - @kreuzberg/node >= 4.2.0
  - vitest >= 1.0.0
  - typescript >= 5.3.0

Ruby:
  - kreuzberg >= 4.2.0
  - rspec >= 3.12
```

## Assertions Used

### Python (pytest)
```python
assert config.output_format == "Plain"
assert isinstance(result, ExtractionResult)
assert result.content is not None
assert len(result.content) > 0
pytest.raises(ValueError)
```

### TypeScript (vitest)
```typescript
expect(config.outputFormat).toBe("Plain");
expect(result).toBeDefined();
expect(result.content).toBeDefined();
expect(result.content.length).toBeGreaterThan(0);
expect(() => { ... }).toThrow();
```

### Ruby (rspec)
```ruby
expect(config.output_format).to eq("Plain")
expect(result).to be_a(Kreuzberg::ExtractionResult)
expect(result.content).not_to be_nil
expect(result.content.length).to be > 0
expect { ... }.to raise_error(ArgumentError)
```

## Test Execution Order

Tests are organized to run in logical groups:

1. **Defaults** - Verify initial state
2. **Serialization** - Test JSON round-trip
3. **Extraction** - Test real operations
4. **Combinations** - Test format interactions
5. **Error Cases** - Test validation

This ordering ensures:
- Basic functionality is verified first
- Complex interactions are tested after foundations
- Error handling is last (least critical)
- Easy debugging if tests fail (identify layer)

## Extensibility

To add tests for new config fields:

1. Follow the same 5 test categories
2. Add 5-6 tests per new field (default, serialization, extraction x3, error handling)
3. Keep test names consistent across languages
4. Use same assertion patterns
5. Add documentation to IMPLEMENTATION_SUMMARY.md

Example for new field `preserve_formatting`:

```
TestPreserveFormattingField (5 tests):
  - test_preserve_formatting_default
  - test_preserve_formatting_serialization
  - test_extraction_with_preserve_formatting_true
  - test_extraction_with_preserve_formatting_false
  - test_invalid_preserve_formatting_rejected
```
