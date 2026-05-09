```java title="Java"
import dev.kreuzberg.Kreuzberg;
import dev.kreuzberg.ExtractionResult;
import dev.kreuzberg.config.ExtractionConfig;
import dev.kreuzberg.*;
import java.nio.file.Paths;

try {
    ExtractionResult result = Kreuzberg.extractFileSync(Paths.get("missing.pdf"), new ExtractionConfig());
    System.out.println(result.getContent());
} catch (ValidationException e) {
    System.err.println("Validation error: " + e.getMessage());
} catch (IoException e) {
    System.err.println("IO error: " + e.getMessage());
} catch (KreuzbergRsException e) {
    System.err.println("Extraction failed: " + e.getMessage());
}
```
