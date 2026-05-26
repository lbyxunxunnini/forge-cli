export type HookEvent =
  | 'PreToolUse'    // 工具执行前
  | 'PostToolUse'   // 工具执行后
  | 'SessionStart'  // 会话开始
  | 'Stop'          // 会话结束前
  | 'PromptSubmit'; // 用户输入处理

export type HookAction = 'allow' | 'block' | 'warn';

export interface HookContext {
  event: HookEvent;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  userPrompt?: string;
  sessionState?: Record<string, unknown>;
}

export interface HookResult {
  action: HookAction;
  message?: string;
  modifiedArgs?: Record<string, unknown>;
}

export interface HookDefinition {
  name: string;
  description: string;
  event: HookEvent;
  matcher?: string; // 正则匹配工具名
  enabled: boolean;
  handler: (context: HookContext) => Promise<HookResult>;
}

export interface HookConfig {
  name: string;
  description: string;
  event: HookEvent;
  matcher?: string;
  enabled: boolean;
  type: 'builtin' | 'plugin' | 'user';
  source: string; // 来源路径
}
