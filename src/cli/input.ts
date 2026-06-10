/**
 * 输入组件 - 对齐 Claude Code 的 PromptInput
 * 支持多模式、自动补全、历史记录、快捷键
 */

import * as readline from 'readline'
import chalk from 'chalk'
import { getTheme } from './theme.js'

// 输入模式
export type InputMode = 'normal' | 'command' | 'search'

// 建议项
export interface SuggestionItem {
  type: 'command' | 'file' | 'history' | 'skill'
  label: string
  value: string
  description?: string
}

// 输入选项
export interface InputOptions {
  /** 提示符 */
  prompt?: string
  /** 输入模式 */
  mode?: InputMode
  /** 历史记录 */
  history?: string[]
  /** 自动补全建议 */
  suggestions?: SuggestionItem[]
  /** 是否启用 Vim 模式 */
  vimMode?: boolean
}

// 输入结果
export interface InputResult {
  text: string
  mode: InputMode
  cancelled: boolean
}

/**
 * 输入管理器
 */
export class InputManager {
  private rl: readline.Interface | null = null
  private history: string[] = []
  private historyIndex: number = -1
  private currentInput: string = ''
  private mode: InputMode = 'normal'
  private suggestions: SuggestionItem[] = []
  private selectedSuggestion: number = 0

  constructor() {
    this.loadHistory()
  }

  /**
   * 获取用户输入
   */
  async getInput(options: InputOptions = {}): Promise<InputResult> {
    const theme = getTheme()
    const prompt = options.prompt || this.getDefaultPrompt()

    return new Promise((resolve) => {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        historySize: 1000,
      })

      // 设置提示符
      this.rl.setPrompt(theme.claude(prompt))

      // 监听行事件
      this.rl.on('line', (line: string) => {
        const text = line.trim()

        // 保存到历史
        if (text && !text.startsWith('/')) {
          this.addToHistory(text)
        }

        // 检查是否是命令
        if (text.startsWith('/')) {
          this.mode = 'command'
        } else if (text.startsWith('?')) {
          this.mode = 'search'
        } else {
          this.mode = 'normal'
        }

        this.rl?.close()
        resolve({
          text,
          mode: this.mode,
          cancelled: false,
        })
      })

      // 监听关闭事件
      this.rl.on('close', () => {
        resolve({
          text: '',
          mode: this.mode,
          cancelled: true,
        })
      })

      // 监听按键事件
      this.rl.on('keypress', (key: any, data: any) => {
        this.handleKeyPress(key, data)
      })

      // 显示提示符
      this.rl.prompt()
    })
  }

  /**
   * 处理按键事件
   */
  private handleKeyPress(key: any, data: any): void {
    // Ctrl+C - 中断
    if (data?.ctrl && data?.name === 'c') {
      process.exit(0)
    }

    // Ctrl+D - 退出
    if (data?.ctrl && data?.name === 'd') {
      process.exit(0)
    }

    // Ctrl+L - 清屏
    if (data?.ctrl && data?.name === 'l') {
      console.clear()
      this.rl?.prompt()
    }

    // 上箭头 - 历史上一个
    if (data?.name === 'up') {
      this.historyPrevious()
    }

    // 下箭头 - 历史下一个
    if (data?.name === 'down') {
      this.historyNext()
    }

    // Tab - 自动补全
    if (data?.name === 'tab') {
      this.handleTabCompletion()
    }

    // Escape - 取消
    if (data?.name === 'escape') {
      this.rl?.close()
    }
  }

  /**
   * 历史上一个
   */
  private historyPrevious(): void {
    if (this.history.length === 0) return

    if (this.historyIndex === -1) {
      this.historyIndex = this.history.length - 1
    } else if (this.historyIndex > 0) {
      this.historyIndex--
    }

    const item = this.history[this.historyIndex]
    if (item) {
      this.rl?.write(null, { ctrl: true, name: 'u' }) // 清除当前行
      this.rl?.write(item)
    }
  }

  /**
   * 历史下一个
   */
  private historyNext(): void {
    if (this.historyIndex === -1) return

    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      const item = this.history[this.historyIndex]
      if (item) {
        this.rl?.write(null, { ctrl: true, name: 'u' }) // 清除当前行
        this.rl?.write(item)
      }
    } else {
      this.historyIndex = -1
      this.rl?.write(null, { ctrl: true, name: 'u' }) // 清除当前行
    }
  }

  /**
   * 处理 Tab 补全
   */
  private handleTabCompletion(): void {
    if (this.suggestions.length === 0) return

    const suggestion = this.suggestions[this.selectedSuggestion]
    if (suggestion) {
      this.rl?.write(null, { ctrl: true, name: 'u' }) // 清除当前行
      this.rl?.write(suggestion.value)
    }

    this.selectedSuggestion = (this.selectedSuggestion + 1) % this.suggestions.length
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(text: string): void {
    // 避免重复
    if (this.history[this.history.length - 1] !== text) {
      this.history.push(text)
    }

    // 限制历史记录大小
    if (this.history.length > 1000) {
      this.history.shift()
    }

    this.saveHistory()
  }

  /**
   * 加载历史记录
   */
  private loadHistory(): void {
    try {
      const fs = require('fs')
      const path = require('path')
      const historyPath = path.join(process.env.HOME || '~', '.forge-cli', 'history.json')

      if (fs.existsSync(historyPath)) {
        const data = fs.readFileSync(historyPath, 'utf-8')
        this.history = JSON.parse(data)
      }
    } catch (error) {
      // 忽略加载错误
    }
  }

  /**
   * 保存历史记录
   */
  private saveHistory(): void {
    try {
      const fs = require('fs')
      const path = require('path')
      const historyDir = path.join(process.env.HOME || '~', '.forge-cli')

      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true })
      }

      const historyPath = path.join(historyDir, 'history.json')
      fs.writeFileSync(historyPath, JSON.stringify(this.history, null, 2))
    } catch (error) {
      // 忽略保存错误
    }
  }

  /**
   * 获取默认提示符
   */
  private getDefaultPrompt(): string {
    const theme = getTheme()
    return theme.claude('❯ ') + theme.text('')
  }

  /**
   * 设置建议
   */
  setSuggestions(suggestions: SuggestionItem[]): void {
    this.suggestions = suggestions
    this.selectedSuggestion = 0
  }

  /**
   * 清除建议
   */
  clearSuggestions(): void {
    this.suggestions = []
    this.selectedSuggestion = 0
  }

  /**
   * 获取当前模式
   */
  getMode(): InputMode {
    return this.mode
  }

  /**
   * 设置模式
   */
  setMode(mode: InputMode): void {
    this.mode = mode
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    if (this.rl) {
      this.rl.close()
      this.rl = null
    }
  }
}

