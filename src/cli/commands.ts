import * as readline from 'readline';
import chalk from 'chalk';
import type { ConfigManager } from '../config/manager.js';
import type { ContextManager } from '../llm/context.js';
import type { AIClient } from '../llm/client-v2.js';
import { workflowRegistry } from '../workflows/index.js';
import type { AgentOrchestrator } from '../agents/index.js';
import { renderHelp, renderStatus, renderSuccess, renderError } from './renderer.js';
import { memoryManager } from '../memory/manager.js';
import { projectMemoryManager } from '../memory/project-memory.js';
import { permissionManager } from '../permissions/manager.js';
import { generateSummary, formatSummary } from '../utils/summary.js';
import { getTheme, setTheme, getThemeName, getAvailableThemes } from './theme.js';
import { gitManager } from './git.js';
import { diffGenerator, lintChecker } from './structured-edit.js';
import { astManager } from './ast-parser.js';
import { treeSitterParserManager } from './tree-sitter-parser.js';
import { webFetchManager } from './web-fetch.js';
import { webSearchManager } from './web-search.js';
import { StateMachine, createStateMachine, saveSnapshot, loadSnapshot } from './state-machine.js';

export interface CommandResult {
  handled: boolean;
  shouldExit?: boolean;
  output?: string;
}

function ask(prompt: string): Promise<string> {
  // 暂停主 readline 避免重复输入
  const forge = (globalThis as any).__forgeRL;
  forge?.pause();

  const qrl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    qrl.question(prompt, answer => {
      qrl.close();
      forge?.resume();
      resolve(answer);
    });
  });
}

async function selectOption(prompt: string, options: string[]): Promise<number | null> {
  console.log(chalk.bold(`\n${prompt}`));
  options.forEach((opt, i) => { console.log(`  ${chalk.cyan(i + 1 + '')}. ${opt}`); });
  console.log(chalk.dim('  0. 取消'));
  const answer = await ask(chalk.cyan('\n> '));
  const num = parseInt(answer.trim());
  if (isNaN(num) || num < 0 || num > options.length) return null;
  return num === 0 ? null : num - 1;
}

async function promptInput(label: string): Promise<string | null> {
  const answer = await ask(chalk.cyan(`${label} > `));
  return answer.trim() || null;
}

// 已注册的命令列表
const REGISTERED_COMMANDS = new Set([
  '/help', '/exit', '/quit', '/model', '/config', '/clear', '/status',
  '/fast', '/auto', '/session', '/plugins', '/mcp', '/security', '/learn',
  '/review', '/hook', '/memory', '/trace', '/theme', '/git', '/diff',
  '/lint', '/test', '/ast', '/symbol', '/sym', '/fetch', '/web',
  '/search', '/s', '/state', '/workflow', '/workflows', '/exit-wf', '/skill', '/skills',
  '/skill-install', '/skill-up', '/skill-remove',
  '/out-task', '/import-task',
  '/perm',
  '/cache',
]);

export async function handleCommand(
  input: string,
  configManager: ConfigManager,
  contextManager: ContextManager,
  aiClient: AIClient,
  orchestrator?: AgentOrchestrator
): Promise<CommandResult> {
  const trimmed = input.trim();

  // 不以 / 开头，不是命令
  if (!trimmed.startsWith('/')) return { handled: false };

  const [command, ...args] = trimmed.split(/\s+/);

  // 检查是否是已注册的命令
  // 如果不是已注册的命令，可能是文件路径（如 /Users/...），交给 AI 处理
  if (!REGISTERED_COMMANDS.has(command.toLowerCase())) {
    return { handled: false };
  }

  switch (command) {
    case '/help':
      return { handled: true, output: renderHelp() };
    case '/exit':
    case '/quit':
      return { handled: true, shouldExit: true, output: chalk.dim('\n再见！') };
    case '/model':
      return await handleModelCommand(args, configManager, aiClient);
    case '/config':
      return handleConfigCommand(configManager);
    case '/clear':
      contextManager.clear();
      return { handled: true, output: renderSuccess('上下文已清空') };
    case '/status':
      return { handled: true, output: renderStatus(contextManager.getSummary(), aiClient.getModel(), undefined, contextManager.getCacheHitRate()) };
    case '/fast':
      return handleFastCommand(orchestrator);
    case '/auto':
      return handleAutoCommand(orchestrator);
    case '/session':
      return handleSessionCommand(orchestrator);
    case '/plugins':
      return handlePluginsCommand(orchestrator);
    case '/mcp':
      return handleMCPCommand(args, orchestrator);
    case '/security':
      return handleSecurityCommand(args, orchestrator);
    case '/learn':
      return handleLearnCommand(orchestrator);
    case '/review':
      return handleReviewCommand(args, orchestrator);
    case '/hook':
      return handleHookCommand(args, orchestrator);
    case '/memory':
      return handleMemoryCommand();
    case '/trace':
      return handleTraceCommand(orchestrator);
    case '/theme':
      return handleThemeCommand(args);
    case '/git':
      return handleGitCommand(args);
    case '/diff':
      return handleDiffCommand(args);
    case '/lint':
      return handleLintCommand(args);
    case '/test':
      return handleTestCommand(args);
    case '/ast':
      return handleASTCommand(args);
    case '/symbol':
    case '/sym':
      return handleSymbolCommand(args);
    case '/fetch':
    case '/web':
      return handleFetchCommand(args);
    case '/search':
    case '/s':
      return handleSearchCommand(args);
    case '/state':
      return handleStateCommand(args);
    case '/workflow':
    case '/workflows':
      return await handleWorkflowCommand(args, orchestrator);
    case '/exit-wf':
      return handleExitWfCommand(orchestrator);
    case '/skill':
    case '/skills':
      return handleSkillCommand(orchestrator);
    case '/skill-install':
      return await handleSkillInstallCommand(args);
    case '/skill-up':
      return await handleSkillUpdateCommand();
    case '/skill-remove':
      return handleSkillRemoveCommand(args);
    case '/out-task':
      return handleOutTaskCommand(contextManager, aiClient);
    case '/import-task':
      return handleImportTaskCommand(contextManager);
    case '/perm':
      return handlePermCommand(args);
    case '/cache':
      return handleCacheCommand(contextManager);
    default:
      return { handled: false };
  }
}

// ─── /model ──────────────────────────────────────────────────

import { PROVIDER_PRESETS, MAX_CUSTOM_PROVIDERS } from '../config/types.js';

