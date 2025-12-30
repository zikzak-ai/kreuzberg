# frozen_string_literal: true

RSpec.describe Kreuzberg::Config::PageConfig do
  describe '#initialize' do
    it 'creates config with default values' do
      config = described_class.new

      expect(config.extract_pages).to be false
      expect(config.insert_page_markers).to be false
      expect(config.marker_format).to eq "\n\n<!-- PAGE {page_num} -->\n\n"
    end

    it 'creates config with custom values' do
      config = described_class.new(
        extract_pages: true,
        insert_page_markers: true,
        marker_format: '--- PAGE {page_num} ---'
      )

      expect(config.extract_pages).to be true
      expect(config.insert_page_markers).to be true
      expect(config.marker_format).to eq '--- PAGE {page_num} ---'
    end

    it 'converts boolean values' do
      config = described_class.new(
        extract_pages: true,
        insert_page_markers: false
      )

      expect(config.extract_pages).to be true
      expect(config.insert_page_markers).to be false
    end

    it 'converts marker_format to string' do
      config = described_class.new(marker_format: :default)

      expect(config.marker_format).to be_a String
    end
  end

  describe '#to_h' do
    it 'serializes to hash with all values' do
      config = described_class.new(extract_pages: true)
      hash = config.to_h

      expect(hash).to be_a Hash
      expect(hash[:extract_pages]).to be true
      expect(hash[:insert_page_markers]).to be false
      expect(hash[:marker_format]).to eq "\n\n<!-- PAGE {page_num} -->\n\n"
    end

    it 'always includes all keys in hash' do
      config = described_class.new
      hash = config.to_h

      expect(hash.keys).to contain_exactly(
        :extract_pages,
        :insert_page_markers,
        :marker_format
      )
    end
  end

  describe 'validation' do
    it 'accepts boolean extract_pages' do
      expect do
        described_class.new(extract_pages: true)
      end.not_to raise_error
    end

    it 'accepts boolean insert_page_markers' do
      expect do
        described_class.new(insert_page_markers: true)
      end.not_to raise_error
    end

    it 'accepts custom marker formats' do
      expect do
        described_class.new(marker_format: '===== PAGE {page_num} =====')
      end.not_to raise_error
    end
  end

  describe 'keyword arguments' do
    it 'accepts all keyword arguments' do
      config = described_class.new(
        extract_pages: true,
        insert_page_markers: true,
        marker_format: 'Page: {page_num}'
      )

      expect(config.extract_pages).to be true
      expect(config.insert_page_markers).to be true
      expect(config.marker_format).to eq 'Page: {page_num}'
    end
  end

  describe 'equality' do
    it 'compares configs by value' do
      config1 = described_class.new(
        extract_pages: true,
        insert_page_markers: true,
        marker_format: '--- PAGE {page_num} ---'
      )
      config2 = described_class.new(
        extract_pages: true,
        insert_page_markers: true,
        marker_format: '--- PAGE {page_num} ---'
      )

      expect(config1.extract_pages).to eq config2.extract_pages
      expect(config1.insert_page_markers).to eq config2.insert_page_markers
      expect(config1.marker_format).to eq config2.marker_format
    end

    it 'detects differences in extract_pages' do
      config1 = described_class.new(extract_pages: true)
      config2 = described_class.new(extract_pages: false)

      expect(config1.extract_pages).not_to eq config2.extract_pages
    end

    it 'detects differences in marker_format' do
      config1 = described_class.new(marker_format: 'Format A')
      config2 = described_class.new(marker_format: 'Format B')

      expect(config1.marker_format).not_to eq config2.marker_format
    end
  end

  describe 'nested config integration' do
    it 'can be nested in Extraction config' do
      pages = described_class.new(extract_pages: true)
      extraction = Kreuzberg::Config::Extraction.new(pages: pages)

      expect(extraction.pages).to be_a described_class
      expect(extraction.pages.extract_pages).to be true
    end

    it 'accepts hash in Extraction config' do
      extraction = Kreuzberg::Config::Extraction.new(
        pages: { extract_pages: true, insert_page_markers: true }
      )

      expect(extraction.pages).to be_a described_class
      expect(extraction.pages.extract_pages).to be true
      expect(extraction.pages.insert_page_markers).to be true
    end
  end

  describe 'marker format' do
    it 'preserves custom marker format' do
      format = '=== PAGE {page_num} ==='
      config = described_class.new(marker_format: format)

      expect(config.marker_format).to eq format
    end

    it 'preserves default marker format' do
      config = described_class.new

      expect(config.marker_format).to include '{page_num}'
    end

    it 'allows empty marker format' do
      config = described_class.new(marker_format: '')

      expect(config.marker_format).to eq ''
    end

    it 'handles multiline marker formats' do
      format = "\n--- PAGE {page_num} ---\n"
      config = described_class.new(marker_format: format)

      expect(config.marker_format).to eq format
    end
  end

  describe 'symbol vs string key handling' do
    it 'converts symbol values to strings' do
      config = described_class.new(marker_format: :default_format)

      expect(config.marker_format).to be_a String
    end

    it 'preserves string marker format' do
      format = 'Custom Format'
      config = described_class.new(marker_format: format)

      expect(config.marker_format).to eq format
      expect(config.marker_format).to be_a String
    end
  end

  describe 'boolean conversion' do
    it 'converts truthy extract_pages to true' do
      config = described_class.new(extract_pages: 1)

      expect(config.extract_pages).to be true
    end

    it 'converts false extract_pages to false' do
      config = described_class.new(extract_pages: false)

      expect(config.extract_pages).to be false
    end

    it 'converts truthy insert_page_markers to true' do
      config = described_class.new(insert_page_markers: 'yes')

      expect(config.insert_page_markers).to be true
    end

    it 'converts false insert_page_markers to false' do
      config = described_class.new(insert_page_markers: false)

      expect(config.insert_page_markers).to be false
    end
  end
end
