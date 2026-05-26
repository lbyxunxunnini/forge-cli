import { generateText, streamText, tool, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import type { ModelConfig } from '../config/types.js';

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string }>;
  execute: (args: Record<string, string>) => Promise<{ success: boolean; output: string; error?: string }>;
}

// 自定义 fetch：给请求体注入 thinking: {type: "disabled"} 禁用 DeepSeek 思考模式
function createCompatFetch(): typeof fetch {
  return async (url, options) => {
    if (options?.body && typeof options.body === 'string') {
      try {
        const parsed = JSON.parse(options.body);
        if (!parsed.thinking) {
          parsed.thinking = { type: 'disabled' };
        }
        options = { ...options, body: JSON.stringify(parsed) };
      } catch {
        // 非 JSON body，忽略
      }
    }
    return fetch(url, options);
  };
}

export class AIClient {
  private provider: ReturnType<typeof createOpenAI>;
  private modelName: string;

  constructor(config: ModelConfig) {
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: createCompatFetch(),
    });
    this.modelName = config.name;
  }

  setModel(config: ModelConfig): void {
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: createCompatFetch(),
    });
    this.modelName = config.name;
  }

  getModel(): string {
    return this.modelName;
  }

  // 将自定义工具转换为 AI SDK 工具格式
  private convertTools(tools: AgentTool[]): Record<string, any> {
    const converted: Record<string, any> = {};

    for (const t of tools) {
      // 构建 Zod schema
      const schemaObj: Record<string, z.ZodTypeAny> = {};
      for (const [key, prop] of Object.entries(t.parameters)) {
        if (prop.type === 'string') {
          schemaObj[key] = z.string().describe(prop.description);
        } else if (prop.type === 'number') {
          schemaObj[key] = z.number().describe(prop.description);
        } else if (prop.type === 'boolean') {
          schemaObj[key] = z.boolean().describe(prop.description);
        } else {
          schemaObj[key] = z.string().describe(prop.description);
        }
      }

      const schema = z.object(schemaObj);

      converted[t.name] = tool({
        description: t.description,
        inputSchema: schema,
        execute: async (args: any) => {
          const result = await t.execute(args as Record<string, string>);
          return result;
        },
      } as any);
    }

    return converted;
  }

  // 单次生成
  async generate(
    prompt: string,
    systemPrompt?: string,
    tools?: AgentTool[],
    maxSteps?: number
  ): Promise<{ text: string; toolCalls: unknown[]; toolResults: unknown[] }> {
    const convertedTools = tools ? this.convertTools(tools) : undefined;

    const result = await generateText({
      model: this.provider.chat(this.modelName),
      prompt,
      system: systemPrompt,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : undefined,
    });

    return {
      text: result.text,
      toolCalls: result.steps.flatMap(s => s.toolCalls),
      toolResults: result.steps.flatMap(s => s.toolResults),
    };
  }

  // 流式生成
  async *stream(
    prompt: string,
    systemPrompt?: string,
    tools?: AgentTool[],
    maxSteps?: number
  ): AsyncGenerator<{ type: 'text' | 'tool-call' | 'tool-result'; content: string }> {
    const convertedTools = tools ? this.convertTools(tools) : undefined;

    const result = streamText({
      model: this.provider.chat(this.modelName),
      prompt,
      system: systemPrompt,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : undefined,
    });

    for await (const chunk of result.textStream) {
      yield { type: 'text', content: chunk };
    }
  }

  // 带上下文的生成
  async generateWithMessages(
    messages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string }>,
    tools?: AgentTool[],
    maxSteps?: number
  ): Promise<{ text: string; toolCalls: unknown[]; toolResults: unknown[] }> {
    const convertedTools = tools ? this.convertTools(tools) : undefined;

    // 分离 system prompt
    const systemMsg = messages.find(m => m.role === 'system');
    const otherMsgs = messages.filter(m => m.role !== 'system');

    const result = await generateText({
      model: this.provider.chat(this.modelName),
      messages: otherMsgs.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      system: systemMsg?.content,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : undefined,
    });

    return {
      text: result.text,
      toolCalls: result.steps.flatMap(s => s.toolCalls),
      toolResults: result.steps.flatMap(s => s.toolResults),
    };
  }

  // 流式生成带上下文
  async *streamWithMessages(
    messages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content: string }>,
    tools?: AgentTool[],
    maxSteps?: number
  ): AsyncGenerator<{ type: 'text' | 'tool-call' | 'tool-result'; content: string }> {
    const convertedTools = tools ? this.convertTools(tools) : undefined;

    // 分离 system prompt
    const systemMsg = messages.find(m => m.role === 'system');
    const otherMsgs = messages.filter(m => m.role !== 'system');

    const result = streamText({
      model: this.provider.chat(this.modelName),
      messages: otherMsgs.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      system: systemMsg?.content,
      tools: convertedTools,
      temperature: 0.7,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : undefined,
    });

    for await (const chunk of result.textStream) {
      yield { type: 'text', content: chunk };
    }
  }
}
