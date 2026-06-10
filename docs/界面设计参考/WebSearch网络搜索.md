# WebSearch 网络搜索

> 基于百度千帆智能搜索 API 的网络搜索功能

## 1. 概述

WebSearch 系统提供了网络搜索能力，基于百度千帆智能搜索 API，支持全网实时信息检索和内容总结。

### 核心功能

- **智能搜索**：根据查询进行全网实时信息检索
- **内容总结**：AI 自动总结搜索结果
- **参考引用**：返回详细的参考来源
- **多模态搜索**：支持网页、视频、图片搜索

### API 信息

| 属性 | 值 |
|------|-----|
| **提供商** | 百度千帆 |
| **免费额度** | 每日 100 次 |
| **API 端点** | `https://qianfan.baidubce.com/v2/ai_search/web_summary` |
| **鉴权方式** | API Key |

---

## 2. 配置

### 获取 API Key

1. 访问 [百度千帆控制台](https://console.bce.baidu.com/qianfan/)
2. 注册/登录账号
3. 创建应用，获取 API Key

### 设置 API Key

```bash
# 方式 1：环境变量
export BAIDU_QIANFAN_API_KEY="your-api-key"

# 方式 2：命令行设置
/search --key your-api-key
```

---

## 3. 基本使用

### WebSearch 管理器

```typescript
import { WebSearchManager, webSearchManager } from './cli/web-search.js'

// 使用全局实例
// 或创建新实例
const manager = new WebSearchManager('your-api-key')
```

### 执行搜索

```typescript
import { webSearchManager } from './cli/web-search.js'

// 搜索
const result = await webSearchManager.search({
  query: 'TypeScript AST 解析库',
})

// 渲染结果
console.log(webSearchManager.renderResult(result))
```

### 快速搜索

```typescript
import { webSearch } from './cli/web-search.js'

// 快速获取搜索内容
const content = await webSearch('Flutter 状态管理')
console.log(content)
```

---

## 4. 搜索选项

### 选项参数

```typescript
interface WebSearchOptions {
  query: string                    // 搜索查询（必填）
  stream?: boolean                 // 是否流式响应（默认 false）
  resourceTypes?: ResourceType[]   // 搜索资源类型
  topK?: number                    // 搜索结果数量（默认 10）
  instruction?: string             // 人设指令
  temperature?: number             // 模型采样参数
  topP?: number                    // 模型采样参数
}
```

### 资源类型

```typescript
interface ResourceType {
  type: 'web' | 'video' | 'image'  // 资源类型
  top_k: number                     // 结果数量
}
```

### 示例

```typescript
// 基本搜索
const result = await webSearchManager.search({
  query: 'TypeScript AST 解析库',
})

// 指定结果数量
const result = await webSearchManager.search({
  query: 'Flutter 状态管理',
  topK: 20,
})

// 搜索视频
const result = await webSearchManager.search({
  query: 'TypeScript 教程',
  resourceTypes: [
    { type: 'video', top_k: 5 },
  ],
})

// 搜索图片
const result = await webSearchManager.search({
  query: 'Flutter UI 设计',
  resourceTypes: [
    { type: 'image', top_k: 10 },
  ],
})

// 多模态搜索
const result = await webSearchManager.search({
  query: 'React 教程',
  resourceTypes: [
    { type: 'web', top_k: 10 },
    { type: 'video', top_k: 5 },
    { type: 'image', top_k: 5 },
  ],
})

// 设置人设指令
const result = await webSearchManager.search({
  query: '如何优化 React 性能',
  instruction: '你是一个前端专家，请用专业但易懂的方式回答',
})
```

---

## 5. 搜索结果

### 结果结构

```typescript
interface WebSearchResult {
  requestId: string                // 请求 ID
  content: string                  // 生成的内容
  references: SearchReference[]    // 参考引用
  error?: string                   // 错误信息
  duration: number                 // 搜索时间（毫秒）
}
```

### 参考引用

```typescript
interface SearchReference {
  id: number                       // 引用 ID
  url: string                      // URL
  title: string                    // 标题
  date?: string                    // 日期
  content: string                  // 内容摘要
  website?: string                 // 网站
  icon?: string                    // 图标
  type: 'web' | 'video' | 'image' // 类型
  snippet?: string                 // 片段
}
```

### 访问结果

```typescript
const result = await webSearchManager.search({
  query: 'TypeScript AST 解析库',
})

// 内容
console.log(result.content)

// 参考引用
for (const ref of result.references) {
  console.log(`${ref.title} - ${ref.url}`)
  console.log(ref.content)
}

// 性能信息
console.log(`搜索时间: ${result.duration}ms`)
```

---

## 6. 渲染结果

### 完整渲染

```typescript
// 渲染完整结果
console.log(webSearchManager.renderResult(result))
```

输出示例：
```
TypeScript AST 解析库有很多选择，以下是几个主流的库：

1. **TypeScript Compiler API** - 官方提供的解析器，功能最完整
2. **tree-sitter** - 增量解析器，支持多种语言
3. **@babel/parser** - Babel 的解析器，支持最新语法
...

参考来源 (5):
────────────────────────────────────────────────────────
🔗 TypeScript Compiler API (TypeScript 官方文档) [2024-01-15]
   https://www.typescriptlang.org/docs/handbook/compiler-options.html
   TypeScript 提供了完整的编译器 API，可以解析、转换和生成代码...

🔗 tree-sitter (GitHub) [2024-01-10]
   https://github.com/tree-sitter/tree-sitter
   Tree-sitter 是一个增量解析框架，可以构建语法树...

搜索时间: 1250ms
```

### 简洁渲染

```typescript
// 渲染简洁结果
console.log(webSearchManager.renderCompactResult(result))
```

输出示例：
```
TypeScript AST 解析库有很多选择，以下是几个主流的库：1. TypeScript Compiler API - 官方提供的解析器...
  5 个参考来源
  1250ms
```

---

## 7. 命令行集成

### /search 命令

```bash
# 基本搜索
/search TypeScript AST 解析库

# 简洁模式
/search Flutter 状态管理 --compact

# 设置结果数量
/search React 教程 --top=20

# 设置 API Key
/search --key your-api-key
```

### /s 命令

```bash
# /s 是 /search 的别名
/s TypeScript 教程
/s Flutter 最佳实践 --compact
```

---

## 8. 完整示例

```typescript
import { webSearchManager, webSearch } from './cli/web-search.js'

async function searchAndDisplay(query: string) {
  console.log(`正在搜索: ${query}`)

  // 执行搜索
  const result = await webSearchManager.search({
    query,
    topK: 10,
  })

  if (result.error) {
    console.log(`搜索失败: ${result.error}`)
    return
  }

  // 显示内容
  console.log(`\n内容:\n${result.content}`)

  // 显示参考引用
  if (result.references.length > 0) {
    console.log(`\n参考来源 (${result.references.length}):`)
    for (const ref of result.references) {
      console.log(`  ${ref.title} - ${ref.url}`)
    }
  }

  // 显示性能信息
  console.log(`\n搜索时间: ${result.duration}ms`)
}

// 使用
searchAndDisplay('TypeScript AST 解析库').catch(console.error)
```

---

## 9. 最佳实践

### 1. 错误处理

```typescript
try {
  const result = await webSearchManager.search({ query: '...' })
  if (result.error) {
    console.log(`搜索失败: ${result.error}`)
    return
  }
  // 处理结果
} catch (error) {
  console.log(`请求异常: ${error.message}`)
}
```

### 2. 配置检查

```typescript
if (!webSearchManager.isConfigured()) {
  console.log('请先配置 API Key')
  console.log('export BAIDU_QIANFAN_API_KEY="your-api-key"')
  return
}
```

### 3. 结果限制

```typescript
// 限制结果数量，节省配额
const result = await webSearchManager.search({
  query: '...',
  topK: 5,
})
```

### 4. 人设指令

```typescript
// 使用人设指令优化结果
const result = await webSearchManager.search({
  query: '如何优化 React 性能',
  instruction: '请用简洁的方式回答，重点关注实际可操作的建议',
})
```

---

## 10. API 限制

| 限制项 | 值 |
|--------|-----|
| 每日免费额度 | 100 次 |
| 网页 top_k 最大值 | 50 |
| 视频 top_k 最大值 | 10 |
| 图片 top_k 最大值 | 30 |
| 请求超时 | 30 秒 |

---

## 11. 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-06-09 | 初始创建，实现 WebSearch 网络搜索功能 |
