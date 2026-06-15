/**
 * Forge CLI REPL（使用 Ink - React for CLI）
 * 实现固定底部输入框和状态栏
 */

// 禁用 React DevTools（必须在导入 ink 之前）
process.env.DEV = 'false';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { render, Box, Text, useApp, useInput, useStdin } from 'ink';
import chalk from 'chalk';
import { configManager } from '../config/manager.js';
import { contextManager } from '../llm/context.js';
import { AIClient } from '../llm/client-v2.js';
import { AgentOrchestrator } from '../agents/index.js';
import { registerAllTools, toolRegistry } from '../tools/index.js';
import { handleCommand, getAvailableCommands } from './commands.js';
import { renderMarkdown } from './renderer.js';
import { VERSION } from '../version.js';
import { memoryManager } from '../memory/manager.js';
import { permissionManager } from '../permissions/manager.js';
import { forgeLogger } from '../output/logger.js';
import { taskGroupRenderer } from './task-group.js';
import { MultilineInput } from '../ui/multiline-input.js';
import { CommandPalette, Command } from '../ui/command-palette.js';
import { projectMemoryManager } from '../memory/project-memory.js';
import { ConversationLog } from '../memory/conversation-log.js';

// Banner ASCII Art
const FORGE_ART = [
  '███████╗ ██████╗ ██████╗  ██████╗ ███████╗',
  '██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝',
  '█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ',
  '██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ',
  '██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗',
  '╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
];

// 生成 session ID
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

// 消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
}

// 工具调用类型
interface ToolCall {
  name: string;
  args?: Record<string, any>;
  startTime: number;
  endTime?: number;
  success?: boolean;
}

/**
 * 主界面组件
 */
