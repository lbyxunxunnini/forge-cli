/**
 * WebFetch 网页获取系统
 * 支持获取网页内容、提取文本、解析 HTML
 */

import { getTheme } from './theme.js'

// 获取选项
export interface WebFetchOptions {
  /** URL */
  url: string
  /** 是否提取纯文本 */
  extractText?: boolean
  /** 是否提取链接 */
  extractLinks?: boolean
  /** 是否提取图片 */
  extractImages?: boolean
  /** 最大内容长度 */
  maxLength?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 自定义 User-Agent */
  userAgent?: string
  /** 是否跟随重定向 */
  followRedirects?: boolean
}

// 获取结果
export interface WebFetchResult {
  /** URL */
  url: string
  /** 最终 URL（重定向后） */
  finalUrl: string
  /** 状态码 */
  statusCode: number
  /** 内容类型 */
  contentType: string
  /** 标题 */
  title: string
  /** 原始 HTML */
  html: string
  /** 提取的文本 */
  text: string
  /** 提取的链接 */
  links: { text: string; href: string }[]
  /** 提取的图片 */
  images: { alt: string; src: string }[]
  /** 元数据 */
  metadata: Record<string, string>
  /** 获取时间（毫秒） */
  duration: number
  /** 错误信息 */
  error?: string
}

/**
 * WebFetch 管理器
 */
export class WebFetchManager {
  private defaultOptions: Partial<WebFetchOptions> = {
    extractText: true,
    extractLinks: true,
    extractImages: false,
    maxLength: 50000,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (compatible; ForgeCLI/1.0)',
    followRedirects: true,
  }

