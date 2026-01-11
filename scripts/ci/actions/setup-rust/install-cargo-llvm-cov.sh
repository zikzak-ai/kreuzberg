#!/usr/bin/env bash
set -euo pipefail

max_retries=3
retry_count=0

# Function to install cargo-llvm-cov with error handling
install_cargo_llvm_cov() {
  echo "Attempting to install cargo-llvm-cov (attempt $((retry_count + 1))/$max_retries)..."

  # Remove potentially corrupted cache on Windows to prevent fingerprint errors
  if [[ "$RUNNER_OS" == "Windows" ]]; then
    echo "Detected Windows platform. Clearing potentially corrupted cargo cache..."
    # Remove the cargo-llvm-cov binary cache to force fresh install
    rm -f ~/.cargo/bin/cargo-llvm-cov* 2>/dev/null || true

    # Clear cargo registry index on Windows (can have corruption issues)
    rm -rf ~/.cargo/registry/index ~/.cargo/registry/cache/.cargo-ok 2>/dev/null || true

    # Force cargo to rebuild its internal state
    cargo metadata --quiet 2>/dev/null || true
  fi

  # Install with force flag to bypass any cached state
  cargo install cargo-llvm-cov --force --locked 2>&1 || return 1
}

# Try to use existing installation
if command -v cargo-llvm-cov &>/dev/null; then
  existing_version=$(cargo-llvm-cov --version 2>&1 || echo "unknown")
  echo "cargo-llvm-cov already installed: $existing_version"

  # Verify it actually works (not corrupted)
  if cargo-llvm-cov --version &>/dev/null; then
    echo "cargo-llvm-cov verification passed"
  else
    echo "cargo-llvm-cov verification failed, will reinstall"
    # Force reinstall
    retry_count=0
    while [ $retry_count -lt $max_retries ]; do
      if install_cargo_llvm_cov; then
        echo "cargo-llvm-cov reinstalled successfully"
        break
      fi
      retry_count=$((retry_count + 1))
      if [ $retry_count -lt $max_retries ]; then
        echo "Installation failed, waiting before retry..."
        sleep 2
      fi
    done

    if [ $retry_count -eq $max_retries ]; then
      echo "ERROR: Failed to install cargo-llvm-cov after $max_retries attempts"
      exit 1
    fi
  fi
else
  # Install from scratch with retry logic
  while [ $retry_count -lt $max_retries ]; do
    if install_cargo_llvm_cov; then
      echo "cargo-llvm-cov installed successfully"
      break
    fi
    retry_count=$((retry_count + 1))
    if [ $retry_count -lt $max_retries ]; then
      echo "Installation failed, waiting before retry..."
      sleep 2
    fi
  done

  if [ $retry_count -eq $max_retries ]; then
    echo "ERROR: Failed to install cargo-llvm-cov after $max_retries attempts"
    exit 1
  fi
fi

# Ensure ~/.cargo/bin is in PATH for subsequent steps
if [[ -n "${GITHUB_PATH:-}" && -d "$HOME/.cargo/bin" ]]; then
  echo "$HOME/.cargo/bin" >>"$GITHUB_PATH"
fi

# Final verification
echo "Final verification of cargo-llvm-cov:"
cargo-llvm-cov --version