async function handleModelCommand(
  args: string[],
  cm: ConfigManager,
  ai: AIClient
): Promise<CommandResult> {
  // /model provider:model — 快捷切换
  if (args.length >= 1) {
    const raw = args[0];
    const [providerKey, ...modelParts] = raw.split(':');
    const modelName = modelParts.join(':');
    try {
      const model = cm.getModel(providerKey, modelName || undefined);
      if (!model.api_key) {
        return { handled: true, output: renderError(`provider "${providerKey}" 未配置 API Key，请先用 /model 交互式配置`) };
      }
      cm.setSelectedModel(providerKey, model.name);
      ai.setModel(model);
      cm.save().catch(() => {});
      return { handled: true, output: renderSuccess(`已切换到 ${providerKey} / ${model.name}`) };
    } catch (e: unknown) {
      return { handled: true, output: renderError(e instanceof Error ? e.message : String(e)) };
    }
  }

  // /model — 交互式
  return await flowModelManager(cm, ai);
}

async function flowModelManager(cm: ConfigManager, ai: AIClient): Promise<CommandResult> {
  const defaultPk = cm.getDefaultProvider();
  const defaultInfo = cm.getProvider(defaultPk);
  const currentDisplay = defaultInfo?.selected || cm.get().defaults.model;

  // 显示 provider 列表
  console.log(chalk.bold('\n  模型管理'));
  console.log(chalk.dim('  ─────────────────'));
  console.log(`  当前: ${chalk.cyan(defaultPk)} / ${chalk.yellow(currentDisplay)}\n`);

  const providers = cm.getAllProviders();
  const options: string[] = [];
  for (const p of providers) {
    const hasKey = !!p.info.api_key;
    const isSelected = p.key === defaultPk;
    const modelDisplay = hasKey
      ? (p.info.selected || p.info.models[0])
      : chalk.dim('(未配置)');
    const tag = isSelected ? chalk.yellow(' [当前]') : '';
    options.push(`${chalk.cyan(p.key.padEnd(14))} ${modelDisplay}${tag}`);
  }
  options.push(chalk.dim('自定义 provider'));

  const sel = await selectOption('', options);
  if (sel === null) return { handled: true, output: chalk.dim('已取消') };

  // 选了自定义
  if (sel === providers.length) {
    return await flowAddCustomProvider(cm, ai);
  }

  // 选了某个 provider
  const chosen = providers[sel];
  return await flowSelectModel(cm, ai, chosen.key);
}

async function flowSelectModel(cm: ConfigManager, ai: AIClient, providerKey: string): Promise<CommandResult> {
  const info = cm.getProvider(providerKey);
  if (!info) return { handled: true, output: renderError(`Provider "${providerKey}" 不存在`) };

  // 检查 API Key
  if (!info.api_key) {
    console.log(chalk.yellow(`\n  ${providerKey} 尚未配置 API Key`));
    const apiKey = await promptInput('  API Key');
    if (!apiKey) return { handled: true, output: chalk.dim('已取消') };
    cm.setApiKey(providerKey, apiKey);
  }

  // 选择模型
  const modelOptions = info.models.map(m => {
    const isCurrent = m === info.selected;
    return `${chalk.cyan(m)}${isCurrent ? chalk.yellow(' [当前]') : ''}`;
  });

  const sel = await selectOption(`${providerKey} - 选择模型:`, modelOptions);
  if (sel === null) return { handled: true, output: chalk.dim('已取消') };

  const modelName = info.models[sel];
  cm.setSelectedModel(providerKey, modelName);
  ai.setModel(cm.getModel(providerKey, modelName));
  cm.save().catch(() => {});
  return { handled: true, output: renderSuccess(`已切换到 ${providerKey} / ${modelName}`) };
}

async function flowAddCustomProvider(cm: ConfigManager, ai: AIClient): Promise<CommandResult> {
  const customCount = Object.keys(cm.get().custom_providers).length;
  if (customCount >= MAX_CUSTOM_PROVIDERS) {
    return { handled: true, output: renderError(`最多支持 ${MAX_CUSTOM_PROVIDERS} 个自定义 provider`) };
  }

  console.log(chalk.bold('\n  添加自定义 provider'));
  console.log(chalk.dim('  ─────────────────'));

  const name = await promptInput('  名称');
  if (!name) return { handled: true, output: chalk.dim('已取消') };

  // 检查重名
  if (cm.getProvider(name)) {
    return { handled: true, output: renderError(`Provider "${name}" 已存在`) };
  }

  const baseUrl = await promptInput('  Base URL');
  if (!baseUrl) return { handled: true, output: chalk.dim('已取消') };

  const apiKey = await promptInput('  API Key');
  if (!apiKey) return { handled: true, output: chalk.dim('已取消') };

  const modelsStr = await promptInput('  模型（逗号分隔）');
  if (!modelsStr) return { handled: true, output: chalk.dim('已取消') };

  const models = modelsStr.split(',').map(m => m.trim()).filter(Boolean);
  if (models.length === 0) return { handled: true, output: renderError('至少需要一个模型') };

  cm.addCustomProvider(name, { name, base_url: baseUrl, api_key: apiKey, models });

  // 选择默认模型
  const modelOptions = models.map(m => chalk.cyan(m));
  const sel = await selectOption('选择默认模型:', modelOptions);
  const selectedModel = sel !== null ? models[sel] : models[0];

  cm.setSelectedModel(name, selectedModel);
  ai.setModel(cm.getModel(name, selectedModel));
  cm.save().catch(() => {});
  return { handled: true, output: renderSuccess(`已添加 ${name}，当前模型: ${selectedModel}`) };
}

// ─── 其他命令 ─────────────────────────────────────────────────

function handleConfigCommand(cm: ConfigManager): CommandResult {
  const config = cm.get();
  const defaultPk = config.defaults.provider;
  const defaultInfo = cm.getProvider(defaultPk);
  const currentModel = defaultInfo?.selected || config.defaults.model;

  const lines = [
    chalk.bold('\n当前配置:'),
    `  ${chalk.dim('默认 Provider:')} ${chalk.cyan(defaultPk)}`,
    `  ${chalk.dim('默认模型:')} ${chalk.yellow(currentModel)}`,
    `  ${chalk.dim('项目路径:')} ${config.project.root}`,
    `  ${chalk.dim('配置文件:')} ${cm.getConfigPath()}`,
    '',
    chalk.bold('Provider 列表:'),
  ];

  for (const p of cm.getAllProviders()) {
    const hasKey = !!p.info.api_key;
    const status = hasKey ? chalk.green('✓') : chalk.red('✗');
    const selected = p.info.selected || p.info.models[0] || '-';
    const tag = p.key === defaultPk ? chalk.yellow(' [当前]') : '';
    const presetTag = p.isPreset ? '' : chalk.dim(' (自定义)');
    lines.push(`  ${status} ${chalk.cyan(p.key)}${presetTag} → ${selected}${tag}`);
  }

  return { handled: true, output: lines.join('\n') };
}

function handleFastCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  if (orchestrator.isFastModeEnabled()) {
    orchestrator.disableFastMode();
    return { handled: true, output: renderSuccess('已禁用 ff-fast 模式') };
  }
  orchestrator.enableFastMode();
  return { handled: true, output: renderSuccess('已启用 ff-fast 模式') };
}

function handleAutoCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  if (orchestrator.isAutonomousModeEnabled()) {
    orchestrator.disableAutonomousMode();
    return { handled: true, output: renderSuccess('已禁用 ff-a 全自动模式') };
  }
  orchestrator.enableAutonomousMode();
  return { handled: true, output: renderSuccess('已启用 ff-a 全自动模式') };
}

function handleSessionCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  const info = orchestrator.getSessionInfo();
  if (!info) return { handled: true, output: chalk.dim('\n无活跃 session') };
  return { handled: true, output: [
    chalk.bold('\nSession 信息:'),
    `  ${chalk.dim('ID:')} ${chalk.cyan(info.id)}`,
    `  ${chalk.dim('状态:')} ${chalk.yellow(info.state)}`,
    `  ${chalk.dim('模式:')} ${info.mode || chalk.dim('未设置')}`,
  ].join('\n') };
}

function handlePluginsCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  const plugins = orchestrator.getPluginManager().getPlugins();
  if (plugins.length === 0) return { handled: true, output: chalk.dim('\n无已加载插件') };
  return { handled: true, output: [
    chalk.bold('\n已加载插件:'),
    ...plugins.map(p => {
      const s = p.enabled ? chalk.green('✓') : chalk.red('✗');
      return `  ${s} ${chalk.cyan(p.config.metadata.name)} ${chalk.dim(`v${p.config.metadata.version}`)}`;
    }),
  ].join('\n') };
}

function handleMCPCommand(args: string[], orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  const servers = orchestrator.getMCPClient().getServers();
  if (servers.length === 0) return { handled: true, output: chalk.dim('\n无已连接 MCP 服务器') };
  return { handled: true, output: [
    chalk.bold('\nMCP 服务器:'),
    ...servers.map(s => {
      const st = s.connected ? chalk.green('✓') : chalk.red('✗');
      return `  ${st} ${chalk.cyan(s.id)} ${chalk.dim(`(${s.tools.length} 工具)`)}`;
    }),
  ].join('\n') };
}

function handleSecurityCommand(args: string[], orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  const config = orchestrator.getSecurityChecker().getConfig();
  return { handled: true, output: [
    chalk.bold('\n安全检查配置:'),
    `  ${chalk.dim('启用:')} ${config.enabled ? chalk.green('是') : chalk.red('否')}`,
    `  ${chalk.dim('严重性阈值:')} ${chalk.yellow(config.severityThreshold)}`,
    `  ${chalk.dim('检查类别:')} ${config.categories.length} 个`,
  ].join('\n') };
}

function handleLearnCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  if (orchestrator.isLearningModeEnabled()) {
    orchestrator.disableLearningMode();
    return { handled: true, output: renderSuccess('已禁用学习模式') };
  }
  orchestrator.enableLearningMode();
  return { handled: true, output: renderSuccess('已启用学习模式') };
}

function handleReviewCommand(args: string[], orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  const config = orchestrator.getConfidenceScorer().getConfig();
  return { handled: true, output: [
    chalk.bold('\n代码审查配置:'),
    `  ${chalk.dim('置信度阈值:')} ${chalk.yellow(config.confidenceThreshold)}`,
    `  ${chalk.dim('最大问题数:')} ${config.maxIssues}`,
  ].join('\n') };
}

function handleMemoryCommand(): CommandResult {
  const entries = memoryManager.getAll();
  if (entries.length === 0) {
    return { handled: true, output: chalk.dim('\n暂无记忆') };
  }

  const typeLabels: Record<string, string> = {
    user: chalk.blue('用户'),
    project: chalk.green('项目'),
    feedback: chalk.yellow('反馈'),
    reference: chalk.magenta('参考'),
  };

  const lines = [chalk.bold('\n记忆系统:')];
  const byType: Record<string, typeof entries> = {};
  for (const e of entries) {
    (byType[e.type] ??= []).push(e);
  }
  for (const [type, items] of Object.entries(byType)) {
    lines.push(`  ${typeLabels[type] || type}:`);
    for (const e of items) {
      lines.push(`    ${chalk.cyan(e.name)} — ${chalk.dim(e.description)}`);
    }
  }
  return { handled: true, output: lines.join('\n') };
}

function handleHookCommand(args: string[], orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };
  const hooks = orchestrator.getHookManager().getHooks();
  if (hooks.length === 0) return { handled: true, output: chalk.dim('\n无已注册钩子') };
  return { handled: true, output: [
    chalk.bold('\n已注册钩子:'),
    ...hooks.map(h => {
      const s = h.enabled ? chalk.green('✓') : chalk.red('✗');
      return `  ${s} ${chalk.cyan(h.name)} ${chalk.dim(`[${h.event}]`)}`;
    }),
  ].join('\n') };
}

function handleTraceCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };

  const tracer = orchestrator.getTracer();
  if (!tracer) {
    return { handled: true, output: chalk.dim('\n无活跃的 Trace 会话（执行一次任务后可查看）') };
  }

  const session = tracer.getSession();
  const stats = tracer.getStats();
  const summary = generateSummary(session, stats);

  return { handled: true, output: '\n' + formatSummary(summary) };
}

// ─── /theme ─────────────────────────────────────────────────

function handleThemeCommand(args: string[]): CommandResult {
  const currentTheme = getThemeName()
  const availableThemes = getAvailableThemes()

  // /theme — 显示当前主题和可用主题
  if (args.length === 0) {
    const lines = [
      chalk.bold('\n主题设置'),
      chalk.dim('─────────────────'),
      `  当前主题: ${chalk.cyan(currentTheme)}`,
      '',
      chalk.bold('可用主题:'),
      ...availableThemes.map(t => {
        const isCurrent = t === currentTheme
        return `  ${chalk.cyan(t)}${isCurrent ? chalk.yellow(' [当前]') : ''}`
      }),
      '',
      chalk.dim('使用 /theme <name> 切换主题'),
    ]
    return { handled: true, output: lines.join('\n') }
  }

  // /theme <name> — 切换主题
  const themeName = args[0]
  if (!availableThemes.includes(themeName as any)) {
    return { handled: true, output: renderError(`未知主题: ${themeName}\n可用主题: ${availableThemes.join(', ')}`) }
  }

  setTheme(themeName as any)
  return { handled: true, output: renderSuccess(`已切换到主题: ${themeName}`) }
}

// ─── /git ──────────────────────────────────────────────────

