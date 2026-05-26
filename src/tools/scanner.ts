import { join } from 'path';
import type { Tool, ToolResult } from './types.js';
import { executePython } from './executor.js';

const SCRIPTS_DIR = join(import.meta.dirname, '..', '..', 'scripts');

export const scanProjectTool: Tool = {
  definition: {
    name: 'scan_project',
    description: '扫描 Flutter 项目结构，识别技术栈、目录结构、状态管理方案等',
    parameters: {
      type: 'object',
      properties: {
        project_root: {
          type: 'string',
          description: 'Flutter 项目根目录路径',
        },
      },
      required: ['project_root'],
    },
  },

  async execute(args): Promise<ToolResult> {
    const { project_root } = args;
    const scriptPath = join(SCRIPTS_DIR, 'flutter_stack_scan.py');

    const result = await executePython(scriptPath, [project_root]);

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  },
};

export const detectProjectStateTool: Tool = {
  definition: {
    name: 'detect_project_state',
    description: '检测项目根目录状态：empty_new（空目录）、flutter_existing（Flutter 项目）、non_flutter（其他）',
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
    const scriptPath = join(SCRIPTS_DIR, 'detect_project_root_state.py');

    const result = await executePython(scriptPath, [project_root]);

    return {
      success: result.exitCode === 0,
      output: result.stdout,
      error: result.exitCode !== 0 ? result.stderr : undefined,
    };
  },
};
