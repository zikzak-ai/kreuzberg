defmodule Kreuzberg.Metadata do
  @moduledoc """
  Structure representing document metadata extracted from files.

  Contains document-specific information such as title, author, creation date,
  page count, and other metadata fields commonly found in document formats
  like PDF, Word, and Excel.

  ## Fields

    * `:language` - Primary language of the document (ISO 639-1 code, e.g., "en")
    * `:author` - Author of the document
    * `:created_date` - Document creation date (ISO 8601 format)
    * `:page_count` - Total number of pages in the document
    * `:title` - Document title or subject
    * `:subject` - Document subject or description
    * `:keywords` - Comma-separated keywords associated with the document
    * `:producer` - Software that produced the document
    * `:creator` - Application that originally created the document
    * `:modified_date` - Last modification date (ISO 8601 format)
    * `:creation_date` - Alternative field for creation date
    * `:trapped` - Whether document is marked as trapped (for PDFs)
    * `:file_size` - Size of the document file in bytes
    * `:version` - Format version (e.g., "1.4" for PDF)
    * `:encryption` - Whether the document is encrypted

  ## Examples

      iex> metadata = %Kreuzberg.Metadata{
      ...>   language: "en",
      ...>   author: "John Doe",
      ...>   created_date: "2024-01-15T10:30:00Z",
      ...>   page_count: 10,
      ...>   title: "Sales Report 2024"
      ...> }
      iex> metadata.title
      "Sales Report 2024"
      iex> metadata.page_count
      10
  """

  @type t :: %__MODULE__{
    language: String.t() | nil,
    author: String.t() | nil,
    created_date: String.t() | nil,
    page_count: integer() | nil,
    title: String.t() | nil,
    subject: String.t() | nil,
    keywords: String.t() | nil,
    producer: String.t() | nil,
    creator: String.t() | nil,
    modified_date: String.t() | nil,
    creation_date: String.t() | nil,
    trapped: boolean() | nil,
    file_size: integer() | nil,
    version: String.t() | nil,
    encryption: boolean() | nil
  }

  defstruct [
    :language,
    :author,
    :created_date,
    :page_count,
    :title,
    :subject,
    :keywords,
    :producer,
    :creator,
    :modified_date,
    :creation_date,
    :trapped,
    :file_size,
    :version,
    :encryption
  ]

  @doc """
  Creates a new Metadata struct from a map.

  Converts a plain map (typically from NIF/Rust) into a proper struct,
  allowing pattern matching and type safety.

  ## Parameters

    * `data` - A map containing metadata fields

  ## Returns

  A `Metadata` struct with matching fields populated.

  ## Examples

      iex> Kreuzberg.Metadata.from_map(%{"title" => "Report", "page_count" => 5})
      %Kreuzberg.Metadata{title: "Report", page_count: 5}

      iex> Kreuzberg.Metadata.from_map(%{})
      %Kreuzberg.Metadata{}
  """
  @spec from_map(map()) :: t()
  def from_map(data) when is_map(data) do
    %__MODULE__{
      language: data["language"],
      author: data["author"],
      created_date: data["created_date"],
      page_count: data["page_count"],
      title: data["title"],
      subject: data["subject"],
      keywords: data["keywords"],
      producer: data["producer"],
      creator: data["creator"],
      modified_date: data["modified_date"],
      creation_date: data["creation_date"],
      trapped: data["trapped"],
      file_size: data["file_size"],
      version: data["version"],
      encryption: data["encryption"]
    }
  end

  @doc """
  Converts a Metadata struct to a map.

  Useful for serialization and passing to external systems.

  ## Parameters

    * `metadata` - A `Metadata` struct

  ## Returns

  A map with string keys representing all fields.

  ## Examples

      iex> metadata = %Kreuzberg.Metadata{title: "Report", page_count: 5}
      iex> Kreuzberg.Metadata.to_map(metadata)
      %{
        "title" => "Report",
        "page_count" => 5,
        "language" => nil,
        "author" => nil
      }
  """
  @spec to_map(t()) :: map()
  def to_map(%__MODULE__{} = metadata) do
    %{
      "language" => metadata.language,
      "author" => metadata.author,
      "created_date" => metadata.created_date,
      "page_count" => metadata.page_count,
      "title" => metadata.title,
      "subject" => metadata.subject,
      "keywords" => metadata.keywords,
      "producer" => metadata.producer,
      "creator" => metadata.creator,
      "modified_date" => metadata.modified_date,
      "creation_date" => metadata.creation_date,
      "trapped" => metadata.trapped,
      "file_size" => metadata.file_size,
      "version" => metadata.version,
      "encryption" => metadata.encryption
    }
  end
end
