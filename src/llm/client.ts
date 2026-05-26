import OpenAI from 'openai';
import type { Message, Tool, ChatCompletion, StreamChunk } from './types.js';
import type { ModelConfig } from '../config/types.js';

export class LLMClient {
  private client: OpenAI;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(config: ModelConfig, options?: { maxTokens?: number; temperature?: number }) {
    this.client = new OpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
    });
    this.model = config.name;
    this.maxTokens = options?.maxTokens || 4096;
    this.temperature = options?.temperature || 0.7;
  }

  async chat(
    messages: Message[],
    options?: {
      tools?: Tool[];
      maxTokens?: number;
      temperature?: number;
    }
  ): Promise<ChatCompletion> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      max_tokens: options?.maxTokens || this.maxTokens,
      temperature: options?.temperature || this.temperature,
      tools: options?.tools as OpenAI.ChatCompletionTool[],
    });

    return {
      id: response.id,
      choices: response.choices.map(choice => ({
        index: choice.index,
        message: {
          role: choice.message.role as Message['role'],
          content: choice.message.content || '',
          tool_calls: choice.message.tool_calls?.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.function.name,
              arguments: tc.function.arguments,
            },
          })),
        },
        finish_reason: choice.finish_reason,
      })),
    };
  }

  async *chatStream(
    messages: Message[],
    options?: {
      tools?: Tool[];
      maxTokens?: number;
      temperature?: number;
    }
  ): AsyncGenerator<StreamChunk> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as OpenAI.ChatCompletionMessageParam[],
      max_tokens: options?.maxTokens || this.maxTokens,
      temperature: options?.temperature || this.temperature,
      tools: options?.tools as OpenAI.ChatCompletionTool[],
      stream: true,
    });

    for await (const chunk of stream) {
      yield {
        id: chunk.id,
        choices: chunk.choices.map(choice => ({
          index: choice.index,
          delta: {
            role: choice.delta.role as Message['role'],
            content: choice.delta.content || undefined,
            tool_calls: choice.delta.tool_calls?.map(tc => ({
              id: tc.id || '',
              type: 'function' as const,
              function: {
                name: tc.function?.name || '',
                arguments: tc.function?.arguments || '',
              },
            })),
          },
          finish_reason: choice.finish_reason,
        })),
      };
    }
  }

  setModel(config: ModelConfig): void {
    this.client = new OpenAI({
      apiKey: config.api_key,
      baseURL: config.base_url,
    });
    this.model = config.name;
  }

  getModel(): string {
    return this.model;
  }
}
