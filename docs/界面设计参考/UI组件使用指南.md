# Forge CLI UI 组件使用指南

> 基于 Claude Code CLI 源码分析实现的 UI 组件库

## 快速开始

```typescript
import {
  // 主题系统
  getTheme, setTheme, getThemeName, t,

  // Spinner
  SpinnerV2, createSpinner, withSpinner,

  // 渲染器
  renderBanner, renderStatusBar, renderUserMessage,
  renderAssistantMessage, renderMarkdown, renderTable,

  // 输入
  prompt, confirm, select,

  // 快捷键
  keybindingManager,
} from './cli/index.js'
```

---

## 1. 主题系统

### 基本使用

```typescript
import { getTheme, setTheme, getThemeName, getAvailableThemes } from './cli/theme.js'

// 获取当前主题
const theme = getTheme()

// 切换主题
setTheme('light')  // 可选: dark/light/light-daltonized/dark-daltonized/light-ansi/dark-ansi

// 获取当前主题名称
console.log(getThemeName())  // 'dark'

// 获取所有可用主题
console.log(getAvailableThemes())  // ['dark', 'light', ...]
```

### 主题化文本

```typescript
import { t } from './cli/theme.js'

// 使用主题化工具函数
console.log(t.claude('这是主色调'))
console.log(t.success('这是成功颜色'))
console.log(t.error('这是错误颜色'))
console.log(t.warning('这是警告颜色'))
console.log(t.subtle('这是辅助颜色'))
console.log(t.highlight('这是高亮颜色'))
```

### 自定义主题颜色

```typescript
import { getTheme } from './cli/theme.js'

const theme = getTheme()

// 直接使用 chalk 颜色
console.log(theme.claude('粉紫色文本'))
console.log(theme.success('绿色成功'))
console.log(theme.error('红色错误'))
console.log(theme.warning('黄色警告'))
console.log(theme.subtle('灰色辅助'))
console.log(theme.permission('金色权限'))
console.log(theme.ide('绿色 IDE'))
```

---

## 2. Spinner 组件

### 基本使用

```typescript
import { createSpinner, SpinnerV2 } from './cli/spinner-v2.js'

// 创建 Spinner
const spinner = createSpinner('处理中...')

// 启动
spinner.start()

// 更新文本
spinner.setText('分析代码...')

// 报告活动（重置卡住检测）
spinner.reportActivity()

// 成功完成
spinner.succeed('任务完成')

// 失败
spinner.fail('任务失败')
```

### 高级选项

```typescript
import { SpinnerV2 } from './cli/spinner-v2.js'

const spinner = new SpinnerV2({
  text: '初始化中...',
  showTimer: true,              // 显示计时器
  enableVerbAnimation: true,    // 启用动词动画
  enableStallDetection: true,   // 启用卡住检测
  stallThresholdMs: 30000,      // 卡住阈值（30 秒）
  verbs: ['思考中', '分析中', '处理中'],  // 自定义动词列表
})

spinner.start()
```

### 使用包装器

```typescript
import { withSpinner } from './cli/spinner-v2.js'

// 自动管理 Spinner 生命周期
const result = await withSpinner('加载数据', async () => {
  const data = await fetchData()
  return data
})
```

---

## 3. 渲染器

### 状态行

```typescript
import { renderStatusBar, renderDetailedStatusBar } from './cli/renderer-v2.js'

// 基础状态行
console.log(renderStatusBar({
  model: 'deepseek-chat',
  currentDir: '/path/to/project',
  contextPercent: 45,
}))

// 详细状态行
console.log(renderDetailedStatusBar({
  model: 'deepseek-chat',
  currentDir: '/path/to/project',
  cost: 0.0025,
  duration: 125000,
  contextPercent: 45,
  permissionMode: 'auto',
  vimMode: 'normal',
}))
```

### 消息渲染

```typescript
import {
  renderUserMessage,
  renderAssistantMessage,
  renderSystemMessage,
  renderToolUse,
  renderToolResult,
} from './cli/renderer-v2.js'

// 用户消息
console.log(renderUserMessage('请帮我分析这段代码'))

// Assistant 消息
console.log(renderAssistantMessage('好的，我来帮你分析...'))

// 系统消息
console.log(renderSystemMessage('工具调用完成'))

// 工具调用
console.log(renderToolUse('readFile', { path: '/src/main.ts' }))

// 工具结果
console.log(renderToolResult('文件内容已读取'))
```

### Markdown 渲染

```typescript
import { renderMarkdown } from './cli/renderer-v2.js'

console.log(renderMarkdown(`
# 标题

这是 **粗体** 和 *斜体* 的示例。

