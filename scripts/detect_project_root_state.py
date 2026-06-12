#!/usr/bin/env python3
"""Detect whether the current root is an empty new workspace, project app, or non-project workspace."""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path


def visible_entries(root: Path) -> list[str]:
    return sorted(entry.name for entry in root.iterdir() if not entry.name.startswith("."))


def detect_root_state(root: Path) -> dict[str, object]:
    entries = visible_entries(root)
    is_empty_dir = len(entries) == 0
    has_pubspec = (root / "pubspec.yaml").is_file()
    has_lib_dir = (root / "lib").is_dir()

    if is_empty_dir:
        root_type = "empty_new"
        forge_enabled = True
    elif has_pubspec and has_lib_dir:
        root_type = "existing"
        forge_enabled = True
    else:
        root_type = "non_project"
        forge_enabled = False

    return {
        "project_root": str(root),
        "project_name": root.name,
        "root_type": root_type,
        "forge_enabled": forge_enabled,
        "is_empty_dir": is_empty_dir,
        "has_pubspec": has_pubspec,
        "has_lib_dir": has_lib_dir,
        "ignored_hidden_files": True,
        "visible_entries": entries[:20],
        "checked_at": int(time.time()),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("project_root", nargs="?", default=".")
    args = parser.parse_args()

    root = Path(args.project_root).resolve()
    print(json.dumps(detect_root_state(root), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
