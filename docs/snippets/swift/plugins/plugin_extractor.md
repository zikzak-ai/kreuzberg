<!-- snippet:skip -->
```swift title="Swift"
import Kreuzberg

// DocumentExtractor trait-bridge support requires alef-side InternalDocument 
// bridging (alef >= 0.16); custom DocumentExtractor implementations remain 
// Rust-only until then.
//
// Custom extractors must be implemented in Rust and registered through a
// Rust shim crate that links both `kreuzberg` and the Swift binding crate.
```
