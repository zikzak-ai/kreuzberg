<!-- snippet:skip -->
```swift title="Swift"
import Kreuzberg

// DocumentExtractor trait-bridge support requires alef-side InternalDocument 
// bridging (alef >= 0.16); custom DocumentExtractor implementations remain 
// Rust-only until then.
//
// Built-in extractors (PDF, DOCX, HTML, etc.) are registered automatically
// by kreuzberg when the library initializes.
```
