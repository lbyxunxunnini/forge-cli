import { appendFileSync, readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { ContextMessage } from '../llm/context.js';

const LOG_DIR = join(homedir(), '.forge-cli', 'conversation-logs');
const LOG_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24小时

export interface LogEntry {
  timestamp: number;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  sessionId: string;
}

export class ConversationLog {
  private sessionId: string;
  private logPath: string;
  private buffer: LogEntry[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.logPath = join(LOG_DIR, `${sessionId}.jsonl`);
    this.ensureDir();
    this.cleanOldLogs();
    this.startAutoFlush();
  }

  private ensureDir(): void {
    if (!existsSync(LOG_DIR)) {
      mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  // 清理24小时前的日志
  private cleanOldLogs(): void {
    try {
      const files = readdirSync(LOG_DIR);
      const now = Date.now();

      for (const file of files) {
        if (!file.endsWith('.jsonl')) continue;
        const filePath = join(LOG_DIR, file);
        const stat = statSync(filePath);
        if (now - stat.mtimeMs > LOG_MAX_AGE_MS) {
          unlinkSync(filePath);
        }
      }
    } catch {
      // 忽略清理错误
    }
  }

  // 开始自动刷新
  private startAutoFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 5000); // 每5秒刷新一次
  }

  // 记录消息
  log(role: 'user' | 'assistant' | 'system' | 'tool', content: string): void {
    this.buffer.push({
      timestamp: Date.now(),
      role,
      content,
      sessionId: this.sessionId,
    });

    // 如果缓冲区积累太多，立即刷新
    if (this.buffer.length >= 10) {
      this.flush();
    }
  }

  // 刷新缓冲区到文件
  private flush(): void {
    if (this.buffer.length === 0) return;

    const lines = this.buffer.map(entry => JSON.stringify(entry)).join('\n') + '\n';
    appendFileSync(this.logPath, lines, 'utf-8');
    this.buffer = [];
  }

  // 加载日志
  load(): ContextMessage[] {
    if (!existsSync(this.logPath)) return [];

    try {
      const content = readFileSync(this.logPath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      const messages: ContextMessage[] = [];

      for (const line of lines) {
        try {
          const entry: LogEntry = JSON.parse(line);
          messages.push({
            role: entry.role,
            content: entry.content,
          });
        } catch {
          // 跳过损坏的行
        }
      }

      // 合并缓冲区中未写入的消息
      for (const entry of this.buffer) {
        messages.push({
          role: entry.role,
          content: entry.content,
        });
      }

      return messages;
    } catch {
      return [];
    }
  }

  // 停止自动刷新并清理
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    this.flush();
  }

  // 获取日志文件路径
  getPath(): string {
    return this.logPath;
  }

  // 静态方法：加载指定 session 的日志
  static loadSession(sessionId: string): ContextMessage[] {
    const logPath = join(LOG_DIR, `${sessionId}.jsonl`);
    if (!existsSync(logPath)) return [];

    try {
      const content = readFileSync(logPath, 'utf-8');
      const lines = content.trim().split('\n').filter(Boolean);
      const messages: ContextMessage[] = [];

      for (const line of lines) {
        try {
          const entry: LogEntry = JSON.parse(line);
          messages.push({
            role: entry.role,
            content: entry.content,
          });
        } catch {
          // 跳过损坏的行
        }
      }

      return messages;
    } catch {
      return [];
    }
  }

  // 静态方法：获取所有可用的 session ID
  static listSessions(): string[] {
    if (!existsSync(LOG_DIR)) return [];

    try {
      const files = readdirSync(LOG_DIR);
      return files
        .filter(f => f.endsWith('.jsonl'))
        .map(f => f.replace('.jsonl', ''));
    } catch {
      return [];
    }
  }
}

export const conversationLog = new ConversationLog('current');
