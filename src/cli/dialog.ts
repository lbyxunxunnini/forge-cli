/**
 * 对话框系统 - 对齐 Claude Code 的 Dialog 组件
 * 支持模态框、模糊搜索、树形选择
 */

import chalk from 'chalk'
import { getTheme } from './theme.js'
import { layoutManager } from './layout.js'

// 对话框类型
export type DialogType = 'info' | 'warning' | 'error' | 'confirm' | 'input' | 'select' | 'fuzzy' | 'tree'

// 对话框选项
export interface DialogOptions {
  title: string
  content?: string
  type?: DialogType
  width?: number
  height?: number
  showClose?: boolean
  closable?: boolean
  onClose?: () => void
}

// 选择项
export interface SelectOption {
  label: string
  value: string
  description?: string
  icon?: string
  disabled?: boolean
}

// 树形节点
export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  icon?: string
  data?: any
}

/**
 * 对话框管理器
 */
export class DialogManager {
  private activeDialog: string | null = null
  private dialogStack: string[] = []

  /**
   * 显示信息对话框
   */
  showInfo(title: string, content: string): void {
    this.showDialog({
      title,
      content,
      type: 'info',
    })
  }

  /**
   * 显示警告对话框
   */
  showWarning(title: string, content: string): void {
    this.showDialog({
      title,
      content,
      type: 'warning',
    })
  }

  /**
   * 显示错误对话框
   */
  showError(title: string, content: string): void {
    this.showDialog({
      title,
      content,
      type: 'error',
    })
  }

