---
id: sess-20260615-修复-multilineinput-粘贴与光标问题-未完成-415f29a9
title: 修复 MultilineInput 粘贴与光标问题（未完成）
date: 2026-06-15
created_at: 2026-06-15T18:44:02+08:00
---

# 修复 MultilineInput 粘贴与光标问题（未完成）

日期：2026-06-15
会话 ID：sess-20260615-修复-multilineinput-粘贴与光标问题-未完成-415f29a9

# 修复 MultilineInput 粘贴与光标问题（未完成）

日期：2026-06-15

## 摘要

用户提出三个 MultilineInput 组件的问题：
1. 粘贴多行代码后，无法像 Claude Code 一样显示 `[Pasted text +N lines]` 摘要
2. 粘贴后光标位置不在内容最后面，退格删除位置异常
3. 输入时看不到光标位置

多次尝试修复，但粘贴后光标位置问题始终未解决。核心难点是 Ink 框架的 `useInput` 在处理终端粘贴时的行为不明确——换行符可能被当作 Enter 键事件处理，而非作为 `input` 参数传递。

## 决策

- 尝试了基于行数变化的粘贴检测（不可靠）
- 尝试了基于 `input.includes('\n')` 的粘贴检测（Ink 可能不传递换行符）
- 尝试了直接监听 stdin `data` 事件（与 Ink 的 useInput 冲突）
- 尝试了粘贴摘要折叠显示（导致光标位置和可见行不匹配，问题更严重）
- 最终简化为：摘要显示在输入区上方，不折叠行（但粘贴检测仍不可靠）

## 已变更或重要文件

- `src/ui/multiline-input.tsx` — 多次修改，添加粘贴检测、光标渲染、摘要显示逻辑

## 未决问题

1. **Ink useInput 粘贴行为**：不确定 `useInput` 在终端粘贴多行文本时，换行符是作为 `input` 参数的一部分传递，还是被解释为 `key.return` 事件。需要查看 Ink 源码或社区 issue 确认。
2. **粘贴检测方案**：需要找到可靠的方式检测粘贴事件，可能需要：
   - 直接使用 `process.stdin` 的原始数据流
   - 使用 bracketed paste 检测（终端转义序列 `\x1b[200~` ... `\x1b[201~`）
   - 基于时间窗口的输入聚合（短时间内大量字符输入视为粘贴）
3. **光标位置同步**：即使检测到粘贴，光标位置的同步仍需确保 `cursorPos` 和 `lines` 数组的一致性。

## 下一步

1. 搜索 Ink GitHub issues 中关于 paste/multiline 的讨论
2. 查看 Ink 源码中 `useInput` 的实现，确认换行符处理方式
3. 考虑使用 `readline` 或直接 stdin 监听替代 `useInput` 来处理多行输入
4. 参考 Claude Code、ChatGPT CLI 等成熟 CLI 工具的输入处理方式

