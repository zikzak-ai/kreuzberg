defmodule Kreuzberg.Image do
  @moduledoc """
  Structure representing an extracted image with optional OCR results.

  Contains binary image data and metadata extracted from documents,
  along with OCR text results when OCR processing is enabled.

  ## Fields

    * `:data` - Binary image data (PNG, JPEG, WebP, etc.)
    * `:format` - Image format as string ("png", "jpeg", "webp", etc.)
    * `:width` - Image width in pixels
    * `:height` - Image height in pixels
    * `:mime_type` - MIME type of the image (e.g., "image/png")
    * `:ocr_text` - Text extracted from image via OCR
    * `:page_number` - Page number where image appears
    * `:file_size` - Size of image data in bytes
    * `:dpi` - Dots per inch of the image

  ## Examples

      iex> image = %Kreuzberg.Image{
      ...>   format: "png",
      ...>   width: 800,
      ...>   height: 600,
      ...>   data: <<...>>,
      ...>   ocr_text: "Extracted text from image"
      ...> }
      iex> image.format
      "png"
  """

  @type t :: %__MODULE__{
    data: binary() | nil,
    format: String.t() | nil,
    width: integer() | nil,
    height: integer() | nil,
    mime_type: String.t() | nil,
    ocr_text: String.t() | nil,
    page_number: integer() | nil,
    file_size: integer() | nil,
    dpi: integer() | nil
  }

  defstruct [
    :data,
    :format,
    :width,
    :height,
    :mime_type,
    :ocr_text,
    :page_number,
    :file_size,
    :dpi
  ]

  @doc """
  Creates a new Image struct with required format field.

  ## Parameters

    * `format` - The image format (e.g., "png", "jpeg")
    * `opts` - Optional keyword list with:
      * `:data` - Binary image data
      * `:width` - Image width in pixels
      * `:height` - Image height in pixels
      * `:mime_type` - MIME type
      * `:ocr_text` - OCR extracted text
      * `:page_number` - Page number
      * `:file_size` - File size in bytes
      * `:dpi` - DPI setting

  ## Returns

  An `Image` struct with the provided format and options.

  ## Examples

      iex> Kreuzberg.Image.new("png")
      %Kreuzberg.Image{format: "png"}

      iex> Kreuzberg.Image.new(
      ...>   "jpeg",
      ...>   width: 1920,
      ...>   height: 1080,
      ...>   dpi: 150
      ...> )
      %Kreuzberg.Image{
        format: "jpeg",
        width: 1920,
        height: 1080,
        dpi: 150
      }
  """
  @spec new(String.t(), keyword()) :: t()
  def new(format, opts \\ []) when is_binary(format) do
    %__MODULE__{
      format: format,
      data: Keyword.get(opts, :data),
      width: Keyword.get(opts, :width),
      height: Keyword.get(opts, :height),
      mime_type: Keyword.get(opts, :mime_type),
      ocr_text: Keyword.get(opts, :ocr_text),
      page_number: Keyword.get(opts, :page_number),
      file_size: Keyword.get(opts, :file_size),
      dpi: Keyword.get(opts, :dpi)
    }
  end

  @doc """
  Creates an Image struct from a map.

  Converts a plain map (typically from NIF/Rust) into a proper struct.

  ## Parameters

    * `data` - A map containing image fields

  ## Returns

  An `Image` struct with matching fields populated.

  ## Examples

      iex> image_map = %{
      ...>   "format" => "png",
      ...>   "width" => 1024,
      ...>   "height" => 768
      ...> }
      iex> Kreuzberg.Image.from_map(image_map)
      %Kreuzberg.Image{
        format: "png",
        width: 1024,
        height: 768
      }
  """
  @spec from_map(map()) :: t()
  def from_map(data) when is_map(data) do
    %__MODULE__{
      data: data["data"],
      format: data["format"],
      width: data["width"],
      height: data["height"],
      mime_type: data["mime_type"],
      ocr_text: data["ocr_text"],
      page_number: data["page_number"],
      file_size: data["file_size"],
      dpi: data["dpi"]
    }
  end

  @doc """
  Converts an Image struct to a map.

  Useful for serialization and passing to external systems.

  ## Parameters

    * `image` - An `Image` struct

  ## Returns

  A map with string keys representing all fields.

  ## Examples

      iex> image = %Kreuzberg.Image{format: "png", width: 800}
      iex> Kreuzberg.Image.to_map(image)
      %{
        "format" => "png",
        "width" => 800,
        "data" => nil,
        ...
      }
  """
  @spec to_map(t()) :: map()
  def to_map(%__MODULE__{} = image) do
    %{
      "data" => image.data,
      "format" => image.format,
      "width" => image.width,
      "height" => image.height,
      "mime_type" => image.mime_type,
      "ocr_text" => image.ocr_text,
      "page_number" => image.page_number,
      "file_size" => image.file_size,
      "dpi" => image.dpi
    }
  end

  @doc """
  Returns whether the image has binary data.

  ## Parameters

    * `image` - An `Image` struct

  ## Returns

  `true` if image has data, `false` otherwise.

  ## Examples

      iex> image = %Kreuzberg.Image{format: "png", data: <<1, 2, 3>>}
      iex> Kreuzberg.Image.has_data?(image)
      true

      iex> image = %Kreuzberg.Image{format: "png"}
      iex> Kreuzberg.Image.has_data?(image)
      false
  """
  @spec has_data?(t()) :: boolean()
  def has_data?(%__MODULE__{data: data}) do
    is_binary(data) and byte_size(data) > 0
  end

  @doc """
  Returns the aspect ratio (width / height) of the image.

  ## Parameters

    * `image` - An `Image` struct

  ## Returns

  The aspect ratio as a float, or nil if dimensions not available.

  ## Examples

      iex> image = %Kreuzberg.Image{width: 1920, height: 1080}
      iex> Kreuzberg.Image.aspect_ratio(image)
      1.7777777777777777

      iex> image = %Kreuzberg.Image{format: "png"}
      iex> Kreuzberg.Image.aspect_ratio(image)
      nil
  """
  @spec aspect_ratio(t()) :: float() | nil
  def aspect_ratio(%__MODULE__{width: w, height: h}) when is_integer(w) and is_integer(h) and h > 0 do
    w / h
  end

  def aspect_ratio(_), do: nil
end
