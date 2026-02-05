# Setup PaddleOCR Models - Quick Start

**TL;DR**: Copy-paste this into your CI workflow to cache PaddleOCR models.

## Minimal Setup (30 seconds)

```yaml
- uses: ./.github/actions/setup-paddle-ocr-models
  id: paddle-ocr

- run: cargo test --package kreuzberg-paddle-ocr
  env:
    PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-ocr.outputs.cache-dir }}
```

## All Models

Downloads all three models for full OCR pipeline:
- **Detection**: Text location (4.5 MB)
- **Classification**: Text orientation (1.5 MB)
- **Recognition**: Character reading (10 MB)

Default behavior - just use `uses: ./.github/actions/setup-paddle-ocr-models`

## Fast Setup (Detection Only)

Skip slow recognition model for quick tests:

```yaml
- uses: ./.github/actions/setup-paddle-ocr-models
  with:
    models: "det,cls"
```

Saves ~10 MB download + 5-10 seconds per first run.

## Cross-Architecture (Disable Cache)

When cross-compiling, disable caching (doesn't help):

```yaml
- uses: ./.github/actions/setup-paddle-ocr-models
  with:
    cache-enabled: false
```

## Check Cache Status

See if models were cached or downloaded:

```yaml
- run: echo "Cache hit: ${{ steps.paddle-ocr.outputs.cache-hit }}"

- run: echo "Models: ${{ steps.paddle-ocr.outputs.models-available }}"
```

## Available Outputs

```yaml
steps.paddle-ocr.outputs.cache-hit           # true/false
steps.paddle-ocr.outputs.cache-dir           # /home/runner/.cache/kreuzberg/paddle-ocr
steps.paddle-ocr.outputs.models-available    # det,cls,rec
```

## Environment Variable

Automatically set by the action:

```bash
$PADDLE_OCR_MODEL_CACHE  # Points to model cache directory
```

Use in scripts:

```bash
echo "Models at: $PADDLE_OCR_MODEL_CACHE"
```

## Performance

| Scenario | Time |
|----------|------|
| First run (download) | 20-30 seconds |
| Cached run | 1-2 seconds |
| No cache disabled | 5-10 seconds |

## Full CI Integration Example

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: ./.github/actions/setup-paddle-ocr-models
        id: paddle-ocr

      - name: Setup Rust
        uses: dtolnay/rust-toolchain@stable

      - name: Run tests
        run: cargo test --all
        env:
          PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-ocr.outputs.cache-dir }}
```

## Troubleshooting

**Models not found in tests?**
```yaml
env:
  PADDLE_OCR_MODEL_CACHE: ${{ steps.paddle-ocr.outputs.cache-dir }}
```

**Cache not working?**
- Go to repo Settings → Actions → Caches
- Clear old `paddle-ocr-*` entries
- Try running action again

**Download failing?**
- Check Hugging Face API status
- Use `cache-enabled: false` to skip cache
- Action continues even if download fails

## Documentation

- **Full README**: [`README.md`](./README.md) - Complete reference
- **Integration Patterns**: [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md) - Advanced examples
- **Action YAML**: [`action.yml`](./action.yml) - Technical details

## One-Liner

Single model (fastest):
```yaml
- uses: ./.github/actions/setup-paddle-ocr-models
  with:
    models: det
```

All inputs and outputs at a glance:
```yaml
- uses: ./.github/actions/setup-paddle-ocr-models
  id: paddle
  with:
    cache-enabled: true
    models: det,cls,rec
    cache-key-suffix: paddle-ocr-v4-onnx

# Access outputs:
# ${{ steps.paddle.outputs.cache-hit }}
# ${{ steps.paddle.outputs.cache-dir }}
# ${{ steps.paddle.outputs.models-available }}
```

## Need Help?

1. **Quick integration**: Read this file
2. **Real-world examples**: See `INTEGRATION_GUIDE.md`
3. **All details**: Check `README.md`
4. **Technical spec**: Review `action.yml`
