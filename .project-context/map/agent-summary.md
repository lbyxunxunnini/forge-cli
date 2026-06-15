<!-- generated-by: project-memory; safe-to-overwrite -->
# Agent 项目专项摘要

本文件只在项目具备 agent 信号时作为专项导航；它总结行为协议和执行链路入口，不替代源码验证。

## Agent/编排

- `AGENTS.md`（Memory Context）
- `scripts/controller.py`（符号：run_script, parse_kv_output, choose_role, read_role_contract, read_guardrails_summary, build_agent_prompt, build_result, cmd_run）
- `src/agent/index.ts`
- `src/agent/loop-v2.ts`（符号：AgentLoopV2, AgentLoopOptions）
- `src/agent/loop.ts`（符号：AgentLoop, AgentLoopOptions）
- `src/agents/base-agent.ts`
- `src/agents/controller.ts`（符号：ControllerAgent）
- `src/agents/index.ts`
- `src/agents/orchestrator.ts`（符号：AgentOrchestrator）
- `src/agents/pool.ts`（符号：AgentPool, AgentTask, AgentTaskResult, agentPool）
- `src/agents/registry.ts`（符号：AgentRegistry, agentRegistry）
- `src/agents/types.ts`（符号：AgentRole, AgentConfig, AgentResult, AgentContext）
- `src/workflow/router.ts`（符号：routeTask, isDirectMode, isRequirementStart, isNewPageOrModule, isLightweightTask, isUIOptimization, isArchitectureTask, isPageDevelopment）

## 模型与上下文

- `memory/global_preferences.yaml`
- `memory/runtime/current_task.template.yaml`
- `src/github/client.ts`（符号：GitHubClient, createGitHubClient）
- `src/llm/client-v2.ts`（符号：createCompatFetch, AIClient, AgentTool, UsageInfo）
- `src/llm/client.ts`（符号：LLMClient）
- `src/llm/context.ts`（符号：estimateTokens, classifyImportance, trimToolResult, ContextManager, Importance, ContextMessage, CacheStats, contextManager）
- `src/llm/index.ts`
- `src/llm/types.ts`（符号：Message, ToolCall, Tool, ChatCompletion, StreamChunk, LLMConfig）
- `src/mcp/client.ts`（符号：MCPClient, mcpClient）
- `src/memory/compress.ts`（符号：compressMemories, expireOldMemories, expireLowValueMemories, mergeSimilarMemories, evictByPriority, calculatePriorityScore, mergeEntries, calculateContentSimilarity）
- `src/memory/conversation-log.ts`（符号：ConversationLog, LogEntry, conversationLog）
- `src/memory/dedup.ts`（符号：detectDuplicate, mergeMemories, calculateSimilarity, extractKeywords, extractTags）
- `src/memory/index.ts`
- `src/memory/manager.ts`（符号：MemoryManager, memoryManager）
- `src/memory/project-memory.ts`（符号：ProjectMemoryManager, ExportedMemory, projectMemoryManager）
- `src/memory/threshold.ts`（符号：checkThreshold, countSimilarEntries, extractKeywords, calculateConfidence, ThresholdCheck）
- `src/memory/types.ts`（符号：MemoryType, MemoryEntry, MemoryIndex, WriteThreshold, DedupResult, CompressResult, RecallOptions, RecallResult）
- `src/tools/memory.ts`（符号：saveMemoryTool, readMemoryTool, compressMemoryTool, deleteMemoryTool）

## 工具与权限

- `src/security/checker.ts`（符号：SecurityChecker, securityChecker）
- `src/security/index.ts`
- `src/security/types.ts`（符号：SecuritySeverity, SecurityPattern, SecurityCategory, SecurityCheckResult, SecurityIssue, SecurityConfig）
- `src/tools/classifier.ts`（符号：classifyTaskTool）
- `src/tools/command.ts`（符号：runCommandTool, runCommandWithOutputTool）
- `src/tools/executor.ts`（符号：executeScript, executePython, executeShell, ExecResult）
- `src/tools/filesystem.ts`（符号：listDirectory, searchInFiles, searchDir, matchGlob, globMatch, walk, matchGlobPattern, grepSearch）
- `src/tools/guardrails.ts`（符号：checkGuardrailsTool, initGuardrailsTool）
- `src/tools/index.ts`（符号：registerAllTools）
- `src/tools/memory.ts`（符号：saveMemoryTool, readMemoryTool, compressMemoryTool, deleteMemoryTool）
- `src/tools/registry.ts`（符号：ToolRegistry, toolRegistry）
- `src/tools/scanner.ts`（符号：scanProjectTool, detectProjectStateTool）
- `src/tools/types.ts`（符号：ToolDefinition, ToolResult, Tool）
- `src/tools/validator.ts`（符号：validateOutputTool, validateDocsSyncTool）
- `src/tools/web-tools.ts`（符号：executeFetch, decodeHTMLEntities, parseDuckDuckGoResults, executeWebsearch, fetchTool, websearchTool）

