export { ToolRegistry, toolRegistry } from './registry.js';
export { scanProjectTool, detectProjectStateTool } from './scanner.js';
export { validateOutputTool, validateDocsSyncTool } from './validator.js';
export { checkGuardrailsTool, initGuardrailsTool } from './guardrails.js';
export { classifyTaskTool } from './classifier.js';
export { readFileTool, writeFileTool, editFileTool, listFilesTool, searchFilesTool } from './filesystem.js';
export { runCommandTool, runCommandWithOutputTool } from './command.js';
export { executeScript, executePython, executeShell } from './executor.js';
export type { Tool, ToolDefinition, ToolResult } from './types.js';

import { toolRegistry } from './registry.js';
import { scanProjectTool, detectProjectStateTool } from './scanner.js';
import { validateOutputTool, validateDocsSyncTool } from './validator.js';
import { checkGuardrailsTool, initGuardrailsTool } from './guardrails.js';
import { classifyTaskTool } from './classifier.js';
import { readFileTool, writeFileTool, editFileTool, listFilesTool, searchFilesTool } from './filesystem.js';
import { runCommandTool, runCommandWithOutputTool } from './command.js';

// 注册所有工具
export function registerAllTools(): void {
  // 文件操作工具
  toolRegistry.register(readFileTool);
  toolRegistry.register(writeFileTool);
  toolRegistry.register(editFileTool);
  toolRegistry.register(listFilesTool);
  toolRegistry.register(searchFilesTool);

  // 命令执行工具
  toolRegistry.register(runCommandTool);
  toolRegistry.register(runCommandWithOutputTool);

  // Flutter 专用工具
  toolRegistry.register(scanProjectTool);
  toolRegistry.register(detectProjectStateTool);
  toolRegistry.register(validateOutputTool);
  toolRegistry.register(validateDocsSyncTool);
  toolRegistry.register(checkGuardrailsTool);
  toolRegistry.register(initGuardrailsTool);
  toolRegistry.register(classifyTaskTool);
}
