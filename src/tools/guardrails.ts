import { join } from 'path';
import type { Tool, ToolResult } from './types.js';
import { executeShell, executePython } from './executor.js';

const SCRIPTS_DIR = join(import.meta.dirname, '..', '..', 'scripts');

export const checkGuardrailsTool: Tool = {
  definition: {
    name: 'check_guardrails',
    description: '检查项目护栏状态（project_guardrails 是否存在、是否有效）',
    parameters: {
      type: 'object',
      properties: {
        project_root: {
          type: 'string',
          description: '项目根目录路径',
        },
        cached: {
          type: 'boolean',
          description: '是否使用缓存（默认 true）',
        },
      },
      required: ['project_root'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { project_root, cached } = args;
    const scriptPath = join(SCRIPTS_DIR, 'check_project_guardrails.sh');

    const scriptArgs = [project_root];
    if (cached !== 'false') {
      scriptArgs.push('--cached', '300');
    }

    const result = await executeShell(scriptPath, scriptArgs);

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  },
};

export const initGuardrailsTool: Tool = {
  definition: {
    name: 'init_guardrails',
    description: '初始化项目护栏（创建 project_guardrails 文件）',
    parameters: {
      type: 'object',
      properties: {
        project_root: {
          type: 'string',
          description: '项目根目录路径',
        },
      },
      required: ['project_root'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { project_root } = args;
    const scriptPath = join(SCRIPTS_DIR, 'init_project_guardrails.py');

    const result = await executePython(scriptPath, [project_root]);

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  },
};