\`inline code\` 和 ~~删除线~~。

- 列表项 1
- 列表项 2

> 这是引用

\`\`\`typescript
function hello() {
  console.log("Hello!")
}
\`\`\`
`))
```

### 表格渲染

```typescript
import { renderTable } from './cli/renderer-v2.js'

console.log(renderTable(
  ['名称', '状态', '说明'],
  [
    ['主题系统', '✓', '已完成'],
    ['Spinner', '✓', '已完成'],
    ['输入组件', '✓', '已完成'],
    ['虚拟列表', '✗', '未开始'],
  ]
))
```

### 进度条

```typescript
import { renderProgressBar } from './cli/renderer-v2.js'

console.log(renderProgressBar(75, 100, 30))
// 输出: ██████████████████████████░░░░░ 75%
```

### 列表和键值对

```typescript
import { renderList, renderKeyValue, renderDivider } from './cli/renderer-v2.js'

// 无序列表
console.log(renderList(['项目1', '项目2', '项目3']))

// 有序列表
console.log(renderList(['步骤1', '步骤2', '步骤3'], true))

// 键值对
console.log(renderKeyValue('模型', 'deepseek-chat'))
console.log(renderKeyValue('上下文', '45%'))

// 分隔线
console.log(renderDivider(40))
```

---

## 4. 输入组件

### 简单输入

```typescript
import { prompt, confirm, select } from './cli/input.js'

// 简单输入
const name = await prompt('请输入名称: ')

// 确认对话框
const ok = await confirm('是否继续?')

// 带默认值的确认
const ok2 = await confirm('是否继续?', true)

// 选择对话框
const choice = await select('请选择:', ['选项1', '选项2', '选项3'])
```

### 高级输入

```typescript
import { InputManager } from './cli/input.js'

const manager = new InputManager()

// 设置自动补全建议
manager.setSuggestions([
  { type: 'command', label: '/help', value: '/help', description: '显示帮助' },
  { type: 'command', label: '/model', value: '/model', description: '模型管理' },
  { type: 'file', label: 'main.ts', value: 'main.ts' },
])

// 获取输入
const result = await manager.getInput({
  prompt: '❯ ',
  mode: 'normal',
})

console.log(result.text)
console.log(result.mode)
console.log(result.cancelled)

// 清理资源
manager.cleanup()
```

---

## 5. 快捷键系统

### 基本使用

```typescript
import { keybindingManager } from './cli/keybindings.js'

// 注册快捷键处理函数
keybindingManager.on('app:interrupt', () => {
  console.log('Ctrl+C 被按下')
  process.exit(0)
})

keybindingManager.on('chat:cancel', () => {
  console.log('Escape 被按下')
})

// 处理按键事件
keybindingManager.handleKey('ctrl+c')
keybindingManager.handleKey('escape')
```

### 自定义快捷键

```typescript
import { keybindingManager } from './cli/keybindings.js'

// 添加自定义快捷键
keybindingManager.addBinding({
  key: 'ctrl+shift+f',
  action: 'app:globalSearch',
  context: 'Global',
  description: '全局搜索',
})

// 移除快捷键
keybindingManager.removeBinding('ctrl+t', 'Global')

// 获取所有绑定
const bindings = keybindingManager.getBindings()

// 获取帮助文本
console.log(keybindingManager.getHelpText())
```

### 上下文管理

```typescript
import { keybindingManager } from './cli/keybindings.js'

// 设置当前上下文
keybindingManager.setContext('Chat')
keybindingManager.setContext('Autocomplete')
keybindingManager.setContext('Settings')

// 获取当前上下文
const context = keybindingManager.getContext()
```

---

## 6. 消息系统

### 基本使用

```typescript
import { MessageManager, MessageRenderer } from './cli/message-system.js'

// 创建消息管理器
const manager = new MessageManager()

// 添加消息
manager.addUser('请帮我分析这段代码')
manager.addAssistant('好的，我来帮你分析...')
manager.addSystem('工具调用完成')
manager.addToolUse('readFile', { path: '/src/main.ts' })
manager.addToolResult('readFile', '文件内容已读取')
manager.addError('发生错误')
manager.addWarning('警告信息')

// 获取消息
const message = manager.get('1')
const allMessages = manager.getAll()
const recentMessages = manager.getRecent(10)

// 搜索消息
const results = manager.search('分析')

// 获取上下文（用于 LLM）
const context = manager.getContext(4000)
```

### 消息渲染

```typescript
import { MessageRenderer } from './cli/message-system.js'

const renderer = new MessageRenderer({
  showTimestamp: true,
  showMetadata: true,
  showActions: true,
  maxWidth: 80,
})

// 渲染单条消息
const message = manager.get('1')
if (message) {
  console.log(renderer.render(message))
}
```

---

## 7. 布局系统

### 基本使用

```typescript
import { LayoutManager } from './cli/layout.js'

