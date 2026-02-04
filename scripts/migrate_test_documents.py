#!/usr/bin/env python3
"""
Test Documents Directory Migration Script

Reorganizes test_documents/ according to a standardized structure:
- Consolidates format-specific subdirectories
- Applies consistent naming convention: {category}_{descriptor}_{size}_{hash}.{ext}
- Generates mapping of old paths to new paths
- Supports code reference updates

Usage:
    python scripts/migrate_test_documents.py --dry-run
    python scripts/migrate_test_documents.py --execute
    python scripts/migrate_test_documents.py --dry-run --config custom_mapping.yaml
    python scripts/migrate_test_documents.py --update-references
"""

import argparse
import hashlib
import json
import os
import shutil
import sys
from collections import defaultdict
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
import re
import subprocess


@dataclass
class FileInfo:
    """Information about a file to be migrated."""
    old_path: Path
    new_path: Path
    category: str
    descriptor: str
    size_category: str
    ext: str

    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "old_path": str(self.old_path),
            "new_path": str(self.new_path),
            "category": self.category,
            "descriptor": self.descriptor,
            "size_category": self.size_category,
            "ext": self.ext,
        }


class TestDocumentsMigrator:
    """Orchestrates the test documents directory migration."""

    # Mapping of file extensions to target directories and categories
    EXTENSION_MAPPING = {
        # PDF variants - consolidate pdf/, pdfs/, pdf/
        ".pdf": ("pdf", {}),

        # Word documents
        ".docx": ("docx", {}),
        ".doc": ("doc", {}),

        # OpenDocument
        ".odt": ("odt", {}),
        ".odp": ("pptx", {}),  # OpenDocument Presentation -> pptx
        ".ods": ("xlsx", {}),  # OpenDocument Spreadsheet -> xlsx

        # Rich Text Format
        ".rtf": ("rtf", {}),

        # Excel/Spreadsheets
        ".xlsx": ("xlsx", {}),
        ".xls": ("xls", {}),
        ".csv": ("csv", {}),

        # PowerPoint
        ".pptx": ("pptx", {}),
        ".ppt": ("ppt", {}),

        # HTML/Web
        ".html": ("html", {}),
        ".htm": ("html", {}),

        # Markdown
        ".md": ("markdown", {}),
        ".markdown": ("markdown", {}),

        # E-books
        ".epub": ("epub", {}),
        ".mobi": ("epub", {}),
        ".azw": ("epub", {}),
        ".fb2": ("fictionbook", {}),  # FictionBook

        # Email
        ".eml": ("email", {}),
        ".msg": ("email", {}),

        # LaTeX
        ".tex": ("latex", {}),
        ".ltx": ("latex", {}),

        # reStructuredText
        ".rst": ("rst", {}),

        # Org-mode
        ".org": ("org", {}),

        # XML variants
        ".xml": ("xml", {}),
        ".xsl": ("xml", {}),
        ".xslt": ("xml", {}),
        ".jats": ("jats", {}),
        ".opml": ("opml", {}),
        ".docbook": ("docbook", {}),

        # JSON
        ".json": ("json", {}),

        # Jupyter Notebooks
        ".ipynb": ("jupyter", {}),

        # Images (for OCR)
        ".png": ("images", {}),
        ".jpg": ("images", {}),
        ".jpeg": ("images", {}),
        ".gif": ("images", {}),
        ".tiff": ("images", {}),
        ".bmp": ("images", {}),

        # Typst
        ".typ": ("typst", {}),

        # YAML
        ".yaml": ("yaml", {}),
        ".yml": ("yaml", {}),

        # Plain text
        ".txt": ("text", {}),

        # BibTeX
        ".bib": ("bibtex", {}),
    }

    # Categories for descriptive naming
    CATEGORIES = {
        "simple": "Simple/minimal documents",
        "tables": "Documents with tables",
        "images": "Documents with images",
        "formatted": "Documents with complex formatting",
        "unicode": "Unicode/multilingual content",
        "ocr": "Scanned/OCR documents",
        "protected": "Password-protected documents",
        "forms": "Forms and fillable documents",
        "embedded": "Documents with embedded content",
        "multipage": "Multi-page documents",
    }

    # Size categories
    SIZE_CATEGORIES = {
        "tiny": (0, 10 * 1024),  # < 10 KB
        "small": (10 * 1024, 100 * 1024),  # 10-100 KB
        "medium": (100 * 1024, 1024 * 1024),  # 100 KB - 1 MB
        "large": (1024 * 1024, 10 * 1024 * 1024),  # 1-10 MB
        "xlarge": (10 * 1024 * 1024, float('inf')),  # > 10 MB
    }

    def __init__(self, root_dir: Path = None):
        """Initialize the migrator.

        Args:
            root_dir: Root directory of the project (defaults to cwd)
        """
        self.root_dir = Path(root_dir or os.getcwd())
        self.test_docs_dir = self.root_dir / "test_documents"
        self.files_to_migrate: List[FileInfo] = []
        self.migration_map: Dict[str, str] = {}

    def get_size_category(self, file_path: Path) -> str:
        """Determine the size category of a file.

        Args:
            file_path: Path to the file

        Returns:
            Size category string (tiny, small, medium, large, xlarge)
        """
        try:
            size = file_path.stat().st_size
            for category, (min_size, max_size) in self.SIZE_CATEGORIES.items():
                if min_size <= size < max_size:
                    return category
        except OSError:
            pass
        return "small"  # Default to small

    def infer_descriptor(
        self, file_path: Path, old_rel_path: Path
    ) -> str:
        """Infer the descriptor from file name and path.

        Args:
            file_path: Full path to the file
            old_rel_path: Relative path from test_documents

        Returns:
            Descriptor string (or sanitized original name if no match)
        """
        name = file_path.stem.lower()

        # Extract descriptors from directory names
        path_parts = list(old_rel_path.parts[:-1])  # Exclude filename

        # Check for specific keywords in name or path
        keywords_map = {
            "simple": ["simple", "basic", "minimal", "fake", "sample", "extraction_test"],
            "tables": ["table", "grid", "spreadsheet", "cells"],
            "images": ["image", "photo", "picture", "chart", "img"],
            "formatted": ["format", "style", "styled", "rich", "unicode", "mixed"],
            "unicode": ["unicode", "utf", "chinese", "arabic", "hebrew", "german", "french", "spanish", "korean", "vertical"],
            "ocr": ["ocr", "scan", "scanned", "rotated"],
            "protected": ["protected", "password", "encrypted", "secure", "copy"],
            "forms": ["form", "fillable", "field"],
            "embedded": ["embedded", "embed", "composite", "composite"],
            "multipage": ["multipage", "multi", "page"],
        }

        combined_text = " ".join([name] + path_parts).lower()

        for descriptor, keywords in keywords_map.items():
            if any(keyword in combined_text for keyword in keywords):
                return descriptor

        # Default: use sanitized original name as descriptor
        # This ensures uniqueness
        sanitized_name = re.sub(r'[^a-z0-9_]', '_', name)
        return sanitized_name[:20]  # Limit to 20 chars

    def discover_files(self) -> List[FileInfo]:
        """Discover all files in test_documents that need migration.

        Returns:
            List of FileInfo objects
        """
        files = []
        name_collisions: Dict[str, int] = defaultdict(int)

        if not self.test_docs_dir.exists():
            print(f"Warning: {self.test_docs_dir} does not exist")
            return files

        # Walk through all files
        for file_path in self.test_docs_dir.rglob("*"):
            if not file_path.is_file():
                continue

            # Skip metadata files, but include them in new structure
            if file_path.name.startswith("."):
                continue

            ext = file_path.suffix.lower()

            # Check if extension is in our mapping
            if ext not in self.EXTENSION_MAPPING:
                print(f"Warning: Unknown extension {ext} for {file_path}")
                continue

            old_rel_path = file_path.relative_to(self.test_docs_dir)
            target_dir, _ = self.EXTENSION_MAPPING[ext]

            # Infer descriptor
            descriptor = self.infer_descriptor(file_path, old_rel_path)

            # Get size category
            size_category = self.get_size_category(file_path)

            # Build new path with unique identifier
            # Use part of the original filename to ensure uniqueness
            original_name = file_path.stem
            # Create a short unique part from the original name (first 15 chars or full if shorter)
            unique_part = re.sub(r'[^a-z0-9]', '', original_name.lower())[:15]

            # Create a hash suffix for true collisions
            # This handles cases where multiple files have the same normalized name
            collision_key = f"{descriptor}_{size_category}_{unique_part}"
            collision_count = name_collisions[collision_key]
            name_collisions[collision_key] += 1

            # Build filename: descriptor_size_uniquepart_hash.ext
            if collision_count > 0:
                # Generate short hash for collision resolution
                path_hash = hashlib.md5(str(old_rel_path).encode()).hexdigest()[:4]
                new_filename = f"{descriptor}_{size_category}_{unique_part}_{path_hash}{ext}"
            else:
                new_filename = f"{descriptor}_{size_category}_{unique_part}{ext}"

            new_path = self.test_docs_dir / target_dir / new_filename

            file_info = FileInfo(
                old_path=old_rel_path,
                new_path=new_path.relative_to(self.test_docs_dir),
                category=target_dir,
                descriptor=descriptor,
                size_category=size_category,
                ext=ext,
            )

            files.append(file_info)

        return files

    def validate_migration(self) -> Tuple[bool, List[str]]:
        """Validate the migration plan.

        Returns:
            Tuple of (is_valid, list of issues)
        """
        issues = []

        # Check for filename collisions
        new_paths = defaultdict(list)
        for file_info in self.files_to_migrate:
            new_paths[str(file_info.new_path)].append(str(file_info.old_path))

        for new_path, old_paths in new_paths.items():
            if len(old_paths) > 1:
                issues.append(
                    f"Collision: {new_path} would receive files from: {old_paths}"
                )

        # Check for required extensions
        missing_exts = []
        for file_info in self.files_to_migrate:
            if not file_info.ext:
                missing_exts.append(str(file_info.old_path))

        if missing_exts:
            issues.append(f"Files without extensions: {missing_exts}")

        return len(issues) == 0, issues

    def simulate_migration(self) -> None:
        """Print what the migration would do."""
        print("\n" + "=" * 80)
        print("TEST DOCUMENTS MIGRATION PLAN (DRY RUN)")
        print("=" * 80)

        # Discover files
        self.files_to_migrate = self.discover_files()

        if not self.files_to_migrate:
            print("No files to migrate.")
            return

        # Validate
        is_valid, issues = self.validate_migration()
        if not is_valid:
            print("\nValidation Issues:")
            for issue in issues:
                print(f"  - {issue}")
            return

        # Group by target directory
        by_target = defaultdict(list)
        for file_info in self.files_to_migrate:
            by_target[file_info.category].append(file_info)

        # Display migration plan
        total_size = 0
        for target_dir in sorted(by_target.keys()):
            files = by_target[target_dir]
            print(f"\n{target_dir}/ ({len(files)} files)")
            print("-" * 80)

            for file_info in sorted(files, key=lambda f: str(f.old_path)):
                old_path = self.test_docs_dir / file_info.old_path
                size = old_path.stat().st_size if old_path.exists() else 0
                total_size += size
                size_mb = size / (1024 * 1024)

                print(
                    f"  {str(file_info.old_path):50s} -> {str(file_info.new_path):40s} "
                    f"({size_mb:6.2f} MB) [{file_info.descriptor}_{file_info.size_category}]"
                )

        print("\n" + "=" * 80)
        print(f"Total files: {len(self.files_to_migrate)}")
        print(f"Total size: {total_size / (1024 * 1024):.2f} MB")
        print("=" * 80)

    def execute_migration(self) -> Tuple[bool, Dict[str, any]]:
        """Execute the migration.

        Returns:
            Tuple of (success, stats dict)
        """
        print("\n" + "=" * 80)
        print("EXECUTING TEST DOCUMENTS MIGRATION")
        print("=" * 80)

        # Discover files
        self.files_to_migrate = self.discover_files()

        if not self.files_to_migrate:
            print("No files to migrate.")
            return True, {"migrated": 0, "failed": 0, "skipped": 0}

        # Validate
        is_valid, issues = self.validate_migration()
        if not is_valid:
            print("\nValidation Issues:")
            for issue in issues:
                print(f"  ERROR: {issue}")
            return False, {}

        # Create target directories
        target_dirs = set(file_info.category for file_info in self.files_to_migrate)
        for target_dir in target_dirs:
            target_path = self.test_docs_dir / target_dir
            target_path.mkdir(parents=True, exist_ok=True)
            print(f"Created directory: {target_path}")

        # Perform migration
        migrated = 0
        failed = 0
        skipped = 0

        for file_info in self.files_to_migrate:
            old_full_path = self.test_docs_dir / file_info.old_path
            new_full_path = self.test_docs_dir / file_info.new_path

            try:
                if not old_full_path.exists():
                    print(f"  SKIP: {old_full_path} (not found)")
                    skipped += 1
                    continue

                # Check if destination already exists
                if new_full_path.exists():
                    print(f"  SKIP: {old_full_path} -> {new_full_path} (destination exists)")
                    skipped += 1
                    continue

                # Move file
                shutil.move(str(old_full_path), str(new_full_path))
                self.migration_map[str(file_info.old_path)] = str(file_info.new_path)

                print(f"  OK: {file_info.old_path} -> {file_info.new_path}")
                migrated += 1

            except Exception as e:
                print(f"  FAIL: {old_full_path} ({e})")
                failed += 1

        # Clean up empty directories
        print("\nCleaning up empty directories...")
        self._cleanup_empty_dirs()

        # Generate migration map
        self.generate_migration_map()

        print("\n" + "=" * 80)
        print(f"Migration complete:")
        print(f"  Migrated: {migrated}")
        print(f"  Failed: {failed}")
        print(f"  Skipped: {skipped}")
        print("=" * 80)

        return failed == 0, {
            "migrated": migrated,
            "failed": failed,
            "skipped": skipped,
        }

    def _cleanup_empty_dirs(self) -> None:
        """Remove empty directories."""
        # Walk bottom-up to remove empty dirs
        for root, dirs, files in os.walk(str(self.test_docs_dir), topdown=False):
            for dir_name in dirs:
                dir_path = os.path.join(root, dir_name)
                try:
                    if not os.listdir(dir_path):
                        os.rmdir(dir_path)
                        print(f"  Removed empty directory: {dir_path}")
                except OSError:
                    pass

    def generate_migration_map(self) -> None:
        """Generate mapping file (migration_map.json).

        The map can be used for reference updates.
        """
        output_path = self.root_dir / "migration_map.json"

        # Build complete map
        map_data = {
            "timestamp": str(Path.cwd()),
            "version": "1.0",
            "migrations": [f.to_dict() for f in self.files_to_migrate],
            "mapping": self.migration_map,
        }

        with open(output_path, "w") as f:
            json.dump(map_data, f, indent=2)

        print(f"Generated migration map: {output_path}")

    def find_references(self) -> Dict[str, List[Tuple[Path, int, str]]]:
        """Find all references to old file paths in the codebase.

        Returns:
            Dict mapping old paths to list of (file_path, line_num, line_content) tuples
        """
        references = defaultdict(list)

        # File extensions to search
        search_extensions = {
            ".rs", ".py", ".ts", ".tsx", ".js", ".jsx",
            ".rb", ".php", ".java", ".go", ".cs", ".ex", ".exs",
            ".toml", ".yaml", ".yml", ".json", ".md", ".txt"
        }

        # Pattern to match test_documents paths
        # Matches: test_documents/path/to/file or test_documents/path/to/file.ext
        pattern = re.compile(r'test_documents/[^\s"\'`<>]+')

        for root, dirs, files in os.walk(str(self.root_dir)):
            # Skip migration files and git
            dirs[:] = [d for d in dirs if d not in {".git", ".github", "target", "node_modules"}]

            for file in files:
                if Path(file).suffix not in search_extensions:
                    continue

                file_path = Path(root) / file
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        for line_num, line_content in enumerate(f, 1):
                            matches = pattern.findall(line_content)
                            for match in matches:
                                # Normalize path
                                match_path = match.replace("test_documents/", "")
                                references[match_path].append(
                                    (file_path, line_num, line_content.rstrip())
                                )
                except (OSError, UnicodeDecodeError):
                    pass

        return references

    def update_references(self, dry_run: bool = False) -> Tuple[int, int]:
        """Update references in the codebase to point to new paths.

        Args:
            dry_run: If True, only show what would be updated

        Returns:
            Tuple of (updated_count, error_count)
        """
        print("\n" + "=" * 80)
        print("UPDATING REFERENCES IN CODEBASE")
        print("=" * 80)

        # Load migration map if not already loaded
        if not self.migration_map:
            map_path = self.root_dir / "migration_map.json"
            if map_path.exists():
                with open(map_path, "r") as f:
                    data = json.load(f)
                    self.migration_map = data.get("mapping", {})
            else:
                print(f"Error: migration_map.json not found at {map_path}")
                return 0, 1

        # Find all references
        print("Scanning codebase for references...")
        references = self.find_references()

        updated = 0
        errors = 0

        # Update files
        for old_path, new_path in self.migration_map.items():
            if old_path not in references:
                continue

            for file_path, line_num, line_content in references[old_path]:
                try:
                    old_ref = f"test_documents/{old_path}"
                    new_ref = f"test_documents/{new_path}"

                    if dry_run:
                        print(f"\n{file_path}:{line_num}")
                        print(f"  Old: {old_ref}")
                        print(f"  New: {new_ref}")
                    else:
                        # Read file
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()

                        # Replace references
                        updated_content = content.replace(old_ref, new_ref)

                        if updated_content != content:
                            # Write file
                            with open(file_path, "w", encoding="utf-8") as f:
                                f.write(updated_content)

                            print(f"Updated: {file_path}:{line_num}")
                            updated += 1

                except Exception as e:
                    print(f"Error updating {file_path}: {e}")
                    errors += 1

        print("\n" + "=" * 80)
        print(f"References update complete:")
        print(f"  Updated: {updated}")
        print(f"  Errors: {errors}")
        print("=" * 80)

        return updated, errors


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Migrate test_documents directory to new structure",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Show what would be done (default)
  python scripts/migrate_test_documents.py

  # Execute the migration
  python scripts/migrate_test_documents.py --execute

  # Update code references (requires migration_map.json)
  python scripts/migrate_test_documents.py --update-references

  # Dry-run reference updates
  python scripts/migrate_test_documents.py --update-references --dry-run
        """,
    )

    parser.add_argument(
        "--execute",
        action="store_true",
        help="Execute the migration (default is dry-run)",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=True,
        help="Show what would be done (default)",
    )

    parser.add_argument(
        "--update-references",
        action="store_true",
        help="Update references in codebase",
    )

    parser.add_argument(
        "--root-dir",
        type=Path,
        help="Root directory of project (defaults to cwd)",
    )

    args = parser.parse_args()

    # Initialize migrator
    migrator = TestDocumentsMigrator(root_dir=args.root_dir)

    try:
        if args.update_references:
            # Update references
            dry_run = args.dry_run or not args.execute
            migrator.update_references(dry_run=dry_run)
        elif args.execute:
            # Execute migration
            success, stats = migrator.execute_migration()
            sys.exit(0 if success else 1)
        else:
            # Dry run (default)
            migrator.simulate_migration()

    except KeyboardInterrupt:
        print("\nMigration cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
