#!/usr/bin/env python3
"""Validate Flutter stack detection against the local fixture."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


EXPECTED_SIGNALS = {
    ("state_management", "riverpod"),
    ("routing", "go_router"),
    ("networking", "dio"),
    ("serialization", "freezed"),
    ("serialization", "json_serializable"),
    ("dependency_injection", "get_it"),
    ("localization", "flutter_localizations"),
    ("testing", "flutter_test"),
    ("testing", "mocktail"),
    ("code_generation", "build_runner"),
}

FORBIDDEN_SIGNALS = {
    ("state_management", "provider"),
    ("routing", "auto_route"),
    ("routing", "named_routes"),
    ("networking", "http"),
    ("testing", "mockito"),
}


def load_scanner(root: Path):
    path = root / "scripts" / "flutter_stack_scan.py"
    spec = importlib.util.spec_from_file_location("flutter_stack_scan", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load scanner: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    scanner = load_scanner(root)
    fixture = root / "tests" / "fixtures" / "flutter_sample"
    result = scanner.scan(fixture)

    errors: list[str] = []
    if not result["is_flutter_project"]:
        errors.append("fixture was not detected as a Flutter project")

    signals = result["signals"]
    for category, tool in sorted(EXPECTED_SIGNALS):
        if tool not in signals.get(category, {}):
            errors.append(f"missing signal: {category}.{tool}")

    for category, tool in sorted(FORBIDDEN_SIGNALS):
        if tool in signals.get(category, {}):
            errors.append(f"unexpected false-positive signal: {category}.{tool}")

    if "sdk" in result["dependencies"]:
        errors.append("nested pubspec key was incorrectly parsed as dependency: sdk")

    if errors:
        for error in errors:
            print(f"FAIL {error}")
        return 1

    print("PASS Flutter stack scanner fixture signals")
    return 0


if __name__ == "__main__":
    sys.exit(main())