/**
 * 创建输入管理器
 */
export function createInputManager(): InputManager {
  return new InputManager()
}

/**
 * 简化的输入函数
 */
export async function prompt(
  text: string,
  options: Partial<InputOptions> = {}
): Promise<string> {
  const manager = createInputManager()
  const result = await manager.getInput({
    ...options,
    prompt: text,
  })
  manager.cleanup()
  return result.text
}

/**
 * 确认对话框
 */
export async function confirm(
  text: string,
  defaultValue: boolean = false
): Promise<boolean> {
  const theme = getTheme()
  const suffix = defaultValue ? ' (Y/n)' : ' (y/N)'

  const answer = await prompt(theme.claude('? ') + theme.text(text) + theme.subtle(suffix))
  const normalized = answer.trim().toLowerCase()

  if (normalized === '') return defaultValue
  return normalized === 'y' || normalized === 'yes'
}

/**
 * 选择对话框
 */
export async function select(
  text: string,
  options: string[]
): Promise<number | null> {
  const theme = getTheme()

  console.log(theme.text.bold(`\n${text}`))
  options.forEach((opt, i) => {
    console.log(`  ${theme.claude(i + 1 + '')}. ${opt}`)
  })
  console.log(theme.subtle('  0. 取消'))

  const answer = await prompt(theme.claude('\n> '))
  const num = parseInt(answer.trim())

  if (isNaN(num) || num < 0 || num > options.length) return null
  return num === 0 ? null : num - 1
}

export default {
  InputManager,
  createInputManager,
  prompt,
  confirm,
  select,
}
