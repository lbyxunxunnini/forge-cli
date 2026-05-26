import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import type { Tool, ToolResult } from './types.js';

const execAsync = promisify(exec);

export const runCommandTool: Tool = {
  definition: {
    name: 'run_command',
    description: '执行 shell 命令',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: '要执行的命令',
        },
        cwd: {
          type: 'string',
          description: '工作目录（可选）',
        },
        timeout: {
          type: 'number',
          description: '超时时间（秒，默认 30）',
        },
      },
      required: ['command'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { command, cwd, timeout } = args;
    const resolvedCwd = cwd ? resolve(cwd) : process.cwd();
    const timeoutMs = (timeout ? parseInt(String(timeout)) : 30) * 1000;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: resolvedCwd,
        timeout: timeoutMs,
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 10, // 10MB
      });

      return {
        success: true,
        output: stdout || stderr || '命令执行完成（无输出）',
      };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; code?: number; message?: string };
      return {
        success: false,
        output: execError.stdout || '',
        error: execError.stderr || execError.message || '命令执行失败',
      };
    }
  },
};

export const runCommandWithOutputTool: Tool = {
  definition: {
    name: 'run_command_with_output',
    description: '执行命令并获取输出（适合需要解析输出的场景）',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: '要执行的命令',
        },
        cwd: {
          type: 'string',
          description: '工作目录',
        },
      },
      required: ['command'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { command, cwd } = args;
    const resolvedCwd = cwd ? resolve(cwd) : process.cwd();

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: resolvedCwd,
        encoding: 'utf-8',
      });

      return {
        success: true,
        output: stdout.trim() || stderr.trim() || '',
      };
    } catch (error: unknown) {
      const execError = error as { stdout?: string; stderr?: string; message?: string };
      return {
        success: false,
        output: execError.stdout?.trim() || '',
        error: execError.stderr?.trim() || execError.message || '命令执行失败',
      };
    }
  },
};
