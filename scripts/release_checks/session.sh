#!/usr/bin/env bash
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"

tmp_session_project="$(mktemp -d -t flutter-forge-session.XXXXXX)"
tmp_session_name="$(basename "$tmp_session_project")"
mkdir -p "$tmp_session_project/.claude/.flutter-forge/projects"
printf 'project_guardrails:\n  project:\n    name: "%s"\n    root_type: "flutter_existing"\n' "$tmp_session_name" > "$tmp_session_project/.claude/.flutter-forge/projects/${tmp_session_name}.project_guardrails.yaml"
session_init_output="$(scripts/ff_session.sh --project-root "$tmp_session_project" init --track execution --phase S2 --mode 页面开发)"
printf '%s\n' "$session_init_output" | grep -q "$tmp_session_project/.claude/.flutter-forge/session.md" || fail "ff_session did not use project_guardrails host session path"
scripts/ff_session.sh --project-root "$tmp_session_project" wait \
  --waiting_state artifact \
  --expected_input screenshot \
  --pending_question "请补充当前 UI 截图" \
  --task_object "订单详情页" \
  --resume_keys "订单详情页,截图" >/dev/null
scripts/ff_session.sh --project-root "$tmp_session_project" validate >/dev/null
grep -q '^- 等待状态：artifact' "$tmp_session_project/.claude/.flutter-forge/session.md" || fail "ff_session did not persist waiting_state"
grep -q '^- 等待输入类型：screenshot' "$tmp_session_project/.claude/.flutter-forge/session.md" || fail "ff_session did not persist expected_input"
rm -rf "$tmp_session_project"
info "session path and waiting-state validation passed"

tmp_resume_project="$(mktemp -d -t flutter-forge-resume.XXXXXX)"
tmp_resume_name="$(basename "$tmp_resume_project")"
mkdir -p "$tmp_resume_project/.claude/.flutter-forge/projects"
printf 'project_guardrails:\n  project:\n    name: "%s"\n    root_type: "flutter_existing"\n' "$tmp_resume_name" > "$tmp_resume_project/.claude/.flutter-forge/projects/${tmp_resume_name}.project_guardrails.yaml"
scripts/ff_session.sh --project-root "$tmp_resume_project" init --track execution --phase S2 --mode 页面开发 >/dev/null
scripts/ff_session.sh --project-root "$tmp_resume_project" save-resume \
  --waiting_state confirmation \
  --expected_input confirmation \
  --pending_question "方案A和方案B你倾向哪个？" \
  --task_object "订单详情页" \
  --resume_keys "订单详情页,方案A,方案B" >/dev/null
resume_check_output="$(scripts/ff_session.sh --project-root "$tmp_resume_project" check-resume --user-input "方案A")"
printf '%s\n' "$resume_check_output" | grep -q 'status: resume_match' || fail "ff_session did not detect resume match"
printf '%s\n' "$resume_check_output" | grep -q 'phase: S2' || fail "ff_session resume did not keep phase"
scripts/ff_session.sh --project-root "$tmp_resume_project" save-resume \
  --waiting_state artifact \
  --expected_input screenshot \
  --pending_question "请补充当前 UI 截图" \
  --task_object "订单详情页" \
  --resume_keys "订单详情页,截图" >/dev/null
artifact_resume_output="$(scripts/ff_session.sh --project-root "$tmp_resume_project" check-resume --user-input "" --has-attachment true)"
printf '%s\n' "$artifact_resume_output" | grep -q 'status: resume_match' || fail "ff_session did not detect attachment-only resume"
printf '%s\n' "$artifact_resume_output" | grep -q 'reason: artifact_reply' || fail "ff_session attachment resume reason mismatch"
scripts/ff_session.sh --project-root "$tmp_resume_project" consume-resume --user-input "方案A" >/dev/null
grep -q '^- 等待状态：none' "$tmp_resume_project/.claude/.flutter-forge/session.md" || fail "ff_session did not clear waiting_state after consume-resume"
grep -q '\[f-forge\] 等待：等待用户确认改动契约' "$tmp_resume_project/.flutter-forge/runtime/session_events.log" || fail "ff_session did not append waiting event"
grep -q '\[f-forge\] 恢复等待：已消费用户补充输入，继续当前阶段。' "$tmp_resume_project/.flutter-forge/runtime/session_events.log" || fail "ff_session did not append resume-consumed event"
rm -rf "$tmp_resume_project"
info "session resume and event logging validation passed"