  /**
   * 显示确认对话框
   */
  async showConfirm(title: string, content: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.showDialog({
        title,
        content: content + '\n\n按 Y 确认，N 取消',
        type: 'confirm',
        onClose: () => resolve(false),
      })

      // 监听按键
      const handler = (key: Buffer) => {
        const char = key.toString().toLowerCase()
        if (char === 'y') {
          process.stdin.removeListener('data', handler)
          this.closeDialog()
          resolve(true)
        } else if (char === 'n' || char === '\x1b') {
          process.stdin.removeListener('data', handler)
          this.closeDialog()
          resolve(false)
        }
      }

      process.stdin.on('data', handler)
    })
  }

  /**
   * 显示输入对话框
   */
  async showInput(title: string, placeholder?: string): Promise<string | null> {
    return new Promise((resolve) => {
      let input = ''
      this.showDialog({
        title,
        content: (placeholder || '输入内容...') + '\n\n按 Enter 确认，Esc 取消',
        type: 'input',
        onClose: () => resolve(null),
      })

      // 监听按键
      const handler = (key: Buffer) => {
        const char = key.toString()
        const code = char.charCodeAt(0)

        if (code === 13) { // Enter
          process.stdin.removeListener('data', handler)
          this.closeDialog()
          resolve(input)
        } else if (code === 27) { // Esc
          process.stdin.removeListener('data', handler)
          this.closeDialog()
          resolve(null)
        } else if (code === 127) { // Backspace
          input = input.slice(0, -1)
          this.updateDialogContent(input || placeholder || '输入内容...')
        } else if (code >= 32) { // 可打印字符
          input += char
          this.updateDialogContent(input)
        }
      }

      process.stdin.on('data', handler)
    })
  }

  /**
   * 显示选择对话框
   */
  async showSelect(title: string, options: SelectOption[]): Promise<string | null> {
    return new Promise((resolve) => {
      let selectedIndex = 0

      const renderOptions = () => {
        const lines = options.map((opt, i) => {
          const prefix = i === selectedIndex ? chalk.cyan('▶ ') : '  '
          const icon = opt.icon ? `${opt.icon} ` : ''
          const disabled = opt.disabled ? chalk.dim : chalk.white
          const desc = opt.description ? chalk.dim(` - ${opt.description}`) : ''
          return `${prefix}${icon}${disabled(opt.label)}${desc}`
        })
        return lines.join('\n')
      }

      this.showDialog({
        title,
        content: renderOptions() + '\n\n↑↓ 选择，Enter 确认，Esc 取消',
        type: 'select',
        onClose: () => resolve(null),
      })

      // 监听按键
      const handler = (key: Buffer) => {
        const char = key.toString()
        const code = char.charCodeAt(0)

        if (code === 13) { // Enter
          const selected = options[selectedIndex]
          if (selected && !selected.disabled) {
            process.stdin.removeListener('data', handler)
            this.closeDialog()
            resolve(selected.value)
          }
        } else if (code === 27) { // Esc
          process.stdin.removeListener('data', handler)
          this.closeDialog()
          resolve(null)
        } else if (char === '\x1B[A') { // 上箭头
          selectedIndex = Math.max(0, selectedIndex - 1)
          this.updateDialogContent(renderOptions() + '\n\n↑↓ 选择，Enter 确认，Esc 取消')
        } else if (char === '\x1B[B') { // 下箭头
          selectedIndex = Math.min(options.length - 1, selectedIndex + 1)
          this.updateDialogContent(renderOptions() + '\n\n↑↓ 选择，Enter 确认，Esc 取消')
        }
      }

      process.stdin.on('data', handler)
    })
  }

  /**
   * 显示模糊搜索对话框
   */
  async showFuzzySearch(title: string, items: SelectOption[]): Promise<string | null> {
    return new Promise((resolve) => {
      let query = ''
      let selectedIndex = 0
      let filteredItems = [...items]

      const filterItems = () => {
        if (!query) {
          filteredItems = [...items]
        } else {
          const lowerQuery = query.toLowerCase()
          filteredItems = items.filter(item =>
            item.label.toLowerCase().includes(lowerQuery) ||
            item.description?.toLowerCase().includes(lowerQuery)
          )
        }
        selectedIndex = Math.min(selectedIndex, filteredItems.length - 1)
      }

      const renderItems = () => {
        const lines = filteredItems.map((item, i) => {
          const prefix = i === selectedIndex ? chalk.cyan('▶ ') : '  '
          const icon = item.icon ? `${item.icon} ` : ''
          const desc = item.description ? chalk.dim(` - ${item.description}`) : ''
          return `${prefix}${icon}${chalk.white(item.label)}${desc}`
        })
        return lines.join('\n')
      }

      const render = () => {
        const searchLine = chalk.cyan('搜索: ') + query + chalk.inverse(' ')
        const itemsStr = filteredItems.length > 0
          ? renderItems()
          : chalk.dim('无匹配结果')
        return `${searchLine}\n\n${itemsStr}\n\n输入搜索，↑↓ 选择，Enter 确认，Esc 取消`
      }

      this.showDialog({
        title,
        content: render(),
        type: 'fuzzy',
        width: 60,
        onClose: () => resolve(null),
      })

      // 监听按键
      const handler = (key: Buffer) => {
        const char = key.toString()
        const code = char.charCodeAt(0)

        if (code === 13) { // Enter
          const selected = filteredItems[selectedIndex]
          if (selected) {
            process.stdin.removeListener('data', handler)
            this.closeDialog()
            resolve(selected.value)
          }
        } else if (code === 27) { // Esc
          process.stdin.removeListener('data', handler)
          this.closeDialog()
          resolve(null)
        } else if (char === '\x1B[A') { // 上箭头
          selectedIndex = Math.max(0, selectedIndex - 1)
          this.updateDialogContent(render())
        } else if (char === '\x1B[B') { // 下箭头
          selectedIndex = Math.min(filteredItems.length - 1, selectedIndex + 1)
          this.updateDialogContent(render())
        } else if (code === 127) { // Backspace
          query = query.slice(0, -1)
          filterItems()
          this.updateDialogContent(render())
        } else if (code >= 32) { // 可打印字符
          query += char
          filterItems()
          this.updateDialogContent(render())
        }
      }

      process.stdin.on('data', handler)
    })
  }

  /**
   * 显示树形选择对话框
   */
  async showTreeSelect(title: string, nodes: TreeNode[]): Promise<string | null> {
    return new Promise((resolve) => {
      let selectedPath: string[] = []
      let expandedNodes = new Set<string>()

      const flattenTree = (nodes: TreeNode[], depth: number = 0): { node: TreeNode; depth: number }[] => {
        const result: { node: TreeNode; depth: number }[] = []
        for (const node of nodes) {
          result.push({ node, depth })
          if (node.children && expandedNodes.has(node.id)) {
            result.push(...flattenTree(node.children, depth + 1))
          }
        }
        return result
      }

      const flatNodes = flattenTree(nodes)
      let selectedIndex = 0

      const renderTree = () => {
        const lines = flatNodes.map((item, i) => {
          const { node, depth } = item
          const indent = '  '.repeat(depth)
          const hasChildren = node.children && node.children.length > 0
          const isExpanded = expandedNodes.has(node.id)
          const isSelected = i === selectedIndex

          let prefix = ''
          if (hasChildren) {
            prefix = isExpanded ? '▼ ' : '▶ '
          } else {
            prefix = '  '
          }

          const icon = node.icon ? `${node.icon} ` : ''
          const selectedStyle = isSelected ? chalk.cyan : chalk.white

          return `${indent}${prefix}${icon}${selectedStyle(node.label)}`
        })
        return lines.join('\n')
      }

      const render = () => {
        return `${renderTree()}\n\n↑↓ 选择，←→ 展开/折叠，Enter 确认，Esc 取消`
      }

      this.showDialog({
        title,
        content: render(),
        type: 'tree',
        width: 60,
        onClose: () => resolve(null),
      })

      // 监听按键
      const handler = (key: Buffer) => {
        const char = key.toString()
        const code = char.charCodeAt(0)

        if (code === 13) { // Enter
          const selected = flatNodes[selectedIndex]
          if (selected) {
            process.stdin.removeListener('data', handler)
            this.closeDialog()
            resolve(selected.node.id)
          }
        } else if (code === 27) { // Esc
          process.stdin.removeListener('data', handler)
          this.closeDialog()
          resolve(null)
        } else if (char === '\x1B[A') { // 上箭头
          selectedIndex = Math.max(0, selectedIndex - 1)
          this.updateDialogContent(render())
        } else if (char === '\x1B[B') { // 下箭头
          selectedIndex = Math.min(flatNodes.length - 1, selectedIndex + 1)
          this.updateDialogContent(render())
        } else if (char === '\x1B[C') { // 右箭头 - 展开
          const selected = flatNodes[selectedIndex]
          if (selected?.node.children) {
            expandedNodes.add(selected.node.id)
            this.updateDialogContent(render())
          }
        } else if (char === '\x1B[D') { // 左箭头 - 折叠
          const selected = flatNodes[selectedIndex]
          if (selected?.node.children) {
            expandedNodes.delete(selected.node.id)
            this.updateDialogContent(render())
          }
        }
      }

      process.stdin.on('data', handler)
    })
  }

  /**
   * 显示对话框
   */
  private showDialog(options: DialogOptions): void {
    const theme = getTheme()
    const { title, content, type = 'info', width, height, showClose = true, onClose } = options

    this.activeDialog = title
    this.dialogStack.push(title)

    // 渲染对话框
    const dialog = layoutManager.renderDialog(content || '', {
      title,
      width,
      height,
      showClose,
    })

    // 清除屏幕并显示对话框
    layoutManager.clearScreen()
    console.log(dialog)

    // 保存关闭回调
    if (onClose) {
      (this as any)._onClose = onClose
    }
  }

  /**
   * 更新对话框内容
   */
  private updateDialogContent(content: string): void {
    const theme = getTheme()
    layoutManager.clearScreen()

    // 重新渲染对话框
    const dialog = layoutManager.renderDialog(content, {
      title: this.activeDialog || 'Dialog',
      showClose: true,
    })

    console.log(dialog)
  }

  /**
   * 关闭对话框
   */
  closeDialog(): void {
    this.dialogStack.pop()
    this.activeDialog = this.dialogStack[this.dialogStack.length - 1] || null

    // 调用关闭回调
    const onClose = (this as any)._onClose
    if (onClose) {
      onClose()
      delete (this as any)._onClose
    }

    // 如果还有对话框，显示上一个
    if (this.activeDialog) {
      // 这里应该重新渲染上一个对话框
      // 简化实现：清屏
      layoutManager.clearScreen()
    }
  }

  /**
   * 获取活动对话框
   */
  getActiveDialog(): string | null {
    return this.activeDialog
  }

  /**
   * 检查是否有活动对话框
   */
  hasActiveDialog(): boolean {
    return this.activeDialog !== null
  }
}

/**
 * 创建对话框管理器
 */
export function createDialogManager(): DialogManager {
  return new DialogManager()
}

/**
 * 全局对话框管理器实例
 */
export const dialogManager = createDialogManager()

/**
 * 便捷函数
 */
export async function showConfirm(title: string, content: string): Promise<boolean> {
  return dialogManager.showConfirm(title, content)
}

export async function showInput(title: string, placeholder?: string): Promise<string | null> {
  return dialogManager.showInput(title, placeholder)
}

export async function showSelect(title: string, options: SelectOption[]): Promise<string | null> {
  return dialogManager.showSelect(title, options)
}

export async function showFuzzySearch(title: string, items: SelectOption[]): Promise<string | null> {
  return dialogManager.showFuzzySearch(title, items)
}

export async function showTreeSelect(title: string, nodes: TreeNode[]): Promise<string | null> {
  return dialogManager.showTreeSelect(title, nodes)
}

export default {
  DialogManager,
  createDialogManager,
  dialogManager,
  showConfirm,
  showInput,
  showSelect,
  showFuzzySearch,
  showTreeSelect,
}
