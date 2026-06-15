import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import { createHash } from 'crypto';
import type { ContextMessage } from '../llm/context.js';

export interface ExportedMemory {
  id: string;
  timestamp: number;
  model: string;
  messageCount: number;
  tokenEstimate: number;
  filePath: string;
  summary?: string;
  type?: 'session' | 'summary';
}

interface ExportMeta {
  id: string;
  timestamp: number;
  model: string;
  messageCount: number;
  tokenEstimate: number;
  summary?: string;
}

export class ProjectMemoryManager {
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd();
  }

  private get forgeDir(): string {
    return join(this.projectRoot, '.forge');
  }

  private get memoryDir(): string {
    return join(this.forgeDir, 'memory');
  }

  private ensureDir(): void {
    if (!existsSync(this.forgeDir)) {
      mkdirSync(this.forgeDir, { recursive: true });
    }
    if (!existsSync(this.memoryDir)) {
      mkdirSync(this.memoryDir, { recursive: true });
    }
  }

  // ─── 导出完整会话（用于 --resume 恢复）──────────────────────

  exportSession(messages: ContextMessage[], model: string, id?: string): ExportedMemory {
    this.ensureDir();

    const sessionId = id || this.generateId();
    const timestamp = Date.now();
    const tokenEstimate = messages.reduce((sum, m) => sum + (m.tokenEstimate || 0), 0);
    const summary = this.extractSummary(messages);

    const meta: ExportMeta = {
      id: sessionId,
      timestamp,
      model,
      messageCount: messages.length,
      tokenEstimate,
      summary,
    };

    const content = this.formatMarkdown(meta, messages);
    const filePath = join(this.memoryDir, `${sessionId}.md`);

    writeFileSync(filePath, content, 'utf-8');

    return {
      id: sessionId,
      timestamp,
      model,
      messageCount: messages.length,
      tokenEstimate,
      filePath,
      summary,
    };
  }

  // ─── 导出摘要（用于 /out-task 新会话参考）──────────────────

  exportSummary(messages: ContextMessage[], model: string): ExportedMemory {
    this.ensureDir();

    const id = this.generateId();
    const timestamp = Date.now();
    const tokenEstimate = messages.reduce((sum, m) => sum + (m.tokenEstimate || 0), 0);
    const summary = this.extractSummary(messages);

    // 只导出摘要和关键信息，不导出完整对话
    const meta: ExportMeta = {
      id,
      timestamp,
      model,
      messageCount: messages.length,
      tokenEstimate,
      summary,
    };

    const content = this.formatSummaryMarkdown(meta, messages);
    const filePath = join(this.memoryDir, `${id}.md`);

    writeFileSync(filePath, content, 'utf-8');

    return {
      id,
      timestamp,
      model,
      messageCount: messages.length,
      tokenEstimate,
      filePath,
      summary,
    };
  }

  // ─── 列表 ──────────────────────────────────────────────

  list(): ExportedMemory[] {
    if (!existsSync(this.memoryDir)) return [];

    const files = readdirSync(this.memoryDir).filter(f => f.endsWith('.md'));
    const entries: ExportedMemory[] = [];

    for (const file of files) {
      try {
        const filePath = join(this.memoryDir, file);
        const content = readFileSync(filePath, 'utf-8');
        const meta = this.parseMeta(content, filePath);
        if (meta) entries.push(meta);
      } catch {
        // 跳过损坏文件
      }
    }

    return entries.sort((a, b) => b.timestamp - a.timestamp);
  }

  // ─── 读取 ──────────────────────────────────────────────

  load(id: string): ContextMessage[] | null {
    const filePath = join(this.memoryDir, `${id}.md`);
    if (!existsSync(filePath)) return null;

    try {
      const content = readFileSync(filePath, 'utf-8');
      return this.parseMessages(content);
    } catch {
      return null;
    }
  }

  // ─── 删除 ──────────────────────────────────────────────

  delete(id: string): boolean {
    const filePath = join(this.memoryDir, `${id}.md`);
    if (!existsSync(filePath)) return false;

    try {
      unlinkSync(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // ─── 内部方法 ──────────────────────────────────────────

  private generateId(): string {
    const now = Date.now().toString();
    const rand = Math.random().toString(36).slice(2, 8);
    return createHash('md5').update(`${now}-${rand}`).digest('hex').slice(0, 8);
  }

  private extractSummary(messages: ContextMessage[]): string {
    // 取前 3 条用户消息作为摘要
    const userMsgs = messages
      .filter(m => m.role === 'user')
      .slice(0, 3)
      .map(m => m.content.slice(0, 60));

    return userMsgs.join(' | ') || '无摘要';
  }

  private formatMarkdown(meta: ExportMeta, messages: ContextMessage[]): string {
    const lines: string[] = [
      '---',
      `id: ${meta.id}`,
      `timestamp: ${meta.timestamp}`,
      `model: ${meta.model}`,
      `messageCount: ${meta.messageCount}`,
      `tokenEstimate: ${meta.tokenEstimate}`,
      `summary: "${meta.summary || ''}"`,
      `type: session`,
      '---',
      '',
      `# 会话记忆 ${meta.id}`,
      '',
      `导出时间: ${new Date(meta.timestamp).toLocaleString('zh-CN')}`,
      `模型: ${meta.model}`,
      `消息数: ${meta.messageCount}`,
      `估算 Token: ~${meta.tokenEstimate}`,
      '',
      '## 对话内容',
      '',
    ];

    for (const msg of messages) {
      const roleLabel = msg.role === 'user' ? '用户' : msg.role === 'assistant' ? '助手' : msg.role === 'system' ? '系统' : '工具';
      lines.push(`### [${roleLabel}]`);
      lines.push('');
      lines.push(msg.content);
      lines.push('');
    }

    return lines.join('\n');
  }

  private formatSummaryMarkdown(meta: ExportMeta, messages: ContextMessage[]): string {
    const lines: string[] = [
      '---',
      `id: ${meta.id}`,
      `timestamp: ${meta.timestamp}`,
      `model: ${meta.model}`,
      `messageCount: ${meta.messageCount}`,
      `tokenEstimate: ${meta.tokenEstimate}`,
      `summary: "${meta.summary || ''}"`,
      `type: summary`,
      '---',
      '',
      `# 会话摘要 ${meta.id}`,
      '',
      `导出时间: ${new Date(meta.timestamp).toLocaleString('zh-CN')}`,
      `模型: ${meta.model}`,
      `消息数: ${meta.messageCount}`,
      `估算 Token: ~${meta.tokenEstimate}`,
      '',
      '## 摘要',
      '',
      meta.summary || '无摘要',
      '',
      '## 关键对话',
      '',
    ];

    // 只保留关键对话：用户问题和助手最终回答
    const userMsgs = messages.filter(m => m.role === 'user');
    const assistantMsgs = messages.filter(m => m.role === 'assistant');

    if (userMsgs.length > 0) {
      lines.push('### 用户问题');
      lines.push('');
      for (const msg of userMsgs.slice(0, 5)) {
        lines.push(`- ${msg.content.slice(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
      }
      lines.push('');
    }

    if (assistantMsgs.length > 0) {
      lines.push('### 助手回答');
      lines.push('');
      // 取最后一条助手回答作为总结
      const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
      lines.push(lastAssistant.content.slice(0, 500) + (lastAssistant.content.length > 500 ? '...' : ''));
      lines.push('');
    }

    return lines.join('\n');
  }

  private parseMeta(content: string, filePath: string): ExportedMemory | null {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const yaml = match[1];
    const get = (key: string): string => {
      const m = yaml.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
      return m ? m[1].trim().replace(/^"|"$/g, '') : '';
    };

    const id = get('id');
    if (!id) return null;

    const type = get('type') as 'session' | 'summary' | undefined;

    return {
      id,
      timestamp: parseInt(get('timestamp')) || 0,
      model: get('model'),
      messageCount: parseInt(get('messageCount')) || 0,
      tokenEstimate: parseInt(get('tokenEstimate')) || 0,
      filePath,
      summary: get('summary'),
      type: type || 'session', // 默认为 session（兼容旧文件）
    };
  }

  private parseMessages(content: string): ContextMessage[] {
    const messages: ContextMessage[] = [];
    const sectionMatch = content.match(/## 对话内容\n\n([\s\S]*)$/);
    if (!sectionMatch) return messages;

    const body = sectionMatch[1];
    const parts = body.split(/^### \[(.+?)\]\n\n/m);

    for (let i = 1; i < parts.length; i += 2) {
      const roleLabel = parts[i];
      const msgContent = parts[i + 1]?.trim() || '';

      let role: 'user' | 'assistant' | 'system' | 'tool';
      switch (roleLabel) {
        case '用户': role = 'user'; break;
        case '助手': role = 'assistant'; break;
        case '系统': role = 'system'; break;
        default: role = 'tool'; break;
      }

      if (msgContent) {
        messages.push({ role, content: msgContent });
      }
    }

    return messages;
  }
}

export const projectMemoryManager = new ProjectMemoryManager();
