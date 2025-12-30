# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::LanguageDetection do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.enabled).to be false
      expect(config.min_confidence).to eq 0.5
      expect(config.detect_multiple).to be false
    end

    it 'creates config with custom values' do
      config = described_class.new(
        enabled: true,
        min_confidence: 0.9,
        detect_multiple: true
      )

      expect(config.enabled).to be true
      expect(config.min_confidence).to eq 0.9
      expect(config.detect_multiple).to be true
    end

    it 'converts enabled to boolean' do
      config = described_class.new(enabled: 1)

      expect(config.enabled).to be true
      expect(config.enabled).to be_a TrueClass
    end

    it 'converts min_confidence to float' do
      config = described_class.new(min_confidence: '0.75')

      expect(config.min_confidence).to eq 0.75
      expect(config.min_confidence).to be_a Float
    end

    it 'converts detect_multiple to boolean' do
      config = described_class.new(detect_multiple: 'yes')

      expect(config.detect_multiple).to be true
    end
  end

  describe '#to_h' do
    it 'serializes to hash with all values' do
      config = described_class.new(
        enabled: true,
        min_confidence: 0.8,
        detect_multiple: true
      )
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:enabled]).to be true
      expect(hash[:min_confidence]).to eq 0.8
      expect(hash[:detect_multiple]).to be true
    end

    it 'always includes all keys in hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.keys).to contain_exactly(
        :enabled,
        :min_confidence,
        :detect_multiple
      )
    end
  end

  describe 'validation' do
    it 'accepts confidence value of 0.5' do
      expect do
        described_class.new(min_confidence: 0.5)
      end.not_to raise_error
    end

    it 'accepts confidence value of 0.0' do
      expect do
        described_class.new(min_confidence: 0.0)
      end.not_to raise_error
    end

    it 'accepts confidence value of 1.0' do
      expect do
        described_class.new(min_confidence: 1.0)
      end.not_to raise_error
    end

    it 'accepts boolean enabled' do
      expect do
        described_class.new(enabled: true)
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        enabled: true,
        min_confidence: 0.85,
        detect_multiple: true
      )

      expect(config.enabled).to be true
      expect(config.min_confidence).to eq 0.85
      expect(config.detect_multiple).to be true
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        enabled: true,
        min_confidence: 0.8
      )
      config2 = described_class.new(
        enabled: true,
        min_confidence: 0.8
      )

      expect(config1.enabled).to eq config2.enabled
      expect(config1.min_confidence).to eq config2.min_confidence
    end

    it 'detects differences in enabled' do
      config1 = described_class.new(enabled: true)
      config2 = described_class.new(enabled: false)

      expect(config1.enabled).not_to eq config2.enabled
    end

    it 'detects differences in min_confidence' do
      config1 = described_class.new(min_confidence: 0.5)
      config2 = described_class.new(min_confidence: 0.9)

      expect(config1.min_confidence).not_to eq config2.min_confidence
    end

    it 'detects differences in detect_multiple' do
      config1 = described_class.new(detect_multiple: true)
      config2 = described_class.new(detect_multiple: false)

      expect(config1.detect_multiple).not_to eq config2.detect_multiple
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      lang_detect = described_class.new(enabled: true, min_confidence: 0.9)
      extraction = Kreuzberg::Config::Extraction.new(language_detection: lang_detect)

      expect(extraction.language_detection).to be_a described_class
      expect(extraction.language_detection.enabled).to be true
      expect(extraction.language_detection.min_confidence).to eq 0.9
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        language_detection: { enabled: true, min_confidence: 0.75 }
      )

      expect(extraction.language_detection).to be_a described_class
      expect(extraction.language_detection.enabled).to be true
      expect(extraction.language_detection.min_confidence).to eq 0.75
    end
  end

  describe 'symbol vs string key handling' do
    it 'accepts symbol and string enabled values' do
      config = described_class.new(enabled: true)

      expect(config.enabled).to be true
    end

    it 'converts min_confidence string to float' do
      config = described_class.new(min_confidence: '0.95')

      expect(config.min_confidence).to eq 0.95
      expect(config.min_confidence).to be_a Float
    end
  end

  describe 'boolean conversion' do
    it 'converts truthy enabled to true' do
      config = described_class.new(enabled: 1)

      expect(config.enabled).to be true
    end

    it 'converts false enabled to false' do
      config = described_class.new(enabled: false)

      expect(config.enabled).to be false
    end

    it 'converts truthy detect_multiple to true' do
      config = described_class.new(detect_multiple: 'yes')

      expect(config.detect_multiple).to be true
    end

    it 'converts false detect_multiple to false' do
      config = described_class.new(detect_multiple: false)

      expect(config.detect_multiple).to be false
    end
  end

  describe 'confidence range' do
    it 'accepts minimum confidence value' do
      config = described_class.new(min_confidence: 0.0)

      expect(config.min_confidence).to eq 0.0
    end

    it 'accepts maximum confidence value' do
      config = described_class.new(min_confidence: 1.0)

      expect(config.min_confidence).to eq 1.0
    end

    it 'accepts mid-range confidence value' do
      config = described_class.new(min_confidence: 0.6)

      expect(config.min_confidence).to eq 0.6
    end

    it 'preserves high precision confidence values' do
      config = described_class.new(min_confidence: 0.123456)

      expect(config.min_confidence).to be_within(0.00001).of(0.123456)
    end
  end

  describe 'multiple language detection' do
    it 'allows enabling multiple language detection' do
      config = described_class.new(detect_multiple: true)

      expect(config.detect_multiple).to be true
    end

    it 'defaults to single language detection' do
      config = described_class.new

      expect(config.detect_multiple).to be false
    end

    it 'can be disabled when enabled is true' do
      config = described_class.new(enabled: true, detect_multiple: false)

      expect(config.enabled).to be true
      expect(config.detect_multiple).to be false
    end
  end
end
