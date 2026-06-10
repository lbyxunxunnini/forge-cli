/**
 * 消息组件系统 - 对齐 Claude Code 的 Messages 组件
 * 支持消息类型、格式化、操作菜单
 */

import chalk from 'chalk'
import { getTheme } from './theme.js'

// 消息类型
export type MessageType = 'user' | 'assistant' | 'system' | 'tool_use' | 'tool_result' | 'error' | 'warning'

// 消息状态
export type MessageStatus = 'pending' | 'streaming' | 'complete' | 'error'

// 消息数据
export interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: number
  status: MessageStatus
  metadata?: MessageMetadata
}

// 消息元数据
export interface MessageMetadata {
  toolName?: string
  toolInput?: Record<string, any>
  toolResult?: string
  duration?: number
  tokens?: number
  model?: string
  isError?: boolean
  errorMessage?: string
}

// 消息操作
export type MessageAction = 'copy' | 'retry' | 'edit' | 'delete' | 'quote'

// 操作菜单项
export interface MessageMenuItem {
  action: MessageAction
  label: string
  key: string
  enabled: boolean
}

// 消息渲染选项
export interface MessageRenderOptions {
  showTimestamp?: boolean
  showMetadata?: boolean
  showActions?: boolean
  maxWidth?: number
  indent?: number
}

/**
 * 消息管理器
 */
export class MessageManager {
  private messages: Message[] = []
  private nextId: number = 1

  /**
   * 添加消息
   */
  add(type: MessageType, content: string, metadata?: MessageMetadata): Message {
    const message: Message = {
      id: String(this.nextId++),
      type,
      content,
      timestamp: Date.now(),
      status: 'complete',
      metadata,
    }
    this.messages.push(message)
    return message
  }

  /**
   * 添加用户消息
   */
  addUser(content: string): Message {
    return this.add('user', content)
  }

  /**
   * 添加 Assistant 消息
   */
  addAssistant(content: string, metadata?: MessageMetadata): Message {
    return this.add('assistant', content, metadata)
  }

  /**
   * 添加系统消息
   */
  addSystem(content: string): Message {
    return this.add('system', content)
  }

  /**
   * 添加工具调用消息
   */
  addToolUse(toolName: string, input: Record<string, any>): Message {
    return this.add('tool_use', `Using tool: ${toolName}`, {
      toolName,
      toolInput: input,
    })
  }

  /**
   * 添加工具结果消息
   */
  addToolResult(toolName: string, result: string, isError: boolean = false): Message {
    return this.add('tool_result', result, {
      toolName,
      toolResult: result,
      isError,
    })
  }

  /**
   * 添加错误消息
   */
  addError(content: string, errorMessage?: string): Message {
    return this.add('error', content, {
      isError: true,
      errorMessage,
    })
  }

  /**
   * 添加警告消息
   */
  addWarning(content: string): Message {
    return this.add('warning', content)
  }

  /**
   * 更新消息内容
   */
  update(id: string, content: string): boolean {
    const message = this.messages.find(m => m.id === id)
    if (message) {
      message.content = content
      return true
    }
    return false
  }

  /**
   * 更新消息状态
   */
  updateStatus(id: string, status: MessageStatus): boolean {
    const message = this.messages.find(m => m.id === id)
    if (message) {
      message.status = status
      return true
    }
    return false
  }

  /**
   * 获取消息
   */
  get(id: string): Message | undefined {
    return this.messages.find(m => m.id === id)
  }

  /**
   * 获取所有消息
   */
  getAll(): Message[] {
    return [...this.messages]
  }

  /**
   * 获取最近的消息
   */
  getRecent(count: number): Message[] {
    return this.messages.slice(-count)
  }

  /**
   * 清空消息
   */
  clear(): void {
    this.messages = []
  }

  /**
   * 删除消息
   */
  delete(id: string): boolean {
    const index = this.messages.findIndex(m => m.id === id)
    if (index !== -1) {
      this.messages.splice(index, 1)
      return true
    }
    return false
  }

