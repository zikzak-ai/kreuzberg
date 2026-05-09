```java title="Java"
import dev.kreuzberg.Kreuzberg;
import dev.kreuzberg.ExtractionResult;
import dev.kreuzberg.config.ExtractionConfig;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;

ExtractionConfig config = ExtractionConfig.builder().build();
CompletableFuture<ExtractionResult> future = 
    Kreuzberg.extractFile(Paths.get("document.pdf"), config);

ExtractionResult result = future.get();
System.out.println(result.getContent());
System.out.println(result.getMimeType());
```
