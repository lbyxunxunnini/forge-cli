#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

for check in \
  scripts/release_checks/metadata.sh \
  scripts/release_checks/guardrails.sh \
  scripts/release_checks/session.sh \
  scripts/release_checks/gates.sh \
  scripts/release_checks/output_protocol.sh
do
  bash "$check"
done

printf 'PASS release validation completed\n'
