# Deprecation Markers for C# and Elixir Bindings

Complete guide to deprecation implementation for Kreuzberg's C# and Elixir language bindings.

## Quick Start

This repository contains comprehensive deprecation marker implementations for both C# and Elixir bindings.

**For C# developers:**
- Read: `/DEPRECATION_GUIDE.md` - Detailed deprecation patterns and standards
- Review: `packages/csharp/Kreuzberg/DeprecationExamples.cs` - Working examples
- Test: `tests/csharp_deprecation_test.cs` - Verification tests

**For Elixir developers:**
- Read: `/DEPRECATION_GUIDE.md` - Detailed deprecation patterns and standards
- Review: `packages/elixir/lib/kreuzberg/legacy_api.ex` - Working examples
- Test: `tests/elixir_deprecation_test.exs` - Verification tests

**For project managers/leads:**
- Read: `/DEPRECATION_IMPLEMENTATION_SUMMARY.md` - Overview of what was implemented
- Review: Migration patterns and timelines
- Check: Deprecation removal checklist

## Files in This Implementation

### Documentation

| File | Purpose |
|------|---------|
| `/DEPRECATION_GUIDE.md` | Complete standards and best practices for both C# and Elixir |
| `/DEPRECATION_IMPLEMENTATION_SUMMARY.md` | Overview of implementation, patterns, and testing |
| `/DEPRECATION_README.md` | This file - Navigation guide |

### C# Implementation

| File | Purpose |
|------|---------|
| `packages/csharp/Kreuzberg/DeprecationExamples.cs` | Example deprecated methods, properties, and extension methods using `[Obsolete]` attribute |
| `tests/csharp_deprecation_test.cs` | Unit tests verifying deprecation markers are properly applied |

**Key Classes:**
- `LegacyExtractionAPI` - Deprecated extraction methods
- `DeprecatedExtensions` - Deprecated extension methods
- `DeprecatedConfigurationModel` - Deprecated properties
- `DeprecatedValidationLogic` - Deprecated validation functions

### Elixir Implementation

| File | Purpose |
|------|---------|
| `packages/elixir/lib/kreuzberg/legacy_api.ex` | Example deprecated functions using `@deprecated` attribute |
| `tests/elixir_deprecation_test.exs` | ExUnit tests verifying deprecation implementation |

**Key Module:**
- `Kreuzberg.LegacyAPI` - All deprecated functions with examples

## Deprecation Standards

### C# Standard

Use the `[Obsolete]` attribute:

```csharp
[Obsolete("Use NewMethod() instead. This method will be removed in v2.0.0.", error: false)]
public void OldMethod()
{
    // implementation
}
```

**Key Features:**
- Generates CS0618 compiler warning
- Appears in IDE IntelliSense
- Added to generated documentation
- Includes migration guidance

### Elixir Standard

Use the `@deprecated` module attribute:

```elixir
@deprecated "Use new_function/1 instead. Removes in v2.0.0."
def old_function(arg) do
  new_function(arg)
end
```

**Key Features:**
- Generates compiler warning during `mix compile`
- Appears in ExDoc-generated documentation
- Works with @doc for comprehensive guidance
- Includes removal timeline

## Testing Deprecation Markers

### C# Tests

```bash
cd packages/csharp
dotnet test tests/csharp_deprecation_test.cs
```

Tests verify:
- `[Obsolete]` attributes are applied
- Messages contain migration guidance
- Removal versions are specified
- Properties and methods are properly marked

### Elixir Tests

```bash
cd packages/elixir
mix test test/elixir_deprecation_test.exs
```

Tests verify:
- `@deprecated` attributes are applied
- Functions are properly exported
- Documentation includes migration guides
- Deprecated functions delegate correctly

## Common Deprecation Patterns

### Pattern 1: Boolean Parameter → Configuration Object

**Before (Deprecated):**
```csharp
// C#
var result = await Extract(input, enableOcr: true);
```

```elixir
# Elixir
{:ok, result} = extract(input, true)
```

**After (Recommended):**
```csharp
// C#
var config = new ExtractionConfig { Ocr = new OcrConfig { ... } };
var result = await Extract(input, config);
```

```elixir
# Elixir
config = %ExtractionConfig{ocr: %{"enabled" => true}}
{:ok, result} = extract(input, config)
```

### Pattern 2: Multiple Parameters → Configuration Map

**Before (Deprecated):**
```csharp
// C#
var result = await ExtractWithChunking(input, 1024, 100);
```