function handleGitCommand(args: string[]): CommandResult {
  if (!gitManager.isRepository()) {
    return { handled: true, output: renderError('当前目录不是 Git 仓库') }
  }

  const subCommand = args[0]

  // /git — 显示状态
  if (!subCommand) {
    const status = gitManager.getStatus()
    return { handled: true, output: gitManager.renderStatus(status) }
  }

  switch (subCommand) {
    case 'status':
    case 'st': {
      const status = gitManager.getStatus()
      return { handled: true, output: gitManager.renderStatus(status) }
    }

    case 'log': {
      const count = parseInt(args[1]) || 10
      const log = gitManager.getLog(count)
      log.then(commits => {
        console.log(gitManager.renderLog(commits))
      })
      return { handled: true, output: chalk.dim('加载中...') }
    }

    case 'branch':
    case 'br': {
      const branches = gitManager.getBranches()
      return { handled: true, output: gitManager.renderBranches(branches) }
    }

    case 'add': {
      if (args.length < 2) {
        return { handled: true, output: renderError('用法: /git add <file> 或 /git add .') }
      }
      if (args[1] === '.') {
        gitManager.stageAll()
        return { handled: true, output: renderSuccess('已暂存所有文件') }
      }
      gitManager.stage(args.slice(1))
      return { handled: true, output: renderSuccess(`已暂存文件: ${args.slice(1).join(', ')}`) }
    }

    case 'commit': {
      if (args.length < 2) {
        return { handled: true, output: renderError('用法: /git commit <message>') }
      }
      const message = args.slice(1).join(' ')
      try {
        const result = gitManager.commit(message)
        return { handled: true, output: renderSuccess(result) }
      } catch (error: any) {
        return { handled: true, output: renderError(error.message) }
      }
    }

    case 'diff': {
      const file = args[1]
      const staged = args.includes('--staged') || args.includes('-S')
      const diff = gitManager.getDiff(file, staged)
      return { handled: true, output: gitManager.renderDiff(diff) }
    }

    case 'remote': {
      const remotes = gitManager.getRemotes()
      if (remotes.length === 0) {
        return { handled: true, output: chalk.dim('无远程仓库') }
      }
      const lines = [
        chalk.bold('\n远程仓库:'),
        ...remotes.map(r => `  ${chalk.cyan(r.name)} ${chalk.dim(r.url)}`),
      ]
      return { handled: true, output: lines.join('\n') }
    }

    default:
      return { handled: true, output: renderError(`未知 Git 子命令: ${subCommand}\n可用: status, log, branch, add, commit, diff, remote`) }
  }
}

// ─── /diff ─────────────────────────────────────────────────

function handleDiffCommand(args: string[]): CommandResult {
  if (args.length < 2) {
    return { handled: true, output: renderError('用法: /diff <old-file> <new-file> 或 /diff --staged') }
  }

  // /diff --staged — 显示已暂存的 Diff
  if (args[0] === '--staged') {
    if (!gitManager.isRepository()) {
      return { handled: true, output: renderError('当前目录不是 Git 仓库') }
    }
    const diff = gitManager.getDiff(undefined, true)
    return { handled: true, output: gitManager.renderDiff(diff) }
  }

  // /diff <old> <new> — 比较两个文件
  const fs = require('fs')
  const oldFile = args[0]
  const newFile = args[1]

  try {
    const oldContent = fs.existsSync(oldFile) ? fs.readFileSync(oldFile, 'utf-8') : ''
    const newContent = fs.existsSync(newFile) ? fs.readFileSync(newFile, 'utf-8') : ''

    const diff = diffGenerator.generateDiff(oldContent, newContent, newFile)
    const stats = diffGenerator.getStats(diff)

    const output = [
      diffGenerator.renderDiff(diff),
      '',
      chalk.bold('统计:'),
      `  ${chalk.green(`+${stats.additions} 行新增`)}`,
      `  ${chalk.red(`-${stats.deletions} 行删除`)}`,
    ].join('\n')

    return { handled: true, output }
  } catch (error: any) {
    return { handled: true, output: renderError(error.message) }
  }
}

// ─── /lint ─────────────────────────────────────────────────

function handleLintCommand(args: string[]): CommandResult {
  const fs = require('fs')
  const path = require('path')

  // /lint — 检查当前目录
  if (args.length === 0) {
    // 查找项目中的 TypeScript 文件
    const files = findFiles(process.cwd(), ['.ts', '.tsx'])
    if (files.length === 0) {
      return { handled: true, output: chalk.dim('未找到 TypeScript 文件') }
    }

    const allResults: any[] = []
    for (const file of files.slice(0, 10)) { // 限制检查 10 个文件
      try {
        const content = fs.readFileSync(file, 'utf-8')
        const results = lintChecker.checkTypeScript(content, file)
        allResults.push(...results)
      } catch {
        // 忽略读取错误
      }
    }

    return { handled: true, output: lintChecker.renderResults(allResults) }
  }

  // /lint <file> — 检查指定文件
  const filePath = args[0]
  if (!fs.existsSync(filePath)) {
    return { handled: true, output: renderError(`文件不存在: ${filePath}`) }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const ext = path.extname(filePath)

    let results: any[]
    if (ext === '.dart') {
      results = lintChecker.checkDart(content, filePath)
    } else {
      results = lintChecker.checkTypeScript(content, filePath)
    }

    return { handled: true, output: lintChecker.renderResults(results) }
  } catch (error: any) {
    return { handled: true, output: renderError(error.message) }
  }
}

// ─── /test ─────────────────────────────────────────────────

function handleTestCommand(args: string[]): CommandResult {
  const { execSync } = require('child_process')
  const fs = require('fs')

  // 检查项目类型
  const isDart = fs.existsSync('pubspec.yaml')
  const isNode = fs.existsSync('package.json')
  const isPython = fs.existsSync('pyproject.toml') || fs.existsSync('requirements.txt')
  const isRust = fs.existsSync('Cargo.toml')
  const isGo = fs.existsSync('go.mod')

  let command: string
  let parser: 'jest' | 'dart' | 'pytest' | 'cargo' | 'go'

  if (isDart) {
    parser = 'dart'
    command = 'dart test'
  } else if (isNode) {
    parser = 'jest'
    // 检查测试脚本
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    if (packageJson.scripts?.test) {
      command = 'npm test'
    } else {
      command = 'npx jest'
    }
  } else if (isPython) {
    parser = 'pytest'
    command = 'pytest'
  } else if (isRust) {
    parser = 'cargo'
    command = 'cargo test'
  } else if (isGo) {
    parser = 'go'
    command = 'go test ./...'
  } else {
    return { handled: true, output: renderError('未识别的项目类型（需要 pubspec.yaml、package.json、pyproject.toml、Cargo.toml 或 go.mod）') }
  }

  // 添加额外参数
  if (args.length > 0) {
    command += ' ' + args.join(' ')
  }

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const { testRunner } = require('./structured-edit.js')
    let suite: any

    if (parser === 'dart') {
      suite = testRunner.parseDartTestOutput(output)
    } else {
      suite = testRunner.parseJestOutput(output)
    }

    return { handled: true, output: testRunner.renderResults(suite) }
  } catch (error: any) {
    // 测试可能失败，但仍然解析输出
    const output = error.stdout || error.stderr || ''
    if (output) {
      const { testRunner } = require('./structured-edit.js')
      let suite: any

      if (parser === 'dart') {
        suite = testRunner.parseDartTestOutput(output)
      } else {
        suite = testRunner.parseJestOutput(output)
      }

      return { handled: true, output: testRunner.renderResults(suite) }
    }

    return { handled: true, output: renderError(`测试执行失败: ${error.message}`) }
  }
}

