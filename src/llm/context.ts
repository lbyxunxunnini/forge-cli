import type { Message } from './types.js';

// 消息重要性等级
export type Importance = 'critical' | 'high' | 'normal' | 'low';

export interface ContextMessage extends Message {
  importance?: Importance;
  tokenEstimate?: number;
  compressed?: boolean;
}

export class ContextManager {
  private messages: ContextMessage[] = [];
  private systemPrompt: string = '';
  private maxMessages: number;
  private maxTokens: number;
  private summarizer?: (messages: ContextMessage[]) => Promise<string>;

  constructor(maxMessages: number = 100, maxTokens: number = 32000) {
    this.maxMessages = maxMessages;
    this.maxTokens = maxTokens;
  }

  // 设置摘要生成器（需要 LLM 客户端）
  setSummarizer(fn: (messages: ContextMessage[]) => Promise<string>): void {
    this.summarizer = fn;
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  addMessage(message: ContextMessage): void {
    // 自动估算 token
    if (!message.tokenEstimate) {
      message.tokenEstimate = estimateTokens(message.content);
    }
    // 自动标记重要性
    if (!message.importance) {
      message.importance = classifyImportance(message);
    }
    this.messages.push(message);
    this.compressIfNeeded();
  }

  addUserMessage(content: string): void {
    this.addMessage({ role: 'user', content });
  }

  addAssistantMessage(content: string): void {
    this.addMessage({ role: 'assistant', content });
  }

  addToolResult(toolCallId: string, content: string): void {
    // 大工具结果自动裁剪
    const trimmed = trimToolResult(content);
    this.addMessage({ role: 'tool', content: trimmed, tool_call_id: toolCallId, importance: 'low' });
  }

  getMessages(): Message[] {
    const messages: Message[] = [];
    if (this.systemPrompt) {
      messages.push({ role: 'system', content: this.systemPrompt });
    }
    messages.push(...this.messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
    })));
    return messages;
  }

  getHistory(): ContextMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  getLength(): number {
    return this.messages.length;
  }

  getTotalTokens(): number {
    return this.messages.reduce((sum, m) => sum + (m.tokenEstimate || 0), 0);
  }

  getSummary(): string {
    const userMessages = this.messages.filter(m => m.role === 'user').length;
    const assistantMessages = this.messages.filter(m => m.role === 'assistant').length;
    const toolMessages = this.messages.filter(m => m.role === 'tool').length;
    const tokens = this.getTotalTokens();
    const pct = Math.min(100, Math.round((tokens / this.maxTokens) * 100));
    return `消息数: ${this.messages.length} (用户: ${userMessages}, 助手: ${assistantMessages}, 工具: ${toolMessages}) | Token: ~${tokens} (${pct}%)`;
  }

  // 获取上下文使用百分比（用于状态栏）
  getContextPercent(): number {
    return Math.min(100, Math.round((this.getTotalTokens() / this.maxTokens) * 100));
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

  // ─── 压缩策略 ───────────────────────────────────────────────

  private compressIfNeeded(): void {
    // 消息数超限：保留前缀 + 最近窗口
    if (this.messages.length > this.maxMessages) {
      this.truncateByCount();
    }

    // Token 超限：裁剪或摘要
    if (this.getTotalTokens() > this.maxTokens) {
      this.compressByTokens();
    }
  }

  private truncateByCount(): void {
    const prefixSize = Math.min(10, Math.floor(this.maxMessages * 0.2));
    const windowSize = this.maxMessages - prefixSize;
    const prefix = this.messages.slice(0, prefixSize);
    const recent = this.messages.slice(this.messages.length - windowSize);
    this.messages = [...prefix, ...recent];
  }

  private compressByTokens(): void {
    // 策略1: 裁剪低重要性大消息
    for (const msg of this.messages) {
      if (msg.importance === 'low' && (msg.tokenEstimate || 0) > 500) {
        msg.content = msg.content.slice(0, 500) + '\n... [已裁剪]';
        msg.tokenEstimate = estimateTokens(msg.content);
        msg.compressed = true;
      }
    }

    // 如果还超限，用摘要替换中间消息
    if (this.getTotalTokens() > this.maxTokens && this.summarizer) {
      this.summarizeOldMessages();
    }
  }

  private async summarizeOldMessages(): Promise<void> {
    if (!this.summarizer) return;

    // 取前 20% ~ 50% 的消息做摘要
    const prefixSize = Math.min(5, Math.floor(this.messages.length * 0.1));
    const summarizeEnd = Math.floor(this.messages.length * 0.5);
    const toSummarize = this.messages.slice(prefixSize, summarizeEnd);

    if (toSummarize.length < 3) return;

    try {
      const summary = await this.summarizer(toSummarize);
      const summaryMsg: ContextMessage = {
        role: 'assistant',
        content: `[对话摘要] ${summary}`,
        importance: 'high',
        tokenEstimate: estimateTokens(summary),
        compressed: true,
      };

      // 替换被摘要的消息
      const prefix = this.messages.slice(0, prefixSize);
      const recent = this.messages.slice(summarizeEnd);
      this.messages = [...prefix, summaryMsg, ...recent];
    } catch {
      // 摘要失败，降级为简单截断
      this.truncateByCount();
    }
  }
}

// ─── 工具函数 ─────────────────────────────────────────────────

function estimateTokens(text: string): number {
  // 粗略估算：英文 ~4 chars/token，中文 ~2 chars/token
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const otherChars = text.length - cjkChars;
  return Math.ceil(cjkChars / 2 + otherChars / 4);
}

function classifyImportance(msg: ContextMessage): Importance {
  // 系统消息：高重要性
  if (msg.role === 'system') return 'critical';
  // 工具结果：低重要性（通常很大）
  if (msg.role === 'tool') return 'low';
  // 用户消息：高重要性
  if (msg.role === 'user') return 'high';
  // 助手消息：普通
  return 'normal';
}

function trimToolResult(content: string, maxChars: number = 2000): string {
  if (content.length <= maxChars) return content;
  // 保留头尾，中间截断
  const head = content.slice(0, maxChars * 0.7);
  const tail = content.slice(-maxChars * 0.2);
  return `${head}\n\n... [已裁剪 ${content.length - maxChars} 字符] ...\n\n${tail}`;
}

export const contextManager = new ContextManager();
