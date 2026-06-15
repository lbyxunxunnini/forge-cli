<!-- generated-by: project-memory; safe-to-overwrite -->
# Skill 项目专项摘要

本文件只在项目具备 skill 信号时作为专项导航；它总结使用规则和资源布局，不替代读取 `SKILL.md`。

## 入口与触发规则

- `SKILL.md`（Forge CLI）

## Agent/UI 元数据

- 未识别到明显文件。

## References

- `references/agent_isolation_protocol.md`（Forge CLI Reference - Agent Isolation Protocol）
- `references/autonomous_mode.md`（Forge CLI Reference - Autonomous Mode）
- `references/core_contracts.yaml`
- `references/decision_and_question_protocol.md`（Forge CLI Reference - Decision And Question Protocol）
- `references/engineering_heuristics.md`（Forge CLI Reference - Engineering Heuristics）
- `references/example_workflow.md`（Forge CLI Reference - Example Workflow）
- `references/existing_project_entry.md`（Forge CLI Reference - Existing Project Entry）
- `references/existing_project_scan.md`（Forge CLI Reference - Existing Project First Scan）
- `references/existing_rules_discovery.md`（Forge CLI Reference - 已有项目规则发现）
- `references/fast_mode.md`（Forge CLI Reference - Fast Mode）
- `references/host_subagent_support.md`（Forge CLI Reference - Host Subagent Support）
- `references/issue-ledger.md`（Agent PM Issue Ledger）
- `references/load_map.md`（Forge CLI Reference - Load Map）
- `references/maintenance_map.md`（Forge CLI Maintenance Map）
- `references/memory_protocol.md`（Forge CLI Reference - Memory Protocol）
- `references/network_and_api.md`（Forge CLI Reference - Network And API Rules）
- `references/new_project_cocreation_mode.md`（Forge CLI Reference - 新项目共创模式）
- `references/phase_checkpoint.md`（Forge CLI Reference - 阶段转换检查点）
- `references/project_guardrails_protocol.md`（Forge CLI Reference - Project Guardrails 协议）
- `references/project_init_flow.md`（Forge CLI Reference - 项目初始化与接入）
- `references/roles/architecture_designer.md`（Architecture Designer Contract）
- `references/roles/page_engineer.md`（Page Engineer Contract）
- `references/roles/requirement_analyst.md`（Requirement Analyst Contract）
- `references/roles/ui_designer.md`（UI Designer Contract）
- `references/roles/verify_agent.md`（Verify Agent Contract）
- `references/routing_and_navigation.md`（Forge CLI Reference - Routing And Navigation Rules）
- `references/session_management.md`（Forge CLI Reference - 会话管理）
- `references/shared_workflow_gates/README.md`（Shared Workflow Gates）
- `references/shared_workflow_gates/advisor_collaboration.md`（Advisor Collaboration）
- `references/shared_workflow_gates/existing_project_consulting.md`（Existing Project Consulting）
- `references/shared_workflow_gates/question_budget.md`（Question Budget）
- `references/shared_workflow_gates/requirement_confirmation.md`（Requirement Confirmation）
- `references/shared_workflow_gates/role_gate_matrix.md`（Role Gate Matrix）
- `references/shared_workflow_gates/routing_and_recovery.md`（Routing And Recovery）
- `references/skill_visibility.md`（Forge CLI Reference - 可见性协议）
- `references/stack_profiles.md`（Forge CLI Reference - Stack Profiles）
- `references/startup_handshake.md`（Forge CLI Reference - 启动握手）
- `references/task_runtime_prompt.md`（Forge CLI Reference - Task Runtime）
- `references/trigger_words.md`（Forge CLI Reference - Trigger Words (Single Source)）
- `references/workflow_diagram.md`（Forge CLI Reference - 主工作流可视化）

## Scripts