## MCP/插件/扩展

- `SKILL.md`（Forge CLI）
- `src/hooks/index.ts`
- `src/hooks/manager.ts`（符号：HookManager, hookManager）
- `src/hooks/types.ts`（符号：HookEvent, HookAction, HookContext, HookResult, HookDefinition, HookConfig）
- `src/mcp/client.ts`（符号：MCPClient, mcpClient）
- `src/mcp/index.ts`
- `src/mcp/types.ts`（符号：MCPServerConfig, MCPTool, MCPResource, MCPServer, MCPToolCall, MCPToolResult, MCPRequest, MCPResponse）
- `src/plugin-dev/index.ts`
- `src/plugin-dev/toolkit.ts`（符号：PluginDevToolkit, pluginDevToolkit, main）
- `src/plugin-dev/types.ts`（符号：PluginType, PluginTemplate, TemplateFile, TemplateVariable, PluginProject, PluginValidationResult, ValidationError, ValidationWarning）
- `src/plugins/index.ts`
- `src/plugins/loader.ts`（符号：PluginLoader, pluginLoader）
- `src/plugins/manager.ts`（符号：PluginManager, pluginManager）
- `src/plugins/types.ts`（符号：PluginMetadata, PluginCommand, PluginAgent, PluginSkill, PluginHook, PluginConfig, MCPServerConfig, Plugin）
- `src/skills/manager.ts`（符号：SkillManager, SkillInfo, SkillUpdate, skillManager）

## Workflow/任务状态

- `src/agents/registry.ts`（符号：AgentRegistry, agentRegistry）
- `src/cli/task-group.ts`（符号：TaskGroupRenderer, ToolCallRecord, TaskGroup, taskGroupRenderer）
- `src/tools/executor.ts`（符号：executeScript, executePython, executeShell, ExecResult）
- `src/tools/registry.ts`（符号：ToolRegistry, toolRegistry）
- `src/workflow/engine.ts`（符号：WorkflowEngine）
- `src/workflow/index.ts`
- `src/workflow/router.ts`（符号：routeTask, isDirectMode, isRequirementStart, isNewPageOrModule, isLightweightTask, isUIOptimization, isArchitectureTask, isPageDevelopment）
- `src/workflow/types.ts`（符号：ProjectState, TaskMode, Phase, TaskClassification, PhaseResult, WorkflowState）
- `src/workflows/executor.ts`（符号：WorkflowExecutor）
- `src/workflows/index.ts`
- `src/workflows/registry.ts`（符号：WorkflowRegistry, workflowRegistry）
- `src/workflows/store.ts`（符号：WorkflowStore）
- `src/workflows/types.ts`（符号：WorkflowManifest, WorkflowRoleDef, Workflow, WorkflowSessionData, WorkflowHistoryEntry, WorkflowExecuteResult）

## CLI/UI/输出

