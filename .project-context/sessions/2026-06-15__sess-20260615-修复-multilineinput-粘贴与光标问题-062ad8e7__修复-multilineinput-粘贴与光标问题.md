---
id: sess-20260615-修复-multilineinput-粘贴与光标问题-062ad8e7
title: 修复 MultilineInput 粘贴与光标问题
date: 2026-06-15
created_at: 2026-06-15T19:10:42+08:00
---

# 修复 MultilineInput 粘贴与光标问题

日期：2026-06-15
会话 ID：sess-20260615-修复-multilineinput-粘贴与光标问题-062ad8e7

# 修复 MultilineInput 粘贴与光标问题

日期：2026-06-15

## 摘要

成功修复了 MultilineInput 组件的粘贴与光标问题。通过研究 MiMo-Code 的实现，采用了新的方案：监听 Ctrl+V/Cmd+V 快捷键，主动读取剪贴板内容，而不是依赖 Ink 的 `useInput` 来检测粘贴事件。

## 决策

1. **粘贴检测方案**：放弃依赖 `useInput` 的 `input.includes('\n')` 检测，改用快捷键监听 + 主动读取剪贴板
2. **摘要显示**：粘贴内容超过阈值（3行或150字符）时显示 `[Pasted ~N lines]` 摘要
3. **内容存储**：实际粘贴内容存储在 `pastedParts` state 中，提交时再展开
4. **依赖选择**：使用 `clipboardy` 库读取剪贴板

## 已变更文件

- `src/ui/multiline-input.tsx` — 完全重写，实现新的粘贴处理逻辑
- `tsup.config.ts` — 添加 `clipboardy` 和 `react-devtools-core` 到 external 列表
- `package.json` — 添加 `clipboardy` 依赖

## 关键实现

```typescript
// 监听快捷键
if ((key.ctrl && input === 'v') || (key.meta && input === 'v')) {
  handlePaste();
  return;
}

// 读取剪贴板
const clipboardText = await clipboardy.read();
const lineCount = (pastedContent.match(/\n/g)?.length ?? 0) + 1;

if (lineCount >= 3 || pastedContent.length > 150) {
  // 显示摘要
  const summary = `[Pasted ~${lineCount} lines]`;
  // 存储实际内容
  setPastedParts(prev => [...prev, { summary, content: pastedContent, start, end }]);
} else {
  // 直接插入
  input.insertText(pastedContent);
}

// 提交时展开
const sortedParts = [...pastedParts].sort((a, b) => b.start - a.start);
for (const part of sortedParts) {
  finalValue = finalValue.slice(0, part.start) + part.content + finalValue.slice(part.end);
}
```

## 参考来源

- MiMo-Code (`/Users/agi00114/Downloads/MiMo-Code-main`)
  - `packages/opencode/src/cli/cmd/tui/component/prompt/index.tsx`
  - 使用 `@opentui` 框架的 `extmarks` 虚拟文本系统
  - 使用 `PasteEvent` 和 `decodePasteBytes` 处理粘贴事件

## 未决问题

1. **光标位置同步**：在某些边缘情况下，光标位置可能仍需优化
2. **性能优化**：大量粘贴内容时的性能可能需要优化

## 下一步

1. 在实际 CLI 环境中测试粘贴功能
2. 优化光标位置同步逻辑
3. 考虑添加粘贴历史记录功能