- `scripts/check_project_guardrails.sh`
- `scripts/classify_task.sh`
- `scripts/controller.py`（符号：run_script, parse_kv_output, choose_role, read_role_contract, read_guardrails_summary, build_agent_prompt, build_result, cmd_run）
- `scripts/detect_project_root_state.py`（符号：visible_entries, detect_root_state, main）
- `scripts/doctor.sh`
- `scripts/ff_session.sh`
- `scripts/find_existing_rules.sh`
- `scripts/gate_check.py`（符号：read_session, read_task_gate, classify_target, mode_needs_contract, exempt_by_policy, build_result, main）
- `scripts/hook_check_project_guardrails.sh`
- `scripts/init_project_guardrails.py`（符号：compute_pubspec_hash, compute_lib_top_dirs_snapshot, load_snapshot, signal_exists, choose_profile, profile_defaults, best_signal, evidence_lines）
- `scripts/project_snapshot.py`（符号：load_stack_scanner, first_existing, top_dirs, find_project_guardrails, snapshot, print_text, main）
- `scripts/release_checks/gates.sh`
- `scripts/release_checks/guardrails.sh`
- `scripts/release_checks/lib.sh`
- `scripts/release_checks/metadata.sh`
- `scripts/release_checks/output_protocol.sh`（!/usr/bin/env bash）
- `scripts/release_checks/session.sh`
- `scripts/route_golden_tests.py`（符号：classify_with_script, main）
- `scripts/test-e2e.sh`
- `scripts/validate_checklist.py`（符号：FieldSpec, ValidationError, extract_checklist_block, parse_simple_yaml, parse_scalar, get_indent, parse_block, __str__）
- `scripts/validate_docs_sync.py`（符号：markdown_links, validate_links, contains, script_references, validate_script_references, main）
- `scripts/validate_output.sh`
- `scripts/validate_output_prefix.sh`
- `scripts/validate_project.sh`
- `scripts/validate_project_guardrails.py`（符号：strip_inline_comment, normalize_scalar, parse_yaml_like, is_missing, validate_file, main）
- `scripts/validate_project_guardrails_resolution.py`（符号：load_snapshot, write_minimal_project, write_card, main）
- `scripts/validate_release.sh`

## Assets

- 未识别到明显文件。

## 验证与示例

- `VERIFICATION.md`（Forge CLI CLI Agent 验证清单）
- `examples/ast-demo.ts`（符号：main, formatUser, UserManager, User, UserService, UserRole, MAX_USERS, DEFAULT_ROLE）
- `examples/phase5-demo.ts`（符号：main, goodbye, test）
- `examples/tree-sitter-demo.ts`（符号：main, formatUser, UserManager, UserService, User, addUser, getUser, loadUsers）
- `examples/ui-demo.ts`（符号：main, hello, sleep）
- `examples/web-fetch-demo.ts`（符号：main）
- `references/example_workflow.md`（Forge CLI Reference - Example Workflow）
- `scripts/route_golden_tests.py`（符号：classify_with_script, main）
- `scripts/test-e2e.sh`
- `scripts/validate_checklist.py`（符号：FieldSpec, ValidationError, extract_checklist_block, parse_simple_yaml, parse_scalar, get_indent, parse_block, __str__）
- `scripts/validate_docs_sync.py`（符号：markdown_links, validate_links, contains, script_references, validate_script_references, main）
- `scripts/validate_output.sh`
- `scripts/validate_output_prefix.sh`
- `scripts/validate_project.sh`
- `scripts/validate_project_guardrails.py`（符号：strip_inline_comment, normalize_scalar, parse_yaml_like, is_missing, validate_file, main）
- `scripts/validate_project_guardrails_resolution.py`（符号：load_snapshot, write_minimal_project, write_card, main）
- `scripts/validate_release.sh`
- `src/cli/__tests__/ast-parser.test.ts`（符号：world, help, User）
- `src/cli/__tests__/git.test.ts`
- `src/cli/__tests__/state-machine.test.ts`
- `src/cli/__tests__/structured-edit.test.ts`
- `src/cli/__tests__/theme.test.ts`
- `src/cli/__tests__/web-fetch.test.ts`
- `src/cli/__tests__/web-search.test.ts`
- `tests/checklist_fixtures/architecture_designer_pass.txt`
- `tests/checklist_fixtures/page_engineer_fail_missing.txt`
- `tests/checklist_fixtures/page_engineer_fail_placeholder.txt`
- `tests/checklist_fixtures/page_engineer_pass.txt`
- `tests/checklist_fixtures/requirement_analyst_pass.txt`
- `tests/checklist_fixtures/ui_designer_pass.txt`
- `tests/checklist_fixtures/verify_agent_pass.txt`（=== 第一阶段：规格合规审查 ===）
- `tests/route_golden_cases.json`
- `vitest.config.ts`

## 需要源码/文档确认的问题

- skill 的触发条件、禁止触发场景和状态选择逻辑。
- `SKILL.md` 是否只保留核心流程，细节是否下沉到 `references/`。
- `scripts/` 是否是可重复、可验证的确定性操作。
- `agents/openai.yaml` 是否与 `SKILL.md` 的真实能力一致。
- 验证脚本、golden case 或示例是否覆盖主要使用路径。

## 恢复提示

- 默认先读 `SKILL.md`，再按任务读取相关 `references/*.md` 或脚本。
- 不要把整个 `references/` 递归读入上下文；按 `SKILL.md` 的路由说明定向读取。
