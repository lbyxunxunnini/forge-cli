import { AIClient } from '../llm/client-v2.js';
import type { ContextManager } from '../llm/context.js';
import type { ToolRegistry } from '../tools/registry.js';
import { BaseAgent } from './base-agent.js';
import type { AgentRole, AgentResult, AgentContext } from './types.js';
import { agentRegistry } from './registry.js';
import chalk from 'chalk';

export class ControllerAgent extends BaseAgent {
  private currentAgent: AgentRole | null = null;

  constructor(
    aiClient: AIClient,
    contextManager: ContextManager,
    toolRegistry: ToolRegistry
  ) {
    super('controller', aiClient, contextManager, toolRegistry);
  }

  // 路由判断（仅 Flutter 任务会进入此方法）
  route(userInput: string): AgentRole {
    const input = userInput.toLowerCase().trim();

    // 从需求/设计起步
    if (this.isRequirementStart(input)) {
      return 'requirement_analyst';
    }

    // UI 相关
    if (this.isUIRelated(input)) {
      return 'ui_designer';
    }

    // 架构相关
    if (this.isArchitectureRelated(input)) {
      return 'architecture_designer';
    }

    // 默认：页面工程师
    return 'page_engineer';
  }

  // 调度子 Agent
  async dispatch(
    targetAgent: AgentRole,
    userInput: string,
    context: AgentContext
  ): Promise<AgentResult> {
    // 角色切换日志
    if (this.currentAgent && this.currentAgent !== targetAgent) {
      console.log(chalk.blue(`\n[f-forge] 角色切换：${this.currentAgent} → ${targetAgent}`));
    }
    this.currentAgent = targetAgent;

    // 如果是主控自己处理
    if (targetAgent === 'controller') {
      return this.execute(userInput, context);
    }

    // 获取子 Agent 配置
    const config = agentRegistry.get(targetAgent);
    if (!config) {
      return {
        success: false,
        output: '',
        error: `未知的 Agent 角色: ${targetAgent}`,
      };
    }

    // 创建子 Agent 并执行
    const subAgent = new BaseAgent(targetAgent, this.aiClient, this.contextManager, this.toolRegistry);

    // 输出角色日志
    console.log(chalk.blue(`\n[f-forge] 调用 ${config.name}：${config.description}`));

    return subAgent.execute(userInput, context);
  }

  // 获取当前 Agent
  getCurrentAgent(): AgentRole | null {
    return this.currentAgent;
  }

  // 判断是否直通模式
  private isDirectMode(input: string): boolean {
    const keywords = [
      '怎么', '如何', '为什么', '解释', '查看', '查询',
      '文档', '配置', '打包', '部署', 'ci', 'cd',
      '你好', '谢谢', '再见',
    ];
    return keywords.some(kw => input.includes(kw)) && !input.includes('改') && !input.includes('做');
  }

  // 判断是否需求起步
  private isRequirementStart(input: string): boolean {
    const keywords = [
      'prd', '需求', '设计', '规划', '方案',
      '先设计', '先拆', '先理解',
    ];
    return keywords.some(kw => input.includes(kw));
  }

  // 判断是否 UI 相关
  private isUIRelated(input: string): boolean {
    const keywords = [
      'ui', '样式', '颜色', '字体', '间距', '布局',
      '优化', '美化', '调整', '截图', '头像',
    ];
    return keywords.some(kw => input.includes(kw));
  }

  // 判断是否架构相关
  private isArchitectureRelated(input: string): boolean {
    const keywords = [
      '迁移', '重构', '依赖', '治理', '性能',
      '优化', '简化', '抽取', '复用', '收敛',
      '架构', '模块化',
    ];
    return keywords.some(kw => input.includes(kw));
  }
}
