#!/usr/bin/env bash
# check_project_guardrails.sh — 项目锚点与护栏状态检查
#
# 用法:
#   scripts/check_project_guardrails.sh <project_root>
#   scripts/check_project_guardrails.sh <project_root> --json
#   scripts/check_project_guardrails.sh <project_root> --cached [ttl]

set -euo pipefail

PROJECT_ROOT="${1:-.}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="${PROJECT_ROOT}/.flutter-forge/runtime/project_guardrails_status.json"

cached_json() {
  local ttl="$1"
  if [ ! -f "$STATE_FILE" ]; then
    return 1
  fi
  PROJECT_ROOT_ABS="$(cd "$PROJECT_ROOT" && pwd)"
  STATE_FILE="$STATE_FILE" PROJECT_ROOT_ABS="$PROJECT_ROOT_ABS" TTL="$ttl" python3 - <<'PY'
import json
import os
import sys
import time

path = os.environ["STATE_FILE"]
project_root = os.environ["PROJECT_ROOT_ABS"]
ttl = int(os.environ["TTL"])
try:
    data = json.load(open(path, encoding="utf-8"))
except Exception:
    raise SystemExit(1)

age = int(time.time()) - int(data.get("checked_at", 0))
if data.get("project_root") != project_root or age > ttl:
    raise SystemExit(1)
data["cache_hit"] = True
data["cache_age"] = age
print(json.dumps(data, ensure_ascii=False))
PY
}

if [[ "${2:-}" == "--cached" ]]; then
  TTL="${3:-300}"
  if CACHED="$(cached_json "$TTL" 2>/dev/null)"; then
    echo "$CACHED"
    exit 0
  fi
  exec bash "$0" "$PROJECT_ROOT" --json
fi

DETECTION_JSON="$(python3 "${SCRIPT_DIR}/detect_project_root_state.py" "$PROJECT_ROOT")"

RESULT_JSON="$(
DETECTION_JSON="$DETECTION_JSON" PROJECT_ROOT="$PROJECT_ROOT" SCRIPT_DIR="$SCRIPT_DIR" python3 - <<'PY'
import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

data = json.loads(os.environ["DETECTION_JSON"])
project_root = Path(os.environ["PROJECT_ROOT"]).resolve()
script_dir = Path(os.environ["SCRIPT_DIR"])
project_name = project_root.name

search_paths = [
    f".claude/.flutter-forge/projects/{project_name}.project_guardrails.yaml",
    f".trae/.flutter-forge/projects/{project_name}.project_guardrails.yaml",
    f".agents/.flutter-forge/projects/{project_name}.project_guardrails.yaml",
    f".flutter-forge/projects/{project_name}.project_guardrails.yaml",
]

found_path = next((path for path in search_paths if (project_root / path).is_file()), "-")
root_type = data["root_type"]

stale = False
stale_reason = ""
auto_refreshed = False

if root_type == "empty_new":
    status = "empty_new"
elif root_type == "non_flutter":
    status = "non_flutter"
elif found_path != "-":
    status = "found"

    # 检查 refresh_needed 标记（mtime 为写入时间）
    refresh_marker = project_root / ".flutter-forge" / "runtime" / "refresh_needed"
    if refresh_marker.exists():
        try:
            marker_age = int(time.time()) - int(refresh_marker.stat().st_mtime)
        except Exception:
            marker_age = 999
        if marker_age > 10:
            # TTL 过期，尝试自动刷新
            guardrails_path = project_root / found_path
            try:
                result = subprocess.run(
                    [sys.executable, str(script_dir / "init_project_guardrails.py"),
                     str(project_root), "--output", str(guardrails_path)],
                    capture_output=True, text=True, timeout=30,
                )
                if result.returncode == 0:
                    auto_refreshed = True
                    refresh_marker.unlink(missing_ok=True)
                else:
                    stale = True
                    stale_reason = f"auto_refresh_failed: {result.stderr[:200]}"
            except Exception as e:
                stale = True
                stale_reason = f"auto_refresh_error: {e}"
        else:
            stale = True
            stale_reason = "refresh_pending (TTL not expired)"

    # 检查 pubspec hash + lib dirs 是否变化（手动解析，不依赖 PyYAML）
    guardrails_file = project_root / found_path
    try:
        content = guardrails_file.read_text(encoding="utf-8")
        stored_hash = "-"
        stored_dirs = []
        in_quick_context = False
        for line in content.splitlines():
            stripped = line.strip()
            if stripped.startswith("quick_context:"):
                in_quick_context = True
                continue
            if in_quick_context:
                if stripped and not line.startswith(" ") and not line.startswith("\t"):
                    in_quick_context = False
                    continue
                if stripped.startswith("pubspec_hash:"):
                    stored_hash = stripped.split(":", 1)[1].strip().strip('"')
                elif stripped.startswith("lib_top_dirs_snapshot:"):
                    raw = stripped.split(":", 1)[1].strip()
                    if raw.startswith("[") and raw.endswith("]"):
                        stored_dirs = [x.strip().strip("'\"") for x in raw[1:-1].split(",") if x.strip().strip("'\"")]

        # 当前 pubspec hash
        pubspec = project_root / "pubspec.yaml"
        if pubspec.exists() and stored_hash != "-":
            current_hash = hashlib.sha256(pubspec.read_bytes()).hexdigest()[:16]
            if current_hash != stored_hash:
                stale = True
                stale_reason = f"pubspec_changed ({stored_hash} -> {current_hash})"

        # 当前 lib 顶层目录
        lib_dir = project_root / "lib"
        if lib_dir.is_dir() and stored_dirs:
            current_dirs = sorted(d.name for d in lib_dir.iterdir() if d.is_dir() and not d.name.startswith("."))
            if current_dirs != sorted(stored_dirs):
                stale = True
                stale_reason = f"lib_dirs_changed ({sorted(stored_dirs)} -> {current_dirs})"
    except Exception:
        pass  # 解析失败不标记 stale，降级使用
else:
    status = "missing"

result = {
    "status": status,
    "path": found_path,
    "project_name": project_name,
    "project_root": str(project_root),
    "root_type": root_type,
    "forge_enabled": data["forge_enabled"],
    "is_empty_dir": data["is_empty_dir"],
    "has_pubspec": data["has_pubspec"],
    "has_lib_dir": data["has_lib_dir"],
    "ignored_hidden_files": data["ignored_hidden_files"],
    "checked_at": data["checked_at"],
    "stale": stale,
    "stale_reason": stale_reason,
    "auto_refreshed": auto_refreshed,
}
print(json.dumps(result, ensure_ascii=False))
PY
)"

mkdir -p "${PROJECT_ROOT}/.flutter-forge/runtime" 2>/dev/null || true
printf '%s\n' "$RESULT_JSON" > "$STATE_FILE"

if [[ "${2:-}" == "--json" ]]; then
  echo "$RESULT_JSON"
  exit 0
fi

printf '%s' "$RESULT_JSON" | python3 - <<'PY'
import json
import sys

data = json.load(sys.stdin)
for key in (
    "status",
    "path",
    "project_name",
    "root_type",
    "forge_enabled",
    "is_empty_dir",
    "has_pubspec",
    "has_lib_dir",
    "stale",
    "stale_reason",
    "auto_refreshed",
):
    value = data[key]
    if isinstance(value, bool):
        value = str(value).lower()
    print(f"{key}: {value}")
PY
