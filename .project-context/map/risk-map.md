<!-- generated-by: project-memory; safe-to-overwrite -->
# 风险地图

本文件基于轻量扫描生成，用于提示改动前应优先核验的位置。

## 关键路径文件

- `docs/界面设计参考/10-forge-cli适配方案.md`
- `memory/global_preferences.yaml`
- `memory/runtime/current_task.template.yaml`
- `pm-memory/PROJECT-STATE.md`
- `references/example_workflow.md`
- `references/maintenance_map.md`
- `references/memory_protocol.md`
- `references/project_guardrails_protocol.md`
- `references/shared_workflow_gates/README.md`
- `references/shared_workflow_gates/advisor_collaboration.md`
- `references/shared_workflow_gates/existing_project_consulting.md`
- `references/shared_workflow_gates/question_budget.md`
- `references/shared_workflow_gates/requirement_confirmation.md`
- `references/shared_workflow_gates/role_gate_matrix.md`
- `references/shared_workflow_gates/routing_and_recovery.md`
- `references/workflow_diagram.md`
- `scripts/check_project_guardrails.sh`
- `scripts/hook_check_project_guardrails.sh`
- `scripts/init_project_guardrails.py`
- `scripts/release_checks/guardrails.sh`
- `scripts/validate_project_guardrails.py`
- `scripts/validate_project_guardrails_resolution.py`
- `src/agent/loop-v2.ts`
- `src/agent/loop.ts`
- `src/agents/orchestrator.ts`
- `src/agents/registry.ts`
- `src/cli/__tests__/ast-parser.test.ts`
- `src/cli/__tests__/git.test.ts`
- `src/cli/__tests__/state-machine.test.ts`
- `src/cli/__tests__/structured-edit.test.ts`
- `src/cli/__tests__/theme.test.ts`
- `src/cli/__tests__/web-fetch.test.ts`
- `src/cli/__tests__/web-search.test.ts`
- `src/cli/ast-parser.ts`
- `src/cli/commands.ts`
- `src/cli/dialog.ts`
- `src/cli/git.ts`
- `src/cli/index.ts`
- `src/cli/input-layout.ts`
- `src/cli/input.ts`
- `src/cli/keybindings.ts`
- `src/cli/layout.ts`
- `src/cli/message-system.ts`
- `src/cli/renderer-v2.ts`
- `src/cli/renderer.ts`
- `src/cli/repl-ink.tsx`
- `src/cli/repl.ts`
- `src/cli/spinner-v2.ts`
- `src/cli/spinner.ts`
- `src/cli/state-machine.ts`
- `src/cli/structured-edit.ts`
- `src/cli/task-group.ts`
- `src/cli/theme.ts`
- `src/cli/tree-sitter-parser.ts`
- `src/cli/web-fetch.ts`
- `src/cli/web-search.ts`
- `src/github/client.ts`
- `src/llm/client-v2.ts`
- `src/llm/client.ts`
- `src/llm/context.ts`

## 大文件

- `package-lock.json`：155236 bytes
- `src/cli/commands.ts`：58327 bytes
- `src/workflows/executor.ts`：35771 bytes
- `src/cli/repl-ink.tsx`：27639 bytes
- `src/cli/ast-parser.ts`：24981 bytes
- `src/agents/orchestrator.ts`：20985 bytes
- `src/memory/manager.ts`：19095 bytes
- `src/tools/filesystem.ts`：18264 bytes
- `src/cli/tree-sitter-parser.ts`：16948 bytes
- `src/plugin-dev/toolkit.ts`：16637 bytes
- `src/cli/repl.ts`：16548 bytes
- `scripts/validate_checklist.py`：16413 bytes
- `src/cli/structured-edit.ts`：15632 bytes
- `src/cli/dialog.ts`：14395 bytes
- `src/cli/renderer-v2.ts`：14285 bytes
- `src/cli/message-system.ts`：14078 bytes
- `src/cli/renderer.ts`：13579 bytes
- `scripts/controller.py`：13287 bytes
- `scripts/init_project_guardrails.py`：12634 bytes
- `src/cli/layout.ts`：11798 bytes

## 高导入文件

- `src/cli/commands.ts`：23 个 import/require
- `src/agents/orchestrator.ts`：22 个 import/require
- `src/cli/repl-ink.tsx`：20 个 import/require
- `src/cli/repl.ts`：17 个 import/require
- `src/workflows/executor.ts`：11 个 import/require
- `src/tools/index.ts`：9 个 import/require
- `src/agent/loop-v2.ts`：8 个 import/require
- `src/agents/controller.ts`：8 个 import/require
- `src/memory/manager.ts`：8 个 import/require
- `scripts/validate_checklist.py`：7 个 import/require
- `src/workflows/registry.ts`：7 个 import/require
- `scripts/controller.py`：6 个 import/require
- `scripts/route_golden_tests.py`：6 个 import/require
- `src/agent/loop.ts`：6 个 import/require
- `src/config/manager.ts`：6 个 import/require
- `src/plugin-dev/toolkit.ts`：6 个 import/require
- `src/ui/app.tsx`：6 个 import/require
- `src/workflows/store.ts`：6 个 import/require
- `examples/tree-sitter-demo.ts`：5 个 import/require
- `scripts/detect_project_root_state.py`：5 个 import/require

## 有源码但未在同模块发现测试

- `.`
- `.claude`
- `config`
- `examples`
- `memory`
- `scripts`
- `src`
- `src/agent`
- `src/agents`
- `src/confidence`
- `src/config`
- `src/gate`
- `src/github`
- `src/hooks`
- `src/learning`
- `src/llm`
- `src/mcp`
- `src/memory`
- `src/modes`
- `src/output`
- `src/permissions`
- `src/plugin-dev`
- `src/plugins`
- `src/security`
- `src/session`
- `src/skills`
- `src/tools`
- `src/ui`
- `src/utils`
- `src/workflow`
- `src/workflows`

## 需要人工判断

- 当前扫描不会判断业务正确性、并发安全、权限绕过、数据迁移或发布兼容性。
- 任何跨 contract、Agent loop、工具执行、安全权限、持久化格式的改动，都应补充源码级阅读和回归测试。