  /**
   * 获取消息数量
   */
  count(): number {
    return this.messages.length
  }

  /**
   * 搜索消息
   */
  search(query: string): Message[] {
    const lowerQuery = query.toLowerCase()
    return this.messages.filter(m =>
      m.content.toLowerCase().includes(lowerQuery) ||
      m.metadata?.toolName?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * 获取消息历史（用于上下文）
   */
  getContext(maxTokens: number = 4000): Message[] {
    const result: Message[] = []
    let totalTokens = 0

    // 从后往前遍历
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i]
      const estimatedTokens = this.estimateTokens(message.content)

      if (totalTokens + estimatedTokens > maxTokens) {
        break
      }

      result.unshift(message)
      totalTokens += estimatedTokens
    }

    return result
  }

  /**
   * 估算 token 数量
   */
  private estimateTokens(text: string): number {
    // 简单估算：1 个中文字符 ≈ 2 tokens，1 个英文单词 ≈ 1 token
    const chineseChars = (text.match(/[一-鿿]/g) || []).length
    const englishWords = text.split(/\s+/).filter(w => /^[a-zA-Z]+$/.test(w)).length
    return chineseChars * 2 + englishWords
  }
}

/**
 * 消息渲染器
 */
export class MessageRenderer {
  private options: MessageRenderOptions

  constructor(options: MessageRenderOptions = {}) {
    this.options = {
      showTimestamp: options.showTimestamp ?? false,
      showMetadata: options.showMetadata ?? true,
      showActions: options.showActions ?? false,
      maxWidth: options.maxWidth ?? (process.stdout.columns || 80),
      indent: options.indent ?? 0,
    }
  }

  /**
   * 渲染消息
   */
  render(message: Message): string {
    const theme = getTheme()
    const lines: string[] = []

    // 根据消息类型渲染
    switch (message.type) {
      case 'user':
        lines.push(this.renderUserMessage(message))
        break
      case 'assistant':
        lines.push(this.renderAssistantMessage(message))
        break
      case 'system':
        lines.push(this.renderSystemMessage(message))
        break
      case 'tool_use':
        lines.push(this.renderToolUseMessage(message))
        break
      case 'tool_result':
        lines.push(this.renderToolResultMessage(message))
        break
      case 'error':
        lines.push(this.renderErrorMessage(message))
        break
      case 'warning':
        lines.push(this.renderWarningMessage(message))
        break
    }

    // 添加时间戳
    if (this.options.showTimestamp) {
      const time = new Date(message.timestamp).toLocaleTimeString()
      lines[lines.length - 1] += theme.subtle(` (${time})`)
    }

    // 添加元数据
    if (this.options.showMetadata && message.metadata) {
      const metadata = this.renderMetadata(message.metadata)
      if (metadata) {
        lines.push(metadata)
      }
    }

    // 添加操作菜单
    if (this.options.showActions) {
      const actions = this.renderActions(message)
      if (actions) {
        lines.push(actions)
      }
    }

    return lines.join('\n')
  }

  /**
   * 渲染用户消息
   */
  private renderUserMessage(message: Message): string {
    const theme = getTheme()
    const maxWidth = this.options.maxWidth! - 4
    const content = this.truncate(message.content, maxWidth)

    return [
      theme.claude('┌' + '─'.repeat(maxWidth + 2) + '┐'),
      theme.claude('│') + ' ' + theme.text(content) + ' '.repeat(Math.max(0, maxWidth - content.length)) + ' ' + theme.claude('│'),
      theme.claude('└' + '─'.repeat(maxWidth + 2) + '┘'),
    ].join('\n')
  }

  /**
   * 渲染 Assistant 消息
   */
  private renderAssistantMessage(message: Message): string {
    const theme = getTheme()
    const prefix = theme.claude('▸ ')
    return prefix + this.renderMarkdown(message.content)
  }

  /**
   * 渲染系统消息
   */
  private renderSystemMessage(message: Message): string {
    const theme = getTheme()
    return theme.subtle(`* ${message.content}`)
  }