// ─── 辅助函数 ──────────────────────────────────────────────

function findFiles(dir: string, extensions: string[]): string[] {
  const fs = require('fs')
  const path = require('path')
  const results: string[] = []

  try {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        // 跳过 node_modules 和 .git
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          results.push(...findFiles(filePath, extensions))
        }
      } else {
        const ext = path.extname(file)
        if (extensions.includes(ext)) {
          results.push(filePath)
        }
      }
    }
  } catch {
    // 忽略权限错误
  }

  return results
}

// ─── /ast ──────────────────────────────────────────────────

function handleASTCommand(args: string[]): CommandResult {
  const fs = require('fs')
  const path = require('path')

  // /ast — 显示支持的语言
  if (args.length === 0) {
    const supportedLanguages = treeSitterParserManager.getSupportedLanguages()
    const lines = [
      chalk.bold('\nAST 解析器'),
      chalk.dim('─────────────────'),
      `  支持的语言: ${supportedLanguages.join(', ')}`,
      '',
      chalk.bold('用法:'),
      '  /ast <file>           解析文件结构',
      '  /ast --init           初始化 tree-sitter 解析器',
      '  /ast --languages      显示支持的语言',
    ]
    return { handled: true, output: lines.join('\n') }
  }

  // /ast --init — 初始化 tree-sitter
  if (args[0] === '--init') {
    astManager.initializeTreeSitter().then(success => {
      if (success) {
        console.log(renderSuccess('tree-sitter 解析器初始化成功'))
      } else {
        console.log(renderError('tree-sitter 解析器初始化失败'))
      }
    })
    return { handled: true, output: chalk.dim('正在初始化 tree-sitter 解析器...') }
  }

  // /ast --languages — 显示支持的语言
  if (args[0] === '--languages') {
    const supportedLanguages = treeSitterParserManager.getSupportedLanguages()
    const lines = [
      chalk.bold('\n支持的语言:'),
      ...supportedLanguages.map(lang => `  • ${lang}`),
    ]
    return { handled: true, output: lines.join('\n') }
  }

  // /ast <file> — 解析文件
  const filePath = args[0]
  if (!fs.existsSync(filePath)) {
    return { handled: true, output: renderError(`文件不存在: ${filePath}`) }
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const structure = astManager.getFileStructure(filePath, content)

    const stats = astManager.getStats()
    const output = [
      chalk.bold(`文件结构: ${filePath}`),
      chalk.dim('─'.repeat(60)),
      structure,
      '',
      chalk.dim(`已解析 ${stats.files} 个文件，索引 ${stats.symbols} 个符号`),
    ].join('\n')

    return { handled: true, output }
  } catch (error: any) {
    return { handled: true, output: renderError(error.message) }
  }
}

// ─── /symbol ───────────────────────────────────────────────

function handleSymbolCommand(args: string[]): CommandResult {
  const fs = require('fs')
  const path = require('path')

  // /symbol — 显示帮助
  if (args.length === 0) {
    const lines = [
      chalk.bold('\n符号搜索'),
      chalk.dim('─────────────────'),
      '  /symbol <query>           搜索符号',
      '  /symbol <query> --type=f  只搜索函数',
      '  /symbol <query> --type=c  只搜索类',
      '  /symbol <query> --exact   精确匹配',
      '',
      chalk.dim('类型: f=函数, c=类, m=方法, v=变量, i=接口, t=类型, e=枚举'),
    ]
    return { handled: true, output: lines.join('\n') }
  }

  // 解析参数
  const query = args[0]
  const options: any = {}

  for (const arg of args.slice(1)) {
    if (arg.startsWith('--type=')) {
      const typeMap: Record<string, string> = {
        'f': 'function',
        'c': 'class',
        'm': 'method',
        'v': 'variable',
        'i': 'interface',
        't': 'type',
        'e': 'enum',
      }
      const typeChar = arg.slice(7)
      options.type = typeMap[typeChar] || typeChar
    } else if (arg === '--exact') {
      options.exact = true
    } else if (arg.startsWith('--file=')) {
      options.filePath = arg.slice(7)
    }
  }

  // 如果没有索引，先扫描当前目录
  const stats = astManager.getStats()
  if (stats.symbols === 0) {
    const files = findFiles(process.cwd(), ['.ts', '.tsx', '.dart'])
    for (const file of files.slice(0, 50)) { // 限制扫描 50 个文件
      try {
        const content = fs.readFileSync(file, 'utf-8')
        astManager.parseFile(content, file)
      } catch {
        // 忽略读取错误
      }
    }
  }

  // 搜索符号
  const results = astManager.searchSymbol(query, options)
  const output = astManager.renderSearchResults(results)

  return { handled: true, output }
}

// ─── /fetch ────────────────────────────────────────────────

function handleFetchCommand(args: string[]): CommandResult {
  // /fetch — 显示帮助
  if (args.length === 0) {
    const lines = [
      chalk.bold('\n网页获取'),
      chalk.dim('─────────────────'),
      '  /fetch <url>              获取网页内容',
      '  /fetch <url> --text       只获取文本',
      '  /fetch <url> --compact    简洁模式',
      '  /fetch <url> --links      显示链接',
      '',
      chalk.dim('示例:'),
      '  /fetch https://example.com',
      '  /fetch https://example.com --text',
      '  /fetch https://example.com --compact',
    ]
    return { handled: true, output: lines.join('\n') }
  }

  // 解析参数
  const url = args[0]
  const options: any = { url }

  for (const arg of args.slice(1)) {
    if (arg === '--text') {
      options.extractText = true
      options.extractLinks = false
      options.extractImages = false
    } else if (arg === '--compact') {
      options.compact = true
    } else if (arg === '--links') {
      options.extractLinks = true
    } else if (arg === '--images') {
      options.extractImages = true
    }
  }

  // 异步获取
  webFetchManager.fetch(options).then(result => {
    if (options.compact) {
      console.log(webFetchManager.renderCompactResult(result))
    } else {
      console.log(webFetchManager.renderResult(result))
    }
  }).catch(error => {
    console.log(renderError(`获取失败: ${error.message}`))
  })

  return { handled: true, output: chalk.dim('正在获取网页...') }
}

// ─── /search ───────────────────────────────────────────────