```elixir
# Elixir
{:ok, result} = extract_with_chunking(input, 1024, 100)
```

**After (Recommended):**
```csharp
// C#
var config = new ExtractionConfig
{
    Chunking = new ChunkingConfig { MaxChars = 1024, MaxOverlap = 100 }
};
var result = await Extract(input, config);
```

```elixir
# Elixir
config = %ExtractionConfig{chunking: %{"max_chars" => 1024, "max_overlap" => 100}}
{:ok, result} = extract(input, config)
```

## Deprecation Lifecycle

### Phase 1: Introduction (Current Version - v1.x)
- Deprecated functions marked with `[Obsolete]` (C#) or `@deprecated` (Elixir)
- Compiler warnings generated
- Documentation updated with migration guides
- Full backward compatibility maintained

### Phase 2: Notification
- Release notes highlight deprecations
- Migration guide published at https://docs.kreuzberg.io/v1-to-v2-migration
- Minimum 2 minor version updates with warnings

### Phase 3: Removal (v2.0.0)
- Deprecated code removed
- Breaking change documented in CHANGELOG.md
- Migration guide remains available
- Clear error messages if old code is attempted

## Using Deprecated APIs (With Warnings)

### C# - Suppress Compiler Warning

```csharp
#pragma warning disable CS0618
var result = LegacyExtractionAPI.ExtractAsyncWithOcr(input, mimeType, true);
#pragma warning restore CS0618
```

### Elixir - Suppress Compiler Warning

```elixir
defmodule MyModule do
  require Logger

  def use_deprecated_api() do
    # This will show a deprecation warning
    {:ok, result} = Kreuzberg.LegacyAPI.extract_with_ocr(input, mime_type, true)
    result
  end
end
```

Run with: `mix compile`

## Implementation Checklist

To add deprecation markers to existing code:

### C#
- [ ] Identify deprecated methods/properties
- [ ] Add `[Obsolete("message", false)]` attribute
- [ ] Update XML doc comments with `<remarks>`
- [ ] Implement delegation to new API
- [ ] Add unit tests with reflection
- [ ] Verify compiler warnings appear
- [ ] Generate docs and check for "Obsolete" badge

### Elixir
- [ ] Identify deprecated functions
- [ ] Add `@deprecated "message"` before function
- [ ] Add comprehensive `@doc` with examples
- [ ] Add `@spec` type specification
- [ ] Implement delegation to new API
- [ ] Add ExUnit tests
- [ ] Run `mix compile` to verify warnings
- [ ] Generate ExDoc and verify deprecation notice

## Deprecation Removal

Before removing deprecated code:

- [ ] Deprecated for at least 2 minor versions
- [ ] Major version bump in release
- [ ] Migration guide published
- [ ] All examples updated
- [ ] Tests using new APIs only
- [ ] CHANGELOG.md documents removal
- [ ] Release notes highlight breaking change

## Documentation Links

- **Detailed Standards:** See `/DEPRECATION_GUIDE.md`
- **Implementation Details:** See `/DEPRECATION_IMPLEMENTATION_SUMMARY.md`
- **C# Examples:** See `packages/csharp/Kreuzberg/DeprecationExamples.cs`
- **Elixir Examples:** See `packages/elixir/lib/kreuzberg/legacy_api.ex`

## References

### C# Deprecation
- [ObsoleteAttribute Documentation](https://learn.microsoft.com/en-us/dotnet/api/system.obsoleteattribute)
- [CS0618 Warning Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/cs0618)
- [DocFX Documentation Tool](https://dotnet.github.io/docfx/)

### Elixir Deprecation
- [Elixir @deprecated Attribute](https://hexdocs.pm/elixir/Module.html#module-attributes)
- [ExDoc Documentation Generator](https://github.com/elixir-lang/ex_doc)
- [Mix Compiler Warnings](https://hexdocs.pm/elixir/Code.html)

### General Best Practices
- [Semantic Versioning](https://semver.org/)
- [API Stability Guidelines](https://opensource.google/documentation/releasing/)

## Questions?

1. Check the appropriate guide (`DEPRECATION_GUIDE.md` or `DEPRECATION_IMPLEMENTATION_SUMMARY.md`)
2. Review the working examples in the respective binding package
3. Run the test suite to understand verification approaches
4. Open an issue or discussion for clarification

---

**Status:** Fully implemented for C# and Elixir bindings
**Last Updated:** 2026-01-25
**Removal Target Version:** v2.0.0
