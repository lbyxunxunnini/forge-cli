<!-- generated-by: project-memory; safe-to-overwrite -->
# 运行链路地图

本文件是轻量扫描生成的导航图，不是完整调用图。修改行为前必须读取对应源码验证。

## 可能入口与调度文件

- `scripts/controller.py`（源码；符号：run_script, parse_kv_output, choose_role, read_role_contract, read_guardrails_summary, build_agent_prompt, build_result, cmd_run；导入数：6）
- `src/agent/index.ts`（源码）
- `src/agent/loop-v2.ts`（源码；符号：AgentLoopV2, AgentLoopOptions；导入数：8）
- `src/agent/loop.ts`（源码；符号：AgentLoop, AgentLoopOptions；导入数：6）
- `src/agents/controller.ts`（源码；符号：ControllerAgent；导入数：8）
- `src/agents/index.ts`（源码）
- `src/agents/orchestrator.ts`（源码；符号：AgentOrchestrator；导入数：22）
- `src/agents/registry.ts`（源码；符号：AgentRegistry, agentRegistry；导入数：4）
- `src/cli/ast-parser.ts`（源码；符号：createASTManager, TypeScriptParser, DartParser, SymbolSearcher, ASTManager, ASTNodeType, ASTNode, ASTMetadata；导入数：2）
- `src/cli/commands.ts`（源码；符号：ask, selectOption, promptInput, handleCommand, handleModelCommand, flowModelManager, flowSelectModel, flowAddCustomProvider；导入数：23）
- `src/cli/dialog.ts`（源码；符号：createDialogManager, showConfirm, showInput, showSelect, showFuzzySearch, showTreeSelect, DialogManager, DialogType；导入数：3）
- `src/cli/git.ts`（源码；符号：createGitManager, GitManager, GitStatus, GitFileStatus, GitCommit, GitBranch, gitManager；导入数：3）
- `src/cli/index.ts`（源码）
- `src/cli/input-layout.ts`（源码；符号：createInputLayoutManager, renderInputLayout, renderCompactLayout, InputLayoutManager, StatusLineData, InputLayoutOptions, inputLayoutManager；导入数：2）
- `src/cli/input.ts`（源码；符号：createInputManager, prompt, confirm, select, InputManager, InputMode, SuggestionItem, InputOptions；导入数：3）
- `src/cli/keybindings.ts`（源码；符号：createKeybindingManager, KeybindingManager, KeybindingAction, KeybindingContext, Keybinding, KeybindingBlock, DEFAULT_BINDINGS, keybindingManager）
- `src/cli/layout.ts`（源码；符号：createLayoutManager, LayoutManager, LayoutType, LayoutRegion, LayoutOptions, ScrollOptions, VirtualListOptions, layoutManager；导入数：2）
- `src/cli/message-system.ts`（源码；符号：createMessageManager, createMessageRenderer, MessageManager, MessageRenderer, MessageType, MessageStatus, Message, MessageMetadata；导入数：2）
- `src/cli/renderer-v2.ts`（源码；符号：renderBanner, renderHelp, renderStatus, renderError, renderSuccess, renderWarning, renderInfo, renderPhase；导入数：2）
- `src/cli/renderer.ts`（源码；符号：renderBanner, renderHelp, renderStatus, renderError, renderSuccess, renderPhase, renderAssistantStart, renderMarkdown；导入数：1）
- `src/cli/repl-ink.tsx`（源码；符号：generateSessionId, ForgeApp, startInkREPL；导入数：20）
- `src/cli/repl.ts`（源码；符号：askSetup, selectSetup, flowFirstSetup, setupCustomProvider, startREPL, printInputBar, printToolCallSummary, pauseRL；导入数：17）
- `src/cli/spinner-v2.ts`（源码；符号：createSpinner, withSpinner, SpinnerV2, SpinnerOptions, SPINNER_VERBS；导入数：2）
- `src/cli/spinner.ts`（源码；符号：Spinner；导入数：1）
- `src/cli/state-machine.ts`（源码；符号：createStateMachine, saveSnapshot, loadSnapshot, StateMachineError, StateMachine, StateType, StateTransition, StateHistoryEntry；导入数：1）
- `src/cli/structured-edit.ts`（源码；符号：createDiffGenerator, createLintChecker, createTestRunner, DiffGenerator, LintChecker, TestRunner, DiffType, DiffLine；导入数：2）
- `src/cli/task-group.ts`（源码；符号：TaskGroupRenderer, ToolCallRecord, TaskGroup, taskGroupRenderer；导入数：1）
- `src/cli/theme.ts`（源码；符号：getTheme, getThemeName, setTheme, getAvailableThemes, Theme, ThemeName, t；导入数：1）
- `src/cli/tree-sitter-parser.ts`（源码；符号：createTreeSitterParserManager, TreeSitterParserManager, SyntaxNode, TreeCursor, Tree, Parser, ASTNodeType, ASTNode；导入数：1）
- `src/cli/web-fetch.ts`（源码；符号：createWebFetchManager, fetchWebText, fetchWebTitle, WebFetchManager, WebFetchOptions, WebFetchResult, webFetchManager；导入数：1）
- `src/cli/web-search.ts`（源码；符号：createWebSearchManager, webSearch, WebSearchManager, WebSearchOptions, ResourceType, WebSearchResult, SearchReference, webSearchManager；导入数：1）
- `src/confidence/index.ts`（源码）
- `src/config/index.ts`（源码）
- `src/config/manager.ts`（源码；符号：ConfigManager, configManager；导入数：6）
- `src/github/client.ts`（源码；符号：GitHubClient, createGitHubClient；导入数：2）
- `src/github/index.ts`（源码）
- `src/hooks/index.ts`（源码）
- `src/hooks/manager.ts`（源码；符号：HookManager, hookManager；导入数：5）
- `src/learning/index.ts`（源码）
- `src/learning/manager.ts`（源码；符号：LearningMode, learningMode；导入数：1）
- `src/llm/client-v2.ts`（源码；符号：createCompatFetch, AIClient, AgentTool, UsageInfo；导入数：5）
- `src/llm/client.ts`（源码；符号：LLMClient；导入数：5）
- `src/llm/index.ts`（源码）
- `src/main.ts`（源码；导入数：1）
- `src/mcp/client.ts`（源码；符号：MCPClient, mcpClient；导入数：3）
- `src/mcp/index.ts`（源码）
- `src/memory/index.ts`（源码）
- `src/memory/manager.ts`（源码；符号：MemoryManager, memoryManager；导入数：8）
- `src/modes/index.ts`（源码）
- `src/permissions/manager.ts`（源码；符号：PermissionManager, PermissionOperation, PermissionEntry, PermissionCheckResult, permissionManager；导入数：4）
- `src/plugin-dev/index.ts`（源码）
- `src/plugins/index.ts`（源码）
- `src/plugins/manager.ts`（源码；符号：PluginManager, pluginManager；导入数：2）
- `src/security/index.ts`（源码）
- `src/session/manager.ts`（源码；符号：SessionManager, SessionState, SessionMode, SessionData, sessionManager；导入数：4）
- `src/skills/manager.ts`（源码；符号：SkillManager, SkillInfo, SkillUpdate, skillManager；导入数：4）
- `src/tools/executor.ts`（源码；符号：executeScript, executePython, executeShell, ExecResult；导入数：3）
- `src/tools/index.ts`（源码；符号：registerAllTools；导入数：9）
- `src/tools/registry.ts`（源码；符号：ToolRegistry, toolRegistry；导入数：3）
- `src/ui/app.tsx`（源码；符号：App；导入数：6）
- `src/ui/index.tsx`（源码；符号：startUI, updateUI；导入数：4）
- `src/workflow/index.ts`（源码）
- `src/workflow/router.ts`（源码；符号：routeTask, isDirectMode, isRequirementStart, isNewPageOrModule, isLightweightTask, isUIOptimization, isArchitectureTask, isPageDevelopment；导入数：2）
- `src/workflows/executor.ts`（源码；符号：WorkflowExecutor；导入数：11）
- `src/workflows/index.ts`（源码）
- `src/workflows/registry.ts`（源码；符号：WorkflowRegistry, workflowRegistry；导入数：7）

