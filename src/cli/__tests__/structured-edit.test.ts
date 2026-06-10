/**
 * 结构化编辑测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  DiffGenerator,
  LintChecker,
  TestRunner,
  createDiffGenerator,
  createLintChecker,
  createTestRunner,
} from '../structured-edit.js'

describe('结构化编辑', () => {
  describe('DiffGenerator', () => {
    let generator: DiffGenerator

    beforeEach(() => {
      generator = createDiffGenerator()
    })

    it('应该生成 Diff', () => {
      const oldContent = 'line1\nline2\nline3'
      const newContent = 'line1\nline2 modified\nline3\nline4'

      const diff = generator.generateDiff(oldContent, newContent, 'test.txt')

      expect(diff).toBeDefined()
      expect(diff.filePath).toBe('test.txt')
      expect(diff.hunks.length).toBeGreaterThan(0)
    })

    it('应该检测新增', () => {
      const oldContent = 'line1'
      const newContent = 'line1\nline2'

      const diff = generator.generateDiff(oldContent, newContent, 'test.txt')
      const stats = generator.getStats(diff)

      expect(stats.additions).toBe(1)
      expect(stats.deletions).toBe(0)
    })

    it('应该检测删除', () => {
      const oldContent = 'line1\nline2'
      const newContent = 'line1'

      const diff = generator.generateDiff(oldContent, newContent, 'test.txt')
      const stats = generator.getStats(diff)

      expect(stats.additions).toBe(0)
      expect(stats.deletions).toBe(1)
    })

    it('应该检测修改', () => {
      const oldContent = 'line1\nline2'
      const newContent = 'line1\nline2 modified'

      const diff = generator.generateDiff(oldContent, newContent, 'test.txt')
      const stats = generator.getStats(diff)

      expect(stats.changes).toBe(2)  // 1 删除 + 1 新增
    })

    it('应该渲染 Diff', () => {
      const oldContent = 'line1\nline2'
      const newContent = 'line1\nline2 modified'

      const diff = generator.generateDiff(oldContent, newContent, 'test.txt')
      const output = generator.renderDiff(diff)

      expect(typeof output).toBe('string')
      expect(output).toContain('test.txt')
    })
  })

  describe('LintChecker', () => {
    let checker: LintChecker

    beforeEach(() => {
      checker = createLintChecker()
    })

    it('应该检查 TypeScript 代码', () => {
      const code = `
        console.log('test')
        const x: any = 1
      `

      const results = checker.checkTypeScript(code, 'test.ts')

      expect(Array.isArray(results)).toBe(true)
      // 应该检测到 console.log
      expect(results.some(r => r.rule === 'no-console')).toBe(true)
    })

    it('应该检查 Dart 代码', () => {
      const code = `
        void main() {
          print('test')
          dynamic x = 1
        }
      `

      const results = checker.checkDart(code, 'test.dart')

      expect(Array.isArray(results)).toBe(true)
    })

    it('应该渲染结果', () => {
      const results = [
        {
          filePath: 'test.ts',
          line: 1,
          column: 1,
          severity: 'warning' as const,
          message: '测试警告',
          rule: 'test',
        },
      ]

      const output = checker.renderResults(results)

      expect(typeof output).toBe('string')
      expect(output).toContain('测试警告')
    })
  })

  describe('TestRunner', () => {
    let runner: TestRunner

    beforeEach(() => {
      runner = createTestRunner()
    })

    it('应该解析 Jest 输出', () => {
      const output = `
✓ test 1 (2ms)
✓ test 2 (1ms)
✗ test 3 (5ms)
  Error: Expected 1, got 2
      `

      const suite = runner.parseJestOutput(output)

      expect(suite.tests.length).toBe(3)
      expect(suite.passed).toBe(2)
      expect(suite.failed).toBe(1)
    })

    it('应该解析 Dart test 输出', () => {
      const output = `
✓ test 1 (2ms)
✓ test 2 (1ms)
✗ test 3 (5ms)
      `

      const suite = runner.parseDartTestOutput(output)

      expect(suite.tests.length).toBe(3)
    })

    it('应该渲染结果', () => {
      const suite = {
        name: 'Test Suite',
        tests: [
          { name: 'test 1', status: 'passed' as const, duration: 2 },
          { name: 'test 2', status: 'failed' as const, error: 'Error' },
        ],
        passed: 1,
        failed: 1,
        skipped: 0,
      }

      const output = runner.renderResults(suite)

      expect(typeof output).toBe('string')
      expect(output).toContain('test 1')
      expect(output).toContain('test 2')
    })
  })
})
