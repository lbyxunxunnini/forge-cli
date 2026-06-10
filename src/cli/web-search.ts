/**
 * WebSearch 网络搜索系统
 * 基于百度千帆智能搜索 API
 */

import { getTheme } from './theme.js'

// 搜索选项
export interface WebSearchOptions {
  /** 搜索查询 */
  query: string
  /** 是否流式响应 */
  stream?: boolean
  /** 搜索资源类型 */
  resourceTypes?: ResourceType[]
  /** 搜索结果数量 */
  topK?: number
  /** 人设指令 */
  instruction?: string
  /** 模型采样参数 */
  temperature?: number
  /** 模型采样参数 */
  topP?: number
}

// 资源类型
export interface ResourceType {
  type: 'web' | 'video' | 'image'
  top_k: number
}

// 搜索结果
export interface WebSearchResult {
  /** 请求 ID */
  requestId: string
  /** 生成的内容 */
  content: string
  /** 参考引用 */
  references: SearchReference[]
  /** 错误信息 */
  error?: string
  /** 搜索时间（毫秒） */
  duration: number
}

// 参考引用
export interface SearchReference {
  /** 引用 ID */
  id: number
  /** URL */
  url: string
  /** 标题 */
  title: string
  /** 日期 */
  date?: string
  /** 内容摘要 */
  content: string
  /** 网站 */
  website?: string
  /** 图标 */
  icon?: string
  /** 类型 */
  type: 'web' | 'video' | 'image'
  /** 片段 */
  snippet?: string
}

/**
 * WebSearch 管理器
 */
export class WebSearchManager {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.BAIDU_QIANFAN_API_KEY || ''
    this.baseUrl = 'https://qianfan.baidubce.com/v2/ai_search/web_summary'
  }

  /**
   * 设置 API Key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  /**
   * 检查是否已配置
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }

  /**
   * 执行搜索
   */
  async search(options: WebSearchOptions): Promise<WebSearchResult> {
    const startTime = Date.now()

    if (!this.apiKey) {
      return {
        requestId: '',
        content: '',
        references: [],
        error: '未配置百度千帆 API Key，请设置环境变量 BAIDU_QIANFAN_API_KEY',
        duration: Date.now() - startTime,
      }
    }

    try {
      // 构建请求体
      const requestBody: any = {
        messages: [
          { role: 'user', content: options.query },
        ],
        stream: false,
      }

      // 设置资源类型过滤
      if (options.resourceTypes) {
        requestBody.resource_type_filter = options.resourceTypes
      } else {
        requestBody.resource_type_filter = [
          { type: 'web', top_k: options.topK || 10 },
        ]
      }

      // 设置人设指令
      if (options.instruction) {
        requestBody.instruction = options.instruction
      }

      // 设置采样参数
      if (options.temperature !== undefined) {
        requestBody.temperature = options.temperature
      }
      if (options.topP !== undefined) {
        requestBody.top_p = options.topP
      }

      // 发送请求
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appbuilder-Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          requestId: '',
          content: '',
          references: [],
          error: `API 请求失败: ${response.status} ${errorText}`,
          duration: Date.now() - startTime,
        }
      }

      const data = await response.json()

      // 解析响应
      const result: WebSearchResult = {
        requestId: data.request_id || '',
        content: '',
        references: [],
        duration: Date.now() - startTime,
      }

      // 提取内容
      if (data.choices && data.choices.length > 0) {
        const choice = data.choices[0]
        if (choice.message) {
          result.content = choice.message.content || ''
        }
      }

      // 提取参考引用
      if (data.references) {
        result.references = data.references.map((ref: any) => ({
          id: ref.id,
          url: ref.url,
          title: ref.title,
          date: ref.date,
          content: ref.content || ref.snippet || '',
          website: ref.website,
          icon: ref.icon,
          type: ref.type || 'web',
          snippet: ref.snippet,
        }))
      }

      return result
    } catch (error: any) {
      return {
        requestId: '',
        content: '',
        references: [],
        error: `搜索失败: ${error.message}`,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * 渲染搜索结果
   */
  renderResult(result: WebSearchResult): string {
    const theme = getTheme()
    const lines: string[] = []

    if (result.error) {
      lines.push(theme.error(`✗ ${result.error}`))
      return lines.join('\n')
    }

    // 内容
    if (result.content) {
      lines.push(result.content)
      lines.push('')
    }

    // 参考引用
    if (result.references.length > 0) {
      lines.push(theme.text.bold(`参考来源 (${result.references.length}):`))
      lines.push(theme.inactive('─'.repeat(60)))

      for (const ref of result.references) {
        const icon = ref.type === 'video' ? '▶' : ref.type === 'image' ? '🖼' : '🔗'
        const title = theme.claude(ref.title || '无标题')
        const url = theme.subtle(ref.url)
        const website = ref.website ? theme.subtle(` (${ref.website})`) : ''
        const date = ref.date ? theme.subtle(` [${ref.date}]`) : ''

        lines.push(`${icon} ${title}${website}${date}`)
        lines.push(`   ${url}`)

        if (ref.snippet) {
          const snippet = ref.snippet.slice(0, 150)
          lines.push(theme.subtle(`   ${snippet}...`))
        }

        lines.push('')
      }
    }

    // 性能信息
    lines.push(theme.subtle(`搜索时间: ${result.duration}ms`))

    return lines.join('\n')
  }

  /**
   * 渲染简洁结果
   */
  renderCompactResult(result: WebSearchResult): string {
    const theme = getTheme()
    const lines: string[] = []

    if (result.error) {
      lines.push(theme.error(`✗ ${result.error}`))
    } else {
      // 内容预览
      if (result.content) {
        const preview = result.content.slice(0, 300).replace(/\n/g, ' ')
        lines.push(theme.text(`${preview}...`))
      }

      // 引用数量
      if (result.references.length > 0) {
        lines.push(theme.subtle(`  ${result.references.length} 个参考来源`))
      }

      lines.push(theme.subtle(`  ${result.duration}ms`))
    }

    return lines.join('\n')
  }
}

/**
 * 创建 WebSearch 管理器
 */
export function createWebSearchManager(apiKey?: string): WebSearchManager {
  return new WebSearchManager(apiKey)
}

/**
 * 全局 WebSearch 管理器实例
 */
export const webSearchManager = createWebSearchManager()

/**
 * 快速搜索
 */
export async function webSearch(query: string): Promise<string> {
  const result = await webSearchManager.search({ query })
  return result.content
}

export default {
  WebSearchManager,
  createWebSearchManager,
  webSearchManager,
  webSearch,
}
