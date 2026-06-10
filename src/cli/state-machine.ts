/**
 * 状态机增强系统
 * 支持严格的状态转换验证、完整的状态历史记录、崩溃后精确恢复
 */

import { getTheme } from './theme.js'

// 状态类型
export type StateType = string

// 状态转换
export interface StateTransition {
  from: StateType
  to: StateType
  event: string
  guard?: (context: any) => boolean
  action?: (context: any) => void
}

// 状态历史记录
export interface StateHistoryEntry {
  from: StateType
  to: StateType
  event: string
  timestamp: number
  context?: any
  duration?: number
}

// 状态机配置
export interface StateMachineConfig {
  initialState: StateType
  states: StateType[]
  transitions: StateTransition[]
  onStateChange?: (from: StateType, to: StateType, event: string) => void
  onError?: (error: StateMachineError) => void
}

// 状态机错误
export class StateMachineError extends Error {
  constructor(
    message: string,
    public code: string,
    public currentState: StateType,
    public event?: string,
    public targetState?: StateType
  ) {
    super(message)
    this.name = 'StateMachineError'
  }
}

// 状态机快照（用于恢复）
export interface StateMachineSnapshot {
  currentState: StateType
  history: StateHistoryEntry[]
  context: any
  timestamp: number
}

/**
 * 状态机管理器
 */
export class StateMachine {
  private currentState: StateType
  private states: Set<StateType>
  private transitions: Map<string, StateTransition[]>
  private history: StateHistoryEntry[] = []
  private context: any = {}
  private config: StateMachineConfig
  private stateStartTime: number = Date.now()

  constructor(config: StateMachineConfig) {
    this.config = config
    this.currentState = config.initialState
    this.states = new Set(config.states)
    this.transitions = new Map()

    // 索引转换规则
    for (const transition of config.transitions) {
      const key = `${transition.from}:${transition.event}`
      if (!this.transitions.has(key)) {
        this.transitions.set(key, [])
      }
      this.transitions.get(key)!.push(transition)
    }
  }

  /**
   * 获取当前状态
   */
  getCurrentState(): StateType {
    return this.currentState
  }

  /**
   * 获取状态历史
   */
  getHistory(): StateHistoryEntry[] {
    return [...this.history]
  }

  /**
   * 获取上下文
   */
  getContext(): any {
    return { ...this.context }
  }

  /**
   * 设置上下文
   */
  setContext(context: any): void {
    this.context = { ...this.context, ...context }
  }

  /**
   * 获取当前状态持续时间
   */
  getCurrentStateDuration(): number {
    return Date.now() - this.stateStartTime
  }

  /**
   * 触发事件
   */
  send(event: string, data?: any): boolean {
    const key = `${this.currentState}:${event}`
    const transitions = this.transitions.get(key) || []

    if (transitions.length === 0) {
      const error = new StateMachineError(
        `无效的状态转换: ${this.currentState} + ${event}`,
        'INVALID_TRANSITION',
        this.currentState,
        event
      )
      this.config.onError?.(error)
      throw error
    }

    // 查找满足条件的转换
    const validTransition = transitions.find(t => {
      if (t.guard) {
        return t.guard({ ...this.context, ...data })
      }
      return true
    })

    if (!validTransition) {
      const error = new StateMachineError(
        `状态转换条件不满足: ${this.currentState} + ${event}`,
        'GUARD_FAILED',
        this.currentState,
        event
      )
      this.config.onError?.(error)
      throw error
    }

    // 执行转换
    const from = this.currentState
    const to = validTransition.to
    const duration = this.getCurrentStateDuration()

    // 记录历史
    this.history.push({
      from,
      to,
      event,
      timestamp: Date.now(),
      context: data,
      duration,
    })

    // 执行动作
    if (validTransition.action) {
      validTransition.action({ ...this.context, ...data })
    }

    // 更新状态
    this.currentState = to
    this.stateStartTime = Date.now()

    // 触发回调
    this.config.onStateChange?.(from, to, event)

    return true
  }

  /**
   * 检查是否可以触发事件
   */
  canSend(event: string): boolean {
    const key = `${this.currentState}:${event}`
    const transitions = this.transitions.get(key) || []
    return transitions.length > 0
  }

  /**
   * 获取当前状态可用的事件
   */
  getAvailableEvents(): string[] {
    const events: string[] = []
    for (const [key] of this.transitions) {
      const [state, event] = key.split(':')
      if (state === this.currentState) {
        events.push(event)
      }
    }
    return events
  }

