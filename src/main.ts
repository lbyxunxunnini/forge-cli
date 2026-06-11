#!/usr/bin/env node

// 禁用 React DevTools
process.env.DEV = 'false';
process.env.NODE_ENV = 'production';

// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  // 忽略 react-devtools-core 相关的错误
  if (reason instanceof Error && reason.message.includes('react-devtools-core')) {
    return;
  }
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// 使用 Ink REPL（固定底部输入框和状态栏）
import { startInkREPL } from './cli/repl-ink.js';

startInkREPL().catch(console.error);
