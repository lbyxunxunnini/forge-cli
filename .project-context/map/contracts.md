<!-- generated-by: project-memory; safe-to-overwrite -->
# 核心协议与 Contract 地图

本文件索引可能定义跨模块边界的类型、schema、协议和配置。它用于定位 contract，不替代源码阅读。

## 可能的 Contract 文件

- `config/default.yaml`（源码）
- `references/agent_isolation_protocol.md`（文档）
- `references/core_contracts.yaml`（文档）
- `references/decision_and_question_protocol.md`（文档）
- `references/example_workflow.md`（文档）
- `references/memory_protocol.md`（文档）
- `references/project_guardrails_protocol.md`（文档）
- `references/shared_workflow_gates/README.md`（文档）
- `references/shared_workflow_gates/advisor_collaboration.md`（文档）
- `references/shared_workflow_gates/existing_project_consulting.md`（文档）
- `references/shared_workflow_gates/question_budget.md`（文档）
- `references/shared_workflow_gates/requirement_confirmation.md`（文档）
- `references/shared_workflow_gates/role_gate_matrix.md`（文档）
- `references/shared_workflow_gates/routing_and_recovery.md`（文档）
- `references/workflow_diagram.md`（文档）
- `scripts/check_project_guardrails.sh`（其他）
- `scripts/hook_check_project_guardrails.sh`（其他）
- `scripts/init_project_guardrails.py`（源码；符号：compute_pubspec_hash, compute_lib_top_dirs_snapshot, load_snapshot, signal_exists, choose_profile, profile_defaults, best_signal, evidence_lines, render_guardrails, print_wizard_summary, main）
- `scripts/release_checks/guardrails.sh`（其他）
- `scripts/release_checks/output_protocol.sh`（文档）
- `scripts/validate_project_guardrails.py`（源码；符号：strip_inline_comment, normalize_scalar, parse_yaml_like, is_missing, validate_file, main）
- `scripts/validate_project_guardrails_resolution.py`（源码；符号：load_snapshot, write_minimal_project, write_card, main）
- `src/agent/loop-v2.ts`（源码；符号：AgentLoopV2, AgentLoopOptions）
- `src/agent/loop.ts`（源码；符号：AgentLoop, AgentLoopOptions）
- `src/agents/types.ts`（源码；符号：AgentRole, AgentConfig, AgentResult, AgentContext）
- `src/cli/commands.ts`（源码；符号：ask, selectOption, promptInput, handleCommand, handleModelCommand, flowModelManager, flowSelectModel, flowAddCustomProvider, handleConfigCommand, handleFastCommand, handleAutoCommand, handleSessionCommand）
- `src/cli/dialog.ts`（源码；符号：createDialogManager, showConfirm, showInput, showSelect, showFuzzySearch, showTreeSelect, DialogManager, DialogType, DialogOptions, SelectOption, TreeNode, dialogManager）
- `src/cli/input-layout.ts`（源码；符号：createInputLayoutManager, renderInputLayout, renderCompactLayout, InputLayoutManager, StatusLineData, InputLayoutOptions, inputLayoutManager）
- `src/cli/input.ts`（源码；符号：createInputManager, prompt, confirm, select, InputManager, InputMode, SuggestionItem, InputOptions, InputResult）
- `src/cli/layout.ts`（源码；符号：createLayoutManager, LayoutManager, LayoutType, LayoutRegion, LayoutOptions, ScrollOptions, VirtualListOptions, layoutManager）
- `src/cli/message-system.ts`（源码；符号：createMessageManager, createMessageRenderer, MessageManager, MessageRenderer, MessageType, MessageStatus, Message, MessageMetadata, MessageAction, MessageMenuItem, MessageRenderOptions, messageManager）
- `src/cli/renderer-v2.ts`（源码；符号：renderBanner, renderHelp, renderStatus, renderError, renderSuccess, renderWarning, renderInfo, renderPhase, renderAssistantStart, renderStatusBar, renderDetailedStatusBar, renderUserMessage）
- `src/cli/repl.ts`（源码；符号：askSetup, selectSetup, flowFirstSetup, setupCustomProvider, startREPL, printInputBar, printToolCallSummary, pauseRL, resumeRL）
- `src/cli/spinner-v2.ts`（源码；符号：createSpinner, withSpinner, SpinnerV2, SpinnerOptions, SPINNER_VERBS）
- `src/cli/state-machine.ts`（源码；符号：createStateMachine, saveSnapshot, loadSnapshot, StateMachineError, StateMachine, StateType, StateTransition, StateHistoryEntry, StateMachineConfig, StateMachineSnapshot）
- `src/cli/task-group.ts`（源码；符号：TaskGroupRenderer, ToolCallRecord, TaskGroup, taskGroupRenderer）
- `src/cli/tree-sitter-parser.ts`（源码；符号：createTreeSitterParserManager, TreeSitterParserManager, SyntaxNode, TreeCursor, Tree, Parser, ASTNodeType, ASTNode, ASTMetadata, SymbolInfo, LanguageConfig, treeSitterParserManager）
- `src/cli/web-fetch.ts`（源码；符号：createWebFetchManager, fetchWebText, fetchWebTitle, WebFetchManager, WebFetchOptions, WebFetchResult, webFetchManager）
- `src/cli/web-search.ts`（源码；符号：createWebSearchManager, webSearch, WebSearchManager, WebSearchOptions, ResourceType, WebSearchResult, SearchReference, webSearchManager）
- `src/confidence/types.ts`（源码；符号：ConfidenceLevel, ConfidenceScore, ReviewIssue, IssueCategory, ReviewResult, ReviewConfig）
- `src/config/index.ts`（源码）
- `src/config/manager.ts`（源码；符号：ConfigManager, configManager）
- `src/config/types.ts`（源码；符号：ModelConfig, ProviderInfo, ProjectConfig, ProviderConfig, AppConfig, PROVIDER_PRESETS, MAX_CUSTOM_PROVIDERS, DEFAULT_PROVIDER, DEFAULT_MODEL, DEFAULT_CONFIG）
- `src/github/types.ts`（源码；符号：GitHubConfig, GitHubPR, GitHubIssue, GitHubReview, GitHubComment, GitHubBlame, GitHubDiff, PRReviewComment）
- `src/hooks/types.ts`（源码；符号：HookEvent, HookAction, HookContext, HookResult, HookDefinition, HookConfig）
- `src/learning/types.ts`（源码；符号：LearningTrigger, LearningPrompt, LearningSession, UserContribution, LearningConfig, LearningInsight）
- `src/llm/client-v2.ts`（源码；符号：createCompatFetch, AIClient, AgentTool, UsageInfo）
- `src/llm/context.ts`（源码；符号：estimateTokens, classifyImportance, trimToolResult, ContextManager, Importance, ContextMessage, CacheStats, contextManager）
- `src/llm/types.ts`（源码；符号：Message, ToolCall, Tool, ChatCompletion, StreamChunk, LLMConfig）
- `src/mcp/client.ts`（源码；符号：MCPClient, mcpClient）
- `src/mcp/index.ts`（源码）
- `src/mcp/types.ts`（源码；符号：MCPServerConfig, MCPTool, MCPResource, MCPServer, MCPToolCall, MCPToolResult, MCPRequest, MCPResponse）
- `src/memory/types.ts`（源码；符号：MemoryType, MemoryEntry, MemoryIndex, WriteThreshold, DedupResult, CompressResult, RecallOptions, RecallResult, DEFAULT_THRESHOLD）
- `src/modes/autonomous.ts`（源码；符号：AutonomousMode, AutonomousModeConfig, autonomousMode）
- `src/modes/fast.ts`（源码；符号：FastMode, FastModeConfig, fastMode）
- `src/permissions/manager.ts`（源码；符号：PermissionManager, PermissionOperation, PermissionEntry, PermissionCheckResult, permissionManager）
- `src/plugin-dev/toolkit.ts`（源码；符号：PluginDevToolkit, pluginDevToolkit, main）
- `src/plugin-dev/types.ts`（源码；符号：PluginType, PluginTemplate, TemplateFile, TemplateVariable, PluginProject, PluginValidationResult, ValidationError, ValidationWarning, PluginTestResult, TestResult）
- `src/plugins/types.ts`（源码；符号：PluginMetadata, PluginCommand, PluginAgent, PluginSkill, PluginHook, PluginConfig, MCPServerConfig, Plugin, PluginState）
- `src/security/checker.ts`（源码；符号：SecurityChecker, securityChecker）
- `src/security/index.ts`（源码）
- `src/security/types.ts`（源码；符号：SecuritySeverity, SecurityPattern, SecurityCategory, SecurityCheckResult, SecurityIssue, SecurityConfig）
- `src/tools/classifier.ts`（源码；符号：classifyTaskTool）
- `src/tools/command.ts`（源码；符号：runCommandTool, runCommandWithOutputTool）
- `src/tools/executor.ts`（源码；符号：executeScript, executePython, executeShell, ExecResult）
- `src/tools/filesystem.ts`（源码；符号：listDirectory, searchInFiles, searchDir, matchGlob, globMatch, walk, matchGlobPattern, grepSearch, lsTree, readFileTool, writeFileTool, editFileTool）
- `src/tools/guardrails.ts`（源码；符号：checkGuardrailsTool, initGuardrailsTool）
- `src/tools/index.ts`（源码；符号：registerAllTools）
- `src/tools/memory.ts`（源码；符号：saveMemoryTool, readMemoryTool, compressMemoryTool, deleteMemoryTool）
- `src/tools/registry.ts`（源码；符号：ToolRegistry, toolRegistry）
- `src/tools/scanner.ts`（源码；符号：scanProjectTool, detectProjectStateTool）
- `src/tools/types.ts`（源码；符号：ToolDefinition, ToolResult, Tool）
- `src/tools/validator.ts`（源码；符号：validateOutputTool, validateDocsSyncTool）
- `src/tools/web-tools.ts`（源码；符号：executeFetch, decodeHTMLEntities, parseDuckDuckGoResults, executeWebsearch, fetchTool, websearchTool）
- `src/ui/command-palette.tsx`（源码；符号：CommandPalette, Command, CommandPaletteProps）
- `src/utils/retry.ts`（源码；符号：RetryExecutor, ToolRetryExecutor, ErrorCategory, ErrorClassifier, RetryConfig, RetryResult, ToolRetryConfig, defaultClassifier）
- `src/utils/summary.ts`（源码；符号：generateSummary, formatSummary, buildToolBreakdown, buildErrorSummary, buildPhaseProgression, generateRecommendations, formatDuration, ExecutionSummary）
- `src/utils/trace.ts`（源码；符号：getTracer, initTracer, clearTracer, Tracer, TraceEventType, TraceEvent, TraceSession, TraceConfig, TraceStats）
- `src/workflow/engine.ts`（源码；符号：WorkflowEngine）
- `src/workflow/index.ts`（源码）
- `src/workflow/router.ts`（源码；符号：routeTask, isDirectMode, isRequirementStart, isNewPageOrModule, isLightweightTask, isUIOptimization, isArchitectureTask, isPageDevelopment）
- `src/workflow/types.ts`（源码；符号：ProjectState, TaskMode, Phase, TaskClassification, PhaseResult, WorkflowState）
- `src/workflows/executor.ts`（源码；符号：WorkflowExecutor）
- `src/workflows/index.ts`（源码）
- `src/workflows/registry.ts`（源码；符号：WorkflowRegistry, workflowRegistry）
- `src/workflows/store.ts`（源码；符号：WorkflowStore）
- `src/workflows/types.ts`（源码；符号：WorkflowManifest, WorkflowRoleDef, Workflow, WorkflowSessionData, WorkflowHistoryEntry, WorkflowExecuteResult）
- `tsconfig.json`（配置）
- `tsup.config.ts`（配置）
- `vitest.config.ts`（配置）

