import { join } from 'path';
import type { Tool, ToolResult } from './types.js';
import { executeShell } from './executor.js';

const SCRIPTS_DIR = join(import.meta.dirname, '..', '..', 'scripts');

export const classifyTaskTool: Tool = {
  definition: {
    name: 'classify_task',
    description: '分类任务类型和复杂度',
    parameters: {
      type: 'object',
      properties: {
        user_input: {
          type: 'string',
          description: '用户输入的任务描述',
        },
        project_root: {
          type: 'string',
          description: '项目根目录路径（可选）',
        },
      },
      required: ['user_input'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { user_input, project_root } = args;
    const scriptPath = join(SCRIPTS_DIR, 'classify_task.sh');

    const scriptArgs = [JSON.stringify(user_input)];
    if (project_root) {
      scriptArgs.push('--project-root', project_root);
    }

    const result = await executeShell(scriptPath, scriptArgs);

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  },
};