- `examples/ui-demo.ts`（符号：main, hello, sleep）
- `src/cli/__tests__/ast-parser.test.ts`（符号：world, help, User）
- `src/cli/__tests__/git.test.ts`
- `src/cli/__tests__/state-machine.test.ts`
- `src/cli/__tests__/structured-edit.test.ts`
- `src/cli/__tests__/theme.test.ts`
- `src/cli/__tests__/web-fetch.test.ts`
- `src/cli/__tests__/web-search.test.ts`
- `src/cli/ast-parser.ts`（符号：createASTManager, TypeScriptParser, DartParser, SymbolSearcher, ASTManager, ASTNodeType, ASTNode, ASTMetadata）
- `src/cli/commands.ts`（符号：ask, selectOption, promptInput, handleCommand, handleModelCommand, flowModelManager, flowSelectModel, flowAddCustomProvider）
- `src/cli/dialog.ts`（符号：createDialogManager, showConfirm, showInput, showSelect, showFuzzySearch, showTreeSelect, DialogManager, DialogType）
- `src/cli/git.ts`（符号：createGitManager, GitManager, GitStatus, GitFileStatus, GitCommit, GitBranch, gitManager）
- `src/cli/index.ts`
- `src/cli/input-layout.ts`（符号：createInputLayoutManager, renderInputLayout, renderCompactLayout, InputLayoutManager, StatusLineData, InputLayoutOptions, inputLayoutManager）
- `src/cli/input.ts`（符号：createInputManager, prompt, confirm, select, InputManager, InputMode, SuggestionItem, InputOptions）
- `src/cli/keybindings.ts`（符号：createKeybindingManager, KeybindingManager, KeybindingAction, KeybindingContext, Keybinding, KeybindingBlock, DEFAULT_BINDINGS, keybindingManager）
- `src/cli/layout.ts`（符号：createLayoutManager, LayoutManager, LayoutType, LayoutRegion, LayoutOptions, ScrollOptions, VirtualListOptions, layoutManager）
- `src/cli/message-system.ts`（符号：createMessageManager, createMessageRenderer, MessageManager, MessageRenderer, MessageType, MessageStatus, Message, MessageMetadata）
- `src/cli/renderer-v2.ts`（符号：renderBanner, renderHelp, renderStatus, renderError, renderSuccess, renderWarning, renderInfo, renderPhase）
- `src/cli/renderer.ts`（符号：renderBanner, renderHelp, renderStatus, renderError, renderSuccess, renderPhase, renderAssistantStart, renderMarkdown）
- `src/cli/repl-ink.tsx`（符号：generateSessionId, ForgeApp, startInkREPL）
- `src/cli/repl.ts`（符号：askSetup, selectSetup, flowFirstSetup, setupCustomProvider, startREPL, printInputBar, printToolCallSummary, pauseRL）
- `src/cli/spinner-v2.ts`（符号：createSpinner, withSpinner, SpinnerV2, SpinnerOptions, SPINNER_VERBS）
- `src/cli/spinner.ts`（符号：Spinner）
- `src/cli/state-machine.ts`（符号：createStateMachine, saveSnapshot, loadSnapshot, StateMachineError, StateMachine, StateType, StateTransition, StateHistoryEntry）
- `src/cli/structured-edit.ts`（符号：createDiffGenerator, createLintChecker, createTestRunner, DiffGenerator, LintChecker, TestRunner, DiffType, DiffLine）
- `src/cli/task-group.ts`（符号：TaskGroupRenderer, ToolCallRecord, TaskGroup, taskGroupRenderer）
- `src/cli/theme.ts`（符号：getTheme, getThemeName, setTheme, getAvailableThemes, Theme, ThemeName, t）
- `src/cli/tree-sitter-parser.ts`（符号：createTreeSitterParserManager, TreeSitterParserManager, SyntaxNode, TreeCursor, Tree, Parser, ASTNodeType, ASTNode）
- `src/cli/web-fetch.ts`（符号：createWebFetchManager, fetchWebText, fetchWebTitle, WebFetchManager, WebFetchOptions, WebFetchResult, webFetchManager）
- `src/cli/web-search.ts`（符号：createWebSearchManager, webSearch, WebSearchManager, WebSearchOptions, ResourceType, WebSearchResult, SearchReference, webSearchManager）
- `src/output/logger.ts`（符号：ForgeLogger, LogLevel, forgeLogger）
- `src/tools/command.ts`（符号：runCommandTool, runCommandWithOutputTool）
- `src/ui/app.tsx`（符号：App）
- `src/ui/command-palette.tsx`（符号：CommandPalette, Command, CommandPaletteProps）
- `src/ui/index.tsx`（符号：startUI, updateUI）
- `src/ui/multiline-input.tsx`（符号：MultilineInput, MultilineInputProps）

## 配置/协议

- `.claude/settings.local.json`
- `config/default.yaml`
- `src/config/index.ts`
- `src/config/manager.ts`（符号：ConfigManager, configManager）
- `src/config/types.ts`（符号：ModelConfig, ProviderInfo, ProjectConfig, ProviderConfig, AppConfig, PROVIDER_PRESETS, MAX_CUSTOM_PROVIDERS, DEFAULT_PROVIDER）

## 测试/验证

- `VERIFICATION.md`（Forge CLI CLI Agent 验证清单）
- `scripts/test-e2e.sh`
- `tests/checklist_fixtures/architecture_designer_pass.txt`
- `tests/checklist_fixtures/page_engineer_fail_missing.txt`
- `tests/checklist_fixtures/page_engineer_fail_placeholder.txt`
- `tests/checklist_fixtures/page_engineer_pass.txt`
- `tests/checklist_fixtures/requirement_analyst_pass.txt`
- `tests/checklist_fixtures/ui_designer_pass.txt`
- `tests/checklist_fixtures/verify_agent_pass.txt`（=== 第一阶段：规格合规审查 ===）
- `tests/route_golden_cases.json`

## 需要源码确认的问题

- 一次用户输入进入 agent loop 后的状态迁移、模型调用、工具调用和输出渲染顺序。
- tool schema、执行结果、错误、审批拒绝和权限边界的真实 contract。
- memory/context 写入、压缩、恢复和淘汰策略。
- workflow、multi-agent、plugin、MCP 是否共享同一安全检查和工具注册链路。
- 测试是否覆盖取消、失败、重试、权限拒绝和上下文恢复。

## 恢复提示

- 默认先读 `map/runtime-flow.md`、`map/contracts.md` 和本文件，再定向读相关源码。
- 不要仅凭模块名修改 agent 行为；跨 agent loop、tool、permission、memory 的改动必须源码验证并跑测试。