## 建议重点确认

### Agent 消息与事件结构
- `AGENTS.md`
- `references/agent_isolation_protocol.md`
- `references/host_subagent_support.md`
- `references/roles/verify_agent.md`
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
- `src/cli/message-system.ts`
- `tests/checklist_fixtures/verify_agent_pass.txt`

### Tool schema 与执行结果
- `references/project_guardrails_protocol.md`
- `scripts/check_project_guardrails.sh`
- `scripts/hook_check_project_guardrails.sh`
- `scripts/init_project_guardrails.py`
- `scripts/release_checks/guardrails.sh`
- `scripts/validate_project_guardrails.py`
- `scripts/validate_project_guardrails_resolution.py`
- `src/permissions/manager.ts`
- `src/plugin-dev/toolkit.ts`
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
- `src/tools/validator.ts`

### Workflow 定义与状态
- `memory/runtime/current_task.template.yaml`
- `references/example_workflow.md`
- `references/shared_workflow_gates/README.md`
- `references/shared_workflow_gates/advisor_collaboration.md`
- `references/shared_workflow_gates/existing_project_consulting.md`
- `references/shared_workflow_gates/question_budget.md`
- `references/shared_workflow_gates/requirement_confirmation.md`
- `references/shared_workflow_gates/role_gate_matrix.md`
- `references/shared_workflow_gates/routing_and_recovery.md`
- `references/task_runtime_prompt.md`
- `references/workflow_diagram.md`
- `scripts/classify_task.sh`
- `src/cli/task-group.ts`
- `src/tools/executor.ts`
- `src/workflow/engine.ts`
- `src/workflow/index.ts`
- `src/workflow/router.ts`
- `src/workflow/types.ts`
- `src/workflows/executor.ts`
- `src/workflows/index.ts`

