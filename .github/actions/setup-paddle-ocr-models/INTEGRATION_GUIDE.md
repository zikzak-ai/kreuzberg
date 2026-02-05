# PaddleOCR Models Cache - Integration Guide

This guide shows how to integrate the `setup-paddle-ocr-models` action into your CI/CD workflows.

## Quick Integration

To add PaddleOCR model caching to your workflow:

```yaml
- name: Setup PaddleOCR Models
  uses: ./.github/actions/setup-paddle-ocr-models
  id: paddle-ocr
```

Then use the outputs in subsequent steps:

```yaml
- name: Run PaddleOCR tests
  run: cargo test --package kreuzberg-paddle-ocr
  env:
    PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-ocr.outputs.cache-dir }}
```

## Integration Patterns

### Pattern 1: Minimal (Default All Models)

```yaml
jobs:
  paddle-ocr-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PaddleOCR Models
        uses: ./.github/actions/setup-paddle-ocr-models
        id: paddle-models

      - name: Run tests
        run: cargo test --all
```

### Pattern 2: Conditional Setup

```yaml
jobs:
  paddle-ocr-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PaddleOCR Models
        uses: ./.github/actions/setup-paddle-ocr-models
        if: matrix.include-paddle-ocr == 'true'
        id: paddle-models
        with:
          cache-enabled: true
          models: "det,rec"  # Skip classification for speed

      - name: Run tests
        run: |
          if [ -n "${{ steps.paddle-models.outputs.models-available }}" ]; then
            echo "PaddleOCR available, running tests..."
            cargo test --package kreuzberg-paddle-ocr
          else
            echo "PaddleOCR not available, skipping OCR tests"
          fi
```

### Pattern 3: Cross-Platform Matrix

```yaml
jobs:
  paddle-ocr-matrix:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
            use-cache: true
          - os: ubuntu-24.04-arm
            target: aarch64-unknown-linux-gnu
            use-cache: false  # Cross-arch, disable cache
          - os: macos-latest
            target: aarch64-apple-darwin
            use-cache: true
          - os: windows-latest
            target: x86_64-pc-windows-msvc
            use-cache: true

    steps:
      - uses: actions/checkout@v4

      - name: Setup PaddleOCR Models
        uses: ./.github/actions/setup-paddle-ocr-models
        with:
          cache-enabled: ${{ matrix.use-cache == 'true' && 'true' || 'false' }}
        id: paddle-models

      - name: Report cache status
        run: |
          echo "Cache hit: ${{ steps.paddle-models.outputs.cache-hit }}"
          echo "Available models: ${{ steps.paddle-models.outputs.models-available }}"
          echo "Cache directory: ${{ steps.paddle-models.outputs.cache-dir }}"
```

### Pattern 4: Integration with Full CI Pipeline

This pattern shows how to integrate PaddleOCR models setup with other model caches:

```yaml
jobs:
  rust-unit-tests:
    name: Rust Unit Tests (${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            target: x86_64-unknown-linux-gnu
          - os: macos-latest
            target: aarch64-apple-darwin

    steps:
      - uses: actions/checkout@v4

      - name: Install system dependencies
        uses: ./.github/actions/install-system-deps

      - name: Setup OpenSSL
        uses: ./.github/actions/setup-openssl

      # Model caches in parallel
      - name: Cache Hugging Face models (fastembed)
        uses: ./.github/actions/cache-hf-fastembed

      - name: Setup PaddleOCR Models
        uses: ./.github/actions/setup-paddle-ocr-models
        id: paddle-models

      - name: Setup Rust
        uses: ./.github/actions/setup-rust

      - name: Setup ONNX Runtime
        uses: ./.github/actions/setup-onnx-runtime

      - name: Run unit tests
        run: cargo test --workspace
        env:
          PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-models.outputs.cache-dir }}
```

### Pattern 5: Selective Model Download

For faster CI when you only need specific models:

```yaml
jobs:
  paddle-ocr-detection-only:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PaddleOCR Detection Model Only
        uses: ./.github/actions/setup-paddle-ocr-models
        with:
          models: "det"  # Only download detection model
          cache-key-suffix: "paddle-ocr-det-only"
        id: paddle-det

      - name: Run detection tests
        run: cargo test --package kreuzberg-paddle-ocr --lib paddle_ocr::detector
```

## Workflow Integration Examples

### In ci-rust.yaml

Add the PaddleOCR setup step to the `rust-unit` job:

```yaml
rust-unit:
  name: Rust Unit Tests (${{ matrix.os }})
  runs-on: ${{ matrix.os }}
  strategy:
    matrix:
      include:
        - os: ubuntu-latest
          target: x86_64-unknown-linux-gnu
        # ... other OS matrix entries

  steps:
    - uses: actions/checkout@v4

    # ... existing steps ...

    - name: Cache Hugging Face models (fastembed)
      uses: ./.github/actions/cache-hf-fastembed

    - name: Setup PaddleOCR Models    # ADD THIS
      uses: ./.github/actions/setup-paddle-ocr-models
      id: paddle-models

    - name: Setup Rust
      uses: ./.github/actions/setup-rust
      # ... rest of setup ...

    - name: Run unit tests
      run: task rust:test:ci
      env:
        PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-models.outputs.cache-dir }}
```

### In Custom CI Workflow

Create a dedicated `ci-paddle-ocr.yaml` workflow:

