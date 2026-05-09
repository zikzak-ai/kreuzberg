```c title="C"
#include "kreuzberg.h"
#include <stdio.h>
#include <stdlib.h>

int main(void) {
    /* Items is a JSON array of BatchBytesItem objects.
     * Each entry has "content" (base64), "mime_type", and an optional "config". */
    const char *items_json =
        "["
        "  {\"content\": \"SGVsbG8h\", \"mime_type\": \"text/plain\"},"
        "  {\"content\": \"V29ybGQh\", \"mime_type\": \"text/plain\"}"
        "]";

    KREUZBERGExtractionConfig *config = kreuzberg_extraction_config_default();

    /* Returns a JSON array of ExtractionResult objects, or NULL on failure. */
    char *results_json =
        kreuzberg_batch_extract_bytes_sync(items_json, config);
    if (!results_json) {
        fprintf(stderr, "batch extraction failed (code %d): %s\n",
                kreuzberg_last_error_code(),
                kreuzberg_last_error_context());
        kreuzberg_extraction_config_free(config);
        return 1;
    }

    printf("%s\n", results_json);
    kreuzberg_free_string(results_json);
    kreuzberg_extraction_config_free(config);
    return 0;
}
```
