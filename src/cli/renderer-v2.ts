/**
 * Renderer V2 - 对齐 Claude Code 的渲染系统
 * 支持主题化、Markdown 渲染、状态行、消息格式化
 */

import chalk from 'chalk'
import { getTheme, type Theme } from './theme.js'

// 消息类型
export type MessageType = 'user' | 'assistant' | 'system' | 'tool_use' | 'tool_result' | 'error'

// 状态行数据
export interface StatusLineData {
  model: string
  currentDir: string
  projectDir?: string
  cost?: number
  duration?: number
  contextPercent?: number
  permissionMode?: string
  vimMode?: string
  sessionName?: string
}

// 消息数据
export interface MessageData {
  type: MessageType
  content: string
  timestamp?: number
  toolName?: string
  toolInput?: Record<string, any>
  isError?: boolean
}

/**
 * 渲染 Banner
 */
export function renderBanner(version: string, model: string, projectRoot: string): string {
  const theme = getTheme()
  const width = process.stdout.columns || 80
  const borderWidth = Math.min(width - 4, 44)

  const lines = [
    theme.claude('╔' + '═'.repeat(borderWidth) + '╗'),
    theme.claude('║') + theme.text.bold('  Forge CLI ') + theme.subtle(`v${version}`) + ' '.repeat(Math.max(0, borderWidth - 14 - version.length)) + theme.claude('║'),
    theme.claude('║') + theme.subtle('  模型: ') + theme.warning(model) + ' '.repeat(Math.max(0, borderWidth - 8 - model.length)) + theme.claude('║'),
    theme.claude('║') + theme.subtle('  项目: ') + theme.text(truncate(projectRoot, borderWidth - 10)) + ' '.repeat(Math.max(0, borderWidth - 10 - Math.min(projectRoot.length, borderWidth - 10))) + theme.claude('║'),
    theme.claude('║') + theme.subtle('  输入 /help 查看命令') + ' '.repeat(Math.max(0, borderWidth - 22)) + theme.claude('║'),
    theme.claude('╚' + '═'.repeat(borderWidth) + '╝'),
  ]
  return lines.join('\n')
}

/**
 * 渲染帮助信息
 */
export function renderHelp(): string {
  const theme = getTheme()
  const commands = [
    ['/help', '显示帮助信息'],
    ['/model', '模型管理：查看/切换/配置/添加模型'],
    ['/model <name>', '切换模型（未配置时进入配置）'],
    ['/model <name> <key>', '快捷配置模型 API Key'],
    ['/config', '查看当前配置'],
    ['/clear', '清空对话上下文'],
    ['/status', '显示当前状态'],
    ['/fast', '切换 ff-fast 快速模式'],
    ['/auto', '切换 ff-a 全自动模式'],
    ['/session', '查看当前 session 信息'],
    ['/plugins', '查看已加载插件'],
    ['/mcp', '查看 MCP 服务器状态'],
    ['/security', '查看安全检查配置'],
    ['/learn', '切换学习模式'],
    ['/review', '查看代码审查配置'],
    ['/memory', '查看已保存的记忆'],
    ['/hook', '查看已注册钩子'],
    ['/trace', '查看最近一次执行的 Trace 摘要'],
    ['/theme', '切换主题'],
    ['/git', 'Git 操作：status/log/branch/add/commit/diff/remote'],
    ['/diff', '查看 Diff：/diff <old> <new> 或 /diff --staged'],
    ['/lint', 'Lint 检查：/lint 或 /lint <file>'],
    ['/test', '运行测试：/test 或 /test <args>'],
    ['/ast', '查看文件结构：/ast <file> 或 /ast --init'],
    ['/symbol', '搜索符号：/symbol <query> 或 /sym <query>'],
    ['/fetch', '获取网页：/fetch <url> 或 /web <url>'],
    ['/search', '网络搜索：/search <query> 或 /s <query>'],
    ['/state', '状态机管理：/state status/history/graph/snapshot/restore/reset'],
    ['/exit', '退出程序'],
  ]

  const lines = [
    theme.text.bold('\n可用命令:'),
    ...commands.map(([cmd, desc]) => `  ${theme.claude(cmd)}  ${theme.subtle(desc)}`),
    '',
    theme.subtle('提示: 直接输入内容开始对话'),
  ]
  return lines.join('\n')
}

/**
 * 渲染状态信息
 */
export function renderStatus(contextSummary: string, model: string, phase?: string): string {
  const theme = getTheme()
  const lines = [
    theme.text.bold('\n当前状态:'),
    `  ${theme.subtle('模型:')} ${theme.warning(model)}`,
    `  ${theme.subtle('上下文:')} ${theme.text(contextSummary)}`,
  ]
  if (phase) {
    lines.push(`  ${theme.subtle('阶段:')} ${theme.success(phase)}`)
  }
  return lines.join('\n')
}

/**
 * 渲染错误
 */
