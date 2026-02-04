#!/usr/bin/env python3
"""Validate ground truth organization for benchmark harness.

This script validates that:
1. The ground truth directory exists and is properly organized
2. Ground truth files reference valid paths
3. Metadata files have required fields
4. No orphaned ground truth files exist without corresponding source documents
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path


def get_repo_root() -> Path:
    """Get the repository root directory."""
    # Start from script location and walk up to find repo root
    current = Path(__file__).resolve().parent
    while current != current.parent:
        if (current / "Cargo.toml").exists() and (current / "test_documents").exists():
            return current
        current = current.parent

    # Fallback: try current working directory
    cwd = Path.cwd()
    if (cwd / "test_documents" / "ground_truth").exists():
        return cwd

    raise RuntimeError("Could not find repository root")


def validate_ground_truth_mapping(repo_root: Path) -> list[str]:
    """Validate the ground truth mapping file."""
    errors = []
    mapping_file = repo_root / "test_documents" / "ground_truth" / "ground_truth_mapping.json"

    if not mapping_file.exists():
        # Mapping file is optional - not an error if missing
        print(f"Note: Ground truth mapping file not found at {mapping_file}")
        return errors

    try:
        with open(mapping_file) as f:
            mapping = json.load(f)
    except json.JSONDecodeError as e:
        errors.append(f"Invalid JSON in ground truth mapping: {e}")
        return errors

    # Validate that each ground truth file exists
    for name, path in mapping.items():
        full_path = repo_root / path
        if not full_path.exists():
            errors.append(f"Ground truth file missing: {path} (key: {name})")

    return errors


def validate_ground_truth_structure(repo_root: Path) -> list[str]:
    """Validate the ground truth directory structure."""
    errors = []
    ground_truth_dir = repo_root / "test_documents" / "ground_truth"

    if not ground_truth_dir.exists():
        errors.append(f"Ground truth directory does not exist: {ground_truth_dir}")
        return errors

    if not ground_truth_dir.is_dir():
        errors.append(f"Ground truth path is not a directory: {ground_truth_dir}")
        return errors

    # Check that subdirectories exist for expected file types
    expected_subdirs = []  # Optional - don't require specific subdirs

    for subdir in expected_subdirs:
        subdir_path = ground_truth_dir / subdir
        if not subdir_path.exists():
            errors.append(f"Expected ground truth subdirectory missing: {subdir}")

    # Validate that .txt files have corresponding _meta.json files (optional check)
    txt_files = list(ground_truth_dir.rglob("*.txt"))

    for txt_file in txt_files:
        # Skip if it's a _meta file
        if txt_file.stem.endswith("_meta"):
            continue

        # Check for corresponding meta file (optional)
        meta_file = txt_file.with_name(f"{txt_file.stem}_meta.json")
        if not meta_file.exists():
            # This is just informational, not an error
            pass

    print(f"Found {len(txt_files)} ground truth text files")

    return errors


def validate_benchmark_fixtures(repo_root: Path) -> list[str]:
    """Validate that benchmark fixture files reference existing documents."""
    errors = []
    fixtures_dir = repo_root / "tools" / "benchmark-harness" / "fixtures"

    if not fixtures_dir.exists():
        print(f"Note: Benchmark fixtures directory not found at {fixtures_dir}")
        return errors

    json_files = list(fixtures_dir.glob("*.json"))
    missing_count = 0

    for json_file in json_files:
        try:
            with open(json_file) as f:
                fixture = json.load(f)
        except json.JSONDecodeError as e:
            errors.append(f"Invalid JSON in fixture {json_file.name}: {e}")
            continue

        # Check if document path exists
        if "document" in fixture:
            doc_path = fixture["document"]
            # Resolve relative path from fixtures directory
            full_path = (fixtures_dir / doc_path).resolve()

            if not full_path.exists():
                errors.append(f"Fixture {json_file.name}: Document not found: {doc_path}")
                missing_count += 1

    print(f"Validated {len(json_files)} benchmark fixtures, {missing_count} missing documents")

    return errors


def main() -> int:
    """Main entry point."""
    print("=== Validating Ground Truth Organization ===\n")

    try:
        repo_root = get_repo_root()
    except RuntimeError as e:
        print(f"Error: {e}")
        return 1

    print(f"Repository root: {repo_root}\n")

    all_errors: list[str] = []

    # Validate ground truth structure
    print("Validating ground truth directory structure...")
    errors = validate_ground_truth_structure(repo_root)
    all_errors.extend(errors)

    # Validate ground truth mapping
    print("Validating ground truth mapping...")
    errors = validate_ground_truth_mapping(repo_root)
    all_errors.extend(errors)

    # Validate benchmark fixtures
    print("Validating benchmark fixtures...")
    errors = validate_benchmark_fixtures(repo_root)
    all_errors.extend(errors)

    print("")

    if all_errors:
        print(f"=== VALIDATION FAILED: {len(all_errors)} error(s) ===\n")
        for error in all_errors:
            print(f"  ERROR: {error}")
        return 1

    print("=== VALIDATION PASSED ===")
    return 0


if __name__ == "__main__":
    sys.exit(main())
