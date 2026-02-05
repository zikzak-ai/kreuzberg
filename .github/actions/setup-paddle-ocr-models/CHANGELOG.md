# Setup PaddleOCR Models - Changelog

## [Current] Directory Structure Fix

### Changes Made

Fixed critical mismatch between action output directory structure and `ModelManager` expectations:

#### Before (Incorrect)
```
~/.cache/kreuzberg/paddle-ocr/
├── det_model.onnx    (flat file)
├── cls_model.onnx    (flat file)
└── rec_model.onnx    (flat file)
```

#### After (Correct)
```
~/.cache/kreuzberg/paddle-ocr/
├── det/
│   └── model.onnx
├── cls/
│   └── model.onnx
└── rec/
    └── model.onnx
```

### Files Modified

1. **action.yml**
   - Updated detection model download step to create `det/model.onnx` instead of `det_model.onnx`
   - Updated classification model download step to create `cls/model.onnx` instead of `cls_model.onnx`
   - Updated recognition model download step to create `rec/model.onnx` instead of `rec_model.onnx`
   - Updated model verification step to check for models in subdirectories

2. **README.md**
   - Updated "Verifying models are present" section with correct directory structure
   - Added explanation of directory structure alignment with `ModelManager`

### Impact

- **Fixes**: Models are now stored in the exact directory structure expected by `model_manager.rs`
- **Compatibility**: Works with `ModelManager::ensure_models_exist()` without modification
- **Backward Compatibility**: Existing cache entries in flat structure will be ignored; new caches use correct structure
- **Migration**: If you have old flat-structure cache entries, clear them from GitHub Actions cache (Settings → Actions → Caches)

### Verification

The action now correctly creates model structure that `ModelManager::model_file_path()` expects:

```rust
pub fn model_file_path(&self, model_type: &str) -> PathBuf {
    self.model_path(model_type).join("model.onnx")  // {cache_dir}/det/model.onnx
}
```

### Testing

To verify the directory structure locally after running the action:

```bash
ls -lh ~/.cache/kreuzberg/paddle-ocr/
ls -lh ~/.cache/kreuzberg/paddle-ocr/det/model.onnx
ls -lh ~/.cache/kreuzberg/paddle-ocr/cls/model.onnx
ls -lh ~/.cache/kreuzberg/paddle-ocr/rec/model.onnx
```

### CI Integration

No changes needed to existing CI workflows. The action:
- Still caches all models together under `~/.cache/kreuzberg/paddle-ocr/`
- Still exports `PADDLE_OCR_MODEL_CACHE` environment variable
- Still outputs cache hit status and available models
- Now stores models in the correct directory structure for `ModelManager`
