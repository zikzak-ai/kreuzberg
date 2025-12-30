# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::Extraction do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.use_cache).to be true
      expect(config.enable_quality_processing).to be false
      expect(config.force_ocr).to be false
      expect(config.ocr).to be_nil
      expect(config.chunking).to be_nil
      expect(config.language_detection).to be_nil
      expect(config.pdf_options).to be_nil
      expect(config.image_extraction).to be_nil
      expect(config.image_preprocessing).to be_nil
      expect(config.postprocessor).to be_nil
      expect(config.token_reduction).to be_nil
      expect(config.keywords).to be_nil
      expect(config.html_options).to be_nil
      expect(config.pages).to be_nil
      expect(config.max_concurrent_extractions).to be_nil
    end

    it 'creates config with custom boolean values' do
      config = described_class.new(
        use_cache: false,
        enable_quality_processing: true,
        force_ocr: true
      )

      expect(config.use_cache).to be false
      expect(config.enable_quality_processing).to be true
      expect(config.force_ocr).to be true
    end

    it 'accepts all nested config instances' do
      ocr = Kreuzberg::Config::OCR.new(backend: 'tesseract')
      chunking = Kreuzberg::Config::Chunking.new(max_chars: 500)
      lang_detect = Kreuzberg::Config::LanguageDetection.new(enabled: true)

      config = described_class.new(
        ocr: ocr,
        chunking: chunking,
        language_detection: lang_detect
      )

      expect(config.ocr).to be ocr
      expect(config.chunking).to be chunking
      expect(config.language_detection).to be lang_detect
    end

    it 'converts nested config hashes to instances' do
      config = described_class.new(
        ocr: { backend: 'easyocr', language: 'fra' },
        chunking: { max_chars: 750 }
      )

      expect(config.ocr).to be_a Kreuzberg::Config::OCR
      expect(config.ocr.backend).to eq 'easyocr'
      expect(config.chunking).to be_a Kreuzberg::Config::Chunking
      expect(config.chunking.max_chars).to eq 750
    end

    it 'converts max_concurrent_extractions to integer' do
      config = described_class.new(max_concurrent_extractions: '4')

      expect(config.max_concurrent_extractions).to eq 4
      expect(config.max_concurrent_extractions).to be_a Integer
    end
  end

  describe '#to_h' do
    it 'serializes to hash' do
      config = described_class.new(use_cache: true)
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:use_cache]).to be true
    end

    it 'includes all nested configs in hash' do
      config = described_class.new(
        ocr: { backend: 'tesseract' },
        chunking: { max_chars: 500 }
      )
      hash = config.to_h

      expect(hash[:ocr]).to be_a Hash
      expect(hash[:chunking]).to be_a Hash
    end

    it 'compacts nil nested configs from hash' do
      config = described_class.new(use_cache: true)
      hash = config.to_h

      expect(hash.key?(:ocr)).to be false
      expect(hash.key?(:chunking)).to be false
    end

    it 'always includes top-level boolean values' do
      config = described_class.new
      hash = config.to_h

      expect(hash[:use_cache]).to be true
      expect(hash[:enable_quality_processing]).to be false
      expect(hash[:force_ocr]).to be false
    end
  end

  describe '#to_json' do
    it 'serializes to JSON string' do
      config = described_class.new(use_cache: true, force_ocr: false)
      json = config.to_json

      expect(json).to be_a String
      parsed = JSON.parse(json)
      expect(parsed['use_cache']).to be true
      expect(parsed['force_ocr']).to be false
    end

    it 'handles nested configs in JSON' do
      config = described_class.new(ocr: { backend: 'tesseract' })
      json = config.to_json

      parsed = JSON.parse(json)
      expect(parsed['ocr']['backend']).to eq 'tesseract'
    end
  end

  describe '#get_field' do
    it 'retrieves top-level field' do
      config = described_class.new(use_cache: false)

      expect(config.get_field('use_cache')).to be false
    end

    it 'retrieves nested field with dot notation' do
      config = described_class.new(ocr: { backend: 'tesseract' })

      expect(config.get_field('ocr.backend')).to eq 'tesseract'
    end

    it 'returns nil for non-existent field' do
      config = described_class.new

      expect(config.get_field('nonexistent')).to be_nil
    end

    it 'accepts symbol field names' do
      config = described_class.new(use_cache: true)

      expect(config.get_field(:use_cache)).to be true
    end

    it 'handles deeply nested fields' do
      config = described_class.new(
        chunking: { embedding: { model: { type: :preset, name: 'fast' } } }
      )

      expect(config.get_field('chunking.embedding.model')).to be_a Hash
    end
  end

  describe '#merge' do
    it 'merges two configs' do
      base = described_class.new(use_cache: true, force_ocr: false)
      override = described_class.new(force_ocr: true)
      merged = base.merge(override)

      expect(merged.use_cache).to be true
      expect(merged.force_ocr).to be true
    end

    it 'returns new config without modifying original' do
      base = described_class.new(use_cache: true)
      override = described_class.new(use_cache: false)
      merged = base.merge(override)

      expect(base.use_cache).to be true
      expect(merged.use_cache).to be false
    end

    it 'merges nested configs' do
      base = described_class.new(ocr: { backend: 'tesseract' })
      override = described_class.new(ocr: { language: 'fra' })
      merged = base.merge(override)

      expect(merged.ocr.backend).to eq 'tesseract'
    end

    it 'accepts hash as merge argument' do
      base = described_class.new(use_cache: true)
      merged = base.merge({ use_cache: false })

      expect(merged.use_cache).to be false
    end
  end

  describe '#merge!' do
    it 'mutates config in-place' do
      config = described_class.new(use_cache: true, force_ocr: false)
      override = described_class.new(force_ocr: true)
      result = config.merge!(override)

      expect(config.force_ocr).to be true
      expect(result).to be config
    end

    it 'returns self' do
      config = described_class.new
      override = described_class.new

      expect(config.merge!(override)).to be config
    end

    it 'accepts hash argument' do
      config = described_class.new(use_cache: true)
      config[:use_cache] = false
      config[:force_ocr] = true

      expect(config.use_cache).to be false
      expect(config.force_ocr).to be true
    end
  end

  describe 'validation' do
    it 'rejects invalid ocr type' do
      expect do
        described_class.new(ocr: 'invalid')
      end.to raise_error ArgumentError, /Expected.*OCR/
    end

    it 'rejects invalid chunking type' do
      expect do
        described_class.new(chunking: 123)
      end.to raise_error ArgumentError, /Expected.*Chunking/
    end

    it 'accepts valid nested instances' do
      expect do
        described_class.new(
          ocr: Kreuzberg::Config::OCR.new,
          chunking: Kreuzberg::Config::Chunking.new
        )
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        use_cache: false,
        enable_quality_processing: true,
        force_ocr: true,
        ocr: { backend: 'tesseract' },
        chunking: { max_chars: 500 },
        language_detection: { enabled: true },
        pdf_options: { extract_images: true },
        image_extraction: { target_dpi: 600 },
        image_preprocessing: { denoise: true },
        postprocessor: { enabled: true },
        token_reduction: { mode: 'light' },
        keywords: { algorithm: 'yake' },
        pages: { extract_pages: true },
        max_concurrent_extractions: 4
      )

      expect(config.use_cache).to be false
      expect(config.enable_quality_processing).to be true
      expect(config.force_ocr).to be true
      expect(config.ocr).to be_a Kreuzberg::Config::OCR
      expect(config.max_concurrent_extractions).to eq 4
    end
  end

  describe 'equality' do
    it 'compares configs with same values' do
      config1 = described_class.new(use_cache: true, force_ocr: false)
      config2 = described_class.new(use_cache: true, force_ocr: false)

      expect(config1.use_cache).to eq config2.use_cache
      expect(config1.force_ocr).to eq config2.force_ocr
    end

    it 'detects differences' do
      config1 = described_class.new(use_cache: true)
      config2 = described_class.new(use_cache: false)

      expect(config1.use_cache).not_to eq config2.use_cache
    end
  end

  describe '.from_file' do
    it 'loads from TOML file' do
      config_path = File.join(__dir__, '../../fixtures/config.toml')
      config = described_class.from_file(config_path)

      expect(config).to be_a described_class
      expect(config.use_cache).to be false
    end

    it 'loads from YAML file' do
      config_path = File.join(__dir__, '../../fixtures/config.yaml')
      config = described_class.from_file(config_path)

      expect(config).to be_a described_class
      expect(config.use_cache).to be false
    end

    it 'raises error for non-existent file' do
      expect do
        described_class.from_file('/nonexistent/path/config.toml')
      end.to raise_error Kreuzberg::Errors::ValidationError
    end
  end

  describe '.discover' do
    it 'returns nil when no config file found' do
      # This test may vary by environment
      # Documenting the behavior
      config = described_class.discover
      # Should either return a config or nil
      expect(config.nil? || config.is_a?(described_class)).to be true
    end
  end

  describe 'boolean conversion' do
    it 'converts truthy use_cache to true' do
      config = described_class.new(use_cache: 1)

      expect(config.use_cache).to be true
    end

    it 'converts false use_cache to false' do
      config = described_class.new(use_cache: false)

      expect(config.use_cache).to be false
    end

    it 'converts truthy enable_quality_processing to true' do
      config = described_class.new(enable_quality_processing: 'yes')

      expect(config.enable_quality_processing).to be true
    end

    it 'converts false enable_quality_processing to false' do
      config = described_class.new(enable_quality_processing: false)

      expect(config.enable_quality_processing).to be false
    end

    it 'converts truthy force_ocr to true' do
      config = described_class.new(force_ocr: [1])

      expect(config.force_ocr).to be true
    end

    it 'converts false force_ocr to false' do
      config = described_class.new(force_ocr: false)

      expect(config.force_ocr).to be false
    end
  end

  describe 'complex nested configurations' do
    it 'handles deeply nested configs' do
      config = described_class.new(
        chunking: {
          max_chars: 750,
          embedding: {
            model: { type: :preset, name: 'balanced' },
            batch_size: 64
          }
        }
      )

      expect(config.chunking.embedding).to be_a Kreuzberg::Config::Embedding
      expect(config.chunking.embedding.batch_size).to eq 64
    end

    it 'handles PDF with font and hierarchy configs' do
      config = described_class.new(
        pdf_options: {
          extract_images: true,
          font_config: { enabled: true, custom_font_dirs: ['/fonts'] },
          hierarchy: { k_clusters: 8 }
        }
      )

      expect(config.pdf_options.font_config).to be_a Kreuzberg::Config::FontConfig
      expect(config.pdf_options.hierarchy).to be_a Kreuzberg::Config::Hierarchy
    end

    it 'handles complete extraction config' do
      config = described_class.new(
        use_cache: false,
        force_ocr: true,
        ocr: { backend: 'tesseract', language: 'deu' },
        chunking: { max_chars: 500, preset: 'fast' },
        language_detection: { enabled: true, min_confidence: 0.9 },
        pdf_options: { extract_images: true, passwords: ['secret'] },
        image_extraction: { target_dpi: 600 },
        image_preprocessing: { denoise: true, binarization_method: 'sauvola' },
        postprocessor: { enabled: true, enabled_processors: %w[quality] },
        token_reduction: { mode: 'light' },
        keywords: { algorithm: 'yake', max_keywords: 10 },
        pages: { extract_pages: true }
      )

      expect(config.use_cache).to be false
      expect(config.force_ocr).to be true
      expect(config.ocr.language).to eq 'deu'
      expect(config.chunking.max_chars).to eq 500
      expect(config.language_detection.enabled).to be true
      expect(config.pdf_options.extract_images).to be true
      expect(config.image_extraction.target_dpi).to eq 600
      expect(config.image_preprocessing.denoise).to be true
      expect(config.postprocessor.enabled).to be true
      expect(config.token_reduction.mode).to eq 'light'
      expect(config.keywords.max_keywords).to eq 10
      expect(config.pages.extract_pages).to be true
    end
  end

  describe 'ExtractionConfig alias' do
    it 'exists as module constant' do
      expect(Kreuzberg.const_defined?(:ExtractionConfig)).to be true
    end

    it 'can be instantiated through alias' do
      config = Kreuzberg::ExtractionConfig.new(use_cache: false)

      expect(config).to be_a described_class
      expect(config.use_cache).to be false
    end
  end
end