function handleSearchCommand(args: string[]): CommandResult {
  // /search — 显示帮助
  if (args.length === 0) {
    const isConfigured = webSearchManager.isConfigured()
    const lines = [
      chalk.bold('\n网络搜索'),
      chalk.dim('─────────────────'),
      `  状态: ${isConfigured ? chalk.green('✓ 已配置') : chalk.red('✗ 未配置')}`,
      '',
      chalk.bold('用法:'),
      '  /search <query>           搜索网络',
      '  /search <query> --compact 简洁模式',
      '  /search <query> --top=20  设置结果数量',
      '  /search --key <key>       设置 API Key',
      '',
      chalk.dim('示例:'),
      '  /search TypeScript AST 解析库',
      '  /search React 状态管理 最佳实践',
      '  /search --key your-api-key',
    ]
    return { handled: true, output: lines.join('\n') }
  }

  // /search --key <key> — 设置 API Key
  if (args[0] === '--key') {
    if (args.length < 2) {
      return { handled: true, output: renderError('用法: /search --key <your-api-key>') }
    }
    webSearchManager.setApiKey(args[1])
    return { handled: true, output: renderSuccess('API Key 已设置') }
  }

  // 解析参数
  let query = args[0]
  const options: any = { query }

  for (const arg of args.slice(1)) {
    if (arg === '--compact') {
      options.compact = true
    } else if (arg.startsWith('--top=')) {
      options.topK = parseInt(arg.slice(6))
    }
  }

  // 异步搜索
  webSearchManager.search(options).then(result => {
    if (options.compact) {
      console.log(webSearchManager.renderCompactResult(result))
    } else {
      console.log(webSearchManager.renderResult(result))
    }
  }).catch(error => {
    console.log(renderError(`搜索失败: ${error.message}`))
  })

  return { handled: true, output: chalk.dim('正在搜索...') }
}

// ─── /state ────────────────────────────────────────────────

function handleStateCommand(args: string[]): CommandResult {
  // /state — 显示帮助
  if (args.length === 0) {
    const lines = [
      chalk.bold('\n状态机管理'),
      chalk.dim('─────────────────'),
      '  /state status             显示当前状态',
      '  /state history            显示状态历史',
      '  /state graph              显示状态转换图',
      '  /state snapshot <file>    保存状态快照',
      '  /state restore <file>     恢复状态快照',
      '  /state reset              重置状态机',
      '',
      chalk.dim('示例:'),
      '  /state status',
      '  /state snapshot state.json',
      '  /state restore state.json',
    ]
    return { handled: true, output: lines.join('\n') }
  }

  const subCommand = args[0]

  // 这里需要访问全局状态机实例
  // 暂时使用示例状态机
  const exampleStateMachine = createStateMachine({
    initialState: 'idle',
    states: ['idle', 'processing', 'completed', 'error'],
    transitions: [
      { from: 'idle', to: 'processing', event: 'start' },
      { from: 'processing', to: 'completed', event: 'finish' },
      { from: 'processing', to: 'error', event: 'fail' },
      { from: 'error', to: 'idle', event: 'reset' },
      { from: 'completed', to: 'idle', event: 'reset' },
    ],
  })

  switch (subCommand) {
    case 'status':
      return { handled: true, output: exampleStateMachine.render() }

    case 'history': {
      const history = exampleStateMachine.getHistory()
      if (history.length === 0) {
        return { handled: true, output: chalk.dim('暂无状态历史') }
      }

      const lines = [
        chalk.bold('\n状态历史'),
        chalk.dim('─'.repeat(60)),
        ...history.map(entry => {
          const time = new Date(entry.timestamp).toLocaleTimeString()
          const duration = entry.duration ? ` (${entry.duration}ms)` : ''
          return `  ${chalk.gray(time)} ${chalk.cyan(entry.from)} → ${chalk.cyan(entry.to)} ${chalk.dim(entry.event)}${duration}`
        }),
      ]
      return { handled: true, output: lines.join('\n') }
    }

    case 'graph':
      return { handled: true, output: exampleStateMachine.renderTransitionGraph() }

    case 'snapshot': {
      if (args.length < 2) {
        return { handled: true, output: renderError('用法: /state snapshot <file>') }
      }

      const filePath = args[1]
      const snapshot = exampleStateMachine.createSnapshot()
      saveSnapshot(snapshot, filePath)
        .then(() => {
          console.log(renderSuccess(`状态快照已保存: ${filePath}`))
        })
        .catch((error: any) => {
          console.log(renderError(`保存失败: ${error.message}`))
        })
      return { handled: true, output: chalk.dim('正在保存状态快照...') }
    }

    case 'restore': {
      if (args.length < 2) {
        return { handled: true, output: renderError('用法: /state restore <file>') }
      }

      const filePath = args[1]
      loadSnapshot(filePath)
        .then((snapshot) => {
          if (!snapshot) {
            console.log(renderError(`快照文件不存在: ${filePath}`))
            return
          }
          exampleStateMachine.restoreFromSnapshot(snapshot)
          console.log(renderSuccess('状态已恢复'))
          console.log(exampleStateMachine.render())
        })
        .catch((error: any) => {
          console.log(renderError(`恢复失败: ${error.message}`))
        })
      return { handled: true, output: chalk.dim('正在恢复状态...') }
    }

    case 'reset':
      exampleStateMachine.reset()
      return { handled: true, output: renderSuccess('状态机已重置') }

    default:
      return { handled: true, output: renderError(`未知子命令: ${subCommand}`) }
  }
}

// ─── /workflow ────────────────────────────────────────

async function handleWorkflowCommand(
  args: string[],
  orchestrator?: AgentOrchestrator
): Promise<CommandResult> {
  const workflows = workflowRegistry.getAll();

  // 检查当前是否已在工作流中
  if (orchestrator?.getActiveWorkflow()) {
    const active = orchestrator.getActiveWorkflow();
    if (args.length === 0) {
      return {
        handled: true,
        output: [
          chalk.bold(`\n当前在工作流中: ${chalk.yellow(active)}`),
          chalk.dim('输入内容将在工作流中处理，或输入 /exit-wf 退出'),
        ].join('\n'),
      };
    }
  }

  // 无参数：列出所有工作流，支持数字选择
  if (args.length === 0) {
    if (workflows.length === 0) {
      return { handled: true, output: chalk.dim('未安装任何工作流。将工作流放到 ~/.forge-cli/workflows/ 目录即可。') };
    }

    const options = workflows.map(wf => {
      const triggers = wf.manifest.triggers.join(', ');
      return `${chalk.cyan(wf.manifest.name)} v${wf.manifest.version} — ${wf.manifest.description}\n     触发词: ${chalk.dim(triggers)}  角色: ${chalk.dim(wf.manifest.roles.map(r => r.name).join(', '))}`;
    });

    const sel = await selectOption('选择工作流:', options);
    if (sel === null) return { handled: true, output: chalk.dim('已取消') };

    return startWorkflow(workflows[sel], '', orchestrator);
  }

  // 有参数：启动指定工作流
  const workflowName = args[0];
  const workflow = workflowRegistry.get(workflowName);

  if (!workflow) {
    // 尝试模糊匹配
    const fuzzy = workflows.find(w =>
      w.manifest.name.includes(workflowName) ||
      w.manifest.triggers.some(t => t.includes(workflowName))
    );
    if (fuzzy) {
      return startWorkflow(fuzzy, args.slice(1).join(' '), orchestrator);
    }
    return { handled: true, output: renderError(`工作流不存在: ${workflowName}\n可用: ${workflows.map(w => w.manifest.name).join(', ')}`) };
  }

  return startWorkflow(workflow, args.slice(1).join(' '), orchestrator);
}

