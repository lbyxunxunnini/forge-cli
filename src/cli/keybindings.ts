/**
 * 快捷键系统 - 对齐 Claude Code 的 KeybindingProvider
 * 支持自定义快捷键、上下文感知
 */

// 快捷键动作
export type KeybindingAction =
  | 'app:interrupt'      // Ctrl+C
  | 'app:exit'           // Ctrl+D
  | 'app:redraw'         // Ctrl+L
  | 'app:toggleTodos'    // Ctrl+T
  | 'app:toggleTranscript' // Ctrl+O
  | 'chat:cancel'        // Escape
  | 'chat:submit'        // Enter
  | 'chat:undo'          // Ctrl+Z
  | 'history:previous'   // Up
  | 'history:next'       // Down
  | 'autocomplete:accept' // Tab
  | 'autocomplete:dismiss' // Escape
  | string               // 自定义动作

// 快捷键上下文
export type KeybindingContext = 'Global' | 'Chat' | 'Autocomplete' | 'Settings' | 'Confirmation'

// 快捷键绑定
export interface Keybinding {
  key: string
  action: KeybindingAction
  context: KeybindingContext
  description?: string
}

// 快捷键块
export interface KeybindingBlock {
  context: KeybindingContext
  bindings: Record<string, KeybindingAction>
}

// 默认快捷键配置
export const DEFAULT_BINDINGS: KeybindingBlock[] = [
  {
    context: 'Global',
    bindings: {
      'ctrl+c': 'app:interrupt',
      'ctrl+d': 'app:exit',
      'ctrl+l': 'app:redraw',
      'ctrl+t': 'app:toggleTodos',
      'ctrl+o': 'app:toggleTranscript',
    },
  },
  {
    context: 'Chat',
    bindings: {
      'escape': 'chat:cancel',
      'enter': 'chat:submit',
      'up': 'history:previous',
      'down': 'history:next',
      'ctrl+z': 'chat:undo',
    },
  },
  {
    context: 'Autocomplete',
    bindings: {
      'tab': 'autocomplete:accept',
      'escape': 'autocomplete:dismiss',
      'up': 'autocomplete:previous',
      'down': 'autocomplete:next',
    },
  },
]

/**
 * 快捷键管理器
 */
export class KeybindingManager {
  private bindings: KeybindingBlock[] = [...DEFAULT_BINDINGS]
  private handlers: Map<KeybindingAction, () => void> = new Map()
  private currentContext: KeybindingContext = 'Chat'

  /**
   * 注册快捷键处理函数
   */
  on(action: KeybindingAction, handler: () => void): void {
    this.handlers.set(action, handler)
  }

  /**
   * 移除快捷键处理函数
   */
  off(action: KeybindingAction): void {
    this.handlers.delete(action)
  }

  /**
   * 触发快捷键动作
   */
  trigger(action: KeybindingAction): boolean {
    const handler = this.handlers.get(action)
    if (handler) {
      handler()
      return true
    }
    return false
  }

  /**
   * 处理按键事件
   */
  handleKey(key: string, context?: KeybindingContext): boolean {
    const ctx = context || this.currentContext

    // 在当前上下文中查找绑定
    const block = this.bindings.find(b => b.context === ctx)
    if (block && block.bindings[key]) {
      return this.trigger(block.bindings[key])
    }

    // 在全局上下文中查找绑定
    if (ctx !== 'Global') {
      const globalBlock = this.bindings.find(b => b.context === 'Global')
      if (globalBlock && globalBlock.bindings[key]) {
        return this.trigger(globalBlock.bindings[key])
      }
    }

    return false
  }

  /**
   * 设置当前上下文
   */
  setContext(context: KeybindingContext): void {
    this.currentContext = context
  }

  /**
   * 获取当前上下文
   */
  getContext(): KeybindingContext {
    return this.currentContext
  }

  /**
   * 添加自定义快捷键绑定
   */
  addBinding(binding: Keybinding): void {
    const block = this.bindings.find(b => b.context === binding.context)
    if (block) {
      block.bindings[binding.key] = binding.action
    } else {
      this.bindings.push({
        context: binding.context,
        bindings: { [binding.key]: binding.action },
      })
    }
  }

  /**
   * 移除快捷键绑定
   */
  removeBinding(key: string, context: KeybindingContext): void {
    const block = this.bindings.find(b => b.context === context)
    if (block) {
      delete block.bindings[key]
    }
  }

  /**
   * 获取所有绑定
   */
  getBindings(): KeybindingBlock[] {
    return [...this.bindings]
  }

  /**
   * 获取指定上下文的绑定
   */
  getBindingsForContext(context: KeybindingContext): Record<string, KeybindingAction> {
    const block = this.bindings.find(b => b.context === context)
    return block ? { ...block.bindings } : {}
  }

  /**
   * 重置为默认绑定
   */
  resetToDefault(): void {
    this.bindings = [...DEFAULT_BINDINGS]
  }

  /**
   * 格式化快捷键显示
   */
  formatKey(key: string): string {
    return key
      .replace('ctrl+', 'Ctrl+')
      .replace('alt+', 'Alt+')
      .replace('shift+', 'Shift+')
      .replace('meta+', 'Cmd+')
      .replace('escape', 'Esc')
      .replace('enter', 'Enter')
      .replace('tab', 'Tab')
      .replace('up', '↑')
      .replace('down', '↓')
      .replace('left', '←')
      .replace('right', '→')
  }

  /**
   * 获取快捷键帮助文本
   */
  getHelpText(): string {
    const lines: string[] = []
    const contextNames: Record<KeybindingContext, string> = {
      'Global': '全局',
      'Chat': '对话',
      'Autocomplete': '自动补全',
      'Settings': '设置',
      'Confirmation': '确认',
    }

    for (const block of this.bindings) {
      lines.push(`\n${contextNames[block.context]}:`)
      for (const [key, action] of Object.entries(block.bindings)) {
        const formattedKey = this.formatKey(key)
        lines.push(`  ${formattedKey} - ${action}`)
      }
    }

    return lines.join('\n')
  }
}

/**
 * 创建快捷键管理器
 */
export function createKeybindingManager(): KeybindingManager {
  return new KeybindingManager()
}

/**
 * 全局快捷键管理器实例
 */
export const keybindingManager = createKeybindingManager()

export default {
  KeybindingManager,
  createKeybindingManager,
  keybindingManager,
  DEFAULT_BINDINGS,
}