function ForgeApp({ resumeSessionId }: { resumeSessionId?: string | null }) {
  const { exit } = useApp();
  const [sessionId, setSessionId] = useState<string>(() => resumeSessionId || generateSessionId());
  const [isResuming, setIsResuming] = useState(!!resumeSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [contextPercent, setContextPercent] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [cacheHitRate, setCacheHitRate] = useState(0);
  const [model, setModel] = useState('');
  const [projectRoot, setProjectRoot] = useState('.');
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const orchestratorRef = useRef<AgentOrchestrator | null>(null);
  const aiClientRef = useRef<AIClient | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [ctrlCCount, setCtrlCCount] = useState(0);
  const conversationLogRef = useRef<ConversationLog | null>(null);

  // 保存会话并退出
  const saveAndExit = useCallback(() => {
    // 刷新对话日志缓冲区
    conversationLogRef.current?.destroy();

    // 保存会话到项目记忆（使用 sessionId 作为文件名，避免重复）
    const history = contextManager.getHistory();
    if (history.length > 0) {
      const modelName = aiClientRef.current?.getModel() || 'unknown';
      // 使用 sessionId 作为导出 ID，如果已存在则覆盖
      projectMemoryManager.exportSession(history, modelName, sessionId);
      console.log(chalk.dim(`\n会话已保存: ${sessionId}`));
    }
    // 显示恢复提示
    console.log(chalk.dim('────────────────────────────────────────────────────────────────────────────────'));
    console.log(chalk.yellow('Resume this session with:'));
    console.log(chalk.cyan(`  forge --resume ${sessionId}`));
    console.log('');
    exit();
  }, [sessionId, exit]);

  // 输入历史记录
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tempInput, setTempInput] = useState('');

  // 命令面板状态
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0);
  const availableCommands = useMemo(() => getAvailableCommands(), []);

  // 过滤命令列表
  const filteredCommands = useMemo(() => {
    if (!input.startsWith('/')) return [];
    const search = input.toLowerCase();
    return availableCommands.filter(cmd =>
      cmd.command.toLowerCase().startsWith(search) ||
      cmd.description.toLowerCase().includes(search.slice(1))
    ).slice(0, 8);
  }, [input, availableCommands]);

  // 监听输入变化，显示/隐藏命令面板
  useEffect(() => {
    setShowCommandPalette(input.startsWith('/') && filteredCommands.length > 0);
    setCommandSelectedIndex(0);
  }, [input, filteredCommands]);

  // Ctrl+C 计数器和定时器
  const ctrlCTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 处理键盘快捷键
  useInput((inputChar, key) => {
    // Ctrl+C: 中断当前操作或退出
    if (key.ctrl && inputChar === 'c') {
      if (isProcessing) {
        // 有任务时：中断当前操作
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setIsProcessing(false);
        setToolCalls([]);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: '操作已中断',
          timestamp: Date.now(),
        }]);
        setCtrlCCount(0);
      } else {
        // 无任务时：需要按两次才退出
        setCtrlCCount(prev => prev + 1);

        if (ctrlCCount >= 1) {
          // 第二次按下，保存会话并退出
          saveAndExit();
        } else {
          // 第一次按下，提示
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: '再按一次 Ctrl+C 退出',
            timestamp: Date.now(),
          }]);

          // 清除之前的定时器
          if (ctrlCTimerRef.current) {
            clearTimeout(ctrlCTimerRef.current);
          }

          // 1.5 秒后重置计数
          ctrlCTimerRef.current = setTimeout(() => {
            setCtrlCCount(0);
          }, 1500);
        }
      }
      return;
    }

    // Ctrl+D: 退出
    if (key.ctrl && inputChar === 'd') {
      saveAndExit();
      return;
    }

    // 命令面板导航
    if (showCommandPalette) {
      // 上键：选择上一个命令
      if (key.upArrow) {
        setCommandSelectedIndex(prev => Math.max(0, prev - 1));
        return;
      }
      // 下键：选择下一个命令
      if (key.downArrow) {
        setCommandSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
        return;
      }
      // Tab：补全选中的命令
      if (key.tab) {
        const selected = filteredCommands[commandSelectedIndex];
        if (selected) {
          setInput(selected.command + ' ');
          setShowCommandPalette(false);
        }
        return;
      }
      // Esc：关闭命令面板
      if (key.escape) {
        setShowCommandPalette(false);
        return;
      }
    }

    // 输入历史导航（命令面板关闭时）
    if (!showCommandPalette && inputHistory.length > 0) {
      if (key.upArrow) {
        // 保存当前输入
        if (historyIndex === -1) {
          setTempInput(input);
        }

        const newIndex = Math.min(historyIndex + 1, inputHistory.length - 1);
        setHistoryIndex(newIndex);
        setInput(inputHistory[newIndex]);
        return;
      }

      if (key.downArrow) {
        if (historyIndex <= 0) {
          // 恢复临时输入
          setHistoryIndex(-1);
          setInput(tempInput);
        } else {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(inputHistory[newIndex]);
        }
        return;
      }
    }

    // 其他按键重置 Ctrl+C 计数和历史索引
    if (!(key.ctrl && inputChar === 'c')) {
      setCtrlCCount(0);
      if (ctrlCTimerRef.current) {
        clearTimeout(ctrlCTimerRef.current);
        ctrlCTimerRef.current = null;
      }
    }
  });

  // 初始化
  useEffect(() => {
    const init = async () => {
      // 清屏
      console.clear();

      // 禁用日志
      forgeLogger.setQuiet(true);

      // 加载配置
      const config = await configManager.load();

      // 创建 AI 客户端
      const defaultPk = configManager.getDefaultProvider();
      const currentModel = configManager.getModel();
      const aiClient = new AIClient(currentModel);

      // 注册工具
      registerAllTools();

      // 初始化权限管理器
      permissionManager.setProjectRoot(config.project.root);

      // 创建 orchestrator
      const orchestrator = new AgentOrchestrator(
        aiClient, contextManager, toolRegistry, config.project.root
      );

      // 等待初始化完成
      await orchestrator.waitForInit();

      // 保存到 ref
      orchestratorRef.current = orchestrator;
      aiClientRef.current = aiClient;

      // 恢复日志
      forgeLogger.setQuiet(false);

      // 初始化对话日志
      const log = new ConversationLog(sessionId);
      conversationLogRef.current = log;

      // 设置模型和项目路径
      const displayModel = configManager.getProvider(defaultPk)?.selected || currentModel.name;
      setModel(`${defaultPk}/${displayModel}`);
      setProjectRoot(config.project.root);

      // 设置系统 prompt
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

      contextManager.setSystemPrompt(STATIC_SYSTEM_PROMPT);

      // 加载记忆上下文
      const memoryContext = memoryManager.getContextString();
      if (memoryContext) {
        contextManager.setDynamicContext(`以下是已保存的记忆上下文：\n${memoryContext}`, 'high');
      }

      // 更新上下文状态
      updateContextStatus();

      // 如果是恢复会话，加载历史
      if (resumeSessionId) {
        // 优先从对话日志加载（更完整）
        let history = ConversationLog.loadSession(resumeSessionId);
        let source = '对话日志';

        // 如果日志没有，从 project-memory 加载
        if (!history || history.length === 0) {
          history = projectMemoryManager.load(resumeSessionId);
          source = '会话记忆';
        }

        if (history && history.length > 0) {
          // 将历史消息注入到上下文
          for (const msg of history) {
            contextManager.addMessage(msg);
          }
          // 更新 UI 显示历史消息
          const uiMessages: Message[] = history
            .filter(msg => msg.role === 'user' || msg.role === 'assistant')
            .map((msg, i) => ({
              id: `history-${i}`,
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              timestamp: Date.now(),
            }));
          setMessages(uiMessages);
          setIsResuming(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `已从${source}恢复会话: ${resumeSessionId} (${history.length} 条消息)`,
            timestamp: Date.now(),
          }]);
        } else {
          setIsResuming(false);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: `无法恢复会话: ${resumeSessionId}`,
            timestamp: Date.now(),
          }]);
        }
      }
    };

    init();
  }, []);

  // 更新上下文状态
  const updateContextStatus = () => {
    setContextPercent(contextManager.getContextPercent());
    setTotalTokens(contextManager.getTotalTokens());
    setCacheHitRate(contextManager.getCacheHitRate());
    // 同步活跃工作流状态
    if (orchestratorRef.current) {
      setActiveWorkflow(orchestratorRef.current.getActiveWorkflow());
    }
  };

  // 格式化 token 数量
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${tokens}`;
  };

  // 处理提交
  const handleSubmit = useCallback(async (value: string) => {
    if (!value.trim() || isProcessing) return;

    // 保存到历史记录
    const trimmedValue = value.trim();
    setInputHistory(prev => {
      const newHistory = [trimmedValue, ...prev.filter(h => h !== trimmedValue)];
      return newHistory.slice(0, 100); // 最多保存 100 条
    });
    setHistoryIndex(-1);
    setTempInput('');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // 记录用户消息到对话日志
    conversationLogRef.current?.log('user', trimmedValue);

    // 创建 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // 处理命令
      const result = await handleCommand(value.trim(), configManager, contextManager, aiClientRef.current!, orchestratorRef.current!);
      if (result.handled) {
        if (result.output) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: result.output,
            timestamp: Date.now(),
          }]);
        }
        if (result.shouldExit) {
          saveAndExit();
          return;
        }
        setIsProcessing(false);
        updateContextStatus();
        return;
      }

      // 调用 AI 生成回复
      if (!orchestratorRef.current) {
        throw new Error('AI 客户端未初始化');
      }

      let fullText = '';
      const currentToolCalls: ToolCall[] = [];

      for await (const event of orchestratorRef.current.executeStream(value.trim())) {
        // 检查是否被中断
        if (abortController.signal.aborted) {
          break;
        }

        if (event.type === 'text') {
          fullText += event.content;
        } else if (event.type === 'tool-call') {
          try {
            const call = JSON.parse(event.content);
            currentToolCalls.push({
              name: call.name,
              args: call.args,
              startTime: Date.now(),
            });
            setToolCalls([...currentToolCalls]);
          } catch {
            currentToolCalls.push({
              name: event.content,
              startTime: Date.now(),
            });
            setToolCalls([...currentToolCalls]);
          }
        } else if (event.type === 'tool-result') {
          const lastCall = currentToolCalls[currentToolCalls.length - 1];
          if (lastCall) {
            lastCall.endTime = Date.now();
            lastCall.success = true;
            setToolCalls([...currentToolCalls]);
          }
        }
      }

      // 检查是否被中断
      if (abortController.signal.aborted) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: '操作已中断',
          timestamp: Date.now(),
        }]);
        conversationLogRef.current?.log('system', '操作已中断');
      } else if (fullText) {
        // 添加 AI 回复
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: fullText,
          timestamp: Date.now(),
        }]);
        // 记录助手回复到对话日志
        conversationLogRef.current?.log('assistant', fullText);
      }

      // 清空工具调用
      setToolCalls([]);
      setIsProcessing(false);
      abortControllerRef.current = null;
      updateContextStatus();
    } catch (error: any) {
      // 忽略中断错误
      if (error.name === 'AbortError') {
        return;
      }
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `错误: ${error.message}`,
        timestamp: Date.now(),
      }]);
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  }, [isProcessing, exit]);

  // 右侧命令列表
  const rightCommands = [
    '/help   显示帮助',
    '/model  模型管理',
    '/clear  清空上下文',
    '/status 显示状态',
    '/exit   退出程序',
  ];

  // ASCII Art 固定宽度（每行 42 字符）
  const FORGE_ART_LINES = [
    '███████╗ ██████╗ ██████╗  ██████╗ ███████╗',
    '██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝',
    '█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ',
    '██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ',
    '██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗',
    '╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
  ];

  // 渲染 Banner
  const renderBanner = () => (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text cyan>╭────────────────────────────── Forge CLI v{VERSION} ──────────────────────────────╮</Text>
      </Box>
      {FORGE_ART_LINES.map((line, i) => {
        const cmd = rightCommands[i] || '';
        const padding = Math.max(0, 26 - cmd.length);
        return (
          <Box key={i}>
            <Text cyan>│</Text>
            <Text cyan bold>{line}</Text>
            <Text cyan>│ </Text>
            <Text white>{cmd}</Text>
            <Text cyan>{' '.repeat(padding)}│</Text>
          </Box>
        );
      })}
      <Box>
        <Text cyan>├──────────────────────────────────────────────────────────────────────────────┤</Text>
      </Box>
      <Box>
        <Text cyan>│  模型: </Text>
        <Text yellow>{model}</Text>
        <Text cyan>    项目: </Text>
        <Text white>{projectRoot}</Text>
        <Text cyan>                                     │</Text>
      </Box>
      <Box>
        <Text cyan>│  Session: </Text>
        <Text dimColor>{sessionId}</Text>
        {isResuming && <Text yellow> (恢复中)</Text>}
        <Text cyan>                          │</Text>
      </Box>
      <Box>
        <Text cyan>│  Ctrl+C:中断 │ Ctrl+D:退出 │ /help:帮助 │ 直接输入内容开始对话                 │</Text>
      </Box>
      <Box>
        <Text cyan>╰──────────────────────────────────────────────────────────────────────────────╯</Text>
      </Box>
    </Box>
  );

  // 渲染消息
  const renderMessage = (msg: Message) => {
    if (msg.role === 'user') {
      return (
        <Box key={msg.id} marginBottom={1}>
          <Text yellow>❯ </Text>
          <Text>{msg.content}</Text>
        </Box>
      );
    }

    if (msg.role === 'assistant') {
      return (
        <Box key={msg.id} marginBottom={1} flexDirection="column">
          <Text green>▸ </Text>
          <Text>{renderMarkdown(msg.content)}</Text>
        </Box>
      );
    }

    if (msg.role === 'system') {
      return (
        <Box key={msg.id} marginBottom={1}>
          <Text dimColor>{msg.content}</Text>
        </Box>
      );
    }

    return null;
  };

  // 渲染工具调用
  const renderToolCalls = () => {
    if (toolCalls.length === 0) return null;

    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text cyan>┌─────────────────────────── Tool Calls ───────────────────────────┐</Text>
        </Box>
        {toolCalls.map((call, i) => (
          <Box key={i}>
            <Text cyan>│  </Text>
            <Text yellow>⏺ </Text>
            <Text white>{call.name}</Text>
            {call.args && (
              <Text dimColor> → {Object.entries(call.args).map(([k, v]) => `${k}=${String(v).slice(0, 30)}`).join(', ')}</Text>
            )}
          </Box>
        ))}
        <Box>
          <Text cyan>└──────────────────────────────────────────────────────────────────┘</Text>
        </Box>
      </Box>
    );
  };

  // 渲染底部状态栏
  const renderStatusBar = () => (
    <Box flexDirection="column">
      <Box>
        <Text dimColor>────────────────────────────────────────────────────────────────────────────────</Text>
      </Box>
      <Box>
        {activeWorkflow && (
          <>
            <Text yellow>[{activeWorkflow}]</Text>
            <Text dimColor> │ </Text>
          </>
        )}
        <Text yellow>{model}</Text>
        <Text dimColor> │ </Text>
        <Text green>{contextPercent}%</Text>
        <Text dimColor> │ </Text>
        <Text dimColor>{formatTokens(totalTokens)} tokens</Text>
        {cacheHitRate > 0 && (
          <>
            <Text dimColor> │ </Text>
            <Text green>cache {cacheHitRate.toFixed(0)}%</Text>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column">
      {/* Banner */}
      {showBanner && renderBanner()}

      {/* 消息区域 */}
      <Box flexDirection="column">
        {messages.map(renderMessage)}
        {renderToolCalls()}
      </Box>

      {/* 分隔线 */}
      <Box>
        <Text dimColor>────────────────────────────────────────────────────────────────────────────────</Text>
      </Box>

      {/* 命令面板 */}
      {showCommandPalette && (
        <Box flexDirection="column" marginBottom={1}>
          <Box borderStyle="round" borderColor="cyan" flexDirection="column" paddingX={1} paddingY={0}>
            {filteredCommands.map((cmd, i) => (
              <Box key={cmd.command}>
                <Text>
                  {i === commandSelectedIndex ? <Text cyan>❯ </Text> : <Text>  </Text>}
                  <Text bold={i === commandSelectedIndex} color={i === commandSelectedIndex ? 'cyan' : 'white'}>
                    {cmd.command}
                  </Text>
                  {cmd.args && <Text dimColor> {cmd.args}</Text>}
                  <Text dimColor> — {cmd.description}</Text>
                </Text>
              </Box>
            ))}
          </Box>
          <Text dimColor>  ↑↓ 选择 · Tab 补全 · Esc 取消</Text>
        </Box>
      )}

      {/* 固定底部：输入框 + 状态栏 */}
      <Box flexDirection="column">
        {/* 输入提示 */}
        <Box>
          <Text cyan>❯ </Text>
          <Box flexGrow={1}>
            <MultilineInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              placeholder={isProcessing ? '处理中...' : activeWorkflow ? `[${activeWorkflow}] 输入内容...` : '输入内容开始对话'}
              focus={!isProcessing}
              multiline={true}
            />
          </Box>
        </Box>

        {/* 状态栏 */}
        {renderStatusBar()}
      </Box>
    </Box>
  );
}

/**
 * 启动 Ink REPL
 * @param resumeSessionId 可选的 session ID，用于恢复之前的会话
 */
export async function startInkREPL(resumeSessionId?: string | null): Promise<void> {
  // 检查 stdin 是否是 TTY
  if (!process.stdin.isTTY) {
    // 如果不是 TTY（例如通过管道输入），使用传统的 readline REPL
    const { startREPL } = await import('./repl.js');
    return startREPL();
  }

  const { waitUntilExit } = render(<ForgeApp resumeSessionId={resumeSessionId} />);
  await waitUntilExit();
}

export default { startInkREPL };
