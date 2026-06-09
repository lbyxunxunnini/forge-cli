import type { MemoryEntry, MemoryType, CompressResult } from './types.js';

/**
 * 压缩记忆列表
 * - 合并同类型相似记忆
 * - 淘汰过期/低价值记忆
 * - 生成压缩摘要
 */
export function compressMemories(
  entries: MemoryEntry[],
  options?: {
    maxEntries?: number;
    expireDays?: number;
    minAccessCount?: number;
  }
): CompressResult {
  const maxEntries = options?.maxEntries || 100;
  const expireDays = options?.expireDays || 30;
  const minAccessCount = options?.minAccessCount || 0;

  const removed: string[] = [];
  let compressed = [...entries];

  // 第一步：淘汰过期记忆
  compressed = expireOldMemories(compressed, expireDays, removed);

  // 第二步：淘汰低价值记忆（从未被访问且置信度低）
  compressed = expireLowValueMemories(compressed, minAccessCount, removed);

  // 第三步：合并同类型相似记忆
  compressed = mergeSimilarMemories(compressed, removed);

  // 第四步：如果仍然超限，按优先级淘汰
  if (compressed.length > maxEntries) {
    compressed = evictByPriority(compressed, maxEntries, removed);
  }

  // 生成摘要
  const summary = generateCompressSummary(entries.length, compressed.length, removed);

  return { compressed, removed, summary };
}

/**
 * 淘汰过期记忆
 */
function expireOldMemories(
  entries: MemoryEntry[],
  expireDays: number,
  removed: string[]
): MemoryEntry[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - expireDays);

  return entries.filter(entry => {
    const lastAccess = new Date(entry.lastAccessedAt || entry.updatedAt);
    if (lastAccess < cutoff && entry.accessCount === 0) {
      removed.push(entry.name);
      return false;
    }
    return true;
  });
}

/**
 * 淘汰低价值记忆
 */
function expireLowValueMemories(
  entries: MemoryEntry[],
  minAccessCount: number,
  removed: string[]
): MemoryEntry[] {
  return entries.filter(entry => {
    // 不稳定且从未被访问 → 淘汰
    if (!entry.stable && entry.accessCount < minAccessCount && entry.confidence < 0.4) {
      removed.push(entry.name);
      return false;
    }
    return true;
  });
}

/**
 * 合并同类型相似记忆
 */
function mergeSimilarMemories(
  entries: MemoryEntry[],
  removed: string[]
): MemoryEntry[] {
  const merged: MemoryEntry[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < entries.length; i++) {
    if (processed.has(entries[i].name)) continue;

    let current = entries[i];
    const similar: MemoryEntry[] = [];

    // 找同类型的相似记忆
    for (let j = i + 1; j < entries.length; j++) {
      if (processed.has(entries[j].name)) continue;
      if (entries[j].type !== current.type) continue;

      const similarity = calculateContentSimilarity(current.content, entries[j].content);
      if (similarity > 0.5) {
        similar.push(entries[j]);
      }
    }

    // 如果有相似的，合并
    if (similar.length > 0) {
      const toMerge = [current, ...similar];
      current = mergeEntries(toMerge);

      // 标记被合并的
      for (const entry of similar) {
        processed.add(entry.name);
        removed.push(entry.name);
      }
    }

    processed.add(current.name);
    merged.push(current);
  }

  return merged;
}

/**
 * 按优先级淘汰
 */
function evictByPriority(
  entries: MemoryEntry[],
  maxEntries: number,
  removed: string[]
): MemoryEntry[] {
  // 计算优先级分数
  const scored = entries.map(entry => ({
    entry,
    score: calculatePriorityScore(entry),
  }));

  // 按分数降序排序
  scored.sort((a, b) => b.score - a.score);

  // 保留高优先级的
  const kept = scored.slice(0, maxEntries);
  const evicted = scored.slice(maxEntries);

  for (const { entry } of evicted) {
    removed.push(entry.name);
  }

  return kept.map(s => s.entry);
}

/**
 * 计算记忆优先级分数
 */
function calculatePriorityScore(entry: MemoryEntry): number {
  let score = 0;

  // 置信度权重（40%）
  score += entry.confidence * 40;

  // 访问频率权重（30%）
  score += Math.min(30, entry.accessCount * 5);

  // 稳定性权重（15%）
  score += entry.stable ? 15 : 0;

  // 类型权重（15%）
  const typeWeights: Record<MemoryType, number> = {
    user: 15,
    project: 12,
    feedback: 10,
    reference: 8,
  };
  score += typeWeights[entry.type] || 5;

  return score;
}

/**
 * 合并多条记忆为一条
 */
function mergeEntries(entries: MemoryEntry[]): MemoryEntry {
  // 取最新的作为基础
  const sorted = [...entries].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const base = sorted[0];

  // 合并内容（去重）
  const allLines = entries.flatMap(e => e.content.split('\n').filter(l => l.trim()));
  const uniqueLines = [...new Set(allLines)];
  const mergedContent = uniqueLines.join('\n');

  // 合并标签
  const allTags = [...new Set(entries.flatMap(e => e.tags || []))];

  // 取最高置信度
  const maxConfidence = Math.max(...entries.map(e => e.confidence));

  // 累加访问次数
  const totalAccess = entries.reduce((sum, e) => sum + e.accessCount, 0);

  return {
    ...base,
    content: mergedContent,
    tags: allTags,
    confidence: maxConfidence,
    accessCount: totalAccess,
    updatedAt: new Date().toISOString(),
    source: 'merge' as const,
  };
}

/**
 * 计算内容相似度（简化版）
 */
function calculateContentSimilarity(content1: string, content2: string): number {
  const words1 = new Set(content1.toLowerCase().split(/\s+/).filter(w => w.length > 1));
  const words2 = new Set(content2.toLowerCase().split(/\s+/).filter(w => w.length > 1));

  if (words1.size === 0 || words2.size === 0) return 0;

  let overlap = 0;
  for (const word of words1) {
    if (words2.has(word)) overlap++;
  }

  const union = new Set([...words1, ...words2]).size;
  return overlap / union;
}

/**
 * 生成压缩摘要
 */
function generateCompressSummary(before: number, after: number, removed: string[]): string {
  const diff = before - after;
  if (diff === 0) {
    return `记忆数量 ${before} 条，无需压缩`;
  }

  return `压缩完成：${before} → ${after} 条（减少 ${diff} 条）。移除项：${removed.join('、')}`;
}
