```java title="Java"
import dev.kreuzberg.Kreuzberg;
import dev.kreuzberg.ExtractionResult;
import dev.kreuzberg.config.*;
import java.nio.file.Paths;

ExtractionConfig config = ExtractionConfig.builder()
    .ocr(OcrConfig.builder()
        .backend("tesseract")
        .languages(java.util.List.of("eng", "deu"))
        .build())
    .chunking(ChunkingConfig.builder()
        .maxChars(512)
        .maxOverlap(50)
        .build())
    .enableQualityProcessing(true)
    .extractMetadata(true)
    .extractTables(true)
    .build();

ExtractionResult result = Kreuzberg.extractFileSync(Paths.get("document.pdf"), config);
System.out.println("Content: " + result.getContent().substring(0, 100) + "...");
System.out.println("Tables: " + result.getTables().size() + " Quality: " + result.getQualityScore());
```
