```ruby title="Ruby"
require 'kreuzberg'

begin
  pdf_bytes = File.read('document.pdf')
  config = Kreuzberg::Config::Extraction.new
  
  result = Kreuzberg.extract_bytes_sync(pdf_bytes, 'application/pdf', config: config)
  puts "Extracted #{result.content.length} characters"
rescue Kreuzberg::ParsingError => e
  puts "Failed to parse document: #{e.message}"
rescue Kreuzberg::OCRError => e
  puts "OCR processing failed: #{e.message}"
rescue Kreuzberg::ValidationError => e
  puts "Invalid configuration: #{e.message}"
rescue Kreuzberg::Error => e
  puts "Extraction error: #{e.message}"
end
```
