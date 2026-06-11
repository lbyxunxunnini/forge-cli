/**
 * 网络工具适配器
 * 将 WebFetchManager 和 WebSearchManager 注册为工具系统
 */

import type { Tool, ToolDefinition, ToolResult } from './types.js';
import { webFetchManager } from '../cli/web-fetch.js';

// ─── fetch 工具 ─────────────────────────────────────────────────

const fetchDefinition: ToolDefinition = {
  name: 'fetch',
  description: '获取指定 URL 的网页内容。返回网页文本、链接等信息。支持设置超时时间和内容提取选项。',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: '要获取的 URL 地址',
      },
      extract_text: {
        type: 'boolean',
        description: '是否提取纯文本内容，默认 true',
      },
      extract_links: {
        type: 'boolean',
        description: '是否提取链接，默认 false',
      },
      timeout: {
        type: 'number',
        description: '超时时间（毫秒），默认 10000',
      },
    },
    required: ['url'],
  },
};

async function executeFetch(args: Record<string, any>): Promise<ToolResult> {
  const { url, extract_text = true, extract_links = false, timeout = 10000 } = args;

  if (!url) {
    return { success: false, output: '', error: 'URL 是必需的' };
  }

  try {
    const result = await webFetchManager.fetch({
      url,
      extractText: extract_text,
      extractLinks: extract_links,
      timeout,
      maxLength: 30000,
    });

    if (result.error) {
      return { success: false, output: '', error: result.error };
    }

    // 格式化输出
    let output = '';
    if (result.title) {
      output += `# ${result.title}\n\n`;
    }
    if (result.text) {
      output += result.text;
    }
    if (result.links && result.links.length > 0) {
      output += `\n\n## 链接 (${result.links.length})\n`;
      for (const link of result.links.slice(0, 20)) {
        output += `- [${link.text}](${link.href})\n`;
      }
    }

    return {
      success: true,
      output: output || '（无内容）',
    };
  } catch (error: any) {
    return { success: false, output: '', error: error.message || '获取失败' };
  }
}

export const fetchTool: Tool = {
  definition: fetchDefinition,
  execute: executeFetch,
};

// ─── websearch 工具（使用 DuckDuckGo，无需 API Key）────────────

const websearchDefinition: ToolDefinition = {
  name: 'websearch',
  description: '使用网络搜索引擎搜索信息。返回搜索结果列表，包含标题、链接和摘要。无需 API Key。',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '搜索关键词',
      },
      num_results: {
        type: 'number',
        description: '返回结果数量，默认 5，最大 10',
      },
    },
    required: ['query'],
  },
};

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&\w+;/g, '');
}

function parseDuckDuckGoResults(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];

  // DuckDuckGo HTML 结果格式
  // 查找结果链接：<a rel="nofollow" class="result__a" href="URL">TITLE</a>
  // 查找摘要：<a class="result__snippet" ...>SNIPPET</a>

  const resultRegex = /<a[^>]+class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const snippetRegex = /<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  const links: { url: string; title: string }[] = [];
  let match;

  // 提取链接和标题
  while ((match = resultRegex.exec(html)) !== null) {
    const url = match[1].trim();
    const title = decodeHTMLEntities(match[2].replace(/<[^>]+>/g, '').trim());
    if (url && title && !url.includes('duckduckgo.com')) {
      links.push({ url, title });
    }
  }

  // 提取摘要
  const snippets: string[] = [];
  while ((match = snippetRegex.exec(html)) !== null) {
    const snippet = decodeHTMLEntities(match[1].replace(/<[^>]+>/g, '').trim());
    if (snippet) {
      snippets.push(snippet);
    }
  }

  // 组合结果
  for (let i = 0; i < Math.min(links.length, maxResults); i++) {
    results.push({
      title: links[i].title,
      url: links[i].url,
      snippet: snippets[i] || '',
    });
  }

  return results;
}

async function executeWebsearch(args: Record<string, any>): Promise<ToolResult> {
  const { query, num_results = 5 } = args;

  if (!query) {
    return { success: false, output: '', error: '搜索关键词是必需的' };
  }

  try {
    // 使用 DuckDuckGo HTML 版本（无反爬）
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        output: '',
        error: `搜索失败: HTTP ${response.status}`,
      };
    }

    const html = await response.text();

    // 解析搜索结果
    const results = parseDuckDuckGoResults(html, num_results);

    if (results.length === 0) {
      return {
        success: true,
        output: '未找到相关搜索结果。',
      };
    }

    // 格式化输出
    const output = results.map((r, i) => {
      let result = `### ${i + 1}. ${r.title}\n`;
      result += `🔗 ${r.url}\n`;
      if (r.snippet) {
        result += `${r.snippet}\n`;
      }
      return result;
    }).join('\n');

    return {
      success: true,
      output: `搜索 "${query}" 的结果：\n\n${output}`,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, output: '', error: '搜索请求超时（15秒）' };
    }
    return { success: false, output: '', error: error.message || '搜索失败' };
  }
}

export const websearchTool: Tool = {
  definition: websearchDefinition,
  execute: executeWebsearch,
};
