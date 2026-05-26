import * as readline from 'readline';
import chalk from 'chalk';
import type { ConfigManager } from '../config/manager.js';
import type { ContextManager } from '../llm/context.js';
import type { AIClient } from '../llm/client-v2.js';
import type { AgentOrchestrator } from '../agents/index.js';
import { renderHelp, renderStatus, renderSuccess, renderError } from './renderer.js';

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

export async function handleCommand(
  input: string,
  configManager: ConfigManager,
  contextManager: ContextManager,
  aiClient: AIClient,
  orchestrator?: AgentOrchestrator
): Promise<CommandResult> {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return { handled: false };

  const [command, ...args] = trimmed.split(/\s+/);

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
      return { handled: true, output: renderStatus(contextManager.getSummary(), aiClient.getModel()) };
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
    default:
      return { handled: true, output: renderError(`未知命令: ${command}\n输入 /help 查看可用命令`) };
  }
}

// ─── /model ──────────────────────────────────────────────────

async function handleModelCommand(
  args: string[],
  cm: ConfigManager,
  ai: AIClient
): Promise<CommandResult> {
  // /model <name> — 切换模型
  if (args.length >= 1) {
    const modelName = args[0];
    try {
      const model = cm.getModel(modelName);
      if (!model.api_key) {
        return { handled: true, output: renderError(`未配置 API Key，请先用 /model 配置`) };
      }
      ai.setModel(model);
      cm.setDefaultModel(modelName);
      cm.save().catch(() => {});
      return { handled: true, output: renderSuccess(`已切换到模型: ${modelName}`) };
    } catch {
      return { handled: true, output: renderError(`模型 "${modelName}" 不可用`) };
    }
  }

  // /model — 交互式
  return await flowModelManager(cm, ai);
}

async function flowModelManager(cm: ConfigManager, ai: AIClient): Promise<CommandResult> {
  const config = cm.get();
  const isConfigured = cm.isConfigured();

  // 显示 provider 状态
  const provider = config.provider;
  const status = isConfigured ? chalk.green('✓ 已配置') : chalk.red('✗ 未配置');
  console.log(chalk.bold(`\n提供商: ${chalk.cyan(provider.name)}`));
  console.log(`  ${chalk.dim('Base URL:')} ${provider.base_url}`);
  console.log(`  ${chalk.dim('API Key:')} ${status}`);

  const modelOptions = provider.models.map(m => {
    const isDefault = m === config.models.default;
    return `${chalk.cyan(m)}${isDefault ? chalk.yellow(' [当前]') : ''}`;
  });

  if (!isConfigured) {
    // 未配置：先配 key
    console.log(chalk.yellow('\n请先配置 API Key'));
    const apiKey = await promptInput('API Key');
    if (!apiKey) return { handled: true, output: chalk.dim('已取消') };
    cm.setApiKey(apiKey);
    cm.save().catch(() => {});

    // 选模型
    const sel = await selectOption('选择默认模型:', modelOptions);
    if (sel !== null) {
      cm.setDefaultModel(provider.models[sel]);
      ai.setModel(cm.getModel());
      cm.save().catch(() => {});
    }
    return { handled: true, output: renderSuccess(`已配置 API Key，当前模型: ${cm.get().models.default}`) };
  }

  // 已配置：选操作
  const actions = [
    ...modelOptions,
    chalk.yellow('重新配置 API Key'),
    chalk.red('清除 API Key'),
  ];

  const sel = await selectOption('模型管理:', actions);
  if (sel === null) return { handled: true, output: chalk.dim('已取消') };

  // 选了模型
  if (sel < provider.models.length) {
    const modelName = provider.models[sel];
    cm.setDefaultModel(modelName);
    ai.setModel(cm.getModel());
    cm.save().catch(() => {});
    return { handled: true, output: renderSuccess(`已切换到模型: ${modelName}`) };
  }

  // 重新配置 Key
  if (sel === provider.models.length) {
    const apiKey = await promptInput('API Key');
    if (!apiKey) return { handled: true, output: chalk.dim('已取消') };
    cm.setApiKey(apiKey);
    ai.setModel(cm.getModel());
    cm.save().catch(() => {});
    return { handled: true, output: renderSuccess('API Key 已更新') };
  }

  // 清除 Key
  cm.setApiKey('');
  cm.save().catch(() => {});
  return { handled: true, output: renderSuccess('API Key 已清除') };
}

// ─── 其他命令 ─────────────────────────────────────────────────

function handleConfigCommand(cm: ConfigManager): CommandResult {
  const config = cm.get();
  const p = config.provider;
  const lines = [
    chalk.bold('\n当前配置:'),
    `  ${chalk.dim('提供商:')} ${chalk.cyan(p.name)}`,
    `  ${chalk.dim('Base URL:')} ${p.base_url}`,
    `  ${chalk.dim('API Key:')} ${p.api_key ? chalk.green('✓ 已配置') : chalk.red('✗ 未配置')}`,
    `  ${chalk.dim('默认模型:')} ${chalk.yellow(config.models.default)}`,
    `  ${chalk.dim('可用模型:')}`,
    ...p.models.map(m => {
      const tag = m === config.models.default ? chalk.yellow(' [当前]') : '';
      return `    ${chalk.cyan(m)}${tag}`;
    }),
    `  ${chalk.dim('项目路径:')} ${config.project.root}`,
    `  ${chalk.dim('配置文件:')} ${cm.getConfigPath()}`,
  ];
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
