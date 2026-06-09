import { AIClient, type AgentTool } from '../llm/client-v2.js';
import type { ContextManager } from '../llm/context.js';
import type { ToolRegistry } from '../tools/registry.js';
import { Tracer, initTracer } from '../utils/trace.js';
import { ToolRetryExecutor } from '../utils/retry.js';
import { generateSummary, formatSummary } from '../utils/summary.js';
import chalk from 'chalk';

export interface AgentLoopOptions {
  maxSteps?: number;
  sessionId?: string;
  enableTrace?: boolean;
  enableRetry?: boolean;
  onToolCall?: (name: string, args: Record<string, string>) => void;
  onToolResult?: (name: string, result: string) => void;
}

export class AgentLoopV2 {
  private aiClient: AIClient;
  private contextManager: ContextManager;
  private toolRegistry: ToolRegistry;
  private maxSteps: number;
  private tracer: Tracer | null = null;
  private toolRetry: ToolRetryExecutor;

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

    // 初始化 trace
    if (options?.enableTrace !== false) {
      const sessionId = options?.sessionId || `loop-${Date.now()}`;
      this.tracer = initTracer(sessionId, { consoleOutput: true });
    }

    // 初始化工具重试
    this.toolRetry = new ToolRetryExecutor(
      { maxAttempts: options?.enableRetry !== false ? 2 : 1 },
      this.tracer || undefined
    );
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

    if (this.tracer) {
      this.tracer.record('user_input', { input: userInput });
      this.tracer.setMetadata('userInput', userInput);
    }

    const tools = this.getTools();
    const messages = this.contextManager.getMessages();

    if (this.tracer) {
      this.tracer.traceLLMCall('default', messages.length, tools.length);
    }

    const llmStart = Date.now();

    try {
      const result = await this.aiClient.generateWithMessages(
        messages,
        tools,
        this.maxSteps
      );

      if (this.tracer) {
        this.tracer.traceLLMResponse(
          result.text,
          result.toolCalls.length,
          Date.now() - llmStart
        );
      }

      // 记录工具调用
      if (result.toolCalls.length > 0) {
        for (const tc of result.toolCalls) {
          const toolCall = tc as { toolName: string; args: Record<string, string> };
          console.log(chalk.dim(`\n[调用工具: ${toolCall.toolName}]`));

          if (this.tracer) {
            this.tracer.traceToolCall(toolCall.toolName, toolCall.args);
          }
        }
      }

      // 记录工具结果
      if (result.toolResults.length > 0) {
        for (const tr of result.toolResults) {
          const toolResult = tr as { toolName: string; result: { success: boolean; output: string } };
          console.log(chalk.dim(`[工具结果: ${toolResult.result.success ? '成功' : '失败'}]`));

          if (this.tracer) {
            this.tracer.traceToolResult(
              toolResult.toolName,
              toolResult.result.success,
              toolResult.result.output.length,
              0
            );
          }
        }
      }

      // 保存助手消息
      this.contextManager.addAssistantMessage(result.text);

      return result.text;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (this.tracer) {
        this.tracer.traceError(err, 'AgentLoop.run');
      }

      throw new Error(`Agent 执行失败: ${err.message}`);
    }
  }

  // 带重试的工具执行
  async runWithRetry(userInput: string): Promise<string> {
    this.contextManager.addUserMessage(userInput);

    if (this.tracer) {
      this.tracer.record('user_input', { input: userInput });
    }

    const tools = this.getTools();
    const messages = this.contextManager.getMessages();

    if (this.tracer) {
      this.tracer.traceLLMCall('default', messages.length, tools.length);
    }

    const llmStart = Date.now();

    try {
      const result = await this.aiClient.generateWithMessages(
        messages,
        tools,
        this.maxSteps
      );

      if (this.tracer) {
        this.tracer.traceLLMResponse(
          result.text,
          result.toolCalls.length,
          Date.now() - llmStart
        );
      }

      // 处理工具调用（带重试）
      if (result.toolCalls.length > 0) {
        for (const tc of result.toolCalls) {
          const toolCall = tc as { toolName: string; args: Record<string, string> };

          if (this.tracer) {
            this.tracer.traceToolCall(toolCall.toolName, toolCall.args);
          }

          const toolStart = Date.now();

          try {
            // 用重试执行器包装工具执行
            const toolResult = await this.toolRetry.execute(
              toolCall.toolName,
              async () => {
                return await this.toolRegistry.execute(toolCall.toolName, toolCall.args);
              }
            );

            if (this.tracer) {
              this.tracer.traceToolResult(
                toolCall.toolName,
                toolResult.success,
                toolResult.output?.length || 0,
                Date.now() - toolStart
              );
            }
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));

            if (this.tracer) {
              this.tracer.traceToolResult(
                toolCall.toolName,
                false,
                0,
                Date.now() - toolStart
              );
              this.tracer.traceError(error, `tool:${toolCall.toolName}`);
            }
          }
        }
      }

      this.contextManager.addAssistantMessage(result.text);

      // 生成并输出摘要
      if (this.tracer) {
        this.printSummary();
      }

      return result.text;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (this.tracer) {
        this.tracer.traceError(err, 'AgentLoop.runWithRetry');
        this.printSummary();
      }

      throw new Error(`Agent 执行失败: ${err.message}`);
    }
  }

  // 流式执行任务
  async *runStream(userInput: string): AsyncGenerator<string> {
    this.contextManager.addUserMessage(userInput);

    if (this.tracer) {
      this.tracer.record('user_input', { input: userInput });
    }

    const tools = this.getTools();
    const messages = this.contextManager.getMessages();

    if (this.tracer) {
      this.tracer.traceLLMCall('default', messages.length, tools.length);
    }

    const llmStart = Date.now();
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

      if (this.tracer) {
        this.tracer.traceLLMResponse(fullResponse, 0, Date.now() - llmStart);
      }

      this.contextManager.addAssistantMessage(fullResponse);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (this.tracer) {
        this.tracer.traceError(err, 'AgentLoop.runStream');
      }

      throw new Error(`Agent 执行失败: ${err.message}`);
    }
  }

  // 输出执行摘要
  private printSummary(): void {
    if (!this.tracer) return;

    const session = this.tracer.getSession();
    const stats = this.tracer.getStats();
    const summary = generateSummary(session, stats);

    console.log('\n' + formatSummary(summary));
  }

  // 获取 tracer 实例（供外部使用）
  getTracer(): Tracer | null {
    return this.tracer;
  }

  // 结束并清理
  dispose(): void {
    if (this.tracer) {
      this.tracer.end();
    }
  }
}
