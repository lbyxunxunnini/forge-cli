/**
 * 布局组件系统 - 对齐 Claude Code 的 FullscreenLayout
 * 支持全屏布局、滚动、虚拟列表
 */

import chalk from 'chalk'
import { getTheme } from './theme.js'

// 布局类型
export type LayoutType = 'fullscreen' | 'inline' | 'split'

// 布局区域
export type LayoutRegion = 'top' | 'middle' | 'bottom' | 'left' | 'right'

// 布局选项
export interface LayoutOptions {
  type: LayoutType
  width?: number
  height?: number
  padding?: number
  margin?: number
  border?: boolean
}

// 滚动选项
export interface ScrollOptions {
  height: number
  scrollTop?: number
  showScrollbar?: boolean
}

// 虚拟列表选项
export interface VirtualListOptions {
  items: any[]
  itemHeight: number
  containerHeight: number
  overscan?: number
  renderItem: (item: any, index: number) => string
}

/**
 * 布局管理器
 */
export class LayoutManager {
  private width: number
  private height: number

  constructor() {
    this.width = process.stdout.columns || 80
    this.height = process.stdout.rows || 24

    // 监听终端大小变化
    process.stdout.on('resize', () => {
      this.width = process.stdout.columns || 80
      this.height = process.stdout.rows || 24
    })
  }

  /**
   * 获取终端宽度
   */
  getWidth(): number {
    return this.width
  }

  /**
   * 获取终端高度
   */
  getHeight(): number {
    return this.height
  }

  /**
   * 渲染全屏布局
   */
  renderFullscreenLayout(options: {
    top?: string
    middle: string
    bottom?: string
    showBorders?: boolean
  }): string {
    const theme = getTheme()
    const { top, middle, bottom, showBorders = true } = options
    const lines: string[] = []

    // 顶部区域
    if (top) {
      lines.push(top)
      if (showBorders) {
        lines.push(theme.inactive('─'.repeat(this.width)))
      }
    }

    // 中间区域（可滚动）
    const middleHeight = this.height - (top ? 3 : 0) - (bottom ? 3 : 0)
    const middleLines = middle.split('\n')
    const visibleLines = middleLines.slice(0, middleHeight)
    lines.push(visibleLines.join('\n'))

    // 底部区域
    if (bottom) {
      if (showBorders) {
        lines.push(theme.inactive('─'.repeat(this.width)))
      }
      lines.push(bottom)
    }

    return lines.join('\n')
  }

  /**
   * 渲染分割布局
   */
  renderSplitLayout(options: {
    left?: string
    right?: string
    splitRatio?: number
    showBorders?: boolean
  }): string {
    const theme = getTheme()
    const { left, right, splitRatio = 0.5, showBorders = true } = options
    const lines: string[] = []

    const leftWidth = Math.floor(this.width * splitRatio)
    const rightWidth = this.width - leftWidth - (showBorders ? 1 : 0)

    const leftLines = (left || '').split('\n')
    const rightLines = (right || '').split('\n')
    const maxLines = Math.max(leftLines.length, rightLines.length)

    for (let i = 0; i < maxLines; i++) {
      const leftLine = (leftLines[i] || '').padEnd(leftWidth)
      const rightLine = rightLines[i] || ''

      if (showBorders) {
        lines.push(leftLine + theme.inactive('│') + rightLine)
      } else {
        lines.push(leftLine + rightLine)
      }
    }

    return lines.join('\n')
  }

  /**
   * 渲染滚动区域
   */
  renderScrollable(content: string, options: ScrollOptions): string {
    const theme = getTheme()
    const { height, scrollTop = 0, showScrollbar = false } = options

    const lines = content.split('\n')
    const totalLines = lines.length
    const visibleLines = lines.slice(scrollTop, scrollTop + height)

    if (showScrollbar && totalLines > height) {
      const scrollbarHeight = Math.max(1, Math.floor((height / totalLines) * height))
      const scrollbarPosition = Math.floor((scrollTop / totalLines) * height)

      return visibleLines.map((line, i) => {
        const padding = this.width - 1 - this.stripAnsi(line).length
        const paddedLine = line + ' '.repeat(Math.max(0, padding))

        if (i >= scrollbarPosition && i < scrollbarPosition + scrollbarHeight) {
          return paddedLine + theme.claude('█')
        } else {
          return paddedLine + theme.inactive('░')
        }
      }).join('\n')
    }

    return visibleLines.join('\n')
  }

  /**
   * 渲染虚拟列表
   */
  renderVirtualList(options: VirtualListOptions): string {
    const { items, itemHeight, containerHeight, overscan = 5, renderItem } = options
    const theme = getTheme()

    // 计算可见范围
    const startIndex = Math.max(0, Math.floor(0 / itemHeight) - overscan)
    const endIndex = Math.min(items.length, Math.ceil(containerHeight / itemHeight) + overscan)

    // 渲染可见项
    const visibleItems = items.slice(startIndex, endIndex)
    const lines: string[] = []

    for (let i = 0; i < visibleItems.length; i++) {
      const item = visibleItems[i]
      const rendered = renderItem(item, startIndex + i)
      lines.push(rendered)
    }

    return lines.join('\n')
  }

