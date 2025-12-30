# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::Keywords do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.algorithm).to be_nil
      expect(config.max_keywords).to be_nil
      expect(config.min_score).to be_nil
      expect(config.ngram_range).to be_nil
      expect(config.language).to be_nil
      expect(config.yake_params).to be_nil
      expect(config.rake_params).to be_nil
    end

    it 'creates config with custom values' do
      config = described_class.new(
        algorithm: 'yake',
        max_keywords: 10,
        min_score: 0.5,
        ngram_range: [1, 3],
        language: 'en'
      )

      expect(config.algorithm).to eq 'yake'
      expect(config.max_keywords).to eq 10
      expect(config.min_score).to eq 0.5
      expect(config.ngram_range).to eq [1, 3]
      expect(config.language).to eq 'en'
    end

    it 'accepts yake_params as instance' do
      yake_params = Kreuzberg::Config::KeywordYakeParams.new(window_size: 3)
      config = described_class.new(yake_params: yake_params)

      expect(config.yake_params).to be_a Kreuzberg::Config::KeywordYakeParams
      expect(config.yake_params.window_size).to eq 3
    end

    it 'converts yake_params hash to instance' do
      config = described_class.new(yake_params: { window_size: 2 })

      expect(config.yake_params).to be_a Kreuzberg::Config::KeywordYakeParams
      expect(config.yake_params.window_size).to eq 2
    end

    it 'accepts rake_params as instance' do
      rake_params = Kreuzberg::Config::KeywordRakeParams.new(min_word_length: 3)
      config = described_class.new(rake_params: rake_params)

      expect(config.rake_params).to be_a Kreuzberg::Config::KeywordRakeParams
    end

    it 'converts rake_params hash to instance' do
      config = described_class.new(rake_params: { min_word_length: 2 })

      expect(config.rake_params).to be_a Kreuzberg::Config::KeywordRakeParams
      expect(config.rake_params.min_word_length).to eq 2
    end
  end

  describe '#to_h' do
    it 'serializes to hash' do
      config = described_class.new(algorithm: 'yake', max_keywords: 10)
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:algorithm]).to eq 'yake'
      expect(hash[:max_keywords]).to eq 10
    end

    it 'includes nested params in hash' do
      config = described_class.new(
        algorithm: 'yake',
        yake_params: { window_size: 3 }
      )
      hash = config.to_h

      expect(hash[:yake_params]).to be_a Hash
      expect(hash[:yake_params][:window_size]).to eq 3
    end

    it 'compacts nil values from hash' do
      config = described_class.new(algorithm: 'rake')
      hash = config.to_h

      expect(hash.key?(:max_keywords)).to be false
      expect(hash.key?(:yake_params)).to be false
    end
  end

  describe 'validation' do
    it 'accepts valid algorithm names' do
      expect do
        described_class.new(algorithm: 'yake')
      end.not_to raise_error
    end

    it 'accepts valid max_keywords' do
      expect do
        described_class.new(max_keywords: 20)
      end.not_to raise_error
    end

    it 'raises error for invalid yake_params type' do
      expect do
        described_class.new(yake_params: 'invalid')
      end.to raise_error ArgumentError, /Expected.*KeywordYakeParams.*Hash.*nil/
    end

    it 'raises error for invalid rake_params type' do
      expect do
        described_class.new(rake_params: 'invalid')
      end.to raise_error ArgumentError, /Expected.*KeywordRakeParams.*Hash.*nil/
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        algorithm: 'yake',
        max_keywords: 15,
        min_score: 0.7,
        ngram_range: [1, 2],
        language: 'fr',
        yake_params: { window_size: 3 }
      )

      expect(config.algorithm).to eq 'yake'
      expect(config.max_keywords).to eq 15
      expect(config.min_score).to eq 0.7
      expect(config.ngram_range).to eq [1, 2]
      expect(config.language).to eq 'fr'
      expect(config.yake_params).to be_a Kreuzberg::Config::KeywordYakeParams
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(algorithm: 'yake', max_keywords: 10)
      config2 = described_class.new(algorithm: 'yake', max_keywords: 10)

      expect(config1.algorithm).to eq config2.algorithm
      expect(config1.max_keywords).to eq config2.max_keywords
    end

    it 'detects differences in algorithm' do
      config1 = described_class.new(algorithm: 'yake')
      config2 = described_class.new(algorithm: 'rake')

      expect(config1.algorithm).not_to eq config2.algorithm
    end

    it 'detects differences in max_keywords' do
      config1 = described_class.new(max_keywords: 10)
      config2 = described_class.new(max_keywords: 20)

      expect(config1.max_keywords).not_to eq config2.max_keywords
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      keywords = described_class.new(algorithm: 'yake', max_keywords: 15)
      extraction = Kreuzberg::Config::Extraction.new(keywords: keywords)

      expect(extraction.keywords).to be_a described_class
      expect(extraction.keywords.algorithm).to eq 'yake'
      expect(extraction.keywords.max_keywords).to eq 15
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        keywords: { algorithm: 'rake', max_keywords: 10 }
      )

      expect(extraction.keywords).to be_a described_class
      expect(extraction.keywords.algorithm).to eq 'rake'
      expect(extraction.keywords.max_keywords).to eq 10
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol algorithm to string' do
      config = described_class.new(algorithm: :yake)

      expect(config.algorithm).to eq 'yake'
      expect(config.algorithm).to be_a String
    end

    it 'converts symbol language to string' do
      config = described_class.new(language: :eng)

      expect(config.language).to eq 'eng'
      expect(config.language).to be_a String
    end

    it 'converts ngram_range values to integers' do
      config = described_class.new(ngram_range: %w[1 3])

      expect(config.ngram_range).to eq [1, 3]
      expect(config.ngram_range.all?(Integer)).to be true
    end
  end

  describe 'parameter conversions' do
    it 'converts max_keywords to integer' do
      config = described_class.new(max_keywords: '20')

      expect(config.max_keywords).to eq 20
      expect(config.max_keywords).to be_a Integer
    end

    it 'converts min_score to float' do
      config = described_class.new(min_score: '0.75')

      expect(config.min_score).to eq 0.75
      expect(config.min_score).to be_a Float
    end

    it 'converts ngram_range to array of integers' do
      config = described_class.new(ngram_range: [1, 2])

      expect(config.ngram_range).to eq [1, 2]
      expect(config.ngram_range.all?(Integer)).to be true
    end
  end
end
