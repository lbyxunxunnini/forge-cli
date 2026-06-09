export type MemoryType = 'user' | 'project' | 'feedback' | 'reference';

export interface MemoryEntry {
  name: string;
  description: string;
  type: MemoryType;
  content: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  // ---- 新增字段 ----
  confidence: number;       // 置信度 0-1，低于阈值不直接生效
  accessCount: number;      // 被召回次数
  lastAccessedAt: string;   // 最后召回时间
  tags: string[];           // 标签（用于分类和去重）
  source: string;           // 来源：'user_input' | 'inference' | 'merge'
  stable: boolean;          // 是否已验证为稳定记忆
}

export interface MemoryIndex {
  entries: Array<{
    name: string;
    file: string;
    type: MemoryType;
    description: string;
  }>;
}

// ---- 写入门槛 ----

export interface WriteThreshold {
  minConfidence: number;     // 最低置信度（低于此值标记为不稳定）
  minOccurrences: number;    // 最少出现次数才算稳定
  blockTypes: string[];      // 禁止写入的内容类型
  maxEntries: number;        // 最大记忆条数
}

export const DEFAULT_THRESHOLD: WriteThreshold = {
  minConfidence: 0.6,
  minOccurrences: 2,
  blockTypes: ['temporary', 'one_time'],
  maxEntries: 100,
};

// ---- 去重 ----

export interface DedupResult {
  isDuplicate: boolean;
  duplicateOf?: string;      // 重复的记忆名
  similarity?: number;       // 相似度 0-1
  action: 'skip' | 'merge' | 'create';
}

// ---- 压缩 ----

export interface CompressResult {
  compressed: MemoryEntry[];
  removed: string[];         // 被压缩掉的记忆名
  summary: string;           // 压缩摘要
}

// ---- 召回 ----

export interface RecallOptions {
  query?: string;            // 语义查询
  type?: MemoryType;         // 类型过滤
  tags?: string[];           // 标签过滤
  minConfidence?: number;    // 最低置信度
  limit?: number;            // 最大返回数
  sortBy?: 'relevance' | 'recency' | 'frequency';  // 排序方式
}

export interface RecallResult {
  entry: MemoryEntry;
  score: number;             // 相关性分数 0-1
  matchReason: string;       // 匹配原因
}
