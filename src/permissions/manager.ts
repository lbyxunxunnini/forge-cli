import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve, relative, isAbsolute } from 'path';
import * as readline from 'readline';
import chalk from 'chalk';

export type PermissionOperation = 'read' | 'write' | 'execute' | 'delete';

export interface PermissionEntry {
  pathPattern: string;
  operation: PermissionOperation;
  remembered: boolean;
  timestamp: number;
}

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

// 工具名 → 操作类型映射
const TOOL_OPERATION_MAP: Record<string, PermissionOperation> = {
  read_file: 'read',
  write_file: 'write',
  edit_file: 'write',
  list_files: 'read',
  search_files: 'read',
  glob: 'read',
  grep: 'read',
  ls: 'read',
  run_command: 'execute',
  run_command_with_output: 'execute',
};

// 命令中包含删除操作的模式
const DELETE_PATTERNS = [
  /\brm\s+/,
  /\brmdir\s+/,
  /\bunlink\s+/,
  /\bshred\s+/,
  /\bmv\s+.*\s+\/dev\/null/,
];

export class PermissionManager {
  private projectRoot: string;
  private entries: PermissionEntry[] = [];
  private initialized = false;
  private allowAll = false;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot || process.cwd();
  }

  setProjectRoot(root: string): void {
    this.projectRoot = root;
    this.initialized = false; // 重新加载权限文件
    this.entries = [];
  }

  private get permissionsFile(): string {
    return join(this.projectRoot, '.forge', 'permissions.json');
  }

  // ─── 初始化 ────────────────────────────────────────────

  private init(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (existsSync(this.permissionsFile)) {
      try {
        const data = readFileSync(this.permissionsFile, 'utf-8');
        this.entries = JSON.parse(data);
      } catch {
        this.entries = [];
      }
    }
  }

  // ─── 保存 ──────────────────────────────────────────────

  private save(): void {
    const dir = join(this.projectRoot, '.forge');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.permissionsFile, JSON.stringify(this.entries, null, 2), 'utf-8');
  }

  // ─── 权限检查（同步，返回 null 表示需要询问用户）──────

  check(toolName: string, args: Record<string, unknown>): PermissionCheckResult | null {
    this.init();

    // 全局放行模式
    if (this.allowAll) return { allowed: true };

    const operation = TOOL_OPERATION_MAP[toolName];
    if (!operation) return { allowed: true }; // 未知工具，默认放行

    // 提取目标路径
    const targetPath = this.extractPath(toolName, args);
    if (!targetPath) return { allowed: true }; // 无路径参数，放行

    const resolvedPath = resolve(targetPath);
    const isProjectInternal = this.isProjectInternal(resolvedPath);

    // 命令工具需要特殊处理：检测是否包含删除操作
    let effectiveOp = operation;
    if (toolName === 'run_command' || toolName === 'run_command_with_output') {
      const command = String(args.command || '');
      if (this.containsDeleteOperation(command)) {
        effectiveOp = 'delete';
      }
    }

    // 项目内部操作
    if (isProjectInternal) {
      // 删除操作需要确认
      if (effectiveOp === 'delete') {
        return this.checkRemembered(resolvedPath, effectiveOp);
      }
      // 项目内增改查读自动放行
      return { allowed: true };
    }

    // 外部操作：检查是否已记住
    return this.checkRemembered(resolvedPath, effectiveOp);
  }

  // ─── 交互式确认 ────────────────────────────────────────

  async confirm(toolName: string, args: Record<string, unknown>): Promise<PermissionCheckResult> {
    const operation = TOOL_OPERATION_MAP[toolName] || 'execute';
    const targetPath = this.extractPath(toolName, args) || '未知目标';
    const resolvedPath = resolve(targetPath);

    let effectiveOp = operation;
    if (toolName === 'run_command' || toolName === 'run_command_with_output') {
      const command = String(args.command || '');
      if (this.containsDeleteOperation(command)) {
        effectiveOp = 'delete';
      }
    }

    const opLabel = this.getOperationLabel(effectiveOp);
    const displayPath = targetPath.length > 60 ? '...' + targetPath.slice(-57) : targetPath;

    console.log(chalk.yellow(`\n[Forge] 允许 ${opLabel} ${chalk.cyan(displayPath)}?`));
    console.log(`  ${chalk.cyan('1')}. 拒绝`);
    console.log(`  ${chalk.cyan('2')}. 同意一次`);
    console.log(`  ${chalk.cyan('3')}. 同意并记住`);

    const answer = await this.prompt(chalk.cyan('> '));
    const num = parseInt(answer.trim());

    switch (num) {
      case 1:
        return { allowed: false, reason: '用户拒绝' };
      case 2:
        return { allowed: true };
      case 3:
        this.remember(resolvedPath, effectiveOp);
        return { allowed: true };
      default:
        return { allowed: false, reason: '无效选择，默认拒绝' };
    }
  }

  // ─── 管理 ──────────────────────────────────────────────

  remember(pathPattern: string, operation: PermissionOperation): void {
    this.init();

    // 移除旧的同类记录
    this.entries = this.entries.filter(
      e => !(e.pathPattern === pathPattern && e.operation === operation)
    );

    this.entries.push({
      pathPattern,
      operation,
      remembered: true,
      timestamp: Date.now(),
    });

    this.save();
  }

  forget(pathPattern: string, operation?: PermissionOperation): boolean {
    this.init();
    const before = this.entries.length;
    this.entries = this.entries.filter(
      e => !(e.pathPattern === pathPattern && (!operation || e.operation === operation))
    );
    if (this.entries.length < before) {
      this.save();
      return true;
    }
    return false;
  }

  clearAll(): void {
    this.entries = [];
    this.save();
  }

  setAllowAll(value: boolean): void {
    this.allowAll = value;
  }

  isAllowAll(): boolean {
    return this.allowAll;
  }

  getAll(): PermissionEntry[] {
    this.init();
    return [...this.entries];
  }

  // ─── 内部方法 ──────────────────────────────────────────

  private checkRemembered(resolvedPath: string, operation: PermissionOperation): PermissionCheckResult | null {
    // 检查精确匹配
    const exact = this.entries.find(
      e => e.pathPattern === resolvedPath && e.operation === operation && e.remembered
    );
    if (exact) return { allowed: true };

    // 检查目录级匹配（父目录已记住）
    const dirMatch = this.entries.find(
      e => e.remembered && e.operation === operation && resolvedPath.startsWith(e.pathPattern + '/')
    );
    if (dirMatch) return { allowed: true };

    // 检查通配符匹配（* 操作）
    const wildcard = this.entries.find(
      e => e.pathPattern === resolvedPath && e.operation === 'execute' && e.remembered
    );
    if (wildcard && operation !== 'delete') return { allowed: true };

    // 未找到，需要询问
    return null;
  }

  private isProjectInternal(resolvedPath: string): boolean {
    const rel = relative(this.projectRoot, resolvedPath);
    return !rel.startsWith('..') && !isAbsolute(rel);
  }

  private extractPath(toolName: string, args: Record<string, unknown>): string | null {
    if (toolName === 'run_command' || toolName === 'run_command_with_output') {
      // 从命令中提取路径（简单启发式）
      const command = String(args.command || '');
      const cwd = String(args.cwd || '');
      return cwd || null;
    }
    return String(args.path || args.file_path || args.pattern || '') || null;
  }

  private containsDeleteOperation(command: string): boolean {
    return DELETE_PATTERNS.some(p => p.test(command));
  }

  private getOperationLabel(op: PermissionOperation): string {
    const labels: Record<PermissionOperation, string> = {
      read: '读取',
      write: '写入',
      execute: '执行',
      delete: chalk.red('删除'),
    };
    return labels[op] || op;
  }

  private prompt(text: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
      rl.question(text, answer => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

export const permissionManager = new PermissionManager();
