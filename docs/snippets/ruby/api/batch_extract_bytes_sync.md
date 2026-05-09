```ruby title="Ruby"
require 'kreuzberg'

bytes_list = [
  File.read('doc1.pdf'),
  File.read('doc2.docx'),
  File.read('doc3.xlsx')
]

mime_types = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

config = Kreuzberg::Config::Extraction.new(use_cache: true)

results = Kreuzberg.batch_extract_bytes_sync(
  bytes_list,
  mime_types,
  config: config
)

results.each { |result| puts "Extracted: #{result.content.length} chars" }
```
