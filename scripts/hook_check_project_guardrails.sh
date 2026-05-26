#!/usr/bin/env bash
# hook_check_project_guardrails.sh — preToolCall hook: 项目护栏门禁
#
# 用法: hook_check_project_guardrails.sh <project_root>

set -euo pipefail

PROJECT_ROOT="${1:-.}"

HOOK_INPUT=""
if [ ! -t 0 ]; then
  HOOK_INPUT="$(cat 2>/dev/null || true)"
fi

TOOL_NAME=""
COMMAND_TEXT=""
TARGET_PATH=""
if [ -n "$HOOK_INPUT" ]; then
  TOOL_INFO="$(printf '%s' "$HOOK_INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    name = data.get('tool_name', '')
    tool_input = data.get('tool_input', {}) or {}
    cmd = tool_input.get('command', '') or ''
    path = (
        tool_input.get('file_path')
        or tool_input.get('path')
        or tool_input.get('target_file')
        or tool_input.get('filename')
        or ''
    )
    print(name)
    print(cmd)
    print(path)
except Exception:
    print('')
    print('')
    print('')
" 2>/dev/null || printf '\n\n')"
  TOOL_NAME="$(printf '%s' "$TOOL_INFO" | sed -n '1p')"
  COMMAND_TEXT="$(printf '%s' "$TOOL_INFO" | sed -n '2p')"
  TARGET_PATH="$(printf '%s' "$TOOL_INFO" | sed -n '3p')"
fi

if [ -n "$COMMAND_TEXT" ]; then
  if printf '%s' "$COMMAND_TEXT" | grep -qE '(check_project_guardrails\.sh|init_project_guardrails\.py|hook_check_project_guardrails\.sh|project_snapshot\.py|find_existing_rules\.sh|flutter_stack_scan\.py)'; then
    exit 0
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHECK_SCRIPT="$SCRIPT_DIR/check_project_guardrails.sh"
GATE_SCRIPT="$SCRIPT_DIR/gate_check.py"
GATE_MODE="${FF_GATE_MODE:-enforce}"

if [ ! -x "$CHECK_SCRIPT" ]; then
  exit 0
fi

RAW="$(bash "$CHECK_SCRIPT" "$PROJECT_ROOT" --cached 300 2>/dev/null || true)"
if [ -z "$RAW" ]; then
  exit 0
fi

STATUS="$(printf '%s' "$RAW" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('status', ''))
except Exception:
    print('')
" 2>/dev/null || echo "")"

case "$TOOL_NAME" in
  Edit|MultiEdit|Write|str_replace|fs_write|fs_append|smartRelocate|semanticRename)
    IS_WRITE="true"
    ;;
  *)
    IS_WRITE="false"
    ;;
esac

if [ "$STATUS" = "missing" ]; then
  if [ "$IS_WRITE" = "true" ]; then
    TASK_GATE="${PROJECT_ROOT}/.flutter-forge/runtime/task_gate.json"
    if [ -f "$TASK_GATE" ]; then
      ALLOW_BY_GATE="$(TASK_GATE="$TASK_GATE" PROJECT_ROOT="$PROJECT_ROOT" TARGET_PATH="$TARGET_PATH" python3 -c "
import json, os, sys, time

gate_path = os.environ['TASK_GATE']
project_root = os.path.abspath(os.environ['PROJECT_ROOT'])
target_path = os.environ.get('TARGET_PATH', '')

try:
    with open(gate_path, encoding='utf-8') as f:
        gate = json.load(f)
except Exception:
    print('deny')
    raise SystemExit(0)

age = int(time.time()) - int(gate.get('checked_at', 0))
if gate.get('project_root') != project_root or age > 300:
    print('deny')
    raise SystemExit(0)

if not gate.get('allow_write_without_guardrails'):
    print('deny')
    raise SystemExit(0)

if not target_path:
    print('deny')
    raise SystemExit(0)

norm_target = target_path.replace('\\\\', '/')
risk_tokens = (
    'pubspec.yaml',
    '/router/',
    'router',
    '/route',
    'routes',
    'provider',
    'notifier',
    'bloc',
    'cubit',
    'controller',
    'injection',
    '/di/',
    'dependency_injection',
    'lib/core/',
    'lib/shared/',
)
if any(token in norm_target for token in risk_tokens):
    print('deny')
    raise SystemExit(0)

print('allow')
" 2>/dev/null || echo "deny")"
      if [ "$ALLOW_BY_GATE" = "allow" ]; then
        printf '[hook] project_guardrails missing, task gate allows this light/direct write: %s\n' "$TARGET_PATH" >&2
        exit 0
      fi
    fi

    python3 -c "
import json, sys
json.dump({
    'permissionDecision': 'block',
    'reason': 'project_guardrails 未初始化，且当前工具调用涉及代码改动。请先运行 scripts/init_project_guardrails.py 初始化项目锚点；Flutter 现有项目再按需补齐长期护栏。'
}, sys.stdout, ensure_ascii=False)
"
    exit 2
  else
    printf '[hook] project_guardrails missing（读操作放行；写操作前请先 init_project_guardrails）\n' >&2
    exit 0
  fi
