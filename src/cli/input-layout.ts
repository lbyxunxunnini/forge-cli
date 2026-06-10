/**
 * 输入框布局组件
 * 对齐 Claude Code 的布局：输入框在两条分割线中间
 */

import chalk from 'chalk'
import { getTheme } from './theme.js'

// 状态行数据
export interface StatusLineData {
  model: string
  currentDir?: string
  contextPercent?: number
  permissionMode?: string
  vimMode?: string
  cost?: number
  duration?: number
}

// 输入框选项
export interface InputLayoutOptions {
  /** 状态行数据 */
  statusData: StatusLineData
  /** 输入提示符 */
  prompt?: string
  /** 是否显示快捷键提示 */
  showShortcuts?: boolean
  /** 快捷键列表 */
  shortcuts?: { key: string; desc: string }[]
  /** 终端宽度 */
  width?: number
}

/**
 * 输入框布局管理器
 */
export class InputLayoutManager {
  private width: number

  constructor() {
    this.width = process.stdout.columns || 80
  }

  /**
   * 渲染输入框布局
   */
  render(options: InputLayoutOptions): string {
    const theme = getTheme()
    const {
      statusData,
      prompt = '❯ ',
      showShortcuts = true,
      shortcuts = [],
      width = this.width,
    } = options

    const lines: string[] = []

    // 第一条分割线
    lines.push(theme.inactive('─'.repeat(width)))

    // 状态行
    lines.push(this.renderStatusLine(statusData, width))

    // 第二条分割线
    lines.push(theme.inactive('─'.repeat(width)))

    // 输入提示符
    lines.push(theme.claude(prompt))

    // 快捷键提示
    if (showShortcuts && shortcuts.length > 0) {
      lines.push(this.renderShortcuts(shortcuts, width))
    }

    return lines.join('\n')
  }

  /**
   * 渲染状态行
   */
  private renderStatusLine(data: StatusLineData, width: number): string {
    const theme = getTheme()
    const parts: string[] = []

    // 模型名称
    if (data.model) {
      parts.push(theme.warning(data.model))
    }

    // 工作目录
    if (data.currentDir) {
      const dir = this.truncate(data.currentDir, 30)
      parts.push(theme.subtle(dir))
    }

    // 上下文百分比
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

    // 成本
    if (data.cost !== undefined) {
      parts.push(theme.subtle(`$${data.cost.toFixed(4)}`))
    }

    // 耗时
    if (data.duration !== undefined) {
      const seconds = Math.floor(data.duration / 1000)
      parts.push(theme.subtle(this.formatDuration(seconds)))
    }

    // 连接各部分
    const content = parts.join(' │ ')

    // 计算填充
    const contentLength = this.stripAnsi(content).length
    const padding = Math.max(0, width - contentLength - 2)

    return ` ${content}${' '.repeat(padding)} `
  }

  /**
   * 渲染快捷键提示
   */
  private renderShortcuts(shortcuts: { key: string; desc: string }[], width: number): string {
    const theme = getTheme()
    const parts: string[] = []

    for (const shortcut of shortcuts) {
      parts.push(`${theme.claude(shortcut.key)}${theme.subtle(':')}${theme.text(shortcut.desc)}`)
    }

    const content = parts.join(' │ ')
    const contentLength = this.stripAnsi(content).length
    const padding = Math.max(0, width - contentLength - 2)

    return theme.subtle(` ${content}${' '.repeat(padding)} `)
  }

  /**
   * 渲染简洁布局
   */
  renderCompact(statusData: StatusLineData, prompt: string = '❯ '): string {
    const theme = getTheme()
    const width = this.width

    const lines: string[] = []

    // 分隔线
    lines.push(theme.inactive('─'.repeat(width)))

    // 状态行（简洁版）
    const parts: string[] = []
    if (statusData.model) {
      parts.push(theme.warning(statusData.model))
    }
    if (statusData.contextPercent !== undefined) {
      const pct = statusData.contextPercent
      const pctColor = pct > 80 ? theme.error : pct > 50 ? theme.warning : theme.success
      parts.push(pctColor(`${pct}%`))
    }

    const content = parts.join(' │ ')
    const contentLength = this.stripAnsi(content).length
    const padding = Math.max(0, width - contentLength - 2)

    lines.push(` ${content}${' '.repeat(padding)} `)

    // 分隔线
    lines.push(theme.inactive('─'.repeat(width)))

    // 输入提示符
    lines.push(theme.claude(prompt))

    return lines.join('\n')
  }

  /**
   * 渲染分隔线
   */
  renderDivider(width?: number): string {
    const theme = getTheme()
    return theme.inactive('─'.repeat(width || this.width))
  }

  /**
   * 更新终端宽度
   */
  updateWidth(width: number): void {
    this.width = width
  }

  // 辅助函数

  private stripAnsi(str: string): string {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1B\[[0-9;]*m/g, '')
  }

  private truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str
    return str.slice(0, maxLen - 3) + '...'
  }

  private formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
}

/**
 * 创建输入框布局管理器
 */
export function createInputLayoutManager(): InputLayoutManager {
  return new InputLayoutManager()
}

/**
 * 全局输入框布局管理器实例
 */
export const inputLayoutManager = createInputLayoutManager()

/**
 * 渲染输入框布局
 */
export function renderInputLayout(options: InputLayoutOptions): string {
  return inputLayoutManager.render(options)
}

/**
 * 渲染简洁布局
 */
export function renderCompactLayout(statusData: StatusLineData, prompt?: string): string {
  return inputLayoutManager.renderCompact(statusData, prompt)
}

export default {
  InputLayoutManager,
  createInputLayoutManager,
  inputLayoutManager,
  renderInputLayout,
  renderCompactLayout,
}
