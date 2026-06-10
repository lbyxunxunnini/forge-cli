import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { WorkflowStore } from './store.js';
import type { Workflow, WorkflowManifest } from './types.js';
import { forgeLogger } from '../output/logger.js';

/**
 * 工作流注册表 —— 发现、加载、匹配工作流
 *
 * 扫描 ~/.forge-cli/workflows/ 下的子目录，
 * 每个子目录必须包含 manifest.yaml。
 */
export class WorkflowRegistry {
  private workflows: Map<string, Workflow> = new Map();
  private initialized = false;

  // ─── 初始化 ─────────────────────────────────────────────

  /** 扫描并加载所有工作流（全局 + 项目两级） */
  init(projectRoot: string): void {
    if (this.initialized) return;
    this.initialized = true;

    // 扫描全局工作流
    const globalDir = join(homedir(), '.forge-cli', 'workflows');
    this.scanDirectory(globalDir, projectRoot);

    // 扫描项目级工作流（覆盖同名全局工作流）
    const projectDir = join(projectRoot, '.forge-cli', 'workflows');
    this.scanDirectory(projectDir, projectRoot);
  }

  private scanDirectory(workflowsDir: string, projectRoot: string): void {
    if (!existsSync(workflowsDir)) return;

    const entries = readdirSync(workflowsDir);
    for (const entry of entries) {
      const dir = join(workflowsDir, entry);
      if (!statSync(dir).isDirectory()) continue;

      const manifestPath = join(dir, 'manifest.yaml');
      if (!existsSync(manifestPath)) continue;

      try {
        const store = new WorkflowStore(entry, projectRoot);
        const manifest = store.loadManifest();
        if (!manifest) continue;

        const workflow: Workflow = {
          manifest,
          globalBase: join(homedir(), '.forge-cli', 'workflows', entry),
          projectBase: store.projectBase,
        };

        this.workflows.set(manifest.name, workflow);
        forgeLogger.logInfo(`[workflow] 已加载工作流: ${manifest.name} v${manifest.version}`);
      } catch (error) {
        forgeLogger.logError(`[workflow] 加载工作流失败: ${entry} - ${error}`);
      }
    }
  }

  // ─── 查询 ───────────────────────────────────────────────

  /** 根据触发词匹配工作流（只匹配开头，不匹配任意位置） */
  match(input: string): Workflow | null {
    const inputLower = input.toLowerCase();
    for (const workflow of this.workflows.values()) {
      for (const trigger of workflow.manifest.triggers) {
        if (inputLower.startsWith(trigger.toLowerCase())) {
          return workflow;
        }
      }
    }
    return null;
  }

  /** 根据名称获取工作流 */
  get(name: string): Workflow | undefined {
    return this.workflows.get(name);
  }

  /** 获取所有已注册的工作流 */
  getAll(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  /** 检查是否有工作流匹配 */
  hasMatch(input: string): boolean {
    return this.match(input) !== null;
  }

  // ─── 动态注册（用于测试或运行时添加） ──────────────────

  register(workflow: Workflow): void {
    this.workflows.set(workflow.manifest.name, workflow);
  }

  unregister(name: string): boolean {
    return this.workflows.delete(name);
  }
}

export const workflowRegistry = new WorkflowRegistry();
