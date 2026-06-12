#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: scripts/validate_project.sh /path/to/project/app" >&2
  exit 2
fi

PROJECT_ROOT="$1"
if [[ ! -d "$PROJECT_ROOT" ]]; then
  echo "FAIL project root does not exist: $PROJECT_ROOT" >&2
  exit 1
fi

if [[ ! -f "$PROJECT_ROOT/pubspec.yaml" || ! -d "$PROJECT_ROOT/lib" ]]; then
  echo "FAIL not a project app: missing pubspec.yaml or lib/" >&2
  exit 1
fi

python3 "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/scripts/project_snapshot.py" "$PROJECT_ROOT" >/dev/null
echo "PASS project is valid for Forge CLI: $PROJECT_ROOT"