fi

# 上下文注入：写操作时输出当前角色和护栏提醒
if [ "$IS_WRITE" = "true" ]; then
  SESSION_FILE_PATH=""
  for candidate in \
    "$PROJECT_ROOT/.claude/.flutter-forge/session.md" \
    "$PROJECT_ROOT/.trae/.flutter-forge/session.md" \
    "$PROJECT_ROOT/.agents/.flutter-forge/session.md" \
    "$PROJECT_ROOT/.flutter-forge/session.md"; do
    if [ -f "$candidate" ]; then
      SESSION_FILE_PATH="$candidate"
      break
    fi
  done

  if [ -n "$SESSION_FILE_PATH" ]; then
    ACTIVE_AGENT="$(grep "^- 活跃代理：" "$SESSION_FILE_PATH" 2>/dev/null | sed 's/^- 活跃代理：//' | xargs || echo "-")"
    CURRENT_PHASE="$(grep "^- 当前阶段：" "$SESSION_FILE_PATH" 2>/dev/null | sed 's/^- 当前阶段：//' | xargs || echo "-")"
    CURRENT_MODE="$(grep "^- 当前模式：" "$SESSION_FILE_PATH" 2>/dev/null | sed 's/^- 当前模式：//' | xargs || echo "-")"

    if [ "$ACTIVE_AGENT" != "-" ] && [ "$ACTIVE_AGENT" != "controller" ]; then
      ROLE_BOUNDARY=""
      case "$ACTIVE_AGENT" in
        requirement_analyst) ROLE_BOUNDARY="确定任务目标、需求边界。不可决定 UI/架构/实现" ;;
        ui_designer) ROLE_BOUNDARY="判断页面结构、信息层级。不可决定状态管理/路由/实现" ;;
        architecture_designer) ROLE_BOUNDARY="决定模块归属、状态方案、路由方案。不可重定义业务目标/覆盖 UI 决策" ;;
        page_engineer) ROLE_BOUNDARY="修改代码、本地验证。不可重定义需求/私改架构" ;;
        verify_agent) ROLE_BOUNDARY="质量门禁检查、回归验证。不可重定义需求/重写架构" ;;
      esac
      printf '[hook] 当前角色：%s（%s）| 阶段：%s | 模式：%s\n' "$ACTIVE_AGENT" "$ROLE_BOUNDARY" "$CURRENT_PHASE" "$CURRENT_MODE" >&2
    fi
  fi
fi

# 自动刷新标记：写 pubspec.yaml 或 lib/ 下文件时标记 guardrails 需要刷新
if [ "$IS_WRITE" = "true" ] && [ -n "$TARGET_PATH" ]; then
  NORM_TARGET="$(printf '%s' "$TARGET_PATH" | sed 's|\\|/|g')"
  case "$NORM_TARGET" in
    *pubspec.yaml|*/lib/*|lib/*)
      MARKER_DIR="${PROJECT_ROOT}/.flutter-forge/runtime"
      mkdir -p "$MARKER_DIR" 2>/dev/null || true
      date +%s > "${MARKER_DIR}/refresh_needed" 2>/dev/null || true
      ;;
  esac
fi

if [ "$IS_WRITE" = "true" ] && [ -x "$GATE_SCRIPT" ] && [ -n "$TARGET_PATH" ]; then
  GATE_OUTPUT="$(python3 "$GATE_SCRIPT" --project-root "$PROJECT_ROOT" --target-path "$TARGET_PATH" --mode "$GATE_MODE" 2>/dev/null || true)"
  if [ -n "$GATE_OUTPUT" ]; then
    GATE_DECISION="$(printf '%s' "$GATE_OUTPUT" | python3 -c "
import json, sys
try:
    print(json.load(sys.stdin).get('decision', 'allow'))
except Exception:
    print('allow')
" 2>/dev/null || echo "allow")"
    if [ "$GATE_DECISION" = "would_block" ]; then
      printf '[hook] would_block by flutter-forge gate: %s\n' "$GATE_OUTPUT" >&2
      exit 0
    fi
    if [ "$GATE_DECISION" = "block" ]; then
      GATE_REASON="$(printf '%s' "$GATE_OUTPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('reason', '当前写入被 flutter-forge gate 阻断'))
except Exception:
    print('当前写入被 flutter-forge gate 阻断')
" 2>/dev/null || echo "当前写入被 flutter-forge gate 阻断")"
      GATE_REASON="$GATE_REASON" python3 -c "
import json, os, sys
json.dump({
    'permissionDecision': 'block',
    'reason': os.environ['GATE_REASON']
}, sys.stdout, ensure_ascii=False)
"
      exit 2
    fi
  fi
fi

exit 0
