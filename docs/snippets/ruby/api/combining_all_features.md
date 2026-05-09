```ruby title="Ruby"
require 'kreuzberg'

config = Kreuzberg::Config::Extraction.new(
  enable_quality_processing: true,
  
  language_detection: Kreuzberg::Config::LanguageDetection.new(
    enabled: true,
    detect_multiple: true,
    min_confidence: 0.8
  ),
  
  token_reduction: Kreuzberg::Config::TokenReduction.new(
    mode: 'moderate',
    preserve_important_words: true
  ),
  
  chunking: Kreuzberg::Config::Chunking.new(
    max_characters: 512,
    overlap: 50,
    enabled: true,
    embedding: Kreuzberg::Config::Embedding.new(
      model: Kreuzberg::EmbeddingModelType.new(
        type: 'preset',
        name: 'text-embedding-all-minilm-l6-v2'
      )
    )
  ),
  
  keywords: Kreuzberg::Config::Keywords.new(
    algorithm: 'yake',
    max_keywords: 10
  )
)

result = Kreuzberg.extract_file_sync('document.pdf', config: config)

puts "Content length: #{result.content.length} characters"
puts "Quality score: #{result.quality_score}"
puts "Detected languages: #{result.detected_languages&.join(', ')}"
puts "Total chunks: #{result.chunks&.length || 0}"
puts "Keywords: #{result.extracted_keywords&.join(', ')}"

if result.chunks && result.chunks.length > 0
  first_chunk = result.chunks[0]
  puts "First chunk size: #{first_chunk.content.length} chars"
  puts "Embedding dims: #{first_chunk.embedding&.length || 0}"
end
```
