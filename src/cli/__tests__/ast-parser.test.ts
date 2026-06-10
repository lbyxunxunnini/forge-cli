/**
 * AST 解析测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  TypeScriptParser,
  DartParser,
  SymbolSearcher,
  ASTManager,
  createASTManager,
} from '../ast-parser.js'

describe('AST 解析', () => {
  describe('TypeScriptParser', () => {
    let parser: TypeScriptParser

    beforeEach(() => {
      parser = new TypeScriptParser()
    })

    it('应该解析函数', () => {
      const code = `function hello(name: string): void {
  console.log(name)
}`

      const ast = parser.parse(code, 'test.ts')

      expect(ast).toBeDefined()
      expect(ast.type).toBe('program')
      expect(ast.children).toBeDefined()

      const functions = ast.children?.filter(n => n.type === 'function')
      expect(functions?.length).toBeGreaterThan(0)
      expect(functions?.[0].name).toBe('hello')
    })

    it('应该解析类', () => {
      const code = `class User {
  name: string
  constructor(name: string) {
    this.name = name
  }
}`

      const ast = parser.parse(code, 'test.ts')

      const classes = ast.children?.filter(n => n.type === 'class')
      expect(classes?.length).toBeGreaterThan(0)
      expect(classes?.[0].name).toBe('User')
    })

    it('应该解析导入', () => {
      const code = `import chalk from 'chalk'
import { getTheme } from './theme.js'`

      const ast = parser.parse(code, 'test.ts')

      const imports = ast.children?.filter(n => n.type === 'import')
      expect(imports?.length).toBe(2)
    })

    it('应该解析变量', () => {
      const code = `const MAX = 100
let count = 0`

      const ast = parser.parse(code, 'test.ts')

      const variables = ast.children?.filter(n => n.type === 'variable')
      expect(variables?.length).toBe(2)
    })
  })

  describe('DartParser', () => {
    let parser: DartParser

    beforeEach(() => {
      parser = new DartParser()
    })

    it('应该解析类', () => {
      const code = `class User {
  final String name
  User({required this.name})
}`

      const ast = parser.parse(code, 'test.dart')

      const classes = ast.children?.filter(n => n.type === 'class')
      expect(classes?.length).toBeGreaterThan(0)
      expect(classes?.[0].name).toBe('User')
    })

    it('应该解析函数', () => {
      const code = `void hello(String name) {
  print(name)
}`

      const ast = parser.parse(code, 'test.dart')

      const functions = ast.children?.filter(n => n.type === 'function')
      expect(functions?.length).toBeGreaterThan(0)
    })
  })

  describe('SymbolSearcher', () => {
    let searcher: SymbolSearcher

    beforeEach(() => {
      searcher = new SymbolSearcher()
    })

    it('应该提取符号', () => {
      const parser = new TypeScriptParser()
      const code = `function hello() {}
class User {}
const MAX = 100`
      const ast = parser.parse(code, 'test.ts')
      const symbols = searcher.extractSymbols(ast)

      expect(symbols.length).toBe(3)
      expect(symbols.some(s => s.name === 'hello')).toBe(true)
      expect(symbols.some(s => s.name === 'User')).toBe(true)
      expect(symbols.some(s => s.name === 'MAX')).toBe(true)
    })

    it('应该搜索符号', () => {
      const parser = new TypeScriptParser()
      const code = `function hello() {}
function world() {}
class User {}`
      const ast = parser.parse(code, 'test.ts')
      const symbols = searcher.extractSymbols(ast)
      searcher.addSymbols(symbols)

      const results = searcher.search('hello')
      expect(results.length).toBe(1)
      expect(results[0].symbol.name).toBe('hello')
    })

    it('应该支持模糊搜索', () => {
      const parser = new TypeScriptParser()
      const code = `function hello() {}
function world() {}
function help() {}`
      const ast = parser.parse(code, 'test.ts')
      const symbols = searcher.extractSymbols(ast)
      searcher.addSymbols(symbols)

      const results = searcher.search('hel')
      expect(results.length).toBe(2)  // hello, help
    })
  })

  describe('ASTManager', () => {
    let manager: ASTManager

    beforeEach(() => {
      manager = createASTManager()
    })

    it('应该解析文件', () => {
      const code = `function hello() {}
class User {}`
      const ast = manager.parseFile(code, 'test.ts')

      expect(ast).toBeDefined()
      expect(ast.type).toBe('program')
    })

    it('应该获取文件结构', () => {
      const code = `function hello() {}
class User {}`
      const structure = manager.getFileStructure('test.ts', code)

      expect(typeof structure).toBe('string')
      expect(structure).toContain('hello')
      expect(structure).toContain('User')
    })

    it('应该搜索符号', () => {
      const code = `function hello() {}
class User {}`
      manager.parseFile(code, 'test.ts')

      const results = manager.searchSymbol('hello')
      expect(results.length).toBeGreaterThan(0)
      expect(results[0].symbol.name).toBe('hello')
    })

    it('应该获取统计信息', () => {
      const code = `function hello() {}`
      manager.parseFile(code, 'test.ts')

      const stats = manager.getStats()
      expect(stats.files).toBe(1)
      expect(stats.symbols).toBeGreaterThan(0)
    })
  })
})
