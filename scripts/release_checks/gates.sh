#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

tmp_gate_project="$(mktemp -d -t flutter-forge-gate.XXXXXX)"
tmp_gate_name="$(basename "$tmp_gate_project")"
mkdir -p "$tmp_gate_project/.claude/.flutter-forge/projects" "$tmp_gate_project/.flutter-forge/runtime"
printf 'project_guardrails:\n  project:\n    name: "%s"\n    root_type: "flutter_existing"\n' "$tmp_gate_name" > "$tmp_gate_project/.claude/.flutter-forge/projects/${tmp_gate_name}.project_guardrails.yaml"
scripts/ff_session.sh --project-root "$tmp_gate_project" init --track execution --phase S2 --mode 页面开发 >/dev/null
cat > "$tmp_gate_project/.flutter-forge/runtime/task_gate.json" <<'EOF'
{
  "project_root": "REPLACE_PROJECT_ROOT",
  "project_root_state": "flutter_existing",
  "forge_enabled": true,
  "mode": "页面开发",
  "confidence": "high",
  "policy": "标准",
  "matched_by": "manual",
  "should_load_guardrails": true,
  "guardrails_check": "required",
  "allow_write_without_guardrails": false,
  "checked_at": 9999999999
}
EOF
python3 - <<'PY' "$tmp_gate_project/.flutter-forge/runtime/task_gate.json" "$tmp_gate_project"
import json, sys
path, root = sys.argv[1], sys.argv[2]
data = json.load(open(path, encoding="utf-8"))
data["project_root"] = root
json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
PY

gate_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path lib/features/order/detail_page.dart --mode observe)"
printf '%s\n' "$gate_output" | grep -q '"decision": "would_block"' || fail "gate_check did not report would_block before S4"
printf '%s\n' "$gate_output" | grep -q '"gate": "phase_progression"' || fail "gate_check did not report phase gate"

gate_config_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path pubspec.yaml --mode observe)"
printf '%s\n' "$gate_config_output" | grep -q '"decision": "would_block"' || fail "gate_check did not block project config before S4"
printf '%s\n' "$gate_config_output" | grep -q '"target_kind": "project_config"' || fail "gate_check did not classify pubspec.yaml as project_config"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --phase S4 --change_contract "允许改 detail_page.dart" --confirmation_status 用户已确认 --goal_status 已确认 --scope_status 已确认 --acceptance_status 已确认 --constraint_status 已确认 --current_work_unit 订单详情页主体改动 --work_unit_status 已冻结 --verification_status 未验证 --task_exit_criteria 当前子单元通过且验收满足 --mode_lock 激活 --exit_permission 禁止 --output_validation 已通过 --validation_phase S4 --recent_action '[f-forge] 阶段：S4 实现中' >/dev/null
scripts/ff_session.sh --project-root "$tmp_gate_project" validate >/dev/null

gate_allow_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path lib/features/order/detail_page.dart --mode enforce)"
printf '%s\n' "$gate_allow_output" | grep -q '"decision": "allow"' || fail "gate_check did not allow confirmed S4 write"
gate_config_allow_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path pubspec.yaml --mode enforce)"
printf '%s\n' "$gate_config_allow_output" | grep -q '"decision": "allow"' || fail "gate_check did not allow confirmed project config write in S4"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --scope_status 未确认 >/dev/null
set +e
gate_core_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path lib/features/order/detail_page.dart --mode enforce)"
gate_core_status=$?
set -e
[ "$gate_core_status" -eq 2 ] || fail "gate_check did not return blocking exit code for core_definition"
printf '%s\n' "$gate_core_output" | grep -q '"decision": "block"' || fail "gate_check did not block unconfirmed core task definition"
printf '%s\n' "$gate_core_output" | grep -q '"gate": "core_definition"' || fail "gate_check did not report core_definition gate"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --scope_status 已确认 >/dev/null
scripts/ff_session.sh --project-root "$tmp_gate_project" update --current_work_unit - --work_unit_status 未冻结 >/dev/null
set +e
gate_work_unit_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path lib/features/order/detail_page.dart --mode enforce)"
gate_work_unit_status=$?
set -e
[ "$gate_work_unit_status" -eq 2 ] || fail "gate_check did not return blocking exit code for current_work_unit"
printf '%s\n' "$gate_work_unit_output" | grep -q '"decision": "block"' || fail "gate_check did not block missing current work unit"
printf '%s\n' "$gate_work_unit_output" | grep -q '"gate": "current_work_unit"' || fail "gate_check did not report current_work_unit gate"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --current_work_unit 订单详情页主体改动 --work_unit_status 已冻结 >/dev/null
scripts/ff_session.sh --project-root "$tmp_gate_project" update --scope_risk 已发现 >/dev/null
set +e
gate_scope_risk_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path lib/features/order/detail_page.dart --mode enforce)"
gate_scope_risk_status=$?
set -e
[ "$gate_scope_risk_status" -eq 2 ] || fail "gate_check did not return blocking exit code for scope_expansion"
printf '%s\n' "$gate_scope_risk_output" | grep -q '"decision": "block"' || fail "gate_check did not block scope expansion risk"
printf '%s\n' "$gate_scope_risk_output" | grep -q '"gate": "scope_expansion"' || fail "gate_check did not report scope_expansion gate"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --scope_risk 无 --plan_conflict 已发现待回退 >/dev/null
set +e
gate_plan_conflict_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path lib/features/order/detail_page.dart --mode enforce)"
gate_plan_conflict_status=$?
set -e
[ "$gate_plan_conflict_status" -eq 2 ] || fail "gate_check did not return blocking exit code for plan_conflict"
printf '%s\n' "$gate_plan_conflict_output" | grep -q '"decision": "block"' || fail "gate_check did not block plan conflict"
printf '%s\n' "$gate_plan_conflict_output" | grep -q '"gate": "plan_conflict"' || fail "gate_check did not report plan_conflict gate"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --plan_conflict 无 >/dev/null
scripts/ff_session.sh --project-root "$tmp_gate_project" update --confirmation_status 未确认 >/dev/null
python3 - <<'PY' "$tmp_gate_project/.flutter-forge/runtime/task_gate.json"
import json, sys
path = sys.argv[1]
data = json.load(open(path, encoding="utf-8"))
data["policy"] = "全自动"
json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
PY
gate_auto_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path lib/features/order/detail_page.dart --mode enforce)"
printf '%s\n' "$gate_auto_output" | grep -q '"decision": "allow"' || fail "gate_check did not exempt autonomous policy"

