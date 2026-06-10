import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type { WorkflowManifest, WorkflowSessionData } from './types.js';

/**
 * 工作流存储 —— 全局 + 项目两级
 *
 * 全局：~/.forge-cli/workflows/{name}/     （只读：脚本、参考文档、默认模板）
 * 项目：{project}/.forge-cli/workflows/{name}/  （读写：guardrails、运行时、会话）
 */
export class WorkflowStore {
  constructor(
    private workflowName: string,
    private projectRoot: string
  ) {}

  // ─── 路径 ───────────────────────────────────────────────

  /** 全局工作流目录（只读） */
  get globalBase(): string {
    return join(homedir(), '.forge-cli', 'workflows', this.workflowName);
  }

  /** 项目工作流目录（读写） */
  get projectBase(): string {
    return join(this.projectRoot, '.forge-cli', 'workflows', this.workflowName);
  }

  /** 脚本目录 → 全局 */
  get scriptsDir(): string {
    return join(this.globalBase, 'scripts');
  }

  /** 参考文档目录 → 全局 */
  get referencesDir(): string {
    return join(this.globalBase, 'references');
  }

  /** 角色定义目录 → 全局 */
  get rolesDir(): string {
    return join(this.globalBase, 'references', 'roles');
  }

  /** guardrails 文件 → 项目 */
  get guardrailsPath(): string {
    return join(this.projectBase, 'guardrails.yaml');
  }

  /** profiles 目录（先查项目，再查全局） */
  get projectProfilesDir(): string {
    return join(this.projectBase, 'profiles');
  }

  get globalProfilesDir(): string {
    return join(this.globalBase, 'profiles');
  }

  /** 运行时目录 → 项目 */
  get runtimeDir(): string {
    return join(this.projectBase, 'runtime');
  }

  /** 会话目录 → 项目 */
  get sessionsDir(): string {
    return join(this.runtimeDir, 'sessions');
  }

  // ─── 初始化 ─────────────────────────────────────────────

  /** 项目记忆目录 */
  get projectMemoryDir(): string {
    return join(this.projectRoot, '.forge-cli', 'memory');
  }

  /** 确保项目级目录存在 */
  ensureProjectDirs(): void {
    const dirs = [this.projectBase, this.runtimeDir, this.sessionsDir, this.projectMemoryDir];
    for (const dir of dirs) {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    }
  }

  /** 检查全局工作流是否存在 */
  exists(): boolean {
    return existsSync(join(this.globalBase, 'manifest.yaml'));
  }

  // ─── 清单 ───────────────────────────────────────────────

  /** 加载 manifest.yaml */
  loadManifest(): WorkflowManifest | null {
    const manifestPath = join(this.globalBase, 'manifest.yaml');
    if (!existsSync(manifestPath)) return null;

    try {
      const content = readFileSync(manifestPath, 'utf-8');
      return parseYaml(content) as WorkflowManifest;
    } catch {
      return null;
    }
  }

  // ─── Guardrails ─────────────────────────────────────────

