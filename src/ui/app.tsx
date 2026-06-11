/**
 * Forge CLI 主界面组件（使用 Ink - React for CLI）
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useApp, useInput, useStdin } from 'ink';
import TextInput from 'ink-text-input';
import chalk from 'chalk';

// Banner ASCII Art
const FORGE_ART = [
  '███████╗ ██████╗ ██████╗  ██████╗ ███████╗',
  '██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝',
  '█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ',
  '██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ',
  '██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗',
  '╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
];

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

// App 属性
interface AppProps {
  version: string;
  model: string;
  projectRoot: string;
  onInput: (input: string) => Promise<void>;
  messages: Message[];
  isProcessing: boolean;
  toolCalls: ToolCall[];
  contextPercent: number;
  totalTokens: number;
}

/**
 * 主界面组件
 */
export function App({
  version,
  model,
  projectRoot,
  onInput,
  messages,
  isProcessing,
  toolCalls,
  contextPercent,
  totalTokens,
}: AppProps) {
  const [input, setInput] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const messagesEndRef = useRef(null);

  // 格式化 token 数量
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return `${tokens}`;
  };

  // 处理提交
  const handleSubmit = (value: string) => {
    if (value.trim()) {
      onInput(value.trim());
      setInput('');
      setShowBanner(false);
    }
  };

  // 渲染 Banner
  const renderBanner = () => (
    <Box flexDirection="column" marginBottom={1}>
      <Box>
        <Text cyan>╭────────────────────────────── Forge CLI v{version} ──────────────────────────────╮</Text>
      </Box>
      {FORGE_ART.map((line, i) => (
        <Box key={i}>
          <Text cyan>│</Text>
          <Text cyan bold>{line}</Text>
          <Text cyan>      │ /help   显示帮助           │</Text>
        </Box>
      ))}
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
        <Text cyan>│  Ctrl+C:中断 │ Ctrl+D:退出 │ /help:帮助 │ 直接输入内容开始对话                               │</Text>
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
          <Text>{msg.content}</Text>
        </Box>
      );
    }

    if (msg.role === 'system') {
      return (
        <Box key={msg.id} marginBottom={1}>
          <Text dimColor>* {msg.content}</Text>
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
        <Text yellow>{model}</Text>
        <Text dimColor> │ </Text>
        <Text green>{contextPercent}%</Text>
        <Text dimColor> │ </Text>
        <Text dimColor>{formatTokens(totalTokens)} tokens</Text>
      </Box>
    </Box>
  );

  return (
    <Box flexDirection="column" height="100%">
      {/* Banner */}
      {showBanner && renderBanner()}

      {/* 消息区域（可滚动） */}
      <Box flexDirection="column" flexGrow={1}>
        {messages.map(renderMessage)}
        {renderToolCalls()}
      </Box>

      {/* 固定底部：输入框 + 状态栏 */}
      <Box flexDirection="column">
        {/* 输入提示 */}
        <Box>
          <Text cyan>❯ </Text>
          <TextInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder={isProcessing ? '处理中...' : '输入内容开始对话'}
          />
        </Box>

        {/* 状态栏 */}
        {renderStatusBar()}
      </Box>
    </Box>
  );
}

export default App;
