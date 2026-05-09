```java title="Java"
import dev.kreuzberg.Kreuzberg;
import dev.kreuzberg.ExtractionResult;
import dev.kreuzberg.config.ExtractionConfig;
import java.nio.file.Paths;

ExtractionConfig config = ExtractionConfig.builder().build();
ExtractionResult result = Kreuzberg.extractFileSync(Paths.get("document.pdf"), config);

System.out.println(result.getContent());
System.out.println("Tables: " + result.getTables().size());
System.out.println("Metadata: " + result.getMetadata().getFormatType());
```
