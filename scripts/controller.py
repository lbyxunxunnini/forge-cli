#!/usr/bin/env python3
"""Forge CLI controller: phase/gate/resume orchestration + agent prompt generation.

When invoked with `generate-agent-prompt`, reads the role contract from
references/roles/<role>.md, assembles project context, and outputs a complete
agent prompt suitable for isolated sub-agent execution.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_ROOT = SCRIPT_DIR.parent

ROLE_NAME_MAP = {
    "requirement_analyst": "需求分析师",
    "ui_designer": "UI 设计师",
    "architecture_designer": "架构设计师",
    "page_engineer": "页面工程师",
    "verify_agent": "验证工程师",
}


def run_script(command: list[str], cwd: Path) -> tuple[int, str]:
    proc = subprocess.run(command, cwd=cwd, capture_output=True, text=True)
    return proc.returncode, proc.stdout.strip()


def parse_kv_output(text: str) -> dict[str, str]:
    data: dict[str, str] = {}
    for line in text.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip()
    return data


def choose_role(phase: str, mode: str) -> str:
    if phase == "S1":
        return "requirement_analyst"
    if phase == "S2":
        if mode == "UI 优化":
            return "ui_designer"
        if mode in {"架构级任务", "新项目共创"}:
            return "architecture_designer"
        return "page_engineer"
    if phase == "S3":
        return "architecture_designer"
    if phase == "S4":
        return "page_engineer"
    if phase == "S5":
        return "verify_agent"
    return "controller"


def read_role_contract(role: str) -> str:
    contract_path = SKILL_ROOT / "references" / "roles" / f"{role}.md"
    if contract_path.exists():
        return contract_path.read_text(encoding="utf-8")
    return ""


def read_guardrails_summary(project_root: Path) -> str:
    candidates = [
        project_root / ".claude/.forge-cli",
        project_root / ".trae/.forge-cli",
        project_root / ".agents/.forge-cli",
        project_root / ".forge-cli",
    ]
    for base in candidates:
        for f in base.glob("projects/*.project_guardrails.yaml"):
            try:
                content = f.read_text(encoding="utf-8")
                lines = content.splitlines()[:30]
                return "\n".join(lines)
            except Exception:
                continue
    return ""


def build_agent_prompt(
    role: str,
    role_display: str,
    contract: str,
    session: dict[str, str],
    user_input: str,
    guardrails_summary: str,
    phase: str,
    mode: str,
) -> str:
    sections = []

    sections.append(f"# Forge CLI 角色：{role_display}")
    sections.append("")
    sections.append("你是 Forge CLI 的子代理，负责独立执行以下角色职责。")
    sections.append("严格遵守角色边界，不要越权执行其他角色的工作。")
    sections.append("")

    sections.append("## 角色合约")
    sections.append("")
    if contract:
        sections.append(contract)
    else:
        sections.append(f"（未找到 {role} 的角色合约文件，请按 SKILL.md 中的角色定义执行）")
    sections.append("")

    sections.append("## 当前上下文")
    sections.append("")
    sections.append(f"- 阶段：{phase}")
    sections.append(f"- 模式：{mode}")
    sections.append(f"- 确认状态：{session.get('确认状态', '-')}")
    sections.append(f"- 目标状态：{session.get('目标状态', '-')}")
    sections.append(f"- 范围状态：{session.get('范围状态', '-')}")
    sections.append(f"- 验收状态：{session.get('验收状态', '-')}")
    sections.append(f"- 约束状态：{session.get('约束状态', '-')}")
    sections.append(f"- 改动契约：{session.get('改动契约', '-')}")
    sections.append(f"- 当前子单元：{session.get('当前子单元', '-')}")
    sections.append(f"- 子单元状态：{session.get('子单元状态', '-')}")
    sections.append(f"- 验证状态：{session.get('验证状态', '-')}")
    sections.append(f"- 超范围风险：{session.get('超范围风险', '-')}")
    sections.append(f"- 计划冲突状态：{session.get('计划冲突状态', '-')}")
    sections.append(f"- 工作模式锁：{session.get('工作模式锁', '-')}")
    sections.append(f"- 退出许可：{session.get('退出许可', '-')}")
    sections.append(f"- 任务对象：{session.get('任务对象', '-')}")
    sections.append(f"- 工作包：{session.get('工作包', '无')}")
    sections.append("")

    if guardrails_summary:
        sections.append("## 项目护栏摘要")
        sections.append("")
        sections.append(guardrails_summary)
        sections.append("")

    sections.append("## 用户输入")
    sections.append("")
    sections.append(user_input)
    sections.append("")

    sections.append("## 执行要求")
    sections.append("")
    sections.append("1. 输出前必须包含 `[f-forge] {角色名}：` 前缀日志")
    sections.append("2. 完成前必须输出角色对应的 YAML checklist，并运行 `python3 scripts/validate_checklist.py --role {role}` 确认 PASS")
    sections.append("3. 如果发现超出角色边界的问题，上报给主控而非自行处理")
    sections.append("4. 严格遵守 Iron Law：需求/方案未确认且无 auto_assumption 时禁止写实现代码")
    sections.append("")

    return "\n".join(sections)


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


def cmd_run(args: argparse.Namespace) -> int:
    project_root = Path(args.project_root).resolve()
    session_script = SCRIPT_DIR / "ff_session.sh"
    gate_script = SCRIPT_DIR / "gate_check.py"

    result: dict[str, object] = {
        "project_root": str(project_root),
        "user_input": args.user_input,
    }

    code, resume_out = run_script(
        ["bash", str(session_script), "--project-root", str(project_root), "check-resume", "--user-input", args.user_input],
        project_root,
    )
    del code
    resume = parse_kv_output(resume_out)
    result["resume"] = resume

    code, session_out = run_script(["bash", str(session_script), "--project-root", str(project_root), "read"], project_root)
    del code
    session = {"status": "no_session"}
    if "---" in session_out:
        _, body = session_out.split("---", 1)
        session = {}
        for line in body.splitlines():
            if line.startswith("- ") and "：" in line:
                key, value = line[2:].split("：", 1)
                session[key.strip()] = value.strip()
    result["session"] = session

    phase = session.get("当前阶段", resume.get("phase", "-"))
    mode = session.get("当前模式", resume.get("mode", "-"))
    result["phase"] = phase
    result["role"] = choose_role(phase, mode)

    if args.target_path:
        code, gate_out = run_script(
            [
                "python3",
                str(gate_script),
                "--project-root",
                str(project_root),
                "--target-path",
                args.target_path,
                "--mode",
                args.gate_mode,
            ],
            project_root,
        )
        result["gate_exit_code"] = code
        try:
            result["gate"] = json.loads(gate_out) if gate_out else {}
        except json.JSONDecodeError:
            result["gate"] = {"decision": "error", "raw": gate_out}

    if resume.get("status") == "resume_match":
        result["next_action"] = "resume_current_phase"
    elif session.get("工作模式锁", "激活") == "激活" and session.get("退出许可", "禁止") != "允许" and phase == "S6":
        result["next_action"] = "reject_premature_exit"
    elif phase == "S4":
        result["next_action"] = "implement_current_package"
    elif phase == "S5":
        if session.get("验证状态", "未验证") == "已通过" and session.get("退出许可", "禁止") == "允许":
            result["next_action"] = "complete_current_task"
        else:
            result["next_action"] = "validate_current_change"
    else:
        result["next_action"] = "continue_phase_protocol"

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


def cmd_generate_agent_prompt(args: argparse.Namespace) -> int:
    project_root = Path(args.project_root).resolve()
    session_script = SCRIPT_DIR / "ff_session.sh"

    code, session_out = run_script(["bash", str(session_script), "--project-root", str(project_root), "read"], project_root)
    del code
    session: dict[str, str] = {}
    if "---" in session_out:
        _, body = session_out.split("---", 1)
        for line in body.splitlines():
            if line.startswith("- ") and "：" in line:
                key, value = line[2:].split("：", 1)
                session[key.strip()] = value.strip()

    role = args.role
    if not role:
        phase = session.get("当前阶段", "-")
        mode = session.get("当前模式", "-")
        role = choose_role(phase, mode)

    if role == "controller":
        print(json.dumps({"error": "controller 角色不生成子代理提示"}, ensure_ascii=False))
        return 1

    role_display = ROLE_NAME_MAP.get(role, role)
    contract = read_role_contract(role)
    guardrails_summary = read_guardrails_summary(project_root)

    # 检测恢复场景
    waiting_state = session.get("等待状态", "none")
    is_resume = waiting_state != "none"
    resume_context = ""
    if is_resume:
        pending = session.get("待确认问题", "-")
        task_obj = session.get("任务对象", "-")
        last_input = session.get("最后用户输入摘要", "-")
        resume_parts = []
        if pending != "-":
            resume_parts.append(f"待确认问题：{pending}")
        if task_obj != "-":
            resume_parts.append(f"任务对象：{task_obj}")
        if last_input != "-":
            resume_parts.append(f"上次输入摘要：{last_input}")
        resume_context = "\n".join(resume_parts)

    agent_prompt = build_agent_prompt(
        role=role,
        role_display=role_display,
        contract=contract,
        session=session,
        user_input=args.user_input,
        guardrails_summary=guardrails_summary,
        phase=session.get("当前阶段", "-"),
        mode=session.get("当前模式", "-"),
    )

    # 恢复场景：在 agent_prompt 末尾注入恢复上下文
    if is_resume and resume_context:
        agent_prompt += f"\n\n## 恢复上下文（上次中断点）\n\n{resume_context}\n\n请从上次中断点继续，不要重新分析已完成的部分。\n"

    output = {
        "role": role,
        "role_display": role_display,
        "phase": session.get("当前阶段", "-"),
        "mode": session.get("当前模式", "-"),
        "agent_prompt": agent_prompt,
        "is_resume": is_resume,
        "context": {
            "project_root": str(project_root),
            "session": session,
            "guardrails_summary": guardrails_summary[:500] if guardrails_summary else "",
        },
    }

    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command")

    run_parser = subparsers.add_parser("run", help="Phase/gate/resume orchestration")
    run_parser.add_argument("--project-root", default=".")
    run_parser.add_argument("--user-input", default="")
    run_parser.add_argument("--target-path", default="")
    run_parser.add_argument("--gate-mode", choices={"observe", "enforce"}, default="observe")

    prompt_parser = subparsers.add_parser("generate-agent-prompt", help="Generate isolated agent prompt for a role")
    prompt_parser.add_argument("--project-root", default=".")
    prompt_parser.add_argument("--user-input", default="")
    prompt_parser.add_argument("--role", default="", choices=[""] + list(ROLE_NAME_MAP.keys()), help="Role to generate prompt for (auto-detected from session if omitted)")

    args = parser.parse_args()

    if args.command == "generate-agent-prompt":
        return cmd_generate_agent_prompt(args)
    elif args.command == "run":
        return cmd_run(args)
    else:
        # Legacy: no subcommand = run mode (backward compatible)
        args.command = "run"
        if not hasattr(args, "project_root"):
            args.project_root = "."
        if not hasattr(args, "user_input"):
            args.user_input = ""
        if not hasattr(args, "target_path"):
            args.target_path = ""
        if not hasattr(args, "gate_mode"):
            args.gate_mode = "observe"
        return cmd_run(args)


if __name__ == "__main__":
    sys.exit(main())
