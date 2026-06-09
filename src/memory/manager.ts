import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type {
  MemoryType, MemoryEntry, MemoryIndex,
  WriteThreshold, RecallOptions, RecallResult, CompressResult,
} from './types.js';
import { DEFAULT_THRESHOLD } from './types.js';
import { checkThreshold, calculateConfidence } from './threshold.js';
import { detectDuplicate, mergeMemories } from './dedup.js';
import { compressMemories } from './compress.js';

const MEMORY_DIR = join(homedir(), '.flutter-forge', 'memory');
const INDEX_FILE = join(MEMORY_DIR, 'MEMORY.md');

export class MemoryManager {
  private entries: Map<string, MemoryEntry> = new Map();
  private initialized = false;
  private threshold: WriteThreshold;

  constructor(config?: Partial<WriteThreshold>) {
    this.threshold = { ...DEFAULT_THRESHOLD, ...config };
  }

  // ─── 初始化 ────────────────────────────────────────────

  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (!existsSync(MEMORY_DIR)) {
      mkdirSync(MEMORY_DIR, { recursive: true });
    }

    const files = readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md') && f !== 'MEMORY.md');
    for (const file of files) {
      try {
        const filePath = join(MEMORY_DIR, file);
        const content = readFileSync(filePath, 'utf-8');
        const entry = this.parseMemoryFile(file, content);
        if (entry) {
          this.entries.set(entry.name, entry);
        }
      } catch {
        // 跳过损坏的文件
      }
    }
  }

  // ─── 查询 ──────────────────────────────────────────────

  getAll(): MemoryEntry[] {
    this.init();
    return Array.from(this.entries.values());
  }

  getByType(type: MemoryType): MemoryEntry[] {
    this.init();
    return this.getAll().filter(e => e.type === type);
  }

  get(name: string): MemoryEntry | undefined {
    this.init();
    return this.entries.get(name);
  }

  // ─── 召回（增强版） ────────────────────────────────────

  /**
   * 按需召回记忆
   * 支持：关键词匹配 + 类型过滤 + 标签过滤 + 置信度过滤 + 多种排序
   */
  recall(options: RecallOptions = {}): RecallResult[] {
    this.init();
    let entries = this.getAll();

    // 类型过滤
    if (options.type) {
      entries = entries.filter(e => e.type === options.type);
    }

    // 标签过滤
    if (options.tags && options.tags.length > 0) {
      entries = entries.filter(e =>
        e.tags && options.tags!.some(t => e.tags.includes(t))
      );
    }

    // 置信度过滤
    const minConf = options.minConfidence ?? 0;
    if (minConf > 0) {
      entries = entries.filter(e => e.confidence >= minConf);
    }

    // 计算相关性分数
    let results: RecallResult[] = entries.map(entry => {
      const score = this.calculateRelevanceScore(entry, options.query);
      return {
        entry,
        score,
        matchReason: this.getMatchReason(entry, options.query),
      };
    });

    // 排序
    switch (options.sortBy) {
      case 'recency':
        results.sort((a, b) =>
          new Date(b.entry.updatedAt).getTime() - new Date(a.entry.updatedAt).getTime()
        );
        break;
      case 'frequency':
        results.sort((a, b) => b.entry.accessCount - a.entry.accessCount);
        break;
      case 'relevance':
      default:
        results.sort((a, b) => b.score - a.score);
        break;
    }

    // 限制数量
    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    // 更新访问计数
    for (const result of results) {
      this.recordAccess(result.entry.name);
    }

    return results;
  }

  /**
   * 简单搜索（向后兼容）
   */
  search(query: string): MemoryEntry[] {
    return this.recall({ query, sortBy: 'relevance' }).map(r => r.entry);
  }

  /**
   * 计算相关性分数
   */
  private calculateRelevanceScore(entry: MemoryEntry, query?: string): number {
    if (!query) {
      // 无查询时按置信度和访问频率排序
      return entry.confidence * 0.7 + Math.min(0.3, entry.accessCount * 0.05);
    }

    const queryLower = query.toLowerCase();
    const contentLower = entry.content.toLowerCase();
    const nameLower = entry.name.toLowerCase();
    const descLower = entry.description.toLowerCase();

    let score = 0;

    // 名称匹配（权重最高）
    if (nameLower.includes(queryLower)) score += 0.4;

    // 描述匹配
    if (descLower.includes(queryLower)) score += 0.2;

    // 内容匹配
    if (contentLower.includes(queryLower)) score += 0.2;

    // 关键词匹配
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
    const matchedWords = queryWords.filter(w =>
      contentLower.includes(w) || nameLower.includes(w) || descLower.includes(w)
    );
    if (queryWords.length > 0) {
      score += (matchedWords.length / queryWords.length) * 0.2;
    }

    // 置信度加权
    score *= (0.5 + entry.confidence * 0.5);

    return Math.min(1, score);
  }

  /**
   * 获取匹配原因
   */
  private getMatchReason(entry: MemoryEntry, query?: string): string {
    if (!query) return '默认排序';

    const queryLower = query.toLowerCase();
    const reasons: string[] = [];

    if (entry.name.toLowerCase().includes(queryLower)) reasons.push('名称匹配');
    if (entry.description.toLowerCase().includes(queryLower)) reasons.push('描述匹配');
    if (entry.content.toLowerCase().includes(queryLower)) reasons.push('内容匹配');

    return reasons.length > 0 ? reasons.join('+') : '关键词匹配';
  }

  /**
   * 记录访问
   */
  private recordAccess(name: string): void {
    const entry = this.entries.get(name);
    if (entry) {
      entry.accessCount++;
      entry.lastAccessedAt = new Date().toISOString();
      this.saveEntryFile(entry);
    }
  }

  // ─── 写入（增强版） ────────────────────────────────────

  /**
   * 带门槛检查的写入
   */
  save(name: string, type: MemoryType, description: string, content: string): {
    entry: MemoryEntry | null;
    action: 'created' | 'merged' | 'skipped' | 'blocked';
    message: string;
  } {
    this.init();

    // 1. 写入门槛检查
    const thresholdResult = checkThreshold(name, type, content, this.getAll(), this.threshold);

    // 2. 去重检查
    const dedupResult = detectDuplicate(name, content, this.getAll());

    // 3. 根据检查结果决定行为
    if (dedupResult.action === 'skip') {
      return {
        entry: null,
        action: 'skipped',
        message: `与记忆 "${dedupResult.duplicateOf}" 高度重复（${(dedupResult.similarity! * 100).toFixed(0)}%），跳过`,
      };
    }

    if (dedupResult.action === 'merge' && dedupResult.duplicateOf) {
      const existing = this.entries.get(dedupResult.duplicateOf);
      if (existing) {
        const merged = mergeMemories(existing, content);
        Object.assign(existing, merged);
        this.saveEntryFile(existing);
        this.updateIndex();

        return {
          entry: existing,
          action: 'merged',
          message: `已合并到记忆 "${dedupResult.duplicateOf}"（相似度 ${(dedupResult.similarity! * 100).toFixed(0)}%）`,
        };
      }
    }

    // 4. 创建新记忆
    const confidence = thresholdResult.confidence;
    const stable = confidence >= this.threshold.minConfidence;

    const entry = this.createEntry(name, type, description, content, confidence, stable);

    // 5. 如果记忆满了，先压缩
    if (this.entries.size >= this.threshold.maxEntries) {
      this.autoCompress();
    }

    this.entries.set(name, entry);
    this.saveEntryFile(entry);
    this.updateIndex();

    return {
      entry,
      action: 'created',
      message: stable
        ? `已保存（置信度 ${confidence.toFixed(2)}，稳定）`
        : `已保存为不稳定记忆（置信度 ${confidence.toFixed(2)}），需要更多验证`,
    };
  }

  /**
   * 直接写入（跳过门槛检查，用于用户明确要求的记忆）
   */
  saveDirect(name: string, type: MemoryType, description: string, content: string): MemoryEntry {
    this.init();

    const existing = this.entries.get(name);
    if (existing) {
      // 更新已有记忆
      existing.content = content;
      existing.description = description;
      existing.updatedAt = new Date().toISOString();
      existing.confidence = 1.0; // 用户明确要求 → 最高置信度
      existing.stable = true;
      this.saveEntryFile(existing);
      this.updateIndex();
      return existing;
    }

    const entry = this.createEntry(name, type, description, content, 1.0, true);
    this.entries.set(name, entry);
    this.saveEntryFile(entry);
    this.updateIndex();
    return entry;
  }

  // ─── 删除 ──────────────────────────────────────────────

  delete(name: string): boolean {
    this.init();
    const entry = this.entries.get(name);
    if (!entry) return false;

    try {
      if (existsSync(entry.filePath)) {
        unlinkSync(entry.filePath);
      }
    } catch {
      // 忽略删除错误
    }

    this.entries.delete(name);
    this.updateIndex();
    return true;
  }

  // ─── 压缩 ──────────────────────────────────────────────

  /**
   * 手动触发压缩
   */
  compress(options?: { maxEntries?: number; expireDays?: number }): CompressResult {
    this.init();
    const result = compressMemories(this.getAll(), {
      maxEntries: options?.maxEntries || this.threshold.maxEntries,
      expireDays: options?.expireDays || 30,
    });

    // 应用压缩结果
    this.applyCompressResult(result);
    return result;
  }

  /**
   * 自动压缩（写入时触发）
   */
  private autoCompress(): void {
    const result = compressMemories(this.getAll(), {
      maxEntries: this.threshold.maxEntries - 10, // 留出空间
      expireDays: 30,
    });
    this.applyCompressResult(result);
  }

  /**
   * 应用压缩结果
   */
  private applyCompressResult(result: CompressResult): void {
    // 清理被移除的记忆文件
    for (const name of result.removed) {
      const entry = this.entries.get(name);
      if (entry && existsSync(entry.filePath)) {
        try {
          unlinkSync(entry.filePath);
        } catch {
          // 忽略
        }
      }
      this.entries.delete(name);
    }

    // 更新保留的记忆
    for (const entry of result.compressed) {
      this.entries.set(entry.name, entry);
      this.saveEntryFile(entry);
    }

    this.updateIndex();
  }

  // ─── 内部方法 ──────────────────────────────────────────

  private createEntry(
    name: string,
    type: MemoryType,
    description: string,
    content: string,
    confidence: number,
    stable: boolean
  ): MemoryEntry {
    const fileName = `${type}_${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`;
    const filePath = join(MEMORY_DIR, fileName);
    const now = new Date().toISOString();

    return {
      name,
      description,
      type,
      content,
      filePath,
      createdAt: now,
      updatedAt: now,
      confidence,
      accessCount: 0,
      lastAccessedAt: now,
      tags: this.extractTags(content),
      source: 'user_input',
      stable,
    };
  }

  private extractTags(text: string): string[] {
    const tags: string[] = [];
    const patterns: [RegExp, string][] = [
      [/flutter/i, 'flutter'],
      [/dart/i, 'dart'],
      [/ios/i, 'ios'],
      [/android/i, 'android'],
      [/api/i, 'api'],
      [/数据库|database|sqlite/i, 'database'],
      [/状态管理|riverpod|bloc/i, 'state-management'],
      [/测试|test/i, 'testing'],
      [/ui|界面|布局/i, 'ui'],
      [/架构|architecture/i, 'architecture'],
    ];

    for (const [pattern, tag] of patterns) {
      if (pattern.test(text)) tags.push(tag);
    }

    return tags;
  }

  private saveEntryFile(entry: MemoryEntry): void {
    const fileContent = [
      '---',
      `name: ${entry.name}`,
      `description: ${entry.description}`,
      `type: ${entry.type}`,
      `confidence: ${entry.confidence}`,
      `stable: ${entry.stable}`,
      `accessCount: ${entry.accessCount}`,
      `source: ${entry.source}`,
      `tags: [${entry.tags.join(', ')}]`,
      '---',
      '',
      entry.content,
    ].join('\n');

    writeFileSync(entry.filePath, fileContent, 'utf-8');
  }

  private updateIndex(): void {
    const lines = ['# MEMORY.md', '', '> 记忆系统索引，自动维护', ''];

    const byType: Record<MemoryType, MemoryEntry[]> = {
      user: [],
      project: [],
      feedback: [],
      reference: [],
    };

    for (const entry of this.entries.values()) {
      byType[entry.type].push(entry);
    }

    const typeLabels: Record<MemoryType, string> = {
      user: '用户信息',
      project: '项目信息',
      feedback: '用户反馈',
      reference: '参考资料',
    };

    for (const [type, entries] of Object.entries(byType)) {
      if (entries.length === 0) continue;
      lines.push(`## ${typeLabels[type as MemoryType]}`);
      for (const e of entries) {
        const file = e.filePath.split('/').pop() || e.filePath;
        const stableTag = e.stable ? '' : ' ⚠️';
        const confTag = ` [${(e.confidence * 100).toFixed(0)}%]`;
        lines.push(`- [${e.name}](${file}) — ${e.description}${confTag}${stableTag}`);
      }
      lines.push('');
    }

    writeFileSync(INDEX_FILE, lines.join('\n'), 'utf-8');
  }

  private parseMemoryFile(fileName: string, content: string): MemoryEntry | null {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return null;

    const metaStr = match[1];
    const body = match[2].trim();

    const name = metaStr.match(/name:\s*(.+)/)?.[1]?.trim() || fileName.replace('.md', '');
    const description = metaStr.match(/description:\s*(.+)/)?.[1]?.trim() || '';
    const type = (metaStr.match(/type:\s*(\w+)/)?.[1] || 'user') as MemoryType;
    const confidence = parseFloat(metaStr.match(/confidence:\s*([\d.]+)/)?.[1] || '0.5');
    const stable = metaStr.match(/stable:\s*(true|false)/)?.[1] === 'true';
    const accessCount = parseInt(metaStr.match(/accessCount:\s*(\d+)/)?.[1] || '0', 10);
    const source = (metaStr.match(/source:\s*(\w+)/)?.[1] || 'user_input') as MemoryEntry['source'];
    const tagsStr = metaStr.match(/tags:\s*\[(.+?)\]/)?.[1] || '';
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    return {
      name,
      description,
      type,
      content: body,
      filePath: join(MEMORY_DIR, fileName),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      confidence,
      accessCount,
      lastAccessedAt: new Date().toISOString(),
      tags,
      source,
      stable,
    };
  }

  // ─── 上下文注入 ────────────────────────────────────────

  getContextString(): string {
    this.init();
    if (this.entries.size === 0) return '';

    const lines: string[] = ['## 记忆系统'];

    // 用户记忆
    const userMemories = this.getByType('user');
    if (userMemories.length > 0) {
      lines.push('### 用户信息');
      for (const m of userMemories) {
        const stableTag = m.stable ? '' : ' [待验证]';
        lines.push(`- ${m.description}: ${m.content.split('\n')[0]}${stableTag}`);
      }
    }

    // 项目记忆
    const projectMemories = this.getByType('project');
    if (projectMemories.length > 0) {
      lines.push('### 项目信息');
      for (const m of projectMemories) {
        lines.push(`- ${m.description}: ${m.content.split('\n')[0]}`);
      }
    }

    // 反馈记忆
    const feedbackMemories = this.getByType('feedback');
    if (feedbackMemories.length > 0) {
      lines.push('### 用户反馈');
      for (const m of feedbackMemories) {
        lines.push(`- ${m.content.split('\n')[0]}`);
      }
    }

    return lines.join('\n');
  }

  // ─── 统计 ──────────────────────────────────────────────

  getStats(): {
    total: number;
    byType: Record<MemoryType, number>;
    stable: number;
    unstable: number;
    avgConfidence: number;
    totalAccess: number;
  } {
    this.init();
    const all = this.getAll();

    const byType: Record<MemoryType, number> = {
      user: 0, project: 0, feedback: 0, reference: 0,
    };

    let totalConfidence = 0;
    let totalAccess = 0;
    let stable = 0;

    for (const entry of all) {
      byType[entry.type]++;
      totalConfidence += entry.confidence;
      totalAccess += entry.accessCount;
      if (entry.stable) stable++;
    }

    return {
      total: all.length,
      byType,
      stable,
      unstable: all.length - stable,
      avgConfidence: all.length > 0 ? totalConfidence / all.length : 0,
      totalAccess,
    };
  }
}

export const memoryManager = new MemoryManager();
