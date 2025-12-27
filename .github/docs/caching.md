# CI Caching System Documentation

## Overview

The Kreuzberg CI caching system is a sophisticated, multi-layered caching infrastructure designed to accelerate build times across multiple language bindings and platforms. This system intelligently caches compiled artifacts based on content-aware hashes, enabling massive speed improvements in CI pipelines.

### What Is Cached

The caching system manages two levels of compiled artifacts:

1. **FFI Libraries** - Core language-agnostic FFI bindings (kreuzberg-ffi, kreuzberg-py, kreuzberg-rb)
2. **Language Bindings** - Language-specific compiled artifacts (Python wheels, Ruby gems, Node .node files, WASM modules, Java JARs, C# NuGet packages, PHP extensions, Go binaries)

### Why Cache

- **Reduced Build Time**: Rebuilding the same FFI library or binding from scratch can take 15-45 minutes per platform. Cache hits reduce this to seconds.
- **Lower CI Costs**: Fewer compute-intensive builds mean reduced CI resource utilization.
- **Faster Feedback**: Developers get faster feedback on PRs when builds don't need to recompile unchanged code.
- **Multi-Platform Efficiency**: When testing multiple platforms (Linux, macOS, Windows) × multiple architectures (x86_64, ARM64), caching provides exponential time savings.

### Expected Benefits

- **FFI Cache Hit**: Typically 10-30 second restore time vs 15-25 minute rebuild
- **Binding Cache Hit**: Typically 20-60 second restore time vs 10-40 minute rebuild (depending on language)
- **Average Savings Per Workflow**: 2-3 hours on multi-platform CI runs when all caches hit
- **On Main Branch**: >90% cache hit rate typically achieved due to high code stability

---

## Architecture

The caching system consists of three composite actions that work together in a coordinated pipeline:

### 1. `cache-binding-artifact` (Low-Level Cache Manager)

**Path**: `.github/actions/cache-binding-artifact/action.yml`

**Purpose**: Generic, reusable cache restore/save operations for any binding type.

**Responsibilities**:
- Validates cache operation inputs
- Performs cache restore operations with fallback keys
- Saves artifacts to cache with specified keys
- Reports detailed cache hit/miss/partial-hit statistics
- Calculates and displays artifact sizes

**Inputs**:
- `binding-name`: Language binding identifier (python, ruby, node, wasm, ffi, etc.)
- `cache-key`: Primary cache key for exact match lookup
- `cache-restore-keys`: Fallback keys for partial matches (one per line)
- `cache-paths`: Paths to cache/restore (one per line)
- `operation`: Either `restore` or `save`
- `enable-crossplatform-cache`: Enable cross-OS caching (experimental)

**Outputs**:
- `cache-hit`: Boolean indicating exact cache match
- `cache-matched-key`: The key that was matched (exact or partial)
- `cache-primary-key`: The primary cache key used

**Implementation**: Uses GitHub Actions' native `actions/cache/restore@v5` and `actions/cache/save@v5` under the hood.

### 2. `build-and-cache-ffi` (FFI Library Cache Orchestrator)

**Path**: `.github/actions/build-and-cache-ffi/action.yml`

**Purpose**: Build and cache FFI libraries with intelligent key generation based on Rust source hashes.

**Responsibilities**:
- Compute deterministic hashes of Rust source files
- Generate cache keys incorporating Rust source + Cargo dependencies + versions
- Orchestrate cache restore → build (if needed) → save cycle
- Validate FFI artifacts after restore/build
- Provide detailed build and cache summaries

**Inputs**:
- `platform`: Platform identifier (linux-x64, macos-arm64, windows-x64, etc.)
- `ffi-crate`: FFI crate to build (kreuzberg-ffi, kreuzberg-py, kreuzberg-rb)
- `cache-version`: Manual version for cache invalidation (default: v1)
- `skip-build-on-hit`: Skip build step if cache hits (default: true)
- `pdfium-version`: PDFium version for cache key
- `ort-version`: ONNX Runtime version for cache key

**Outputs**:
- `cache-hit`: Boolean indicating exact cache match
- `cache-key`: Full cache key used
- `rust-hash`: Hash of Rust sources (used by dependent builds)
- `library-path`: Path to the built FFI library

**Process**:
1. Validates platform and ffi-crate inputs
2. Computes hash of all Rust source files using `compute-hash.sh`
3. Computes hash of Cargo.toml and Cargo.lock
4. Generates cache key with format: `ffi-{crate}-{platform}-rust-{hash}-cargo-{hash}-pdfium-{ver}-ort-{ver}-v{ver}`
5. Attempts to restore from cache with fallback keys
6. Builds FFI library if cache misses (unless `skip-build-on-hit=false`)
7. Validates built/restored artifacts using `validate-cache.sh`
8. Saves to cache if build occurred
9. Reports comprehensive build and cache statistics

### 3. `build-and-cache-binding` (Language Binding Cache Orchestrator)

**Path**: `.github/actions/build-and-cache-binding/action.yml`

**Purpose**: Build and cache language-specific bindings with intelligent key generation based on Rust FFI hash + binding files + dependencies.

**Responsibilities**:
- Compute hashes of binding-specific source files
- Compute hashes of dependency lock files
- Generate cache keys incorporating all relevant source hashes
- Orchestrate cache restore → build (if needed) → save cycle
- Validate artifacts after restore/build
- Support cross-platform cache (experimental)

**Inputs**:
- `binding-name`: Language binding name (python, ruby, node, go, java, csharp, php, wasm)
- `platform`: Platform identifier
- `task-command`: Task command to run for building (e.g., python:build:ci, node:build:release)
- `cache-paths`: Newline-separated list of paths to cache
- `cache-version`: Manual cache version override (default: v1)
- `rust-hash`: Rust FFI source hash (from FFI build output)
- `binding-files`: Glob pattern for binding-specific source files (supports newlines)
- `dep-files`: Dependency lock files to hash (e.g., Cargo.lock, pyproject.toml, pnpm-lock.yaml)
- `enable-crossplatform-cache`: Enable cross-OS caching (experimental, default: false)
- `validate-artifacts`: Enable artifact validation after cache restore or build (default: true)

**Outputs**:
- `cache-hit`: Whether cache was restored (exact match)
- `cache-key`: Full cache key used
- `cache-matched-key`: Cache key that was matched (exact or partial)
- `binding-hash`: Hash of binding-specific source files
- `deps-hash`: Hash of dependency lock files
- `artifact-validated`: Whether cached artifacts passed validation

**Process**:
1. Validates all required inputs
2. Computes hash of binding-specific source files using glob patterns
3. Computes hash of dependency lock files
4. Generates primary cache key: `{binding}-{platform}-rust-{rust-hash}-binding-{binding-hash}-deps-{deps-hash}-v{ver}`
5. Generates fallback restore keys (3 levels of partial matches)
6. Attempts to restore from cache with fallbacks
7. Validates restored artifacts if validation enabled
8. Builds binding using specified task command if cache misses
9. Validates built artifacts
10. Saves to cache if build occurred
11. Reports comprehensive build and cache status

### Interaction Flow

```
Workflow Job
    ↓
[1] build-and-cache-ffi
    ├─ Compute Rust + Cargo hashes
    ├─ Generate cache key
    ├─ Call cache-binding-artifact (restore)
    ├─ Build FFI library (if cache miss)
    ├─ Validate artifacts
    └─ Call cache-binding-artifact (save)
    │
    └─ Output: rust-hash (consumed by next step)
    ↓
[2] build-and-cache-binding
    ├─ Compute binding file + dependency hashes
    ├─ Generate cache key (includes rust-hash from step 1)
    ├─ Call cache-binding-artifact (restore)
    ├─ Validate restored artifacts
    ├─ Build binding (if cache miss)
    ├─ Validate built artifacts
    └─ Call cache-binding-artifact (save)
```

---

## Cache Key Design

Cache keys are deterministically generated based on content-aware hashes to ensure that identical source code always produces the same cache key, while any change invalidates the cache.

### FFI Cache Key Format

```
ffi-{crate}-{platform}-rust-{rust-hash}-cargo-{cargo-hash}-pdfium-{pdfium-ver}-ort-{ort-ver}-v{cache-ver}
```

**Components**:
- `{crate}`: FFI crate name (kreuzberg-ffi, kreuzberg-py, kreuzberg-rb)
- `{platform}`: Platform identifier (linux-x64, macos-arm64, windows-x64, etc.)
- `{rust-hash}`: SHA256 hash (truncated to 12 chars) of all Rust source files in:
  - `crates/kreuzberg/**/*.rs`
  - `crates/kreuzberg-ffi/**/*.rs`
  - `crates/kreuzberg-tesseract/**/*.rs`
- `{cargo-hash}`: SHA256 hash (truncated to 12 chars) of:
  - Cargo.toml
  - Cargo.lock
- `{pdfium-ver}`: PDFium version (e.g., 7578)
- `{ort-ver}`: ONNX Runtime version (e.g., 1.23.2)
- `{cache-ver}`: Manual cache version for forced invalidation (default: v1)

**Example**:
```
ffi-kreuzberg-py-linux-x64-rust-a3f2b1c8d4e9-cargo-5c6d7e8f9a0b-pdfium-7578-ort-1.23.2-v1
```

### Binding Cache Key Format

```
{binding}-{platform}-rust-{rust-hash}-binding-{binding-hash}-deps-{deps-hash}-v{cache-ver}
```

**Components**:
- `{binding}`: Language binding name (python, ruby, node, go, java, csharp, php, wasm)
- `{platform}`: Platform identifier (linux-x86_64, macos-arm64, windows-x86_64, etc.)
- `{rust-hash}`: Inherited from FFI build (ensures dependent rebuild if FFI changes)
- `{binding-hash}`: SHA256 hash (truncated to 12 chars) of binding-specific source files
  - Examples: `crates/kreuzberg-py/**`, `packages/python/**`, `bindings/node/**`, etc.
- `{deps-hash}`: SHA256 hash (truncated to 12 chars) of dependency lock files
  - Examples: `Cargo.lock`, `uv.lock`, `pnpm-lock.yaml`, `Gemfile.lock`, etc.
- `{cache-ver}`: Manual cache version for forced invalidation (default: v1)

**Example**:
```
python-linux-x86_64-rust-a3f2b1c8d4e9-binding-2f3a4b5c6d7e-deps-8e9f0a1b2c3d-v1
```

### Cache Key Invalidation Rules

Cache keys are automatically invalidated when:

1. **Rust Source Changes**: Any modification to `.rs` files in core crates invalidates FFI cache
2. **Dependencies Change**: Changes to Cargo.lock (Rust), uv.lock (Python), pnpm-lock.yaml (Node), etc. invalidate dependent caches
3. **Binding Source Changes**: Changes to binding-specific files (e.g., packages/python/**) invalidate binding caches
4. **Version Updates**: Updated PDFium or ORT versions invalidate FFI cache
5. **Dependency Transitions**: Changes to FFI library force rebuild of all dependent bindings (due to rust-hash)
6. **Manual Invalidation**: Setting `cache-version` to a new value (v2, v3, etc.) forces cache miss

### Manual Invalidation

To force cache invalidation without changing code:

```yaml
# In workflow file, increase cache-version:
- uses: ./.github/actions/build-and-cache-ffi
  with:
    cache-version: v2  # Changed from v1
```

---

## How It Works

### Detailed Cache Flow

#### FFI Library Build and Cache

```
1. Validate Inputs
   ├─ Verify platform is valid
   └─ Verify ffi-crate is one of: kreuzberg-ffi, kreuzberg-py, kreuzberg-rb

2. Compute Hashes
   ├─ Hash all Rust source files (crates/kreuzberg/**/*.rs, etc.)
   ├─ Hash Cargo.toml and Cargo.lock
   └─ Output: rust-hash, cargo-hash (each 12 chars)

3. Generate Cache Key
   └─ Format: ffi-{crate}-{platform}-rust-{hash}-cargo-{hash}-pdfium-{ver}-ort-{ver}-v{ver}

4. Restore from Cache
   ├─ Try exact match: full cache key
   ├─ Try partial match 1: ffi-{crate}-{platform}-rust-{hash}-*
   ├─ Try partial match 2: ffi-{crate}-{platform}-*
   └─ Report: EXACT HIT / PARTIAL HIT / MISS

5. Build (if cache miss or skip-build-on-hit=false)
   ├─ Run task: rust:ffi:build:ci
   ├─ Detect library output (libkreuzberg_ffi.so, .dylib, .dll, .a)
   └─ Report: BUILD SUCCESS / BUILD FAILURE

6. Validate Artifacts
   ├─ Check file existence and size
   ├─ Verify binary format (ELF, Mach-O, PE, etc.)
   └─ Report: VALID / INVALID

7. Save to Cache (if build occurred)
   ├─ Save primary cache key with full FFI artifacts
   └─ Report: SAVED

8. Output Summary
   ├─ cache-hit: true/false
   ├─ cache-key: the full key used
   └─ rust-hash: for consumption by dependent builds
```

#### Language Binding Build and Cache

```
1. Validate Inputs
   ├─ Verify binding-name, platform, task-command
   ├─ Verify binding-files and dep-files patterns
   └─ Verify rust-hash is provided (from FFI build)

2. Compute Hashes
   ├─ Hash binding-specific source files (e.g., crates/kreuzberg-py/**, packages/python/**)
   ├─ Hash dependency lock files (Cargo.lock, uv.lock, pnpm-lock.yaml, etc.)
   └─ Output: binding-hash, deps-hash (each 12 chars)

3. Generate Cache Keys
   ├─ Primary key: {binding}-{platform}-rust-{rust-hash}-binding-{binding-hash}-deps-{deps-hash}-v{ver}
   └─ Fallback keys (3 levels):
      ├─ {binding}-{platform}-rust-{rust-hash}-*  (same platform/rust, different binding/deps)
      ├─ {binding}-{platform}-*                    (same platform, different everything)
      └─ {binding}-*                               (same binding only, different platform)

4. Restore from Cache
   ├─ Try exact match: primary cache key
   ├─ Try fallback 1, 2, 3 in order
   └─ Report: EXACT HIT / PARTIAL HIT / MISS

5. Validate Restored Artifacts (if cache hit and validate-artifacts=true)
   ├─ Check artifact existence and sizes
   ├─ Verify format based on artifact type:
   │  ├─ Python: .whl (ZIP format) or .tar.gz
   │  ├─ Ruby: .gem (TAR format) or .bundle/.so (shared library)
   │  ├─ Node: .node (shared library) or .tgz (package)
   │  ├─ WASM: .wasm (magic bytes 0061736d)
   │  ├─ Java: .jar (ZIP format)
   │  ├─ C#: .nupkg (ZIP format) or .dll/.so/.dylib
   │  └─ PHP: compiled extension or .so
   └─ Report: VALIDATED / INVALID (rebuild if invalid)

6. Build (if cache miss or artifact validation failed)
   ├─ Run task command (e.g., python:build:ci, node:build:release)
   └─ Report: BUILD SUCCESS / BUILD FAILURE

7. Validate Built Artifacts (if validate-artifacts=true)
   ├─ Check artifact existence and sizes
   └─ Verify artifact formats (same as step 5)

8. Save to Cache (if build occurred)
   ├─ Save primary cache key with full binding artifacts
   └─ Report: SAVED

9. Output Summary
   ├─ cache-hit: true/false
   ├─ cache-key: the full key used
   ├─ cache-matched-key: the key that matched (exact or partial)
   ├─ binding-hash: hash of binding sources
   ├─ deps-hash: hash of dependencies
   └─ artifact-validated: whether artifacts passed validation
```

### Fallback Key Strategy

The fallback key strategy provides graceful degradation when exact matches aren't available:

**FFI Fallback Keys** (in order of preference):
```
ffi-{crate}-{platform}-rust-{hash}-*              # Most specific - same platform & Rust
ffi-{crate}-{platform}-*                          # Less specific - same platform only
```

**Binding Fallback Keys** (in order of preference):
```
{binding}-{platform}-rust-{hash}-*                # Most specific - same platform & Rust
{binding}-{platform}-*                            # Less specific - same platform only
{binding}-*                                       # Least specific - same binding only
```

This strategy maximizes cache reuse:
- Exact match: Use exact cached version
- Partial match on rust-hash: Binding sources changed, but Rust FFI didn't
- Partial match on platform: Different platform, but same binding
- Partial match on binding: Different binding/platform, but same language

---

## Workflows

### Which Workflows Use Caching

| Workflow | FFI Caching | Binding Caching | Bindings Cached |
|----------|------------|-----------------|----------------|
| ci-python.yaml | ✓ | ✓ | Python wheels, sdist |
| ci-ruby.yaml | ✓ | ✓ | Ruby gems, extensions |
| ci-node.yaml | ✓ | ✓ | Node .node files |
| ci-go.yaml | ✓ | — | (native build) |
| ci-java.yaml | ✓ | — | (Maven cached separately) |
| ci-csharp.yaml | ✓ | — | (NuGet cached separately) |
| ci-php.yaml | ✓ | — | (PECL cached separately) |
| ci-wasm.yaml | — | ✓ | WASM modules |
| ci-rust.yaml | — | — | (no binding caching) |
| ci-validate.yaml | — | — | (validation only) |
| ci-docker.yaml | — | — | (Docker image building) |
| publish.yaml | — | — | (uses pre-built artifacts) |

### Typical Usage Pattern

```yaml
jobs:
  build-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Setup environment
      - uses: ./.github/actions/setup-rust
      - uses: ./.github/actions/setup-python-env
      - uses: ./.github/actions/install-task

      # Step 1: Build or restore FFI library
      - name: Build or restore FFI from cache
        id: ffi
        uses: ./.github/actions/build-and-cache-ffi
        with:
          platform: linux-x64
          ffi-crate: kreuzberg-py
          pdfium-version: "7578"
          ort-version: "1.23.2"

      # Step 2: Build or restore language binding
      - name: Build or restore Python wheels from cache
        id: wheels
        uses: ./.github/actions/build-and-cache-binding
        with:
          binding-name: python
          platform: linux-x64
          task-command: python:build:ci
          cache-paths: |
            target/wheels/
            packages/python/dist/
          rust-hash: ${{ steps.ffi.outputs.rust-hash }}
          binding-files: |
            crates/kreuzberg-py/**
            packages/python/**
          dep-files: |
            Cargo.lock
            uv.lock

      # Use the built/cached artifacts
      - name: Run tests
        run: scripts/test-python.sh
```

### Cache Coverage by Language

#### Python
- **FFI Crate**: kreuzberg-py
- **Cached Artifacts**: `target/wheels/*.whl`, `packages/python/dist/*.whl`
- **Dependency Files**: Cargo.lock, uv.lock
- **Task Command**: python:build:ci

#### Ruby
- **FFI Crate**: kreuzberg-rb
- **Cached Artifacts**: Ruby gems, compiled extensions
- **Dependency Files**: Cargo.lock, Gemfile.lock
- **Task Command**: ruby:build:ci

#### Node.js
- **FFI Crate**: kreuzberg-ffi (generic)
- **Cached Artifacts**: `.node` files, package tarballs
- **Dependency Files**: Cargo.lock, pnpm-lock.yaml, package-lock.json
- **Task Command**: node:build:release

#### WebAssembly
- **FFI Crate**: None (uses generic kreuzberg-ffi)
- **Cached Artifacts**: `.wasm` modules
- **Dependency Files**: Cargo.lock
- **Task Command**: wasm:build:ci

#### Go
- **FFI Crate**: kreuzberg-ffi
- **Cached Artifacts**: Go shared libraries
- **Dependency Files**: Cargo.lock
- **Task Command**: go:build:ci

#### Java
- **FFI Crate**: kreuzberg-ffi
- **Cached Artifacts**: JAR files
- **Dependency Files**: Cargo.lock, pom.xml
- **Note**: Maven handles its own caching

#### C#
- **FFI Crate**: kreuzberg-ffi
- **Cached Artifacts**: NuGet packages, native bindings
- **Dependency Files**: Cargo.lock, packages.lock.json
- **Note**: NuGet handles its own caching

#### PHP
- **FFI Crate**: kreuzberg-ffi
- **Cached Artifacts**: PHP extensions
- **Dependency Files**: Cargo.lock, composer.lock
- **Note**: Composer handles its own caching

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Cache Always Misses (Never Hits)

**Symptoms**: Every run shows "Cache MISS", builds are always slow.

**Possible Causes**:
1. **Platform Mismatch**: Different self-hosted runners with different architectures/configs
2. **Flaky Hash Computation**: Hash computation varies between runs
3. **Version Bumps**: PDFium/ORT versions in workflow changed
4. **Dependency Changes**: Lock files are not deterministic

**Solutions**:
1. **Check Platform Consistency**:
   ```bash
   # Verify platform identifier is consistent
   uname -m  # Should always return same value
   ```

2. **Verify Hash Stability**:
   ```bash
   # Run hash computation multiple times, should be identical
   scripts/ci/cache/compute-hash.sh "crates/kreuzberg/**/*.rs"
   scripts/ci/cache/compute-hash.sh "crates/kreuzberg/**/*.rs"
   scripts/ci/cache/compute-hash.sh "crates/kreuzberg/**/*.rs"
   ```

3. **Check Lock File Changes**:
   ```bash
   git status Cargo.lock uv.lock pnpm-lock.yaml
   # Ensure only expected changes
   ```

4. **Inspect Workflow Logs**:
   - Look for "Cache Key Generated" section in action logs
   - Compare keys from successful vs failed runs

#### Issue: Cache Hit But Build Still Fails

**Symptoms**: Cache shows "HIT" but subsequent build/test steps fail.

**Possible Causes**:
1. **Corrupted Cache Artifacts**: Cached artifacts are incomplete or corrupted
2. **Cross-Platform Incompatibility**: Cached artifact doesn't work on current platform
3. **Platform-Specific Issue**: Code change not reflected in cache key
4. **Validation Disabled**: `validate-artifacts: false` allowed bad artifacts through

**Solutions**:
1. **Enable Artifact Validation**:
   ```yaml
   - uses: ./.github/actions/build-and-cache-binding
     with:
      validate-artifacts: true  # Ensure enabled
   ```

2. **Force Cache Invalidation**:
   ```yaml
   - uses: ./.github/actions/build-and-cache-ffi
     with:
      cache-version: v2  # Increment to force rebuild
   ```

3. **Check Validation Output**:
   - Look for "Validating Cached Artifacts" section
   - Check file sizes: zero-byte files indicate corruption
   - Verify binary format: "Invalid binary format" indicates build failure

4. **Inspect Cache Contents** (via Actions UI):
   - GitHub Actions > Workflow run > Cache summary
   - Look for size and timestamp of cache entries

#### Issue: Cache Size Growing Too Large

**Symptoms**: Cache storage quota warnings, slow cache operations.

**Possible Causes**:
1. **Multiple Platforms Caching**: Different platform identifiers each create separate cache entries
2. **Build Artifacts Not Cleaned**: Old artifacts accumulate in cache
3. **Temporary Files Cached**: Build artifacts include unnecessary files
4. **Old Cache Versions Not Cleaned**: v1, v2, v3... all kept in storage

**Solutions**:
1. **Review Cached Paths**:
   ```yaml
   cache-paths: |
     target/wheels/        # Good: minimal artifacts
     target/release        # Bad: includes everything
     target/               # Very bad: entire target directory
   ```

2. **Clean Before Caching**:
   ```yaml
   - name: Clean artifacts before caching
     run: |
       rm -rf target/release/*.d
       rm -rf target/release/deps/*.d
       rm -rf target/release/incremental
   ```

3. **Use Specific Glob Patterns**:
   ```yaml
   cache-paths: |
     target/wheels/*.whl      # Only wheels
     packages/python/dist/*.whl
     target/release/libkreuzberg_ffi.so  # Specific files
   ```

4. **Cleanup Old Caches** (via GitHub Actions settings):
   - GitHub Settings > Actions > Caches
   - Delete old cache versions manually
   - Configure auto-delete policy if available

#### Issue: "Cache Miss" On Main Branch

**Symptoms**: Main branch builds always miss cache (should be nearly 100% hits).

**Possible Causes**:
1. **Workflow File Changes**: Changes to .github/workflows trigger new cache path
2. **Action Changes**: Changes to .github/actions invalidate cache keys
3. **Concurrent Builds**: Race condition between concurrent main branch builds
4. **Commit History Changes**: Git history rewrite changes file hashes

**Solutions**:
1. **Check for Workflow Changes**:
   ```bash
   git log --oneline -10 -- .github/workflows/ci-python.yaml
   git log --oneline -10 -- .github/actions/build-and-cache-ffi/action.yml
   ```

2. **Verify No File Reordering**:
   ```bash
   # Ensure Cargo.lock, uv.lock are not being regenerated
   git status Cargo.lock uv.lock
   ```

3. **Wait for Cache Stabilization**:
   - First run after changes will miss cache
   - Second+ runs should hit cache
   - Verify 2-3 consecutive runs show cache hits

4. **Check Fallback Key Matches**:
   - Look for "Cache PARTIAL HIT" in logs
   - Indicates different binding/deps but same platform/Rust
   - Still saves build time though slower than exact hit

#### Issue: Cross-Platform Cache Not Working

**Symptoms**: Different platforms can't share cache, cache never restores across OSes.

**Note**: Cross-platform caching is experimental and has known issues.

**Solutions**:
1. **Keep `enable-crossplatform-cache: false` (default)**:
   ```yaml
   - uses: ./.github/actions/build-and-cache-binding
     with:
      enable-crossplatform-cache: false  # Recommended
   ```

2. **Platform-Specific Cache Keys**:
   ```yaml
   platform: ${{ matrix.platform }}  # Ensures different keys per platform
   # Results in different cache keys: python-linux-x64-... vs python-macos-arm64-...
   ```

3. **Platform-Specific Artifacts**:
   - Binaries (.so, .dylib, .dll) are platform-specific
   - Cannot share cache across OS boundaries
   - Configure separate caches per platform in workflow

#### Issue: "Validation Failed - Will Rebuild"

**Symptoms**: Cached artifacts fail validation, triggering unnecessary rebuilds.

**Possible Causes**:
1. **Corrupted Cache Entry**: Previous build saved incomplete artifacts
2. **File Format Mismatch**: Artifact saved with unexpected format
3. **Zero-Byte Files**: Build produced empty files
4. **Validation Script Issue**: Validation logic is incorrect

**Solutions**:
1. **Force Cache Clear**:
   ```bash
   # Via Actions UI or GitHub CLI:
   gh actions-cache delete "<cache-key-pattern>" --all
   ```

2. **Increase Cache Version** (forces rebuild):
   ```yaml
   - uses: ./.github/actions/build-and-cache-ffi
     with:
      cache-version: v2
   ```

3. **Inspect Validation Logs**:
   - Look for "Invalid binary format:", "Empty file:", "Missing:"
   - These indicate what failed validation

4. **Verify Build Output**:
   ```bash
   # Locally reproduce build
   task python:build:ci
   ls -lh target/wheels/  # Verify files exist and have size
   file target/wheels/*.whl  # Verify file format
   ```

### Debugging Cache Issues

#### Enable Verbose Logging

Add debug output to workflow:

```yaml
jobs:
  build:
    env:
      ACTIONS_CACHE_DEBUG: true
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/build-and-cache-ffi
        with:
          platform: linux-x64
          ffi-crate: kreuzberg-py
```

#### Inspect Cache Metadata

```bash
# View all cached items
gh actions-cache list --repo kreuzberg-dev/kreuzberg

# View specific cache
gh actions-cache show --repo kreuzberg-dev/kreuzberg \
  "ffi-kreuzberg-py-linux-x64-rust-*"

# Delete specific cache
gh actions-cache delete "<full-cache-key>" --repo kreuzberg-dev/kreuzberg
```

#### Manual Hash Computation

Test cache key generation locally:

```bash
# Compute Rust hash
scripts/ci/cache/compute-hash.sh "crates/kreuzberg/**/*.rs" \
  "crates/kreuzberg-ffi/**/*.rs" "crates/kreuzberg-tesseract/**/*.rs"

# Compute Cargo hash
scripts/ci/cache/compute-hash.sh --files Cargo.toml Cargo.lock

# Compute binding hash
scripts/ci/cache/compute-hash.sh "crates/kreuzberg-py/**" "packages/python/**"

# Compute deps hash
scripts/ci/cache/compute-hash.sh --files Cargo.lock uv.lock
```

#### Artifact Validation

Test artifact validation locally:

```bash
# Validate FFI library
scripts/ci/cache/validate-cache.sh ffi target/release/libkreuzberg_ffi.so

# Validate Python wheel
scripts/ci/cache/validate-cache.sh python target/wheels/*.whl

# Validate Node module
scripts/ci/cache/validate-cache.sh node target/node.node
```

---

## Metrics

### Monitoring Cache Performance

#### Cache Hit Rate

Track over time to identify trends:

```bash
# Extract from workflow run logs
gh run view <run-id> --log | grep "Cache HIT"
gh run view <run-id> --log | grep "Cache MISS"

# Calculate percentage
HITS=$(gh run view <run-id> --log | grep -c "Cache HIT")
MISSES=$(gh run view <run-id> --log | grep -c "Cache MISS")
TOTAL=$((HITS + MISSES))
echo "Cache Hit Rate: $(( HITS * 100 / TOTAL ))%"
```

#### Expected Cache Hit Rates

| Branch | Expected Hit Rate | Reason |
|--------|-------------------|--------|
| main | >90% | Stable codebase, frequent rebuilds |
| feature | 50-70% | Changes to source files |
| deps | 0-30% | Dependency updates invalidate cache |
| release | >95% | Highly stable, minimal changes |

#### Build Time Savings

Measure time reduction from cache hits:

```bash
# Cache miss build time (full rebuild)
# Example: 25 minutes for Python wheel build

# Cache hit restore time
# Example: 45 seconds for Python wheel restore

# Savings per cache hit
# 25 * 60 - 45 = 1455 seconds = 24.25 minutes saved

# Savings across multi-platform run (5 platforms)
# 24.25 * 5 = 121.25 minutes saved per run
# 121.25 * 20 runs/month = ~2425 minutes/month = 40 hours/month
```

#### Performance Dashboards

To set up monitoring:

1. **GitHub Actions Built-in Metrics**:
   - GitHub Settings > Actions > Caches
   - View cache sizes and usage over time
   - Automatic retention policies

2. **Third-party Monitoring**:
   - Export workflow run metrics to external service
   - Track cache hit rates over time
   - Alert on cache hit rate drops

3. **Custom Metrics**:
   ```yaml
   - name: Report cache metrics
     shell: bash
     run: |
       echo "CACHE_HIT=${{ steps.wheels.outputs.cache-hit }}" >> $GITHUB_ENV
       echo "cache_hit=${{ steps.wheels.outputs.cache-hit }}" >> $GITHUB_OUTPUT
   ```

### Optimization Opportunities

Monitor these metrics to identify optimization opportunities:

1. **Low Cache Hit Rate on Main**: May indicate overly broad cache keys or frequent hash misses
2. **Large Cache Entries**: May indicate unnecessary files being cached
3. **Slow Cache Restore**: May indicate network issues or cache storage problems
4. **Validation Failures**: May indicate build system issues or corrupted artifacts

---

## Manual Cache Management

### Clearing Caches

#### Clear All Caches

```bash
# List all caches
gh actions-cache list --repo kreuzberg-dev/kreuzberg

# Delete specific caches matching pattern
gh actions-cache delete "ffi-kreuzberg-py-*" --repo kreuzberg-dev/kreuzberg --all

# Delete all caches (WARNING: clears everything)
gh actions-cache list --repo kreuzberg-dev/kreuzberg --json keys | \
  jq -r '.[].keys' | \
  xargs -I {} gh actions-cache delete {} --repo kreuzberg-dev/kreuzberg
```

#### Clear By Workflow

```bash
# Clear Python workflow caches only
gh actions-cache list --repo kreuzberg-dev/kreuzberg | grep python | awk '{print $1}' | \
  xargs -I {} gh actions-cache delete {} --repo kreuzberg-dev/kreuzberg
```

#### Clear By Platform

```bash
# Clear Linux x64 caches only
gh actions-cache list --repo kreuzberg-dev/kreuzberg | grep "linux-x64" | awk '{print $1}' | \
  xargs -I {} gh actions-cache delete {} --repo kreuzberg-dev/kreuzberg
```

#### Clear By Age

```bash
# Find caches older than 7 days (via GitHub UI only, not CLI)
# Navigate to: GitHub Settings > Actions > Caches
# Sort by "Last Accessed" and manually delete old entries
```

### Forcing Cache Invalidation

#### Method 1: Increment Cache Version

Edit workflow file:

```yaml
- uses: ./.github/actions/build-and-cache-ffi
  with:
    cache-version: v2  # Changed from v1
```

This automatically generates new cache keys and triggers rebuilds.

#### Method 2: Modify Source Files

Touch files to change their hash (temporary workaround):

```bash
# Temporary change to trigger cache invalidation
echo "# Temporary cache invalidation" >> Cargo.toml
git add Cargo.toml
git commit -m "ci: force cache invalidation"

# Then revert
git revert HEAD
```

#### Method 3: Delete Specific Cache Entries

```bash
# Delete one cache entry
gh actions-cache delete "ffi-kreuzberg-py-linux-x64-rust-*" \
  --repo kreuzberg-dev/kreuzberg

# Next run will compute new key and miss cache, triggering rebuild
```

### Cache Retention Policies

#### Configure Retention on GitHub

GitHub Settings > Actions > Caches:
- Default: 5GB per repository
- Retention: 7 days of inactivity
- Cleanup: Automatic removal of old entries

#### Manual Retention Management

To free up space when quota exceeded:

1. **Delete Non-Main Branch Caches**:
   ```bash
   # Keep only main and develop branch caches
   gh actions-cache list --repo kreuzberg-dev/kreuzberg | grep -v "main\|develop"
   ```

2. **Delete Old Binding Caches**:
   ```bash
   # Keep only latest version of each binding
   gh actions-cache list --repo kreuzberg-dev/kreuzberg | grep "python-" | sort -k 2 -r | tail -n +6
   ```

3. **Delete Platform-Specific Duplicates**:
   ```bash
   # If same artifacts available on multiple platforms, keep one
   # Example: keep only linux cache, delete windows/macos duplicates
   ```

### Monitoring Cache Usage

```bash
# View cache size and usage
gh actions-cache list --repo kreuzberg-dev/kreuzberg --json name,sizeBytes | \
  jq '.[] | "\(.name): \(.sizeBytes / 1024 / 1024)MB"'

# Calculate total cache size
gh actions-cache list --repo kreuzberg-dev/kreuzberg --json sizeBytes | \
  jq '[.[].sizeBytes] | add / 1024 / 1024 | . / 1024' | \
  awk '{printf "%.2f GB\n", $1}'
```

---

## Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        GitHub Actions Workflow                  │
│                      (ci-python.yaml, etc.)                     │
└────────────────────────────┬───────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
      ┌─────────────────────┐  ┌─────────────────────┐
      │  build-and-cache-   │  │ build-and-cache-    │
      │        ffi          │  │     binding         │
      │  (FFI Libraries)    │  │ (Language Bindings) │
      └──────────┬──────────┘  └──────────┬──────────┘
                 │                         │
                 │                    rust-hash
                 │                   (inherited)
                 │                         │
      ┌──────────┴──────────┐            │
      │                     │            │
      ▼                     ▼            ▼
   ┌──────┐    ┌────────────────────┐
   │Hashing│    │  Hashing:          │
   ├──────┤    ├────────────────────┤
   │Rust  │    │ Binding sources    │
   │Cargo │    │ Dependency files   │
   │      │    │ (includes Rust hash)
   └──┬───┘    └────────┬───────────┘
      │                 │
      ▼                 ▼
   ┌─────────────────────────────┐
   │ cache-binding-artifact      │
   │ (Low-level cache manager)   │
   ├─────────────────────────────┤
   │ • Restore (with fallbacks)  │
   │ • Save                      │
   │ • Validate artifacts        │
   │ • Report statistics         │
   └──┬──────────────────────────┘
      │
      ├──────────────────┬─────────────────┐
      │                  │                 │
      ▼                  ▼                 ▼
   ┌──────┐         ┌────────┐       ┌──────────┐
   │Cache │         │  Build │       │Validate  │
   │Store │         │  Task  │       │Artifacts │
   └──────┘         └────────┘       └──────────┘
      │                  │                 │
      └──────────────────┴─────────────────┘
                         │
                         ▼
              ┌────────────────────────┐
              │  Workflow Continuation │
              │   (Tests, Publishing)  │
              └────────────────────────┘
```

---

## Reference

### Cache Key Components Reference

#### Hash Computation Methods

```bash
# Glob patterns (recursive)
compute-hash.sh "crates/kreuzberg/**/*.rs"

# Specific files
compute-hash.sh --files Cargo.toml Cargo.lock

# Directories (recursive)
compute-hash.sh --dirs crates/kreuzberg/
```

#### Platforms

```
linux-x64       (x86_64 Linux)
linux-arm64     (ARM64 Linux, aarch64)
macos-x64       (Intel macOS)
macos-arm64     (Apple Silicon, aarch64)
windows-x64     (x86_64 Windows)
windows-arm64   (ARM64 Windows)
```

#### FFI Crates

```
kreuzberg-ffi       (Generic FFI bindings)
kreuzberg-py        (Python-specific FFI)
kreuzberg-rb        (Ruby-specific FFI)
```

#### Bindings

```
python              (Python wheels)
ruby                (Ruby gems)
node                (Node.js .node modules)
go                  (Go shared libraries)
java                (Java JARs)
csharp              (C# NuGet packages)
php                 (PHP extensions)
wasm                (WebAssembly modules)
```

### Quick Reference Commands

```bash
# View current cache keys (local)
scripts/ci/cache/compute-hash.sh "crates/**/*.rs"

# Validate artifacts
scripts/ci/cache/validate-cache.sh python target/wheels/*.whl

# List all caches
gh actions-cache list --repo kreuzberg-dev/kreuzberg

# Delete specific cache
gh actions-cache delete "ffi-kreuzberg-py-linux-x64-*" \
  --repo kreuzberg-dev/kreuzberg

# Monitor cache hits/misses
gh run view <RUN_ID> --log | grep "Cache "
```

---

## Glossary

- **Cache Hit**: Exact match of cache key, artifacts restored successfully
- **Cache Miss**: No matching cache key, rebuild required
- **Partial Hit**: Fallback key matched, older artifacts restored
- **Cache Key**: Deterministic hash-based identifier for cached content
- **Artifact**: Compiled output (library, wheel, gem, etc.)
- **FFI**: Foreign Function Interface (Rust-to-C bindings)
- **Rust Hash**: SHA256 hash of all Rust source files
- **Binding Hash**: SHA256 hash of language-specific binding files
- **Deps Hash**: SHA256 hash of dependency lock files
- **Validation**: Verification that cached artifacts are not corrupted
- **Fallback Key**: Partial cache key for degraded cache hits
- **Cache Version**: Manual override parameter for forced invalidation

---

## See Also

- [GitHub Actions Cache Documentation](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Kreuzberg Build System (Taskfile.yml)](../../Taskfile.yml)
- [Cache Computation Script](../../scripts/ci/cache/compute-hash.sh)
- [Cache Validation Script](../../scripts/ci/cache/validate-cache.sh)
- [CI Workflows](../.github/workflows)
