import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// ---- 事件类型 ----

export type TraceEventType =
  | 'session_start'
  | 'session_end'
  | 'user_input'
  | 'llm_call'
  | 'llm_response'
  | 'tool_call'
  | 'tool_result'
  | 'state_change'
  | 'phase_advance'
  | 'error'
  | 'retry'
  | 'warning';

export interface TraceEvent {
  id: string;
  type: TraceEventType;
  timestamp: string;
  elapsed: number; // ms since session start
  data: Record<string, unknown>;
  tags?: string[];
}

export interface TraceSession {
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  events: TraceEvent[];
  metadata: Record<string, unknown>;
}

// ---- 配置 ----

export interface TraceConfig {
  enabled: boolean;
  persistToDisk: boolean;
  dir: string;
  maxEvents: number; // 内存中最多保留多少条
  consoleOutput: boolean; // 是否同步输出到控制台
}

const DEFAULT_CONFIG: TraceConfig = {
  enabled: true,
  persistToDisk: true,
  dir: join(homedir(), '.forge-cli', 'traces'),
  maxEvents: 500,
  consoleOutput: false,
};

// ---- Trace 收集器 ----

export class Tracer {
  private session: TraceSession;
  private config: TraceConfig;
  private startTime: number;
  private eventCounter = 0;

  constructor(sessionId: string, config?: Partial<TraceConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = Date.now();
    this.session = {
      sessionId,
      startedAt: new Date().toISOString(),
      events: [],
      metadata: {},
    };
  }

  // 记录事件
  record(type: TraceEventType, data: Record<string, unknown>, tags?: string[]): TraceEvent {
    if (!this.config.enabled) {
      return this.createEvent(type, data, tags);
    }

    const event = this.createEvent(type, data, tags);
    this.session.events.push(event);

    // 超过上限时裁剪（保留最新的）
    if (this.session.events.length > this.config.maxEvents) {
      this.session.events = this.session.events.slice(-this.config.maxEvents);
    }

    if (this.config.consoleOutput) {
      this.printEvent(event);
    }

    return event;
  }

  // 便捷方法

  traceLLMCall(model: string, messageCount: number, toolCount: number): void {
    this.record('llm_call', { model, messageCount, toolCount });
  }

  traceLLMResponse(content: string, toolCalls: number, duration: number): void {
    this.record('llm_response', {
      contentLength: content.length,
      toolCallCount: toolCalls,
      duration,
    });
  }

  traceToolCall(name: string, args: Record<string, unknown>): void {
    this.record('tool_call', { toolName: name, args });
  }

  traceToolResult(name: string, success: boolean, outputLength: number, duration: number): void {
    this.record('tool_result', {
      toolName: name,
      success,
      outputLength,
      duration,
    });
  }

  traceStateChange(from: string, to: string, reason?: string): void {
    this.record('state_change', { from, to, reason });
  }

  tracePhaseAdvance(from: string, to: string): void {
    this.record('phase_advance', { from, to });
  }

  traceError(error: Error, context?: string): void {
    this.record('error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
    }, ['error']);
  }

  traceRetry(attempt: number, maxAttempts: number, error: string, delay: number): void {
    this.record('retry', { attempt, maxAttempts, error, delay }, ['retry']);
  }

  traceWarning(message: string, context?: Record<string, unknown>): void {
    this.record('warning', { message, ...context }, ['warning']);
  }

  // 设置元数据
  setMetadata(key: string, value: unknown): void {
    this.session.metadata[key] = value;
  }

  // 获取当前会话数据
  getSession(): TraceSession {
    return { ...this.session };
  }

  // 获取统计信息
  getStats(): TraceStats {
    const events = this.session.events;
    const toolCalls = events.filter(e => e.type === 'tool_call');
    const toolResults = events.filter(e => e.type === 'tool_result');
    const errors = events.filter(e => e.type === 'error');
    const retries = events.filter(e => e.type === 'retry');
    const llmCalls = events.filter(e => e.type === 'llm_call');

    const successfulTools = toolResults.filter(e => e.data.success === true);
    const failedTools = toolResults.filter(e => e.data.success === false);

    const totalDuration = this.session.endedAt
      ? new Date(this.session.endedAt).getTime() - new Date(this.session.startedAt).getTime()
      : Date.now() - this.startTime;

    return {
      totalEvents: events.length,
      llmCallCount: llmCalls.length,
      toolCallCount: toolCalls.length,
      toolSuccessCount: successfulTools.length,
      toolFailCount: failedTools.length,
      errorCount: errors.length,
      retryCount: retries.length,
      totalDuration,
      toolSuccessRate: toolResults.length > 0
        ? successfulTools.length / toolResults.length
        : 0,
    };
  }

  // 结束会话
  end(): void {
    this.session.endedAt = new Date().toISOString();

    if (this.config.persistToDisk) {
      this.persist();
    }
  }

  // 持久化到磁盘
  private persist(): void {
    if (!existsSync(this.config.dir)) {
      mkdirSync(this.config.dir, { recursive: true });
    }

    const filename = `trace-${this.session.sessionId}.json`;
    const filepath = join(this.config.dir, filename);

    try {
      writeFileSync(filepath, JSON.stringify(this.session, null, 2), 'utf-8');
    } catch {
      // 持久化失败不影响主流程
    }
  }

  // 创建事件对象
  private createEvent(
    type: TraceEventType,
    data: Record<string, unknown>,
    tags?: string[]
  ): TraceEvent {
    this.eventCounter++;
    return {
      id: `${this.session.sessionId}-${this.eventCounter}`,
      type,
      timestamp: new Date().toISOString(),
      elapsed: Date.now() - this.startTime,
      data,
      tags,
    };
  }

  // 控制台输出（调试用）
  private printEvent(event: TraceEvent): void {
    const elapsed = (event.elapsed / 1000).toFixed(2);
    const prefix = `[Trace ${elapsed}s]`;
    const dataStr = JSON.stringify(event.data, null, 0);
    console.log(`${prefix} ${event.type}: ${dataStr}`);
  }
}

// ---- 统计类型 ----

export interface TraceStats {
  totalEvents: number;
  llmCallCount: number;
  toolCallCount: number;
  toolSuccessCount: number;
  toolFailCount: number;
  errorCount: number;
  retryCount: number;
  totalDuration: number; // ms
  toolSuccessRate: number; // 0-1
}

// ---- 全局实例（可选） ----

let globalTracer: Tracer | null = null;

export function getTracer(): Tracer | null {
  return globalTracer;
}

export function initTracer(sessionId: string, config?: Partial<TraceConfig>): Tracer {
  globalTracer = new Tracer(sessionId, config);
  return globalTracer;
}

export function clearTracer(): void {
  if (globalTracer) {
    globalTracer.end();
    globalTracer = null;
  }
}