  /**
   * 渲染盒子
   */
  renderBox(content: string, options: {
    title?: string
    width?: number
    height?: number
    padding?: number
    border?: boolean
    borderColor?: string
  } = {}): string {
    const theme = getTheme()
    const {
      title,
      width = this.width - 4,
      height,
      padding = 1,
      border = true,
      borderColor,
    } = options

    const lines: string[] = []
    const contentLines = content.split('\n')
    const maxWidth = width - (padding * 2) - (border ? 2 : 0)

    // 顶部边框
    if (border) {
      const titleStr = title ? ` ${title} ` : ''
      const borderWidth = width - 2 - titleStr.length
      const borderLine = theme.claude('┌') + theme.claude(titleStr) + theme.claude('─'.repeat(Math.max(0, borderWidth))) + theme.claude('┐')
      lines.push(borderLine)
    }

    // 内容区域
    const paddedLines = contentLines.map(line => {
      const truncated = this.truncate(line, maxWidth)
      const padded = ' '.repeat(padding) + truncated + ' '.repeat(Math.max(0, maxWidth - this.stripAnsi(truncated).length)) + ' '.repeat(padding)
      return border ? theme.claude('│') + padded + theme.claude('│') : padded
    })

    lines.push(...paddedLines)

    // 底部边框
    if (border) {
      const borderLine = theme.claude('└') + theme.claude('─'.repeat(width - 2)) + theme.claude('┘')
      lines.push(borderLine)
    }

    return lines.join('\n')
  }

  /**
   * 渲染面板
   */
  renderPanel(content: string, options: {
    title?: string
    width?: number
    height?: number
    position?: 'left' | 'right' | 'center'
  } = {}): string {
    const theme = getTheme()
    const { title, width = this.width, height, position = 'center' } = options

    const box = this.renderBox(content, { title, width, height })

    if (position === 'center') {
      const padding = Math.floor((this.width - width) / 2)
      return box.split('\n').map(line => ' '.repeat(padding) + line).join('\n')
    }

    return box
  }

  /**
   * 渲染对话框
   */
  renderDialog(content: string, options: {
    title?: string
    width?: number
    height?: number
    showClose?: boolean
  } = {}): string {
    const theme = getTheme()
    const {
      title = 'Dialog',
      width = Math.min(60, this.width - 4),
      height,
      showClose = true,
    } = options

    const lines: string[] = []

    // 标题栏
    const titleBar = theme.claude('╔') + theme.text.bold(` ${title} `) + theme.claude('═'.repeat(Math.max(0, width - title.length - 4))) + theme.claude('╗')
    lines.push(titleBar)

    // 内容
    const contentLines = content.split('\n')
    const maxWidth = width - 4
    for (const line of contentLines) {
      const truncated = this.truncate(line, maxWidth)
      const padded = '  ' + truncated + ' '.repeat(Math.max(0, maxWidth - this.stripAnsi(truncated).length)) + '  '
      lines.push(theme.claude('║') + padded + theme.claude('║'))
    }

    // 底部
    const bottomLine = theme.claude('╚') + theme.claude('═'.repeat(width - 2)) + theme.claude('╝')
    lines.push(bottomLine)

    // 关闭提示
    if (showClose) {
      lines.push(theme.subtle('  按 Esc 关闭'))
    }

    return lines.join('\n')
  }

  /**
   * 渲染进度条
   */
  renderProgressBar(value: number, max: number, width: number = 30): string {
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
  renderTable(headers: string[], rows: string[][], options: {
    maxWidth?: number
    padding?: number
  } = {}): string {
    const theme = getTheme()
    const { maxWidth = this.width, padding = 1 } = options

    // 计算列宽
    const colWidths = headers.map((h, i) => {
      const maxRowWidth = Math.max(...rows.map(r => this.stripAnsi(r[i] || '').length))
      return Math.max(this.stripAnsi(h).length, maxRowWidth)
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
  renderList(items: string[], options: {
    ordered?: boolean
    bullet?: string
    indent?: number
  } = {}): string {
    const theme = getTheme()
    const { ordered = false, bullet = '•', indent = 2 } = options

    return items.map((item, i) => {
      const prefix = ordered ? theme.claude(`${i + 1}.`) : theme.claude(bullet)
      return ' '.repeat(indent) + `${prefix} ${theme.text(item)}`
    }).join('\n')
  }

  /**
   * 渲染键值对
   */
  renderKeyValue(key: string, value: string, options: {
    indent?: number
    separator?: string
  } = {}): string {
    const theme = getTheme()
    const { indent = 2, separator = ':' } = options

    return ' '.repeat(indent) + theme.subtle(key + separator) + ' ' + theme.text(value)
  }

  /**
   * 渲染分隔线
   */
  renderDivider(width?: number): string {
    const theme = getTheme()
    const w = width || this.width
    return theme.inactive('─'.repeat(w))
  }

  /**
   * 清除屏幕
   */
  clearScreen(): void {
    process.stdout.write('\x1B[2J\x1B[0f')
  }

  /**
   * 移动光标
   */
  moveCursor(x: number, y: number): void {
    process.stdout.write(`\x1B[${y};${x}H`)
  }

  /**
   * 保存光标位置
   */
  saveCursor(): void {
    process.stdout.write('\x1B[s')
  }

  /**
   * 恢复光标位置
   */
  restoreCursor(): void {
    process.stdout.write('\x1B[u')
  }

  /**
   * 清除当前行
   */
  clearLine(): void {
    process.stdout.write('\r\x1B[K')
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
}

/**
 * 创建布局管理器
 */
export function createLayoutManager(): LayoutManager {
  return new LayoutManager()
}

/**
 * 全局布局管理器实例
 */
export const layoutManager = createLayoutManager()

export default {
  LayoutManager,
  createLayoutManager,
  layoutManager,
}
