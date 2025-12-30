# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::PDF do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.extract_images).to be false
      expect(config.passwords).to be_nil
      expect(config.extract_metadata).to be true
      expect(config.font_config).to be_nil
      expect(config.hierarchy).to be_nil
    end

    it 'creates config with custom values' do
      config = described_class.new(
        extract_images: true,
        passwords: %w[secret backup],
        extract_metadata: false
      )

      expect(config.extract_images).to be true
      expect(config.passwords).to eq %w[secret backup]
      expect(config.extract_metadata).to be false
    end

    it 'accepts passwords as single string' do
      config = described_class.new(passwords: 'secret')

      expect(config.passwords).to eq ['secret']
      expect(config.passwords).to be_a Array
    end

    it 'accepts passwords as array of strings' do
      config = described_class.new(passwords: %w[pwd1 pwd2 pwd3])

      expect(config.passwords).to eq %w[pwd1 pwd2 pwd3]
    end

    it 'converts passwords to strings' do
      config = described_class.new(passwords: [123, :symbol])

      expect(config.passwords).to eq %w[123 symbol]
      expect(config.passwords.all?(String)).to be true
    end

    it 'accepts font_config as instance' do
      font_config = Kreuzberg::Config::FontConfig.new(enabled: true)
      config = described_class.new(font_config: font_config)

      expect(config.font_config).to be_a Kreuzberg::Config::FontConfig
    end

    it 'converts font_config hash to instance' do
      config = described_class.new(font_config: { enabled: false })

      expect(config.font_config).to be_a Kreuzberg::Config::FontConfig
      expect(config.font_config.enabled).to be false
    end

    it 'accepts hierarchy as instance' do
      hierarchy = Kreuzberg::Config::Hierarchy.new(enabled: true)
      config = described_class.new(hierarchy: hierarchy)

      expect(config.hierarchy).to be_a Kreuzberg::Config::Hierarchy
    end

    it 'converts hierarchy hash to instance' do
      config = described_class.new(hierarchy: { enabled: true, k_clusters: 8 })

      expect(config.hierarchy).to be_a Kreuzberg::Config::Hierarchy
      expect(config.hierarchy.enabled).to be true
    end
  end

  describe '#to_h' do
    it 'serializes to hash with default values' do
      config = described_class.new
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:extract_images]).to be false
      expect(hash[:extract_metadata]).to be true
    end

    it 'includes passwords in hash when present' do
      config = described_class.new(passwords: %w[secret backup])
      hash = config.to_h

      expect(hash[:passwords]).to eq %w[secret backup]
    end

    it 'includes font_config in hash when present' do
      config = described_class.new(font_config: { enabled: true })
      hash = config.to_h

      expect(hash[:font_config]).to be_a Hash
    end

    it 'includes hierarchy in hash when present' do
      config = described_class.new(hierarchy: { enabled: true })
      hash = config.to_h

      expect(hash[:hierarchy]).to be_a Hash
    end

    it 'compacts nil values from hash' do
      config = described_class.new(extract_images: true)
      hash = config.to_h

      expect(hash.key?(:passwords)).to be false
      expect(hash.key?(:font_config)).to be false
    end
  end

  describe 'validation' do
    it 'rejects invalid font_config type' do
      expect do
        described_class.new(font_config: 'invalid')
      end.to raise_error ArgumentError, /Expected.*FontConfig.*Hash.*nil/
    end

    it 'rejects invalid hierarchy type' do
      expect do
        described_class.new(hierarchy: 'invalid')
      end.to raise_error ArgumentError, /Expected.*Hierarchy.*Hash.*nil/
    end

    it 'accepts valid boolean extract_images' do
      expect do
        described_class.new(extract_images: true)
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        extract_images: true,
        passwords: %w[pwd1 pwd2],
        extract_metadata: false,
        font_config: { enabled: true },
        hierarchy: { k_clusters: 10 }
      )

      expect(config.extract_images).to be true
      expect(config.passwords).to eq %w[pwd1 pwd2]
      expect(config.extract_metadata).to be false
      expect(config.font_config).to be_a Kreuzberg::Config::FontConfig
      expect(config.hierarchy).to be_a Kreuzberg::Config::Hierarchy
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        extract_images: true,
        extract_metadata: false
      )
      config2 = described_class.new(
        extract_images: true,
        extract_metadata: false
      )

      expect(config1.extract_images).to eq config2.extract_images
      expect(config1.extract_metadata).to eq config2.extract_metadata
    end

    it 'detects differences in extract_images' do
      config1 = described_class.new(extract_images: true)
      config2 = described_class.new(extract_images: false)

      expect(config1.extract_images).not_to eq config2.extract_images
    end

    it 'detects differences in passwords' do
      config1 = described_class.new(passwords: %w[pwd1])
      config2 = described_class.new(passwords: %w[pwd2])

      expect(config1.passwords).not_to eq config2.passwords
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      pdf = described_class.new(extract_images: true)
      extraction = Kreuzberg::Config::Extraction.new(pdf_options: pdf)

      expect(extraction.pdf_options).to be_a described_class
      expect(extraction.pdf_options.extract_images).to be true
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        pdf_options: { extract_images: true, passwords: ['secret'] }
      )

      expect(extraction.pdf_options).to be_a described_class
      expect(extraction.pdf_options.extract_images).to be true
      expect(extraction.pdf_options.passwords).to eq ['secret']
    end
  end

  describe 'font_config assignment' do
    it 'allows setting font_config after initialization' do
      config = described_class.new
      font_config = Kreuzberg::Config::FontConfig.new(enabled: true)
      config.font_config = font_config

      expect(config.font_config).to be_a Kreuzberg::Config::FontConfig
      expect(config.font_config.enabled).to be true
    end

    it 'converts hash to font_config instance on assignment' do
      config = described_class.new
      config.font_config = { enabled: false }

      expect(config.font_config).to be_a Kreuzberg::Config::FontConfig
      expect(config.font_config.enabled).to be false
    end
  end

  describe 'hierarchy assignment' do
    it 'allows setting hierarchy after initialization' do
      config = described_class.new
      hierarchy = Kreuzberg::Config::Hierarchy.new(enabled: true)
      config.hierarchy = hierarchy

      expect(config.hierarchy).to be_a Kreuzberg::Config::Hierarchy
      expect(config.hierarchy.enabled).to be true
    end

    it 'converts hash to hierarchy instance on assignment' do
      config = described_class.new
      config.hierarchy = { enabled: true, k_clusters: 6 }

      expect(config.hierarchy).to be_a Kreuzberg::Config::Hierarchy
      expect(config.hierarchy.enabled).to be true
    end
  end

  describe 'boolean conversion' do
    it 'converts truthy extract_images to true' do
      config = described_class.new(extract_images: 1)

      expect(config.extract_images).to be true
    end

    it 'converts false extract_images to false' do
      config = described_class.new(extract_images: false)

      expect(config.extract_images).to be false
    end

    it 'converts truthy extract_metadata to true' do
      config = described_class.new(extract_metadata: 'yes')

      expect(config.extract_metadata).to be true
    end

    it 'converts false extract_metadata to false' do
      config = described_class.new(extract_metadata: false)

      expect(config.extract_metadata).to be false
    end
  end
end
