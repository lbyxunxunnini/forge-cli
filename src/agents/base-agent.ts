import { AIClient, type AgentTool } from '../llm/client-v2.js';
import type { ContextManager } from '../llm/context.js';
import type { ToolRegistry } from '../tools/registry.js';
import type { AgentRole, AgentConfig, AgentResult, AgentContext } from './types.js';
import { agentRegistry } from './registry.js';

export class BaseAgent {
  protected role: AgentRole;
  protected config: AgentConfig;
  protected aiClient: AIClient;
  protected contextManager: ContextManager;
  protected toolRegistry: ToolRegistry;

  constructor(
    role: AgentRole,
    aiClient: AIClient,
    contextManager: ContextManager,
    toolRegistry: ToolRegistry
  ) {
    this.role = role;
    this.config = agentRegistry.get(role)!;
    this.aiClient = aiClient;
    this.contextManager = contextManager;
    this.toolRegistry = toolRegistry;
  }

  // 获取当前角色允许的工具
  protected getAllowedTools(): AgentTool[] {
    const allTools = this.toolRegistry.getAll();
    return allTools
      .filter(t => agentRegistry.isToolAllowed(this.role, t.definition.name))
      .map(t => ({
        name: t.definition.name,
        description: t.definition.description,
        parameters: t.definition.parameters.properties,
        execute: t.execute,
      }));
  }

  // 执行任务
  async execute(
    userInput: string,
    context: AgentContext
  ): Promise<AgentResult> {
    const tools = this.getAllowedTools();

    // 构建系统提示
    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const result = await this.aiClient.generate(
        userInput,
        systemPrompt,
        tools,
        5 // 最多5步
      );

      return {
        success: true,
        output: result.text,
      };
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : String(error);
      // 提取 HTTP 状态码和 URL 信息
      const status = (error as any)?.status || (error as any)?.statusCode;
      const url = (error as any)?.url || (error as any)?.request?.url;
      const modelName = this.aiClient.getModel();
      let detail = `模型 ${modelName} 调用失败: ${raw}`;
      if (status) detail += ` (HTTP ${status})`;
      if (url) detail += `\n  URL: ${url}`;
      return {
        success: false,
        output: '',
        error: detail,
      };
    }
  }

  // 流式执行
  async *executeStream(
    userInput: string,
    context: AgentContext
  ): AsyncGenerator<{ type: 'text' | 'tool-call' | 'tool-result'; content: string }> {
    const tools = this.getAllowedTools();

    // 构建系统提示
    const systemPrompt = this.buildSystemPrompt(context);

    yield* this.aiClient.stream(
      userInput,
      systemPrompt,
      tools,
      5
    );
  }

  // 构建系统提示
  protected buildSystemPrompt(context: AgentContext): string {
    const parts = [
      this.config.systemPrompt,
      '',
      '## 当前上下文',
      `- 项目路径: ${context.projectRoot}`,
      `- 当前阶段: ${context.currentPhase}`,
      `- 当前模式: ${context.currentMode}`,
      `- 用户确认: ${context.userConfirmed ? '是' : '否'}`,
      `- 设计确认: ${context.designConfirmed ? '是' : '否'}`,
    ];

    return parts.join('\n');
  }

  // 获取角色名称
  getName(): string {
    return this.config.name;
  }

  // 获取角色描述
  getDescription(): string {
    return this.config.description;
  }

  // 检查工具是否允许
  isToolAllowed(toolName: string): boolean {
    return agentRegistry.isToolAllowed(this.role, toolName);
  }
}
