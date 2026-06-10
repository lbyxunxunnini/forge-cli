/**
 * AST 解析系统 - 提升 Agent 代码理解能力
 * 支持 TypeScript/Dart 代码结构解析
 */

import chalk from 'chalk'
import { getTheme } from './theme.js'

// AST 节点类型
export type ASTNodeType =
  | 'program'
  | 'function'
  | 'class'
  | 'method'
  | 'property'
  | 'variable'
  | 'import'
  | 'export'
  | 'interface'
  | 'type'
  | 'enum'
  | 'decorator'
  | 'comment'

// AST 节点
export interface ASTNode {
  type: ASTNodeType
  name: string
  filePath: string
  startLine: number
  endLine: number
  startColumn: number
  endColumn: number
  children?: ASTNode[]
  metadata?: ASTMetadata
}

// AST 元数据
export interface ASTMetadata {
  // 函数相关
  parameters?: string[]
  returnType?: string
  isAsync?: boolean
  isGenerator?: boolean

  // 类相关
  superClass?: string
  implements?: string[]
  isAbstract?: boolean

  // 变量相关
  dataType?: string
  isConstant?: boolean
  isExported?: boolean

  // 导入相关
  importPath?: string
  importNames?: string[]
  isDefault?: boolean

  // 通用
  modifiers?: string[]
  documentation?: string
  decorators?: string[]
}

// 符号信息
export interface SymbolInfo {
  name: string
  type: ASTNodeType
  filePath: string
  line: number
  column: number
  documentation?: string
  dataType?: string
  isExported?: boolean
}

// 符号搜索结果
export interface SymbolSearchResult {
  symbol: SymbolInfo
  score: number
  matches: { line: number; column: number }[]
}

/**
 * TypeScript AST 解析器
 */
export class TypeScriptParser {
  /**
   * 解析 TypeScript 代码
   */
  parse(content: string, filePath: string): ASTNode {
    const lines = content.split('\n')
    const children: ASTNode[] = []

    // 简化的 AST 解析（基于正则表达式）
    // 实际项目中应使用 typescript 编译器 API

    // 解析导入
    children.push(...this.parseImports(lines, filePath))

    // 解析导出
    children.push(...this.parseExports(lines, filePath))

    // 解析函数
    children.push(...this.parseFunctions(lines, filePath))

    // 解析类
    children.push(...this.parseClasses(lines, filePath))

    // 解析接口
    children.push(...this.parseInterfaces(lines, filePath))

    // 解析类型
    children.push(...this.parseTypes(lines, filePath))

    // 解析枚举
    children.push(...this.parseEnums(lines, filePath))

    // 解析变量
    children.push(...this.parseVariables(lines, filePath))

    return {
      type: 'program',
      name: filePath,
      filePath,
      startLine: 1,
      endLine: lines.length,
      startColumn: 0,
      endColumn: 0,
      children,
    }
  }

  /**
   * 解析导入语句
   */
  private parseImports(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const importRegex = /^import\s+(?:(?:\{([^}]+)\}|(\w+)|\*\s+as\s+(\w+))\s+from\s+)?['"]([^'"]+)['"]/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(importRegex)

