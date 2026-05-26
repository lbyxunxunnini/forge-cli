import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import type { Tool, ToolResult } from './types.js';

export const readFileTool: Tool = {
  definition: {
    name: 'read_file',
    description: '读取文件内容',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '文件路径（绝对或相对路径）',
        },
        start_line: {
          type: 'number',
          description: '起始行号（从1开始，可选）',
        },
        end_line: {
          type: 'number',
          description: '结束行号（可选）',
        },
      },
      required: ['path'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { path, start_line, end_line } = args;
    const resolvedPath = resolve(path);

    if (!existsSync(resolvedPath)) {
      return {
        success: false,
        output: '',
        error: `文件不存在: ${resolvedPath}`,
      };
    }

    try {
      const content = readFileSync(resolvedPath, 'utf-8');
      const lines = content.split('\n');

      let result: string;
      if (start_line || end_line) {
        const start = (start_line ? parseInt(String(start_line)) : 1) - 1;
        const end = end_line ? parseInt(String(end_line)) : lines.length;
        const selectedLines = lines.slice(start, end);
        result = selectedLines.map((line, i) => `${start + i + 1}: ${line}`).join('\n');
      } else {
        result = lines.map((line, i) => `${i + 1}: ${line}`).join('\n');
      }

      return {
        success: true,
        output: result,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: `读取文件失败: ${errorMessage}`,
      };
    }
  },
};

export const writeFileTool: Tool = {
  definition: {
    name: 'write_file',
    description: '写入文件内容（创建新文件或覆盖已有文件）',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '文件路径',
        },
        content: {
          type: 'string',
          description: '文件内容',
        },
      },
      required: ['path', 'content'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { path, content } = args;
    const resolvedPath = resolve(path);

    try {
      // 确保目录存在
      const dir = dirname(resolvedPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(resolvedPath, content, 'utf-8');
      return {
        success: true,
        output: `文件已写入: ${resolvedPath}`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: `写入文件失败: ${errorMessage}`,
      };
    }
  },
};

export const editFileTool: Tool = {
  definition: {
    name: 'edit_file',
    description: '编辑文件（替换指定内容）',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '文件路径',
        },
        old_text: {
          type: 'string',
          description: '要替换的原始文本',
        },
        new_text: {
          type: 'string',
          description: '替换后的新文本',
        },
      },
      required: ['path', 'old_text', 'new_text'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { path, old_text, new_text } = args;
    const resolvedPath = resolve(path);

    if (!existsSync(resolvedPath)) {
      return {
        success: false,
        output: '',
        error: `文件不存在: ${resolvedPath}`,
      };
    }

    try {
      const content = readFileSync(resolvedPath, 'utf-8');

      if (!content.includes(old_text)) {
        return {
          success: false,
          output: '',
          error: '未找到要替换的文本',
        };
      }

      const newContent = content.replace(old_text, new_text);
      writeFileSync(resolvedPath, newContent, 'utf-8');

      return {
        success: true,
        output: `文件已编辑: ${resolvedPath}`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: `编辑文件失败: ${errorMessage}`,
      };
    }
  },
};

export const listFilesTool: Tool = {
  definition: {
    name: 'list_files',
    description: '列出目录下的文件和子目录',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '目录路径（默认当前目录）',
        },
        recursive: {
          type: 'boolean',
          description: '是否递归列出（默认 false）',
        },
      },
      required: [],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { path, recursive } = args;
    const resolvedPath = resolve(path || '.');

    if (!existsSync(resolvedPath)) {
      return {
        success: false,
        output: '',
        error: `目录不存在: ${resolvedPath}`,
      };
    }

    try {
      const items = listDirectory(resolvedPath, String(recursive).toLowerCase() === 'true');
      return {
        success: true,
        output: items.join('\n'),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: `列出文件失败: ${errorMessage}`,
      };
    }
  },
};

export const searchFilesTool: Tool = {
  definition: {
    name: 'search_files',
    description: '在文件中搜索文本',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '搜索目录',
        },
        pattern: {
          type: 'string',
          description: '搜索模式（正则表达式）',
        },
        file_pattern: {
          type: 'string',
          description: '文件名模式（如 *.ts）',
        },
      },
      required: ['pattern'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { path, pattern, file_pattern } = args;
    const resolvedPath = resolve(path || '.');

    try {
      const results = searchInFiles(resolvedPath, pattern, file_pattern);
      return {
        success: true,
        output: results.length > 0 ? results.join('\n') : '未找到匹配内容',
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: `搜索失败: ${errorMessage}`,
      };
    }
  },
};

function listDirectory(dirPath: string, recursive: boolean, prefix: string = ''): string[] {
  const items: string[] = [];
  const entries = readdirSync(dirPath);

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist') continue;

    const fullPath = join(dirPath, entry);
    const stat = statSync(fullPath);
    const isDir = stat.isDirectory();

    items.push(`${prefix}${isDir ? '📁' : '📄'} ${entry}`);

    if (recursive && isDir) {
      items.push(...listDirectory(fullPath, true, `${prefix}  `));
    }
  }

  return items;
}

function searchInFiles(dirPath: string, pattern: string, filePattern?: string): string[] {
  const results: string[] = [];
  const regex = new RegExp(pattern, 'gi');

  function searchDir(currentDir: string) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules' || entry === 'dist') continue;

      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        searchDir(fullPath);
      } else {
        // 检查文件名模式
        if (filePattern && !matchGlob(entry, filePattern)) continue;

        try {
          const content = readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              const relativePath = fullPath.replace(dirPath, '').replace(/^\//, '');
              results.push(`${relativePath}:${i + 1}: ${lines[i].trim()}`);
            }
          }
        } catch {
          // 跳过无法读取的文件
        }
      }
    }
  }

  searchDir(dirPath);
  return results.slice(0, 50); // 限制结果数量
}

function matchGlob(filename: string, pattern: string): boolean {
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regexPattern}$`).test(filename);
}
