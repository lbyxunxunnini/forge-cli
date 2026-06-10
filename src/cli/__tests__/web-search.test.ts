/**
 * WebSearch 测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { WebSearchManager, createWebSearchManager } from '../web-search.js'

describe('WebSearch', () => {
  let manager: WebSearchManager

  beforeEach(() => {
    manager = createWebSearchManager()
  })

  describe('初始化', () => {
    it('应该创建管理器实例', () => {
      expect(manager).toBeDefined()
      expect(manager).toBeInstanceOf(WebSearchManager)
    })

    it('应该检查配置状态', () => {
      // 未配置时应该返回 false
      expect(manager.isConfigured()).toBe(false)
    })

    it('应该设置 API Key', () => {
      manager.setApiKey('test-key')
      expect(manager.isConfigured()).toBe(true)
    })
  })

  describe('search', () => {
    it('应该返回错误当未配置 API Key', async () => {
      const result = await manager.search({ query: 'test' })

      expect(result.error).toBeDefined()
      expect(result.error).toContain('未配置')
      expect(result.content).toBe('')
      expect(result.references).toEqual([])
    })

    it('应该返回错误当 API Key 无效', async () => {
      manager.setApiKey('invalid-key')

      const result = await manager.search({ query: 'test' })

      expect(result.error).toBeDefined()
      expect(result.duration).toBeGreaterThan(0)
    }, 30000)
  })

  describe('renderResult', () => {
    it('应该渲染错误结果', () => {
      const result = {
        requestId: 'test',
        content: '',
        references: [],
        error: '测试错误',
        duration: 100,
      }

      const output = manager.renderResult(result)

      expect(output).toContain('测试错误')
    })

    it('应该渲染成功结果', () => {
      const result = {
        requestId: 'test',
        content: '测试内容',
        references: [
          {
            id: 1,
            url: 'https://example.com',
            title: '示例',
            content: '示例内容',
            type: 'web' as const,
          },
        ],
        duration: 100,
      }

      const output = manager.renderResult(result)

      expect(output).toContain('测试内容')
      expect(output).toContain('示例')
      expect(output).toContain('example.com')
    })

    it('应该渲染简洁结果', () => {
      const result = {
        requestId: 'test',
        content: '测试内容',
        references: [],
        duration: 100,
      }

      const output = manager.renderCompactResult(result)

      expect(output).toContain('测试内容')
    })
  })
})
