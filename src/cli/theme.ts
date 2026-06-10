/**
 * 主题系统 - 对齐 Claude Code 的 ThemeProvider
 * 支持 6 种主题：dark/light/daltonized/ansi
 */

import chalk from 'chalk'

// 颜色类型定义
export type Theme = {
  // 主色调
  claude: chalk.Chalk
  claudeShimmer: chalk.Chalk

  // 文本颜色
  text: chalk.Chalk
  inverseText: chalk.Chalk
  subtle: chalk.Chalk
  inactive: chalk.Chalk

  // 语义颜色
  success: chalk.Chalk
  error: chalk.Chalk
  warning: chalk.Chalk

  // UI 元素颜色
  promptBorder: chalk.Chalk
  promptBorderShimmer: chalk.Chalk
  background: chalk.Chalk

  // 状态颜色
  permission: chalk.Chalk
  planMode: chalk.Chalk
  ide: chalk.Chalk

  // 消息颜色
  userMessageBackground: chalk.Chalk
  bashMessageBackgroundColor: chalk.Chalk

  // 加载动画颜色
  fastMode: chalk.Chalk
  fastModeShimmer: chalk.Chalk

  // Diff 颜色
  diffAdded: chalk.Chalk
  diffRemoved: chalk.Chalk
  diffAddedDimmed: chalk.Chalk
  diffRemovedDimmed: chalk.Chalk
}

// 主题名称类型
export type ThemeName = 'dark' | 'light' | 'light-daltonized' | 'dark-daltonized' | 'light-ansi' | 'dark-ansi'

// 深色主题（默认）
const darkTheme: Theme = {
  claude: chalk.hex('#E8A0BF'),        // 粉紫色
  claudeShimmer: chalk.hex('#F0C0D0'), // 浅粉紫

  text: chalk.white,
  inverseText: chalk.black,
  subtle: chalk.gray,
  inactive: chalk.dim.gray,

  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,

  promptBorder: chalk.hex('#E8A0BF'),
  promptBorderShimmer: chalk.hex('#F0C0D0'),
  background: chalk.bgBlack,

  permission: chalk.hex('#FFD700'),    // 金色
  planMode: chalk.hex('#87CEEB'),      // 天蓝色
  ide: chalk.hex('#98FB98'),           // 浅绿色

  userMessageBackground: chalk.bgHex('#1A1A2E'),
  bashMessageBackgroundColor: chalk.bgHex('#16213E'),

  fastMode: chalk.hex('#FF6B6B'),      // 红色
  fastModeShimmer: chalk.hex('#FF8E8E'), // 浅红色

  diffAdded: chalk.green,
  diffRemoved: chalk.red,
  diffAddedDimmed: chalk.dim.green,
  diffRemovedDimmed: chalk.dim.red,
}

// 浅色主题
const lightTheme: Theme = {
  claude: chalk.hex('#8B5CF6'),        // 紫色
  claudeShimmer: chalk.hex('#A78BFA'), // 浅紫色

  text: chalk.black,
  inverseText: chalk.white,
  subtle: chalk.gray,
  inactive: chalk.dim.gray,

  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,

  promptBorder: chalk.hex('#8B5CF6'),
  promptBorderShimmer: chalk.hex('#A78BFA'),
  background: chalk.bgWhite,

  permission: chalk.hex('#D97706'),    // 橙色
  planMode: chalk.hex('#2563EB'),      // 蓝色
  ide: chalk.hex('#059669'),           // 绿色

  userMessageBackground: chalk.bgHex('#F3F4F6'),
  bashMessageBackgroundColor: chalk.bgHex('#E5E7EB'),

  fastMode: chalk.hex('#DC2626'),      // 红色
  fastModeShimmer: chalk.hex('#EF4444'), // 浅红色

  diffAdded: chalk.green,
  diffRemoved: chalk.red,
  diffAddedDimmed: chalk.dim.green,
  diffRemovedDimmed: chalk.dim.red,
}

// ANSI 主题（兼容性）
const ansiTheme: Theme = {
  claude: chalk.cyan,
  claudeShimmer: chalk.cyanBright,

  text: chalk.white,
  inverseText: chalk.black,
  subtle: chalk.gray,
  inactive: chalk.dim,

  success: chalk.green,
  error: chalk.red,
  warning: chalk.yellow,

  promptBorder: chalk.cyan,
  promptBorderShimmer: chalk.cyanBright,
  background: chalk.bgBlack,

  permission: chalk.yellow,
  planMode: chalk.blue,
  ide: chalk.green,

  userMessageBackground: chalk.bgBlue,
  bashMessageBackgroundColor: chalk.bgCyan,

  fastMode: chalk.red,
  fastModeShimmer: chalk.redBright,

  diffAdded: chalk.green,
  diffRemoved: chalk.red,
  diffAddedDimmed: chalk.dim,
  diffRemovedDimmed: chalk.dim,
}

// 主题映射
const themes: Record<ThemeName, Theme> = {
  dark: darkTheme,
  light: lightTheme,
  'light-daltonized': lightTheme,  // 简化实现
  'dark-daltonized': darkTheme,    // 简化实现
  'light-ansi': ansiTheme,
  'dark-ansi': ansiTheme,
}

// 当前主题
let currentThemeName: ThemeName = 'dark'
let currentTheme: Theme = darkTheme

/**
 * 获取当前主题
 */
export function getTheme(): Theme {
  return currentTheme
}

/**
 * 获取当前主题名称
 */
export function getThemeName(): ThemeName {
  return currentThemeName
}

/**
 * 设置主题
 */
export function setTheme(name: ThemeName): void {
  currentThemeName = name
  currentTheme = themes[name]
}

/**
 * 获取所有可用主题名称
 */
export function getAvailableThemes(): ThemeName[] {
  return Object.keys(themes) as ThemeName[]
}

/**
 * 主题化文本工具函数
 */
export const t = {
  // 主色调
  claude: (text: string) => currentTheme.claude(text),
  claudeShimmer: (text: string) => currentTheme.claudeShimmer(text),

  // 文本
  text: (text: string) => currentTheme.text(text),
  subtle: (text: string) => currentTheme.subtle(text),
  inactive: (text: string) => currentTheme.inactive(text),

  // 语义
  success: (text: string) => currentTheme.success(text),
  error: (text: string) => currentTheme.error(text),
  warning: (text: string) => currentTheme.warning(text),

  // UI 元素
  border: (text: string) => currentTheme.promptBorder(text),
  permission: (text: string) => currentTheme.permission(text),

  // 组合
  info: (text: string) => currentTheme.subtle(text),
  highlight: (text: string) => currentTheme.claude(text),
}

export default {
  getTheme,
  getThemeName,
  setTheme,
  getAvailableThemes,
  t,
}