async function startWorkflow(
  workflow: import('../workflows/index.js').Workflow,
  userPrompt: string,
  orchestrator?: AgentOrchestrator
): Promise<CommandResult> {
  if (!orchestrator) {
    return { handled: true, output: renderError('Orchestrator 未初始化') };
  }

  // 进入工作流模式（持久状态，后续输入都路由到该工作流）
  orchestrator.enterWorkflow(workflow.manifest.name);

  // 如果有初始 prompt，执行一次
  if (userPrompt) {
    const result = await orchestrator.executeWorkflow(workflow.manifest.name, userPrompt);
    return {
      handled: true,
      output: [
        renderSuccess(`已进入工作流: ${workflow.manifest.name}`),
        '',
        result.output || '',
        '',
        chalk.dim(`输入内容将在工作流中处理。/exit-wf 退出。`),
      ].filter(Boolean).join('\n'),
    };
  }

  return {
    handled: true,
    output: [
      renderSuccess(`已进入工作流: ${workflow.manifest.name} v${workflow.manifest.version}`),
      `  ${chalk.dim(workflow.manifest.description)}`,
      `  ${chalk.dim('触发词:')} ${workflow.manifest.triggers.join(', ')}`,
      '',
      chalk.dim('输入内容开始工作流，或直接输入触发词。/exit-wf 退出。'),
    ].join('\n'),
  };
}

// ─── /exit-wf ─────────────────────────────────────────

function handleExitWfCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('Orchestrator 未初始化') };
  if (!orchestrator.getActiveWorkflow()) {
    return { handled: true, output: chalk.dim('当前没有活跃的工作流') };
  }
  const name = orchestrator.exitWorkflow();
  return { handled: true, output: renderSuccess(`已退出工作流: ${name}`) };
}

// ─── /skill ─────────────────────────────────────────────────

function handleSkillCommand(orchestrator?: AgentOrchestrator): CommandResult {
  if (!orchestrator) return { handled: true, output: renderError('编排器未初始化') };

  const pluginManager = orchestrator.getPluginManager();
  const skills = pluginManager.getSkills();

  if (skills.length === 0) {
    return { handled: true, output: chalk.dim('\n无已加载技能') };
  }

  const lines = [chalk.bold('\n已加载技能:')];
  for (const skill of skills) {
    const trigger = skill.trigger ? chalk.yellow(skill.trigger) : chalk.dim('无触发词');
    lines.push(`  ${chalk.cyan('•')} ${chalk.white(skill.name)} ${chalk.dim(`- ${skill.description || '无描述'}`)}`);
    lines.push(`    ${chalk.dim('触发:')} ${trigger}`);
  }

  return { handled: true, output: lines.join('\n') };
}

// 获取所有可用命令（用于自动补全）
export function getAvailableCommands(): Array<{ command: string; description: string; args?: string }> {
  return [
    { command: '/help', description: '显示帮助信息' },
    { command: '/model', description: '模型管理：查看/切换/配置/添加模型' },
    { command: '/config', description: '查看当前配置' },
    { command: '/clear', description: '清空对话上下文' },
    { command: '/status', description: '显示当前状态' },
    { command: '/fast', description: '切换 ff-fast 快速模式' },
    { command: '/auto', description: '切换 ff-a 全自动模式' },
    { command: '/session', description: '查看当前 session 信息' },
    { command: '/plugins', description: '查看已加载插件' },
    { command: '/mcp', description: '查看 MCP 服务器状态' },
    { command: '/security', description: '查看安全检查配置' },
    { command: '/learn', description: '切换学习模式' },
    { command: '/review', description: '查看代码审查配置' },
    { command: '/memory', description: '查看已保存的记忆' },
    { command: '/hook', description: '查看已注册钩子' },
    { command: '/trace', description: '查看最近一次执行的 Trace 摘要' },
    { command: '/theme', description: '切换主题' },
    { command: '/git', description: 'Git 操作', args: '<status|log|branch|add|commit|diff|remote>' },
    { command: '/diff', description: '查看 Diff' },
    { command: '/lint', description: 'Lint 检查' },
    { command: '/test', description: '运行测试' },
    { command: '/ast', description: '查看文件结构' },
    { command: '/symbol', description: '搜索符号' },
    { command: '/fetch', description: '获取网页内容', args: '<url>' },
    { command: '/search', description: '网络搜索', args: '<query>' },
    { command: '/state', description: '状态机管理' },
    { command: '/skill', description: '查看已加载技能' },
    { command: '/skill-install', description: '安装远程技能', args: '<github-url>' },
    { command: '/skill-up', description: '检查技能更新' },
    { command: '/skill-remove', description: '删除技能', args: '<name>' },
    { command: '/workflow', description: '启动/管理工作流', args: '[名称]' },
    { command: '/workflows', description: '列出并选择工作流' },
    { command: '/exit-wf', description: '退出当前活跃工作流' },
    { command: '/out-task', description: '导出当前会话记忆到 .forge/memory/' },
    { command: '/import-task', description: '导入之前导出的会话记忆' },
    { command: '/perm', description: '权限管理：查看/清除已记住的权限' },
    { command: '/cache', description: '查看缓存命中率统计' },
    { command: '/exit', description: '退出程序' },
  ];
}

// ─── /skill-install ─────────────────────────────────────────

import { skillManager } from '../skills/manager.js';

async function handleSkillInstallCommand(args: string[]): Promise<CommandResult> {
  if (args.length === 0) {
    return { handled: true, output: renderError('请提供 GitHub URL，例如: /skill-install https://github.com/user/repo') };
  }

  const url = args[0];
  const result = await skillManager.installSkill(url);

  if (result.success) {
    return { handled: true, output: renderSuccess(result.message) };
  }
  return { handled: true, output: renderError(result.message) };
}

// ─── /skill-up ──────────────────────────────────────────────