```yaml
name: CI PaddleOCR

on:
  push:
    branches: [main]
    paths:
      - 'crates/kreuzberg-paddle-ocr/**'
      - '.github/actions/setup-paddle-ocr-models/**'
      - '.github/workflows/ci-paddle-ocr.yaml'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]

    steps:
      - uses: actions/checkout@v4

      - name: Setup PaddleOCR Models
        uses: ./.github/actions/setup-paddle-ocr-models
        id: paddle-models

      - name: Setup Rust
        uses: ./.github/actions/setup-rust

      - name: Run PaddleOCR tests
        run: cargo test --package kreuzberg-paddle-ocr
        env:
          PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-models.outputs.cache-dir }}

      - name: Display model cache info
        if: always()
        run: |
          echo "Cache hit: ${{ steps.paddle-models.outputs.cache-hit }}"
          echo "Available models: ${{ steps.paddle-models.outputs.models-available }}"
          du -sh ${{ steps.paddle-models.outputs.cache-dir }}
```

## Environment Variable Usage

The action sets the `PADDLE_OCR_MODEL_CACHE` environment variable automatically. Access it in your code:

### Rust

```rust
use std::env;
use std::path::PathBuf;

fn main() {
    let cache_dir = env::var("PADDLE_OCR_MODEL_CACHE")
        .unwrap_or_else(|_| "~/.cache/kreuzberg/paddle-ocr".to_string());

    let model_manager = ModelManager::new(PathBuf::from(cache_dir));
    let paths = model_manager.ensure_models_exist()?;
}
```

### Shell Scripts

```bash
if [ -n "$PADDLE_OCR_MODEL_CACHE" ]; then
    echo "Model cache: $PADDLE_OCR_MODEL_CACHE"
    cargo test --package kreuzberg-paddle-ocr
fi
```

## Diagnostics and Debugging

### Check Cache Hit Status

```yaml
- name: Report PaddleOCR cache status
  if: always()
  run: |
    echo "Cache hit: ${{ steps.paddle-models.outputs.cache-hit }}"
    echo "Models available: ${{ steps.paddle-models.outputs.models-available }}"
    echo "Cache directory: ${{ steps.paddle-models.outputs.cache-dir }}"
    echo ""
    echo "Cache contents:"
    ls -lh ${{ steps.paddle-models.outputs.cache-dir }} || echo "Cache directory not found"
```

### View Cache in Repository

1. Go to repository Settings
2. Select "Actions" → "Caches"
3. Filter by `paddle-ocr` key prefix
4. View cache size and creation date

### Manual Cache Clearing

To delete the model cache from a workflow:

```yaml
- name: Clear PaddleOCR cache
  run: rm -rf ~/.cache/kreuzberg/paddle-ocr
```

Or delete via GitHub CLI:

```bash
# Requires gh CLI installed
gh actions-cache delete "paddle-ocr-v4-onnx-Linux-X64-v1" --confirm
```

## Performance Metrics

### First Run (Cache Miss)

- Setup directory: <1 second
- Detection model download: 5-10 seconds (4.5 MB)
- Classification model download: 3-5 seconds (1.5 MB)
- Recognition model download: 10-15 seconds (10 MB)
- **Total: ~20-30 seconds**

### Subsequent Runs (Cache Hit)

- Cache restore: <1 second
- Model verification: <1 second
- **Total: ~1-2 seconds**

### Network Bandwidth

- Cache miss: ~16 MB download
- Cache hit: 0 MB (cached locally)
- Hugging Face API calls: Minimal (simple HTTP GET)

## Troubleshooting Integration Issues

### Models not accessible in tests

**Problem**: Tests can't find models even though action completed successfully

**Solution**: Ensure the `PADDLE_OCR_MODEL_CACHE` environment variable is set:

```yaml
- name: Run tests
  run: cargo test --package kreuzberg-paddle-ocr
  env:
    PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-models.outputs.cache-dir }}
```

### Cache not being restored

**Problem**: Action shows cache miss every time (no `cache-hit: true`)

**Possible causes**:
- Different OS/architecture (cache keys don't match)
- `cache-enabled: false` (caching disabled)
- Cache evicted (>10 GB limit reached)

**Solution**:
- Check cache status in Settings → Actions → Caches
- Clear old caches to make space
- Verify `cache-enabled` is set to `true`

### Download timeouts

**Problem**: Downloads fail with timeout errors

**Solution**: The action uses 300-second timeout. If still failing:
- Check Hugging Face API status
- Try without cache (`cache-enabled: false`)
- Check network connectivity

### Cross-architecture matrix builds

**Problem**: When building for multiple architectures, caches don't help

**Solution**: Disable caching for non-native architectures:

```yaml
strategy:
  matrix:
    include:
      - os: ubuntu-latest
        arch: x86_64
        use-cache: true
      - os: ubuntu-latest  # Cross-compile
        arch: aarch64
        use-cache: false

- uses: ./.github/actions/setup-paddle-ocr-models
  with:
    cache-enabled: ${{ matrix.use-cache == 'true' && 'true' || 'false' }}
```

## Best Practices

1. **Place early in workflow**: Cache setup should run after checkout but before heavy compilation steps

2. **Share cache across jobs**: Use same `cache-key-suffix` to share cache between jobs

3. **Report status**: Always show cache hit status for monitoring:
   ```yaml
   - run: echo "Cache hit: ${{ steps.paddle-models.outputs.cache-hit }}"
   ```

4. **Handle gracefully**: Check `models-available` output and skip tests if needed:
   ```yaml
   - run: |
       if [[ "${{ steps.paddle-models.outputs.models-available }}" =~ "det" ]]; then
         echo "Running detection tests..."
       fi
   ```

5. **Document in README**: Update your project README with PaddleOCR setup requirements

6. **Monitor cache size**: Regularly check cache usage in Settings to avoid hitting limits

## See Also

- [Setup PaddleOCR Models Action](./README.md)
- [Action YAML Reference](./action.yml)
- [kreuzberg CI Documentation](../../docs/ci.md)
- [PaddleOCR Official Documentation](https://github.com/PaddlePaddle/PaddleOCR)
