#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

python3 scripts/validate_project_guardrails.py --allow-placeholders \
  references/project_guardrails_template.yaml \
  memory/projects/example_project.project_guardrails.yaml

python3 scripts/validate_flutter_stack_scan.py
python3 scripts/validate_project_guardrails_resolution.py
python3 scripts/project_snapshot.py tests/fixtures/flutter_sample >/dev/null

tmp_guardrails="$(mktemp -t flutter-forge-guardrails.XXXXXX.yaml)"
python3 scripts/init_project_guardrails.py tests/fixtures/flutter_sample --output "$tmp_guardrails" >/dev/null
grep -q 'root_type: "flutter_existing"' "$tmp_guardrails" || fail "init_project_guardrails did not detect flutter_existing"
grep -q 'project_guardrails:' "$tmp_guardrails" || fail "init_project_guardrails did not use project_guardrails root key"
grep -q '_draft' "$tmp_guardrails" && fail "init_project_guardrails still generates draft files"
rm -f "$tmp_guardrails"
info "init_project_guardrails validation passed"

tmp_empty_project="$(mktemp -d -t flutter-forge-empty.XXXXXX)"
empty_state="$(python3 scripts/detect_project_root_state.py "$tmp_empty_project")"
printf '%s\n' "$empty_state" | grep -q '"root_type": "empty_new"' || fail "detect_project_root_state did not classify empty dir as empty_new"
printf '%s\n' "$empty_state" | grep -q '"forge_enabled": true' || fail "detect_project_root_state did not enable forge for empty_new"
rm -rf "$tmp_empty_project"

tmp_non_flutter="$(mktemp -d -t flutter-forge-nonflutter.XXXXXX)"
printf 'hello\n' > "$tmp_non_flutter/README.md"
non_flutter_state="$(python3 scripts/detect_project_root_state.py "$tmp_non_flutter")"
printf '%s\n' "$non_flutter_state" | grep -q '"root_type": "non_flutter"' || fail "detect_project_root_state did not classify non-flutter workspace"
printf '%s\n' "$non_flutter_state" | grep -q '"forge_enabled": false' || fail "detect_project_root_state did not disable forge for non-flutter workspace"
rm -rf "$tmp_non_flutter"

python3 scripts/route_golden_tests.py