async function handleSkillUpdateCommand(): Promise<CommandResult> {
  const updates = await skillManager.checkUpdates();

  if (updates.length === 0) {
    return { handled: true, output: chalk.dim('\n所有技能都是最新版本') };
  }

  const lines = [chalk.bold('\n可更新的技能:')];
  for (const update of updates) {
    lines.push(`  ${chalk.cyan('•')} ${chalk.white(update.name)} ${chalk.dim(update.currentVersion)} → ${chalk.green(update.latestVersion)}`);
  }
  lines.push('');
  lines.push(chalk.dim('使用 /skill-install <url> 更新'));

  return { handled: true, output: lines.join('\n') };
}

// ─── /skill-remove ──────────────────────────────────────────

function handleSkillRemoveCommand(args: string[]): CommandResult {
  if (args.length === 0) {
    return { handled: true, output: renderError('请提供技能名称，例如: /skill-remove my-skill') };
  }

  const name = args[0];
  const result = skillManager.removeSkill(name);

  if (result.success) {
    return { handled: true, output: renderSuccess(result.message) };
  }
  return { handled: true, output: renderError(result.message) };
}

// ─── /cache ─────────────────────────────────────────────────

function handleCacheCommand(ctx: ContextManager): CommandResult {
  const stats = ctx.getCacheStats();
  const hitRate = ctx.getCacheHitRate();

  const rateColor = hitRate >= 90 ? chalk.green : hitRate >= 70 ? chalk.yellow : chalk.red;
  const rateStr = stats.totalRequests > 0 ? rateColor(hitRate.toFixed(1) + '%') : chalk.dim('无数据');

  const lines = [
    chalk.bold('\n缓存统计'),
    chalk.dim('─────────────────'),
    `  ${chalk.dim('命中率:')} ${rateStr}`,
    `  ${chalk.dim('总请求数:')} ${chalk.cyan(stats.totalRequests)}`,
    `  ${chalk.dim('命中次数:')} ${chalk.green(stats.cacheHits)}`,
    `  ${chalk.dim('未命中次数:')} ${chalk.red(stats.cacheMisses)}`,
    `  ${chalk.dim('命中 Token:')} ${chalk.cyan(stats.hitTokens.toLocaleString())}`,
    `  ${chalk.dim('未命中 Token:')} ${chalk.cyan(stats.missTokens.toLocaleString())}`,
  ];

  return { handled: true, output: lines.join('\n') };
}

// ─── /perm ──────────────────────────────────────────────────

function handlePermCommand(args: string[]): CommandResult {
  // /perm — 显示已记住的权限
  if (args.length === 0) {
    const entries = permissionManager.getAll();
    const allowAll = permissionManager.isAllowAll();

    const lines = [
      chalk.bold('\n权限管理'),
      chalk.dim('─────────────────'),
      `  ${chalk.dim('全局放行:')} ${allowAll ? chalk.green('已开启') : chalk.red('已关闭')}`,
    ];

    if (entries.length === 0) {
      lines.push(`  ${chalk.dim('无已记住的权限')}`);
    } else {
      lines.push('');
      lines.push(chalk.bold('已记住的权限:'));
      for (const e of entries) {
        const time = new Date(e.timestamp).toLocaleString('zh-CN');
        const opLabel = e.operation === 'delete' ? chalk.red(e.operation) : chalk.cyan(e.operation);
        lines.push(`  ${opLabel}  ${chalk.dim(e.pathPattern)}  ${chalk.dim(time)}`);
      }
    }

    lines.push('');
    lines.push(chalk.dim('用法:'));
    lines.push(chalk.dim('  /perm             显示已记住的权限'));
    lines.push(chalk.dim('  /perm allow-all   切换全局放行模式'));
    lines.push(chalk.dim('  /perm clear       清除所有已记住的权限'));
    lines.push(chalk.dim('  /perm forget <path> [op]  忘记指定路径的权限'));

    return { handled: true, output: lines.join('\n') };
  }

  const sub = args[0];

  switch (sub) {
    case 'allow-all': {
      const current = permissionManager.isAllowAll();
      permissionManager.setAllowAll(!current);
      return { handled: true, output: renderSuccess(`全局放行模式已${!current ? '开启' : '关闭'}`) };
    }
    case 'clear': {
      permissionManager.clearAll();
      return { handled: true, output: renderSuccess('已清除所有已记住的权限') };
    }
    case 'forget': {
      if (args.length < 2) {
        return { handled: true, output: renderError('用法: /perm forget <path> [operation]') };
      }
      const path = args[1];
      const op = args[2] as 'read' | 'write' | 'execute' | 'delete' | undefined;
      const success = permissionManager.forget(path, op);
      return {
        handled: true,
        output: success
          ? renderSuccess(`已忘记 ${path} 的权限`)
          : renderError(`未找到 ${path} 的权限记录`),
      };
    }
    default:
      return { handled: true, output: renderError(`未知子命令: ${sub}\n可用: allow-all, clear, forget`) };
  }
}

// ─── /out-task ──────────────────────────────────────────────

function handleOutTaskCommand(ctx: ContextManager, ai: AIClient): CommandResult {
  const history = ctx.getHistory();
  if (history.length === 0) {
    return { handled: true, output: renderError('当前会话无对话内容，无法导出') };
  }

  const exported = projectMemoryManager.exportSummary(history, ai.getModel());

  const lines = [
    renderSuccess(`摘要已导出`),
    `  ${chalk.dim('路径:')} ${chalk.cyan(exported.filePath)}`,
    `  ${chalk.dim('ID:')} ${chalk.yellow(exported.id)}`,
    `  ${chalk.dim('消息数:')} ${exported.messageCount}`,
    `  ${chalk.dim('Token:')} ~${exported.tokenEstimate}`,
  ];

  return { handled: true, output: lines.join('\n') };
}

// ─── /import-task ───────────────────────────────────────────

async function handleImportTaskCommand(ctx: ContextManager): Promise<CommandResult> {
  const allMemories = projectMemoryManager.list();
  // 只显示摘要类型的文件（用于导入参考）
  const memories = allMemories.filter(m => m.type === 'summary');

  if (memories.length === 0) {
    return { handled: true, output: chalk.dim('\n无可导入的会话摘要。使用 /out-task 先导出当前会话摘要。') };
  }

  const options = memories.map(m => {
    const time = new Date(m.timestamp).toLocaleString('zh-CN');
    return `${chalk.cyan(m.id)}  ${chalk.dim(time)}  ${m.messageCount}条消息  ${m.summary || ''}`;
  });

  const sel = await selectOption('选择要导入的会话摘要:', options);
  if (sel === null) return { handled: true, output: chalk.dim('已取消') };

  const chosen = memories[sel];
  const messages = projectMemoryManager.load(chosen.id);
  if (!messages) {
    return { handled: true, output: renderError(`加载摘要失败: ${chosen.id}`) };
  }

  // 注入到上下文
  for (const msg of messages) {
    ctx.addMessage(msg);
  }

  return {
    handled: true,
    output: renderSuccess(`已导入会话记忆 ${chosen.id}（${messages.length} 条消息）`),
  };
}
