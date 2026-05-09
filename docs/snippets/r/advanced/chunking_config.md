```r title="R"
library(kreuzberg)

chunking_cfg <- chunking_config(max_characters = 1000L, overlap = 200L)
config <- extraction_config(chunking = chunking_cfg)

result <- extract_file_sync("document.pdf", "application/pdf", config)

cat(sprintf("Chunks produced: %d\n", length(result$chunks)))
for (i in seq_len(min(3L, length(result$chunks)))) {
  cat(sprintf("Chunk %d length: %d characters\n", i, nchar(result$chunks[[i]])))
}
```

```r title="R - Prepend Heading Context"
library(kreuzberg)

chunking_cfg <- chunking_config(
  max_characters = 500L,
  overlap = 50L,
  prepend_heading_context = TRUE
)
config <- extraction_config(chunking = chunking_cfg)

result <- extract_file_sync("document.md", "text/markdown", config)

for (i in seq_len(min(3L, length(result$chunks)))) {
  chunk <- result$chunks[[i]]
  preview <- substr(chunk, 1L, min(100L, nchar(chunk)))
  cat(sprintf("%s\n", preview))
}
```
