#!/usr/bin/env bash
# ff_session.sh — session.md 结构化管理
#
# 用法:
#   scripts/ff_session.sh read                           # 读取当前 session
#   scripts/ff_session.sh update --phase S4 --mode 页面开发  # 更新指定字段
#   scripts/ff_session.sh wait --waiting_state artifact --expected_input screenshot --pending_question "请补充截图"
#   scripts/ff_session.sh reset                          # 重置 session（任务完成时）
#   scripts/ff_session.sh init --track execution         # 初始化新 session
#   scripts/ff_session.sh save-resume --pending_question "请确认方案A" --task_object "订单页"
#   scripts/ff_session.sh check-resume --user-input "按方案A"
#   scripts/ff_session.sh consume-resume --user-input "按方案A"
#
# 支持的 update 字段:
#   --track <cocreation|execution>
#   --phase <C0-C3|S0-S6>
#   --mode <模式名>
#   --decision_version <v1|v2|v3>
#   --project_guardrails <已加载|未加载|待生成>
#   --project_guardrails_summary <摘要文本>
#   --active_agents <agent列表>
#   --work_packages <P1/P2/P3|无>
#   --stale_results <结果列表|无>
#   --recent_action <操作描述>
#   --waiting_state <none|user_input|artifact|confirmation>
#   --expected_input <none|text|screenshot|document|design|confirmation|any>
#   --pending_question <等待用户回答的问题>
#   --task_object <页面/模块/业务对象>
#   --resume_keys <恢复关键词>
#   --change_contract <改动契约摘要>
#   --confirmation_status <不需要|未确认|用户已确认>
#   --goal_status <未确认|已确认>
#   --scope_status <未确认|已确认>
#   --acceptance_status <未确认|已确认>
#   --constraint_status <未确认|已确认>
#   --current_work_unit <当前子单元>
#   --work_unit_status <未冻结|已冻结|实现中|待验证|已通过|未通过>
#   --verification_status <未验证|验证中|已通过|未通过>
#   --scope_risk <无|已发现>
#   --plan_conflict <无|已发现待回退>
#   --task_exit_criteria <完成定义>
#   --mode_lock <激活|可退出>
#   --exit_permission <禁止|允许>
#   --summary_package <摘要包路径或摘要标识>
#   --last_user_input <最后用户输入摘要>
#
# session 路径: 与 project_guardrails 宿主目录一致；无 project_guardrails 时回退 .flutter-forge/session.md

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_FILE=""
RUNTIME_DIR=""
EVENT_LOG_FILE=""

# 解析 project_root 参数
PROJECT_ROOT=""
if [ "${1:-}" = "--project-root" ] && [ "${2:-}" != "" ]; then
  PROJECT_ROOT="$2"
  shift 2
fi

PROJECT_ROOT_ABS="$(cd "${PROJECT_ROOT:-.}" && pwd)"

runtime_dir() {
  printf '%s/.flutter-forge/runtime\n' "$PROJECT_ROOT_ABS"
}

legacy_session_file() {
  printf '%s/.flutter-forge/session.md\n' "$PROJECT_ROOT_ABS"
}

