import type { AgentRole, AgentConfig } from './types.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROLES_DIR = join(import.meta.dirname, '..', '..', 'references', 'roles');

// 角色配置
const AGENT_CONFIGS: Record<AgentRole, Omit<AgentConfig, 'systemPrompt'>> = {
  controller: {
    role: 'controller',
    name: '主控',
    description: '路由判断、阶段推进、子 Agent 调度、状态管理',
    allowedTools: ['*'],
    forbiddenTools: [],
  },
  requirement_analyst: {
    role: 'requirement_analyst',
    name: '需求分析师',
    description: '目标冻结、范围确认、验收标准、约束定义',
    allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'scan_project', 'detect_project_state', 'save_memory', 'read_memory'],
    forbiddenTools: ['write_file', 'edit_file', 'run_command'],
  },
  ui_designer: {
    role: 'ui_designer',
    name: 'UI 设计师',
    description: '视觉方案、交互设计、样式规范',
    allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'scan_project', 'save_memory', 'read_memory'],
    forbiddenTools: ['write_file', 'edit_file', 'run_command'],
  },
  architecture_designer: {
    role: 'architecture_designer',
    name: '架构设计师',
    description: '架构设计、模块划分、技术选型',
    allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'scan_project', 'detect_project_state', 'save_memory', 'read_memory'],
    forbiddenTools: ['write_file', 'edit_file', 'run_command'],
  },
  page_engineer: {
    role: 'page_engineer',
    name: '页面工程师',
    description: '代码实现、文件读写、命令执行',
    allowedTools: ['*'],
    forbiddenTools: [],
  },
  verify_agent: {
    role: 'verify_agent',
    name: '验证工程师',
    description: '功能验证、测试执行、质量检查',
    allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'run_command', 'validate_output', 'validate_docs_sync', 'save_memory', 'read_memory'],
    forbiddenTools: ['write_file', 'edit_file'],
  },
};

export class AgentRegistry {
  private configs: Map<AgentRole, AgentConfig> = new Map();

  constructor() {
    this.loadConfigs();
  }

  private loadConfigs(): void {
    for (const [role, config] of Object.entries(AGENT_CONFIGS)) {
      const systemPrompt = this.loadRolePrompt(role as AgentRole);
      this.configs.set(role as AgentRole, {
        ...config,
        systemPrompt,
      });
    }
  }

  private loadRolePrompt(role: AgentRole): string {
    if (role === 'controller') {
      return this.getControllerPrompt();
    }

    const roleFile = join(ROLES_DIR, `${role}.md`);
    try {
      return readFileSync(roleFile, 'utf-8');
    } catch {
      return this.getDefaultPrompt(role);
    }
  }

  private getControllerPrompt(): string {
    return `你是 Flutter Forge 的主控 Agent，负责路由判断、阶段推进、子 Agent 调度和状态管理。

## 核心职责

1. **路由判断** — 根据用户输入判断任务类型（直通、轻量、中等、UI优化、架构级、功能开发、页面开发、新项目共创）
2. **阶段推进** — 管理 S1→S2→S3→S4→S5→S6 阶段流程
3. **子 Agent 调度** — 根据阶段和任务类型调用对应的子 Agent
4. **状态管理** — 维护 session 状态、用户确认状态
5. **门禁检查** — 确保阶段转换符合规则

## 子 Agent 调用规则

- S1 需求分析 → 调用 requirement_analyst
- S2 方案设计 → 调用 ui_designer 或 architecture_designer（根据任务类型）
- S4 实现 → 调用 page_engineer
- S5 验证 → 调用 verify_agent

## 输出规范

所有日志必须以 [f-forge] 开头：
- [f-forge] 进入 controller
- [f-forge] 模式：<模式名>
- [f-forge] 阶段：<阶段名>
- [f-forge] 角色切换：xxx → yyy
- [f-forge] 本轮完成：<内容>

## 铁律

1. 未确认的目标、范围、验收、约束，不得作为执行依据
2. 存在两种及以上合理解读时，必须暂停确认
3. 未冻结当前子单元，不得进入实现
4. 未完成当前子单元验证，不得进入下一子单元
5. 未经实际验证，不得宣称完成`;
  }

  private getDefaultPrompt(role: AgentRole): string {
    const names: Record<AgentRole, string> = {
      controller: '主控',
      requirement_analyst: '需求分析师',
      ui_designer: 'UI 设计师',
      architecture_designer: '架构设计师',
      page_engineer: '页面工程师',
      verify_agent: '验证工程师',
    };
    return `你是 Flutter Forge 的${names[role]}，负责执行特定阶段的任务。`;
  }

  get(role: AgentRole): AgentConfig | undefined {
    return this.configs.get(role);
  }

  getAll(): AgentConfig[] {
    return Array.from(this.configs.values());
  }

  isToolAllowed(role: AgentRole, toolName: string): boolean {
    const config = this.configs.get(role);
    if (!config) return false;

    // 检查是否被禁止
    if (config.forbiddenTools.includes(toolName)) {
      return false;
    }

    // 检查是否允许所有工具
    if (config.allowedTools.includes('*')) {
      return true;
    }

    // 检查是否在允许列表中
    return config.allowedTools.includes(toolName);
  }

  getFilteredTools(role: AgentRole, allTools: string[]): string[] {
    return allTools.filter(tool => this.isToolAllowed(role, tool));
  }
}

export const agentRegistry = new AgentRegistry();
