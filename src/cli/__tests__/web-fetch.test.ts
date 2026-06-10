/**
 * WebFetch 测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { WebFetchManager, createWebFetchManager } from '../web-fetch.js'

describe('WebFetch', () => {
  let manager: WebFetchManager

  beforeEach(() => {
    manager = createWebFetchManager()
  })

  describe('初始化', () => {
    it('应该创建管理器实例', () => {
      expect(manager).toBeDefined()
      expect(manager).toBeInstanceOf(WebFetchManager)
    })
  })

  describe('fetch', () => {
    it('应该获取网页内容', async () => {
      const result = await manager.fetch({
        url: 'https://example.com',
        extractText: true,
        extractLinks: false,
        extractImages: false,
      })

      expect(result).toBeDefined()
      expect(result.url).toBe('https://example.com')
      expect(result.statusCode).toBe(200)
      expect(result.text).toBeDefined()
      expect(result.duration).toBeGreaterThan(0)
    }, 30000)

    it('应该提取链接', async () => {
      const result = await manager.fetch({
        url: 'https://example.com',
        extractText: true,
        extractLinks: true,
        extractImages: false,
      })

      expect(result.links).toBeDefined()
      expect(Array.isArray(result.links)).toBe(true)
    }, 30000)

    it('应该处理错误 URL', async () => {
      const result = await manager.fetch({
        url: 'https://invalid-url-that-does-not-exist.com',
        extractText: true,
      })

      // 可能返回错误或者空内容
      expect(result).toBeDefined()
      expect(result.duration).toBeGreaterThan(0)
    }, 30000)
  })

  describe('fetchText', () => {
    it('应该快速获取网页文本', async () => {
      const text = await manager.fetchText('https://example.com')

      expect(typeof text).toBe('string')
      expect(text.length).toBeGreaterThan(0)
    }, 30000)
  })

  describe('fetchTitle', () => {
    it('应该获取网页标题', async () => {
      const title = await manager.fetchTitle('https://example.com')

      expect(typeof title).toBe('string')
    }, 30000)
  })

  describe('renderResult', () => {
    it('应该渲染完整结果', async () => {
      const result = await manager.fetch({
        url: 'https://example.com',
        extractText: true,
        extractLinks: false,
      })

      const output = manager.renderResult(result)

      expect(typeof output).toBe('string')
      expect(output).toContain('example.com')
    }, 30000)

    it('应该渲染简洁结果', async () => {
      const result = await manager.fetch({
        url: 'https://example.com',
        extractText: true,
        extractLinks: false,
      })

      const output = manager.renderCompactResult(result)

      expect(typeof output).toBe('string')
    }, 30000)
  })
})
