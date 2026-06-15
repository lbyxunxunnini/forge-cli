import type { Tool, ToolDefinition, ToolResult } from './types.js';
import { permissionManager } from '../permissions/manager.js';

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    this.tools.set(tool.definition.name, tool);
  }

  get(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAll(): Tool[] {
    return Array.from(this.tools.values());
  }

  getDefinitions(): ToolDefinition[] {
    return this.getAll().map(tool => tool.definition);
  }

  async execute(name: string, args: Record<string, string>): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        output: '',
        error: `Tool "${name}" not found`,
      };
    }

    // 权限检查
    const permCheck = permissionManager.check(name, args);
    if (permCheck && !permCheck.allowed) {
      return {
        success: false,
        output: '',
        error: `操作被拒绝: ${permCheck.reason || '权限不足'}`,
      };
    }

    // 需要交互式确认
    if (permCheck === null) {
      const result = await permissionManager.confirm(name, args);
      if (!result.allowed) {
        return {
          success: false,
          output: '',
          error: `操作被拒绝: ${result.reason || '用户拒绝'}`,
        };
      }
    }

    try {
      return await tool.execute(args);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        output: '',
        error: errorMessage,
      };
    }
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  size(): number {
    return this.tools.size;
  }
}

export const toolRegistry = new ToolRegistry();
