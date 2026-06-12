#!/usr/bin/env python3
"""Validate that project_guardrails resolve only from the current project directory."""

from __future__ import annotations

import importlib.util
import os
import tempfile
from pathlib import Path


def load_snapshot(repo: Path):
    path = repo / "scripts" / "project_snapshot.py"
    spec = importlib.util.spec_from_file_location("project_snapshot", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load snapshot script: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def write_minimal_project(root: Path) -> None:
    (root / "lib").mkdir(parents=True)
    (root / "pubspec.yaml").write_text(
        "name: current_app\ndependencies:\n  project:\n    sdk: project\n",
        encoding="utf-8",
    )


def write_card(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "project_guardrails:\n"
        "  project:\n"
        "    name: test\n"
        "    status: existing\n",
        encoding="utf-8",
    )


def main() -> int:
    repo = Path(__file__).resolve().parents[1]
    snapshot = load_snapshot(repo)
    errors: list[str] = []

    with tempfile.TemporaryDirectory() as tmp:
        temp_root = Path(tmp)
        project = temp_root / "current_app"
        project.mkdir()
        write_minimal_project(project)

        # Simulate Claude Code global project memory. It must never count as a
        # Forge CLI project_guardrails file for the current target project.
        fake_home = temp_root / "home"
        os.environ["HOME"] = str(fake_home)
        write_card(fake_home / ".claude/projects/other/memory/facesong_project_guardrails.yaml")

        data = snapshot.snapshot(project)
        if data["project_guardrails"]:
            errors.append(f"global memory was incorrectly loaded: {data['project_guardrails']}")

        write_card(project / ".forge-cli/projects/facesong.project_guardrails.yaml")
        data = snapshot.snapshot(project)
        if data["project_guardrails"]:
            errors.append(f"unrelated local project guardrails were incorrectly loaded: {data['project_guardrails']}")

        write_card(project / ".forge-cli/projects/current_app.project_guardrails.yaml")
        data = snapshot.snapshot(project)
        expected = [".forge-cli/projects/current_app.project_guardrails.yaml"]
        if data["project_guardrails"] != expected:
            errors.append(f"current project guardrails were not resolved exactly: {data['project_guardrails']}")

    if errors:
        for error in errors:
            print(f"FAIL {error}")
        return 1

    print("PASS project_guardrails resolution is project-local and exact")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
