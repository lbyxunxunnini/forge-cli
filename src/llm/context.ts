import type { Message } from './types.js';

// 消息重要性等级
export type Importance = 'critical' | 'high' | 'normal' | 'low';

export interface ContextMessage extends Message {
  importance?: Importance;
  tokenEstimate?: number;
  compressed?: boolean;
}

// 缓存统计
export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitTokens: number;
  missTokens: number;
}

export class ContextManager {
  private messages: ContextMessage[] = [];
  private systemPrompt: string = '';
  private dynamicContext: ContextMessage[] = [];  // 动态上下文（记忆等）
  private maxMessages: number;
  private maxTokens: number;
  private summarizer?: (messages: ContextMessage[]) => Promise<string>;

  // 缓存优化：稳定前缀大小（压缩时不修改这部分消息）
  private stablePrefixSize: number = 0;
  // 缓存统计
  private cacheStats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitTokens: 0,
    missTokens: 0,
  };

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
    // 一轮对话完成后，将之前的消息标记为稳定前缀
    this.stablePrefixSize = this.messages.length;
  }

  /**
   * 添加动态上下文（如记忆、临时信息）
   * 这些内容会被放在消息列表最后，避免污染 prompt cache
   */
  addDynamicContext(content: string, importance: Importance = 'normal'): void {
    this.dynamicContext.push({
      role: 'system',
      content,
      importance,
      tokenEstimate: estimateTokens(content),
    });
  }

  /**
   * 清空动态上下文
   */
  clearDynamicContext(): void {
    this.dynamicContext = [];
  }

  /**
   * 更新动态上下文（替换所有动态内容）
   */
  setDynamicContext(content: string, importance: Importance = 'normal'): void {
    this.clearDynamicContext();
    if (content) {
      this.addDynamicContext(content, importance);
    }
  }

  addToolResult(toolCallId: string, content: string): void {
    // 大工具结果自动裁剪
    const trimmed = trimToolResult(content);
    this.addMessage({ role: 'tool', content: trimmed, tool_call_id: toolCallId, importance: 'low' });
  }

  getMessages(): Message[] {
    const messages: Message[] = [];

    // 1. 静态系统 prompt（最前面，可缓存）
    if (this.systemPrompt) {
      messages.push({ role: 'system', content: this.systemPrompt });
    }

    // 2. 主要消息历史（用户、助手、工具消息）
    messages.push(...this.messages.map(m => ({
      role: m.role,
      content: m.content,
      ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
    })));

    // 3. 动态上下文（最后，避免污染缓存）
    if (this.dynamicContext.length > 0) {
      messages.push(...this.dynamicContext.map(m => ({
        role: m.role,
        content: m.content,
      })));
    }

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
    const messageTokens = this.messages.reduce((sum, m) => sum + (m.tokenEstimate || 0), 0);
    const dynamicTokens = this.dynamicContext.reduce((sum, m) => sum + (m.tokenEstimate || 0), 0);
    return messageTokens + dynamicTokens;
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

  // ─── 缓存统计 ──────────────────────────────────────────────

  getCacheStats(): CacheStats {
    return { ...this.cacheStats };
  }

  getCacheHitRate(): number {
    if (this.cacheStats.totalRequests === 0) return 0;
    return this.cacheStats.hitTokens / (this.cacheStats.hitTokens + this.cacheStats.missTokens) * 100;
  }

  /**
   * 从 API 响应更新缓存统计
   * 支持 OpenAI 兼容 API 返回的 usage.prompt_cache_hit_tokens
   */
  updateCacheStatsFromUsage(usage?: { prompt_cache_hit_tokens?: number; prompt_cache_miss_tokens?: number; prompt_tokens?: number }): void {
    if (!usage) return;
    this.cacheStats.totalRequests++;

    const hitTokens = usage.prompt_cache_hit_tokens || 0;
    const missTokens = usage.prompt_cache_miss_tokens || (usage.prompt_tokens ? usage.prompt_tokens - hitTokens : 0);

    if (hitTokens > 0) {
      this.cacheStats.cacheHits++;
      this.cacheStats.hitTokens += hitTokens;
    }
    if (missTokens > 0) {
      this.cacheStats.cacheMisses++;
      this.cacheStats.missTokens += missTokens;
    }
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
    // 保留稳定前缀 + 最近窗口，确保不破坏缓存一致性
    const prefixSize = Math.max(this.stablePrefixSize, Math.min(10, Math.floor(this.maxMessages * 0.2)));
    const windowSize = this.maxMessages - prefixSize;
    const prefix = this.messages.slice(0, Math.min(prefixSize, this.messages.length));
    const recent = this.messages.slice(Math.max(0, this.messages.length - windowSize));
    this.messages = [...prefix, ...recent];
  }

  private compressByTokens(): void {
    // 策略1: 只裁剪稳定前缀之后的低重要性大消息（保护缓存一致性）
    for (let i = this.stablePrefixSize; i < this.messages.length; i++) {
      const msg = this.messages[i];
      if (msg.importance === 'low' && (msg.tokenEstimate || 0) > 500 && !msg.compressed) {
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

    // 摘要范围：稳定前缀之后、最近窗口之前的消息
    const summarizeStart = Math.min(this.stablePrefixSize + 2, this.messages.length - 5);
    const summarizeEnd = Math.max(summarizeStart + 3, Math.floor(this.messages.length * 0.6));
    const toSummarize = this.messages.slice(summarizeStart, summarizeEnd);

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

      // 替换被摘要的消息，保留稳定前缀
      const prefix = this.messages.slice(0, summarizeStart);
      const recent = this.messages.slice(summarizeEnd);
      this.messages = [...prefix, summaryMsg, ...recent];
      // 更新稳定前缀大小（摘要消息成为新的前缀边界）
      this.stablePrefixSize = prefix.length + 1;
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
