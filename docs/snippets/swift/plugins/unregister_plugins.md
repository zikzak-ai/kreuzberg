```swift title="Swift"
import Kreuzberg

let names = [
    "custom-json-extractor",
    "word_count",
    "cloud-ocr",
    "min_length_validator",
]

try Kreuzberg.unregisterDocumentExtractor(names[0])
try Kreuzberg.unregisterPostProcessor(names[1])
try Kreuzberg.unregisterOcrBackend(names[2])
try Kreuzberg.unregisterValidator(names[3])

print("Plugins unregistered")
```
