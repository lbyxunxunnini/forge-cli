# WebFetch 网页获取

> 获取网页内容、解析 HTML、提取文本和链接

## 1. 概述

WebFetch 系统提供了网页内容获取能力，支持 HTML 解析、文本提取、链接提取等功能。

### 核心功能

- **网页获取**：获取网页 HTML 内容
- **文本提取**：从 HTML 中提取纯文本
- **链接提取**：提取网页中的所有链接
- **图片提取**：提取网页中的所有图片
- **元数据提取**：提取 meta 标签信息

---

## 2. 基本使用

### WebFetch 管理器

```typescript
import { WebFetchManager, webFetchManager } from './cli/web-fetch.js'

// 使用全局实例
// 或创建新实例
const manager = new WebFetchManager()
```

### 获取网页内容

```typescript
import { webFetchManager } from './cli/web-fetch.js'

// 获取网页
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  extractText: true,
  extractLinks: true,
})

// 渲染结果
console.log(webFetchManager.renderResult(result))
```

### 快速获取

```typescript
import { fetchWebText, fetchWebTitle } from './cli/web-fetch.js'

// 快速获取文本
const text = await fetchWebText('https://example.com')

// 快速获取标题
const title = await fetchWebTitle('https://example.com')
```

---

## 3. 获取选项

### 选项参数

```typescript
interface WebFetchOptions {
  url: string                    // URL（必填）
  extractText?: boolean          // 是否提取纯文本（默认 true）
  extractLinks?: boolean         // 是否提取链接（默认 true）
  extractImages?: boolean        // 是否提取图片（默认 false）
  maxLength?: number             // 最大内容长度（默认 50000）
  timeout?: number               // 超时时间（默认 30000ms）
  userAgent?: string             // 自定义 User-Agent
  followRedirects?: boolean      // 是否跟随重定向（默认 true）
}
```

### 示例

```typescript
// 基本获取
const result = await webFetchManager.fetch({
  url: 'https://example.com',
})

// 只获取文本
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  extractText: true,
  extractLinks: false,
  extractImages: false,
})

// 获取链接和图片
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  extractLinks: true,
  extractImages: true,
})

// 限制内容长度
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  maxLength: 10000,
})

// 自定义超时
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  timeout: 60000, // 60 秒
})
```

---

## 4. 获取结果

### 结果结构

```typescript
interface WebFetchResult {
  url: string                    // 原始 URL
  finalUrl: string               // 最终 URL（重定向后）
  statusCode: number             // HTTP 状态码
  contentType: string            // 内容类型
  title: string                  // 页面标题
  html: string                   // 原始 HTML
  text: string                   // 提取的文本
  links: { text: string; href: string }[]  // 提取的链接
  images: { alt: string; src: string }[]   // 提取的图片
  metadata: Record<string, string>         // 元数据
  duration: number               // 获取时间（毫秒）
  error?: string                 // 错误信息
}
```

### 访问结果

```typescript
const result = await webFetchManager.fetch({ url: 'https://example.com' })

// 基本信息
console.log(result.url)          // 原始 URL
console.log(result.finalUrl)     // 最终 URL
console.log(result.statusCode)   // 状态码
console.log(result.contentType)  // 内容类型
console.log(result.title)        // 标题

// 内容
console.log(result.html)         // 原始 HTML
console.log(result.text)         // 提取的文本

// 链接
for (const link of result.links) {
  console.log(`${link.text} -> ${link.href}`)
}

// 图片
for (const image of result.images) {
  console.log(`${image.alt} -> ${image.src}`)
}

// 元数据
console.log(result.metadata['description'])
console.log(result.metadata['keywords'])

// 性能
console.log(`获取时间: ${result.duration}ms`)
```

---

## 5. 渲染结果

### 完整渲染

```typescript
// 渲染完整结果
console.log(webFetchManager.renderResult(result))
```

输出示例：
```
Example Domain

URL: https://example.com
状态: 200
类型: text/html; charset=UTF-8
耗时: 150ms

内容:
────────────────────────────────────────────────────────
Example Domain
This domain is for use in illustrative examples in documents. You may use this
domain in literature without prior coordination or asking for permission.
More information...

链接 (1):
────────────────────────────────────────────────────────
  More information... https://www.iana.org/domains/reserved
```

### 简洁渲染

```typescript
// 渲染简洁结果
console.log(webFetchManager.renderCompactResult(result))
```

输出示例：
```
✓ Example Domain
  https://example.com
  200 | text/html; charset=UTF-8 | 150ms
  Example Domain This domain is for use in illustrative examples...
```

---

## 6. 命令行集成

### /fetch 命令

```bash
# 获取网页内容
/fetch https://example.com

# 只获取文本
/fetch https://example.com --text

# 简洁模式
/fetch https://example.com --compact

# 显示链接
/fetch https://example.com --links

# 显示图片
/fetch https://example.com --images
```

### /web 命令

```bash
# /web 是 /fetch 的别名
/web https://example.com
/web https://example.com --text
```

---

## 7. 完整示例

```typescript
import { webFetchManager, fetchWebText, fetchWebTitle } from './cli/web-fetch.js'

async function fetchAndDisplay(url: string) {
  console.log(`正在获取: ${url}`)

  // 获取网页
  const result = await webFetchManager.fetch({
    url,
    extractText: true,
    extractLinks: true,
    extractImages: false,
    maxLength: 5000,
  })

  if (result.error) {
    console.log(`获取失败: ${result.error}`)
    return
  }

  // 显示标题
  console.log(`标题: ${result.title}`)

  // 显示文本内容
  console.log(`内容:\n${result.text}`)

  // 显示链接
  if (result.links.length > 0) {
    console.log(`\n链接 (${result.links.length}):`)
    for (const link of result.links.slice(0, 10)) {
      console.log(`  ${link.text} -> ${link.href}`)
    }
  }

  // 显示性能信息
  console.log(`\n获取时间: ${result.duration}ms`)
}

// 使用
fetchAndDisplay('https://example.com').catch(console.error)
```

---

## 8. 最佳实践

### 1. 错误处理

```typescript
try {
  const result = await webFetchManager.fetch({ url: 'https://example.com' })
  if (result.error) {
    console.log(`获取失败: ${result.error}`)
    return
  }
  // 处理结果
} catch (error) {
  console.log(`请求异常: ${error.message}`)
}
```

### 2. 超时设置

```typescript
// 对于慢速网站，增加超时时间
const result = await webFetchManager.fetch({
  url: 'https://slow-website.com',
  timeout: 60000, // 60 秒
})
```

### 3. 内容限制

```typescript
// 限制内容长度，避免内存溢出
const result = await webFetchManager.fetch({
  url: 'https://large-page.com',
  maxLength: 100000,
})
```

### 4. 用户代理

```typescript
// 设置自定义 User-Agent
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  userAgent: 'MyBot/1.0',
})
```

### 5. 重定向控制

```typescript
// 禁用重定向
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  followRedirects: false,
})
```

---

## 9. 安装依赖

```bash
# 安装 axios（HTTP 客户端）
npm install axios

# 安装 cheerio（HTML 解析器）
npm install cheerio
```

---

## 10. 局限性

### 当前实现

- 不支持 JavaScript 渲染（需要 Puppeteer/Playwright）
- 不支持需要登录的页面
- 不支持反爬虫保护的网站
- 不支持动态加载的内容

### 改进方向

- 集成 Puppeteer 支持 JavaScript 渲染
- 支持 Cookie 和 Session
- 支持代理设置
- 支持并发请求

---

## 11. 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-06-09 | 初始创建，实现 WebFetch 网页获取功能 |
