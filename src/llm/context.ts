import type { Message } from './types.js';

export class ContextManager {
  private messages: Message[] = [];
  private systemPrompt: string = '';
  private maxMessages: number;

  constructor(maxMessages: number = 100) {
    this.maxMessages = maxMessages;
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  addMessage(message: Message): void {
    this.messages.push(message);
    this.truncateIfNeeded();
  }

  addUserMessage(content: string): void {
    this.addMessage({ role: 'user', content });
  }

  addAssistantMessage(content: string): void {
    this.addMessage({ role: 'assistant', content });
  }

  addToolResult(toolCallId: string, content: string): void {
    this.addMessage({ role: 'tool', content, tool_call_id: toolCallId });
  }

  getMessages(): Message[] {
    const messages: Message[] = [];
    if (this.systemPrompt) {
      messages.push({ role: 'system', content: this.systemPrompt });
    }
    messages.push(...this.messages);
    return messages;
  }

  getHistory(): Message[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  getLength(): number {
    return this.messages.length;
  }

  getSummary(): string {
    const userMessages = this.messages.filter(m => m.role === 'user').length;
    const assistantMessages = this.messages.filter(m => m.role === 'assistant').length;
    const toolMessages = this.messages.filter(m => m.role === 'tool').length;
    return `消息数: ${this.messages.length} (用户: ${userMessages}, 助手: ${assistantMessages}, 工具: ${toolMessages})`;
  }

  isEmpty(): boolean {
    return this.messages.length === 0;
  }

  getLastUserMessage(): string | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'user') {
        return this.messages[i].content;
      }
    }
    return undefined;
  }

  getLastAssistantMessage(): string | undefined {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (this.messages[i].role === 'assistant') {
        return this.messages[i].content;
      }
    }
    return undefined;
  }

  toJSON(): string {
    return JSON.stringify({
      systemPrompt: this.systemPrompt,
      messages: this.messages,
    }, null, 2);
  }

  static fromJSON(json: string): ContextManager {
    const data = JSON.parse(json);
    const manager = new ContextManager();
    manager.systemPrompt = data.systemPrompt || '';
    manager.messages = data.messages || [];
    return manager;
  }

  private truncateIfNeeded(): void {
    if (this.messages.length <= this.maxMessages) return;

    // 缓存优化截断策略：
    // - 保留前 N 条作为稳定前缀（DeepSeek 前缀缓存命中）
    // - 保留最近 M 条作为当前上下文
    // - 从中间丢弃旧消息
    const prefixSize = Math.min(10, Math.floor(this.maxMessages * 0.2));
    const windowSize = this.maxMessages - prefixSize;
    const prefix = this.messages.slice(0, prefixSize);
    const recent = this.messages.slice(this.messages.length - windowSize);
    this.messages = [...prefix, ...recent];
  }
}

export const contextManager = new ContextManager();
