/**
 * Forge CLI UI 入口（使用 Ink - React for CLI）
 */

import React from 'react';
import { render } from 'ink';
import { App } from './app.js';

// UI 实例
let appInstance: any = null;

// 启动 UI
export function startUI(options: {
  version: string;
  model: string;
  projectRoot: string;
  onInput: (input: string) => Promise<void>;
}) {
  const { waitUntilExit } = render(
    <App
      version={options.version}
      model={options.model}
      projectRoot={options.projectRoot}
      onInput={options.onInput}
      messages={[]}
      isProcessing={false}
      toolCalls={[]}
      contextPercent={0}
      totalTokens={0}
    />
  );

  appInstance = { waitUntilExit };
  return appInstance;
}

// 更新 UI 状态
export function updateUI(state: {
  messages?: any[];
  isProcessing?: boolean;
  toolCalls?: any[];
  contextPercent?: number;
  totalTokens?: number;
}) {
  // Ink 使用 React 状态管理，需要通过 props 更新
  // 这里需要重新渲染组件
}

export default { startUI, updateUI };
