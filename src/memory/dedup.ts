import type { MemoryEntry, DedupResult } from './types.js';

/**
 * 检测新内容是否与已有记忆重复
 */
export function detectDuplicate(
  name: string,
  content: string,
  existingEntries: MemoryEntry[]
): DedupResult {
  if (existingEntries.length === 0) {
    return { isDuplicate: false, action: 'create' };
  }

  const contentLower = content.toLowerCase().trim();
  const contentKeywords = extractKeywords(contentLower);

  let bestMatch: MemoryEntry | null = null;
  let bestSimilarity = 0;

  for (const entry of existingEntries) {
    // 跳过同名条目（那是更新，不是重复）
    if (entry.name === name) continue;

    const similarity = calculateSimilarity(contentLower, entry.content.toLowerCase(), contentKeywords, entry);

    if (similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = entry;
    }
  }

  // 高度重复（>0.85）→ 跳过
  if (bestSimilarity > 0.85 && bestMatch) {
    return {
      isDuplicate: true,
      duplicateOf: bestMatch.name,
      similarity: bestSimilarity,
      action: 'skip',
    };
  }

  // 中度重复（>0.6）→ 合并
  if (bestSimilarity > 0.6 && bestMatch) {
    return {
      isDuplicate: true,
      duplicateOf: bestMatch.name,
      similarity: bestSimilarity,
      action: 'merge',
    };
  }

  // 不重复 → 创建
  return { isDuplicate: false, action: 'create' };
}

/**
 * 合并两条记忆
 */
export function mergeMemories(existing: MemoryEntry, newContent: string): Partial<MemoryEntry> {
  const existingLines = existing.content.split('\n').filter(l => l.trim());
  const newLines = newContent.split('\n').filter(l => l.trim());

  // 去重合并
  const mergedSet = new Set([...existingLines, ...newLines]);
  const mergedContent = Array.from(mergedSet).join('\n');

  // 取更高的置信度
  return {
    content: mergedContent,
    updatedAt: new Date().toISOString(),
    confidence: Math.min(1, existing.confidence + 0.1), // 合并后置信度略升
    source: 'merge' as const,
  };
}

/**
 * 计算两段内容的相似度
 */
function calculateSimilarity(
  content1: string,
  content2: string,
  keywords1: string[],
  entry2: MemoryEntry
): number {
  // 1. 精确子串匹配
  if (content1 === content2) return 1.0;
  if (content2.includes(content1) || content1.includes(content2)) return 0.9;

  // 2. 关键词重叠度
  const keywords2 = extractKeywords(content2);
  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  const overlap = keywords1.filter(k => keywords2.includes(k));
  const unionSize = new Set([...keywords1, ...keywords2]).size;
  const jaccardSimilarity = overlap.length / unionSize;

  // 3. 标签重叠度
  let tagBonus = 0;
  if (entry2.tags && entry2.tags.length > 0) {
    const content1Tags = extractTags(content1);
    const tagOverlap = content1Tags.filter(t => entry2.tags.includes(t));
    if (tagOverlap.length > 0) {
      tagBonus = 0.1;
    }
  }

  // 4. 类型相同加分
  const typeBonus = 0.05;

  return Math.min(1, jaccardSimilarity + tagBonus + typeBonus);
}

/**
 * 提取关键词（与 threshold.ts 共用逻辑）
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));
}

/**
 * 从内容中提取隐式标签
 */
function extractTags(text: string): string[] {
  const tags: string[] = [];
  const patterns: [RegExp, string][] = [
    [/flutter/i, 'flutter'],
    [/dart/i, 'dart'],
    [/ios/i, 'ios'],
    [/android/i, 'android'],
    [/react\s*native/i, 'react-native'],
    [/api/i, 'api'],
    [/数据库|database|sqlite|supabase/i, 'database'],
    [/状态管理|state\s*management|riverpod|bloc|provider/i, 'state-management'],
    [/测试|test/i, 'testing'],
    [/部署|deploy|ci\/cd/i, 'deployment'],
    [/性能|performance/i, 'performance'],
    [/安全|security/i, 'security'],
    [/ui|界面|布局|layout/i, 'ui'],
    [/架构|architecture/i, 'architecture'],
  ];

  for (const [pattern, tag] of patterns) {
    if (pattern.test(text)) tags.push(tag);
  }

  return tags;
}
