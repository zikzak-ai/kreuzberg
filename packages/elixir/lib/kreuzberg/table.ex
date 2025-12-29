defmodule Kreuzberg.Table do
  @moduledoc """
  Structure representing an extracted table from a document.

  Contains table structure information including cells, rows, columns, and
  optional metadata like markdown representation or cell properties.

  ## Fields

    * `:cells` - Two-dimensional list of table cells [[cell1, cell2], ...]
    * `:rows` - Alternative representation: list of row structures
    * `:columns` - Optional list of column metadata
    * `:headers` - Optional list of header cell values
    * `:markdown` - Optional markdown representation of the table
    * `:html` - Optional HTML representation of the table
    * `:page_number` - Page number where table appears (if available)
    * `:bounds` - Optional bounding box coordinates [x1, y1, x2, y2]

  ## Examples

      iex> table = %Kreuzberg.Table{
      ...>   cells: [["Name", "Age"], ["Alice", "30"], ["Bob", "25"]],
      ...>   headers: ["Name", "Age"],
      ...>   markdown: "| Name | Age |\\n|------|-----|\\n| Alice | 30 |"
      ...> }
      iex> table.headers
      ["Name", "Age"]
  """

  @type cell_value :: String.t() | number() | map() | list() | nil

  @type t :: %__MODULE__{
    cells: list(list(cell_value())) | nil,
    rows: list(map()) | nil,
    columns: list(map()) | nil,
    headers: list(String.t()) | nil,
    markdown: String.t() | nil,
    html: String.t() | nil,
    page_number: integer() | nil,
    bounds: list(number()) | nil
  }

  defstruct [
    :cells,
    :rows,
    :columns,
    :headers,
    :markdown,
    :html,
    :page_number,
    :bounds
  ]

  @doc """
  Creates a new Table struct from a map.

  Converts a plain map (typically from NIF/Rust) into a proper struct.

  ## Parameters

    * `data` - A map containing table fields

  ## Returns

  A `Table` struct with matching fields populated.

  ## Examples

      iex> table_map = %{
      ...>   "cells" => [["A", "B"], ["1", "2"]],
      ...>   "headers" => ["A", "B"]
      ...> }
      iex> Kreuzberg.Table.from_map(table_map)
      %Kreuzberg.Table{
        cells: [["A", "B"], ["1", "2"]],
        headers: ["A", "B"]
      }
  """
  @spec from_map(map()) :: t()
  def from_map(data) when is_map(data) do
    %__MODULE__{
      cells: data["cells"],
      rows: data["rows"],
      columns: data["columns"],
      headers: data["headers"],
      markdown: data["markdown"],
      html: data["html"],
      page_number: data["page_number"],
      bounds: data["bounds"]
    }
  end

  @doc """
  Converts a Table struct to a map.

  Useful for serialization and passing to external systems.

  ## Parameters

    * `table` - A `Table` struct

  ## Returns

  A map with string keys representing all fields.

  ## Examples

      iex> table = %Kreuzberg.Table{
      ...>   cells: [["A", "B"]],
      ...>   headers: ["A", "B"]
      ...> }
      iex> Kreuzberg.Table.to_map(table)
      %{
        "cells" => [["A", "B"]],
        "headers" => ["A", "B"],
        "rows" => nil,
        ...
      }
  """
  @spec to_map(t()) :: map()
  def to_map(%__MODULE__{} = table) do
    %{
      "cells" => table.cells,
      "rows" => table.rows,
      "columns" => table.columns,
      "headers" => table.headers,
      "markdown" => table.markdown,
      "html" => table.html,
      "page_number" => table.page_number,
      "bounds" => table.bounds
    }
  end

  @doc """
  Returns the number of rows in the table.

  ## Parameters

    * `table` - A `Table` struct

  ## Returns

  The number of rows, or 0 if cells are not available.

  ## Examples

      iex> table = %Kreuzberg.Table{cells: [["A", "B"], ["1", "2"]]}
      iex> Kreuzberg.Table.row_count(table)
      2
  """
  @spec row_count(t()) :: integer()
  def row_count(%__MODULE__{cells: nil}), do: 0

  def row_count(%__MODULE__{cells: cells}) when is_list(cells) do
    length(cells)
  end

  @doc """
  Returns the number of columns in the table.

  ## Parameters

    * `table` - A `Table` struct

  ## Returns

  The number of columns, or 0 if cells are not available.

  ## Examples

      iex> table = %Kreuzberg.Table{cells: [["A", "B"], ["1", "2"]]}
      iex> Kreuzberg.Table.column_count(table)
      2
  """
  @spec column_count(t()) :: integer()
  def column_count(%__MODULE__{cells: nil}), do: 0

  def column_count(%__MODULE__{cells: []}) do
    0
  end

  def column_count(%__MODULE__{cells: cells}) when is_list(cells) do
    case List.first(cells) do
      nil -> 0
      row when is_list(row) -> length(row)
      _ -> 1
    end
  end
end