export function renderError(error: string): string {
  const theme = getTheme()
  return theme.error(`\n✗ ${error}`)
}

/**
 * 渲染成功
 */
export function renderSuccess(message: string): string {
  const theme = getTheme()
  return theme.success(`\n✓ ${message}`)
}

/**
 * 渲染警告
 */
export function renderWarning(message: string): string {
  const theme = getTheme()
  return theme.warning(`\n⚠ ${message}`)
}

/**
 * 渲染信息
 */
export function renderInfo(message: string): string {
  const theme = getTheme()
  return theme.subtle(`\nℹ ${message}`)
}

/**
 * 渲染阶段
 */
export function renderPhase(phase: string): string {
  const theme = getTheme()
  return theme.claude(`\n[${phase}]`)
}

/**
 * 渲染 Assistant 开始
 */
export function renderAssistantStart(): string {
  const theme = getTheme()
  return theme.claude('\n▸ ')
}

/**
 * 渲染状态行
 */
export function renderStatusBar(data: StatusLineData): string {
  const theme = getTheme()
  const width = process.stdout.columns || 80

  // 左侧：模型名称
  const left = ` ${theme.warning(data.model)}`

  // 右侧：上下文百分比
  const pct = data.contextPercent ?? 0
  const pctColor = pct > 80 ? theme.error : pct > 50 ? theme.warning : theme.success
  const right = `上下文: ${pctColor(pct + '%')} `

  // 中间：填充
  const leftLen = stripAnsi(left).length
  const rightLen = stripAnsi(right).length
  const mid = width - leftLen - rightLen - 2
  const gap = mid > 0 ? ' '.repeat(mid) : ' '

  // 底部分隔线
  const divider = theme.inactive('─'.repeat(width))

  return `${divider}\n${left}${gap}│${right}`
}

/**
 * 渲染详细状态行
 */
export function renderDetailedStatusBar(data: StatusLineData): string {
  const theme = getTheme()
  const width = process.stdout.columns || 80

  const parts: string[] = []

  // 模型
  parts.push(theme.warning(data.model))

  // 工作目录
  if (data.currentDir) {
    const dir = truncate(data.currentDir, 30)
    parts.push(theme.subtle(dir))
  }

  // 成本
  if (data.cost !== undefined) {
    parts.push(theme.subtle(`$${data.cost.toFixed(4)}`))
  }

  // 耗时
  if (data.duration !== undefined) {
    const seconds = Math.floor(data.duration / 1000)
    parts.push(theme.subtle(formatDuration(seconds)))
  }

  // 上下文
  if (data.contextPercent !== undefined) {
    const pct = data.contextPercent
    const pctColor = pct > 80 ? theme.error : pct > 50 ? theme.warning : theme.success
    parts.push(pctColor(`${pct}%`))
  }

  // 权限模式
  if (data.permissionMode) {
    parts.push(theme.permission(data.permissionMode))
  }

  // Vim 模式
  if (data.vimMode) {
    parts.push(theme.ide(`[${data.vimMode.toUpperCase()}]`))
  }

  // 连接各部分
  const content = parts.join(' │ ')

  // 底部分隔线
  const divider = theme.inactive('─'.repeat(width))

  return `${divider}\n ${content}`
}

/**
 * 渲染用户消息
 */
export function renderUserMessage(message: string): string {
  const theme = getTheme()
  const width = process.stdout.columns || 80
  const maxWidth = width - 4
  const truncated = truncate(message, maxWidth)

  return [
    theme.claude('┌' + '─'.repeat(maxWidth + 2) + '┐'),
    theme.claude('│') + ' ' + theme.text(truncated) + ' '.repeat(Math.max(0, maxWidth - truncated.length)) + ' ' + theme.claude('│'),
    theme.claude('└' + '─'.repeat(maxWidth + 2) + '┘'),
  ].join('\n')
}

/**
 * 渲染 Assistant 消息
 */
export function renderAssistantMessage(message: string): string {
  const theme = getTheme()
  return theme.claude('▸ ') + renderMarkdown(message)
}

/**
 * 渲染系统消息
 */
export function renderSystemMessage(message: string): string {
  const theme = getTheme()
  return theme.subtle(`* ${message}`)
}

/**
 * 渲染工具调用
 */
export function renderToolUse(toolName: string, input?: Record<string, any>): string {
  const theme = getTheme()
  let result = theme.claude('⏺ ') + theme.text.bold(`Using tool: ${theme.ide(toolName)}`)

  if (input) {
    const inputStr = JSON.stringify(input, null, 2)
    if (inputStr.length < 200) {
      result += '\n' + theme.subtle('  Input: ') + theme.text(inputStr)
    } else {
      result += '\n' + theme.subtle('  Input: ') + theme.text(truncate(inputStr, 100))
    }
  }

  return result
}

/**
 * 渲染工具结果
 */
