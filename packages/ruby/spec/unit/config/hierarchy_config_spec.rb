# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::Hierarchy do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.enabled).to be true
      expect(config.k_clusters).to eq 6
      expect(config.include_bbox).to be true
      expect(config.ocr_coverage_threshold).to be_nil
    end

    it 'creates config with custom values' do
      config = described_class.new(
        enabled: false,
        k_clusters: 10,
        include_bbox: false,
        ocr_coverage_threshold: 0.95
      )

      expect(config.enabled).to be false
      expect(config.k_clusters).to eq 10
      expect(config.include_bbox).to be false
      expect(config.ocr_coverage_threshold).to eq 0.95
    end

    it 'converts k_clusters to integer' do
      config = described_class.new(k_clusters: '8')

      expect(config.k_clusters).to eq 8
      expect(config.k_clusters).to be_a Integer
    end

    it 'converts enabled to boolean' do
      config = described_class.new(enabled: 1)

      expect(config.enabled).to be true
    end

    it 'converts include_bbox to boolean' do
      config = described_class.new(include_bbox: false)

      expect(config.include_bbox).to be false
    end

    it 'converts ocr_coverage_threshold to float' do
      config = described_class.new(ocr_coverage_threshold: '0.85')

      expect(config.ocr_coverage_threshold).to eq 0.85
      expect(config.ocr_coverage_threshold).to be_a Float
    end
  end

  describe '#to_h' do
    it 'serializes to hash with all values' do
      config = described_class.new(
        enabled: true,
        k_clusters: 8,
        include_bbox: true
      )
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:enabled]).to be true
      expect(hash[:k_clusters]).to eq 8
      expect(hash[:include_bbox]).to be true
    end

    it 'includes ocr_coverage_threshold when present' do
      config = described_class.new(ocr_coverage_threshold: 0.9)
      hash = config.to_h

      expect(hash[:ocr_coverage_threshold]).to eq 0.9
    end

    it 'compacts nil values from hash' do
      config = described_class.new(enabled: true)
      hash = config.to_h

      expect(hash.key?(:ocr_coverage_threshold)).to be false
    end
  end

  describe '.from_h' do
    it 'creates from hash' do
      hash = { enabled: true, k_clusters: 8 }
      config = described_class.from_h(hash)

      expect(config).to be_a described_class
      expect(config.enabled).to be true
      expect(config.k_clusters).to eq 8
    end

    it 'returns nil for nil input' do
      config = described_class.from_h(nil)

      expect(config).to be_nil
    end

    it 'returns instance as-is' do
      original = described_class.new(k_clusters: 10)
      config = described_class.from_h(original)

      expect(config).to be original
    end

    it 'converts symbol keys in hash' do
      hash = { 'enabled' => true, 'k_clusters' => 8 }
      config = described_class.from_h(hash)

      expect(config.enabled).to be true
      expect(config.k_clusters).to eq 8
    end
  end

  describe 'validation' do
    it 'accepts valid k_clusters' do
      expect do
        described_class.new(k_clusters: 5)
      end.not_to raise_error
    end

    it 'accepts valid ocr_coverage_threshold' do
      expect do
        described_class.new(ocr_coverage_threshold: 0.8)
      end.not_to raise_error
    end

    it 'accepts enabled true' do
      expect do
        described_class.new(enabled: true)
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        enabled: false,
        k_clusters: 12,
        include_bbox: false,
        ocr_coverage_threshold: 0.75
      )

      expect(config.enabled).to be false
      expect(config.k_clusters).to eq 12
      expect(config.include_bbox).to be false
      expect(config.ocr_coverage_threshold).to eq 0.75
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        enabled: true,
        k_clusters: 8
      )
      config2 = described_class.new(
        enabled: true,
        k_clusters: 8
      )

      expect(config1.enabled).to eq config2.enabled
      expect(config1.k_clusters).to eq config2.k_clusters
    end

    it 'detects differences in enabled' do
      config1 = described_class.new(enabled: true)
      config2 = described_class.new(enabled: false)

      expect(config1.enabled).not_to eq config2.enabled
    end

    it 'detects differences in k_clusters' do
      config1 = described_class.new(k_clusters: 6)
      config2 = described_class.new(k_clusters: 10)

      expect(config1.k_clusters).not_to eq config2.k_clusters
    end

    it 'detects differences in ocr_coverage_threshold' do
      config1 = described_class.new(ocr_coverage_threshold: 0.8)
      config2 = described_class.new(ocr_coverage_threshold: 0.9)

      expect(config1.ocr_coverage_threshold).not_to eq config2.ocr_coverage_threshold
    end
  end

  describe 'nested config integration' do
    it 'can be nested in PDF config' do
      hierarchy = described_class.new(k_clusters: 8, enabled: true)
      pdf = Kreuzberg::Config::PDF.new(hierarchy: hierarchy)

      expect(pdf.hierarchy).to be_a described_class
      expect(pdf.hierarchy.k_clusters).to eq 8
      expect(pdf.hierarchy.enabled).to be true
    end

    it 'accepts hash in PDF config' do
      pdf = Kreuzberg::Config::PDF.new(
        hierarchy: { enabled: true, k_clusters: 10 }
      )

      expect(pdf.hierarchy).to be_a described_class
      expect(pdf.hierarchy.enabled).to be true
      expect(pdf.hierarchy.k_clusters).to eq 10
    end

    it 'can be nested in Extraction config via PDF' do
      extraction = Kreuzberg::Config::Extraction.new(
        pdf_options: { hierarchy: { k_clusters: 8 } }
      )

      expect(extraction.pdf_options.hierarchy).to be_a described_class
      expect(extraction.pdf_options.hierarchy.k_clusters).to eq 8
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol enabled to boolean' do
      config = described_class.new(enabled: true)

      expect(config.enabled).to be true
    end

    it 'converts k_clusters string to integer' do
      config = described_class.new(k_clusters: '12')

      expect(config.k_clusters).to eq 12
      expect(config.k_clusters).to be_a Integer
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

    it 'converts truthy include_bbox to true' do
      config = described_class.new(include_bbox: 'yes')

      expect(config.include_bbox).to be true
    end

    it 'converts false include_bbox to false' do
      config = described_class.new(include_bbox: false)

      expect(config.include_bbox).to be false
    end
  end

  describe 'k_clusters parameter' do
    it 'accepts small k_clusters' do
      config = described_class.new(k_clusters: 3)

      expect(config.k_clusters).to eq 3
    end

    it 'accepts large k_clusters' do
      config = described_class.new(k_clusters: 20)

      expect(config.k_clusters).to eq 20
    end

    it 'defaults to 6 clusters' do
      config = described_class.new

      expect(config.k_clusters).to eq 6
    end

    it 'converts string k_clusters to integer' do
      config = described_class.new(k_clusters: '15')

      expect(config.k_clusters).to eq 15
      expect(config.k_clusters).to be_a Integer
    end
  end

  describe 'ocr_coverage_threshold' do
    it 'accepts high threshold values' do
      config = described_class.new(ocr_coverage_threshold: 0.95)

      expect(config.ocr_coverage_threshold).to eq 0.95
    end

    it 'accepts low threshold values' do
      config = described_class.new(ocr_coverage_threshold: 0.1)

      expect(config.ocr_coverage_threshold).to eq 0.1
    end

    it 'accepts nil for threshold' do
      config = described_class.new(ocr_coverage_threshold: nil)

      expect(config.ocr_coverage_threshold).to be_nil
    end

    it 'converts string threshold to float' do
      config = described_class.new(ocr_coverage_threshold: '0.85')

      expect(config.ocr_coverage_threshold).to eq 0.85
      expect(config.ocr_coverage_threshold).to be_a Float
    end
  end
end
