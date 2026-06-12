#!/usr/bin/env python3
"""Evaluate forge-cli phase/contract gates for a target write path.

所有门禁均为硬性阻断，无模糊词，无软约束。
只检查 session 中的核心字段，不检查日志文件。
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def read_session(project_root: Path) -> dict[str, str]:
    candidates = [
        project_root / ".claude/.forge-cli/session.md",
        project_root / ".trae/.forge-cli/session.md",
        project_root / ".agents/.forge-cli/session.md",
        project_root / ".forge-cli/session.md",
    ]
    session_path = next((path for path in candidates if path.exists()), None)
    if session_path is None:
        return {}

    data: dict[str, str] = {"_path": str(session_path)}
    for line in session_path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("- ") or "：" not in line:
            continue
        field, value = line[2:].split("：", 1)
        data[field.strip()] = value.strip()
    return data


def read_task_gate(project_root: Path) -> dict[str, object]:
    path = project_root / ".forge-cli/runtime/task_gate.json"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


ROLE_ALLOWED_TARGETS: dict[str, set[str]] = {
    "requirement_analyst": {"metadata"},
    "ui_designer": {"metadata"},
    "architecture_designer": {"metadata"},
    "page_engineer": {"implementation", "core_shared", "router", "state", "test"},
    "verify_agent": {"test", "metadata"},
}

IMPLEMENTATION_TARGETS = {"implementation", "project_config", "core_shared", "router", "state"}


def classify_target(target_path: str) -> str:
    normalized = target_path.replace("\\", "/").lower()
    if normalized.startswith("./"):
        normalized = normalized[2:]
    if not normalized:
        return "unknown"
    project_config_suffixes = (
        "/pubspec.yaml",
        "/pubspec.lock",
        "/analysis_options.yaml",
        "/ios/podfile",
        "/ios/podfile.lock",
        "/android/build.gradle",
        "/android/settings.gradle",
        "/android/gradle.properties",
        "/android/app/build.gradle",
    )
    if normalized in {suffix[1:] for suffix in project_config_suffixes} or normalized.endswith(project_config_suffixes):
        return "project_config"
    if normalized.endswith((".md", ".txt", ".yaml", ".yml", ".json")):
        return "metadata"
    if "/test/" in normalized or normalized.endswith("_test.dart"):
        return "test"
    if "/router/" in normalized or "/route" in normalized or "routes" in normalized:
        return "router"
    if any(token in normalized for token in ("provider", "notifier", "bloc", "cubit", "controller", "/di/", "dependency_injection")):
        return "state"
    if "/lib/core/" in normalized or "/lib/shared/" in normalized:
        return "core_shared"
    if normalized.endswith(".dart"):
        return "implementation"
    return "other"


def mode_needs_contract(mode: str) -> bool:
    return mode in {"中等任务", "UI 优化", "架构级任务", "功能开发", "页面开发"}


def exempt_by_policy(task_gate: dict[str, object], mode: str) -> bool:
    policy = str(task_gate.get("policy", "标准"))
    if policy == "全自动":
        return True
    if mode in {"直通模式", "轻量任务"}:
        return True
    return False


def build_result(decision: str, gate: str, reason: str, target_kind: str, session: dict[str, str]) -> dict[str, object]:
    return {
        "decision": decision,
        "gate": gate,
        "reason": reason,
        "target_kind": target_kind,
        "phase": session.get("当前阶段", "-"),
        "mode": session.get("当前模式", "-"),
        "confirmation_status": session.get("确认状态", "-"),
        "change_contract": session.get("改动契约", "-"),
        "session_path": session.get("_path", "-"),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--project-root", required=True)
    parser.add_argument("--target-path", default="")
    parser.add_argument("--mode", choices={"observe", "enforce"}, default="enforce")
    args = parser.parse_args()

    project_root = Path(args.project_root).resolve()
    session = read_session(project_root)
    target_kind = classify_target(args.target_path)
    task_gate = read_task_gate(project_root)

    if target_kind in {"other", "unknown"}:
        print(json.dumps(build_result("allow", "G00", "目标文件类型不在门禁范围内", target_kind, session), ensure_ascii=False))
        return 0

    if not session:
        if target_kind in IMPLEMENTATION_TARGETS:
            decision = "would_block" if args.mode == "observe" else "block"
            print(json.dumps(build_result(decision, "G01", "session 不存在，必须先调用 ff_session.sh init 初始化 session", target_kind, session), ensure_ascii=False))
            return 0 if decision == "would_block" else 2
        print(json.dumps(build_result("allow", "G00", "非实现类文件无需 session", target_kind, session), ensure_ascii=False))
        return 0

    phase = session.get("当前阶段", "-")
    mode = session.get("当前模式", "-")
    confirmation_status = session.get("确认状态", "-")
    change_contract = session.get("改动契约", "-")
    exempt = exempt_by_policy(task_gate, mode)
    goal_status = session.get("目标状态", "未确认")
    scope_status = session.get("范围状态", "未确认")
    acceptance_status = session.get("验收状态", "未确认")
    constraint_status = session.get("约束状态", "未确认")
    current_work_unit = session.get("当前子单元", "-")
    work_unit_status = session.get("子单元状态", "未冻结")
    verification_status = session.get("验证状态", "未验证")
    scope_risk = session.get("超范围风险", "无")
    plan_conflict = session.get("计划冲突状态", "无")
    mode_lock = session.get("工作模式锁", "激活")
    exit_permission = session.get("退出许可", "禁止")
    active_agent = session.get("活跃代理", "controller")

    decisions: list[tuple[str, str]] = []

    if target_kind in IMPLEMENTATION_TARGETS:
        if phase in {"C0", "C1", "C2", "C3", "S0", "S1", "S2", "S3"}:
            if not (phase == "S2" and confirmation_status == "用户已确认" and change_contract != "-"):
                decisions.append(("G05", f"当前阶段 {phase} 未进入 S4，禁止写入实现类文件"))

        if phase == "S2" and confirmation_status == "用户已确认" and change_contract != "-":
            if target_kind in {"metadata", "test", "project_config"}:
                decisions.append(("G06", "S2 已确认且改动契约已冻结，必须先进入 S4 才能写入测试/文档/配置"))

        if phase == "S5" and target_kind in IMPLEMENTATION_TARGETS:
            decisions.append(("G07", "S5 验证阶段禁止写入实现类文件，只允许测试和元数据"))

    if active_agent not in {"controller", "-"}:
        allowed = ROLE_ALLOWED_TARGETS.get(active_agent, set())
        if allowed and target_kind not in allowed:
            role_display = {
                "requirement_analyst": "需求分析师",
                "ui_designer": "UI 设计师",
                "architecture_designer": "架构设计师",
                "page_engineer": "页面工程师",
                "verify_agent": "验证工程师",
            }.get(active_agent, active_agent)
            decisions.append(("G08", f"{role_display} 禁止写入 {target_kind} 类文件，允许范围：{', '.join(sorted(allowed))}"))

    if phase == "S6" and mode_lock == "激活" and exit_permission != "允许":
        decisions.append(("G09", "工作模式锁激活且退出许可未打开，禁止 S6 收口"))

    if target_kind in IMPLEMENTATION_TARGETS:
        missing_core = [
            label for label, field in (
                ("目标", goal_status),
                ("范围", scope_status),
                ("验收", acceptance_status),
                ("约束", constraint_status),
            ) if field != "已确认"
        ]
        if missing_core:
            decisions.append(("G10", f"核心任务定义未冻结，缺失：{', '.join(missing_core)}"))

        if current_work_unit == "-" or work_unit_status not in {"已冻结", "实现中", "待验证", "已通过"}:
            decisions.append(("G11", "当前子单元未冻结，必须先调用 ff_session.sh update --current_work_unit <name> --work_unit_status 已冻结"))

        if scope_risk == "已发现":
            decisions.append(("G12", "已发现超范围风险，必须先回退到 S2/S3 重新确认"))

        if plan_conflict == "已发现待回退":
            decisions.append(("G13", "计划与代码现实冲突，必须先回退对应确认阶段"))

    if phase == "S5" and target_kind in {"metadata", "test"} and verification_status != "已通过":
        decisions.append(("G14", "验证状态未通过，禁止写入收口元数据"))

    if not exempt and mode_needs_contract(mode):
        if change_contract == "-":
            decisions.append(("G15", "改动契约未冻结，必须先调用 ff_session.sh update --change_contract <contract>"))
        if confirmation_status != "用户已确认":
            decisions.append(("G16", "改动契约未获用户确认，必须等待用户确认后才能写入"))

    if not decisions:
        print(json.dumps(build_result("allow", "G00", "所有门禁通过", target_kind, session), ensure_ascii=False))
        return 0

    gate, reason = decisions[0]
    decision = "would_block" if args.mode == "observe" else "block"
    print(json.dumps(build_result(decision, gate, reason, target_kind, session), ensure_ascii=False))
    return 0 if decision == "would_block" else 2


if __name__ == "__main__":
    sys.exit(main())