const layout = new LayoutManager()

// 获取终端尺寸
console.log(`宽度: ${layout.getWidth()}`)
console.log(`高度: ${layout.getHeight()}`)
```

### 全屏布局

```typescript
// 渲染全屏布局
const content = layout.renderFullscreenLayout({
  top: '状态行内容',
  middle: '主要内容\n第二行\n第三行',
  bottom: '输入框内容',
  showBorders: true,
})
console.log(content)
```

### 分割布局

```typescript
// 渲染左右分割布局
const content = layout.renderSplitLayout({
  left: '左侧面板\n内容1\n内容2',
  right: '右侧面板\n内容3\n内容4',
  splitRatio: 0.5,
  showBorders: true,
})
console.log(content)
```

### 盒子和面板

```typescript
// 渲染盒子
const box = layout.renderBox('盒子内容', {
  title: '标题',
  width: 40,
  padding: 1,
  border: true,
})
console.log(box)

// 渲染面板（居中）
const panel = layout.renderPanel('面板内容', {
  title: '面板标题',
  width: 50,
  position: 'center',
})
console.log(panel)
```

### 对话框

```typescript
// 渲染对话框
const dialog = layout.renderDialog('对话框内容', {
  title: '提示',
  width: 40,
  showClose: true,
})
console.log(dialog)
```

### 表格和列表

```typescript
// 渲染表格
const table = layout.renderTable(
  ['名称', '状态', '说明'],
  [
    ['组件1', '✓', '已完成'],
    ['组件2', '✗', '未开始'],
  ]
)
console.log(table)

// 渲染列表
const list = layout.renderList(['项目1', '项目2', '项目3'], {
  ordered: true,
  indent: 2,
})
console.log(list)

// 渲染键值对
console.log(layout.renderKeyValue('模型', 'deepseek-chat'))
console.log(layout.renderKeyValue('上下文', '45%'))

// 渲染分隔线
console.log(layout.renderDivider(40))
```

### 屏幕控制

```typescript
// 清除屏幕
layout.clearScreen()

// 移动光标
layout.moveCursor(10, 5)

// 保存/恢复光标位置
layout.saveCursor()
// ... 渲染内容 ...
layout.restoreCursor()

// 清除当前行
layout.clearLine()
```

---

## 8. 对话框系统

### 基本使用

```typescript
import { DialogManager, dialogManager } from './cli/dialog.js'

// 使用全局实例
// 或创建新实例
const manager = new DialogManager()
```

### 信息对话框

```typescript
// 显示信息
dialogManager.showInfo('提示', '操作已完成')

// 显示警告
dialogManager.showWarning('警告', '请谨慎操作')

// 显示错误
dialogManager.showError('错误', '操作失败')
```

### 确认对话框

```typescript
// 显示确认对话框
const confirmed = await dialogManager.showConfirm('确认', '是否继续操作?')
if (confirmed) {
  console.log('用户确认')
} else {
  console.log('用户取消')
}
```

### 输入对话框

```typescript
// 显示输入对话框
const input = await dialogManager.showInput('请输入名称', '默认值')
if (input) {
  console.log(`用户输入: ${input}`)
} else {
  console.log('用户取消')
}
```

### 选择对话框

```typescript
// 显示选择对话框
const options = [
  { label: '选项1', value: '1', description: '第一个选项' },
  { label: '选项2', value: '2', description: '第二个选项' },
  { label: '选项3', value: '3', description: '第三个选项', disabled: true },
]

const selected = await dialogManager.showSelect('请选择', options)
if (selected) {
  console.log(`用户选择: ${selected}`)
} else {
  console.log('用户取消')
}
```

### 模糊搜索对话框

```typescript
// 显示模糊搜索对话框
const items = [
  { label: 'readFile', value: 'readFile', description: '读取文件' },
  { label: 'writeFile', value: 'writeFile', description: '写入文件' },
  { label: 'runCommand', value: 'runCommand', description: '执行命令' },
]

const result = await dialogManager.showFuzzySearch('搜索工具', items)
if (result) {
  console.log(`用户选择: ${result}`)
} else {
  console.log('用户取消')
}
```

### 树形选择对话框

```typescript
// 显示树形选择对话框
const nodes = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'src/cli',
        label: 'cli',
        children: [
          { id: 'src/cli/index.ts', label: 'index.ts' },
          { id: 'src/cli/commands.ts', label: 'commands.ts' },
        ],
      },
      {
        id: 'src/tools',
        label: 'tools',
        children: [
          { id: 'src/tools/index.ts', label: 'index.ts' },
        ],
      },
    ],
  },
]

