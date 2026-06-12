#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Forge CLI doctor"

python3 --version >/dev/null
echo "PASS python3: $(python3 --version)"

if [[ -f VERSION && -f .skillhub.json ]]; then
  bash scripts/validate_release.sh >/dev/null
  echo "PASS release gate"
else
  echo "FAIL missing VERSION or .skillhub.json"
  exit 1
fi

if [[ -f SKILL.md ]]; then
  echo "PASS SKILL.md"
else
  echo "FAIL SKILL.md missing"
  exit 1
fi

if [[ -f pubspec.yaml && -d lib ]]; then
  echo "PASS current directory looks like project app"
else
  echo "INFO current directory is not a project app"
fi

echo "PASS doctor completed"
