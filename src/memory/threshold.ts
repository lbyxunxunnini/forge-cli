import type { MemoryEntry, MemoryType, WriteThreshold, DEFAULT_THRESHOLD } from './types.js';
import { DEFAULT_THRESHOLD as DEFAULTS } from './types.js';

// ---- 写入门槛检查 ----

export interface ThresholdCheck {
  allowed: boolean;
  reason: string;
  confidence: number;
  suggestions: string[];
}

/**
 * 判断一条记忆是否值得写入
 */
export function checkThreshold(
  name: string,
  type: MemoryType,
  content: string,
  existingEntries: MemoryEntry[],
  config?: Partial<WriteThreshold>
): ThresholdCheck {
  const threshold = { ...DEFAULTS, ...config };
  const suggestions: string[] = [];
  let confidence = 0.5; // 基础置信度

  // 1. 内容长度检查 — 太短的内容通常没价值
  if (content.trim().length < 10) {
    return {
      allowed: false,
      reason: '内容太短，不值得作为长期记忆',
      confidence: 0,
      suggestions: ['请提供更详细的信息'],
    };
  }

  // 2. 一次性内容检测
  const oneTimePatterns = [
    /^(帮我|请|现在|马上|立刻|赶紧)/,
    /^(运行|执行|启动|停止|重启)/,
    /^(查看|显示|列出|打印)/,
    /一下$/,
    /看看$/,
  ];
  for (const pattern of oneTimePatterns) {
    if (pattern.test(content.trim())) {
      confidence -= 0.3;
      suggestions.push('这看起来是一次性指令，不适合作为长期记忆');
    }
  }

  // 3. 稳定性判断 — 是否有重复内容
  const similarCount = countSimilarEntries(content, existingEntries);
  if (similarCount >= threshold.minOccurrences) {
    confidence += 0.3;
  } else if (similarCount >= 1) {
    confidence += 0.1;
    suggestions.push('已有类似记忆，建议合并而非新建');
  }

  // 4. 类型权重
  const typeWeights: Record<MemoryType, number> = {
    user: 0.2,      // 用户偏好通常稳定
    project: 0.15,   // 项目知识较稳定
    feedback: 0.1,   // 反馈可能变化
    reference: 0.1,  // 参考资料较稳定
  };
  confidence += typeWeights[type] || 0;

  // 5. 信息密度检查 — 关键词越多越有价值
  const keywords = extractKeywords(content);
  if (keywords.length >= 3) {
    confidence += 0.15;
  } else if (keywords.length <= 1) {
    confidence -= 0.1;
    suggestions.push('信息密度较低，建议补充更多细节');
  }

  // 6. 特殊标记 — 用户明确说"记住"时提高置信度
  const explicitRemember = [
    /记住/,
    /记下/,
    /以后/,
    /每次都/,
    /总是/,
    /不要/,
    /不喜欢/,
    /偏好/,
  ];
  for (const pattern of explicitRemember) {
    if (pattern.test(content)) {
      confidence += 0.2;
      break;
    }
  }

  // 7. 数量上限检查
  if (existingEntries.length >= threshold.maxEntries) {
    return {
      allowed: true,
      reason: `记忆已满（${existingEntries.length}/${threshold.maxEntries}），将触发压缩`,
      confidence: Math.max(0, Math.min(1, confidence)),
      suggestions: ['建议先压缩或清理旧记忆'],
    };
  }

  // 归一化置信度
  confidence = Math.max(0, Math.min(1, confidence));

  // 最终判断
  const allowed = confidence >= threshold.minConfidence;

  return {
    allowed,
    reason: allowed
      ? `置信度 ${confidence.toFixed(2)} >= ${threshold.minConfidence}，允许写入`
      : `置信度 ${confidence.toFixed(2)} < ${threshold.minConfidence}，建议标记为不稳定`,
    confidence,
    suggestions,
  };
}

/**
 * 计算相似记忆数量
 */
function countSimilarEntries(content: string, entries: MemoryEntry[]): number {
  const contentLower = content.toLowerCase();
  const contentKeywords = extractKeywords(content);

  let count = 0;
  for (const entry of entries) {
    const entryLower = entry.content.toLowerCase();

    // 精确子串匹配
    if (entryLower.includes(contentLower) || contentLower.includes(entryLower)) {
      count++;
      continue;
    }

    // 关键词重叠度
    const entryKeywords = extractKeywords(entry.content);
    const overlap = contentKeywords.filter(k => entryKeywords.includes(k));
    if (overlap.length >= Math.min(contentKeywords.length, entryKeywords.length) * 0.6) {
      count++;
    }
  }

  return count;
}

/**
 * 提取关键词
 */
function extractKeywords(text: string): string[] {
  // 移除常见停用词
  const stopWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
  ]);

  // 分词（简单按空格和标点分割）
  const words = text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  // 去重
  return [...new Set(words)];
}

/**
 * 计算置信度（供外部调用）
 */
export function calculateConfidence(
  content: string,
  existingEntries: MemoryEntry[],
  occurrenceCount: number = 1
): number {
  let confidence = 0.5;

  // 出现次数加成
  confidence += Math.min(0.3, occurrenceCount * 0.1);

  // 关键词密度
  const keywords = extractKeywords(content);
  if (keywords.length >= 3) confidence += 0.15;

  // 明确记忆标记
  if (/记住|记下|以后|每次都|总是/.test(content)) {
    confidence += 0.2;
  }

  // 一次性内容惩罚
  if (/^(帮我|请|现在|马上|运行|执行)/.test(content.trim())) {
    confidence -= 0.2;
  }

  return Math.max(0, Math.min(1, confidence));
}
