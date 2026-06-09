import * as readline from 'readline';
import chalk from 'chalk';
import { configManager } from '../config/manager.js';
import { contextManager } from '../llm/context.js';
import { AIClient } from '../llm/client-v2.js';
import { AgentOrchestrator } from '../agents/index.js';
import { registerAllTools, toolRegistry } from '../tools/index.js';
import { handleCommand } from './commands.js';
import { renderBanner, renderAssistantStart, renderError, truncate } from './renderer.js';
import { VERSION } from '../version.js';
import { memoryManager } from '../memory/manager.js';

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

  // 设置上下文摘要生成器
  contextManager.setSummarizer(async (messages) => {
    const text = messages.map(m => `[${m.role}] ${m.content.slice(0, 200)}`).join('\n');
    const result = await aiClient.generate(
      `请用中文将以下对话历史压缩为一段简明摘要，保留关键信息（用户需求、决策、代码变更、文件路径）：\n\n${text}`,
      '你是一个对话摘要器。只输出摘要，不要添加额外说明。',
      undefined,
      1
    );
    return result.text;
  });

  // 加载记忆上下文
  const memoryContext = memoryManager.getContextString();

  contextManager.setSystemPrompt(
    `你是 Flutter Forge，一个专业的 Flutter 开发助手。你帮助用户完成 Flutter 项目的开发任务，包括需求分析、方案设计、代码实现和验证。
你遵循结构化工作流：S1 需求分析 → S2 方案设计 → S3 任务拆分（可选）→ S4 实现 → S5 验证。
你可以使用工具来读写文件、执行命令、扫描项目、搜索代码等。
可用工具：
- read_file: 读取文件内容（支持行号范围）
- write_file: 写入文件
- edit_file: 编辑文件（替换指定文本）
- list_files: 列出目录内容
- search_files: 搜索文件内容（正则）
- glob: 按模式搜索文件（如 **/*.dart）
- grep: 在文件中搜索内容（正则、支持上下文行）
- ls: 树形列出目录结构
- run_command: 执行 shell 命令
- save_memory: 保存记忆（用户偏好、项目知识、重要决策），会自动检查写入门槛和去重
- read_memory: 读取/搜索记忆（支持语义召回，返回置信度和稳定性标记）
- delete_memory: 删除记忆
- compress_memory: 压缩记忆（合并相似条目、淘汰过期记忆）
重要：先用 glob/grep/ls 探索项目结构，再进行开发。
当了解到用户偏好、项目架构、重要决策时，主动用 save_memory 保存。
记忆有置信度标记：稳定记忆可直接使用，待验证记忆需要更多确认。
${memoryContext ? '\n' + memoryContext : ''}
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
    const pct = contextManager.getContextPercent();
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

      try {
        process.stdout.write(renderAssistantStart());

        let fullText = '';
        for await (const event of orchestrator.executeStream(input)) {
          if (event.type === 'text') {
            process.stdout.write(event.content);
            fullText += event.content;
          } else if (event.type === 'tool-call') {
            try {
              const call = JSON.parse(event.content);
              const argsPreview = Object.entries(call.args || {})
                .map(([k, v]) => `${k}=${chalk.dim(truncate(String(v), 40))}`)
                .join(', ');
              console.log(chalk.yellow(`\n⚡ ${call.name}`) + (argsPreview ? chalk.dim(` → ${argsPreview})`) : ''));
            } catch {
              console.log(chalk.yellow(`\n⚡ ${event.content}`));
            }
          } else if (event.type === 'tool-result') {
            // tool-result 不单独展示，结果会体现在后续文本中
          }
        }
        // 流式结束后换行
        if (fullText) console.log('');
      } catch (execError: unknown) {
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
