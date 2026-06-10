/**
 * Spinner V2 - 对齐 Claude Code 的 Spinner 组件
 * 支持动词动画 + 计时器 + 卡住检测 + 闪烁效果
 */

import chalk from 'chalk'
import { getTheme } from './theme.js'

// Spinner 动词列表（参考 Claude Code）
export const SPINNER_VERBS = [
  '思考中',
  '分析中',
  '处理中',
  '生成中',
  '优化中',
  '执行中',
  '计算中',
  '推理中',
  '探索中',
  '构建中',
  '编写中',
  '调试中',
  '测试中',
  '部署中',
  '同步中',
  '加载中',
  '初始化中',
  '配置中',
  '验证中',
  '扫描中',
]

// Spinner 动画帧
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// 卡住检测阈值（毫秒）
const STALL_THRESHOLD_MS = 30000  // 30 秒
const STALL_WARNING_MS = 60000   // 60 秒

export interface SpinnerOptions {
  /** 初始文本 */
  text?: string
  /** 是否显示计时器 */
  showTimer?: boolean
  /** 是否启用动词动画 */
  enableVerbAnimation?: boolean
  /** 是否启用卡住检测 */
  enableStallDetection?: boolean
  /** 卡住检测阈值（毫秒） */
  stallThresholdMs?: number
  /** 自定义动词列表 */
  verbs?: string[]
}

export class SpinnerV2 {
  private text: string
  private startTime: number = 0
  private frameIndex: number = 0
  private verbIndex: number = 0
  private timer: NodeJS.Timeout | null = null
  private verbTimer: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private lastActivityTime: number = 0
  private stallIntensity: number = 0

  private options: Required<SpinnerOptions>

  constructor(options: SpinnerOptions = {}) {
    this.options = {
      text: options.text ?? '处理中...',
      showTimer: options.showTimer ?? true,
      enableVerbAnimation: options.enableVerbAnimation ?? true,
      enableStallDetection: options.enableStallDetection ?? true,
      stallThresholdMs: options.stallThresholdMs ?? STALL_THRESHOLD_MS,
      verbs: options.verbs ?? SPINNER_VERBS,
    }
    this.text = this.options.text
  }

  /**
   * 启动 Spinner
   */
  start(text?: string): void {
    if (text) this.text = text
    this.startTime = Date.now()
    this.lastActivityTime = Date.now()
    this.isRunning = true
    this.stallIntensity = 0

    // 启动动画帧
    this.timer = setInterval(() => {
      this.render()
    }, 80) // ~12.5 fps

    // 启动动词动画
    if (this.options.enableVerbAnimation) {
      this.verbTimer = setInterval(() => {
        this.verbIndex = (this.verbIndex + 1) % this.options.verbs.length
      }, 3000) // 每 3 秒切换动词
    }

    this.render()
  }

  /**
   * 停止 Spinner
   */
  stop(): void {
    this.isRunning = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    if (this.verbTimer) {
      clearInterval(this.verbTimer)
      this.verbTimer = null
    }
    // 清除当前行
    process.stdout.write('\r\x1B[K')
  }

  /**
   * 成功完成
   */
  succeed(text?: string): void {
    this.stop()
    const theme = getTheme()
    const message = text ?? this.text
    console.log(theme.success(`✓ ${message}`))
  }

  /**
   * 失败
   */
  fail(text?: string): void {
    this.stop()
    const theme = getTheme()
    const message = text ?? this.text
    console.log(theme.error(`✗ ${message}`))
  }

  /**
   * 更新文本
   */
  setText(text: string): void {
    this.text = text
    this.lastActivityTime = Date.now()
    this.stallIntensity = 0
  }

  /**
   * 报告活动（重置卡住检测）
   */
  reportActivity(): void {
    this.lastActivityTime = Date.now()
    this.stallIntensity = 0
  }

  /**
   * 渲染 Spinner
   */
  private render(): void {
    if (!this.isRunning) return

    const theme = getTheme()
    const now = Date.now()
    const elapsed = now - this.startTime

    // 计算动画帧
    this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length
    const frame = SPINNER_FRAMES[this.frameIndex]

    // 计算卡住强度
    if (this.options.enableStallDetection) {
      const timeSinceActivity = now - this.lastActivityTime
      if (timeSinceActivity > this.options.stallThresholdMs) {
        // 线性插值到红色
        this.stallIntensity = Math.min(1, (timeSinceActivity - this.options.stallThresholdMs) / STALL_WARNING_MS)
      }
    }

    // 构建显示文本
    let displayText = ''

    // 动画帧
    if (this.stallIntensity > 0.5) {
      displayText += theme.error(frame)
    } else if (this.stallIntensity > 0) {
      displayText += theme.warning(frame)
    } else {
      displayText += theme.claude(frame)
    }

    // 动词
    if (this.options.enableVerbAnimation) {
      const verb = this.options.verbs[this.verbIndex]
      displayText += ' ' + theme.claude(verb)
    }

    // 主文本
    displayText += ' ' + theme.text(this.text)

    // 计时器
    if (this.options.showTimer) {
      const seconds = Math.floor(elapsed / 1000)
      const timeStr = this.formatTime(seconds)
      displayText += ' ' + theme.subtle(`(${timeStr})`)
    }

    // 卡住警告
    if (this.stallIntensity > 0.5) {
      displayText += ' ' + theme.warning('· thinking some more')
    }

    // 写入到 stdout
    process.stdout.write(`\r\x1B[K${displayText}`)
  }

  /**
   * 格式化时间
   */
  private formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
}

/**
 * 简化的 Spinner 工厂函数
 */
export function createSpinner(text?: string, options?: SpinnerOptions): SpinnerV2 {
  return new SpinnerV2({ ...options, text })
}

/**
 * 便捷的 Spinner 包装器
 */
export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  options?: SpinnerOptions
): Promise<T> {
  const spinner = createSpinner(text, options)
  spinner.start()
  try {
    const result = await fn()
    spinner.succeed()
    return result
  } catch (error) {
    spinner.fail()
    throw error
  }
}

export default SpinnerV2