## 按职责聚合

### 用户入口
- `docs/界面设计参考/10-forge-cli适配方案.md`
- `references/maintenance_map.md`
- `src/agent/index.ts`
- `src/agents/index.ts`
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

### 任务/Agent 循环
- `AGENTS.md`
- `references/agent_isolation_protocol.md`
- `references/host_subagent_support.md`
- `references/roles/verify_agent.md`
- `scripts/controller.py`
- `src/agent/index.ts`
- `src/agent/loop-v2.ts`
- `src/agent/loop.ts`
- `src/agents/base-agent.ts`
- `src/agents/controller.ts`
- `src/agents/index.ts`
- `src/agents/orchestrator.ts`
- `src/agents/pool.ts`
- `src/agents/registry.ts`
- `src/agents/types.ts`
- `src/workflow/router.ts`
- `tests/checklist_fixtures/verify_agent_pass.txt`

### 模型与上下文
- `memory/global_preferences.yaml`
- `memory/runtime/current_task.template.yaml`
- `pm-memory/PROJECT-STATE.md`
- `references/memory_protocol.md`
- `src/github/client.ts`
- `src/llm/client-v2.ts`
- `src/llm/client.ts`
- `src/llm/context.ts`
- `src/llm/index.ts`
- `src/llm/types.ts`
- `src/mcp/client.ts`
- `src/memory/compress.ts`
- `src/memory/conversation-log.ts`
- `src/memory/dedup.ts`
- `src/memory/index.ts`
- `src/memory/manager.ts`
- `src/memory/project-memory.ts`
- `src/memory/threshold.ts`
- `src/memory/types.ts`
- `src/tools/memory.ts`

