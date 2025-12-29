defmodule Kreuzberg.Chunk do
  @moduledoc """
  Structure representing a text chunk with embedding for semantic search.

  Contains a portion of extracted text along with its vector embedding
  and optional metadata for use in RAG (Retrieval-Augmented Generation)
  and semantic search applications.

  ## Fields

    * `:text` - The text content of this chunk
    * `:embedding` - Vector embedding (list of floats) for semantic search
    * `:metadata` - Optional metadata about the chunk (page number, position, etc.)
    * `:token_count` - Number of tokens in the chunk (if available)
    * `:start_position` - Character position where chunk starts in original text
    * `:confidence` - Confidence score for the embedding (0.0-1.0)

  ## Examples

      iex> chunk = %Kreuzberg.Chunk{
      ...>   text: "This is a chunk of extracted text",
      ...>   embedding: [0.1, 0.2, 0.3, 0.4],
      ...>   metadata: %{"page" => 1, "section" => "Introduction"}
      ...> }
      iex> chunk.text
      "This is a chunk of extracted text"
  """

  @type embedding :: list(float())

  @type t :: %__MODULE__{
    text: String.t(),
    embedding: embedding() | nil,
    metadata: map() | nil,
    token_count: integer() | nil,
    start_position: integer() | nil,
    confidence: float() | nil
  }

  defstruct [
    :text,
    :embedding,
    :metadata,
    :token_count,
    :start_position,
    :confidence
  ]

  @doc """
  Creates a new Chunk struct with required text field.

  ## Parameters

    * `text` - The text content of the chunk
    * `opts` - Optional keyword list with:
      * `:embedding` - Vector embedding list
      * `:metadata` - Metadata map
      * `:token_count` - Token count
      * `:start_position` - Starting character position
      * `:confidence` - Confidence score

  ## Returns

  A `Chunk` struct with the provided text and options.

  ## Examples

      iex> Kreuzberg.Chunk.new("chunk text")
      %Kreuzberg.Chunk{text: "chunk text"}

      iex> Kreuzberg.Chunk.new(
      ...>   "chunk text",
      ...>   embedding: [0.1, 0.2],
      ...>   metadata: %{"page" => 1}
      ...> )
      %Kreuzberg.Chunk{
        text: "chunk text",
        embedding: [0.1, 0.2],
        metadata: %{"page" => 1}
      }
  """
  @spec new(String.t(), keyword()) :: t()
  def new(text, opts \\ []) when is_binary(text) do
    %__MODULE__{
      text: text,
      embedding: Keyword.get(opts, :embedding),
      metadata: Keyword.get(opts, :metadata),
      token_count: Keyword.get(opts, :token_count),
      start_position: Keyword.get(opts, :start_position),
      confidence: Keyword.get(opts, :confidence)
    }
  end

  @doc """
  Creates a Chunk struct from a map.

  Converts a plain map (typically from NIF/Rust) into a proper struct.

  ## Parameters

    * `data` - A map containing chunk fields

  ## Returns

  A `Chunk` struct with matching fields populated.

  ## Examples

      iex> chunk_map = %{
      ...>   "text" => "chunk content",
      ...>   "embedding" => [0.1, 0.2, 0.3]
      ...> }
      iex> Kreuzberg.Chunk.from_map(chunk_map)
      %Kreuzberg.Chunk{
        text: "chunk content",
        embedding: [0.1, 0.2, 0.3]
      }
  """
  @spec from_map(map()) :: t()
  def from_map(data) when is_map(data) do
    %__MODULE__{
      text: data["text"] || "",
      embedding: data["embedding"],
      metadata: data["metadata"],
      token_count: data["token_count"],
      start_position: data["start_position"],
      confidence: data["confidence"]
    }
  end

  @doc """
  Converts a Chunk struct to a map.

  Useful for serialization and passing to external systems.

  ## Parameters

    * `chunk` - A `Chunk` struct

  ## Returns

  A map with string keys representing all fields.

  ## Examples

      iex> chunk = %Kreuzberg.Chunk{text: "content", embedding: [0.1, 0.2]}
      iex> Kreuzberg.Chunk.to_map(chunk)
      %{
        "text" => "content",
        "embedding" => [0.1, 0.2],
        ...
      }
  """
  @spec to_map(t()) :: map()
  def to_map(%__MODULE__{} = chunk) do
    %{
      "text" => chunk.text,
      "embedding" => chunk.embedding,
      "metadata" => chunk.metadata,
      "token_count" => chunk.token_count,
      "start_position" => chunk.start_position,
      "confidence" => chunk.confidence
    }
  end
end
