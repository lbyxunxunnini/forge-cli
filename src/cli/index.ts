export { startREPL } from './repl.js';
export { handleCommand } from './commands.js';
export { renderBanner, renderHelp, renderStatus, renderError, renderSuccess } from './renderer.js';
export { Spinner } from './spinner.js';

// V2 UI 组件
export { getTheme, setTheme, getThemeName, getAvailableThemes, t } from './theme.js';
export type { Theme, ThemeName } from './theme.js';
export { SpinnerV2, createSpinner, withSpinner } from './spinner-v2.js';
export {
  renderBanner as renderBannerV2,
  renderHelp as renderHelpV2,
  renderStatus as renderStatusV2,
  renderError as renderErrorV2,
  renderSuccess as renderSuccessV2,
  renderWarning,
  renderInfo,
  renderStatusBar,
  renderDetailedStatusBar,
  renderUserMessage,
  renderAssistantMessage,
  renderSystemMessage,
  renderToolUse,
  renderToolResult,
  renderMarkdown,
  renderProgressBar,
  renderTable,
  renderList,
  renderKeyValue,
  renderDivider,
} from './renderer-v2.js';
export type { StatusLineData, MessageData, MessageType } from './renderer-v2.js';
export { InputManager, createInputManager, prompt, confirm, select } from './input.js';
export type { InputMode, SuggestionItem, InputOptions, InputResult } from './input.js';
export { KeybindingManager, createKeybindingManager, keybindingManager } from './keybindings.js';
export type { KeybindingAction, KeybindingContext, Keybinding } from './keybindings.js';

// 消息系统
export { MessageManager, MessageRenderer, createMessageManager, createMessageRenderer, messageManager, messageRenderer } from './message-system.js';
export type { MessageType as MessageSystemType, MessageStatus, Message, MessageMetadata, MessageAction, MessageMenuItem, MessageRenderOptions } from './message-system.js';

// 布局系统
export { LayoutManager, createLayoutManager, layoutManager } from './layout.js';
export type { LayoutType, LayoutRegion, LayoutOptions, ScrollOptions, VirtualListOptions } from './layout.js';

// 对话框系统
export { DialogManager, createDialogManager, dialogManager, showConfirm, showInput, showSelect, showFuzzySearch, showTreeSelect } from './dialog.js';
export type { DialogType, DialogOptions, SelectOption, TreeNode } from './dialog.js';

// 结构化编辑
export { DiffGenerator, LintChecker, TestRunner, createDiffGenerator, createLintChecker, createTestRunner, diffGenerator, lintChecker, testRunner } from './structured-edit.js';
export type { DiffType, DiffLine, DiffHunk, DiffResult, LintSeverity, LintResult, TestResult, TestSuite } from './structured-edit.js';

// Git 操作
export { GitManager, createGitManager, gitManager } from './git.js';
export type { GitStatus, GitFileStatus, GitCommit, GitBranch } from './git.js';

// AST 解析
export { TypeScriptParser, DartParser, SymbolSearcher, ASTManager, createASTManager, astManager } from './ast-parser.js';
export type { ASTNodeType, ASTNode, ASTMetadata, SymbolInfo, SymbolSearchResult } from './ast-parser.js';

// Tree-sitter 解析器
export { TreeSitterParserManager, createTreeSitterParserManager, treeSitterParserManager } from './tree-sitter-parser.js';
export type { SyntaxNode, TreeCursor, Tree, Parser, LanguageConfig } from './tree-sitter-parser.js';

// WebFetch 网页获取
export { WebFetchManager, createWebFetchManager, webFetchManager, fetchWebText, fetchWebTitle } from './web-fetch.js';
export type { WebFetchOptions, WebFetchResult } from './web-fetch.js';

// WebSearch 网络搜索
export { WebSearchManager, createWebSearchManager, webSearchManager, webSearch } from './web-search.js';
export type { WebSearchOptions, WebSearchResult, ResourceType, SearchReference } from './web-search.js';

// 状态机增强
export { StateMachine, StateMachineError, createStateMachine, saveSnapshot, loadSnapshot } from './state-machine.js';
export type { StateType, StateTransition, StateHistoryEntry, StateMachineConfig, StateMachineSnapshot } from './state-machine.js';

// 输入框布局
export { InputLayoutManager, createInputLayoutManager, inputLayoutManager, renderInputLayout, renderCompactLayout } from './input-layout.js';
export type { StatusLineData, InputLayoutOptions } from './input-layout.js';
