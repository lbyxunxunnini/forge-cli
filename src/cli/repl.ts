import * as readline from 'readline';
import chalk from 'chalk';
import { configManager } from '../config/manager.js';
import { contextManager } from '../llm/context.js';
import { AIClient } from '../llm/client-v2.js';
import { AgentOrchestrator } from '../agents/index.js';
import { registerAllTools, toolRegistry } from '../tools/index.js';
import { handleCommand } from './commands.js';
import { renderBanner, renderAssistantStart, renderError, renderSuccess, renderMarkdown, truncate } from './renderer.js';
import { VERSION } from '../version.js';
import { memoryManager } from '../memory/manager.js';
import { PROVIDER_PRESETS } from '../config/types.js';
import { inputLayoutManager } from './input-layout.js';
import { taskGroupRenderer } from './task-group.js';
import { forgeLogger } from '../output/logger.js';
import type { ConfigManager } from '../config/manager.js';

// ─── 首次运行引导 ─────────────────────────────────────────────

function askSetup(promptText: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(promptText, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function selectSetup(promptText: string, options: string[]): Promise<number | null> {
  console.log(chalk.bold(`\n${promptText}`));
  options.forEach((opt, i) => { console.log(`  ${chalk.cyan(i + 1 + '')}. ${opt}`); });
  console.log(chalk.dim('  0. 取消'));
  const answer = await askSetup(chalk.cyan('\n> '));
  const num = parseInt(answer.trim());
  if (isNaN(num) || num < 0 || num > options.length) return null;
  return num === 0 ? null : num - 1;
}

async function flowFirstSetup(cm: ConfigManager, ai: AIClient): Promise<{ handled: boolean; output?: string }> {
  console.log(chalk.bold('\n  欢迎使用 Forge CLI'));
  console.log(chalk.dim('  ─────────────────'));
  console.log('  检测到尚未配置模型，请选择一个 provider 开始:\n');

  const presetEntries = Object.entries(PROVIDER_PRESETS);
  const options = presetEntries.map(([key, preset]) => {
    const models = preset.models.slice(0, 3).join(', ') + (preset.models.length > 3 ? '...' : '');
    return `${chalk.cyan(key.padEnd(14))} ${models}`;
  });
  options.push(chalk.dim('自定义 provider'));

  const sel = await selectSetup('选择 Provider:', options);
  if (sel === null) return { handled: true, output: chalk.dim('已取消') };

  // 自定义
  if (sel === presetEntries.length) {
    return await setupCustomProvider(cm, ai);
  }

  const [providerKey, preset] = presetEntries[sel];

  // 输入 API Key
  console.log(chalk.yellow(`\n  请输入 ${providerKey} 的 API Key`));
  const apiKey = await askSetup(chalk.cyan('  API Key > '));
  if (!apiKey.trim()) return { handled: true, output: chalk.dim('已取消') };
  cm.setApiKey(providerKey, apiKey.trim());

  // 选择模型
  const modelOptions = preset.models.map(m => chalk.cyan(m));
  const modelSel = await selectSetup('选择默认模型:', modelOptions);
  const selectedModel = modelSel !== null ? preset.models[modelSel] : preset.models[0];

  cm.setSelectedModel(providerKey, selectedModel);
  ai.setModel(cm.getModel(providerKey, selectedModel));
  cm.save().catch(() => {});
  return { handled: true, output: renderSuccess(`配置完成！当前模型: ${providerKey} / ${selectedModel}`) };
}

async function setupCustomProvider(cm: ConfigManager, ai: AIClient): Promise<{ handled: boolean; output?: string }> {
  console.log(chalk.bold('\n  添加自定义 provider'));
  console.log(chalk.dim('  ─────────────────'));

  const name = await askSetup(chalk.cyan('  名称 > '));
  if (!name.trim()) return { handled: true, output: chalk.dim('已取消') };

  const baseUrl = await askSetup(chalk.cyan('  Base URL > '));
  if (!baseUrl.trim()) return { handled: true, output: chalk.dim('已取消') };

  const apiKey = await askSetup(chalk.cyan('  API Key > '));
  if (!apiKey.trim()) return { handled: true, output: chalk.dim('已取消') };

  const modelsStr = await askSetup(chalk.cyan('  模型（逗号分隔） > '));
  if (!modelsStr.trim()) return { handled: true, output: chalk.dim('已取消') };

  const models = modelsStr.split(',').map(m => m.trim()).filter(Boolean);
  if (models.length === 0) return { handled: true, output: renderError('至少需要一个模型') };

  cm.addCustomProvider(name.trim(), { name: name.trim(), base_url: baseUrl.trim(), api_key: apiKey.trim(), models });

  const modelOptions = models.map(m => chalk.cyan(m));
  const sel = await selectSetup('选择默认模型:', modelOptions);
  const selectedModel = sel !== null ? models[sel] : models[0];

  cm.setSelectedModel(name.trim(), selectedModel);
  ai.setModel(cm.getModel(name.trim(), selectedModel));
  cm.save().catch(() => {});
  return { handled: true, output: renderSuccess(`配置完成！当前模型: ${name.trim()} / ${selectedModel}`) };
}

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
  const defaultPk = configManager.getDefaultProvider();
  const currentModel = configManager.getModel();
  const aiClient = new AIClient(currentModel);

  // 首次运行引导
  if (!configManager.isConfigured()) {
    const { handled, output } = await flowFirstSetup(configManager, aiClient);
    if (handled && output) console.log(output);
  }

  // 清屏，移除启动命令残留和内部日志
  console.clear();

  // 临时禁用日志输出，避免初始化日志污染界面
  forgeLogger.setQuiet(true);

  registerAllTools();

  const orchestrator = new AgentOrchestrator(
    aiClient, contextManager, toolRegistry, config.project.root
  );

  // 等待异步初始化完成
  await orchestrator.waitForInit();

  // 恢复日志输出
  forgeLogger.setQuiet(false);

  // 再次清屏，确保界面干净
  console.clear();

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

  // 静态系统 prompt（可缓存，不包含动态内容）
  // 注意：这个字符串必须保持固定，任何变化都会导致缓存失效
  const STATIC_SYSTEM_PROMPT = `你是 Forge CLI，一个专业的 AI 开发助手。你帮助用户完成各种开发任务，包括需求分析、方案设计、代码实现和验证。
你支持多种编程语言和框架，包括但不限于 TypeScript、JavaScript、Python、Java、Go、Rust、Dart/Flutter 等。
你遵循结构化工作流：S1 需求分析 → S2 方案设计 → S3 任务拆分（可选）→ S4 实现 → S5 验证。
你可以使用工具来读写文件、执行命令、扫描项目、搜索代码、获取网页内容、搜索网络等。
可用工具：
- read_file: 读取文件内容（支持行号范围）
- write_file: 写入文件
- edit_file: 编辑文件（替换指定文本）
- list_files: 列出目录内容
- search_files: 搜索文件内容（正则）
- glob: 按模式搜索文件（如 **/*.ts）
- grep: 在文件中搜索内容（正则、支持上下文行）
- ls: 树形列出目录结构
- run_command: 执行 shell 命令
- fetch: 获取指定 URL 的网页内容（返回文本和链接）
- websearch: 使用网络搜索引擎搜索信息（无需 API Key，使用 DuckDuckGo）
- save_memory: 保存记忆（用户偏好、项目知识、重要决策），会自动检查写入门槛和去重
- read_memory: 读取/搜索记忆（支持语义召回，返回置信度和稳定性标记）
- delete_memory: 删除记忆
- compress_memory: 压缩记忆（合并相似条目、淘汰过期记忆）
重要：先用 glob/grep/ls 探索项目结构，再进行开发。
当需要获取网页内容时使用 fetch 工具，当需要搜索信息时使用 websearch 工具。
当了解到用户偏好、项目架构、重要决策时，主动用 save_memory 保存。
记忆有置信度标记：稳定记忆可直接使用，待验证记忆需要更多确认。
请用中文回复。`;

  // 设置静态系统 prompt（可缓存）
  contextManager.setSystemPrompt(STATIC_SYSTEM_PROMPT);

  // 记忆上下文作为动态上下文添加（放在消息列表最后，不污染缓存）
  if (memoryContext) {
    contextManager.setDynamicContext(`以下是已保存的记忆上下文：\n${memoryContext}`, 'high');
  }

  const defaultPk2 = configManager.getDefaultProvider();
  const displayModel = configManager.getProvider(defaultPk2)?.selected || currentModel.name;
  console.log(renderBanner(VERSION, `${defaultPk2}/${displayModel}`, config.project.root));

  // ─── 底部状态栏 ───────────────────────────────────────────
  // eslint-disable-next-line no-control-regex
  const stripAnsi = (s: string) => s.replace(/\x1B\[[0-9;]*m/g, '');

  // 工具调用统计
  let toolCallCount = 0;
  let toolCallStartTime = 0;
  let totalTokensUsed = 0;

  function printInputBar() {
    const w = process.stdout.columns || 80;
    const pk = configManager.getDefaultProvider();
    const modelName = `${pk}/${aiClient.getModel() || configManager.get().defaults.model}`;
    const pct = contextManager.getContextPercent();
    const totalTokens = contextManager.getTotalTokens();

    // 使用新的输入框布局（只显示输入提示和底部状态栏）
    const output = inputLayoutManager.render({
      statusData: {
        model: modelName,
        contextPercent: pct,
        totalTokens: totalTokens,
      },
      prompt: chalk.cyan('❯ '),
      showShortcuts: false,  // 快捷键已在 Banner 中显示
      shortcuts: [],
      width: w,
    });

    console.log(output);
  }

  // 打印工具调用统计摘要
  function printToolCallSummary() {
    if (toolCallCount === 0) return;

    const duration = Date.now() - toolCallStartTime;
    const durationStr = duration < 1000 ? `${duration}ms`
      : duration < 60000 ? `${(duration / 1000).toFixed(1)}s`
      : `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;

    const tokensStr = totalTokensUsed >= 1000000
      ? `${(totalTokensUsed / 1000000).toFixed(1)}M`
      : totalTokensUsed >= 1000
        ? `${(totalTokensUsed / 1000).toFixed(1)}K`
        : `${totalTokensUsed}`;

    console.log(chalk.dim(`\nDone (${toolCallCount} tool uses · ${tokensStr} tokens · ${durationStr})`));

    // 重置统计
    toolCallCount = 0;
    toolCallStartTime = 0;
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

    // 空输入时只显示提示符，不重新打印状态栏
    if (!input) {
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

        // 重置工具调用统计
        toolCallCount = 0;
        toolCallStartTime = Date.now();
        let groupStarted = false;

        let fullText = '';
        const toolResults: Array<{ name: string; result: string; success: boolean }> = [];

        for await (const event of orchestrator.executeStream(input)) {
          if (event.type === 'text') {
            // 收集完整文本，稍后统一渲染 Markdown
            fullText += event.content;
          } else if (event.type === 'tool-call') {
            toolCallCount++;

            // 第一个工具调用时开始分组
            if (!groupStarted) {
              console.log(taskGroupRenderer.startGroup('Tool Calls'));
              groupStarted = true;
            }

            try {
              const call = JSON.parse(event.content);
              taskGroupRenderer.addToolCall(call.name, call.args);
              console.log(taskGroupRenderer.renderToolCall(call.name, call.args));
            } catch {
              taskGroupRenderer.addToolCall(event.content);
              console.log(taskGroupRenderer.renderToolCall(event.content));
            }
          } else if (event.type === 'tool-result') {
            try {
              const result = JSON.parse(event.content);
              toolResults.push({
                name: result.name || 'unknown',
                result: typeof result.result === 'string' ? result.result : JSON.stringify(result.result),
                success: true,
              });
              taskGroupRenderer.completeToolCall(true);
            } catch {
              taskGroupRenderer.completeToolCall(true);
            }
          }
        }

        // 流式结束后渲染 Markdown 并输出
        if (fullText) {
          console.log(renderMarkdown(fullText));
        } else if (toolResults.length > 0) {
          // 如果没有对话文本但有工具结果，显示工具结果摘要
          console.log(chalk.dim('\n工具执行完成，未生成回复文本。'));
        }

        // 结束分组（在对话内容之后）
        if (groupStarted) {
          const groupEnd = taskGroupRenderer.endGroup();
          if (groupEnd) console.log(groupEnd);
        }

        // 显示统计摘要
        printToolCallSummary();
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
