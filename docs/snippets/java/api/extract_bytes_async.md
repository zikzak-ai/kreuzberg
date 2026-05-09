```java title="Java"
import dev.kreuzberg.Kreuzberg;
import dev.kreuzberg.ExtractionResult;
import dev.kreuzberg.config.ExtractionConfig;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;

byte[] data = Files.readAllBytes(Paths.get("document.pdf"));
ExtractionConfig config = ExtractionConfig.builder().build();
CompletableFuture<ExtractionResult> future = 
    Kreuzberg.extractBytes(data, "application/pdf", config);

ExtractionResult result = future.get();
System.out.println(result.getContent());
System.out.println(result.getMimeType());
```
