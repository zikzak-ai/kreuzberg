```ruby title="Ruby"
require 'kreuzberg'

config = Kreuzberg::Config::Extraction.new(
  use_cache: false,
  enable_quality_processing: true
)

result = Kreuzberg.extract_file_async('document.pdf', config: config).then do |res|
  puts "Async extraction complete"
  puts "Extracted #{res.content.length} characters"
  puts "Quality: #{res.quality_score}"
end

result.wait
```
