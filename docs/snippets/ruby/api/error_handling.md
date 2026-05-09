```ruby title="Ruby"
require 'kreuzberg'

begin
  result = Kreuzberg.extract_file_sync('missing.pdf')
  puts result.content
rescue Kreuzberg::ValidationError => e
  puts "Validation error: #{e.message}"
rescue Kreuzberg::IOError => e
  puts "IO error: #{e.message}"
  raise
rescue Kreuzberg::Error => e
  puts "Extraction failed: #{e.message}"
  raise
end
```
