```r title="R"
library(kreuzberg)

config <- extraction_config(
  keywords = list(
    algorithm = "yake",
    max_keywords = 10L,
    min_score = 0.3,
    ngram_range = c(1L, 3L),
    language = "en"
  )
)

result <- extract_file_sync("document.pdf", "application/pdf", config)

cat(sprintf("Keywords extracted: %d\n", length(result$keywords)))
```
