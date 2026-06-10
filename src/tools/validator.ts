import { join } from 'path';
import type { Tool, ToolResult } from './types.js';
import { executeShell } from './executor.js';

const SCRIPTS_DIR = join(import.meta.dirname, '..', '..', 'scripts');

export const validateOutputTool: Tool = {
  definition: {
    name: 'validate_output',
    description: '验证输出是否符合规范（日志前缀、阶段标记等）',
    parameters: {
      type: 'object',
      properties: {
        output: {
          type: 'string',
          description: '待验证的输出文本',
        },
        require_stage: {
          type: 'boolean',
          description: '是否要求包含阶段标记',
        },
        require_complete: {
          type: 'boolean',
          description: '是否要求包含完成标记',
        },
      },
      required: ['output'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { output, require_s4, require_complete } = args;
    const scriptPath = join(SCRIPTS_DIR, 'validate_output.sh');

    const scriptArgs = [];
    if (require_s4 === 'true') scriptArgs.push('--require-s4');
    if (require_complete === 'true') scriptArgs.push('--require-complete');

    // 将输出通过 stdin 传入
    const result = await executeShell(
      `echo ${JSON.stringify(output)} | ${scriptPath}`,
      scriptArgs
    );

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  },
};

export const validateDocsSyncTool: Tool = {
  definition: {
    name: 'validate_docs_sync',
    description: '验证文档与代码是否同步',
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
    const scriptPath = join(SCRIPTS_DIR, 'validate_docs_sync.py');

    const result = await executeShell(scriptPath, [project_root]);

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  },
};
