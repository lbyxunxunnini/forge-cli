import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import type {
  HookEvent,
  HookContext,
  HookResult,
  HookDefinition,
  HookConfig,
  HookAction,
} from './types.js';

const HOOKS_DIR = join(homedir(), '.forge-cli', 'hooks');
const PROJECT_HOOKS_DIR = '.forge-cli/hooks';

export class HookManager {
  private hooks: Map<string, HookDefinition> = new Map();
  private builtinHooks: HookDefinition[] = [];

  constructor() {
    this.initBuiltinHooks();
    this.loadUserHooks();
    this.loadProjectHooks();
  }

  // 初始化内置钩子
  private initBuiltinHooks(): void {
    // 安全钩子：危险命令检测
    this.register({
      name: 'dangerous-commands',
      description: '检测危险命令并警告',
      event: 'PreToolUse',
      matcher: 'runCommand|runCommandWithOutput',
      enabled: true,
      handler: async (ctx) => this.checkDangerousCommands(ctx),
    });

    // 安全钩子：敏感文件检测
    this.register({
      name: 'sensitive-files',
      description: '检测敏感文件操作',
      event: 'PreToolUse',
      matcher: 'writeFile|editFile',
      enabled: true,
      handler: async (ctx) => this.checkSensitiveFiles(ctx),
    });

    // 会话开始钩子
    this.register({
      name: 'session-start-log',
      description: '会话开始日志',
      event: 'SessionStart',
      enabled: true,
      handler: async (ctx) => this.logSessionStart(ctx),
    });
  }

  // 加载用户钩子
  private loadUserHooks(): void {
    if (!existsSync(HOOKS_DIR)) {
      mkdirSync(HOOKS_DIR, { recursive: true });
      return;
    }

    const files = readdirSync(HOOKS_DIR).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const file of files) {
      try {
        const content = readFileSync(join(HOOKS_DIR, file), 'utf-8');
        const config = parseYaml(content) as HookConfig;
        if (config.enabled) {
          this.registerFromConfig(config);
        }
      } catch {
        // 跳过损坏的钩子配置
      }
    }
  }

  // 加载项目钩子
  private loadProjectHooks(): void {
    if (!existsSync(PROJECT_HOOKS_DIR)) {
      return;
    }

    const files = readdirSync(PROJECT_HOOKS_DIR).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
    for (const file of files) {
      try {
        const content = readFileSync(join(PROJECT_HOOKS_DIR, file), 'utf-8');
        const config = parseYaml(content) as HookConfig;
        if (config.enabled) {
          this.registerFromConfig(config);
        }
      } catch {
        // 跳过损坏的钩子配置
      }
    }
  }

  // 从配置注册钩子
  private registerFromConfig(config: HookConfig): void {
    // 动态加载处理器
    const handler = this.createHandlerFromConfig(config);
    this.register({
      name: config.name,
      description: config.description,
      event: config.event,
      matcher: config.matcher,
      enabled: config.enabled,
      handler,
    });
  }

  // 根据配置创建处理器
  private createHandlerFromConfig(config: HookConfig): (ctx: HookContext) => Promise<HookResult> {
    return async (ctx: HookContext): Promise<HookResult> => {
      // 默认实现：根据事件类型返回允许
      return { action: 'allow' };
    };
  }

  // 注册钩子
  register(hook: HookDefinition): void {
    this.hooks.set(hook.name, hook);
  }

  // 注销钩子
  unregister(name: string): void {
    this.hooks.delete(name);
  }

  // 启用钩子
  enable(name: string): boolean {
    const hook = this.hooks.get(name);
    if (hook) {
      hook.enabled = true;
      return true;
    }
    return false;
  }

  // 禁用钩子
  disable(name: string): boolean {
    const hook = this.hooks.get(name);
    if (hook) {
      hook.enabled = false;
      return true;
    }
    return false;
  }

  // 执行钩子
  async execute(event: HookEvent, context: HookContext): Promise<HookResult> {
    const matchingHooks = Array.from(this.hooks.values()).filter(hook => {
      if (!hook.enabled) return false;
      if (hook.event !== event) return false;
      if (hook.matcher && context.toolName) {
        const regex = new RegExp(hook.matcher);
        return regex.test(context.toolName);
      }
      return true;
    });

    // 按优先级执行，任何 block 都会阻止操作
    for (const hook of matchingHooks) {
      try {
        const result = await hook.handler(context);
        if (result.action === 'block') {
          return result;
        }
      } catch (error) {
        // 钩子执行失败，记录但继续
        console.error(`[f-forge] 钩子执行失败: ${hook.name}`, error);
      }
    }

    return { action: 'allow' };
  }

  // 获取所有钩子
  getHooks(): HookDefinition[] {
    return Array.from(this.hooks.values());
  }

  // 获取指定事件的钩子
  getHooksByEvent(event: HookEvent): HookDefinition[] {
    return Array.from(this.hooks.values()).filter(h => h.event === event);
  }

  // 检查危险命令
  private async checkDangerousCommands(ctx: HookContext): Promise<HookResult> {
    const command = ctx.toolArgs?.command as string;
    if (!command) return { action: 'allow' };

    const dangerousPatterns = [
      { pattern: /rm\s+-rf/, message: '危险的递归删除操作' },
      { pattern: /dd\s+if=/, message: 'dd 命令可能覆盖磁盘' },
      { pattern: /mkfs/, message: '格式化文件系统命令' },
      { pattern: /chmod\s+777/, message: '过于宽松的权限设置' },
      { pattern: />\s*\/dev\/sd[a-z]/, message: '直接写入磁盘设备' },
      { pattern: /eval\s*\(/, message: 'eval 执行风险' },
      { pattern: /exec\s*\(/, message: 'exec 执行风险' },
    ];

    for (const { pattern, message } of dangerousPatterns) {
      if (pattern.test(command)) {
        return {
          action: 'warn',
          message: `⚠️ 检测到${message}：${command}`,
        };
      }
    }

    return { action: 'allow' };
  }

  // 检查敏感文件
  private async checkSensitiveFiles(ctx: HookContext): Promise<HookResult> {
    const filePath = ctx.toolArgs?.file_path as string;
    if (!filePath) return { action: 'allow' };

    const sensitivePatterns = [
      /\.env$/,
      /\.env\.local$/,
      /credentials/i,
      /secrets/i,
      /\.pem$/,
      /\.key$/,
      /id_rsa/,
      /id_ed25519/,
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(filePath)) {
        return {
          action: 'warn',
          message: `🔐 检测到敏感文件操作：${filePath}`,
        };
      }
    }

    return { action: 'allow' };
  }

  // 会话开始日志
  private async logSessionStart(ctx: HookContext): Promise<HookResult> {
    return {
      action: 'allow',
      message: '[f-forge] 会话已开始',
    };
  }

  // 保存钩子配置
  saveHook(config: HookConfig): void {
    const dir = config.type === 'user' ? HOOKS_DIR : PROJECT_HOOKS_DIR;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const filePath = join(dir, `${config.name}.yaml`);
    const content = stringifyYaml(config);
    writeFileSync(filePath, content, 'utf-8');
  }

  // 列出所有钩子配置
  listConfigs(): HookConfig[] {
    return Array.from(this.hooks.values()).map(hook => ({
      name: hook.name,
      description: hook.description,
      event: hook.event,
      matcher: hook.matcher,
      enabled: hook.enabled,
      type: 'builtin' as const,
      source: 'builtin',
    }));
  }
}

export const hookManager = new HookManager();
