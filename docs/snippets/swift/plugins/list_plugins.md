```swift title="Swift"
import Kreuzberg

let extractors = try Kreuzberg.listDocumentExtractors()
let processors = try Kreuzberg.listPostProcessors()
let ocrBackends = try Kreuzberg.listOcrBackends()
let validators = try Kreuzberg.listValidators()
let embeddingBackends = try Kreuzberg.listEmbeddingBackends()

print("Extractors: \(extractors)")
print("Processors: \(processors)")
print("OCR backends: \(ocrBackends)")
print("Validators: \(validators)")
print("Embedding backends: \(embeddingBackends)")
```
