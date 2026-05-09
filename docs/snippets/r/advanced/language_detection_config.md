```r title="R"
library(kreuzberg)

config <- extraction_config(
  language_detection = list(
    enabled = TRUE,
    min_confidence = 0.8,
    detect_multiple = FALSE
  )
)

result <- extract_file_sync("document.pdf", "application/pdf", config)

if (length(result$detected_languages) > 0) {
  cat(sprintf("Detected language: %s\n", result$detected_languages[[1]]))
} else {
  cat("No language detected\n")
}

cat(sprintf("Content length: %d characters\n", nchar(result$content)))
```
