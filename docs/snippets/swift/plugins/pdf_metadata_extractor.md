<!-- snippet:skip -->
```swift title="Swift"
import Kreuzberg

// DocumentExtractor trait-bridge support requires alef-side InternalDocument 
// bridging (alef >= 0.16); custom DocumentExtractor implementations remain 
// Rust-only until then.
//
// PDF metadata is already populated on ExtractionResult.metadata by the
// built-in PDF extractor. To augment metadata, write a PostProcessor in 
// Rust or post-process results in Swift after extraction.
```
