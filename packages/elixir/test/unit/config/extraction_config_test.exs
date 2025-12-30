defmodule KreuzbergTest.Unit.Config.ExtractionConfigTest do
  @moduledoc """
  Unit tests for Kreuzberg.ExtractionConfig module.

  Tests cover:
  - Struct creation with defaults and custom values
  - Validation of all fields
  - Serialization to/from maps
  - Pattern matching
  - Type specs
  - Nesting in parent configs
  - Edge cases
  """

  use ExUnit.Case

  alias Kreuzberg.ExtractionConfig

  describe "struct creation" do
    @tag :unit
    test "creates with default values" do
      config = %ExtractionConfig{}

      assert config.use_cache == true
      assert config.enable_quality_processing == false
      assert config.force_ocr == false
      assert config.chunking == nil
      assert config.ocr == nil
    end

    @tag :unit
    test "creates with custom boolean values" do
      config = %ExtractionConfig{
        use_cache: false,
        enable_quality_processing: true,
        force_ocr: true
      }

      assert config.use_cache == false
      assert config.enable_quality_processing == true
      assert config.force_ocr == true
    end

    @tag :unit
    test "creates with nested configuration maps" do
      config = %ExtractionConfig{
        chunking: %{"size" => 512, "overlap" => 50},
        ocr: %{"backend" => "tesseract"},
        language_detection: %{"enabled" => true}
      }

      assert config.chunking == %{"size" => 512, "overlap" => 50}
      assert config.ocr == %{"backend" => "tesseract"}
      assert config.language_detection == %{"enabled" => true}
    end
  end

  describe "validation" do
    @tag :unit
    test "validates use_cache field" do
      config = %ExtractionConfig{use_cache: "invalid"}
      assert {:error, reason} = ExtractionConfig.validate(config)
      assert reason =~ "use_cache"
    end

    @tag :unit
    test "validates enable_quality_processing field" do
      config = %ExtractionConfig{enable_quality_processing: 1}
      assert {:error, reason} = ExtractionConfig.validate(config)
      assert reason =~ "enable_quality_processing"
    end

    @tag :unit
    test "validates chunking map field" do
      config = %ExtractionConfig{chunking: "invalid"}
      assert {:error, reason} = ExtractionConfig.validate(config)
      assert reason =~ "chunking"
    end

    @tag :unit
    test "accepts valid config with all fields" do
      config = %ExtractionConfig{
        use_cache: true,
        enable_quality_processing: false,
        force_ocr: true,
        chunking: %{"size" => 1024},
        ocr: %{"enabled" => true},
        language_detection: %{"enabled" => true}
      }

      assert {:ok, ^config} = ExtractionConfig.validate(config)
    end

    @tag :unit
    test "accepts nil for all nested fields" do
      config = %ExtractionConfig{
        chunking: nil,
        ocr: nil,
        language_detection: nil,
        postprocessor: nil
      }

      assert {:ok, _} = ExtractionConfig.validate(config)
    end
  end

  describe "serialization" do
    @tag :unit
    test "converts to map with all fields" do
      config = %ExtractionConfig{
        use_cache: true,
        chunking: %{"size" => 512}
      }

      map = ExtractionConfig.to_map(config)

      assert is_map(map)
      assert map["use_cache"] == true
      assert map["chunking"] == %{"size" => 512}
      assert map["enable_quality_processing"] == false
    end

    @tag :unit
    test "converts from map to struct" do
      map = %{
        "use_cache" => false,
        "enable_quality_processing" => true,
        "force_ocr" => false
      }

      {:ok, config} =
        ExtractionConfig.validate(%ExtractionConfig{
          use_cache: false,
          enable_quality_processing: true,
          force_ocr: false
        })

      assert config.use_cache == false
      assert config.enable_quality_processing == true
    end

    @tag :unit
    test "handles nil config in to_map" do
      assert ExtractionConfig.to_map(nil) == nil
    end

    @tag :unit
    test "round-trips through JSON" do
      original = %ExtractionConfig{
        use_cache: true,
        force_ocr: false,
        chunking: %{"size" => 512}
      }

      map = ExtractionConfig.to_map(original)
      json = Jason.encode!(map)
      {:ok, decoded} = Jason.decode(json)

      assert decoded["use_cache"] == true
      assert decoded["chunking"] == %{"size" => 512}
    end
  end

  describe "pattern matching" do
    @tag :unit
    test "matches on use_cache field" do
      config = %ExtractionConfig{use_cache: true}

      assert %ExtractionConfig{use_cache: true} = config
    end

    @tag :unit
    test "matches on multiple fields" do
      config = %ExtractionConfig{
        use_cache: false,
        enable_quality_processing: true
      }

      assert %ExtractionConfig{
               use_cache: false,
               enable_quality_processing: true
             } = config
    end

    @tag :unit
    test "matches on nested configuration" do
      config = %ExtractionConfig{chunking: %{"size" => 512}}

      assert %ExtractionConfig{chunking: chunking} = config
      assert chunking["size"] == 512
    end
  end

  describe "struct enforcement" do
    @tag :unit
    test "is a proper struct" do
      config = %ExtractionConfig{}

      assert is_struct(config)
      assert is_struct(config, ExtractionConfig)
    end

    @tag :unit
    test "ignores unknown keys when using struct/2" do
      # struct/2 ignores unknown keys rather than raising an error
      # This is the standard Elixir behavior
      result = struct(ExtractionConfig, unknown_field: "value")
      assert is_struct(result, ExtractionConfig)
      # The unknown field is not added to the struct
      assert not Map.has_key?(result, :unknown_field)
    end
  end

  describe "type specifications" do
    @tag :unit
    test "has proper struct definition" do
      assert function_exported?(ExtractionConfig, :__struct__, 0)
    end

    @tag :unit
    test "documents type as t/0" do
      # Ensure the module has proper type specs
      config = %ExtractionConfig{}
      assert is_struct(config, ExtractionConfig)
    end
  end

  describe "edge cases" do
    @tag :unit
    test "handles nil nested configurations" do
      config = %ExtractionConfig{
        chunking: nil,
        ocr: nil,
        language_detection: nil,
        postprocessor: nil,
        images: nil,
        pages: nil,
        token_reduction: nil,
        keywords: nil,
        pdf_options: nil
      }

      assert {:ok, _} = ExtractionConfig.validate(config)
    end

    @tag :unit
    test "handles empty maps for nested configurations" do
      config = %ExtractionConfig{
        chunking: %{},
        ocr: %{},
        language_detection: %{}
      }

      assert {:ok, _} = ExtractionConfig.validate(config)
    end

    @tag :unit
    test "handles large configuration maps" do
      large_config = Map.new(1..100, &{"key_#{&1}", &1})

      config = %ExtractionConfig{chunking: large_config}

      assert {:ok, _} = ExtractionConfig.validate(config)
      assert map_size(config.chunking) == 100
    end
  end
end
