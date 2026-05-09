```ruby title="Ruby"
require 'kreuzberg'

files = ['doc1.pdf', 'doc2.docx', 'doc3.pptx']
config = Kreuzberg::Config::Extraction.new(
  use_cache: true
)

results = Kreuzberg.batch_extract_files_sync(files, config: config)

results.each_with_index do |result, idx|
  puts "Document #{idx + 1}:"
  puts "  Extracted: #{result.content.length} characters"
  puts "  Quality: #{result.quality_score}"
  puts "  MIME: #{result.mime_type}"
end
```
