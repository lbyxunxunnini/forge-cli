/**
 * WebFetch 网页获取演示
 * 展示网页内容获取、HTML 解析、文本提取功能
 */

import {
  // WebFetch
  WebFetchManager,
  webFetchManager,
  fetchWebText,
  fetchWebTitle,

  // 渲染器
  renderDivider,
  renderList,
  renderKeyValue,
} from '../src/cli/index.js'

async function main() {
  console.log('=== WebFetch 网页获取演示 ===\n')

  // 1. 基本用法
  console.log('1. 基本用法')
  console.log(renderDivider(60))

  console.log(renderList([
    '/fetch <url>              获取网页内容',
    '/fetch <url> --text       只获取文本',
    '/fetch <url> --compact    简洁模式',
    '/fetch <url> --links      显示链接',
    '/fetch <url> --images     显示图片',
  ], true))

  // 2. 示例 URL
  console.log('\n2. 示例 URL')
  console.log(renderDivider(60))

  const exampleUrls = [
    'https://example.com',
    'https://httpbin.org/html',
    'https://jsonplaceholder.typicode.com',
  ]

  console.log(renderList(exampleUrls, true))

  // 3. 代码示例
  console.log('\n3. 代码示例')
  console.log(renderDivider(60))

  console.log(`
// 基本用法
const result = await webFetchManager.fetch({
  url: 'https://example.com',
  extractText: true,
  extractLinks: true,
})

// 快速获取文本
const text = await fetchWebText('https://example.com')

// 快速获取标题
const title = await fetchWebTitle('https://example.com')

// 渲染结果
console.log(webFetchManager.renderResult(result))
console.log(webFetchManager.renderCompactResult(result))
`)

  // 4. 实际演示
  console.log('\n4. 实际演示')
  console.log(renderDivider(60))

  // 测试 URL
  const testUrl = 'https://example.com'

  console.log(`正在获取: ${testUrl}`)
  console.log('')

  try {
    const result = await webFetchManager.fetch({
      url: testUrl,
      extractText: true,
      extractLinks: true,
      extractImages: false,
      maxLength: 1000,
    })

    console.log(webFetchManager.renderCompactResult(result))
  } catch (error: any) {
    console.log(`获取失败: ${error.message}`)
  }

  // 5. 功能说明
  console.log('\n5. 功能说明')
  console.log(renderDivider(60))

  console.log(renderKeyValue('支持协议', 'HTTP/HTTPS'))
  console.log(renderKeyValue('HTML 解析', 'cheerio'))
  console.log(renderKeyValue('文本提取', '移除脚本/样式/导航等'))
  console.log(renderKeyValue('链接提取', '绝对 URL 转换'))
  console.log(renderKeyValue('图片提取', '绝对 URL 转换'))
  console.log(renderKeyValue('元数据提取', 'meta 标签'))
  console.log(renderKeyValue('重定向支持', '自动跟随'))
  console.log(renderKeyValue('超时设置', '默认 30 秒'))

  // 6. 安装依赖
  console.log('\n6. 安装依赖')
  console.log(renderDivider(60))

  console.log(renderList([
    'npm install axios',
    'npm install cheerio',
  ], true))

  console.log('\n=== 演示完成 ===')
}

main().catch(console.error)
