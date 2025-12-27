<?php

declare(strict_types=1);

namespace Kreuzberg\Tests\Unit;

use Kreuzberg\Types\Metadata\HeaderMetadata;
use Kreuzberg\Types\Metadata\HtmlMetadata;
use Kreuzberg\Types\Metadata\ImageMetadata;
use Kreuzberg\Types\Metadata\LinkMetadata;
use Kreuzberg\Types\Metadata\StructuredData;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * Comprehensive tests for PHP metadata types in the Kreuzberg library.
 *
 * Verifies the structure, creation, deserialization, and integration of:
 * - HtmlMetadata: Container for all HTML-related metadata
 * - HeaderMetadata: HTML header/heading information
 * - LinkMetadata: Hyperlink information
 * - ImageMetadata: Image metadata with dimensions and attributes
 * - StructuredData: Schema.org and other structured data
 */
#[CoversClass(HtmlMetadata::class)]
#[CoversClass(HeaderMetadata::class)]
#[CoversClass(LinkMetadata::class)]
#[CoversClass(ImageMetadata::class)]
#[CoversClass(StructuredData::class)]
final class MetadataTypesTest extends TestCase
{
    // ========================================
    // Class Structure Tests
    // ========================================

    #[Test]
    public function testHtmlMetadataStructure(): void
    {
        $metadata = new HtmlMetadata();

        // Verify all properties exist and have correct types
        $this->assertIsArray($metadata->keywords);
        $this->assertNull($metadata->canonicalUrl);
        $this->assertIsArray($metadata->openGraph);
        $this->assertIsArray($metadata->twitterCard);
        $this->assertNull($metadata->language);
        $this->assertNull($metadata->textDirection);
        $this->assertIsArray($metadata->metaTags);
        $this->assertIsArray($metadata->headers);
        $this->assertIsArray($metadata->links);
        $this->assertIsArray($metadata->images);
        $this->assertIsArray($metadata->structuredData);

        // Verify all arrays are empty by default
        $this->assertEmpty($metadata->keywords);
        $this->assertEmpty($metadata->openGraph);
        $this->assertEmpty($metadata->twitterCard);
        $this->assertEmpty($metadata->metaTags);
        $this->assertEmpty($metadata->headers);
        $this->assertEmpty($metadata->links);
        $this->assertEmpty($metadata->images);
        $this->assertEmpty($metadata->structuredData);
    }

    #[Test]
    public function testKeywordsIsArray(): void
    {
        // Verify keywords is an array of strings, not a string
        $keywords = ['seo', 'metadata', 'html'];
        $metadata = new HtmlMetadata(keywords: $keywords);

        $this->assertIsArray($metadata->keywords);
        $this->assertCount(3, $metadata->keywords);
        $this->assertSame('seo', $metadata->keywords[0]);
        $this->assertSame('metadata', $metadata->keywords[1]);
        $this->assertSame('html', $metadata->keywords[2]);
    }

    #[Test]
    public function testCanonicalUrlRenamed(): void
    {
        // Verify canonicalUrl property exists (not canonical)
        $canonicalUrl = 'https://example.com/page';
        $metadata = new HtmlMetadata(canonicalUrl: $canonicalUrl);

        $this->assertTrue(property_exists($metadata, 'canonicalUrl'));
        $this->assertSame($canonicalUrl, $metadata->canonicalUrl);
    }

    #[Test]
    public function testOpenGraphIsArray(): void
    {
        // Verify openGraph is array<string, string>
        $openGraph = [
            'og:title' => 'Page Title',
            'og:description' => 'Page Description',
            'og:image' => 'https://example.com/image.jpg',
        ];
        $metadata = new HtmlMetadata(openGraph: $openGraph);

        $this->assertIsArray($metadata->openGraph);
        $this->assertCount(3, $metadata->openGraph);
        $this->assertSame('Page Title', $metadata->openGraph['og:title']);
        $this->assertSame('Page Description', $metadata->openGraph['og:description']);
        $this->assertSame('https://example.com/image.jpg', $metadata->openGraph['og:image']);
    }

