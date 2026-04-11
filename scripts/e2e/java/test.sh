#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"

source "${REPO_ROOT}/scripts/lib/common.sh"
source "${REPO_ROOT}/scripts/lib/library-paths.sh"

validate_repo_root "$REPO_ROOT" || exit 1

setup_rust_ffi_paths "$REPO_ROOT"
setup_pdfium_paths
setup_onnx_paths

# Determine the FFI directory (prefer release, fall back to debug)
KREUZBERG_FFI_DIR="${REPO_ROOT}/target/release"
if [ ! -f "$KREUZBERG_FFI_DIR/libkreuzberg_ffi.dylib" ] && [ ! -f "$KREUZBERG_FFI_DIR/libkreuzberg_ffi.so" ] && [ ! -f "$KREUZBERG_FFI_DIR/kreuzberg_ffi.dll" ]; then
  KREUZBERG_FFI_DIR="${REPO_ROOT}/target/debug"
fi
export KREUZBERG_FFI_DIR

# Use sdkman if available
if [ -f ~/.sdkman/bin/sdkman-init.sh ]; then
  # shellcheck source=/dev/null
  source ~/.sdkman/bin/sdkman-init.sh
  sdk use java 25.0.2-tem 2>/dev/null || true
  sdk use maven 3.9.11 2>/dev/null || true
fi

cd "${REPO_ROOT}/e2e/java"
mvn -B -DtrimStackTrace=false -Dsurefire.useFile=false test
