```r title="R"
library(kreuzberg)

config <- extraction_config(
  token_reduction = list(
    mode = "moderate",
    preserve_markdown = TRUE,
    preserve_code = TRUE,
    language_hint = "eng"
  )
)

result <- extract_file_sync("document.pdf", "application/pdf", config)

cat(sprintf("Reduced content length: %d characters\n", nchar(result$content)))
```
