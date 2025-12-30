# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::Chunking do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.max_chars).to eq 1000
      expect(config.max_overlap).to eq 200
      expect(config.preset).to be_nil
      expect(config.embedding).to be_nil
      expect(config.enabled).to be true
    end

    it 'creates config with custom values' do
      config = described_class.new(
        max_chars: 500,
        max_overlap: 100,
        preset: 'fast'
      )

      expect(config.max_chars).to eq 500
      expect(config.max_overlap).to eq 100
      expect(config.preset).to eq 'fast'
    end

    it 'accepts chunk_size alias for max_chars' do
      config = described_class.new(chunk_size: 750)

      expect(config.max_chars).to eq 750
    end

    it 'accepts chunk_overlap alias for max_overlap' do
      config = described_class.new(chunk_overlap: 150)

      expect(config.max_overlap).to eq 150
    end

    it 'uses max_chars when both chunk_size and max_chars provided' do
      config = described_class.new(chunk_size: 500, max_chars: 1000)

      expect(config.max_chars).to eq 500
    end

    it 'accepts embedding as instance' do
      embedding = Kreuzberg::Config::Embedding.new(model: { type: :preset, name: 'fast' })
      config = described_class.new(embedding: embedding)

      expect(config.embedding).to be_a Kreuzberg::Config::Embedding
    end

    it 'converts embedding hash to instance' do
      config = described_class.new(embedding: { model: { type: :preset, name: 'balanced' } })

      expect(config.embedding).to be_a Kreuzberg::Config::Embedding
    end
  end

  describe '#to_h' do
    it 'serializes to hash with default values' do
      config = described_class.new
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:max_chars]).to eq 1000
      expect(hash[:max_overlap]).to eq 200
      expect(hash[:enabled]).to be true
    end

    it 'includes embedding in hash when present' do
      config = described_class.new(embedding: { model: { type: :preset, name: 'fast' } })
      hash = config.to_h

      expect(hash[:embedding]).to be_a Hash
    end

    it 'compacts nil values from hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.key?(:preset)).to be false
      expect(hash.key?(:embedding)).to be false
    end
  end

  describe 'validation' do
    it 'rejects negative max_chars' do
      expect do
        described_class.new(max_chars: -100)
      end.to raise_error ArgumentError, /max_chars must be a positive integer/
    end

    it 'rejects negative max_overlap' do
      expect do
        described_class.new(max_overlap: -50)
      end.to raise_error ArgumentError, /max_overlap must be a positive integer/
    end

    it 'accepts zero values' do
      expect do
        described_class.new(max_chars: 0, max_overlap: 0)
      end.not_to raise_error
    end

    it 'accepts positive values' do
      expect do
        described_class.new(max_chars: 2000, max_overlap: 500)
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        max_chars: 750,
        max_overlap: 150,
        preset: 'balanced',
        enabled: true
      )

      expect(config.max_chars).to eq 750
      expect(config.max_overlap).to eq 150
      expect(config.preset).to eq 'balanced'
      expect(config.enabled).to be true
    end

    it 'converts preset to string' do
      config = described_class.new(preset: :fast)

      expect(config.preset).to eq 'fast'
      expect(config.preset).to be_a String
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(max_chars: 500, max_overlap: 100)
      config2 = described_class.new(max_chars: 500, max_overlap: 100)

      expect(config1.max_chars).to eq config2.max_chars
      expect(config1.max_overlap).to eq config2.max_overlap
    end

    it 'detects differences' do
      config1 = described_class.new(max_chars: 500)
      config2 = described_class.new(max_chars: 1000)

      expect(config1.max_chars).not_to eq config2.max_chars
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      chunking = described_class.new(max_chars: 750, preset: 'fast')
      extraction = Kreuzberg::Config::Extraction.new(chunking: chunking)

      expect(extraction.chunking).to be_a described_class
      expect(extraction.chunking.max_chars).to eq 750
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        chunking: { max_chars: 500, preset: 'balanced' }
      )

      expect(extraction.chunking).to be_a described_class
      expect(extraction.chunking.max_chars).to eq 500
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol preset to string' do
      config = described_class.new(preset: :fast)

      expect(config.preset).to eq 'fast'
      expect(config.preset).to be_a String
    end

    it 'converts integer strings to integers' do
      config = described_class.new(max_chars: '1500', max_overlap: '300')

      expect(config.max_chars).to eq 1500
      expect(config.max_overlap).to eq 300
      expect(config.max_chars).to be_a Integer
    end
  end

  describe 'enabled field' do
    it 'defaults to true' do
      config = described_class.new

      expect(config.enabled).to be true
    end

    it 'accepts false' do
      config = described_class.new(enabled: false)

      expect(config.enabled).to be false
    end

    it 'converts truthy values to true' do
      config = described_class.new(enabled: 'yes')

      expect(config.enabled).to be true
    end

    it 'can be nil' do
      config = described_class.new(enabled: nil)

      expect(config.enabled).to be_nil
    end
  end
end