  /**
   * 渲染工具调用消息
   */
  private renderToolUseMessage(message: Message): string {
    const theme = getTheme()
    const toolName = message.metadata?.toolName || 'unknown'
    const input = message.metadata?.toolInput

    let result = theme.claude('⏺ ') + theme.text.bold(`Using tool: ${theme.ide(toolName)}`)

    if (input) {
      const inputStr = JSON.stringify(input, null, 2)
      if (inputStr.length < 200) {
        result += '\n' + theme.subtle('  Input: ') + theme.text(inputStr)
      } else {
        result += '\n' + theme.subtle('  Input: ') + theme.text(this.truncate(inputStr, 100))
      }
    }

    return result
  }

  /**
   * 渲染工具结果消息
   */
  private renderToolResultMessage(message: Message): string {
    const theme = getTheme()
    const isError = message.metadata?.isError || false
    const prefix = isError ? theme.error('✗') : theme.success('✓')
    return `${prefix} ${theme.subtle('Tool result:')} ${theme.text(this.truncate(message.content, 200))}`
  }

  /**
   * 渲染错误消息
   */
  private renderErrorMessage(message: Message): string {
    const theme = getTheme()
    return theme.error(`✗ ${message.content}`)
  }

  /**
   * 渲染警告消息
   */
  private renderWarningMessage(message: Message): string {
    const theme = getTheme()
    return theme.warning(`⚠ ${message.content}`)
  }

  /**
   * 渲染元数据
   */
  private renderMetadata(metadata: MessageMetadata): string | null {
    const theme = getTheme()
    const parts: string[] = []

    if (metadata.duration) {
      const seconds = Math.floor(metadata.duration / 1000)
      parts.push(`${seconds}s`)
    }

    if (metadata.tokens) {
      parts.push(`${metadata.tokens} tokens`)
    }

    if (metadata.model) {
      parts.push(metadata.model)
    }

    if (parts.length === 0) return null

    return theme.subtle(`  ${parts.join(' │ ')}`)
  }

  /**
   * 渲染操作菜单
   */
  private renderActions(message: Message): string | null {
    const theme = getTheme()
    const actions = this.getAvailableActions(message)

    if (actions.length === 0) return null

    const actionStr = actions
      .map(a => `${theme.claude(a.key)}${theme.subtle(':')}${theme.text(a.label)}`)
      .join(' ')

    return theme.subtle('  ') + actionStr
  }

  /**
   * 获取可用操作
   */
  private getAvailableActions(message: Message): MessageMenuItem[] {
    const actions: MessageMenuItem[] = []

    actions.push({
      action: 'copy',
      label: '复制',
      key: 'c',
      enabled: true,
    })

    if (message.type === 'user') {
      actions.push({
        action: 'edit',
        label: '编辑',
        key: 'e',
        enabled: true,
      })
    }

    if (message.type === 'assistant') {
      actions.push({
        action: 'retry',
        label: '重试',
        key: 'r',
        enabled: true,
      })
    }

    actions.push({
      action: 'quote',
      label: '引用',
      key: 'q',
      enabled: true,
    })

    return actions
  }

  /**
   * 渲染 Markdown
   */
  private renderMarkdown(text: string): string {
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

      result.push(line)
    }

    if (inCodeBlock) result.push(theme.inactive('└' + '─'.repeat(40)))

    return result.join('\n')
  }

  /**
   * 截断文本
   */
  private truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str
    return str.slice(0, maxLen - 3) + '...'
  }
}

/**
 * 创建消息管理器
 */
export function createMessageManager(): MessageManager {
  return new MessageManager()
}

/**
 * 创建消息渲染器
 */
export function createMessageRenderer(options?: MessageRenderOptions): MessageRenderer {
  return new MessageRenderer(options)
}

/**
 * 全局消息管理器实例
 */
export const messageManager = createMessageManager()

/**
 * 全局消息渲染器实例
 */
export const messageRenderer = createMessageRenderer()

export default {
  MessageManager,
  MessageRenderer,
  createMessageManager,
  createMessageRenderer,
  messageManager,
  messageRenderer,
}
