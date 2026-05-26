import type { LLMClient } from '../llm/client.js';
import type { ContextManager } from '../llm/context.js';
import type { Message, ToolCall } from '../llm/types.js';
import type { ToolRegistry } from '../tools/registry.js';
import chalk from 'chalk';

export interface AgentLoopOptions {
  maxToolCalls?: number;
  onToolCall?: (name: string, args: Record<string, string>) => void;
  onToolResult?: (name: string, result: string) => void;
}

export class AgentLoop {
  private llmClient: LLMClient;
  private contextManager: ContextManager;
  private toolRegistry: ToolRegistry;
  private maxToolCalls: number;

  constructor(
    llmClient: LLMClient,
    contextManager: ContextManager,
    toolRegistry: ToolRegistry,
    options?: AgentLoopOptions
  ) {
    this.llmClient = llmClient;
    this.contextManager = contextManager;
    this.toolRegistry = toolRegistry;
    this.maxToolCalls = options?.maxToolCalls || 10;
  }

  async run(userInput: string): Promise<string> {
    // 添加用户消息
    this.contextManager.addUserMessage(userInput);

    let fullResponse = '';
    let toolCallCount = 0;

    while (toolCallCount < this.maxToolCalls) {
      // 获取工具定义
      const tools = this.toolRegistry.getDefinitions().map(def => ({
        type: 'function' as const,
        function: {
          name: def.name,
          description: def.description,
          parameters: def.parameters,
        },
      }));

      // 调用 LLM
      const messages = this.contextManager.getMessages();
      let assistantContent = '';
      let toolCalls: ToolCall[] = [];

      for await (const chunk of this.llmClient.chatStream(messages, { tools })) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          process.stdout.write(delta.content);
          assistantContent += delta.content;
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = toolCalls.find(t => t.id === tc.id);
            if (existing) {
              existing.function.arguments += tc.function.arguments;
            } else {
              toolCalls.push({ ...tc });
            }
          }
        }
      }

      fullResponse += assistantContent;

      // 如果没有工具调用，结束循环
      if (toolCalls.length === 0) {
        this.contextManager.addAssistantMessage(assistantContent);
        break;
      }

      // 保存助手消息（包含工具调用）
      this.contextManager.addMessage({
        role: 'assistant',
        content: assistantContent,
        tool_calls: toolCalls,
      });

      // 执行工具调用
      for (const toolCall of toolCalls) {
        toolCallCount++;
        const { name, arguments: argsStr } = toolCall.function;

        console.log(chalk.dim(`\n[调用工具: ${name}]`));

        let args: Record<string, string> = {};
        try {
          args = JSON.parse(argsStr);
        } catch {
          // 如果参数解析失败，使用空对象
        }

        // 执行工具
        const result = await this.toolRegistry.execute(name, args);

        const resultContent = result.success
          ? result.output
          : `Error: ${result.error}`;

        console.log(chalk.dim(`[工具结果: ${result.success ? '成功' : '失败'}]`));

        // 添加工具结果到上下文
        this.contextManager.addToolResult(toolCall.id, resultContent);
      }
    }

    return fullResponse;
  }

  async *runStream(userInput: string): AsyncGenerator<string> {
    // 添加用户消息
    this.contextManager.addUserMessage(userInput);

    let toolCallCount = 0;

    while (toolCallCount < this.maxToolCalls) {
      // 获取工具定义
      const tools = this.toolRegistry.getDefinitions().map(def => ({
        type: 'function' as const,
        function: {
          name: def.name,
          description: def.description,
          parameters: def.parameters,
        },
      }));

      // 调用 LLM
      const messages = this.contextManager.getMessages();
      let assistantContent = '';
      let toolCalls: ToolCall[] = [];

      for await (const chunk of this.llmClient.chatStream(messages, { tools })) {
        const delta = chunk.choices[0]?.delta;

        if (delta?.content) {
          yield delta.content;
          assistantContent += delta.content;
        }

        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = toolCalls.find(t => t.id === tc.id);
            if (existing) {
              existing.function.arguments += tc.function.arguments;
            } else {
              toolCalls.push({ ...tc });
            }
          }
        }
      }

      // 如果没有工具调用，结束循环
      if (toolCalls.length === 0) {
        this.contextManager.addAssistantMessage(assistantContent);
        break;
      }

      // 保存助手消息（包含工具调用）
      this.contextManager.addMessage({
        role: 'assistant',
        content: assistantContent,
        tool_calls: toolCalls,
      });

      // 执行工具调用
      for (const toolCall of toolCalls) {
        toolCallCount++;
        const { name, arguments: argsStr } = toolCall.function;

        yield `\n[调用工具: ${name}]`;

        let args: Record<string, string> = {};
        try {
          args = JSON.parse(argsStr);
        } catch {
          // 如果参数解析失败，使用空对象
        }

        // 执行工具
        const result = await this.toolRegistry.execute(name, args);

        const resultContent = result.success
          ? result.output
          : `Error: ${result.error}`;

        yield `\n[工具结果: ${result.success ? '成功' : '失败'}]`;

        // 添加工具结果到上下文
        this.contextManager.addToolResult(toolCall.id, resultContent);
      }
    }
  }
}
