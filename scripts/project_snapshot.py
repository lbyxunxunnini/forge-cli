#!/usr/bin/env python3
"""Generate a compact project snapshot for fast-mode cold starts."""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


def load_stack_scanner(root: Path):
    path = root / "scripts" / "project_stack_scan.py"
    spec = importlib.util.spec_from_file_location("project_stack_scan", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load scanner: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def first_existing(root: Path, patterns: list[str], limit: int = 5) -> list[str]:
    results: list[str] = []
    for pattern in patterns:
        for path in root.glob(pattern):
            if path.is_file():
                results.append(str(path.relative_to(root)))
            elif path.is_dir():
                results.append(str(path.relative_to(root)) + "/")
            if len(results) >= limit:
                return results
    return results


def top_dirs(root: Path) -> list[str]:
    lib = root / "lib"
    if not lib.exists():
        return []
    return sorted(str(path.relative_to(root)) + "/" for path in lib.iterdir() if path.is_dir())[:12]


def find_project_guardrails(root: Path) -> list[str]:
    project_name = root.name
    patterns = [
        f".claude/.forge-cli/projects/{project_name}.project_guardrails.yaml",
        f".trae/.forge-cli/projects/{project_name}.project_guardrails.yaml",
        f".agents/.forge-cli/projects/{project_name}.project_guardrails.yaml",
        f".forge-cli/projects/{project_name}.project_guardrails.yaml",
    ]
    guardrails: list[str] = []
    for pattern in patterns:
        guardrails.extend(str(path.relative_to(root)) for path in root.glob(pattern))
    return guardrails


def snapshot(root: Path) -> dict[str, object]:
    repo = Path(__file__).resolve().parents[1]
    scanner = load_stack_scanner(repo)
    stack = scanner.scan(root)

    return {
        "project_root": str(root),
        "is_project": stack["is_project"],
        "pubspec": "pubspec.yaml" if (root / "pubspec.yaml").exists() else None,
        "lib_top_dirs": top_dirs(root),
        "project_guardrails": find_project_guardrails(root),
        "routing_entries": first_existing(root, ["lib/**/*router*.dart", "lib/**/routes*.dart"]),
        "state_entries": first_existing(
            root,
            [
                "lib/**/*provider*.dart",
                "lib/**/*notifier*.dart",
                "lib/**/*bloc*.dart",
                "lib/**/*cubit*.dart",
                "lib/**/*controller*.dart",
            ],
        ),
        "network_entries": first_existing(root, ["lib/**/*api*.dart", "lib/**/*client*.dart", "lib/**/*dio*.dart"]),
        "test_entries": first_existing(root, ["test/**/*_test.dart", "integration_test/**/*_test.dart"]),
        "stack_signals": stack["signals"],
    }


def print_text(data: dict[str, object]) -> None:
    print(f"project_root: {data['project_root']}")
    print(f"is_project: {str(data['is_project']).lower()}")
    print(f"pubspec: {data['pubspec']}")
    print(f"project_guardrails: {', '.join(data['project_guardrails']) if data['project_guardrails'] else 'none'}")
    print(f"lib_top_dirs: {', '.join(data['lib_top_dirs']) if data['lib_top_dirs'] else 'none'}")
    print(f"routing_entries: {', '.join(data['routing_entries']) if data['routing_entries'] else 'none'}")
    print(f"state_entries: {', '.join(data['state_entries']) if data['state_entries'] else 'none'}")
    print(f"network_entries: {', '.join(data['network_entries']) if data['network_entries'] else 'none'}")
    print(f"test_entries: {', '.join(data['test_entries']) if data['test_entries'] else 'none'}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project_root", type=Path)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    root = args.project_root.resolve()
    data = snapshot(root)
    if args.json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
    else:
        print_text(data)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
