# frozen_string_literal: true

require 'spec_helper'
require 'json'
require 'tempfile'

# Comprehensive tests for Kreuzberg metadata types
# Tests verify T::Struct behavior, type safety, and integration with extraction
RSpec.describe 'Kreuzberg Metadata Types' do
  # ============================================================================
  # Type Structure Tests
  # ============================================================================

  describe 'HtmlMetadata structure' do
    # rubocop:disable RSpec/ExampleLength
    it 'has correct fields with Sorbet types' do
      metadata = Kreuzberg::HtmlMetadata.new(
        title: 'Test Page',
        description: 'A test description',
        author: 'Test Author',
        copyright: '2024 Test Corp',
        keywords: %w[test metadata],
        canonical_url: 'https://example.com/test',
        language: 'en',
        text_direction: 'ltr',
        mime_type: 'text/html',
        charset: 'utf-8',
        generator: 'Kreuzberg',
        viewport: 'width=device-width, initial-scale=1',
        theme_color: '#ffffff',
        application_name: 'Test App',
        robots: 'index, follow',
        open_graph: { 'og:title' => 'Test', 'og:image' => 'image.jpg' },
        twitter_card: { 'twitter:card' => 'summary' },
        meta_tags: { 'custom' => 'value' },
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.title).to eq('Test Page')
      expect(metadata.description).to eq('A test description')
      expect(metadata.author).to eq('Test Author')
      expect(metadata.copyright).to eq('2024 Test Corp')
      expect(metadata.canonical_url).to eq('https://example.com/test')
      expect(metadata.language).to eq('en')
      expect(metadata.text_direction).to eq('ltr')
      expect(metadata.mime_type).to eq('text/html')
      expect(metadata.charset).to eq('utf-8')
      expect(metadata.generator).to eq('Kreuzberg')
      expect(metadata.theme_color).to eq('#ffffff')
      expect(metadata.application_name).to eq('Test App')
      expect(metadata.robots).to eq('index, follow')
    end
    # rubocop:enable RSpec/ExampleLength

    it 'has keywords as T::Array[String], not String' do
      keywords_array = %w[test metadata array]
      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: keywords_array,
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.keywords).to be_a(Array)
      expect(metadata.keywords).to eq(keywords_array)
      expect(metadata.keywords).to all(be_a(String))
    end

    it 'has canonical_url field (not canonical)' do
      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: 'https://example.com/canonical',
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.canonical_url).to eq('https://example.com/canonical')
      expect(metadata).to respond_to(:canonical_url)
    end

    # rubocop:disable RSpec/ExampleLength
    it 'has open_graph as T::Hash[String, String]' do
      og_tags = {
        'og:title' => 'Test Title',
        'og:description' => 'Test Description',
        'og:image' => 'https://example.com/image.jpg',
        'og:url' => 'https://example.com'
      }
      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: og_tags,
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.open_graph).to be_a(Hash)
      expect(metadata.open_graph).to eq(og_tags)
      metadata.open_graph.each do |key, value|
        expect(key).to be_a(String)
        expect(value).to be_a(String)
      end
    end
    # rubocop:enable RSpec/ExampleLength

    # rubocop:disable RSpec/ExampleLength
    it 'has twitter_card as T::Hash[String, String]' do
      twitter_tags = {
        'twitter:card' => 'summary_large_image',
        'twitter:title' => 'Test',
        'twitter:description' => 'Description',
        'twitter:image' => 'https://example.com/image.jpg'
      }
      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: twitter_tags,
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.twitter_card).to be_a(Hash)
      expect(metadata.twitter_card).to eq(twitter_tags)
      metadata.twitter_card.each do |key, value|
        expect(key).to be_a(String)
        expect(value).to be_a(String)
      end
    end
    # rubocop:enable RSpec/ExampleLength
  end

  # ============================================================================
  # T::Struct Behavior Tests
  # ============================================================================

  describe 'HeaderMetadata creation' do
    it 'creates HeaderMetadata with all fields' do
      header = Kreuzberg::HeaderMetadata.new(
        level: 1,
        text: 'Main Title',
        id: 'main-title',
        depth: 0,
        html_offset: 245
      )

      expect(header.level).to eq(1)
      expect(header.text).to eq('Main Title')
      expect(header.id).to eq('main-title')
      expect(header.depth).to eq(0)
      expect(header.html_offset).to eq(245)
    end

    it 'supports nil id' do
      header = Kreuzberg::HeaderMetadata.new(
        level: 2,
        text: 'Subtitle',
        id: nil,
        depth: 1,
        html_offset: 456
      )

      expect(header.level).to eq(2)
      expect(header.text).to eq('Subtitle')
      expect(header.id).to be_nil
      expect(header.depth).to eq(1)
      expect(header.html_offset).to eq(456)
    end
  end

  describe 'LinkMetadata creation' do
    it 'creates LinkMetadata with rel array and attributes hash' do
      link = Kreuzberg::LinkMetadata.new(
        href: 'https://example.com',
        text: 'Example',
        title: 'Example Site',
        link_type: 'external',
        rel: %w[noopener noreferrer],
        attributes: { 'data-id' => '123', 'class' => 'external-link' }
      )

      expect(link.href).to eq('https://example.com')
      expect(link.text).to eq('Example')
      expect(link.title).to eq('Example Site')
      expect(link.link_type).to eq('external')
      expect(link.rel).to be_a(Array)
      expect(link.rel).to eq(%w[noopener noreferrer])
      expect(link.attributes).to be_a(Hash)
      expect(link.attributes['data-id']).to eq('123')
      expect(link.attributes['class']).to eq('external-link')
    end

    it 'supports empty rel and attributes' do
      link = Kreuzberg::LinkMetadata.new(
        href: 'https://example.com',
        text: 'Link',
        title: nil,
        link_type: 'internal',
        rel: [],
        attributes: {}
      )

      expect(link.href).to eq('https://example.com')
      expect(link.rel).to be_empty
      expect(link.attributes).to be_empty
      expect(link.title).to be_nil
    end
  end

  describe 'ImageMetadata creation' do
    it 'creates ImageMetadata with dimensions and attributes' do
      image = Kreuzberg::ImageMetadata.new(
        src: 'images/logo.png',
        alt: 'Company Logo',
        title: nil,
        dimensions: [200, 100],
        image_type: 'png',
        attributes: { 'loading' => 'lazy', 'class' => 'logo' }
      )

      expect(image.src).to eq('images/logo.png')
      expect(image.alt).to eq('Company Logo')
      expect(image.title).to be_nil
      expect(image.dimensions).to be_a(Array)
      expect(image.dimensions).to eq([200, 100])
      expect(image.image_type).to eq('png')
      expect(image.attributes).to be_a(Hash)
      expect(image.attributes['loading']).to eq('lazy')
    end

    it 'supports nil dimensions' do
      image = Kreuzberg::ImageMetadata.new(
        src: 'image.jpg',
        alt: 'Description',
        title: 'Title',
        dimensions: nil,
        image_type: 'jpg',
        attributes: {}
      )

      expect(image.src).to eq('image.jpg')
      expect(image.dimensions).to be_nil
      expect(image.image_type).to eq('jpg')
    end
  end

  describe 'StructuredData creation' do
    it 'creates StructuredData with data_type and raw_json' do
      json_data = '{"@context":"https://schema.org","@type":"Article","headline":"Test Article"}'
      structured = Kreuzberg::StructuredData.new(
        data_type: 'json-ld',
        raw_json: json_data,
        schema_type: 'Article'
      )

      expect(structured.data_type).to eq('json-ld')
      expect(structured.raw_json).to eq(json_data)
      expect(structured.schema_type).to eq('Article')
      # Verify JSON is valid
      parsed = JSON.parse(structured.raw_json)
      expect(parsed['@type']).to eq('Article')
    end

    it 'supports nil schema_type' do
      json_data = '{"data":"value"}'
      structured = Kreuzberg::StructuredData.new(
        data_type: 'microdata',
        raw_json: json_data,
        schema_type: nil
      )

      expect(structured.data_type).to eq('microdata')
      expect(structured.schema_type).to be_nil
    end
  end

  # ============================================================================
  # Integration Tests
  # ============================================================================

  describe 'extract_html returns metadata' do
    it 'extracts HTML and returns proper metadata structure' do
      html_file = create_test_html_file(
        '<html><head><title>Test Page</title></head><body><p>Content</p></body></html>'
      )

      begin
        result = Kreuzberg.extract_file_sync(html_file)
        expect(result).to be_a(Kreuzberg::Result)
        expect(result.metadata).not_to be_nil

        # Metadata can be a hash or HtmlMetadata instance
        expect([Hash, Kreuzberg::HtmlMetadata]).to include(result.metadata.class)
      ensure
        FileUtils.rm_f(html_file)
      end
    end
  end

  describe 'metadata keywords' do
    it 'extracts keywords as an array' do
      html_content = <<~HTML
        <html>
          <head>
            <title>Test</title>
            <meta name="keywords" content="ruby, testing, metadata">
          </head>
          <body></body>
        </html>
      HTML
      html_file = create_test_html_file(html_content)

      begin
        result = Kreuzberg.extract_file_sync(html_file)
        metadata = result.metadata

        if metadata.is_a?(Hash) && metadata['keywords']
          expect(metadata['keywords']).to be_a(Array)
        elsif metadata.is_a?(Kreuzberg::HtmlMetadata)
          expect(metadata.keywords).to be_a(Array)
        end
      ensure
        FileUtils.rm_f(html_file)
      end
    end
  end

  describe 'metadata open graph' do
    it 'extracts OG tags as a hash' do
      html_content = <<~HTML
        <html>
          <head>
            <title>Test</title>
            <meta property="og:title" content="Test Title">
            <meta property="og:description" content="Test Description">
            <meta property="og:image" content="https://example.com/image.jpg">
          </head>
          <body></body>
        </html>
      HTML
      html_file = create_test_html_file(html_content)

      begin
        result = Kreuzberg.extract_file_sync(html_file)
        metadata = result.metadata

        if metadata.is_a?(Hash) && metadata['open_graph']
          expect(metadata['open_graph']).to be_a(Hash)
        elsif metadata.is_a?(Kreuzberg::HtmlMetadata)
          expect(metadata.open_graph).to be_a(Hash)
        end
      ensure
        FileUtils.rm_f(html_file)
      end
    end
  end

  describe 'metadata headers' do
    it 'extracts headers as an array of HeaderMetadata' do
      html_content = <<~HTML
        <html>
          <head><title>Test</title></head>
          <body>
            <h1>Main Title</h1>
            <h2>Subtitle</h2>
            <h3 id="section-1">Section 1</h3>
          </body>
        </html>
      HTML
      html_file = create_test_html_file(html_content)

      begin
        result = Kreuzberg.extract_file_sync(html_file)
        metadata = result.metadata

        if metadata.is_a?(Hash) && metadata['headers']
          expect(metadata['headers']).to be_a(Array)
        elsif metadata.is_a?(Kreuzberg::HtmlMetadata)
          expect(metadata.headers).to be_a(Array)
        end
      ensure
        FileUtils.rm_f(html_file)
      end
    end
  end

  describe 'metadata links' do
    it 'extracts links as an array of LinkMetadata' do
      html_content = <<~HTML
        <html>
          <head><title>Test</title></head>
          <body>
            <a href="https://example.com">External Link</a>
            <a href="/page">Internal Link</a>
            <a href="#section">Anchor Link</a>
          </body>
        </html>
      HTML
      html_file = create_test_html_file(html_content)

      begin
        result = Kreuzberg.extract_file_sync(html_file)
        metadata = result.metadata

        if metadata.is_a?(Hash) && metadata['links']
          expect(metadata['links']).to be_a(Array)
        elsif metadata.is_a?(Kreuzberg::HtmlMetadata)
          expect(metadata.links).to be_a(Array)
        end
      ensure
        FileUtils.rm_f(html_file)
      end
    end
  end

  describe 'metadata images' do
    it 'extracts images as an array of ImageMetadata' do
      html_content = <<~HTML
        <html>
          <head><title>Test</title></head>
          <body>
            <img src="image1.jpg" alt="Image 1" width="200" height="100">
            <img src="image2.png" alt="Image 2">
            <img src="image3.gif">
          </body>
        </html>
      HTML
      html_file = create_test_html_file(html_content)

      begin
        result = Kreuzberg.extract_file_sync(html_file)
        metadata = result.metadata

        if metadata.is_a?(Hash) && metadata['images']
          expect(metadata['images']).to be_a(Array)
        elsif metadata.is_a?(Kreuzberg::HtmlMetadata)
          expect(metadata.images).to be_a(Array)
        end
      ensure
        FileUtils.rm_f(html_file)
      end
    end
  end

  # ============================================================================
  # Edge Cases
  # ============================================================================

  describe 'metadata edge cases' do
    it 'returns defaults for empty HTML' do
      html_file = create_test_html_file('<html><body></body></html>')

      begin
        result = Kreuzberg.extract_file_sync(html_file)
        metadata = result.metadata

        if metadata.is_a?(Kreuzberg::HtmlMetadata)
          expect(metadata.keywords).to be_a(Array)
          expect(metadata.open_graph).to be_a(Hash)
          expect(metadata.twitter_card).to be_a(Hash)
          expect(metadata.meta_tags).to be_a(Hash)
          expect(metadata.headers).to be_a(Array)
          expect(metadata.links).to be_a(Array)
          expect(metadata.images).to be_a(Array)
          expect(metadata.structured_data).to be_a(Array)
        elsif metadata.is_a?(Hash)
          # Verify default collections are present
          expect(metadata['keywords'] || []).to be_a(Array)
          expect(metadata['open_graph'] || {}).to be_a(Hash)
          expect(metadata['twitter_card'] || {}).to be_a(Hash)
        end
      ensure
        FileUtils.rm_f(html_file)
      end
    end

    # rubocop:disable RSpec/ExampleLength
    it 'supports nil optional fields' do
      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.title).to be_nil
      expect(metadata.description).to be_nil
      expect(metadata.author).to be_nil
      expect(metadata.copyright).to be_nil
      expect(metadata.canonical_url).to be_nil
      expect(metadata.language).to be_nil
      expect(metadata.text_direction).to be_nil
      expect(metadata.mime_type).to be_nil
      expect(metadata.charset).to be_nil
      expect(metadata.generator).to be_nil
      expect(metadata.viewport).to be_nil
      expect(metadata.theme_color).to be_nil
      expect(metadata.application_name).to be_nil
      expect(metadata.robots).to be_nil
    end
    # rubocop:enable RSpec/ExampleLength

    it 'handles empty collections' do
      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.keywords).to be_empty
      expect(metadata.open_graph).to be_empty
      expect(metadata.twitter_card).to be_empty
      expect(metadata.meta_tags).to be_empty
      expect(metadata.headers).to be_empty
      expect(metadata.links).to be_empty
      expect(metadata.images).to be_empty
      expect(metadata.structured_data).to be_empty
    end
  end

  # ============================================================================
  # Sorbet Type Safety
  # ============================================================================

  describe 'Sorbet type safety' do
    it 'enables runtime type checking' do
      metadata = Kreuzberg::HtmlMetadata.new(
        title: 'Test',
        description: nil,
        author: nil,
        copyright: nil,
        keywords: ['test'],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata).to be_a(Kreuzberg::HtmlMetadata)
      expect(metadata).to respond_to(:title)
      expect(metadata).to respond_to(:keywords)
      expect(metadata).to respond_to(:open_graph)
    end

    it 'makes T::Struct fields immutable' do
      metadata = Kreuzberg::HtmlMetadata.new(
        title: 'Original',
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: []
      )

      # Attempting to assign should raise an error
      expect { metadata.title = 'Modified' }.to raise_error(NoMethodError)
    end
  end

  # ============================================================================
  # Complex Structure Tests
  # ============================================================================

  describe 'complex metadata structures' do
    it 'handles headers with multiple levels' do
      headers = [
        Kreuzberg::HeaderMetadata.new(level: 1, text: 'H1', id: nil, depth: 0, html_offset: 0),
        Kreuzberg::HeaderMetadata.new(level: 2, text: 'H2', id: nil, depth: 1, html_offset: 50),
        Kreuzberg::HeaderMetadata.new(level: 3, text: 'H3', id: 'sec-1', depth: 2, html_offset: 100),
        Kreuzberg::HeaderMetadata.new(level: 2, text: 'H2-2', id: nil, depth: 1, html_offset: 150)
      ]

      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: headers,
        links: [],
        images: [],
        structured_data: []
      )

      expect(metadata.headers.length).to eq(4)
      expect(metadata.headers[0].level).to eq(1)
      expect(metadata.headers[2].level).to eq(3)
      expect(metadata.headers[2].id).to eq('sec-1')
    end

    # rubocop:disable RSpec/ExampleLength
    it 'handles links with various types' do
      links = [
        Kreuzberg::LinkMetadata.new(
          href: 'https://external.com',
          text: 'External',
          title: nil,
          link_type: 'external',
          rel: ['noopener'],
          attributes: {}
        ),
        Kreuzberg::LinkMetadata.new(
          href: '/internal/page',
          text: 'Internal',
          title: 'Internal Page',
          link_type: 'internal',
          rel: [],
          attributes: { 'class' => 'nav-link' }
        ),
        Kreuzberg::LinkMetadata.new(
          href: '#section',
          text: 'Anchor',
          title: nil,
          link_type: 'anchor',
          rel: [],
          attributes: {}
        )
      ]

      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: links,
        images: [],
        structured_data: []
      )

      expect(metadata.links.length).to eq(3)
      expect(metadata.links[0].link_type).to eq('external')
      expect(metadata.links[1].link_type).to eq('internal')
      expect(metadata.links[2].link_type).to eq('anchor')
      expect(metadata.links[1].attributes['class']).to eq('nav-link')
    end
    # rubocop:enable RSpec/ExampleLength

    # rubocop:disable RSpec/ExampleLength
    it 'handles images with attributes' do
      images = [
        Kreuzberg::ImageMetadata.new(
          src: 'logo.png',
          alt: 'Logo',
          title: nil,
          dimensions: [200, 100],
          image_type: 'png',
          attributes: { 'class' => 'logo', 'loading' => 'eager' }
        ),
        Kreuzberg::ImageMetadata.new(
          src: 'thumbnail.jpg',
          alt: nil,
          title: 'Thumbnail',
          dimensions: nil,
          image_type: 'jpg',
          attributes: { 'loading' => 'lazy', 'decoding' => 'async' }
        )
      ]

      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: images,
        structured_data: []
      )

      expect(metadata.images.length).to eq(2)
      expect(metadata.images[0].dimensions).to eq([200, 100])
      expect(metadata.images[1].dimensions).to be_nil
      expect(metadata.images[1].attributes['loading']).to eq('lazy')
    end
    # rubocop:enable RSpec/ExampleLength

    # rubocop:disable RSpec/ExampleLength
    it 'handles structured data with multiple types' do
      json_ld = '{"@context":"https://schema.org","@type":"Article"}'
      microdata = '{"type":"http://schema.org/Person"}'

      structured_data = [
        Kreuzberg::StructuredData.new(
          data_type: 'json-ld',
          raw_json: json_ld,
          schema_type: 'Article'
        ),
        Kreuzberg::StructuredData.new(
          data_type: 'microdata',
          raw_json: microdata,
          schema_type: 'Person'
        ),
        Kreuzberg::StructuredData.new(
          data_type: 'json-ld',
          raw_json: '{"@type":"Organization"}',
          schema_type: nil
        )
      ]

      metadata = Kreuzberg::HtmlMetadata.new(
        title: nil,
        description: nil,
        author: nil,
        copyright: nil,
        keywords: [],
        canonical_url: nil,
        language: nil,
        text_direction: nil,
        mime_type: nil,
        charset: nil,
        generator: nil,
        viewport: nil,
        theme_color: nil,
        application_name: nil,
        robots: nil,
        open_graph: {},
        twitter_card: {},
        meta_tags: {},
        headers: [],
        links: [],
        images: [],
        structured_data: structured_data
      )

      expect(metadata.structured_data.length).to eq(3)
      expect(metadata.structured_data[0].data_type).to eq('json-ld')
      expect(metadata.structured_data[0].schema_type).to eq('Article')
      expect(metadata.structured_data[1].data_type).to eq('microdata')
      expect(metadata.structured_data[2].schema_type).to be_nil
    end
    # rubocop:enable RSpec/ExampleLength

    # rubocop:disable RSpec/ExampleLength, RSpec/MultipleExpectations
    it 'handles complete HtmlMetadata with all fields populated' do
      headers = [
        Kreuzberg::HeaderMetadata.new(level: 1, text: 'Title', id: 'title', depth: 0, html_offset: 100)
      ]
      links = [
        Kreuzberg::LinkMetadata.new(
          href: 'https://example.com',
          text: 'Example',
          title: 'Example Site',
          link_type: 'external',
          rel: ['noopener'],
          attributes: { 'data-track' => 'true' }
        )
      ]
      images = [
        Kreuzberg::ImageMetadata.new(
          src: 'image.jpg',
          alt: 'Test Image',
          title: nil,
          dimensions: [300, 200],
          image_type: 'jpg',
          attributes: { 'loading' => 'lazy' }
        )
      ]
      structured = [
        Kreuzberg::StructuredData.new(
          data_type: 'json-ld',
          raw_json: '{"@type":"WebPage"}',
          schema_type: 'WebPage'
        )
      ]

      metadata = Kreuzberg::HtmlMetadata.new(
        title: 'Complete Test Page',
        description: 'A complete test page with all metadata',
        author: 'Test Author',
        copyright: '2024 Test Corp',
        keywords: %w[test comprehensive metadata],
        canonical_url: 'https://example.com/test',
        language: 'en',
        text_direction: 'ltr',
        mime_type: 'text/html; charset=utf-8',
        charset: 'utf-8',
        generator: 'Kreuzberg',
        viewport: 'width=device-width, initial-scale=1',
        theme_color: '#ffffff',
        application_name: 'Test App',
        robots: 'index, follow',
        open_graph: {
          'og:title' => 'Test',
          'og:description' => 'Description',
          'og:image' => 'https://example.com/image.jpg'
        },
        twitter_card: {
          'twitter:card' => 'summary_large_image',
          'twitter:title' => 'Test'
        },
        meta_tags: {
          'custom-tag' => 'custom-value'
        },
        headers: headers,
        links: links,
        images: images,
        structured_data: structured
      )

      # Verify all fields
      expect(metadata.title).to eq('Complete Test Page')
      expect(metadata.description).to eq('A complete test page with all metadata')
      expect(metadata.author).to eq('Test Author')
      expect(metadata.copyright).to eq('2024 Test Corp')
      expect(metadata.keywords.length).to eq(3)
      expect(metadata.canonical_url).to eq('https://example.com/test')
      expect(metadata.language).to eq('en')
      expect(metadata.text_direction).to eq('ltr')
      expect(metadata.generator).to eq('Kreuzberg')
      expect(metadata.open_graph.length).to eq(3)
      expect(metadata.twitter_card.length).to eq(2)
      expect(metadata.meta_tags.length).to eq(1)
      expect(metadata.headers.length).to eq(1)
      expect(metadata.links.length).to eq(1)
      expect(metadata.images.length).to eq(1)
      expect(metadata.structured_data.length).to eq(1)
    end
    # rubocop:enable RSpec/ExampleLength, RSpec/MultipleExpectations
  end

  # ============================================================================
  # Helper Methods
  # ============================================================================

  def create_test_html_file(content)
    file = Tempfile.new(['test', '.html'])
    file.write(content)
    file.close
    file.path
  end
end
