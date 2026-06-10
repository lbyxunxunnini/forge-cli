/**
 * 主题系统测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getTheme,
  setTheme,
  getThemeName,
  getAvailableThemes,
  t,
} from '../theme.js'

describe('主题系统', () => {
  beforeEach(() => {
    // 重置为默认主题
    setTheme('dark')
  })

  describe('getTheme', () => {
    it('应该返回主题对象', () => {
      const theme = getTheme()
      expect(theme).toBeDefined()
      expect(theme.claude).toBeDefined()
      expect(theme.text).toBeDefined()
      expect(theme.success).toBeDefined()
      expect(theme.error).toBeDefined()
      expect(theme.warning).toBeDefined()
    })

    it('应该包含所有必需的颜色属性', () => {
      const theme = getTheme()
      const requiredKeys = [
        'claude',
        'text',
        'subtle',
        'success',
        'error',
        'warning',
        'promptBorder',
        'background',
      ]

      for (const key of requiredKeys) {
        expect(theme).toHaveProperty(key)
      }
    })
  })

  describe('setTheme', () => {
    it('应该切换主题', () => {
      setTheme('light')
      expect(getThemeName()).toBe('light')

      setTheme('dark')
      expect(getThemeName()).toBe('dark')
    })

    it('应该支持所有主题', () => {
      const themes = getAvailableThemes()

      for (const themeName of themes) {
        setTheme(themeName)
        expect(getThemeName()).toBe(themeName)
      }
    })
  })

  describe('getThemeName', () => {
    it('应该返回当前主题名称', () => {
      expect(getThemeName()).toBe('dark')

      setTheme('light')
      expect(getThemeName()).toBe('light')
    })
  })

  describe('getAvailableThemes', () => {
    it('应该返回可用主题列表', () => {
      const themes = getAvailableThemes()
      expect(Array.isArray(themes)).toBe(true)
      expect(themes.length).toBeGreaterThan(0)
    })

    it('应该包含基本主题', () => {
      const themes = getAvailableThemes()
      expect(themes).toContain('dark')
      expect(themes).toContain('light')
    })
  })

  describe('t 工具函数', () => {
    it('应该格式化文本', () => {
      const result = t.claude('test')
      expect(typeof result).toBe('string')
    })

    it('应该支持所有颜色函数', () => {
      expect(typeof t.claude).toBe('function')
      expect(typeof t.text).toBe('function')
      expect(typeof t.subtle).toBe('function')
      expect(typeof t.success).toBe('function')
      expect(typeof t.error).toBe('function')
      expect(typeof t.warning).toBe('function')
    })
  })
})