session_file_from_project_guardrails() {
  local output anchor_path host_dir
  if [ ! -x "${SCRIPT_DIR}/check_project_guardrails.sh" ]; then
    return 1
  fi
  output="$("${SCRIPT_DIR}/check_project_guardrails.sh" "$PROJECT_ROOT_ABS" --cached 300 2>/dev/null || true)"
  anchor_path="$(printf '%s\n' "$output" | python3 -c '
import json, sys
text = sys.stdin.read().strip()
if not text:
    raise SystemExit(1)
try:
    data = json.loads(text)
    path = data.get("path", "-")
except Exception:
    path = "-"
    for line in text.splitlines():
        if line.startswith("path:"):
            path = line.split(":", 1)[1].strip()
            break
if not path or path == "-":
    raise SystemExit(1)
print(path)
' 2>/dev/null || true)"
  if [ -z "$anchor_path" ] || [ "$anchor_path" = "-" ]; then
    return 1
  fi
  case "$anchor_path" in
    .claude/.flutter-forge/projects/*) host_dir=".claude/.flutter-forge" ;;
    .trae/.flutter-forge/projects/*) host_dir=".trae/.flutter-forge" ;;
    .agents/.flutter-forge/projects/*) host_dir=".agents/.flutter-forge" ;;
    .flutter-forge/projects/*) host_dir=".flutter-forge" ;;
    *) return 1 ;;
  esac
  printf '%s/%s/session.md\n' "$PROJECT_ROOT_ABS" "$host_dir"
}

candidate_session_files() {
  session_file_from_project_guardrails || true
  printf '%s/.claude/.flutter-forge/session.md\n' "$PROJECT_ROOT_ABS"
  printf '%s/.trae/.flutter-forge/session.md\n' "$PROJECT_ROOT_ABS"
  printf '%s/.agents/.flutter-forge/session.md\n' "$PROJECT_ROOT_ABS"
  legacy_session_file
}

resolve_session_file_for_read() {
  local candidate seen=""
  while IFS= read -r candidate; do
    [ -n "$candidate" ] || continue
    case ":$seen:" in *":$candidate:"*) continue ;; esac
    seen="${seen}:$candidate"
    if [ -f "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done < <(candidate_session_files)
  legacy_session_file
}

resolve_session_file_for_write() {
  local preferred legacy candidate
  preferred="$(session_file_from_project_guardrails || true)"
  legacy="$(legacy_session_file)"
  if [ -n "$preferred" ]; then
    if [ ! -f "$preferred" ] && [ -f "$legacy" ] && [ "$preferred" != "$legacy" ]; then
      mkdir -p "$(dirname "$preferred")"
      mv "$legacy" "$preferred"
    fi
    printf '%s\n' "$preferred"
    return 0
  fi
  candidate="$(resolve_session_file_for_read)"
  printf '%s\n' "$candidate"
}

ACTION="${1:-read}"
shift || true
case "$ACTION" in
  read|validate|check-resume) SESSION_FILE="$(resolve_session_file_for_read)" ;;
  *) SESSION_FILE="$(resolve_session_file_for_write)" ;;
esac
RUNTIME_DIR="$(runtime_dir)"
EVENT_LOG_FILE="${RUNTIME_DIR}/session_events.log"

write_session_template() {
  local track="$1"
  local phase="$2"
  local mode="$3"
  local project_guardrails="$4"
  mkdir -p "$(dirname "$SESSION_FILE")"
  cat > "$SESSION_FILE" <<EOF
# Flutter Forge Session

- 轨道：${track}
- 当前阶段：${phase}
- 当前模式：${mode}
- 决策版本：v1
- 项目护栏：${project_guardrails}
- 项目护栏摘要：-
- 活跃代理：controller
- 工作包：无
- 失效结果：无
- 等待状态：none
- 等待输入类型：none
- 待确认问题：-
- 任务对象：-
- 恢复键：-
- 改动契约：-
- 确认状态：不需要
- 目标状态：未确认
- 范围状态：未确认
- 验收状态：未确认
- 约束状态：未确认
- 当前子单元：-
- 子单元状态：未冻结
- 验证状态：未验证
- 超范围风险：无
- 计划冲突状态：无
- 任务结束条件：-
- 工作模式锁：激活
- 退出许可：禁止
- 摘要包：-
- 最后用户输入摘要：-
- 最近操作：初始化
- 输出校验：未校验
- 校验阶段：-
- 更新时间：$(date +"%Y-%m-%d %H:%M")
EOF
}

update_field() {
  local field="$1"
  local value="$2"
  FIELD="$field" VALUE="$value" python3 - "$SESSION_FILE" <<'PY'
import os
import sys
from pathlib import Path

path = Path(sys.argv[1])
field = os.environ["FIELD"]
value = os.environ["VALUE"]
prefix = f"- {field}："
lines = path.read_text(encoding="utf-8").splitlines()
for i, line in enumerate(lines):
    if line.startswith(prefix):
        lines[i] = f"{prefix}{value}"
        break
else:
    lines.append(f"{prefix}{value}")
path.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY
}

get_field() {
  local field="$1"
  FIELD="$field" python3 - "$SESSION_FILE" <<'PY'
import os
import sys
from pathlib import Path

path = Path(sys.argv[1])
field = os.environ["FIELD"]
prefixes = [f"- {field}："]
if not path.exists():
    raise SystemExit(0)
for line in path.read_text(encoding="utf-8").splitlines():
    for prefix in prefixes:
        if line.startswith(prefix):
            print(line[len(prefix):].strip())
            raise SystemExit(0)
PY
}

event_line_for_change() {
  local kind="$1"
  local before="$2"
  local after="$3"
  case "$kind" in
    phase)
      [ -n "$after" ] || return 0
      printf '[f-forge] 阶段：%s\n' "$(phase_label "$after")"
      ;;
    waiting)
      if [ "$after" = "none" ]; then
        printf '[f-forge] 恢复等待：已消费用户补充输入，继续当前阶段。\n'
      else
        printf '[f-forge] 等待：%s\n' "$(waiting_state_label "$after")"
      fi
      ;;
    confirmation)
      case "$after" in
        用户已确认) printf '[f-forge] 确认：改动契约已确认。\n' ;;
        未确认) printf '[f-forge] 确认：等待用户确认改动契约。\n' ;;
      esac
      ;;
  esac
}

append_event_log() {
  local phase_before="$1"
  local phase_after="$2"
  local waiting_before="$3"
  local waiting_after="$4"
  local confirmation_before="$5"
  local confirmation_after="$6"
  mkdir -p "$RUNTIME_DIR"
  {
    if [ "$phase_before" != "$phase_after" ]; then
      printf '%s %s' "$(date +"%Y-%m-%d %H:%M:%S")" " "
      event_line_for_change phase "$phase_before" "$phase_after"
    fi
    if [ "$waiting_before" != "$waiting_after" ]; then
      printf '%s %s' "$(date +"%Y-%m-%d %H:%M:%S")" " "
      event_line_for_change waiting "$waiting_before" "$waiting_after"
    fi
    if [ "$confirmation_before" != "$confirmation_after" ]; then
      line="$(event_line_for_change confirmation "$confirmation_before" "$confirmation_after" || true)"
      if [ -n "$line" ]; then
        printf '%s %s\n' "$(date +"%Y-%m-%d %H:%M:%S")" "$line"
      fi
    fi
  } >> "$EVENT_LOG_FILE"
}

phase_label() {
  case "$1" in
    C0) printf 'C0 想法收口' ;;
    C1) printf 'C1 方向共创' ;;
    C2) printf 'C2 工程定型' ;;
    C3) printf 'C3 首批范围冻结' ;;
    S0) printf 'S0 未收口' ;;
    S1) printf 'S1 需求确认' ;;
    S2) printf 'S2 方案确认' ;;
    S3) printf 'S3 拆包冻结' ;;
    S4) printf 'S4 实现中' ;;
    S5) printf 'S5 验证中' ;;
    S6) printf 'S6 已收口' ;;
    *) printf '%s' "$1" ;;
  esac
}

waiting_state_label() {
  case "$1" in
    user_input) printf '等待用户补充文本输入' ;;
    artifact) printf '等待用户补充截图或文稿' ;;
    confirmation) printf '等待用户确认改动契约' ;;
    none) printf '等待态已清空' ;;
    *) printf '%s' "$1" ;;
  esac
}

is_confirmation_input() {
  local input="$1"
  printf '%s' "$input" | grep -qE '^(确认|可以|按这个来|按方案|方案A|方案B|就这样|继续|行|好|ok|OK|yes|Yes|同意)'
}

is_attachment_reply() {
  local input="$1"
  [ -z "$input" ] && return 0
  printf '%s' "$input" | grep -qE '(截图|图在这|见图|已上传|文稿|文档|设计稿|附件|attachment|image|mock|figma|json)'
}

input_matches_resume_keys() {
  local input="$1"
  local task_object="$2"
  local resume_keys="$3"
  INPUT="$input" TASK_OBJECT="$task_object" RESUME_KEYS="$resume_keys" python3 - <<'PY'
import os
import re

text = os.environ.get("INPUT", "").strip().lower()
task_object = os.environ.get("TASK_OBJECT", "").strip().lower()
keys = [part.strip().lower() for part in os.environ.get("RESUME_KEYS", "").split(",") if part.strip() and part.strip() != "-"]

if task_object and task_object != "-" and task_object in text:
    print("match")
    raise SystemExit(0)

for key in keys:
    if key in text:
        print("match")
        raise SystemExit(0)

if re.search(r"(继续|接着|然后呢|还没做完|上一个|刚才|上一轮)", text):
    print("match")
    raise SystemExit(0)

print("no_match")
PY
}

# --- read ---
cmd_read() {
  if [ ! -f "$SESSION_FILE" ]; then
    echo "status: no_session"
    echo "path: -"
    exit 0
  fi
  echo "status: has_session"
  echo "path: $SESSION_FILE"
  echo "---"
  cat "$SESSION_FILE"
}

# --- init ---
cmd_init() {
  local track="execution"
  local phase="S0"
  local mode="未定"
  local project_guardrails="未加载"

  while [ $# -gt 0 ]; do
    case "$1" in
      --track) track="$2"; shift 2 ;;
      --phase) phase="$2"; shift 2 ;;
      --mode) mode="$2"; shift 2 ;;
      --project_guardrails) project_guardrails="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  write_session_template "$track" "$phase" "$mode" "$project_guardrails"
  echo "status: initialized"
  echo "path: $SESSION_FILE"
}

# --- update ---
cmd_update() {
  if [ ! -f "$SESSION_FILE" ]; then
    write_session_template "execution" "S0" "未定" "未加载"
  fi
  local phase_before waiting_before confirmation_before
  phase_before="$(get_field "当前阶段")"
  waiting_before="$(get_field "等待状态")"
  confirmation_before="$(get_field "确认状态")"

  # 解析参数
  while [ $# -gt 0 ]; do
    case "$1" in
      --track) update_field "轨道" "$2"; shift 2 ;;
      --phase) update_field "当前阶段" "$2"; shift 2 ;;
      --mode) update_field "当前模式" "$2"; shift 2 ;;
      --decision_version) update_field "决策版本" "$2"; shift 2 ;;
      --project_guardrails) update_field "项目护栏" "$2"; shift 2 ;;
      --project_guardrails_summary) update_field "项目护栏摘要" "$2"; shift 2 ;;
      --active_agents) update_field "活跃代理" "$2"; shift 2 ;;
      --work_packages) update_field "工作包" "$2"; shift 2 ;;
      --stale_results) update_field "失效结果" "$2"; shift 2 ;;
      --waiting_state) update_field "等待状态" "$2"; shift 2 ;;
      --expected_input) update_field "等待输入类型" "$2"; shift 2 ;;
      --pending_question) update_field "待确认问题" "$2"; shift 2 ;;
      --task_object) update_field "任务对象" "$2"; shift 2 ;;
      --resume_keys) update_field "恢复键" "$2"; shift 2 ;;
      --change_contract) update_field "改动契约" "$2"; shift 2 ;;
      --confirmation_status) update_field "确认状态" "$2"; shift 2 ;;
      --goal_status) update_field "目标状态" "$2"; shift 2 ;;
      --scope_status) update_field "范围状态" "$2"; shift 2 ;;
      --acceptance_status) update_field "验收状态" "$2"; shift 2 ;;
      --constraint_status) update_field "约束状态" "$2"; shift 2 ;;
      --current_work_unit) update_field "当前子单元" "$2"; shift 2 ;;
      --work_unit_status) update_field "子单元状态" "$2"; shift 2 ;;
      --verification_status) update_field "验证状态" "$2"; shift 2 ;;
      --scope_risk) update_field "超范围风险" "$2"; shift 2 ;;
      --plan_conflict) update_field "计划冲突状态" "$2"; shift 2 ;;
      --task_exit_criteria) update_field "任务结束条件" "$2"; shift 2 ;;
      --mode_lock) update_field "工作模式锁" "$2"; shift 2 ;;
      --exit_permission) update_field "退出许可" "$2"; shift 2 ;;
      --summary_package) update_field "摘要包" "$2"; shift 2 ;;
      --last_user_input) update_field "最后用户输入摘要" "$2"; shift 2 ;;
      --recent_action) update_field "最近操作" "$2"; shift 2 ;;
      --output_validation) update_field "输出校验" "$2"; shift 2 ;;
      --validation_phase) update_field "校验阶段" "$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  # 更新时间戳
  update_field "更新时间" "$(date +"%Y-%m-%d %H:%M")"
  append_event_log \
    "$phase_before" "$(get_field "当前阶段")" \
    "$waiting_before" "$(get_field "等待状态")" \
    "$confirmation_before" "$(get_field "确认状态")"

  echo "status: updated"
  echo "path: $SESSION_FILE"
}

# --- wait ---
cmd_wait() {
  cmd_update "$@" --recent_action "等待用户输入"
}

# --- save-resume ---
cmd_save_resume() {
  local pending_question="-"
  local task_object="-"
  local resume_keys="-"
  local expected_input="text"
  local waiting_state="user_input"
  local context_snapshot="-"

  while [ $# -gt 0 ]; do
    case "$1" in
      --pending_question) pending_question="$2"; shift 2 ;;
      --task_object) task_object="$2"; shift 2 ;;
      --resume_keys) resume_keys="$2"; shift 2 ;;
      --expected_input) expected_input="$2"; shift 2 ;;
      --waiting_state) waiting_state="$2"; shift 2 ;;
      --context_snapshot) context_snapshot="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  local update_args=(
    --waiting_state "$waiting_state" \
    --expected_input "$expected_input" \
    --pending_question "$pending_question" \
    --task_object "$task_object" \
    --resume_keys "$resume_keys" \
    --recent_action "保存恢复点"
  )
  if [ "$context_snapshot" != "-" ]; then
    update_args+=(--last_user_input "$context_snapshot")
  fi
  cmd_update "${update_args[@]}" >/dev/null

  echo "status: resume_saved"
  echo "path: $SESSION_FILE"
}

# --- check-resume ---
cmd_check_resume() {
  local user_input=""
  local has_attachment="false"
  while [ $# -gt 0 ]; do
    case "$1" in
      --user-input) user_input="$2"; shift 2 ;;
      --has-attachment) has_attachment="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  if [ ! -f "$SESSION_FILE" ]; then
    echo "status: no_session"
    echo "path: -"
    exit 0
  fi

  local phase mode waiting_state expected_input pending_question task_object resume_keys context_snapshot
  phase="$(get_field "当前阶段")"
  mode="$(get_field "当前模式")"
  waiting_state="$(get_field "等待状态")"
  expected_input="$(get_field "等待输入类型")"
  pending_question="$(get_field "待确认问题")"
  task_object="$(get_field "任务对象")"
  resume_keys="$(get_field "恢复键")"
  context_snapshot="$(get_field "最后用户输入摘要")"

  local matched="false"
  local reason="no_match"
  if [ "$waiting_state" != "none" ]; then
    case "$expected_input" in
      confirmation)
        if is_confirmation_input "$user_input" || [ "$(input_matches_resume_keys "$user_input" "$task_object" "$resume_keys")" = "match" ]; then
          matched="true"
          reason="confirmation_reply"
        fi
        ;;
      screenshot|document|design)
        if [ "$has_attachment" = "true" ] || is_attachment_reply "$user_input"; then
          matched="true"
          reason="artifact_reply"
        elif [ -n "$user_input" ] && [ "$(input_matches_resume_keys "$user_input" "$task_object" "$resume_keys")" = "match" ]; then
          matched="true"
          reason="artifact_reply"
        fi
        ;;
      text|any)
        if [ -n "$user_input" ] && [ "$(input_matches_resume_keys "$user_input" "$task_object" "$resume_keys")" = "match" ]; then
          matched="true"
          reason="text_reply"
        fi
        ;;
    esac
  elif [ "$(input_matches_resume_keys "$user_input" "$task_object" "$resume_keys")" = "match" ]; then
    matched="true"
    reason="continue_same_task"
  fi

  if [ "$matched" = "true" ]; then
    # 读取活跃代理，生成角色合约路径
    local active_agent
    active_agent="$(get_field "活跃代理")"
    local role_contract=""
    case "$active_agent" in
      requirement_analyst) role_contract="references/roles/requirement_analyst.md" ;;
      ui_designer) role_contract="references/roles/ui_designer.md" ;;
      architecture_designer) role_contract="references/roles/architecture_designer.md" ;;
      page_engineer) role_contract="references/roles/page_engineer.md" ;;
      verify_agent) role_contract="references/roles/verify_agent.md" ;;
    esac

    # 读取护栏摘要
    local guardrails_summary
    guardrails_summary="$(get_field "项目护栏摘要")"

    echo "status: resume_match"
    echo "path: $SESSION_FILE"
    echo "phase: $phase"
    echo "mode: $mode"
    echo "reason: $reason"
    echo "resume_instruction: 你刚才在 $(phase_label "$phase")，模式是${mode}。待确认问题：${pending_question:-"-"}。用户刚回复：${user_input:-"-"}。请直接继续当前阶段，不要重新分析。"
    if [ -n "$role_contract" ] && [ "$role_contract" != "" ]; then
      echo "role_contract: $role_contract"
    fi
    if [ -n "$guardrails_summary" ] && [ "$guardrails_summary" != "-" ]; then
      echo "guardrails_summary: $guardrails_summary"
    fi
    echo "context_snapshot: ${context_snapshot:-"-"}"
  else
    echo "status: no_match"
    echo "path: $SESSION_FILE"
    echo "phase: $phase"
    echo "mode: $mode"
    echo "reason: $reason"
  fi
}

# --- consume-resume ---
cmd_consume_resume() {
  local user_input="-"
  while [ $# -gt 0 ]; do
    case "$1" in
      --user-input) user_input="$2"; shift 2 ;;
      *) shift ;;
    esac
  done

  if [ ! -f "$SESSION_FILE" ]; then
    echo "status: no_session"
    exit 0
  fi

  cmd_update \
    --waiting_state none \
    --expected_input none \
    --pending_question - \
    --last_user_input "$user_input" \
    --recent_action "恢复后已消费用户输入" >/dev/null

  echo "status: resume_consumed"
  echo "path: $SESSION_FILE"
}

# --- reset ---
cmd_reset() {
  if [ -f "$SESSION_FILE" ]; then
    rm "$SESSION_FILE"
    echo "status: reset"
    echo "path: $SESSION_FILE"
  else
    echo "status: no_session_to_reset"
  fi
}

# --- 校验 session 字段完整性 ---
cmd_validate() {
  if [ ! -f "$SESSION_FILE" ]; then
    echo "status: no_session"
    exit 0
  fi

  errors=0
  required_fields=("轨道" "当前阶段" "当前模式" "决策版本" "项目护栏" "活跃代理" "工作包" "失效结果" "等待状态" "等待输入类型" "待确认问题" "任务对象" "恢复键" "改动契约" "确认状态" "目标状态" "范围状态" "验收状态" "约束状态" "当前子单元" "子单元状态" "验证状态" "超范围风险" "计划冲突状态" "任务结束条件" "工作模式锁" "退出许可" "摘要包" "最后用户输入摘要" "最近操作" "输出校验" "校验阶段" "更新时间")

  for field in "${required_fields[@]}"; do
    if ! grep -q "^- ${field}：" "$SESSION_FILE"; then
      echo "FAIL missing field: $field"
      errors=$((errors + 1))
    fi
  done

  # 校验阶段值
  phase=$(grep "^- 当前阶段：" "$SESSION_FILE" | sed 's/^- 当前阶段：//' | xargs)
  if ! echo "$phase" | grep -qE '^(C[0-3]|S[0-6])$'; then
    echo "FAIL invalid phase: $phase"
    errors=$((errors + 1))
  fi

  waiting_state=$(grep "^- 等待状态：" "$SESSION_FILE" | sed 's/^- 等待状态：//' | xargs)
  if ! echo "$waiting_state" | grep -qE '^(none|user_input|artifact|confirmation)$'; then
    echo "FAIL invalid waiting_state: $waiting_state"
    errors=$((errors + 1))
  fi

  expected_input=$(grep "^- 等待输入类型：" "$SESSION_FILE" | sed 's/^- 等待输入类型：//' | xargs)
  if ! echo "$expected_input" | grep -qE '^(none|text|screenshot|document|design|confirmation|any)$'; then
    echo "FAIL invalid expected_input: $expected_input"
    errors=$((errors + 1))
  fi

  if [ "$waiting_state" != "none" ] && [ "$expected_input" = "none" ]; then
    echo "FAIL waiting session must record expected input"
    errors=$((errors + 1))
  fi

  confirmation_status=$(grep "^- 确认状态：" "$SESSION_FILE" | sed 's/^- 确认状态：//' | xargs)
  change_contract=$(grep "^- 改动契约：" "$SESSION_FILE" | sed 's/^- 改动契约：//' | xargs)
  if echo "$confirmation_status" | grep -qE '^(未确认|用户已确认)$' && [ "$change_contract" = "-" ]; then
    echo "FAIL confirmed/pending contract session must record change_contract"
    errors=$((errors + 1))
  fi

  if [ "$waiting_state" = "confirmation" ] && [ "$expected_input" != "confirmation" ]; then
    echo "FAIL confirmation waiting_state must use confirmation expected_input"
    errors=$((errors + 1))
  fi

  for field in "目标状态" "范围状态" "验收状态" "约束状态"; do
    value=$(grep "^- ${field}：" "$SESSION_FILE" | sed "s/^- ${field}：//" | xargs)
    if ! echo "$value" | grep -qE '^(未确认|已确认)$'; then
      echo "FAIL invalid ${field}: $value"
      errors=$((errors + 1))
    fi
  done

  work_unit_status=$(grep "^- 子单元状态：" "$SESSION_FILE" | sed 's/^- 子单元状态：//' | xargs)
  if ! echo "$work_unit_status" | grep -qE '^(未冻结|已冻结|实现中|待验证|已通过|未通过)$'; then
    echo "FAIL invalid work_unit_status: $work_unit_status"
    errors=$((errors + 1))
  fi

  verification_status=$(grep "^- 验证状态：" "$SESSION_FILE" | sed 's/^- 验证状态：//' | xargs)
  if ! echo "$verification_status" | grep -qE '^(未验证|验证中|已通过|未通过)$'; then
    echo "FAIL invalid verification_status: $verification_status"
    errors=$((errors + 1))
  fi

  scope_risk=$(grep "^- 超范围风险：" "$SESSION_FILE" | sed 's/^- 超范围风险：//' | xargs)
  if ! echo "$scope_risk" | grep -qE '^(无|已发现)$'; then
    echo "FAIL invalid scope_risk: $scope_risk"
    errors=$((errors + 1))
  fi

  plan_conflict=$(grep "^- 计划冲突状态：" "$SESSION_FILE" | sed 's/^- 计划冲突状态：//' | xargs)
  if ! echo "$plan_conflict" | grep -qE '^(无|已发现待回退)$'; then
    echo "FAIL invalid plan_conflict: $plan_conflict"
    errors=$((errors + 1))
  fi

  mode_lock=$(grep "^- 工作模式锁：" "$SESSION_FILE" | sed 's/^- 工作模式锁：//' | xargs)
  if ! echo "$mode_lock" | grep -qE '^(激活|可退出)$'; then
    echo "FAIL invalid mode_lock: $mode_lock"
    errors=$((errors + 1))
  fi

  exit_permission=$(grep "^- 退出许可：" "$SESSION_FILE" | sed 's/^- 退出许可：//' | xargs)
  if ! echo "$exit_permission" | grep -qE '^(禁止|允许)$'; then
    echo "FAIL invalid exit_permission: $exit_permission"
    errors=$((errors + 1))
  fi

  current_work_unit=$(grep "^- 当前子单元：" "$SESSION_FILE" | sed 's/^- 当前子单元：//' | xargs)
  if [ "$work_unit_status" != "未冻结" ] && [ "$current_work_unit" = "-" ]; then
    echo "FAIL active work_unit_status requires current_work_unit"
    errors=$((errors + 1))
  fi

  if [ "$work_unit_status" = "已通过" ] && [ "$verification_status" != "已通过" ]; then
    echo "FAIL passed work unit must have verification_status=已通过"
    errors=$((errors + 1))
  fi

  if [ "$exit_permission" = "允许" ] && [ "$mode_lock" != "可退出" ]; then
    echo "FAIL exit_permission=允许 requires mode_lock=可退出"
    errors=$((errors + 1))
  fi

  if [ $errors -eq 0 ]; then
    echo "PASS session valid"
  else
    echo "FAILED with $errors error(s)"
    exit 1
  fi
}

# --- main ---
case "$ACTION" in
  read) cmd_read ;;
  init) cmd_init "$@" ;;
  update) cmd_update "$@" ;;
  wait) cmd_wait "$@" ;;
  save-resume) cmd_save_resume "$@" ;;
  check-resume) cmd_check_resume "$@" ;;
  consume-resume) cmd_consume_resume "$@" ;;
  reset) cmd_reset ;;
  validate) cmd_validate ;;
  *)
    echo "Usage: ff_session.sh {read|init|update|wait|save-resume|check-resume|consume-resume|reset|validate} [options]"
    exit 1
    ;;
esac