  /** 加载项目 guardrails */
  loadGuardrails(): Record<string, unknown> | null {
    if (!existsSync(this.guardrailsPath)) return null;
    try {
      return parseYaml(readFileSync(this.guardrailsPath, 'utf-8')) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  /** 保存项目 guardrails */
  saveGuardrails(data: Record<string, unknown>): void {
    this.ensureProjectDirs();
    writeFileSync(this.guardrailsPath, stringifyYaml(data), 'utf-8');
  }

  // ─── Profiles ───────────────────────────────────────────

  /** 加载技术栈模板（先查项目，再查全局） */
  loadProfile(name: string): Record<string, unknown> | null {
    // 项目级覆盖
    const projectPath = join(this.projectProfilesDir, `${name}.yaml`);
    if (existsSync(projectPath)) {
      try {
        return parseYaml(readFileSync(projectPath, 'utf-8')) as Record<string, unknown>;
      } catch { /* fallback */ }
    }

    // 全局默认
    const globalPath = join(this.globalProfilesDir, `${name}.yaml`);
    if (existsSync(globalPath)) {
      try {
        return parseYaml(readFileSync(globalPath, 'utf-8')) as Record<string, unknown>;
      } catch { /* fallback */ }
    }

    return null;
  }

  /** 列出所有可用 profiles */
  listProfiles(): string[] {
    const profiles = new Set<string>();

    // 全局
    if (existsSync(this.globalProfilesDir)) {
      for (const f of readdirSync(this.globalProfilesDir)) {
        if (f.endsWith('.yaml')) profiles.add(f.replace('.yaml', ''));
      }
    }

    // 项目（覆盖同名）
    if (existsSync(this.projectProfilesDir)) {
      for (const f of readdirSync(this.projectProfilesDir)) {
        if (f.endsWith('.yaml')) profiles.add(f.replace('.yaml', ''));
      }
    }

    return Array.from(profiles);
  }

  // ─── 角色定义 ───────────────────────────────────────────

  /** 加载角色 prompt 文件 */
  loadRolePrompt(roleName: string): string | null {
    const roleFile = join(this.rolesDir, `${roleName}.md`);
    if (!existsSync(roleFile)) return null;
    try {
      return readFileSync(roleFile, 'utf-8');
    } catch {
      return null;
    }
  }

  // ─── 参考文档 ───────────────────────────────────────────

  /** 加载参考文档 */
  loadReference(relativePath: string): string | null {
    const filePath = join(this.referencesDir, relativePath);
    if (!existsSync(filePath)) return null;
    try {
      return readFileSync(filePath, 'utf-8');
    } catch {
      return null;
    }
  }

  // ─── 会话状态 ───────────────────────────────────────────

  /** 保存工作流会话状态 */
  saveSession(sessionId: string, data: WorkflowSessionData): void {
    this.ensureProjectDirs();
    const sessionPath = join(this.sessionsDir, `${sessionId}.yaml`);
    writeFileSync(sessionPath, stringifyYaml(data), 'utf-8');
  }

  /** 加载工作流会话状态 */
  loadSession(sessionId: string): WorkflowSessionData | null {
    const sessionPath = join(this.sessionsDir, `${sessionId}.yaml`);
    if (!existsSync(sessionPath)) return null;
    try {
      return parseYaml(readFileSync(sessionPath, 'utf-8')) as WorkflowSessionData;
    } catch {
      return null;
    }
  }

  /** 列出所有工作流会话 */
  listSessions(): Array<{ id: string; data: WorkflowSessionData }> {
    if (!existsSync(this.sessionsDir)) return [];
    const results: Array<{ id: string; data: WorkflowSessionData }> = [];

    for (const f of readdirSync(this.sessionsDir)) {
      if (!f.endsWith('.yaml')) continue;
      const id = f.replace('.yaml', '');
      const data = this.loadSession(id);
      if (data) results.push({ id, data });
    }

    return results.sort((a, b) => {
      const aTime = a.data.history[a.data.history.length - 1]?.timestamp || '';
      const bTime = b.data.history[b.data.history.length - 1]?.timestamp || '';
      return bTime.localeCompare(aTime);
    });
  }

  /** 查找可恢复的会话 */
  findResumableSession(userInput: string): { id: string; data: WorkflowSessionData } | null {
    const sessions = this.listSessions();
    const inputLower = userInput.toLowerCase();

    for (const session of sessions) {
      if (session.data.resumeKeys) {
        for (const key of session.data.resumeKeys) {
          if (inputLower.includes(key.toLowerCase())) {
            return session;
          }
        }
      }
    }

    return null;
  }

  // ─── 脚本执行路径 ───────────────────────────────────────

  /** 获取脚本的绝对路径 */
  getScriptPath(scriptRelativePath: string): string {
    return join(this.scriptsDir, scriptRelativePath);
  }
}