### 工具/工作流执行
- `references/example_workflow.md`
- `references/shared_workflow_gates/README.md`
- `references/shared_workflow_gates/advisor_collaboration.md`
- `references/shared_workflow_gates/existing_project_consulting.md`
- `references/shared_workflow_gates/question_budget.md`
- `references/shared_workflow_gates/requirement_confirmation.md`
- `references/shared_workflow_gates/role_gate_matrix.md`
- `references/shared_workflow_gates/routing_and_recovery.md`
- `references/workflow_diagram.md`
- `src/agents/registry.ts`
- `src/mcp/client.ts`
- `src/mcp/index.ts`
- `src/mcp/types.ts`
- `src/plugin-dev/index.ts`
- `src/plugin-dev/toolkit.ts`
- `src/plugin-dev/types.ts`
- `src/plugins/index.ts`
- `src/plugins/loader.ts`
- `src/plugins/manager.ts`
- `src/plugins/types.ts`
- `src/tools/classifier.ts`
- `src/tools/command.ts`
- `src/tools/executor.ts`
- `src/tools/filesystem.ts`
- `src/tools/guardrails.ts`
- `src/tools/index.ts`
- `src/tools/memory.ts`
- `src/tools/registry.ts`
- `src/tools/scanner.ts`
- `src/tools/types.ts`

### 输出与界面
- `QUICKSTART.md`
- `docs/界面设计参考/UI组件使用指南.md`
- `examples/ui-demo.ts`
- `references/roles/requirement_analyst.md`
- `references/roles/ui_designer.md`
- `references/shared_workflow_gates/requirement_confirmation.md`
- `references/task_runtime_prompt.md`
- `src/cli/__tests__/theme.test.ts`
- `src/cli/renderer-v2.ts`
- `src/cli/renderer.ts`
- `src/cli/repl-ink.tsx`
- `src/cli/theme.ts`
- `src/ui/app.tsx`
- `src/ui/command-palette.tsx`
- `src/ui/index.tsx`
- `src/ui/multiline-input.tsx`
- `tests/checklist_fixtures/requirement_analyst_pass.txt`
- `tests/checklist_fixtures/ui_designer_pass.txt`

### 安全与权限
- `references/project_guardrails_protocol.md`
- `scripts/check_project_guardrails.sh`
- `scripts/hook_check_project_guardrails.sh`
- `scripts/init_project_guardrails.py`
- `scripts/release_checks/guardrails.sh`
- `scripts/validate_project_guardrails.py`
- `scripts/validate_project_guardrails_resolution.py`
- `src/permissions/manager.ts`
- `src/security/checker.ts`
- `src/security/index.ts`
- `src/security/types.ts`
- `src/tools/guardrails.ts`

## 待读源码验证的问题

- 一次用户输入从 CLI/REPL 到 Agent 循环、LLM 请求、工具调用、渲染输出、记忆写入的真实顺序。
- 错误、取消、审批、权限拒绝、上下文压缩等分支路径。
- 多 Agent、workflow、plugin、MCP 是否共享同一工具注册和安全检查链路。
