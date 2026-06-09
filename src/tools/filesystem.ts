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

// ─── Glob 工具 ──────────────────────────────────────────────

export const globTool: Tool = {
  definition: {
    name: 'glob',
    description: '按模式搜索文件（支持 **/*.dart、src/**/*.ts 等 glob 模式）',
    parameters: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'glob 模式，如 **/*.dart、src/**/*.ts',
        },
        path: {
          type: 'string',
          description: '搜索根目录（默认当前目录）',
        },
      },
      required: ['pattern'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { pattern, path: rootPath } = args;
    const root = resolve(rootPath || '.');

    if (!existsSync(root)) {
      return { success: false, output: '', error: `目录不存在: ${root}` };
    }

    try {
      const files = globMatch(root, pattern);
      return {
        success: true,
        output: files.length > 0 ? files.join('\n') : '未找到匹配文件',
      };
    } catch (error: unknown) {
      return { success: false, output: '', error: `搜索失败: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
};

function globMatch(root: string, pattern: string): string[] {
  const results: string[] = [];
  const parts = pattern.split('/');
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.dart_tool', '.idea', '.vscode']);

  function walk(dir: string, depth: number) {
    if (depth > 20) return;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (ignoreDirs.has(entry)) continue;
      const fullPath = join(dir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      const relativePath = fullPath.slice(root.length + 1);

      if (stat.isDirectory()) {
        if (parts.includes('**') || depth < parts.length - 1) {
          walk(fullPath, depth + 1);
        }
      } else {
        if (matchGlobPattern(relativePath, pattern)) {
          results.push(relativePath);
        }
      }
    }

    if (results.length > 200) return;
  }

  walk(root, 0);
  return results.slice(0, 200);
}

function matchGlobPattern(filePath: string, pattern: string): boolean {
  // 将 glob 模式转为正则
  const regexStr = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*\//g, '(.+/)?')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]');
  return new RegExp(`^${regexStr}$`).test(filePath);
}

// ─── Grep 工具 ──────────────────────────────────────────────

export const grepTool: Tool = {
  definition: {
    name: 'grep',
    description: '在文件中搜索内容（支持正则、文件类型过滤、上下文行）',
    parameters: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: '搜索模式（正则表达式）',
        },
        path: {
          type: 'string',
          description: '搜索目录（默认当前目录）',
        },
        glob: {
          type: 'string',
          description: '文件名过滤，如 *.ts、*.dart',
        },
        context: {
          type: 'number',
          description: '显示匹配行前后 N 行上下文（默认 0）',
        },
      },
      required: ['pattern'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { pattern, path: searchPath, glob: fileGlob, context: ctxLines } = args;
    const root = resolve(searchPath || '.');
    const contextN = ctxLines ? parseInt(String(ctxLines)) : 0;

    if (!existsSync(root)) {
      return { success: false, output: '', error: `目录不存在: ${root}` };
    }

    try {
      const results = grepSearch(root, pattern, fileGlob, contextN);
      return {
        success: true,
        output: results.length > 0 ? results.join('\n') : '未找到匹配内容',
      };
    } catch (error: unknown) {
      return { success: false, output: '', error: `搜索失败: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
};

function grepSearch(root: string, pattern: string, fileGlob?: string, contextN: number = 0): string[] {
  const results: string[] = [];
  const regex = new RegExp(pattern, 'gi');
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.dart_tool', '.idea', '.vscode']);

  function walk(dir: string) {
    if (results.length >= 100) return;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    for (const entry of entries) {
      if (results.length >= 100) return;
      if (ignoreDirs.has(entry)) continue;
      const fullPath = join(dir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else {
        if (fileGlob && !matchGlob(entry, fileGlob)) continue;
        // 跳过二进制文件
        if (stat.size > 1024 * 1024) continue;

        try {
          const content = readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          const relativePath = fullPath.slice(root.length + 1).replace(/^\//, '');

          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              regex.lastIndex = 0;
              // 上下文：前 N 行
              if (contextN > 0) {
                const start = Math.max(0, i - contextN);
                for (let j = start; j < i; j++) {
                  results.push(`${relativePath}:${j + 1}- ${lines[j]}`);
                }
              }
              // 匹配行
              results.push(`${relativePath}:${i + 1}: ${lines[i]}`);
              // 上下文：后 N 行
              if (contextN > 0) {
                const end = Math.min(lines.length - 1, i + contextN);
                for (let j = i + 1; j <= end; j++) {
                  results.push(`${relativePath}:${j + 1}- ${lines[j]}`);
                }
                results.push(''); // 分隔
              }
            } else {
              regex.lastIndex = 0;
            }
          }
        } catch {
          // 跳过无法读取的文件
        }
      }
    }
  }

  walk(root);
  return results.slice(0, 200);
}

// ─── LS 工具 ────────────────────────────────────────────────

export const lsTool: Tool = {
  definition: {
    name: 'ls',
    description: '列出目录结构（树形展示）',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: '目录路径（默认当前目录）',
        },
        depth: {
          type: 'number',
          description: '递归深度（默认 2）',
        },
      },
      required: [],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { path: dirPath, depth: depthStr } = args;
    const root = resolve(dirPath || '.');
    const maxDepth = depthStr ? parseInt(String(depthStr)) : 2;

    if (!existsSync(root)) {
      return { success: false, output: '', error: `目录不存在: ${root}` };
    }

    try {
      const lines = lsTree(root, maxDepth);
      return { success: true, output: lines.join('\n') };
    } catch (error: unknown) {
      return { success: false, output: '', error: `列出失败: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
};

function lsTree(root: string, maxDepth: number): string[] {
  const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.dart_tool']);
  const lines: string[] = [root + '/'];

  function walk(dir: string, prefix: string, depth: number) {
    if (depth >= maxDepth) return;
    let entries: string[];
    try {
      entries = readdirSync(dir).sort((a, b) => {
        // 目录排前面
        const aIsDir = statSync(join(dir, a)).isDirectory();
        const bIsDir = statSync(join(dir, b)).isDirectory();
        if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
        return a.localeCompare(b);
      });
    } catch {
      return;
    }

    // 过滤忽略的目录
    entries = entries.filter(e => !ignoreDirs.has(e));

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const isLast = i === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const fullPath = join(dir, entry);
      let stat;
      try {
        stat = statSync(fullPath);
      } catch {
        continue;
      }
      const isDir = stat.isDirectory();
      const display = isDir ? entry + '/' : entry;

      lines.push(prefix + connector + display);

      if (isDir) {
        const nextPrefix = prefix + (isLast ? '    ' : '│   ');
        walk(fullPath, nextPrefix, depth + 1);
      }
    }
  }

  walk(root, '', 0);
  return lines;
}
