# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::ImageExtraction do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.extract_images).to be true
      expect(config.target_dpi).to eq 300
      expect(config.max_image_dimension).to eq 2000
      expect(config.auto_adjust_dpi).to be true
      expect(config.min_dpi).to eq 150
      expect(config.max_dpi).to eq 600
    end

    it 'creates config with custom values' do
      config = described_class.new(
        extract_images: false,
        target_dpi: 600,
        max_image_dimension: 4000,
        auto_adjust_dpi: false,
        min_dpi: 100,
        max_dpi: 1200
      )

      expect(config.extract_images).to be false
      expect(config.target_dpi).to eq 600
      expect(config.max_image_dimension).to eq 4000
      expect(config.auto_adjust_dpi).to be false
      expect(config.min_dpi).to eq 100
      expect(config.max_dpi).to eq 1200
    end

    it 'converts values to integers' do
      config = described_class.new(
        target_dpi: '300',
        max_image_dimension: '2000',
        min_dpi: '150',
        max_dpi: '600'
      )

      expect(config.target_dpi).to eq 300
      expect(config.max_image_dimension).to eq 2000
      expect(config.min_dpi).to eq 150
      expect(config.max_dpi).to eq 600
      expect(config.target_dpi).to be_a Integer
    end

    it 'converts boolean values correctly' do
      config = described_class.new(
        extract_images: true,
        auto_adjust_dpi: false
      )

      expect(config.extract_images).to be true
      expect(config.auto_adjust_dpi).to be false
    end
  end

  describe '#to_h' do
    it 'serializes to hash with all values' do
      config = described_class.new(
        target_dpi: 300,
        max_image_dimension: 2000
      )
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:extract_images]).to be true
      expect(hash[:target_dpi]).to eq 300
      expect(hash[:max_image_dimension]).to eq 2000
      expect(hash[:auto_adjust_dpi]).to be true
      expect(hash[:min_dpi]).to eq 150
      expect(hash[:max_dpi]).to eq 600
    end

    it 'always includes all keys in hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.keys).to contain_exactly(
        :extract_images,
        :target_dpi,
        :max_image_dimension,
        :auto_adjust_dpi,
        :min_dpi,
        :max_dpi
      )
    end
  end

  describe 'validation' do
    it 'accepts valid DPI values' do
      expect do
        described_class.new(target_dpi: 300, min_dpi: 150, max_dpi: 600)
      end.not_to raise_error
    end

    it 'accepts valid image dimensions' do
      expect do
        described_class.new(max_image_dimension: 4000)
      end.not_to raise_error
    end

    it 'converts float DPI to integer' do
      config = described_class.new(target_dpi: 300.5)

      expect(config.target_dpi).to eq 300
      expect(config.target_dpi).to be_a Integer
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        extract_images: true,
        target_dpi: 600,
        max_image_dimension: 3000,
        auto_adjust_dpi: true,
        min_dpi: 200,
        max_dpi: 800
      )

      expect(config.extract_images).to be true
      expect(config.target_dpi).to eq 600
      expect(config.max_image_dimension).to eq 3000
      expect(config.auto_adjust_dpi).to be true
      expect(config.min_dpi).to eq 200
      expect(config.max_dpi).to eq 800
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(target_dpi: 300, max_image_dimension: 2000)
      config2 = described_class.new(target_dpi: 300, max_image_dimension: 2000)

      expect(config1.target_dpi).to eq config2.target_dpi
      expect(config1.max_image_dimension).to eq config2.max_image_dimension
    end

    it 'detects differences in DPI' do
      config1 = described_class.new(target_dpi: 300)
      config2 = described_class.new(target_dpi: 600)

      expect(config1.target_dpi).not_to eq config2.target_dpi
    end

    it 'detects differences in extract_images' do
      config1 = described_class.new(extract_images: true)
      config2 = described_class.new(extract_images: false)

      expect(config1.extract_images).not_to eq config2.extract_images
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      image_config = described_class.new(target_dpi: 600)
      extraction = Kreuzberg::Config::Extraction.new(image_extraction: image_config)

      expect(extraction.image_extraction).to be_a described_class
      expect(extraction.image_extraction.target_dpi).to eq 600
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        image_extraction: { target_dpi: 600, extract_images: true }
      )

      expect(extraction.image_extraction).to be_a described_class
      expect(extraction.image_extraction.target_dpi).to eq 600
    end
  end

  describe 'DPI range' do
    it 'allows realistic DPI values' do
      config = described_class.new(min_dpi: 150, max_dpi: 1200)

      expect(config.min_dpi).to eq 150
      expect(config.max_dpi).to eq 1200
    end

    it 'maintains DPI relationships' do
      config = described_class.new(
        target_dpi: 300,
        min_dpi: 100,
        max_dpi: 600
      )

      expect(config.min_dpi).to be <= config.target_dpi
      expect(config.target_dpi).to be <= config.max_dpi
    end
  end

  describe 'image dimension constraints' do
    it 'accepts large image dimensions' do
      config = described_class.new(max_image_dimension: 10_000)

      expect(config.max_image_dimension).to eq 10_000
    end

    it 'accepts small image dimensions' do
      config = described_class.new(max_image_dimension: 100)

      expect(config.max_image_dimension).to eq 100
    end
  end
end
