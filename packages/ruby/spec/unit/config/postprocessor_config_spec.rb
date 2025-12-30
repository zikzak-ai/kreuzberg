# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::PostProcessor do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.enabled).to be true
      expect(config.enabled_processors).to be_nil
      expect(config.disabled_processors).to be_nil
    end

    it 'creates config with enabled true' do
      config = described_class.new(enabled: true)

      expect(config.enabled).to be true
    end

    it 'creates config with enabled false' do
      config = described_class.new(enabled: false)

      expect(config.enabled).to be false
    end

    it 'creates config with enabled_processors list' do
      config = described_class.new(
        enabled: true,
        enabled_processors: %w[quality formatting]
      )

      expect(config.enabled_processors).to eq %w[quality formatting]
    end

    it 'creates config with disabled_processors list' do
      config = described_class.new(
        enabled: true,
        disabled_processors: %w[token_reduction]
      )

      expect(config.disabled_processors).to eq %w[token_reduction]
    end

    it 'converts enabled_processors to strings' do
      config = described_class.new(enabled_processors: %i[quality formatting])

      expect(config.enabled_processors).to eq %w[quality formatting]
      expect(config.enabled_processors.all?(String)).to be true
    end

    it 'converts disabled_processors to strings' do
      config = described_class.new(disabled_processors: [:quality])

      expect(config.disabled_processors).to eq %w[quality]
      expect(config.disabled_processors.all?(String)).to be true
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

    it 'includes enabled_processors in hash when present' do
      config = described_class.new(enabled_processors: %w[quality])
      hash = config.to_h

      expect(hash[:enabled_processors]).to eq %w[quality]
    end

    it 'includes disabled_processors in hash when present' do
      config = described_class.new(disabled_processors: %w[token_reduction])
      hash = config.to_h

      expect(hash[:disabled_processors]).to eq %w[token_reduction]
    end

    it 'compacts nil values from hash' do
      config = described_class.new(enabled: true)
      hash = config.to_h

      expect(hash.key?(:enabled_processors)).to be false
      expect(hash.key?(:disabled_processors)).to be false
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

    it 'accepts enabled_processors list' do
      expect do
        described_class.new(enabled_processors: %w[quality formatting])
      end.not_to raise_error
    end

    it 'accepts disabled_processors list' do
      expect do
        described_class.new(disabled_processors: %w[token_reduction])
      end.not_to raise_error
    end

    it 'accepts both enabled and disabled processors' do
      expect do
        described_class.new(
          enabled_processors: %w[quality],
          disabled_processors: %w[formatting]
        )
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        enabled: true,
        enabled_processors: %w[quality],
        disabled_processors: %w[token_reduction]
      )

      expect(config.enabled).to be true
      expect(config.enabled_processors).to eq %w[quality]
      expect(config.disabled_processors).to eq %w[token_reduction]
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        enabled: true,
        enabled_processors: %w[quality]
      )
      config2 = described_class.new(
        enabled: true,
        enabled_processors: %w[quality]
      )

      expect(config1.enabled).to eq config2.enabled
      expect(config1.enabled_processors).to eq config2.enabled_processors
    end

    it 'detects differences in enabled' do
      config1 = described_class.new(enabled: true)
      config2 = described_class.new(enabled: false)

      expect(config1.enabled).not_to eq config2.enabled
    end

    it 'detects differences in enabled_processors' do
      config1 = described_class.new(enabled_processors: %w[quality])
      config2 = described_class.new(enabled_processors: %w[formatting])

      expect(config1.enabled_processors).not_to eq config2.enabled_processors
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      postprocessor = described_class.new(
        enabled: true,
        enabled_processors: %w[quality]
      )
      extraction = Kreuzberg::Config::Extraction.new(postprocessor: postprocessor)

      expect(extraction.postprocessor).to be_a described_class
      expect(extraction.postprocessor.enabled).to be true
      expect(extraction.postprocessor.enabled_processors).to eq %w[quality]
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        postprocessor: {
          enabled: true,
          enabled_processors: %w[quality formatting]
        }
      )

      expect(extraction.postprocessor).to be_a described_class
      expect(extraction.postprocessor.enabled).to be true
      expect(extraction.postprocessor.enabled_processors).to eq %w[quality formatting]
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol enabled_processors to strings' do
      config = described_class.new(enabled_processors: %i[quality formatting])

      expect(config.enabled_processors).to eq %w[quality formatting]
      expect(config.enabled_processors.all?(String)).to be true
    end

    it 'converts symbol disabled_processors to strings' do
      config = described_class.new(disabled_processors: [:token_reduction])

      expect(config.disabled_processors).to eq %w[token_reduction]
      expect(config.disabled_processors.all?(String)).to be true
    end
  end

  describe 'processor lists' do
    it 'stores empty enabled_processors list' do
      config = described_class.new(enabled_processors: [])

      expect(config.enabled_processors).to eq []
    end

    it 'stores single enabled_processor' do
      config = described_class.new(enabled_processors: %w[quality])

      expect(config.enabled_processors).to eq %w[quality]
    end

    it 'stores multiple enabled_processors' do
      processors = %w[quality formatting cleanup]
      config = described_class.new(enabled_processors: processors)

      expect(config.enabled_processors).to eq processors
    end

    it 'stores multiple disabled_processors' do
      processors = %w[token_reduction duplicate_removal]
      config = described_class.new(disabled_processors: processors)

      expect(config.disabled_processors).to eq processors
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

    it 'converts string true to true' do
      config = described_class.new(enabled: 'yes')

      expect(config.enabled).to be true
    end
  end

  describe 'default behavior' do
    it 'defaults to enabled' do
      config = described_class.new

      expect(config.enabled).to be true
    end

    it 'defaults to no specific processors' do
      config = described_class.new

      expect(config.enabled_processors).to be_nil
      expect(config.disabled_processors).to be_nil
    end

    it 'allows disabling while specifying processors' do
      config = described_class.new(
        enabled: false,
        enabled_processors: %w[quality]
      )

      expect(config.enabled).to be false
      expect(config.enabled_processors).to eq %w[quality]
    end
  end
end
