export { ToolRegistry, toolRegistry } from './registry.js';
export { scanProjectTool, detectProjectStateTool } from './scanner.js';
export { validateOutputTool, validateDocsSyncTool } from './validator.js';
export { checkGuardrailsTool, initGuardrailsTool } from './guardrails.js';
export { classifyTaskTool } from './classifier.js';
export { readFileTool, writeFileTool, editFileTool, listFilesTool, searchFilesTool, globTool, grepTool, lsTool } from './filesystem.js';
export { runCommandTool, runCommandWithOutputTool } from './command.js';
export { executeScript, executePython, executeShell } from './executor.js';
export { saveMemoryTool, readMemoryTool, deleteMemoryTool, compressMemoryTool } from './memory.js';
export { fetchTool, websearchTool } from './web-tools.js';
export type { Tool, ToolDefinition, ToolResult } from './types.js';

import { toolRegistry } from './registry.js';
import { scanProjectTool, detectProjectStateTool } from './scanner.js';
import { validateOutputTool, validateDocsSyncTool } from './validator.js';
import { checkGuardrailsTool, initGuardrailsTool } from './guardrails.js';
import { classifyTaskTool } from './classifier.js';
import { readFileTool, writeFileTool, editFileTool, listFilesTool, searchFilesTool, globTool, grepTool, lsTool } from './filesystem.js';
import { runCommandTool, runCommandWithOutputTool } from './command.js';
import { saveMemoryTool, readMemoryTool, deleteMemoryTool, compressMemoryTool } from './memory.js';
import { fetchTool, websearchTool } from './web-tools.js';

// 注册所有工具
export function registerAllTools(): void {
  // 文件操作工具
  toolRegistry.register(readFileTool);
  toolRegistry.register(writeFileTool);
  toolRegistry.register(editFileTool);
  toolRegistry.register(listFilesTool);
  toolRegistry.register(searchFilesTool);
  toolRegistry.register(globTool);
  toolRegistry.register(grepTool);
  toolRegistry.register(lsTool);

  // 命令执行工具
  toolRegistry.register(runCommandTool);
  toolRegistry.register(runCommandWithOutputTool);

  // 网络工具
  toolRegistry.register(fetchTool);
  toolRegistry.register(websearchTool);

  // 记忆工具
  toolRegistry.register(saveMemoryTool);
  toolRegistry.register(readMemoryTool);
  toolRegistry.register(deleteMemoryTool);
  toolRegistry.register(compressMemoryTool);

  // 项目分析工具
  toolRegistry.register(scanProjectTool);
  toolRegistry.register(detectProjectStateTool);
  toolRegistry.register(validateOutputTool);
  toolRegistry.register(validateDocsSyncTool);
  toolRegistry.register(checkGuardrailsTool);
  toolRegistry.register(initGuardrailsTool);
  toolRegistry.register(classifyTaskTool);
}
