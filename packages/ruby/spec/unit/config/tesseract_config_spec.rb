# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::Tesseract do
  describe '#initialize' do
    it 'creates config with no arguments' do
      config = described_class.new

      expect(config).to be_a described_class
      expect(config.options).to eq({})
    end

    it 'creates config with custom options' do
      config = described_class.new(dpi: 300, psm: 3)

      expect(config.options[:dpi]).to eq 300
      expect(config.options[:psm]).to eq 3
    end

    it 'converts string keys to symbols' do
      config = described_class.new('oem' => 1, 'lang' => 'eng')

      expect(config.options[:oem]).to eq 1
      expect(config.options[:lang]).to eq 'eng'
    end

    it 'accepts preprocessing as hash' do
      config = described_class.new(preprocessing: { target_dpi: 300 })

      expect(config.options[:preprocessing]).to be_a Kreuzberg::Config::ImagePreprocessing
    end

    it 'accepts preprocessing as instance' do
      preprocessing = Kreuzberg::Config::ImagePreprocessing.new(target_dpi: 600)
      config = described_class.new(preprocessing: preprocessing)

      expect(config.options[:preprocessing]).to be_a Kreuzberg::Config::ImagePreprocessing
      expect(config.options[:preprocessing].target_dpi).to eq 600
    end
  end

  describe '#to_h' do
    it 'returns options as hash' do
      config = described_class.new(dpi: 300, psm: 3)
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:dpi]).to eq 300
      expect(hash[:psm]).to eq 3
    end

    it 'includes nested preprocessing in hash' do
      config = described_class.new(
        preprocessing: { target_dpi: 300, denoise: true }
      )
      hash = config.to_h

      expect(hash[:preprocessing]).to be_a Kreuzberg::Config::ImagePreprocessing
      # Access the config object's attributes
      expect(hash[:preprocessing].target_dpi).to eq 300
      expect(hash[:preprocessing].denoise).to be true
    end

    it 'returns duplicate hash not original' do
      config = described_class.new(value: 'test')
      hash1 = config.to_h
      hash2 = config.to_h

      expect(hash1).to eq hash2
      expect(hash1).not_to be hash2
    end
  end

  describe 'validation' do
    it 'rejects invalid preprocessing type' do
      expect do
        described_class.new(preprocessing: 'invalid')
      end.to raise_error ArgumentError, /preprocessing must be.*ImagePreprocessing.*Hash/
    end

    it 'accepts valid preprocessing hash' do
      expect do
        described_class.new(preprocessing: { target_dpi: 300 })
      end.not_to raise_error
    end

    it 'accepts valid preprocessing instance' do
      preprocessing = Kreuzberg::Config::ImagePreprocessing.new
      expect do
        described_class.new(preprocessing: preprocessing)
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts arbitrary keyword arguments' do
      config = described_class.new(
        dpi: 300,
        psm: 3,
        oem: 1,
        custom_option: 'value'
      )

      expect(config.options[:dpi]).to eq 300
      expect(config.options[:psm]).to eq 3
      expect(config.options[:oem]).to eq 1
      expect(config.options[:custom_option]).to eq 'value'
    end

    it 'stores all options with symbol keys' do
      config = described_class.new(foo: 'bar', baz: 42)

      expect(config.options.keys).to all be_a Symbol
      expect(config.options[:foo]).to eq 'bar'
      expect(config.options[:baz]).to eq 42
    end
  end

  describe 'equality' do
    it 'compares configs by options value' do
      config1 = described_class.new(dpi: 300, psm: 3)
      config2 = described_class.new(dpi: 300, psm: 3)

      expect(config1.options).to eq config2.options
    end

    it 'detects differences in options' do
      config1 = described_class.new(dpi: 300)
      config2 = described_class.new(dpi: 600)

      expect(config1.options).not_to eq config2.options
    end
  end

  describe 'nested config integration' do
    it 'can be nested in OCR config' do
      tesseract = described_class.new(dpi: 300, psm: 3)
      ocr = Kreuzberg::Config::OCR.new(tesseract_config: tesseract)

      expect(ocr.tesseract_config).to be_a described_class
      expect(ocr.tesseract_config.options[:dpi]).to eq 300
    end

    it 'accepts preprocessing nested in tesseract' do
      preprocessing_data = { target_dpi: 600, denoise: true }
      tesseract = described_class.new(preprocessing: preprocessing_data)

      expect(tesseract.options[:preprocessing]).to be_a Kreuzberg::Config::ImagePreprocessing
      expect(tesseract.options[:preprocessing].denoise).to be true
    end
  end

  describe 'symbol vs string key handling' do
    it 'normalizes all keys to symbols' do
      config = described_class.new(
        'string_key' => 'value1',
        symbol_key: 'value2'
      )

      expect(config.options.keys).to all be_a Symbol
      expect(config.options[:string_key]).to eq 'value1'
      expect(config.options[:symbol_key]).to eq 'value2'
    end

    it 'preserves string values while converting keys to symbols' do
      config = described_class.new('test_key' => 'test_value')

      expect(config.options[:test_key]).to eq 'test_value'
      expect(config.options[:test_key]).to be_a String
    end
  end

  describe 'immutability concerns' do
    it 'stores options but does not freeze them by default' do
      config = described_class.new(value: 'test')

      # The config itself can be modified by re-assigning instance variables
      # This is a design choice that allows for mutability
      expect(config.options).to respond_to(:merge)
    end
  end
end
