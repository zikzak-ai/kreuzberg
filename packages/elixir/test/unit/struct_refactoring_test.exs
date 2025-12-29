defmodule KreuzbergTest.Unit.StructRefactoringTest do
  @moduledoc """
  Tests for the Elixir struct refactoring to use proper idiomatic types.

  Validates that ExtractionResult and nested types properly use structs
  instead of raw maps, ensuring type safety and idiomatic Elixir code.
  """

  use ExUnit.Case

  describe "Metadata struct" do
    test "creates metadata struct from map" do
      map = %{
        "title" => "Report 2024",
        "author" => "John Doe",
        "page_count" => 10,
        "created_date" => "2024-01-15T10:30:00Z"
      }

      metadata = Kreuzberg.Metadata.from_map(map)

      assert metadata.title == "Report 2024"
      assert metadata.author == "John Doe"
      assert metadata.page_count == 10
      assert metadata.created_date == "2024-01-15T10:30:00Z"
      assert is_struct(metadata, Kreuzberg.Metadata)
    end

    test "converts metadata struct to map" do
      metadata = %Kreuzberg.Metadata{
        title: "Report",
        page_count: 5,
        author: "Jane"
      }

      map = Kreuzberg.Metadata.to_map(metadata)

      assert map["title"] == "Report"
      assert map["page_count"] == 5
      assert map["author"] == "Jane"
      assert is_map(map)
    end

    test "handles empty metadata struct" do
      metadata = %Kreuzberg.Metadata{}

      assert metadata.title == nil
      assert metadata.page_count == nil
      assert is_struct(metadata, Kreuzberg.Metadata)
    end
  end

  describe "Table struct" do
    test "creates table struct from map" do
      map = %{
        "cells" => [["A", "B"], ["1", "2"]],
        "headers" => ["A", "B"],
        "markdown" => "| A | B |\n|---|---|\n| 1 | 2 |"
      }

      table = Kreuzberg.Table.from_map(map)

      assert table.cells == [["A", "B"], ["1", "2"]]
      assert table.headers == ["A", "B"]
      assert table.markdown =~ "|"
      assert is_struct(table, Kreuzberg.Table)
    end

    test "converts table struct to map" do
      table = %Kreuzberg.Table{
        cells: [["X", "Y"]],
        headers: ["X", "Y"]
      }

      map = Kreuzberg.Table.to_map(table)

      assert map["cells"] == [["X", "Y"]]
      assert map["headers"] == ["X", "Y"]
    end

    test "calculates row and column counts" do
      table = %Kreuzberg.Table{
        cells: [["A", "B"], ["1", "2"], ["3", "4"]]
      }

      assert Kreuzberg.Table.row_count(table) == 3
      assert Kreuzberg.Table.column_count(table) == 2
    end

    test "handles empty table" do
      table = %Kreuzberg.Table{}

      assert Kreuzberg.Table.row_count(table) == 0
      assert Kreuzberg.Table.column_count(table) == 0
    end
  end

  describe "Chunk struct" do
    test "creates chunk struct with new/2" do
      chunk = Kreuzberg.Chunk.new("chunk text", embedding: [0.1, 0.2], metadata: %{"page" => 1})

      assert chunk.text == "chunk text"
      assert chunk.embedding == [0.1, 0.2]
      assert chunk.metadata == %{"page" => 1}
      assert is_struct(chunk, Kreuzberg.Chunk)
    end

    test "creates chunk from map" do
      map = %{
        "text" => "content",
        "embedding" => [0.3, 0.4, 0.5],
        "token_count" => 15
      }

      chunk = Kreuzberg.Chunk.from_map(map)

      assert chunk.text == "content"
      assert chunk.embedding == [0.3, 0.4, 0.5]
      assert chunk.token_count == 15
    end

    test "converts chunk to map" do
      chunk = %Kreuzberg.Chunk{
        text: "text",
        embedding: [0.1, 0.2]
      }

      map = Kreuzberg.Chunk.to_map(chunk)

      assert map["text"] == "text"
      assert map["embedding"] == [0.1, 0.2]
    end
  end

  describe "Image struct" do
    test "creates image struct with new/2" do
      image = Kreuzberg.Image.new("png", width: 1024, height: 768, dpi: 150)

      assert image.format == "png"
      assert image.width == 1024
      assert image.height == 768
      assert image.dpi == 150
      assert is_struct(image, Kreuzberg.Image)
    end

    test "creates image from map" do
      map = %{
        "format" => "jpeg",
        "width" => 1920,
        "height" => 1080,
        "ocr_text" => "extracted text"
      }

      image = Kreuzberg.Image.from_map(map)

      assert image.format == "jpeg"
      assert image.width == 1920
      assert image.ocr_text == "extracted text"
    end

    test "converts image to map" do
      image = %Kreuzberg.Image{
        format: "webp",
        width: 800
      }

      map = Kreuzberg.Image.to_map(image)

      assert map["format"] == "webp"
      assert map["width"] == 800
    end

    test "checks if image has data" do
      image_with_data = %Kreuzberg.Image{
        format: "png",
        data: <<137, 80, 78, 71>>
      }

      image_without_data = %Kreuzberg.Image{format: "png"}

      assert Kreuzberg.Image.has_data?(image_with_data)
      refute Kreuzberg.Image.has_data?(image_without_data)
    end

    test "calculates aspect ratio" do
      image = %Kreuzberg.Image{width: 1920, height: 1080}

      ratio = Kreuzberg.Image.aspect_ratio(image)

      assert is_float(ratio)
      assert abs(ratio - 1.777) < 0.01
    end

    test "returns nil for aspect ratio without dimensions" do
      image = %Kreuzberg.Image{format: "png"}

      assert Kreuzberg.Image.aspect_ratio(image) == nil
    end
  end

  describe "Page struct" do
    test "creates page struct with new/3" do
      page = Kreuzberg.Page.new(1, "Page content", width: 8.5, height: 11.0)

      assert page.number == 1
      assert page.content == "Page content"
      assert page.width == 8.5
      assert page.height == 11.0
      assert is_struct(page, Kreuzberg.Page)
    end

    test "creates page from map" do
      map = %{
        "number" => 2,
        "content" => "page text",
        "width" => 8.5,
        "height" => 11.0
      }

      page = Kreuzberg.Page.from_map(map)

      assert page.number == 2
      assert page.content == "page text"
    end

    test "converts page to map" do
      page = %Kreuzberg.Page{
        number: 3,
        content: "content"
      }

      map = Kreuzberg.Page.to_map(page)

      assert map["number"] == 3
      assert map["content"] == "content"
    end

    test "returns page size as tuple" do
      page = %Kreuzberg.Page{width: 8.5, height: 11.0}

      size = Kreuzberg.Page.size(page)

      assert size == {8.5, 11.0}
    end

    test "returns nil for size without dimensions" do
      page = %Kreuzberg.Page{number: 1}

      assert Kreuzberg.Page.size(page) == nil
    end
  end

  describe "ExtractionResult struct with nested structs" do
    test "creates result with struct fields" do
      metadata = %Kreuzberg.Metadata{title: "Report"}
      table = %Kreuzberg.Table{headers: ["Col1", "Col2"]}

      result = Kreuzberg.ExtractionResult.new(
        "content",
        "application/pdf",
        metadata,
        [table]
      )

      assert result.content == "content"
      assert result.mime_type == "application/pdf"
      assert is_struct(result.metadata, Kreuzberg.Metadata)
      assert result.metadata.title == "Report"
      assert length(result.tables) == 1
      assert is_struct(Enum.at(result.tables, 0), Kreuzberg.Table)
    end

    test "converts maps to structs automatically" do
      metadata_map = %{"title" => "Report", "page_count" => 5}
      table_map = %{"cells" => [["A", "B"]]}

      result = Kreuzberg.ExtractionResult.new(
        "text",
        "text/plain",
        metadata_map,
        [table_map]
      )

      assert is_struct(result.metadata, Kreuzberg.Metadata)
      assert result.metadata.title == "Report"
      assert is_struct(Enum.at(result.tables, 0), Kreuzberg.Table)
    end

    test "normalizes chunks to structs" do
      chunk_map = %{"text" => "chunk", "embedding" => [0.1, 0.2]}

      result = Kreuzberg.ExtractionResult.new(
        "content",
        "text/plain",
        %Kreuzberg.Metadata{},
        [],
        chunks: [chunk_map]
      )

      assert result.chunks != nil
      chunk = Enum.at(result.chunks, 0)
      assert is_struct(chunk, Kreuzberg.Chunk)
      assert chunk.text == "chunk"
    end

    test "normalizes images to structs" do
      image_map = %{"format" => "png", "width" => 800}

      result = Kreuzberg.ExtractionResult.new(
        "content",
        "text/plain",
        %Kreuzberg.Metadata{},
        [],
        images: [image_map]
      )

      assert result.images != nil
      image = Enum.at(result.images, 0)
      assert is_struct(image, Kreuzberg.Image)
      assert image.format == "png"
    end

    test "normalizes pages to structs" do
      page_map = %{"number" => 1, "content" => "page text"}

      result = Kreuzberg.ExtractionResult.new(
        "content",
        "text/plain",
        %Kreuzberg.Metadata{},
        [],
        pages: [page_map]
      )

      assert result.pages != nil
      page = Enum.at(result.pages, 0)
      assert is_struct(page, Kreuzberg.Page)
      assert page.number == 1
    end

    test "handles empty metadata default" do
      result = Kreuzberg.ExtractionResult.new("content", "text/plain")

      assert is_struct(result.metadata, Kreuzberg.Metadata)
      assert result.tables == []
    end

    test "pattern matches on nested structs" do
      metadata = %Kreuzberg.Metadata{title: "Test"}
      result = Kreuzberg.ExtractionResult.new("content", "text/plain", metadata)

      assert %Kreuzberg.ExtractionResult{
        metadata: %Kreuzberg.Metadata{title: title}
      } = result

      assert title == "Test"
    end
  end

  describe "ExtractionConfig struct" do
    test "enforces struct type in to_map" do
      config = %Kreuzberg.ExtractionConfig{
        use_cache: true,
        chunking: %{"size" => 512}
      }

      map = Kreuzberg.ExtractionConfig.to_map(config)

      assert map["use_cache"] == true
      assert map["chunking"] == %{"size" => 512}
      assert is_map(map)
    end

    test "rejects raw maps in to_map" do
      raw_map = %{"use_cache" => false}

      assert_raise FunctionClauseError, fn ->
        Kreuzberg.ExtractionConfig.to_map(raw_map)
      end
    end

    test "handles nil config in to_map" do
      assert Kreuzberg.ExtractionConfig.to_map(nil) == nil
    end

    test "validates correct struct types" do
      config = %Kreuzberg.ExtractionConfig{
        use_cache: true,
        enable_quality_processing: false
      }

      {:ok, validated} = Kreuzberg.ExtractionConfig.validate(config)

      assert validated.use_cache == true
      assert validated.enable_quality_processing == false
    end
  end

  describe "Type safety and idiomatic Elixir patterns" do
    test "all result nested fields are structs" do
      result = %Kreuzberg.ExtractionResult{
        content: "text",
        mime_type: "text/plain",
        metadata: %Kreuzberg.Metadata{},
        tables: [],
        detected_languages: ["en"],
        chunks: [%Kreuzberg.Chunk{text: "chunk"}],
        images: [%Kreuzberg.Image{format: "png"}],
        pages: [%Kreuzberg.Page{number: 1, content: "page"}]
      }

      assert is_struct(result.metadata, Kreuzberg.Metadata)

      Enum.each(result.tables, fn table ->
        assert is_struct(table, Kreuzberg.Table)
      end)

      if result.chunks do
        Enum.each(result.chunks, fn chunk ->
          assert is_struct(chunk, Kreuzberg.Chunk)
        end)
      end

      if result.images do
        Enum.each(result.images, fn image ->
          assert is_struct(image, Kreuzberg.Image)
        end)
      end

      if result.pages do
        Enum.each(result.pages, fn page ->
          assert is_struct(page, Kreuzberg.Page)
        end)
      end
    end

    test "struct type specs are accurate" do
      # This test documents the type specs
      config = %Kreuzberg.ExtractionConfig{}
      {:ok, _} = Kreuzberg.ExtractionConfig.validate(config)

      metadata = %Kreuzberg.Metadata{}
      assert is_struct(metadata)

      table = %Kreuzberg.Table{}
      assert is_struct(table)

      chunk = Kreuzberg.Chunk.new("text")
      assert is_struct(chunk)

      image = Kreuzberg.Image.new("png")
      assert is_struct(image)

      page = Kreuzberg.Page.new(1, "content")
      assert is_struct(page)
    end
  end
end