  /**
   * 获取状态转换图
   */
  getTransitionGraph(): { from: string; to: string; event: string }[] {
    const graph: { from: string; to: string; event: string }[] = []
    for (const transitions of this.transitions.values()) {
      for (const t of transitions) {
        graph.push({ from: t.from, to: t.to, event: t.event })
      }
    }
    return graph
  }

  /**
   * 创建快照
   */
  createSnapshot(): StateMachineSnapshot {
    return {
      currentState: this.currentState,
      history: [...this.history],
      context: { ...this.context },
      timestamp: Date.now(),
    }
  }

  /**
   * 从快照恢复
   */
  restoreFromSnapshot(snapshot: StateMachineSnapshot): void {
    if (!this.states.has(snapshot.currentState)) {
      throw new StateMachineError(
        `快照中的状态无效: ${snapshot.currentState}`,
        'INVALID_STATE',
        snapshot.currentState
      )
    }

    this.currentState = snapshot.currentState
    this.history = [...snapshot.history]
    this.context = { ...snapshot.context }
    this.stateStartTime = Date.now()
  }

  /**
   * 重置状态机
   */
  reset(): void {
    this.currentState = this.config.initialState
    this.history = []
    this.context = {}
    this.stateStartTime = Date.now()
  }

  /**
   * 渲染状态机信息
   */
  render(): string {
    const theme = getTheme()
    const lines: string[] = []

    // 当前状态
    lines.push(theme.text.bold('状态机'))
    lines.push(theme.inactive('─'.repeat(40)))
    lines.push(`  ${theme.subtle('当前状态:')} ${theme.claude(this.currentState)}`)
    lines.push(`  ${theme.subtle('持续时间:')} ${theme.text(`${this.getCurrentStateDuration()}ms`)}`)

    // 可用事件
    const events = this.getAvailableEvents()
    if (events.length > 0) {
      lines.push(`  ${theme.subtle('可用事件:')} ${theme.text(events.join(', '))}`)
    }

    // 历史记录
    if (this.history.length > 0) {
      lines.push('')
      lines.push(theme.text.bold('历史记录:'))
      lines.push(theme.inactive('─'.repeat(40)))

      const recentHistory = this.history.slice(-10)
      for (const entry of recentHistory) {
        const time = new Date(entry.timestamp).toLocaleTimeString()
        const duration = entry.duration ? ` (${entry.duration}ms)` : ''
        lines.push(`  ${theme.subtle(time)} ${theme.claude(entry.from)} → ${theme.claude(entry.to)} ${theme.subtle(entry.event)}${duration}`)
      }

      if (this.history.length > 10) {
        lines.push(theme.subtle(`  ... 还有 ${this.history.length - 10} 条记录`))
      }
    }

    return lines.join('\n')
  }

  /**
   * 渲染状态转换图
   */
  renderTransitionGraph(): string {
    const theme = getTheme()
    const lines: string[] = []

    lines.push(theme.text.bold('状态转换图'))
    lines.push(theme.inactive('─'.repeat(60)))

    const graph = this.getTransitionGraph()
    const states = new Set<string>()
    const transitionsByState = new Map<string, { to: string; event: string }[]>()

    for (const edge of graph) {
      states.add(edge.from)
      states.add(edge.to)

      if (!transitionsByState.has(edge.from)) {
        transitionsByState.set(edge.from, [])
      }
      transitionsByState.get(edge.from)!.push({ to: edge.to, event: edge.event })
    }

    for (const state of states) {
      const isCurrent = state === this.currentState
      const stateLabel = isCurrent ? theme.claude(`[${state}]`) : theme.text(state)
      lines.push(`  ${stateLabel}`)

      const transitions = transitionsByState.get(state) || []
      for (const t of transitions) {
        const arrow = isCurrent ? theme.claude('→') : theme.subtle('→')
        lines.push(`    ${arrow} ${theme.text(t.to)} ${theme.subtle(`(${t.event})`)}`)
      }
    }

    return lines.join('\n')
  }
}

/**
 * 创建状态机
 */
export function createStateMachine(config: StateMachineConfig): StateMachine {
  return new StateMachine(config)
}

/**
 * 保存状态机快照到文件
 */
export async function saveSnapshot(snapshot: StateMachineSnapshot, filePath: string): Promise<void> {
  const fs = require('fs')
  const content = JSON.stringify(snapshot, null, 2)
  fs.writeFileSync(filePath, content)
}

/**
 * 从文件加载状态机快照
 */
export async function loadSnapshot(filePath: string): Promise<StateMachineSnapshot | null> {
  const fs = require('fs')
  if (!fs.existsSync(filePath)) {
    return null
  }
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

export default {
  StateMachine,
  StateMachineError,
  createStateMachine,
  saveSnapshot,
  loadSnapshot,
}