### Plugin manifest 与加载
- `src/plugin-dev/index.ts`
- `src/plugin-dev/toolkit.ts`
- `src/plugin-dev/types.ts`
- `src/plugins/index.ts`
- `src/plugins/loader.ts`
- `src/plugins/manager.ts`
- `src/plugins/types.ts`

### MCP 请求/响应
- `src/github/client.ts`
- `src/llm/client-v2.ts`
- `src/llm/client.ts`
- `src/mcp/client.ts`
- `src/mcp/index.ts`
- `src/mcp/types.ts`

### Memory/Context 数据格式
- `memory/global_preferences.yaml`
- `memory/runtime/current_task.template.yaml`
- `pm-memory/PROJECT-STATE.md`
- `references/memory_protocol.md`
- `references/session_management.md`
- `scripts/ff_session.sh`
- `scripts/release_checks/session.sh`
- `src/llm/context.ts`
- `src/memory/compress.ts`
- `src/memory/conversation-log.ts`
- `src/memory/dedup.ts`
- `src/memory/index.ts`
- `src/memory/manager.ts`
- `src/memory/project-memory.ts`
- `src/memory/threshold.ts`
- `src/memory/types.ts`
- `src/session/manager.ts`
- `src/tools/memory.ts`
- `src/utils/summary.ts`

### 配置优先级与环境变量
- `.claude/settings.local.json`
- `config/default.yaml`
- `src/config/index.ts`
- `src/config/manager.ts`
- `src/config/types.ts`
- `tsconfig.json`
- `tsup.config.ts`
- `vitest.config.ts`

### 安全/审批/沙箱边界
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
