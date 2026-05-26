#!/usr/bin/env bash
# validate_output_prefix.sh — 校验当前阶段是否已输出 [f-forge] 阶段日志
#
# 用法: validate_output_prefix.sh <project_root> [--phase S4]
#
# 通过 session 的 最近操作 字段判断是否已输出阶段日志。
# 未输出时 exit 1，输出提示信息。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${1:-.}"
PHASE=""

shift || true
while [ $# -gt 0 ]; do
  case "$1" in
    --phase) PHASE="$2"; shift 2 ;;
    *) shift ;;
  esac
done

# 读取 session
SESSION_FILE=""
for candidate in \
  "$PROJECT_ROOT/.claude/.flutter-forge/session.md" \
  "$PROJECT_ROOT/.trae/.flutter-forge/session.md" \
  "$PROJECT_ROOT/.agents/.flutter-forge/session.md" \
  "$PROJECT_ROOT/.flutter-forge/session.md"; do
  if [ -f "$candidate" ]; then
    SESSION_FILE="$candidate"
    break
  fi
done

if [ -z "$SESSION_FILE" ]; then
  echo "status: no_session"
  exit 0
fi

get_field() {
  local field="$1"
  grep "^- ${field}：" "$SESSION_FILE" 2>/dev/null | sed "s/^- ${field}：//" | xargs || echo "-"
}

CURRENT_PHASE="${PHASE:-$(get_field "当前阶段")}"
RECENT_ACTION="$(get_field "最近操作")"
MODE="$(get_field "当前模式")"

# 轻量/直通不强制要求阶段日志
if [ "$MODE" = "轻量任务" ] || [ "$MODE" = "直通模式" ]; then
  echo "status: exempt"
  echo "mode: $MODE"
  exit 0
fi

# 检查最近操作是否包含 [f-forge] 阶段日志标记
# 阶段日志格式：[f-forge] 阶段：S4 实现中 或 [f-forge] 模式：xxx
HAS_LOG="false"
case "$RECENT_ACTION" in
  *"[f-forge]"*) HAS_LOG="true" ;;
  "初始化") HAS_LOG="true" ;;  # 初始化时不需要日志
  "保存恢复点") HAS_LOG="true" ;;  # 恢复点时不需要日志
  "恢复后已消费用户输入") HAS_LOG="true" ;;  # 恢复后不需要日志
  "等待用户输入") HAS_LOG="true" ;;  # 等待时不需要日志
esac

if [ "$HAS_LOG" = "true" ]; then
  echo "status: pass"
  echo "phase: $CURRENT_PHASE"
  echo "recent_action: $RECENT_ACTION"
  exit 0
else
  echo "status: missing_log"
  echo "phase: $CURRENT_PHASE"
  echo "recent_action: $RECENT_ACTION"
  echo "hint: 请先输出 [f-forge] 阶段：${CURRENT_PHASE} 或 [f-forge] 模式：${MODE}"
  exit 1
fi