      if (match) {
        const namedImports = match[1]?.split(',').map(s => s.trim()) || []
        const defaultImport = match[2]
        const namespaceImport = match[3]
        const importPath = match[4]

        const importNames = [...namedImports]
        if (defaultImport) importNames.unshift(defaultImport)
        if (namespaceImport) importNames.push(`* as ${namespaceImport}`)

        nodes.push({
          type: 'import',
          name: importPath,
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            importPath,
            importNames,
            isDefault: !!defaultImport,
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析导出语句
   */
  private parseExports(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const exportRegex = /^export\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+(\w+)/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(exportRegex)

      if (match) {
        nodes.push({
          type: 'export',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: true,
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析函数
   */
  private parseFunctions(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const functionRegex = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)(?:\s*:\s*(\w+))?/
    const arrowFunctionRegex = /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)(?:\s*:\s*(\w+))?\s*=>/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // 普通函数
      let match = line.match(functionRegex)
      if (match) {
        const isAsync = line.includes('async')
        const parameters = match[2].split(',').map(p => p.trim()).filter(Boolean)

        nodes.push({
          type: 'function',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            parameters,
            returnType: match[3],
            isAsync,
            isExported: line.startsWith('export'),
          },
        })
        continue
      }

      // 箭头函数
      match = line.match(arrowFunctionRegex)
      if (match) {
        const isAsync = line.includes('async')
        const parameters = match[2].split(',').map(p => p.trim()).filter(Boolean)

        nodes.push({
          type: 'function',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            parameters,
            returnType: match[3],
            isAsync,
            isExported: line.startsWith('export'),
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析类
   */
  private parseClasses(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const classRegex = /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(classRegex)

      if (match) {
        const isAbstract = line.includes('abstract')
        const implementsList = match[3]?.split(',').map(s => s.trim()).filter(Boolean) || []

        nodes.push({
          type: 'class',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            superClass: match[2],
            implements: implementsList,
            isAbstract,
            isExported: line.startsWith('export'),
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析接口
   */
  private parseInterfaces(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const interfaceRegex = /^(?:export\s+)?interface\s+(\w+)(?:\s+extends\s+([^{]+))?/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(interfaceRegex)

      if (match) {
        nodes.push({
          type: 'interface',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: line.startsWith('export'),
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析类型
   */
  private parseTypes(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const typeRegex = /^(?:export\s+)?type\s+(\w+)\s*=/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(typeRegex)

      if (match) {
        nodes.push({
          type: 'type',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: line.startsWith('export'),
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析枚举
   */
  private parseEnums(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const enumRegex = /^(?:export\s+)?enum\s+(\w+)/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(enumRegex)

      if (match) {
        nodes.push({
          type: 'enum',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isExported: line.startsWith('export'),
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析变量
   */
  private parseVariables(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const variableRegex = /^(?:export\s+)?(?:const|let|var)\s+(\w+)(?:\s*:\s*(\w+))?/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(variableRegex)

      if (match) {
        const isConstant = line.includes('const')

        nodes.push({
          type: 'variable',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            dataType: match[2],
            isConstant,
            isExported: line.startsWith('export'),
          },
        })
      }
    }

    return nodes
  }

  /**
   * 查找代码块结束位置
   */
  private findBlockEnd(lines: string[], startLine: number): number {
    let braceCount = 0
    let foundOpen = false

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i]

      for (const char of line) {
        if (char === '{') {
          braceCount++
          foundOpen = true
        } else if (char === '}') {
          braceCount--
        }
      }

      if (foundOpen && braceCount === 0) {
        return i + 1
      }
    }

    return startLine + 1
  }
}

/**
 * Dart AST 解析器
 */
export class DartParser {
  /**
   * 解析 Dart 代码
   */
  parse(content: string, filePath: string): ASTNode {
    const lines = content.split('\n')
    const children: ASTNode[] = []

    // 解析导入
    children.push(...this.parseImports(lines, filePath))

    // 解析类
    children.push(...this.parseClasses(lines, filePath))

    // 解析函数
    children.push(...this.parseFunctions(lines, filePath))

    // 解析变量
    children.push(...this.parseVariables(lines, filePath))

    return {
      type: 'program',
      name: filePath,
      filePath,
      startLine: 1,
      endLine: lines.length,
      startColumn: 0,
      endColumn: 0,
      children,
    }
  }

  /**
   * 解析导入
   */
  private parseImports(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const importRegex = /^import\s+['"]([^'"]+)['"](?:\s+as\s+(\w+))?/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(importRegex)

      if (match) {
        nodes.push({
          type: 'import',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            importPath: match[1],
            importNames: match[2] ? [match[2]] : [],
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析类
   */
  private parseClasses(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const classRegex = /^(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([^{]+))?(?:\s+with\s+([^{]+))?/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(classRegex)

      if (match) {
        const isAbstract = line.includes('abstract')

        nodes.push({
          type: 'class',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            superClass: match[2],
            implements: match[3]?.split(',').map(s => s.trim()).filter(Boolean),
            isAbstract,
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析函数
   */
  private parseFunctions(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const functionRegex = /^(?:(?:static|abstract|external)\s+)?(?:async\s+)?(?:Future<[^>]+>|void|int|String|bool|double|List|Map|Set|dynamic)?\s+(\w+)\s*\(([^)]*)\)/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(functionRegex)

      if (match && !line.includes('class ') && !line.includes('if ') && !line.includes('for ')) {
        const isAsync = line.includes('async')
        const parameters = match[2].split(',').map(p => p.trim()).filter(Boolean)

        nodes.push({
          type: 'function',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: this.findBlockEnd(lines, i),
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            parameters,
            isAsync,
          },
        })
      }
    }

    return nodes
  }

  /**
   * 解析变量
   */
  private parseVariables(lines: string[], filePath: string): ASTNode[] {
    const nodes: ASTNode[] = []
    const variableRegex = /^(?:final|const|var|late\s+)?(?:\w+\s+)?(\w+)\s*(?:=\s*[^;]+)?;/

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const match = line.match(variableRegex)

      if (match && !line.includes('class ') && !line.includes('void ') && !line.includes('Future')) {
        const isConstant = line.includes('const') || line.includes('final')

        nodes.push({
          type: 'variable',
          name: match[1],
          filePath,
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: line.length,
          metadata: {
            isConstant,
          },
        })
      }
    }

    return nodes
  }

  /**
   * 查找代码块结束位置
   */
  private findBlockEnd(lines: string[], startLine: number): number {
    let braceCount = 0
    let foundOpen = false

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i]

      for (const char of line) {
        if (char === '{') {
          braceCount++
          foundOpen = true
        } else if (char === '}') {
          braceCount--
        }
      }

      if (foundOpen && braceCount === 0) {
        return i + 1
      }
    }

    return startLine + 1
  }
}

/**
 * 符号搜索器
 */
export class SymbolSearcher {
  private symbols: SymbolInfo[] = []

  /**
   * 从 AST 节点提取符号
   */
  extractSymbols(node: ASTNode): SymbolInfo[] {
    const symbols: SymbolInfo[] = []

    const traverse = (node: ASTNode) => {
      // 提取当前节点
      if (node.type !== 'program') {
        symbols.push({
          name: node.name,
          type: node.type,
          filePath: node.filePath,
          line: node.startLine,
          column: node.startColumn,
          documentation: node.metadata?.documentation,
          dataType: node.metadata?.returnType || node.metadata?.dataType,
          isExported: node.metadata?.isExported,
        })
      }

      // 递归遍历子节点
      if (node.children) {
        for (const child of node.children) {
          traverse(child)
        }
      }
    }

    traverse(node)
    return symbols
  }

  /**
   * 添加符号到索引
   */
  addSymbols(symbols: SymbolInfo[]): void {
    this.symbols.push(...symbols)
  }

  /**
   * 搜索符号
   */
  search(query: string, options: {
    limit?: number
    type?: ASTNodeType
    filePath?: string
    exact?: boolean
  } = {}): SymbolSearchResult[] {
    const { limit = 10, type, filePath, exact = false } = options
    const lowerQuery = query.toLowerCase()

    let results: SymbolSearchResult[] = []

    for (const symbol of this.symbols) {
      // 过滤类型
      if (type && symbol.type !== type) continue

      // 过滤文件
      if (filePath && !symbol.filePath.includes(filePath)) continue

      // 计算匹配分数
      let score = 0
      const lowerName = symbol.name.toLowerCase()

      if (exact) {
        if (lowerName !== lowerQuery) continue
        score = 100
      } else {
        // 精确匹配
        if (lowerName === lowerQuery) {
          score = 100
        }
        // 前缀匹配
        else if (lowerName.startsWith(lowerQuery)) {
          score = 80
        }
        // 包含匹配
        else if (lowerName.includes(lowerQuery)) {
          score = 60
        }
        // 模糊匹配
        else if (this.fuzzyMatch(lowerName, lowerQuery)) {
          score = 40
        } else {
          continue
        }
      }

      // 导出的符号加分
      if (symbol.isExported) {
        score += 10
      }

      results.push({
        symbol,
        score,
        matches: [{
          line: symbol.line,
          column: symbol.column,
        }],
      })
    }

    // 排序并限制结果数量
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, limit)
  }

  /**
   * 模糊匹配
   */
  private fuzzyMatch(text: string, query: string): boolean {
    let queryIndex = 0

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++
      }
    }

    return queryIndex === query.length
  }

  /**
   * 清空符号索引
   */
  clear(): void {
    this.symbols = []
  }

  /**
   * 获取符号数量
   */
  count(): number {
    return this.symbols.length
  }
}

/**
 * AST 管理器
 */
export class ASTManager {
  private tsParser: TypeScriptParser
  private dartParser: DartParser
  private searcher: SymbolSearcher
  private astCache: Map<string, ASTNode> = new Map()
  private treeSitterManager: any = null
  private useTreeSitter = false

  constructor() {
    this.tsParser = new TypeScriptParser()
    this.dartParser = new DartParser()
    this.searcher = new SymbolSearcher()
  }

  /**
   * 初始化 tree-sitter 解析器
   */
  async initializeTreeSitter(): Promise<boolean> {
    try {
      const { treeSitterParserManager } = require('./tree-sitter-parser.js')
      this.treeSitterManager = treeSitterParserManager
      await this.treeSitterManager.initialize()
      this.useTreeSitter = true
      return true
    } catch (error) {
      console.warn('tree-sitter 初始化失败，使用正则解析器:', error)
      this.useTreeSitter = false
      return false
    }
  }

  /**
   * 解析文件
   */
  parseFile(content: string, filePath: string): ASTNode {
    // 检查缓存
    const cacheKey = `${filePath}:${content.length}`
    if (this.astCache.has(cacheKey)) {
      return this.astCache.get(cacheKey)!
    }

    // 根据文件类型选择解析器
    const ext = filePath.split('.').pop()?.toLowerCase()
    let ast: ASTNode

    // 优先使用 tree-sitter
    if (this.useTreeSitter && this.treeSitterManager) {
      const language = this.treeSitterManager.getLanguageByExtension(ext || '')
      if (language) {
        try {
          const tree = this.treeSitterManager.parseCode(content, language)
          if (tree) {
            const nodes = this.treeSitterManager.extractASTNodes(tree, language, filePath)
            ast = {
              type: 'program',
              name: filePath,
              filePath,
              startLine: 1,
              endLine: content.split('\n').length,
              startColumn: 0,
              endColumn: 0,
              children: nodes,
            }
          } else {
            // 回退到正则解析器
            ast = this.parseWithRegex(content, filePath, ext)
          }
        } catch (error) {
          // 回退到正则解析器
          ast = this.parseWithRegex(content, filePath, ext)
        }
      } else {
        // 不支持的语言，使用正则解析器
        ast = this.parseWithRegex(content, filePath, ext)
      }
    } else {
      // 使用正则解析器
      ast = this.parseWithRegex(content, filePath, ext)
    }

    // 缓存 AST
    this.astCache.set(cacheKey, ast)

    // 提取符号并添加到索引
    const symbols = this.searcher.extractSymbols(ast)
    this.searcher.addSymbols(symbols)

    return ast
  }

  /**
   * 使用正则解析器
   */
  private parseWithRegex(content: string, filePath: string, ext?: string): ASTNode {
    if (ext === 'dart') {
      return this.dartParser.parse(content, filePath)
    } else {
      return this.tsParser.parse(content, filePath)
    }
  }

  /**
   * 搜索符号
   */
  searchSymbol(query: string, options?: {
    limit?: number
    type?: ASTNodeType
    filePath?: string
    exact?: boolean
  }): SymbolSearchResult[] {
    return this.searcher.search(query, options)
  }

  /**
   * 获取文件结构
   */
  getFileStructure(filePath: string, content: string): string {
    const ast = this.parseFile(content, filePath)
    return this.renderAST(ast)
  }

  /**
   * 渲染 AST
   */
  private renderAST(node: ASTNode, indent: number = 0): string {
    const theme = getTheme()
    const lines: string[] = []
    const prefix = '  '.repeat(indent)

    // 渲染当前节点
    if (node.type !== 'program') {
      const icon = this.getNodeIcon(node.type)
      const name = theme.claude(node.name)
      const location = theme.subtle(`:${node.startLine}`)
      const typeInfo = node.metadata?.returnType || node.metadata?.dataType || ''

      let line = `${prefix}${icon} ${name}`
      if (typeInfo) {
        line += theme.subtle(`: ${typeInfo}`)
      }
      line += location

      lines.push(line)
    }

    // 渲染子节点
    if (node.children) {
      for (const child of node.children) {
        lines.push(this.renderAST(child, indent + 1))
      }
    }

    return lines.join('\n')
  }

  /**
   * 获取节点图标
   */
  private getNodeIcon(type: ASTNodeType): string {
    switch (type) {
      case 'function': return 'ƒ'
      case 'class': return 'Ⓒ'
      case 'method': return 'ⓜ'
      case 'property': return 'ⓟ'
      case 'variable': return 'ⓥ'
      case 'import': return 'ⓘ'
      case 'export': return 'ⓔ'
      case 'interface': return 'Ⓘ'
      case 'type': return 'ⓣ'
      case 'enum': return 'Ⓔ'
      case 'decorator': return 'ⓓ'
      case 'comment': return 'ⓒ'
      default: return '•'
    }
  }

  /**
   * 渲染搜索结果
   */
  renderSearchResults(results: SymbolSearchResult[]): string {
    const theme = getTheme()
    const lines: string[] = []

    if (results.length === 0) {
      lines.push(theme.subtle('未找到匹配的符号'))
      return lines.join('\n')
    }

    lines.push(theme.text.bold(`找到 ${results.length} 个符号:`))
    lines.push(theme.inactive('─'.repeat(60)))

    for (const result of results) {
      const { symbol, score } = result
      const icon = this.getNodeIcon(symbol.type)
      const name = theme.claude(symbol.name)
      const type = theme.subtle(`(${symbol.type})`)
      const file = theme.subtle(symbol.filePath)
      const line = theme.subtle(`:${symbol.line}`)

      lines.push(`${icon} ${name} ${type} ${file}${line}`)

      if (symbol.dataType) {
        lines.push(`  ${theme.subtle('类型:')} ${symbol.dataType}`)
      }

      if (symbol.documentation) {
        lines.push(`  ${theme.subtle('文档:')} ${symbol.documentation}`)
      }
    }

    return lines.join('\n')
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.astCache.clear()
    this.searcher.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): { files: number; symbols: number } {
    return {
      files: this.astCache.size,
      symbols: this.searcher.count(),
    }
  }
}

/**
 * 创建 AST 管理器
 */
export function createASTManager(): ASTManager {
  return new ASTManager()
}

/**
 * 全局 AST 管理器实例
 */
export const astManager = createASTManager()

export default {
  TypeScriptParser,
  DartParser,
  SymbolSearcher,
  ASTManager,
  createASTManager,
  astManager,
}
