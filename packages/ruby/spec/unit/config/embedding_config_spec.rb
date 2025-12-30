# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::Embedding do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.model).to be_a Hash
      expect(config.model[:type]).to eq :preset
      expect(config.model[:name]).to eq 'balanced'
      expect(config.normalize).to be true
      expect(config.batch_size).to eq 32
      expect(config.show_download_progress).to be false
      expect(config.cache_dir).to be_nil
    end

    it 'creates config with custom model hash' do
      model = { type: :preset, name: 'fast' }
      config = described_class.new(model: model)

      expect(config.model[:type]).to eq :preset
      expect(config.model[:name]).to eq 'fast'
    end

    it 'creates config with custom values' do
      config = described_class.new(
        normalize: false,
        batch_size: 64,
        show_download_progress: true,
        cache_dir: '/cache'
      )

      expect(config.normalize).to be false
      expect(config.batch_size).to eq 64
      expect(config.show_download_progress).to be true
      expect(config.cache_dir).to eq '/cache'
    end

    it 'converts model with to_h method' do
      model_like = double(to_h: { type: :custom, name: 'model' })
      config = described_class.new(model: model_like)

      expect(config.model).to be_a Hash
      expect(config.model[:type]).to eq :custom
    end

    it 'converts batch_size to integer' do
      config = described_class.new(batch_size: '128')

      expect(config.batch_size).to eq 128
      expect(config.batch_size).to be_a Integer
    end

    it 'converts normalize to boolean' do
      config = described_class.new(normalize: 1)

      expect(config.normalize).to be true
    end

    it 'converts show_download_progress to boolean' do
      config = described_class.new(show_download_progress: 'yes')

      expect(config.show_download_progress).to be true
    end

    it 'converts cache_dir to string' do
      config = described_class.new(cache_dir: :default_cache)

      expect(config.cache_dir).to be_a String
    end
  end

  describe '#to_h' do
    it 'serializes to hash with all values' do
      config = described_class.new(
        model: { type: :preset, name: 'fast' },
        batch_size: 64
      )
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:model]).to be_a Hash
      expect(hash[:normalize]).to be true
      expect(hash[:batch_size]).to eq 64
    end

    it 'includes cache_dir when present' do
      config = described_class.new(cache_dir: '/cache')
      hash = config.to_h

      expect(hash[:cache_dir]).to eq '/cache'
    end

    it 'compacts nil values from hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.key?(:cache_dir)).to be false
    end

    it 'always includes model in hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.key?(:model)).to be true
      expect(hash[:model]).to be_a Hash
    end
  end

  describe 'validation' do
    it 'rejects invalid model type (not hash)' do
      expect do
        described_class.new(model: 'invalid_string')
      end.to raise_error ArgumentError, /model must be a Hash/
    end

    it 'accepts model as hash' do
      expect do
        described_class.new(model: { type: :preset, name: 'fast' })
      end.not_to raise_error
    end

    it 'accepts model with to_h method' do
      model_like = double(to_h: { type: :preset, name: 'fast' })
      expect do
        described_class.new(model: model_like)
      end.not_to raise_error
    end

    it 'accepts valid batch_size' do
      expect do
        described_class.new(batch_size: 32)
      end.not_to raise_error
    end

    it 'accepts valid cache_dir' do
      expect do
        described_class.new(cache_dir: '/tmp/cache')
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        model: { type: :preset, name: 'balanced' },
        normalize: true,
        batch_size: 48,
        show_download_progress: true,
        cache_dir: '/cache'
      )

      expect(config.model[:name]).to eq 'balanced'
      expect(config.normalize).to be true
      expect(config.batch_size).to eq 48
      expect(config.show_download_progress).to be true
      expect(config.cache_dir).to eq '/cache'
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        model: { type: :preset, name: 'fast' },
        batch_size: 64
      )
      config2 = described_class.new(
        model: { type: :preset, name: 'fast' },
        batch_size: 64
      )

      expect(config1.model).to eq config2.model
      expect(config1.batch_size).to eq config2.batch_size
    end

    it 'detects differences in model' do
      config1 = described_class.new(model: { type: :preset, name: 'fast' })
      config2 = described_class.new(model: { type: :preset, name: 'balanced' })

      expect(config1.model).not_to eq config2.model
    end

    it 'detects differences in batch_size' do
      config1 = described_class.new(batch_size: 32)
      config2 = described_class.new(batch_size: 64)

      expect(config1.batch_size).not_to eq config2.batch_size
    end

    it 'detects differences in normalize' do
      config1 = described_class.new(normalize: true)
      config2 = described_class.new(normalize: false)

      expect(config1.normalize).not_to eq config2.normalize
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Chunking config' do
      embedding = described_class.new(
        model: { type: :preset, name: 'fast' },
        batch_size: 64
      )
      chunking = Kreuzberg::Config::Chunking.new(embedding: embedding)

      expect(chunking.embedding).to be_a described_class
      expect(chunking.embedding.batch_size).to eq 64
    end

    it 'accepts hash in Chunking config' do
      chunking = Kreuzberg::Config::Chunking.new(
        embedding: { model: { type: :preset, name: 'balanced' } }
      )

      expect(chunking.embedding).to be_a described_class
      expect(chunking.embedding.model[:name]).to eq 'balanced'
    end

    it 'can be nested in Extraction config via Chunking' do
      extraction = Kreuzberg::Config::Extraction.new(
        chunking: { embedding: { batch_size: 48 } }
      )

      expect(extraction.chunking.embedding).to be_a described_class
      expect(extraction.chunking.embedding.batch_size).to eq 48
    end
  end

  describe 'symbol vs string key handling' do
    it 'normalizes model keys to symbols' do
      config = described_class.new(model: { 'type' => :preset, 'name' => 'fast' })

      expect(config.model).to be_a Hash
      expect(config.model[:type]).to eq :preset
    end

    it 'preserves symbol values in model' do
      config = described_class.new(model: { type: :preset })

      expect(config.model[:type]).to eq :preset
    end
  end

  describe 'boolean conversion' do
    it 'converts truthy normalize to true' do
      config = described_class.new(normalize: 1)

      expect(config.normalize).to be true
    end

    it 'converts false normalize to false' do
      config = described_class.new(normalize: false)

      expect(config.normalize).to be false
    end

    it 'converts truthy show_download_progress to true' do
      config = described_class.new(show_download_progress: 'yes')

      expect(config.show_download_progress).to be true
    end

    it 'converts false show_download_progress to false' do
      config = described_class.new(show_download_progress: false)

      expect(config.show_download_progress).to be false
    end
  end

  describe 'model configuration' do
    it 'accepts preset model type' do
      config = described_class.new(model: { type: :preset, name: 'fast' })

      expect(config.model[:type]).to eq :preset
    end

    it 'accepts custom model type' do
      config = described_class.new(model: { type: :custom, path: '/model' })

      expect(config.model[:type]).to eq :custom
    end

    it 'preserves model configuration details' do
      model = { type: :preset, name: 'balanced', dimensions: 384 }
      config = described_class.new(model: model)

      expect(config.model[:dimensions]).to eq 384
    end
  end

  describe 'batch size handling' do
    it 'defaults to 32' do
      config = described_class.new

      expect(config.batch_size).to eq 32
    end

    it 'accepts small batch sizes' do
      config = described_class.new(batch_size: 1)

      expect(config.batch_size).to eq 1
    end

    it 'accepts large batch sizes' do
      config = described_class.new(batch_size: 512)

      expect(config.batch_size).to eq 512
    end

    it 'converts string batch_size to integer' do
      config = described_class.new(batch_size: '256')

      expect(config.batch_size).to eq 256
      expect(config.batch_size).to be_a Integer
    end
  end

  describe 'cache directory' do
    it 'defaults to nil' do
      config = described_class.new

      expect(config.cache_dir).to be_nil
    end

    it 'accepts absolute paths' do
      config = described_class.new(cache_dir: '/var/cache/embeddings')

      expect(config.cache_dir).to eq '/var/cache/embeddings'
    end

    it 'accepts relative paths' do
      config = described_class.new(cache_dir: './cache')

      expect(config.cache_dir).to eq './cache'
    end

    it 'converts path to string' do
      config = described_class.new(cache_dir: :default_cache)

      expect(config.cache_dir).to be_a String
    end
  end
end
