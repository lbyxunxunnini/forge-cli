/**
 * 工作流类型定义
 *
 * 工作流 = 一套结构化的开发协作协议，包含角色、阶段、脚本、参考文档。
 * 与 Plugin/Skill 的区别：工作流是代码驱动的执行引擎，不依赖 LLM 理解规则。
 */

// ─── 工作流清单（manifest.yaml） ──────────────────────────

export interface WorkflowManifest {
  name: string;
  version: string;
  description: string;
  triggers: string[];
  roles: WorkflowRoleDef[];
  phases: {
    execution: string[];
    cocreation?: string[];
  };
  scripts: Record<string, string>;
  hooks?: Record<string, string>;
  references?: string;
}

export interface WorkflowRoleDef {
  name: string;
  description: string;
  allowedTools: string[];
  forbiddenTools: string[];
  promptFile?: string; // 相对于 references/roles/
  outputFormat?: 'structured' | 'free'; // structured = JSON, free = 不限制（默认 structured）
}

// ─── 工作流实例 ──────────────────────────────────────────

export interface Workflow {
  manifest: WorkflowManifest;
  globalBase: string;   // ~/.forge-cli/workflows/{name}  （只读：脚本、参考文档）
  projectBase: string;  // {project}/.forge-cli/workflows/{name}  （读写：运行时数据）
}

// ─── 工作流会话状态 ──────────────────────────────────────

export interface WorkflowSessionData {
  workflow: string;       // 工作流名称
  phase: string;          // 当前阶段
  mode: string;           // 当前模式
  activeRole: string;     // 当前活跃角色
  designConfirmed: boolean;
  guardrailsLoaded: boolean;
  resumeKeys?: string[];  // 恢复关键词
  projectRoot: string;
  history: WorkflowHistoryEntry[];
}

export interface WorkflowHistoryEntry {
  timestamp: string;
  phase: string;
  role: string;
  action: string;
  output?: string;
}

// ─── 工作流执行结果 ──────────────────────────────────────

export interface WorkflowExecuteResult {
  success: boolean;
  output: string;
  needsUserInput?: boolean;
  error?: string;
  nextRole?: string;
}
