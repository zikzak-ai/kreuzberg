# frozen_string_literal: true

require 'sorbet-runtime'

module Kreuzberg
  # Metadata for HTML documents
  #
  # @example
  #   result = Kreuzberg.extract_file_sync("page.html")
  #   metadata = result.metadata
  #   if metadata.is_a?(Kreuzberg::HtmlMetadata)
  #     puts metadata.title
  #     puts metadata.open_graph['og:image']
  #     metadata.headers.each { |h| puts "#{h.text} (level #{h.level})" }
  #   end
  #
  class HtmlMetadata < T::Struct
    extend T::Sig

    # Title of the HTML document
    const :title, T.nilable(String)

    # Description of the HTML document
    const :description, T.nilable(String)

    # Author of the document
    const :author, T.nilable(String)

    # Copyright information
    const :copyright, T.nilable(String)

    # Keywords associated with the document as an array of strings
    const :keywords, T::Array[String]

    # Canonical URL of the document
    const :canonical_url, T.nilable(String)

    # Language of the document (e.g., "en", "de")
    const :language, T.nilable(String)

    # Text direction (e.g., "ltr", "rtl")
    const :text_direction, T.nilable(String)

    # MIME type of the document
    const :mime_type, T.nilable(String)

    # Character encoding
    const :charset, T.nilable(String)

    # Generator (e.g., "Sphinx")
    const :generator, T.nilable(String)

    # Viewport configuration
    const :viewport, T.nilable(String)

    # Theme color
    const :theme_color, T.nilable(String)

    # Application name
    const :application_name, T.nilable(String)

    # Robots directive
    const :robots, T.nilable(String)

    # Open Graph metadata as a hash of key-value pairs
    # Common keys: og:title, og:description, og:image, og:url, og:type, og:site_name
    const :open_graph, T::Hash[String, String]

    # Twitter Card metadata as a hash of key-value pairs
    # Common keys: twitter:card, twitter:title, twitter:description, twitter:image, twitter:site, twitter:creator
    const :twitter_card, T::Hash[String, String]

    # Additional meta tags as a hash of key-value pairs
    const :meta_tags, T::Hash[String, String]

    # Array of headers/headings found in the document
    const :headers, T::Array[HeaderMetadata]

    # Array of links found in the document
    const :links, T::Array[LinkMetadata]

    # Array of images found in the document
    const :images, T::Array[ImageMetadata]

    # Array of structured data (JSON-LD, microdata, etc.)
    const :structured_data, T::Array[StructuredData]
  end

  # Header/Heading metadata
  #
  # Represents a heading element found in the HTML document
  #
  # @example
  #   header = Kreuzberg::HeaderMetadata.new(
  #     level: 1,
  #     text: "Main Title",
  #     id: "main-title",
  #     depth: 0,
  #     html_offset: 245
  #   )
  #   puts "#{header.text} (H#{header.level})"
  #
  class HeaderMetadata < T::Struct
    extend T::Sig

    # Heading level (1-6)
    const :level, Integer

    # Text content of the heading
    const :text, String

    # HTML ID attribute if present
    const :id, T.nilable(String)

    # Nesting depth in document structure
    const :depth, Integer

    # Byte offset in the original HTML
    const :html_offset, Integer
  end

  # Link metadata
  #
  # Represents a link element found in the HTML document
  #
  # @example
  #   link = Kreuzberg::LinkMetadata.new(
  #     href: "https://example.com",
  #     text: "Example",
  #     title: "Example Site",
  #     link_type: "external",
  #     rel: ["noopener", "noreferrer"],
  #     attributes: { "data-id" => "123" }
  #   )
  #   puts "#{link.text} -> #{link.href}"
  #
  class LinkMetadata < T::Struct
    extend T::Sig

    # URL the link points to
    const :href, String

    # Text content of the link
    const :text, String

    # Title attribute if present
    const :title, T.nilable(String)

    # Type of link (e.g., "internal", "external", "anchor")
    const :link_type, String

    # Rel attribute values
    const :rel, T::Array[String]

    # Additional HTML attributes
    const :attributes, T::Hash[String, String]
  end

  # Image metadata
  #
  # Represents an image element found in the HTML document
  #
  # @example
  #   image = Kreuzberg::ImageMetadata.new(
  #     src: "images/logo.png",
  #     alt: "Company Logo",
  #     title: nil,
  #     dimensions: [200, 100],
  #     image_type: "png",
  #     attributes: { "loading" => "lazy" }
  #   )
  #   if image.dimensions
  #     width, height = image.dimensions
  #     puts "#{width}x#{height}"
  #   end
  #
  class ImageMetadata < T::Struct
    extend T::Sig

    # Image source URL
    const :src, String

    # Alt text
    const :alt, T.nilable(String)

    # Title attribute
    const :title, T.nilable(String)

    # Image dimensions as [width, height], or nil if not available
    const :dimensions, T.nilable(T::Array[Integer])

    # Image type/format (e.g., "png", "jpg", "webp")
    const :image_type, String

    # Additional HTML attributes
    const :attributes, T::Hash[String, String]
  end

  # Structured data metadata
  #
  # Represents structured data (JSON-LD, microdata, etc.) found in the HTML document
  #
  # @example
  #   structured = Kreuzberg::StructuredData.new(
  #     data_type: "json-ld",
  #     raw_json: '{"@context":"https://schema.org","@type":"Article",...}',
  #     schema_type: "Article"
  #   )
  #   data = JSON.parse(structured.raw_json)
  #   puts data['@type']
  #
  class StructuredData < T::Struct
    extend T::Sig

    # Type of structured data (e.g., "json-ld", "microdata", "rdfa")
    const :data_type, String

    # Raw JSON representation of the structured data
    const :raw_json, String

    # Schema type if available (e.g., "Article", "Organization", "Person")
    const :schema_type, T.nilable(String)
  end
end
