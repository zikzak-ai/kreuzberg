```r title="R"
library(kreuzberg)

chunking_cfg <- chunking_config(max_characters = 500L, overlap = 50L)
pages_cfg <- page_config(extract_pages = TRUE)
config <- extraction_config(chunking = chunking_cfg, pages = pages_cfg)

result <- extract_file_sync("document.pdf", "application/pdf", config)

for (i in seq_len(length(result$chunks))) {
  chunk <- result$chunks[[i]]
  metadata <- result$chunk_metadata[[i]]

  if (!is.null(metadata$first_page) && !is.null(metadata$last_page)) {
    page_range <- if (metadata$first_page == metadata$last_page) {
      sprintf("Page %d", metadata$first_page)
    } else {
      sprintf("Pages %d-%d", metadata$first_page, metadata$last_page)
    }

    preview <- substr(chunk, 1L, min(50L, nchar(chunk)))
    cat(sprintf("Chunk: %s... (%s)\n", preview, page_range))
  }
}
```