  /**
   * 获取网页内容
   */
  async fetch(options: WebFetchOptions): Promise<WebFetchResult> {
    const startTime = Date.now()
    const mergedOptions = { ...this.defaultOptions, ...options }

    try {
      // 动态导入 axios 和 cheerio
      const axios = require('axios')
      const cheerio = require('cheerio')

      // 发送请求
      const response = await axios.get(mergedOptions.url, {
        timeout: mergedOptions.timeout,
        maxRedirects: mergedOptions.followRedirects ? 5 : 0,
        headers: {
          'User-Agent': mergedOptions.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      })

      const html = response.data
      const $ = cheerio.load(html)

      // 提取标题
      const title = $('title').text().trim() || ''

      // 提取文本
      let text = ''
      if (mergedOptions.extractText) {
        // 移除脚本和样式
        $('script, style, nav, footer, header, aside').remove()
        text = $('body').text()
          .replace(/\s+/g, ' ')
          .replace(/\n+/g, '\n')
          .trim()

        // 限制长度
        if (mergedOptions.maxLength && text.length > mergedOptions.maxLength) {
          text = text.slice(0, mergedOptions.maxLength) + '...'
        }
      }

      // 提取链接
      const links: { text: string; href: string }[] = []
      if (mergedOptions.extractLinks) {
        $('a[href]').each((_, element) => {
          const href = $(element).attr('href')
          const text = $(element).text().trim()
          if (href && text) {
            // 处理相对 URL
            let absoluteHref = href
            if (href.startsWith('/')) {
              const urlObj = new URL(mergedOptions.url)
              absoluteHref = `${urlObj.origin}${href}`
            } else if (!href.startsWith('http')) {
              try {
                absoluteHref = new URL(href, mergedOptions.url).toString()
              } catch {
                // 忽略无效 URL
              }
            }
            links.push({ text, href: absoluteHref })
          }
        })
      }

      // 提取图片
      const images: { alt: string; src: string }[] = []
      if (mergedOptions.extractImages) {
        $('img[src]').each((_, element) => {
          const src = $(element).attr('src')
          const alt = $(element).attr('alt') || ''
          if (src) {
            // 处理相对 URL
            let absoluteSrc = src
            if (src.startsWith('/')) {
              const urlObj = new URL(mergedOptions.url)
              absoluteSrc = `${urlObj.origin}${src}`
            } else if (!src.startsWith('http')) {
              try {
                absoluteSrc = new URL(src, mergedOptions.url).toString()
              } catch {
                // 忽略无效 URL
              }
            }
            images.push({ alt, src: absoluteSrc })
          }
        })
      }

      // 提取元数据
      const metadata: Record<string, string> = {}
      $('meta').each((_, element) => {
        const name = $(element).attr('name') || $(element).attr('property')
        const content = $(element).attr('content')
        if (name && content) {
          metadata[name] = content
        }
      })

      return {
        url: mergedOptions.url,
        finalUrl: response.request?.responseURL || mergedOptions.url,
        statusCode: response.status,
        contentType: response.headers['content-type'] || '',
        title,
        html,
        text,
        links,
        images,
        metadata,
        duration: Date.now() - startTime,
      }
    } catch (error: any) {
      return {
        url: mergedOptions.url,
        finalUrl: mergedOptions.url,
        statusCode: 0,
        contentType: '',
        title: '',
        html: '',
        text: '',
        links: [],
        images: [],
        metadata: {},
        duration: Date.now() - startTime,
        error: error.message,
      }
    }
  }

  /**
   * 快速获取网页文本
   */
  async fetchText(url: string): Promise<string> {
    const result = await this.fetch({ url, extractText: true, extractLinks: false })
    return result.text
  }

  /**
   * 获取网页标题
   */
  async fetchTitle(url: string): Promise<string> {
    const result = await this.fetch({ url, extractText: false, extractLinks: false })
    return result.title
  }

  /**
   * 渲染获取结果
   */
  renderResult(result: WebFetchResult): string {
    const theme = getTheme()
    const lines: string[] = []

    // 标题
    if (result.title) {
      lines.push(theme.text.bold(result.title))
      lines.push('')
    }

    // URL 信息
    lines.push(theme.subtle('URL: ') + theme.text(result.url))
    if (result.finalUrl !== result.url) {
      lines.push(theme.subtle('重定向: ') + theme.text(result.finalUrl))
    }
    lines.push(theme.subtle('状态: ') + theme.success(`${result.statusCode}`))
    lines.push(theme.subtle('类型: ') + theme.text(result.contentType))
    lines.push(theme.subtle('耗时: ') + theme.text(`${result.duration}ms`))
    lines.push('')

    // 文本内容
    if (result.text) {
      lines.push(theme.text.bold('内容:'))
      lines.push(theme.inactive('─'.repeat(60)))
      lines.push(result.text)
      lines.push('')
    }

    // 链接
    if (result.links.length > 0) {
      lines.push(theme.text.bold(`链接 (${result.links.length}):`))
      lines.push(theme.inactive('─'.repeat(60)))
      for (const link of result.links.slice(0, 20)) {
        lines.push(`  ${theme.claude(link.text)} ${theme.subtle(link.href)}`)
      }
      if (result.links.length > 20) {
        lines.push(theme.subtle(`  ... 还有 ${result.links.length - 20} 个链接`))
      }
      lines.push('')
    }

    // 图片
    if (result.images.length > 0) {
      lines.push(theme.text.bold(`图片 (${result.images.length}):`))
      lines.push(theme.inactive('─'.repeat(60)))
      for (const image of result.images.slice(0, 10)) {
        lines.push(`  ${theme.claude(image.alt || '无描述')} ${theme.subtle(image.src)}`)
      }
      if (result.images.length > 10) {
        lines.push(theme.subtle(`  ... 还有 ${result.images.length - 10} 张图片`))
      }
      lines.push('')
    }

    // 元数据
    const metadataKeys = Object.keys(result.metadata)
    if (metadataKeys.length > 0) {
      lines.push(theme.text.bold('元数据:'))
      lines.push(theme.inactive('─'.repeat(60)))
      for (const key of metadataKeys.slice(0, 10)) {
        lines.push(`  ${theme.subtle(key)}: ${result.metadata[key]}`)
      }
      lines.push('')
    }

    // 错误
    if (result.error) {
      lines.push(theme.error('错误: ') + result.error)
    }

    return lines.join('\n')
  }

  /**
   * 渲染简洁结果
   */
  renderCompactResult(result: WebFetchResult): string {
    const theme = getTheme()
    const lines: string[] = []

    if (result.error) {
      lines.push(theme.error(`✗ ${result.error}`))
    } else {
      lines.push(theme.success(`✓ ${result.title || '无标题'}`))
      lines.push(theme.subtle(`  ${result.url}`))
      lines.push(theme.subtle(`  ${result.statusCode} | ${result.contentType} | ${result.duration}ms`))

      if (result.text) {
        const preview = result.text.slice(0, 200).replace(/\n/g, ' ')
        lines.push(theme.text(`  ${preview}...`))
      }
    }

    return lines.join('\n')
  }
}

/**
 * 创建 WebFetch 管理器
 */
export function createWebFetchManager(): WebFetchManager {
  return new WebFetchManager()
}

/**
 * 全局 WebFetch 管理器实例
 */
export const webFetchManager = createWebFetchManager()

/**
 * 快速获取网页文本
 */
export async function fetchWebText(url: string): Promise<string> {
  return webFetchManager.fetchText(url)
}

/**
 * 快速获取网页标题
 */
export async function fetchWebTitle(url: string): Promise<string> {
  return webFetchManager.fetchTitle(url)
}

export default {
  WebFetchManager,
  createWebFetchManager,
  webFetchManager,
  fetchWebText,
  fetchWebTitle,
}
