# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::FontConfig do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.enabled).to be true
      expect(config.custom_font_dirs).to be_nil
    end

    it 'creates config with enabled false' do
      config = described_class.new(enabled: false)

      expect(config.enabled).to be false
    end

    it 'creates config with custom_font_dirs' do
      dirs = ['/usr/share/fonts', '/home/user/.fonts']
      config = described_class.new(custom_font_dirs: dirs)

      expect(config.custom_font_dirs).to eq dirs
    end

    it 'accepts single font directory as string' do
      config = described_class.new(custom_font_dirs: '/usr/share/fonts')

      expect(config.custom_font_dirs).to eq '/usr/share/fonts'
    end

    it 'accepts multiple directories as array' do
      dirs = ['/fonts1', '/fonts2', '/fonts3']
      config = described_class.new(custom_font_dirs: dirs)

      expect(config.custom_font_dirs).to eq dirs
    end

    it 'converts enabled to boolean' do
      config = described_class.new(enabled: 1)

      expect(config.enabled).to be true
    end
  end

  describe '#to_h' do
    it 'serializes to hash with default values' do
      config = described_class.new
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:enabled]).to be true
    end

    it 'includes custom_font_dirs when present' do
      dirs = ['/fonts']
      config = described_class.new(custom_font_dirs: dirs)
      hash = config.to_h

      expect(hash[:custom_font_dirs]).to eq dirs
    end

    it 'compacts nil values from hash' do
      config = described_class.new(enabled: true)
      hash = config.to_h

      expect(hash.key?(:custom_font_dirs)).to be false
    end

    it 'includes both keys when both are present' do
      config = described_class.new(
        enabled: true,
        custom_font_dirs: ['/fonts']
      )
      hash = config.to_h

      expect(hash.keys).to contain_exactly(:enabled, :custom_font_dirs)
    end
  end

  describe 'validation' do
    it 'accepts enabled true' do
      expect do
        described_class.new(enabled: true)
      end.not_to raise_error
    end

    it 'accepts enabled false' do
      expect do
        described_class.new(enabled: false)
      end.not_to raise_error
    end

    it 'accepts custom_font_dirs as string' do
      expect do
        described_class.new(custom_font_dirs: '/fonts')
      end.not_to raise_error
    end

    it 'accepts custom_font_dirs as array' do
      expect do
        described_class.new(custom_font_dirs: ['/fonts1', '/fonts2'])
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      dirs = ['/fonts']
      config = described_class.new(
        enabled: false,
        custom_font_dirs: dirs
      )

      expect(config.enabled).to be false
      expect(config.custom_font_dirs).to eq dirs
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        enabled: true,
        custom_font_dirs: ['/fonts']
      )
      config2 = described_class.new(
        enabled: true,
        custom_font_dirs: ['/fonts']
      )

      expect(config1.enabled).to eq config2.enabled
      expect(config1.custom_font_dirs).to eq config2.custom_font_dirs
    end

    it 'detects differences in enabled' do
      config1 = described_class.new(enabled: true)
      config2 = described_class.new(enabled: false)

      expect(config1.enabled).not_to eq config2.enabled
    end

    it 'detects differences in custom_font_dirs' do
      config1 = described_class.new(custom_font_dirs: ['/fonts1'])
      config2 = described_class.new(custom_font_dirs: ['/fonts2'])

      expect(config1.custom_font_dirs).not_to eq config2.custom_font_dirs
    end
  end

  describe 'nested config integration' do
    it 'can be nested in PDF config' do
      font_config = described_class.new(enabled: true, custom_font_dirs: ['/fonts'])
      pdf = Kreuzberg::Config::PDF.new(font_config: font_config)

      expect(pdf.font_config).to be_a described_class
      expect(pdf.font_config.enabled).to be true
      expect(pdf.font_config.custom_font_dirs).to eq ['/fonts']
    end

    it 'accepts hash in PDF config' do
      pdf = Kreuzberg::Config::PDF.new(
        font_config: { enabled: true, custom_font_dirs: ['/fonts'] }
      )

      expect(pdf.font_config).to be_a described_class
      expect(pdf.font_config.enabled).to be true
      expect(pdf.font_config.custom_font_dirs).to eq ['/fonts']
    end

    it 'can be nested in Extraction config via PDF' do
      extraction = Kreuzberg::Config::Extraction.new(
        pdf_options: { font_config: { enabled: true } }
      )

      expect(extraction.pdf_options.font_config).to be_a described_class
      expect(extraction.pdf_options.font_config.enabled).to be true
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol enabled to boolean' do
      config = described_class.new(enabled: true)

      expect(config.enabled).to be true
    end

    it 'preserves custom_font_dirs as array' do
      dirs = ['/fonts1', '/fonts2']
      config = described_class.new(custom_font_dirs: dirs)

      expect(config.custom_font_dirs).to eq dirs
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

    it 'converts string yes to true' do
      config = described_class.new(enabled: 'yes')

      expect(config.enabled).to be true
    end

    it 'converts nil to false' do
      config = described_class.new(enabled: nil)

      expect(config.enabled).to be false
    end
  end

  describe 'font directory handling' do
    it 'stores single directory path as string' do
      config = described_class.new(custom_font_dirs: '/usr/share/fonts')

      expect(config.custom_font_dirs).to eq '/usr/share/fonts'
    end

    it 'stores multiple directories as array' do
      dirs = ['/fonts1', '/fonts2', '/fonts3']
      config = described_class.new(custom_font_dirs: dirs)

      expect(config.custom_font_dirs).to eq dirs
      expect(config.custom_font_dirs).to be_a Array
    end

    it 'preserves exact directory paths' do
      dir = '/home/user/.local/share/fonts'
      config = described_class.new(custom_font_dirs: dir)

      expect(config.custom_font_dirs).to eq dir
    end

    it 'preserves array of directory paths' do
      dirs = ['/usr/share/fonts', '/home/user/.fonts', '~/.local/share/fonts']
      config = described_class.new(custom_font_dirs: dirs)

      expect(config.custom_font_dirs).to eq dirs
    end
  end

  describe 'mutability' do
    it 'allows modification of enabled' do
      config = described_class.new(enabled: true)
      config.enabled = false

      expect(config.enabled).to be false
    end

    it 'allows modification of custom_font_dirs' do
      config = described_class.new(custom_font_dirs: ['/fonts1'])
      config.custom_font_dirs = ['/fonts2']

      expect(config.custom_font_dirs).to eq ['/fonts2']
    end
  end

  describe 'default behavior' do
    it 'defaults to enabled' do
      config = described_class.new

      expect(config.enabled).to be true
    end

    it 'defaults to no custom font directories' do
      config = described_class.new

      expect(config.custom_font_dirs).to be_nil
    end

    it 'allows disabling font support' do
      config = described_class.new(enabled: false)

      expect(config.enabled).to be false
    end
  end
end
