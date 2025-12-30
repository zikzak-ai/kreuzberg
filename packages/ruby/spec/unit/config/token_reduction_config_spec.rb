# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::TokenReduction do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.mode).to eq 'off'
      expect(config.preserve_important_words).to be true
    end

    it 'creates config with custom mode' do
      config = described_class.new(mode: 'light')

      expect(config.mode).to eq 'light'
      expect(config.preserve_important_words).to be true
    end

    it 'creates config with custom preserve setting' do
      config = described_class.new(
        mode: 'aggressive',
        preserve_important_words: false
      )

      expect(config.mode).to eq 'aggressive'
      expect(config.preserve_important_words).to be false
    end

    it 'converts mode symbol to string' do
      config = described_class.new(mode: :moderate)

      expect(config.mode).to eq 'moderate'
      expect(config.mode).to be_a String
    end

    it 'converts preserve_important_words to boolean' do
      config = described_class.new(preserve_important_words: 1)

      expect(config.preserve_important_words).to be true
    end
  end

  describe '#to_h' do
    it 'serializes to hash with all values' do
      config = described_class.new(
        mode: 'light',
        preserve_important_words: false
      )
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:mode]).to eq 'light'
      expect(hash[:preserve_important_words]).to be false
    end

    it 'always includes all keys in hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.keys).to contain_exactly(:mode, :preserve_important_words)
    end
  end

  describe 'validation' do
    it 'accepts off mode' do
      expect do
        described_class.new(mode: 'off')
      end.not_to raise_error
    end

    it 'accepts light mode' do
      expect do
        described_class.new(mode: 'light')
      end.not_to raise_error
    end

    it 'accepts moderate mode' do
      expect do
        described_class.new(mode: 'moderate')
      end.not_to raise_error
    end

    it 'accepts aggressive mode' do
      expect do
        described_class.new(mode: 'aggressive')
      end.not_to raise_error
    end

    it 'accepts maximum mode' do
      expect do
        described_class.new(mode: 'maximum')
      end.not_to raise_error
    end

    it 'rejects invalid mode' do
      expect do
        described_class.new(mode: 'invalid_mode')
      end.to raise_error ArgumentError, /Invalid token reduction mode/
    end

    it 'lists valid modes in error message' do
      expect do
        described_class.new(mode: 'unknown')
      end.to raise_error ArgumentError, /off.*light.*moderate.*aggressive.*maximum/
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        mode: 'maximum',
        preserve_important_words: false
      )

      expect(config.mode).to eq 'maximum'
      expect(config.preserve_important_words).to be false
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(mode: 'light', preserve_important_words: true)
      config2 = described_class.new(mode: 'light', preserve_important_words: true)

      expect(config1.mode).to eq config2.mode
      expect(config1.preserve_important_words).to eq config2.preserve_important_words
    end

    it 'detects differences in mode' do
      config1 = described_class.new(mode: 'light')
      config2 = described_class.new(mode: 'aggressive')

      expect(config1.mode).not_to eq config2.mode
    end

    it 'detects differences in preserve_important_words' do
      config1 = described_class.new(preserve_important_words: true)
      config2 = described_class.new(preserve_important_words: false)

      expect(config1.preserve_important_words).not_to eq config2.preserve_important_words
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      token_reduction = described_class.new(mode: 'light')
      extraction = Kreuzberg::Config::Extraction.new(token_reduction: token_reduction)

      expect(extraction.token_reduction).to be_a described_class
      expect(extraction.token_reduction.mode).to eq 'light'
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        token_reduction: { mode: 'moderate', preserve_important_words: true }
      )

      expect(extraction.token_reduction).to be_a described_class
      expect(extraction.token_reduction.mode).to eq 'moderate'
      expect(extraction.token_reduction.preserve_important_words).to be true
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol mode to string' do
      config = described_class.new(mode: :aggressive)

      expect(config.mode).to eq 'aggressive'
      expect(config.mode).to be_a String
    end

    it 'accepts string mode' do
      config = described_class.new(mode: 'light')

      expect(config.mode).to eq 'light'
      expect(config.mode).to be_a String
    end
  end

  describe 'boolean conversion' do
    it 'converts truthy preserve_important_words to true' do
      config = described_class.new(preserve_important_words: 1)

      expect(config.preserve_important_words).to be true
    end

    it 'converts false preserve_important_words to false' do
      config = described_class.new(preserve_important_words: false)

      expect(config.preserve_important_words).to be false
    end

    it 'converts string yes to true' do
      config = described_class.new(preserve_important_words: 'yes')

      expect(config.preserve_important_words).to be true
    end
  end

  describe 'reduction modes' do
    it 'off mode disables reduction' do
      config = described_class.new(mode: 'off')

      expect(config.mode).to eq 'off'
    end

    it 'light mode provides light reduction' do
      config = described_class.new(mode: 'light')

      expect(config.mode).to eq 'light'
    end

    it 'moderate mode provides balanced reduction' do
      config = described_class.new(mode: 'moderate')

      expect(config.mode).to eq 'moderate'
    end

    it 'aggressive mode reduces more tokens' do
      config = described_class.new(mode: 'aggressive')

      expect(config.mode).to eq 'aggressive'
    end

    it 'maximum mode is most aggressive' do
      config = described_class.new(mode: 'maximum')

      expect(config.mode).to eq 'maximum'
    end
  end

  describe 'default behavior' do
    it 'defaults to off mode for safety' do
      config = described_class.new

      expect(config.mode).to eq 'off'
    end

    it 'defaults to preserving important words' do
      config = described_class.new

      expect(config.preserve_important_words).to be true
    end

    it 'can enable reduction with light mode' do
      config = described_class.new(mode: 'light')

      expect(config.mode).to eq 'light'
    end
  end
end
