import { generateText, streamText, tool, stepCountIs } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type { ModelConfig } from '../config/types.js';

// 日志文件路径
const LOG_DIR = process.cwd();
const LOG_FILE = join(LOG_DIR, 'forge-debug.log');

// 写入日志
function writeLog(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`;
  try {
    appendFileSync(LOG_FILE, logLine);
  } catch {
    // 忽略写入错误
  }
}

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

// 缓存统计信息（从 API 响应中提取）
export interface UsageInfo {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  prompt_cache_hit_tokens?: number;
  prompt_cache_miss_tokens?: number;
}

export class AIClient {
  private provider: ReturnType<typeof createOpenAI>;
  private modelName: string;
  private providerKey: string;
  private lastUsage: UsageInfo | null = null;

  constructor(config: ModelConfig) {
    this.providerKey = config.provider_key || '';
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: this.providerKey === 'deepseek' ? createCompatFetch() : undefined,
    });
    this.modelName = config.name;
  }

  setModel(config: ModelConfig): void {
    this.providerKey = config.provider_key || '';
    this.provider = createOpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
      fetch: this.providerKey === 'deepseek' ? createCompatFetch() : undefined,
    });
    this.modelName = config.name;
  }

  getModel(): string {
    return this.modelName;
  }

  getLastUsage(): UsageInfo | null {
    return this.lastUsage;
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
      maxTokens: 8192,
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
      maxTokens: 8192,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : undefined,
    });

    for await (const event of result.fullStream) {
      if (event.type === 'text-delta') {
        yield { type: 'text', content: (event as any).text ?? (event as any).textDelta ?? '' };
      } else if (event.type === 'tool-call') {
        yield { type: 'tool-call', content: JSON.stringify({ name: event.toolName, args: (event as any).args ?? (event as any).input ?? {} }) };
      } else if (event.type === 'tool-result') {
        yield { type: 'tool-result', content: JSON.stringify({ name: event.toolName, result: (event as any).result ?? (event as any).output ?? '' }) };
      }
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
      maxTokens: 8192,
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

    writeLog('INFO', 'streamWithMessages 开始', {
      model: this.modelName,
      messageCount: otherMsgs.length,
      maxTokens: 8192,
      maxSteps,
      lastMessage: otherMsgs[otherMsgs.length - 1]?.content?.substring(0, 100)
    });

    const result = streamText({
      model: this.provider.chat(this.modelName),
      messages: otherMsgs.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      system: systemMsg?.content,
      tools: convertedTools,
      temperature: 0.7,
      maxTokens: 8192,
      stopWhen: maxSteps ? stepCountIs(maxSteps) : undefined,
    });

    let eventCount = 0;
    let totalText = '';
    let lastEventTime = Date.now();

    for await (const event of result.fullStream) {
      const now = Date.now();
      const timeSinceLastEvent = now - lastEventTime;
      lastEventTime = now;
      eventCount++;

      if (event.type === 'text-delta') {
        const text = (event as any).text ?? (event as any).textDelta ?? '';
        totalText += text;
        yield { type: 'text', content: text };
      } else if (event.type === 'tool-call') {
        writeLog('DEBUG', `工具调用 #${eventCount}`, { toolName: event.toolName, timeSinceLastEvent });
        yield { type: 'tool-call', content: JSON.stringify({ name: event.toolName, args: (event as any).args ?? (event as any).input ?? {} }) };
      } else if (event.type === 'tool-result') {
        writeLog('DEBUG', `工具结果 #${eventCount}`, { toolName: event.toolName, timeSinceLastEvent });
        yield { type: 'tool-result', content: JSON.stringify({ name: event.toolName, result: (event as any).result ?? (event as any).output ?? '' }) };
      }

      // 每 50 个事件记录一次进度
      if (eventCount % 50 === 0) {
        writeLog('DEBUG', `流进度`, { eventCount, textLength: totalText.length, timeSinceLastEvent });
      }
    }

    writeLog('INFO', 'streamWithMessages 完成', {
      eventCount,
      textLength: totalText.length,
      textPreview: totalText.substring(0, 200)
    });

    // 提取 usage 统计（包含缓存命中信息）
    try {
      const usage = await result.usage;
      this.lastUsage = {
        prompt_tokens: (usage as any).promptTokens,
        completion_tokens: (usage as any).completionTokens,
        total_tokens: (usage as any).totalTokens,
        prompt_cache_hit_tokens: (usage as any).promptCacheHitTokens || (usage as any).cachedPromptTokens,
        prompt_cache_miss_tokens: (usage as any).promptCacheMissTokens,
      };
    } catch {
      // 忽略 usage 提取错误
    }
  }
}
