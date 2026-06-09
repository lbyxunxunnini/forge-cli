export { MemoryManager, memoryManager } from './manager.js';
export { checkThreshold, calculateConfidence } from './threshold.js';
export { detectDuplicate, mergeMemories } from './dedup.js';
export { compressMemories } from './compress.js';
export type {
  MemoryType, MemoryEntry, MemoryIndex,
  WriteThreshold, RecallOptions, RecallResult, CompressResult, DedupResult,
} from './types.js';
