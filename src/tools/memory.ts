import { memoryManager } from '../memory/manager.js';
import type { MemoryType } from '../memory/types.js';
import type { Tool, ToolResult } from './types.js';

export const saveMemoryTool: Tool = {
  definition: {
    name: 'save_memory',
    description: '保存记忆到跨会话持久化存储。用于记住用户偏好、项目知识、重要决策等。',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '记忆名称（简短标识，如 user_role、project_arch）',
        },
        type: {
          type: 'string',
          description: '记忆类型：user（用户信息）、project（项目信息）、feedback（反馈纠正）、reference（参考资料）',
        },
        description: {
          type: 'string',
          description: '一行描述，用于索引和检索',
        },
        content: {
          type: 'string',
          description: '记忆内容（Markdown 格式）',
        },
      },
      required: ['name', 'type', 'description', 'content'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { name, type, description, content } = args;

    if (!name || !type || !description || !content) {
      return { success: false, output: '', error: '缺少必填参数' };
    }

    const validTypes: MemoryType[] = ['user', 'project', 'feedback', 'reference'];
    if (!validTypes.includes(type as MemoryType)) {
      return { success: false, output: '', error: `无效的记忆类型: ${type}，可选: ${validTypes.join(', ')}` };
    }

    try {
      const result = memoryManager.save(name, type as MemoryType, description, content);
      if (result.action === 'blocked' || result.action === 'skipped') {
        return { success: true, output: result.message };
      }
      return {
        success: true,
        output: result.message,
      };
    } catch (error: unknown) {
      return { success: false, output: '', error: `保存失败: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
};

export const readMemoryTool: Tool = {
  definition: {
    name: 'read_memory',
    description: '读取记忆。可按名称、类型搜索，或列出所有记忆。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索关键词（可选，不填则列出所有记忆索引）',
        },
        type: {
          type: 'string',
          description: '按类型过滤：user、project、feedback、reference（可选）',
        },
        name: {
          type: 'string',
          description: '按名称精确读取（可选）',
        },
      },
      required: [],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { query, type, name } = args;

    try {
      // 精确读取
      if (name) {
        const entry = memoryManager.get(name);
        if (!entry) {
          return { success: false, output: '', error: `记忆不存在: ${name}` };
        }
        const stableTag = entry.stable ? '✓ 稳定' : '⚠️ 待验证';
        const confPct = (entry.confidence * 100).toFixed(0);
        return {
          success: true,
          output: `# ${entry.name}\n\n**类型**: ${entry.type} | **描述**: ${entry.description} | **置信度**: ${confPct}% | ${stableTag} | **访问次数**: ${entry.accessCount}\n\n${entry.content}`,
        };
      }

      // 按类型过滤
      if (type) {
        const entries = memoryManager.getByType(type as MemoryType);
        if (entries.length === 0) {
          return { success: true, output: `无 ${type} 类型的记忆` };
        }
        const lines = entries.map(e => {
          const stableTag = e.stable ? '✓' : '⚠️';
          return `- ${stableTag} **${e.name}** [${(e.confidence * 100).toFixed(0)}%]: ${e.description}`;
        });
        return { success: true, output: lines.join('\n') };
      }

      // 搜索（使用增强召回）
      if (query) {
        const results = memoryManager.recall({ query, limit: 10 });
        if (results.length === 0) {
          return { success: true, output: `未找到与 "${query}" 相关的记忆` };
        }
        const lines = results.map(r => {
          const e = r.entry;
          const stableTag = e.stable ? '✓' : '⚠️';
          return `- ${stableTag} **${e.name}** (${e.type}) [${(r.score * 100).toFixed(0)}%]: ${e.description} — ${r.matchReason}`;
        });
        return { success: true, output: lines.join('\n') };
      }

      // 列出所有
      const entries = memoryManager.getAll();
      if (entries.length === 0) {
        return { success: true, output: '暂无记忆' };
      }
      const lines = entries.map(e => {
        const stableTag = e.stable ? '✓' : '⚠️';
        return `- ${stableTag} **${e.name}** (${e.type}) [${(e.confidence * 100).toFixed(0)}%]: ${e.description}`;
      });
      const stats = memoryManager.getStats();
      lines.push(`\n**统计**: 共 ${stats.total} 条 | 稳定 ${stats.stable} | 待验证 ${stats.unstable} | 平均置信度 ${(stats.avgConfidence * 100).toFixed(0)}%`);
      return { success: true, output: lines.join('\n') };
    } catch (error: unknown) {
      return { success: false, output: '', error: `读取失败: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
};

export const compressMemoryTool: Tool = {
  definition: {
    name: 'compress_memory',
    description: '压缩记忆：合并相似条目、淘汰过期/低价值记忆。当记忆数量较多时自动调用。',
    parameters: {
      type: 'object',
      properties: {
        expireDays: {
          type: 'number',
          description: '过期天数（超过此天数且未被访问的记忆将被淘汰，默认 30）',
        },
      },
      required: [],
    },
  },

  async execute(args): Promise<ToolResult> {
    const expireDays = args.expireDays ? parseInt(args.expireDays, 10) : 30;

    try {
      const result = memoryManager.compress({ expireDays });
      return {
        success: true,
        output: result.summary,
      };
    } catch (error: unknown) {
      return { success: false, output: '', error: `压缩失败: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
};

export const deleteMemoryTool: Tool = {
  definition: {
    name: 'delete_memory',
    description: '删除指定名称的记忆',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '要删除的记忆名称',
        },
      },
      required: ['name'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { name } = args;
    if (!name) {
      return { success: false, output: '', error: '缺少记忆名称' };
    }

    const deleted = memoryManager.delete(name);
    if (!deleted) {
      return { success: false, output: '', error: `记忆不存在: ${name}` };
    }
    return { success: true, output: `已删除记忆: ${name}` };
  },
};