export function renderToolResult(result: string, isError: boolean = false): string {
  const theme = getTheme()
  const prefix = isError ? theme.error('✗') : theme.success('✓')
  return `${prefix} ${theme.subtle('Tool result:')} ${theme.text(truncate(result, 200))}`
}

/**
 * 渲染 Markdown
 */
export function renderMarkdown(text: string): string {
  const theme = getTheme()
  const lines = text.split('\n')
  const result: string[] = []
  let inCodeBlock = false
  let codeLang = ''

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]

    // Code blocks
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        result.push(theme.inactive('└' + '─'.repeat(40)))
        inCodeBlock = false
      } else {
        codeLang = line.trimStart().slice(3).trim()
        const label = codeLang ? ` ${theme.subtle(codeLang)}` : ''
        result.push(theme.inactive('┌' + '─'.repeat(40)) + label)
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      result.push(theme.inactive('│ ') + theme.success(line))
      continue
    }

    // Headers
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^(#{1,3})/)![1].length
      const text = line.replace(/^#{1,3}\s+/, '')
      if (level === 1) result.push(theme.claude.bold(text))
      else if (level === 2) result.push(theme.text.bold(text))
      else result.push(theme.text(text))
      continue
    }

    // Bold: **text**
    line = line.replace(/\*\*(.+?)\*\*/g, (_, t) => theme.text.bold(t))
    // Italic: *text*
    line = line.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, (_, t) => chalk.italic(t))
    // Inline code: `text`
    line = line.replace(/`([^`]+)`/g, (_, t) => chalk.bgGray.white(` ${t} `))
    // Strikethrough: ~~text~~
    line = line.replace(/~~(.+?)~~/g, (_, t) => theme.subtle(t))

    // Bullet lists
    if (/^\s*[-*+]\s/.test(line)) {
      line = line.replace(/^(\s*)([-*+])\s/, `$1${theme.claude('•')} `)
    }

    // Numbered lists
    if (/^\s*\d+\.\s/.test(line)) {
      line = line.replace(/^(\s*)(\d+)\.\s/, `$1${theme.claude('$2.')} `)
    }

    // Blockquote
    if (/^\s*>\s/.test(line)) {
      line = line.replace(/^(\s*)>\s/, theme.inactive('│ '))
      line = theme.subtle(line)
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      line = theme.inactive('─'.repeat(40))
    }

    result.push(line)
  }

  if (inCodeBlock) result.push(theme.inactive('└' + '─'.repeat(40)))

  return result.join('\n')
}

/**
 * 渲染进度条
 */
export function renderProgressBar(value: number, max: number, width: number = 20): string {
  const theme = getTheme()
  const percentage = Math.round((value / max) * 100)
  const filled = Math.round((value / max) * width)
  const empty = width - filled

  const filledStr = theme.success('█'.repeat(filled))
  const emptyStr = theme.inactive('░'.repeat(empty))
  const percentStr = theme.subtle(`${percentage}%`)

  return `${filledStr}${emptyStr} ${percentStr}`
}

/**
 * 渲染表格
 */
export function renderTable(headers: string[], rows: string[][]): string {
  const theme = getTheme()

  // 计算列宽
  const colWidths = headers.map((h, i) => {
    const maxRowWidth = Math.max(...rows.map(r => stripAnsi(r[i] || '').length))
    return Math.max(stripAnsi(h).length, maxRowWidth)
  })

  // 渲染表头
  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join(' │ ')
  const dividerLine = colWidths.map(w => '─'.repeat(w)).join('─┼─')

  const result = [
    theme.claude(headerLine),
    theme.inactive(dividerLine),
  ]

  // 渲染行
  for (const row of rows) {
    const line = row.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' │ ')
    result.push(theme.text(line))
  }

  return result.join('\n')
}

/**
 * 渲染列表
 */
export function renderList(items: string[], ordered: boolean = false): string {
  const theme = getTheme()
  return items.map((item, i) => {
    const prefix = ordered ? theme.claude(`${i + 1}.`) : theme.claude('•')
    return `  ${prefix} ${theme.text(item)}`
  }).join('\n')
}

/**
 * 渲染键值对
 */
export function renderKeyValue(key: string, value: string): string {
  const theme = getTheme()
  return `  ${theme.subtle(key + ':')} ${theme.text(value)}`
}

/**
 * 渲染分隔线
 */
export function renderDivider(width?: number): string {
  const theme = getTheme()
  const w = width || process.stdout.columns || 80
  return theme.inactive('─'.repeat(w))
}

/**
 * 清除当前行
 */
export function clearLine(): void {
  process.stdout.write('\r\x1B[K')
}

/**
 * 移动光标到行首
 */
export function moveCursorToStart(): void {
  process.stdout.write('\r')
}

// 辅助函数

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen - 3) + '...'
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '')
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

export default {
  renderBanner,
  renderHelp,
  renderStatus,
  renderError,
  renderSuccess,
  renderWarning,
  renderInfo,
  renderPhase,
  renderAssistantStart,
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
  clearLine,
  moveCursorToStart,
}