    #[Test]
    public function testTwitterCardIsArray(): void
    {
        // Verify twitterCard is array<string, string>
        $twitterCard = [
            'twitter:card' => 'summary_large_image',
            'twitter:title' => 'Tweet Title',
            'twitter:image' => 'https://example.com/twitter.jpg',
        ];
        $metadata = new HtmlMetadata(twitterCard: $twitterCard);

        $this->assertIsArray($metadata->twitterCard);
        $this->assertCount(3, $metadata->twitterCard);
        $this->assertSame('summary_large_image', $metadata->twitterCard['twitter:card']);
        $this->assertSame('Tweet Title', $metadata->twitterCard['twitter:title']);
    }

    // ========================================
    // Object Creation Tests
    // ========================================

    #[Test]
    public function testHeaderMetadataCreation(): void
    {
        $header = new HeaderMetadata(
            level: 1,
            text: 'Main Title',
            depth: 0,
            htmlOffset: 42,
            id: 'main-title',
        );

        $this->assertSame(1, $header->level);
        $this->assertSame('Main Title', $header->text);
        $this->assertSame(0, $header->depth);
        $this->assertSame(42, $header->htmlOffset);
        $this->assertSame('main-title', $header->id);
    }

    #[Test]
    public function testHeaderMetadataWithoutId(): void
    {
        $header = new HeaderMetadata(
            level: 2,
            text: 'Subheading',
            depth: 1,
            htmlOffset: 100,
        );

        $this->assertSame(2, $header->level);
        $this->assertSame('Subheading', $header->text);
        $this->assertNull($header->id);
    }

    #[Test]
    public function testLinkMetadataCreation(): void
    {
        $link = new LinkMetadata(
            href: 'https://example.com',
            text: 'Example Link',
            linkType: 'external',
            title: 'Visit Example',
            rel: ['noopener', 'noreferrer'],
            attributes: ['data-tracking' => 'link-1'],
        );

        $this->assertSame('https://example.com', $link->href);
        $this->assertSame('Example Link', $link->text);
        $this->assertSame('external', $link->linkType);
        $this->assertSame('Visit Example', $link->title);
        $this->assertIsArray($link->rel);
        $this->assertCount(2, $link->rel);
        $this->assertContains('noopener', $link->rel);
        $this->assertContains('noreferrer', $link->rel);
        $this->assertIsArray($link->attributes);
        $this->assertSame('link-1', $link->attributes['data-tracking']);
    }

    #[Test]
    public function testLinkMetadataDefaults(): void
    {
        $link = new LinkMetadata(
            href: '/about',
            text: 'About',
        );

        $this->assertSame('/about', $link->href);
        $this->assertSame('About', $link->text);
        $this->assertSame('other', $link->linkType);
        $this->assertNull($link->title);
        $this->assertEmpty($link->rel);
        $this->assertEmpty($link->attributes);
    }

    #[Test]
    public function testImageMetadataCreation(): void
    {
        $image = new ImageMetadata(
            src: 'https://example.com/image.jpg',
            imageType: 'external',
            alt: 'Example Image',
            title: 'Example',
            dimensions: [800, 600],
            attributes: ['loading' => 'lazy'],
        );

        $this->assertSame('https://example.com/image.jpg', $image->src);
        $this->assertSame('external', $image->imageType);
        $this->assertSame('Example Image', $image->alt);
        $this->assertSame('Example', $image->title);
        $this->assertIsArray($image->dimensions);
        $this->assertSame([800, 600], $image->dimensions);
        $this->assertSame('lazy', $image->attributes['loading']);
    }

    #[Test]
    public function testImageMetadataWithoutDimensions(): void
    {
        $image = new ImageMetadata(
            src: '/images/logo.png',
        );

        $this->assertSame('/images/logo.png', $image->src);
        $this->assertSame('external', $image->imageType);
        $this->assertNull($image->alt);
        $this->assertNull($image->title);
        $this->assertNull($image->dimensions);
        $this->assertEmpty($image->attributes);
    }

    #[Test]
    public function testStructuredDataCreation(): void
    {
        $structuredData = new StructuredData(
            dataType: 'application/ld+json',
            rawJson: '{"@context":"https://schema.org","@type":"Article"}',
            schemaType: 'Article',
        );

        $this->assertSame('application/ld+json', $structuredData->dataType);
        $this->assertSame('{"@context":"https://schema.org","@type":"Article"}', $structuredData->rawJson);
        $this->assertSame('Article', $structuredData->schemaType);
    }