python3 - <<'PY' "$tmp_gate_project/.flutter-forge/runtime/task_gate.json"
import json, sys
path = sys.argv[1]
data = json.load(open(path, encoding="utf-8"))
data["policy"] = "标准"
json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
PY

scripts/ff_session.sh --project-root "$tmp_gate_project" update --phase S6 --confirmation_status 不需要 --change_contract - --work_unit_status 已通过 --verification_status 已通过 --mode_lock 激活 --exit_permission 禁止 --recent_action '[f-forge] 阶段：S6 已收口' >/dev/null
set +e
gate_mode_exit_output="$(python3 scripts/gate_check.py --project-root "$tmp_gate_project" --target-path AGENT-PM-REVIEW.md --mode enforce)"
gate_mode_exit_status=$?
set -e
[ "$gate_mode_exit_status" -eq 2 ] || fail "gate_check did not return blocking exit code for mode_exit"
printf '%s\n' "$gate_mode_exit_output" | grep -q '"decision": "block"' || fail "gate_check did not block premature S6 exit"
printf '%s\n' "$gate_mode_exit_output" | grep -q '"gate": "mode_exit"' || fail "gate_check did not report mode_exit gate"

controller_exit_output="$(python3 scripts/controller.py run --project-root "$tmp_gate_project" --user-input "继续" --target-path AGENT-PM-REVIEW.md)"
printf '%s\n' "$controller_exit_output" | grep -q '"next_action": "resume_current_phase"' || fail "controller did not prefer session resume for unfinished task"
printf '%s\n' "$controller_exit_output" | grep -q '"gate": {' || fail "controller did not return gate payload for premature exit"
printf '%s\n' "$controller_exit_output" | grep -q '"gate": "mode_exit"' || fail "controller did not surface mode_exit gate"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --phase S4 --change_contract "允许改 detail_page.dart" --confirmation_status 用户已确认 --goal_status 已确认 --scope_status 已确认 --acceptance_status 已确认 --constraint_status 已确认 --current_work_unit 订单详情页主体改动 --work_unit_status 已冻结 --verification_status 未验证 --mode_lock 激活 --exit_permission 禁止 --recent_action '[f-forge] 阶段：S4 实现中' >/dev/null
hook_input='{"tool_name":"Write","tool_input":{"file_path":"lib/features/order/detail_page.dart"}}'
set +e
hook_output="$(printf '%s' "$hook_input" | FF_GATE_MODE=enforce bash scripts/hook_check_project_guardrails.sh "$tmp_gate_project" 2>&1)"
hook_status=$?
set -e
[ "$hook_status" -eq 0 ] || fail "hook_check_project_guardrails unexpectedly blocked valid S4 write"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --scope_risk 已发现 >/dev/null
set +e
hook_block_output="$(printf '%s' "$hook_input" | FF_GATE_MODE=enforce bash scripts/hook_check_project_guardrails.sh "$tmp_gate_project" 2>&1)"
hook_block_status=$?
set -e
[ "$hook_block_status" -eq 2 ] || fail "hook_check_project_guardrails did not block write when scope risk was active"
printf '%s\n' "$hook_block_output" | grep -q 'permissionDecision' || fail "hook_check_project_guardrails did not emit block payload"

scripts/ff_session.sh --project-root "$tmp_gate_project" update --scope_risk 无 >/dev/null
controller_output="$(python3 scripts/controller.py run --project-root "$tmp_gate_project" --user-input "方案A" --target-path lib/features/order/detail_page.dart)"
printf '%s\n' "$controller_output" | grep -q '"role": "page_engineer"' || fail "controller did not choose compatible role from session phase"
printf '%s\n' "$controller_output" | grep -q '"decision": "allow"' || fail "controller did not surface allow gate output for valid S4 write"

rm -rf "$tmp_gate_project"
info "gate and controller validation passed"