const selected = await dialogManager.showTreeSelect('选择文件', nodes)
if (selected) {
  console.log(`用户选择: ${selected}`)
} else {
  console.log('用户取消')
}
```

### 便捷函数

```typescript
import { showConfirm, showInput, showSelect, showFuzzySearch, showTreeSelect } from './cli/dialog.js'

// 使用便捷函数
const confirmed = await showConfirm('确认', '是否继续?')
const input = await showInput('输入', '默认值')
const selected = await showSelect('选择', options)
const searchResult = await showFuzzySearch('搜索', items)
const treeResult = await showTreeSelect('选择', nodes)
```

---

## 9. AST 解析

### 基本使用

```typescript
import { astManager } from './cli/ast-parser.js'
import fs from 'fs'

// 解析文件
const content = fs.readFileSync('src/main.ts', 'utf-8')
const ast = astManager.parseFile(content, 'src/main.ts')

// 获取文件结构
const structure = astManager.getFileStructure('src/main.ts', content)
console.log(structure)
```

### 符号搜索

```typescript
// 搜索符号
const results = astManager.searchSymbol('User')

// 按类型搜索
const classResults = astManager.searchSymbol('User', { type: 'class' })
const funcResults = astManager.searchSymbol('add', { type: 'function' })

// 精确匹配
const exactResults = astManager.searchSymbol('UserManager', { exact: true })

// 渲染结果
console.log(astManager.renderSearchResults(results))
```

### 命令行使用

```bash
# 查看文件结构
/ast src/main.ts

# 搜索符号
/symbol User
/symbol User --type=c
/symbol add --type=f
/symbol UserManager --exact
```

---

## 10. 完整示例

```typescript
import {
  getTheme,
  setTheme,
  createSpinner,
  renderBanner,
  renderStatusBar,
  renderUserMessage,
  renderAssistantMessage,
  prompt,
  confirm,
  keybindingManager,
} from './cli/index.js'

async function main() {
  // 设置主题
  setTheme('dark')

  // 显示 Banner
  console.log(renderBanner('1.0.0', 'deepseek-chat', '/path/to/project'))

  // 显示状态行
  console.log(renderStatusBar({
    model: 'deepseek-chat',
    currentDir: '/path/to/project',
    contextPercent: 45,
  }))

  // 注册快捷键
  keybindingManager.on('app:interrupt', () => {
    process.exit(0)
  })

  // 主循环
  while (true) {
    const input = await prompt('❯ ')

    if (input === '/exit') break

    // 显示用户消息
    console.log(renderUserMessage(input))

    // 处理中...
    const spinner = createSpinner('思考中...')
    spinner.start()

    // 模拟处理
    await new Promise(resolve => setTimeout(resolve, 1000))

    spinner.succeed()

    // 显示 Assistant 消息
    console.log(renderAssistantMessage('好的，我来帮你处理...'))
  }
}

main().catch(console.error)
```

---

## 7. 命令行集成

### /theme 命令

```bash
# 查看当前主题
/theme

# 切换主题
/theme light
/theme dark
/theme light-ansi
```

### 在 REPL 中使用

```typescript
import { handleCommand } from './cli/commands.js'

// 处理主题命令
const result = await handleCommand('/theme light', configManager, contextManager, aiClient)
console.log(result.output)
```

---

## 8. 最佳实践

### 1. 始终使用主题化颜色

```typescript
// ✅ 好的做法
const theme = getTheme()
console.log(theme.claude('文本'))

// ❌ 不好的做法
console.log(chalk.cyan('文本'))
```

### 2. 使用 Spinner 包装器

```typescript
// ✅ 好的做法
await withSpinner('处理中', async () => {
  await doWork()
})

// ❌ 不好的做法
const spinner = createSpinner('处理中')
spinner.start()
await doWork()
spinner.succeed()
```

### 3. 统一使用渲染器

```typescript
// ✅ 好的做法
console.log(renderUserMessage(input))
console.log(renderAssistantMessage(response))

// ❌ 不好的做法
console.log(chalk.cyan('> ' + input))
console.log(chalk.green('▸ ' + response))
```

### 4. 使用快捷键系统

```typescript
// ✅ 好的做法
keybindingManager.on('app:interrupt', () => {
  handleInterrupt()
})

// ❌ 不好的做法
process.on('SIGINT', () => {
  handleInterrupt()
})
```

---

## 9. 参考资料

- [Claude Code CLI 源码分析](./11-源码架构总览.md)
- [设计系统实现](./12-设计系统实现.md)
- [状态管理机制](./13-状态管理机制.md)
- [输入组件实现](./15-输入组件实现.md)

---

## 10. 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-06-09 | 初始创建，基于 Claude Code CLI 源码分析实现 UI 组件库 |
| 2026-06-09 | 新增消息系统、布局系统、对话框系统组件文档 |
| 2026-06-09 | 新增 AST 解析和符号搜索文档 |