    #[Test]
    public function testStructuredDataWithoutSchemaType(): void
    {
        $structuredData = new StructuredData(
            dataType: 'application/ld+json',
            rawJson: '{}',
        );

        $this->assertSame('application/ld+json', $structuredData->dataType);
        $this->assertSame('{}', $structuredData->rawJson);
        $this->assertNull($structuredData->schemaType);
    }

    // ========================================
    // Deserialization Tests
    // ========================================

    #[Test]
    public function testHtmlMetadataFromArray(): void
    {
        $data = [
            'keywords' => ['php', 'metadata', 'extraction'],
            'canonical_url' => 'https://example.com/article',
            'open_graph' => [
                'og:title' => 'Article Title',
                'og:type' => 'article',
            ],
            'twitter_card' => [
                'twitter:card' => 'summary',
            ],
            'language' => 'en',
            'text_direction' => 'ltr',
            'meta_tags' => [
                'viewport' => 'width=device-width, initial-scale=1',
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertSame(['php', 'metadata', 'extraction'], $metadata->keywords);
        $this->assertSame('https://example.com/article', $metadata->canonicalUrl);
        $this->assertCount(2, $metadata->openGraph);
        $this->assertSame('Article Title', $metadata->openGraph['og:title']);
        $this->assertCount(1, $metadata->twitterCard);
        $this->assertSame('en', $metadata->language);
        $this->assertSame('ltr', $metadata->textDirection);
        $this->assertCount(1, $metadata->metaTags);
    }

    #[Test]
    public function testHeaderMetadataDeserialization(): void
    {
        $data = [
            'headers' => [
                [
                    'level' => 1,
                    'text' => 'Title',
                    'depth' => 0,
                    'html_offset' => 10,
                    'id' => 'title',
                ],
                [
                    'level' => 2,
                    'text' => 'Section',
                    'depth' => 1,
                    'html_offset' => 50,
                ],
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertCount(2, $metadata->headers);
        $this->assertInstanceOf(HeaderMetadata::class, $metadata->headers[0]);
        $this->assertInstanceOf(HeaderMetadata::class, $metadata->headers[1]);

        $this->assertSame(1, $metadata->headers[0]->level);
        $this->assertSame('Title', $metadata->headers[0]->text);
        $this->assertSame('title', $metadata->headers[0]->id);

        $this->assertSame(2, $metadata->headers[1]->level);
        $this->assertSame('Section', $metadata->headers[1]->text);
        $this->assertNull($metadata->headers[1]->id);
    }

    #[Test]
    public function testLinkMetadataDeserialization(): void
    {
        $data = [
            'links' => [
                [
                    'href' => 'https://example.com',
                    'text' => 'Home',
                    'link_type' => 'navigation',
                    'title' => 'Go Home',
                    'rel' => ['home'],
                    'attributes' => ['data-nav' => 'true'],
                ],
                [
                    'href' => '/about',
                    'text' => 'About Us',
                    'link_type' => 'internal',
                ],
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertCount(2, $metadata->links);
        $this->assertInstanceOf(LinkMetadata::class, $metadata->links[0]);
        $this->assertInstanceOf(LinkMetadata::class, $metadata->links[1]);

        $this->assertSame('https://example.com', $metadata->links[0]->href);
        $this->assertSame('Home', $metadata->links[0]->text);
        $this->assertSame('navigation', $metadata->links[0]->linkType);
        $this->assertContains('home', $metadata->links[0]->rel);
        $this->assertSame('true', $metadata->links[0]->attributes['data-nav']);

        $this->assertSame('/about', $metadata->links[1]->href);
        $this->assertEmpty($metadata->links[1]->rel);
    }

    #[Test]
    public function testImageMetadataDeserialization(): void
    {
        $data = [
            'images' => [
                [
                    'src' => 'https://example.com/image1.jpg',
                    'image_type' => 'external',
                    'alt' => 'First Image',
                    'title' => 'Image 1',
                    'dimensions' => [1920, 1080],
                    'attributes' => ['data-lightbox' => 'gallery'],
                ],
                [
                    'src' => '/images/logo.png',
                    'image_type' => 'local',
                ],
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertCount(2, $metadata->images);
        $this->assertInstanceOf(ImageMetadata::class, $metadata->images[0]);
        $this->assertInstanceOf(ImageMetadata::class, $metadata->images[1]);

        $this->assertSame('https://example.com/image1.jpg', $metadata->images[0]->src);
        $this->assertSame('external', $metadata->images[0]->imageType);
        $this->assertSame('First Image', $metadata->images[0]->alt);
        $this->assertSame([1920, 1080], $metadata->images[0]->dimensions);
        $this->assertSame('gallery', $metadata->images[0]->attributes['data-lightbox']);

        $this->assertSame('/images/logo.png', $metadata->images[1]->src);
        $this->assertNull($metadata->images[1]->alt);
        $this->assertNull($metadata->images[1]->dimensions);
    }

    #[Test]
    public function testStructuredDataDeserialization(): void
    {
        $data = [
            'structured_data' => [
                [
                    'data_type' => 'application/ld+json',
                    'raw_json' => '{"@context":"https://schema.org","@type":"Article","headline":"Test"}',
                    'schema_type' => 'Article',
                ],
                [
                    'data_type' => 'microdata',
                    'raw_json' => '{"type":"Person"}',
                ],
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertCount(2, $metadata->structuredData);
        $this->assertInstanceOf(StructuredData::class, $metadata->structuredData[0]);
        $this->assertInstanceOf(StructuredData::class, $metadata->structuredData[1]);

        $this->assertSame('application/ld+json', $metadata->structuredData[0]->dataType);
        $this->assertStringContainsString('Article', $metadata->structuredData[0]->rawJson);
        $this->assertSame('Article', $metadata->structuredData[0]->schemaType);

        $this->assertSame('microdata', $metadata->structuredData[1]->dataType);
        $this->assertNull($metadata->structuredData[1]->schemaType);
    }

    // ========================================
    // Comprehensive Integration Tests
    // ========================================

    #[Test]
    public function testCompleteHtmlMetadataWithAllFields(): void
    {
        $data = [
            'keywords' => ['web', 'development', 'php'],
            'canonical_url' => 'https://example.com/post/123',
            'open_graph' => [
                'og:title' => 'Web Development Guide',
                'og:description' => 'A comprehensive guide to web development',
                'og:image' => 'https://example.com/og-image.jpg',
                'og:url' => 'https://example.com/post/123',
            ],
            'twitter_card' => [
                'twitter:card' => 'summary_large_image',
                'twitter:title' => 'Web Development Guide',
                'twitter:description' => 'A comprehensive guide',
                'twitter:image' => 'https://example.com/twitter-image.jpg',
            ],
            'language' => 'en',
            'text_direction' => 'ltr',
            'meta_tags' => [
                'viewport' => 'width=device-width, initial-scale=1.0',
                'charset' => 'utf-8',
            ],
            'headers' => [
                ['level' => 1, 'text' => 'Web Development', 'depth' => 0, 'html_offset' => 0, 'id' => 'web-dev'],
                ['level' => 2, 'text' => 'Getting Started', 'depth' => 1, 'html_offset' => 50, 'id' => 'getting-started'],
            ],
            'links' => [
                [
                    'href' => 'https://example.com/docs',
                    'text' => 'Documentation',
                    'link_type' => 'external',
                    'rel' => ['external'],
                ],
            ],
            'images' => [
                [
                    'src' => 'https://example.com/hero.jpg',
                    'image_type' => 'external',
                    'alt' => 'Hero Image',
                    'dimensions' => [1200, 600],
                ],
            ],
            'structured_data' => [
                [
                    'data_type' => 'application/ld+json',
                    'raw_json' => '{"@type":"Article"}',
                    'schema_type' => 'Article',
                ],
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        // Verify all fields are correctly deserialized
        $this->assertCount(3, $metadata->keywords);
        $this->assertSame('https://example.com/post/123', $metadata->canonicalUrl);
        $this->assertCount(4, $metadata->openGraph);
        $this->assertCount(4, $metadata->twitterCard);
        $this->assertSame('en', $metadata->language);
        $this->assertSame('ltr', $metadata->textDirection);
        $this->assertCount(2, $metadata->metaTags);
        $this->assertCount(2, $metadata->headers);
        $this->assertCount(1, $metadata->links);
        $this->assertCount(1, $metadata->images);
        $this->assertCount(1, $metadata->structuredData);
    }

    #[Test]
    public function testMetadataArrayWithOnlyRequiredFields(): void
    {
        $data = [
            'keywords' => [],
            'open_graph' => [],
            'twitter_card' => [],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        // All fields should have sensible defaults
        $this->assertEmpty($metadata->keywords);
        $this->assertNull($metadata->canonicalUrl);
        $this->assertEmpty($metadata->openGraph);
        $this->assertEmpty($metadata->twitterCard);
        $this->assertNull($metadata->language);
        $this->assertEmpty($metadata->headers);
        $this->assertEmpty($metadata->links);
        $this->assertEmpty($metadata->images);
        $this->assertEmpty($metadata->structuredData);
    }

    #[Test]
    public function testMetadataArrayWithMissingFields(): void
    {
        $data = [];

        $metadata = HtmlMetadata::fromArray($data);

        // Should handle missing fields gracefully
        $this->assertEmpty($metadata->keywords);
        $this->assertNull($metadata->canonicalUrl);
        $this->assertEmpty($metadata->openGraph);
        $this->assertEmpty($metadata->twitterCard);
        $this->assertNull($metadata->language);
        $this->assertNull($metadata->textDirection);
        $this->assertEmpty($metadata->metaTags);
        $this->assertEmpty($metadata->headers);
        $this->assertEmpty($metadata->links);
        $this->assertEmpty($metadata->images);
        $this->assertEmpty($metadata->structuredData);
    }

    // ========================================
    // Edge Cases and Validation Tests
    // ========================================

    #[Test]
    public function testMetadataEmptyHtml(): void
    {
        $data = [
            'keywords' => [],
            'open_graph' => [],
            'twitter_card' => [],
            'meta_tags' => [],
            'headers' => [],
            'links' => [],
            'images' => [],
            'structured_data' => [],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        // All collections should be empty
        $this->assertEmpty($metadata->keywords);
        $this->assertEmpty($metadata->openGraph);
        $this->assertEmpty($metadata->twitterCard);
        $this->assertEmpty($metadata->metaTags);
        $this->assertEmpty($metadata->headers);
        $this->assertEmpty($metadata->links);
        $this->assertEmpty($metadata->images);
        $this->assertEmpty($metadata->structuredData);
    }

    #[Test]
    public function testMetadataNullOptionalFields(): void
    {
        $data = [
            'canonical_url' => null,
            'language' => null,
            'text_direction' => null,
        ];

        $metadata = HtmlMetadata::fromArray($data);

        // Optional fields should be null
        $this->assertNull($metadata->canonicalUrl);
        $this->assertNull($metadata->language);
        $this->assertNull($metadata->textDirection);
    }

    #[Test]
    public function testMetadataEmptyCollections(): void
    {
        // Test handling of empty arrays that should remain empty
        $metadata = new HtmlMetadata(
            keywords: [],
            openGraph: [],
            twitterCard: [],
            metaTags: [],
            headers: [],
            links: [],
            images: [],
            structuredData: [],
        );

        // All should be empty arrays, not null
        $this->assertIsArray($metadata->keywords);
        $this->assertEmpty($metadata->keywords);
        $this->assertIsArray($metadata->openGraph);
        $this->assertEmpty($metadata->openGraph);
        $this->assertIsArray($metadata->twitterCard);
        $this->assertEmpty($metadata->twitterCard);
        $this->assertIsArray($metadata->metaTags);
        $this->assertEmpty($metadata->metaTags);
        $this->assertIsArray($metadata->headers);
        $this->assertEmpty($metadata->headers);
        $this->assertIsArray($metadata->links);
        $this->assertEmpty($metadata->links);
        $this->assertIsArray($metadata->images);
        $this->assertEmpty($metadata->images);
        $this->assertIsArray($metadata->structuredData);
        $this->assertEmpty($metadata->structuredData);
    }

    #[Test]
    public function testInvalidTypeHandlingInDeserialization(): void
    {
        // Test that fromArray handles non-array types gracefully
        $data = [
            'keywords' => 'not-an-array',  // Should be converted to empty array
            'open_graph' => 'string-value',  // Should be converted to empty array
            'twitter_card' => 123,  // Should be converted to empty array
            'meta_tags' => false,  // Should be converted to empty array
        ];

        $metadata = HtmlMetadata::fromArray($data);

        // Invalid types should be converted to empty arrays
        $this->assertIsArray($metadata->keywords);
        $this->assertEmpty($metadata->keywords);
        $this->assertIsArray($metadata->openGraph);
        $this->assertEmpty($metadata->openGraph);
        $this->assertIsArray($metadata->twitterCard);
        $this->assertEmpty($metadata->twitterCard);
        $this->assertIsArray($metadata->metaTags);
        $this->assertEmpty($metadata->metaTags);
    }

    #[Test]
    public function testNestedMetadataInvalidTypeHandling(): void
    {
        // Test handling of invalid nested data
        $data = [
            'headers' => 'not-an-array',
            'links' => 123,
            'images' => false,
            'structured_data' => null,
        ];

        $metadata = HtmlMetadata::fromArray($data);

        // Invalid nested types should result in empty arrays
        $this->assertIsArray($metadata->headers);
        $this->assertEmpty($metadata->headers);
        $this->assertIsArray($metadata->links);
        $this->assertEmpty($metadata->links);
        $this->assertIsArray($metadata->images);
        $this->assertEmpty($metadata->images);
        $this->assertIsArray($metadata->structuredData);
        $this->assertEmpty($metadata->structuredData);
    }

    #[Test]
    public function testHeaderMetadataWithVaryingLevels(): void
    {
        $headers = [
            new HeaderMetadata(level: 1, text: 'H1', depth: 0, htmlOffset: 0),
            new HeaderMetadata(level: 2, text: 'H2', depth: 1, htmlOffset: 10),
            new HeaderMetadata(level: 3, text: 'H3', depth: 2, htmlOffset: 20),
            new HeaderMetadata(level: 4, text: 'H4', depth: 3, htmlOffset: 30),
            new HeaderMetadata(level: 5, text: 'H5', depth: 4, htmlOffset: 40),
            new HeaderMetadata(level: 6, text: 'H6', depth: 5, htmlOffset: 50),
        ];

        $metadata = new HtmlMetadata(headers: $headers);

        $this->assertCount(6, $metadata->headers);
        foreach (range(1, 6) as $i) {
            $this->assertSame($i, $metadata->headers[$i - 1]->level);
        }
    }

    #[Test]
    public function testLinkMetadataWithMultipleRelValues(): void
    {
        $link = new LinkMetadata(
            href: 'https://example.com',
            text: 'External Link',
            rel: ['external', 'noopener', 'noreferrer', 'nofollow'],
        );

        $this->assertCount(4, $link->rel);
        $this->assertContains('external', $link->rel);
        $this->assertContains('noopener', $link->rel);
        $this->assertContains('noreferrer', $link->rel);
        $this->assertContains('nofollow', $link->rel);
    }

    #[Test]
    public function testImageMetadataVariousTypes(): void
    {
        $imageTypes = ['external', 'local', 'embedded', 'data-uri'];

        foreach ($imageTypes as $type) {
            $image = new ImageMetadata(
                src: 'image.jpg',
                imageType: $type,
            );
            $this->assertSame($type, $image->imageType);
        }
    }

    #[Test]
    public function testStructuredDataVariousFormats(): void
    {
        // Test different structured data formats
        $jsonLd = new StructuredData(
            dataType: 'application/ld+json',
            rawJson: '{"@context":"https://schema.org"}',
            schemaType: 'BlogPosting',
        );

        $microdata = new StructuredData(
            dataType: 'microdata',
            rawJson: '<div itemscope itemtype="https://schema.org/Person"></div>',
        );

        $microformat = new StructuredData(
            dataType: 'microformat',
            rawJson: '<a class="h-entry"><p class="p-name">Example</p></a>',
        );

        $this->assertSame('application/ld+json', $jsonLd->dataType);
        $this->assertSame('microdata', $microdata->dataType);
        $this->assertSame('microformat', $microformat->dataType);

        $this->assertSame('BlogPosting', $jsonLd->schemaType);
        $this->assertNull($microdata->schemaType);
        $this->assertNull($microformat->schemaType);
    }

    #[Test]
    public function testMultipleHeadersWithSameLevel(): void
    {
        $data = [
            'headers' => [
                ['level' => 2, 'text' => 'First Section', 'depth' => 1, 'html_offset' => 0],
                ['level' => 2, 'text' => 'Second Section', 'depth' => 1, 'html_offset' => 100],
                ['level' => 2, 'text' => 'Third Section', 'depth' => 1, 'html_offset' => 200],
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertCount(3, $metadata->headers);
        $this->assertSame('First Section', $metadata->headers[0]->text);
        $this->assertSame('Second Section', $metadata->headers[1]->text);
        $this->assertSame('Third Section', $metadata->headers[2]->text);

        foreach ($metadata->headers as $header) {
            $this->assertSame(2, $header->level);
            $this->assertSame(1, $header->depth);
        }
    }

    #[Test]
    public function testOpenGraphMinimalSet(): void
    {
        // Test with minimal OG tags
        $data = [
            'open_graph' => [
                'og:title' => 'Title',
                'og:type' => 'website',
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertCount(2, $metadata->openGraph);
        $this->assertArrayHasKey('og:title', $metadata->openGraph);
        $this->assertArrayHasKey('og:type', $metadata->openGraph);
    }

    #[Test]
    public function testTwitterCardMinimalSet(): void
    {
        // Test with minimal Twitter Card tags
        $data = [
            'twitter_card' => [
                'twitter:card' => 'summary',
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertCount(1, $metadata->twitterCard);
        $this->assertArrayHasKey('twitter:card', $metadata->twitterCard);
        $this->assertSame('summary', $metadata->twitterCard['twitter:card']);
    }

    #[Test]
    public function testConstructorPreservesAllValues(): void
    {
        $keywords = ['a', 'b', 'c'];
        $canonicalUrl = 'https://example.com';
        $openGraph = ['og:title' => 'Title'];
        $twitterCard = ['twitter:card' => 'summary'];
        $language = 'en';
        $textDirection = 'ltr';
        $metaTags = ['viewport' => 'width=device-width'];
        $headers = [new HeaderMetadata(1, 'Title', 0, 0)];
        $links = [new LinkMetadata('/', 'Home')];
        $images = [new ImageMetadata('/img.jpg')];
        $structuredData = [new StructuredData('application/ld+json', '{}')];

        $metadata = new HtmlMetadata(
            keywords: $keywords,
            canonicalUrl: $canonicalUrl,
            openGraph: $openGraph,
            twitterCard: $twitterCard,
            language: $language,
            textDirection: $textDirection,
            metaTags: $metaTags,
            headers: $headers,
            links: $links,
            images: $images,
            structuredData: $structuredData,
        );

        $this->assertSame($keywords, $metadata->keywords);
        $this->assertSame($canonicalUrl, $metadata->canonicalUrl);
        $this->assertSame($openGraph, $metadata->openGraph);
        $this->assertSame($twitterCard, $metadata->twitterCard);
        $this->assertSame($language, $metadata->language);
        $this->assertSame($textDirection, $metadata->textDirection);
        $this->assertSame($metaTags, $metadata->metaTags);
        $this->assertSame($headers, $metadata->headers);
        $this->assertSame($links, $metadata->links);
        $this->assertSame($images, $metadata->images);
        $this->assertSame($structuredData, $metadata->structuredData);
    }

    #[Test]
    public function testStringConversionForMissingIntFields(): void
    {
        // Test that fromArray properly converts string to int for integer fields
        $data = [
            'headers' => [
                [
                    'level' => '2',  // String that should be converted to int
                    'text' => 'Section',
                    'depth' => '1',  // String that should be converted to int
                    'html_offset' => '50',  // String that should be converted to int
                ],
            ],
        ];

        $metadata = HtmlMetadata::fromArray($data);

        $this->assertIsInt($metadata->headers[0]->level);
        $this->assertIsInt($metadata->headers[0]->depth);
        $this->assertIsInt($metadata->headers[0]->htmlOffset);
        $this->assertSame(2, $metadata->headers[0]->level);
        $this->assertSame(1, $metadata->headers[0]->depth);
        $this->assertSame(50, $metadata->headers[0]->htmlOffset);
    }

    #[Test]
    public function testArrayValuesPreservedInAttributes(): void
    {
        // Verify that complex attribute values are preserved correctly
        $attributes = [
            'data-config' => 'value1',
            'data-options' => 'value2',
            'class' => 'image-class',
            'id' => 'unique-id',
        ];

        $link = new LinkMetadata('/', 'Test', attributes: $attributes);

        $this->assertCount(4, $link->attributes);
        foreach ($attributes as $key => $value) {
            $this->assertArrayHasKey($key, $link->attributes);
            $this->assertSame($value, $link->attributes[$key]);
        }
    }
}
