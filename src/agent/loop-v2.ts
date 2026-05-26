import { AIClient, type AgentTool } from '../llm/client-v2.js';
import type { ContextManager } from '../llm/context.js';
import type { ToolRegistry } from '../tools/registry.js';
import chalk from 'chalk';

export interface AgentLoopOptions {
  maxSteps?: number;
  onToolCall?: (name: string, args: Record<string, string>) => void;
  onToolResult?: (name: string, result: string) => void;
}

export class AgentLoopV2 {
  private aiClient: AIClient;
  private contextManager: ContextManager;
  private toolRegistry: ToolRegistry;
  private maxSteps: number;

  constructor(
    aiClient: AIClient,
    contextManager: ContextManager,
    toolRegistry: ToolRegistry,
    options?: AgentLoopOptions
  ) {
    this.aiClient = aiClient;
    this.contextManager = contextManager;
    this.toolRegistry = toolRegistry;
    this.maxSteps = options?.maxSteps || 10;
  }

  // 将工具注册表转换为 AgentTool 格式
  private getTools(): AgentTool[] {
    return this.toolRegistry.getAll().map(t => ({
      name: t.definition.name,
      description: t.definition.description,
      parameters: t.definition.parameters.properties,
      execute: t.execute,
    }));
  }

  // 执行任务
  async run(userInput: string): Promise<string> {
    // 添加用户消息
    this.contextManager.addUserMessage(userInput);

    const tools = this.getTools();
    const messages = this.contextManager.getMessages();

    try {
      const result = await this.aiClient.generateWithMessages(
        messages,
        tools,
        this.maxSteps
      );

      // 显示工具调用
      if (result.toolCalls.length > 0) {
        for (const tc of result.toolCalls) {
          const toolCall = tc as { toolName: string; args: Record<string, string> };
          console.log(chalk.dim(`\n[调用工具: ${toolCall.toolName}]`));
        }
      }

      // 显示工具结果
      if (result.toolResults.length > 0) {
        for (const tr of result.toolResults) {
          const toolResult = tr as { toolName: string; result: { success: boolean; output: string } };
          console.log(chalk.dim(`[工具结果: ${toolResult.result.success ? '成功' : '失败'}]`));
        }
      }

      // 保存助手消息
      this.contextManager.addAssistantMessage(result.text);

      return result.text;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Agent 执行失败: ${errorMessage}`);
    }
  }

  // 流式执行任务
  async *runStream(userInput: string): AsyncGenerator<string> {
    // 添加用户消息
    this.contextManager.addUserMessage(userInput);

    const tools = this.getTools();
    const messages = this.contextManager.getMessages();

    let fullResponse = '';

    try {
      for await (const chunk of this.aiClient.streamWithMessages(
        messages,
        tools,
        this.maxSteps
      )) {
        if (chunk.type === 'text') {
          yield chunk.content;
          fullResponse += chunk.content;
        }
      }

      // 保存助手消息
      this.contextManager.addAssistantMessage(fullResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Agent 执行失败: ${errorMessage}`);
    }
  }
}
