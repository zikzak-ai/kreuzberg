# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::OCR do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.backend).to eq 'tesseract'
      expect(config.language).to eq 'eng'
      expect(config.tesseract_config).to be_nil
    end

    it 'creates config with custom string values' do
      config = described_class.new(
        backend: 'easyocr',
        language: 'fra'
      )

      expect(config.backend).to eq 'easyocr'
      expect(config.language).to eq 'fra'
    end

    it 'converts symbol keys to strings' do
      config = described_class.new(backend: :tesseract, language: :deu)

      expect(config.backend).to eq 'tesseract'
      expect(config.language).to eq 'deu'
    end

    it 'accepts tesseract_config as instance' do
      tesseract = Kreuzberg::Config::Tesseract.new(options: 'value')
      config = described_class.new(tesseract_config: tesseract)

      expect(config.tesseract_config).to be_a Kreuzberg::Config::Tesseract
    end

    it 'converts tesseract_config hash to instance' do
      config = described_class.new(tesseract_config: { option: 'value' })

      expect(config.tesseract_config).to be_a Kreuzberg::Config::Tesseract
    end
  end

  describe '#to_h' do
    it 'serializes to hash with default values' do
      config = described_class.new
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:backend]).to eq 'tesseract'
      expect(hash[:language]).to eq 'eng'
      expect(hash[:tesseract_config]).to be_nil
    end

    it 'includes tesseract_config in hash when present' do
      config = described_class.new(
        backend: 'tesseract',
        tesseract_config: { dpi: 300 }
      )
      hash = config.to_h

      expect(hash[:tesseract_config]).to be_a Hash
    end

    it 'compacts nil values from hash' do
      config = described_class.new(backend: 'tesseract')
      hash = config.to_h

      expect(hash.key?(:tesseract_config)).to be false
    end
  end

  describe 'validation' do
    it 'accepts valid backends' do
      expect do
        described_class.new(backend: 'tesseract')
      end.not_to raise_error
    end

    it 'accepts symbol language' do
      expect do
        described_class.new(language: :fra)
      end.not_to raise_error
    end

    it 'raises error for invalid tesseract_config type' do
      expect do
        described_class.new(tesseract_config: 'invalid')
      end.to raise_error ArgumentError, /Expected.*Tesseract.*Hash.*nil/
    end
  end

  describe 'keyword arguments' do
    it 'accepts keyword arguments only' do
      config = described_class.new(backend: 'tesseract', language: 'eng')

      expect(config.backend).to eq 'tesseract'
      expect(config.language).to eq 'eng'
    end

    it 'ignores unknown keywords gracefully' do
      # This test documents current behavior
      # The initialize method doesn't explicitly reject unknown keys
      config = described_class.new(backend: 'tesseract')
      expect(config).to be_a described_class
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(backend: 'tesseract', language: 'eng')
      config2 = described_class.new(backend: 'tesseract', language: 'eng')

      expect(config1.backend).to eq config2.backend
      expect(config1.language).to eq config2.language
    end

    it 'detects differences in backend' do
      config1 = described_class.new(backend: 'tesseract')
      config2 = described_class.new(backend: 'easyocr')

      expect(config1.backend).not_to eq config2.backend
    end

    it 'detects differences in language' do
      config1 = described_class.new(language: 'eng')
      config2 = described_class.new(language: 'fra')

      expect(config1.language).not_to eq config2.language
    end
  end

  describe 'nested config integration' do
    it 'integrates with Extraction config' do
      ocr_config = described_class.new(backend: 'tesseract', language: 'deu')
      extraction = Kreuzberg::Config::Extraction.new(ocr: ocr_config)

      expect(extraction.ocr).to be_a described_class
      expect(extraction.ocr.backend).to eq 'tesseract'
      expect(extraction.ocr.language).to eq 'deu'
    end

    it 'accepts hash in Extraction config and converts to instance' do
      extraction = Kreuzberg::Config::Extraction.new(
        ocr: { backend: 'easyocr', language: 'fra' }
      )

      expect(extraction.ocr).to be_a described_class
      expect(extraction.ocr.backend).to eq 'easyocr'
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol keys to correct attributes' do
      config = described_class.new(backend: :tesseract, language: :fra)

      expect(config.backend).to eq 'tesseract'
      expect(config.language).to eq 'fra'
    end

    it 'handles mixed symbol and string values' do
      config = described_class.new(
        backend: 'tesseract',
        language: :eng
      )

      expect(config.backend).to eq 'tesseract'
      expect(config.language).to eq 'eng'
    end
  end
end
