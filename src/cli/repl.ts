import * as readline from 'readline';
import chalk from 'chalk';
import { configManager } from '../config/manager.js';
import { contextManager } from '../llm/context.js';
import { AIClient } from '../llm/client-v2.js';
import { AgentOrchestrator } from '../agents/index.js';
import { registerAllTools, toolRegistry } from '../tools/index.js';
import { handleCommand } from './commands.js';
import ora from 'ora';
import { renderBanner, renderAssistantStart, renderError, renderMarkdown } from './renderer.js';
import { VERSION } from '../version.js';

export async function startREPL(): Promise<void> {
  // 防止未处理的异常导致进程静默退出
  process.on('uncaughtException', (err) => {
    console.error(chalk.red(`\n未捕获异常: ${err.message}`));
    console.error(err.stack);
  });
  process.on('unhandledRejection', (reason) => {
    console.error(chalk.red(`\n未处理的拒绝: ${reason}`));
    if (reason instanceof Error) console.error(reason.stack);
  });

  const config = await configManager.load();

  // 创建 AI 客户端
  const currentModel = configManager.getModel();
  const aiClient = new AIClient(currentModel);

  registerAllTools();

  const orchestrator = new AgentOrchestrator(
    aiClient, contextManager, toolRegistry, config.project.root
  );

  contextManager.setSystemPrompt(
    `你是 Flutter Forge，一个专业的 Flutter 开发助手。你帮助用户完成 Flutter 项目的开发任务，包括需求分析、方案设计、代码实现和验证。
你遵循结构化工作流：S1 需求分析 → S2 方案设计 → S3 任务拆分（可选）→ S4 实现 → S5 验证。
你可以使用工具来读写文件、执行命令、扫描项目等。
请用中文回复。`
  );

  console.log(renderBanner(VERSION, currentModel.name, config.project.root));

  if (!configManager.isConfigured()) {
    console.log(chalk.yellow('\n⚠ 未配置 API Key'));
    console.log(chalk.dim('使用 /model 进入交互式配置'));
  }

  // ─── 底部状态栏 ───────────────────────────────────────────
  // eslint-disable-next-line no-control-regex
  const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*m/g, '');

  function printInputBar() {
    const w = process.stdout.columns || 80;
    const modelName = aiClient.getModel() || configManager.get().models.default;
    const pct = Math.min(100, Math.round((contextManager.getLength() / 100) * 100));
    const pctColor = pct > 80 ? chalk.red : pct > 50 ? chalk.yellow : chalk.green;
    const sep = chalk.dim('─'.repeat(w));
    const left = ` ${chalk.yellow(modelName)}`;
    const right = `上下文: ${pctColor(pct + '%')} `;
    const gap = Math.max(1, w - stripAnsi(left).length - stripAnsi(right).length - 1);
    const statusLine = left + ' '.repeat(gap) + '│' + right;
    console.log(sep);
    console.log(statusLine);
  }

  // ─── readline ──────────────────────────────────────────────
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.cyan('❯ '),
  });

  printInputBar();
  rl.prompt();

  let sigintState = 0;

  // 交互问答时暂停主 readline，避免重复输入
  function pauseRL() { rl.pause(); }
  function resumeRL() { rl.resume(); }

  // 暴露给 commands 使用
  (globalThis as any).__forgeRL = { pause: pauseRL, resume: resumeRL };

  rl.on('line', async (line: string) => {
    sigintState = 0;
    const input = line.trim();

    if (!input) {
      printInputBar();
      rl.prompt();
      return;
    }

    try {
      const result = await handleCommand(input, configManager, contextManager, aiClient, orchestrator);
      if (result.handled) {
        if (result.output) console.log(result.output);
        if (result.shouldExit) { rl.close(); return; }
        printInputBar();
        rl.prompt();
        return;
      }

      if (!configManager.isConfigured()) {
        console.log(renderError('未配置 API Key\n使用 /model 进入交互式配置'));
        printInputBar();
        rl.prompt();
        return;
      }

      let spinner: ReturnType<typeof ora> | null = null;
      try {
        spinner = ora({ text: chalk.dim('思考中...'), spinner: 'dots', color: 'cyan', discardStdin: false }).start();

        const agentResult = await orchestrator.execute(input);
        if (spinner.isSpinning) spinner.stop();
        process.stdout.write(renderAssistantStart());

        if (agentResult.success) {
          if (agentResult.output) {
            console.log(renderMarkdown(agentResult.output));
          }
        } else {
          console.log(renderError(agentResult.error || '执行失败'));
        }
      } catch (execError: unknown) {
        if (spinner?.isSpinning) spinner.stop();
        console.log(renderError(execError instanceof Error ? execError.message : String(execError)));
      }

      try {
        printInputBar();
        rl.prompt();
      } catch {}
    } catch (err: unknown) {
      console.log(renderError(err instanceof Error ? err.message : String(err)));
      try {
        printInputBar();
        rl.prompt();
      } catch {}
    }
  });

  process.stdin.on('end', () => {
    console.error(chalk.red('\nstdin 已关闭'));
  });

  rl.on('close', () => {
    // 只在用户主动退出时显示再见
    if (sigintState >= 1) {
      process.stdout.write(chalk.dim('\n再见！\n'));
    } else {
      process.stdout.write(chalk.dim('\n(readline 已关闭)\n'));
    }
    process.exit(0);
  });

  rl.on('error', (err) => {
    console.error(chalk.red(`\nreadline 错误: ${err.message}`));
  });

  rl.on('SIGINT', () => {
    if (sigintState >= 1) {
      rl.close();
    } else {
      sigintState = 1;
      console.log(chalk.dim('\n(再按一次 Ctrl+C 退出，或输入 /exit)'));
      printInputBar();
      rl.prompt();
    }
  });
}
