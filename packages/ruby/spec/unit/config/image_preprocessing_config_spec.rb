# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::ImagePreprocessing do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.target_dpi).to eq 300
      expect(config.auto_rotate).to be true
      expect(config.deskew).to be true
      expect(config.denoise).to be false
      expect(config.contrast_enhance).to be true
      expect(config.binarization_method).to eq 'otsu'
      expect(config.invert_colors).to be false
    end

    it 'creates config with custom values' do
      config = described_class.new(
        target_dpi: 600,
        auto_rotate: false,
        deskew: false,
        denoise: true,
        contrast_enhance: false,
        binarization_method: 'sauvola',
        invert_colors: true
      )

      expect(config.target_dpi).to eq 600
      expect(config.auto_rotate).to be false
      expect(config.deskew).to be false
      expect(config.denoise).to be true
      expect(config.contrast_enhance).to be false
      expect(config.binarization_method).to eq 'sauvola'
      expect(config.invert_colors).to be true
    end

    it 'converts target_dpi to integer' do
      config = described_class.new(target_dpi: '300')

      expect(config.target_dpi).to eq 300
      expect(config.target_dpi).to be_a Integer
    end

    it 'converts binarization_method to string' do
      config = described_class.new(binarization_method: :niblack)

      expect(config.binarization_method).to eq 'niblack'
      expect(config.binarization_method).to be_a String
    end
  end

  describe '#to_h' do
    it 'serializes to hash with all values' do
      config = described_class.new(target_dpi: 300, denoise: true)
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:target_dpi]).to eq 300
      expect(hash[:denoise]).to be true
      expect(hash[:auto_rotate]).to be true
      expect(hash[:binarization_method]).to eq 'otsu'
    end

    it 'always includes all keys in hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.keys).to contain_exactly(
        :target_dpi,
        :auto_rotate,
        :deskew,
        :denoise,
        :contrast_enhance,
        :binarization_method,
        :invert_colors
      )
    end
  end

  describe 'validation' do
    it 'rejects invalid binarization method' do
      expect do
        described_class.new(binarization_method: 'invalid_method')
      end.to raise_error ArgumentError, /Invalid binarization_method/
    end

    it 'accepts all valid binarization methods' do
      valid_methods = %w[otsu sauvola niblack wolf bradley adaptive]

      valid_methods.each do |method|
        expect do
          described_class.new(binarization_method: method)
        end.not_to raise_error
      end
    end

    it 'accepts binarization method as symbol' do
      expect do
        described_class.new(binarization_method: :sauvola)
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        target_dpi: 600,
        auto_rotate: true,
        deskew: false,
        denoise: true,
        contrast_enhance: false,
        binarization_method: 'bradley',
        invert_colors: true
      )

      expect(config.target_dpi).to eq 600
      expect(config.auto_rotate).to be true
      expect(config.deskew).to be false
      expect(config.denoise).to be true
      expect(config.contrast_enhance).to be false
      expect(config.binarization_method).to eq 'bradley'
      expect(config.invert_colors).to be true
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        target_dpi: 300,
        binarization_method: 'otsu',
        denoise: true
      )
      config2 = described_class.new(
        target_dpi: 300,
        binarization_method: 'otsu',
        denoise: true
      )

      expect(config1.target_dpi).to eq config2.target_dpi
      expect(config1.binarization_method).to eq config2.binarization_method
      expect(config1.denoise).to eq config2.denoise
    end

    it 'detects differences in target_dpi' do
      config1 = described_class.new(target_dpi: 300)
      config2 = described_class.new(target_dpi: 600)

      expect(config1.target_dpi).not_to eq config2.target_dpi
    end

    it 'detects differences in binarization_method' do
      config1 = described_class.new(binarization_method: 'otsu')
      config2 = described_class.new(binarization_method: 'sauvola')

      expect(config1.binarization_method).not_to eq config2.binarization_method
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      preprocessing = described_class.new(target_dpi: 600, denoise: true)
      extraction = Kreuzberg::Config::Extraction.new(image_preprocessing: preprocessing)

      expect(extraction.image_preprocessing).to be_a described_class
      expect(extraction.image_preprocessing.target_dpi).to eq 600
      expect(extraction.image_preprocessing.denoise).to be true
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        image_preprocessing: { target_dpi: 600, binarization_method: 'sauvola' }
      )

      expect(extraction.image_preprocessing).to be_a described_class
      expect(extraction.image_preprocessing.target_dpi).to eq 600
      expect(extraction.image_preprocessing.binarization_method).to eq 'sauvola'
    end

    it 'can be nested in Tesseract config' do
      preprocessing = described_class.new(denoise: true)
      tesseract = Kreuzberg::Config::Tesseract.new(preprocessing: preprocessing)

      expect(tesseract.options[:preprocessing]).to be_a described_class
      expect(tesseract.options[:preprocessing].denoise).to be true
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol binarization method to string' do
      config = described_class.new(binarization_method: :bradley)

      expect(config.binarization_method).to eq 'bradley'
      expect(config.binarization_method).to be_a String
    end

    it 'converts string target_dpi to integer' do
      config = described_class.new(target_dpi: '600')

      expect(config.target_dpi).to eq 600
      expect(config.target_dpi).to be_a Integer
    end
  end

  describe 'boolean conversion' do
    it 'converts truthy values to boolean' do
      config = described_class.new(
        auto_rotate: 1,
        deskew: 'yes',
        denoise: true
      )

      expect(config.auto_rotate).to be true
      expect(config.deskew).to be true
      expect(config.denoise).to be true
    end

    it 'converts false values to boolean' do
      config = described_class.new(
        auto_rotate: false,
        deskew: false,
        denoise: false
      )

      expect(config.auto_rotate).to be false
      expect(config.deskew).to be false
      expect(config.denoise).to be false
    end
  end

  describe 'DPI configuration' do
    it 'accepts realistic DPI values' do
      config = described_class.new(target_dpi: 300)

      expect(config.target_dpi).to eq 300
    end

    it 'accepts high DPI values' do
      config = described_class.new(target_dpi: 1200)

      expect(config.target_dpi).to eq 1200
    end

    it 'accepts low DPI values' do
      config = described_class.new(target_dpi: 72)

      expect(config.target_dpi).to eq 72
    end
  end
end
