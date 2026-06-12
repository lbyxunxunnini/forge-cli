/**
 * UI 组件演示
 * 展示 Claude Code 风格的 UI 组件
 */

import {
  // 主题系统
  getTheme,
  setTheme,
  getThemeName,
  getAvailableThemes,
  t,

  // Spinner
  SpinnerV2,
  createSpinner,
  withSpinner,

  // 渲染器
  renderBanner,
  renderHelp,
  renderStatus,
  renderError,
  renderSuccess,
  renderWarning,
  renderInfo,
  renderStatusBar,
  renderDetailedStatusBar,
  renderUserMessage,
  renderAssistantMessage,
  renderSystemMessage,
  renderToolUse,
  renderToolResult,
  renderMarkdown,
  renderProgressBar,
  renderTable,
  renderList,
  renderKeyValue,
  renderDivider,

  // 输入
  InputManager,
  prompt,
  confirm,
  select,

  // 快捷键
  KeybindingManager,
  keybindingManager,
} from '../src/cli/index.js'

async function main() {
  console.log('=== Forge CLI UI 组件演示 ===\n')

  // 1. 主题系统演示
  console.log('1. 主题系统')
  console.log('─────────────────')
  console.log(`当前主题: ${getThemeName()}`)
  console.log(`可用主题: ${getAvailableThemes().join(', ')}`)
  console.log('')

  // 切换主题
  setTheme('light')
  console.log(`切换到主题: ${getThemeName()}`)

  // 使用主题化文本
  const theme = getTheme()
  console.log(theme.claude('这是 claude 颜色'))
  console.log(theme.success('这是 success 颜色'))
  console.log(theme.error('这是 error 颜色'))
  console.log(theme.warning('这是 warning 颜色'))
  console.log(theme.subtle('这是 subtle 颜色'))
  console.log('')

  // 切换回深色主题
  setTheme('dark')

  // 2. 渲染器演示
  console.log('2. 渲染器演示')
  console.log('─────────────────')

  // Banner
  console.log(renderBanner('1.0.0', 'deepseek-chat', '/Users/agi00114/Desktop/AI/agent设计/forge-cli'))

  // 状态行
  console.log(renderStatusBar({
    model: 'deepseek-chat',
    currentDir: '/Users/agi00114/Desktop/AI/agent设计/forge-cli',
    contextPercent: 45,
  }))

  // 详细状态行
  console.log(renderDetailedStatusBar({
    model: 'deepseek-chat',
    currentDir: '/Users/agi00114/Desktop/AI/agent设计/forge-cli',
    cost: 0.0025,
    duration: 125000,
    contextPercent: 45,
    permissionMode: 'auto',
  }))

  // 消息渲染
  console.log('\n用户消息:')
  console.log(renderUserMessage('请帮我分析这段代码'))

  console.log('\nAssistant 消息:')
  console.log(renderAssistantMessage('好的，我来帮你分析这段代码。\n\n**分析结果：**\n- 代码结构清晰\n- 命名规范\n- 建议添加注释'))

  console.log('\n系统消息:')
  console.log(renderSystemMessage('工具调用完成'))

  console.log('\n工具调用:')
  console.log(renderToolUse('readFile', { path: '/src/main.ts' }))

  console.log('\n工具结果:')
  console.log(renderToolResult('文件内容已读取'))

  // Markdown 渲染
  console.log('\nMarkdown 渲染:')
  console.log(renderMarkdown(`
# 标题 1

## 标题 2

这是一个 **粗体** 和 *斜体* 的示例。

\`inline code\` 和 ~~删除线~~。

- 列表项 1
- 列表项 2
- 列表项 3

> 这是引用

\`\`\`typescript
function hello() {
  console.log("Hello, World!")
}
\`\`\`
`))

  // 进度条
  console.log('\n进度条:')
  console.log(renderProgressBar(75, 100, 30))

  // 表格
  console.log('\n表格:')
  console.log(renderTable(
    ['工具', '状态', '说明'],
    [
      ['readFile', '✓', '文件读取'],
      ['writeFile', '✓', '文件写入'],
      ['runCommand', '✓', '命令执行'],
      ['webFetch', '✗', '网页获取'],
    ]
  ))

  // 列表
  console.log('\n列表:')
  console.log(renderList([
    '主题系统',
    '状态行增强',
    'Spinner 动画',
    '输入组件',
    '消息系统',
  ], true))

  // 键值对
  console.log('\n键值对:')
  console.log(renderKeyValue('模型', 'deepseek-chat'))
  console.log(renderKeyValue('上下文', '45%'))
  console.log(renderKeyValue('成本', '$0.0025'))

  // 分隔线
  console.log('\n分隔线:')
  console.log(renderDivider(40))

  // 3. Spinner 演示
  console.log('\n3. Spinner 演示')
  console.log('─────────────────')

  // 基础 Spinner
  const spinner1 = createSpinner('处理中...')
  spinner1.start()
  await sleep(2000)
  spinner1.succeed('任务完成')

  // 带动词动画的 Spinner
  const spinner2 = new SpinnerV2({
    enableVerbAnimation: true,
    showTimer: true,
  })
  spinner2.start('分析代码')
  await sleep(3000)
  spinner2.succeed('分析完成')

  // 使用 withSpinner 包装器
  await withSpinner('加载数据', async () => {
    await sleep(1500)
  })

  // 4. 输入演示（注释掉，因为需要用户交互）
  console.log('\n4. 输入组件')
  console.log('─────────────────')
  console.log('(输入组件需要用户交互，此处仅展示 API)')
  console.log('')
  console.log('示例代码:')
  console.log(`
import { prompt, confirm, select } from './cli/input.js'

// 简单输入
const name = await prompt('请输入名称: ')

// 确认对话框
const ok = await confirm('是否继续?')

// 选择对话框
const choice = await select('请选择:', ['选项1', '选项2', '选项3'])
`)

  // 5. 快捷键演示
  console.log('\n5. 快捷键系统')
  console.log('─────────────────')
  console.log('快捷键帮助:')
  console.log(keybindingManager.getHelpText())

  // 6. 帮助信息
  console.log('\n6. 帮助信息')
  console.log('─────────────────')
  console.log(renderHelp())

  console.log('\n=== 演示完成 ===')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(console.error)
