/**
 * 结构化编辑系统 - 对齐 Claude Code 的代码操作能力
 * 支持 Diff 生成、Lint 检查、测试执行
 */

import chalk from 'chalk'
import { getTheme } from './theme.js'

// Diff 类型
export type DiffType = 'add' | 'remove' | 'modify' | 'rename'

// Diff 行
export interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  lineNumber?: number
  oldLineNumber?: number
  newLineNumber?: number
}

// Diff 块
export interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
  context?: string
}

// Diff 结果
export interface DiffResult {
  filePath: string
  hunks: DiffHunk[]
  oldContent: string
  newContent: string
  type: DiffType
}

// Lint 严重程度
export type LintSeverity = 'error' | 'warning' | 'info' | 'hint'

// Lint 结果
export interface LintResult {
  filePath: string
  line: number
  column: number
  severity: LintSeverity
  message: string
  rule?: string
  source?: string
}

// 测试结果
export interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped' | 'pending'
  duration?: number
  error?: string
  stack?: string
}

// 测试套件
export interface TestSuite {
  name: string
  tests: TestResult[]
  duration?: number
  passed: number
  failed: number
  skipped: number
}

/**
 * Diff 生成器
 */
export class DiffGenerator {
  /**
   * 生成文件 Diff
   */
  generateDiff(oldContent: string, newContent: string, filePath: string): DiffResult {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')

    // 使用简单的逐行比较
    const hunks = this.computeDiff(oldLines, newLines)

    // 确定 Diff 类型
    let type: DiffType = 'modify'
    if (oldContent === '') {
      type = 'add'
    } else if (newContent === '') {
      type = 'remove'
    }

    return {
      filePath,
      hunks,
      oldContent,
      newContent,
      type,
    }
  }

  /**
   * 计算 Diff
   */
  private computeDiff(oldLines: string[], newLines: string[]): DiffHunk[] {
    const hunks: DiffHunk[] = []
    let currentHunk: DiffHunk | null = null

    // 简单的逐行比较算法
    const maxLines = Math.max(oldLines.length, newLines.length)
    let oldIndex = 0
    let newIndex = 0

    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex]
      const newLine = newLines[newIndex]

      if (oldIndex >= oldLines.length) {
        // 新增行
        if (!currentHunk) {
          currentHunk = {
            oldStart: oldIndex + 1,
            oldLines: 0,
            newStart: newIndex + 1,
            newLines: 0,
            lines: [],
          }
        }
        currentHunk.lines.push({
          type: 'add',
          content: newLine,
          newLineNumber: newIndex + 1,
        })
        currentHunk.newLines++
        newIndex++
      } else if (newIndex >= newLines.length) {
        // 删除行
        if (!currentHunk) {
          currentHunk = {
            oldStart: oldIndex + 1,
            oldLines: 0,
            newStart: newIndex + 1,
            newLines: 0,
            lines: [],
          }
        }
        currentHunk.lines.push({
          type: 'remove',
          content: oldLine,
          oldLineNumber: oldIndex + 1,
        })
        currentHunk.oldLines++
        oldIndex++
      } else if (oldLine === newLine) {
        // 相同行
        if (currentHunk) {
          currentHunk.lines.push({
            type: 'context',
            content: oldLine,
            oldLineNumber: oldIndex + 1,
            newLineNumber: newIndex + 1,
          })
          currentHunk.oldLines++
          currentHunk.newLines++

          // 如果上下文行太多，结束当前 hunk
          if (currentHunk.lines.filter(l => l.type !== 'context').length === 0) {
            hunks.push(currentHunk)
            currentHunk = null
          }
        }
        oldIndex++
        newIndex++
      } else {
        // 修改行
        if (!currentHunk) {
          currentHunk = {
            oldStart: oldIndex + 1,
            oldLines: 0,
            newStart: newIndex + 1,
            newLines: 0,
            lines: [],
          }
        }
        currentHunk.lines.push({
          type: 'remove',
          content: oldLine,
          oldLineNumber: oldIndex + 1,
        })
        currentHunk.lines.push({
          type: 'add',
          content: newLine,
          newLineNumber: newIndex + 1,
        })
        currentHunk.oldLines++
        currentHunk.newLines++
        oldIndex++
        newIndex++
      }
    }

    if (currentHunk) {
      hunks.push(currentHunk)
    }

    return hunks
  }

  /**
   * 渲染 Diff
   */
  renderDiff(diff: DiffResult): string {
    const theme = getTheme()
    const lines: string[] = []

    // 文件头
    lines.push(theme.claude(`--- ${diff.filePath}`))
    lines.push(theme.claude(`+++ ${diff.filePath}`))

    // 渲染每个 hunk
    for (const hunk of diff.hunks) {
      // Hunk 头
      lines.push(theme.subtle(`@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`))

      // 渲染行
      for (const line of hunk.lines) {
        switch (line.type) {
          case 'add':
            lines.push(theme.success(`+ ${line.content}`))
            break
          case 'remove':
            lines.push(theme.error(`- ${line.content}`))
            break
          case 'context':
            lines.push(`  ${line.content}`)
            break
        }
      }
    }

    return lines.join('\n')
  }

  /**
   * 统计 Diff
   */
  getStats(diff: DiffResult): { additions: number; deletions: number; changes: number } {
    let additions = 0
    let deletions = 0

    for (const hunk of diff.hunks) {
      for (const line of hunk.lines) {
        if (line.type === 'add') additions++
        if (line.type === 'remove') deletions++
      }
    }

    return {
      additions,
      deletions,
      changes: additions + deletions,
    }
  }
}

/**
 * Lint 检查器
 */
export class LintChecker {
  /**
   * 检查 TypeScript 代码
   */
  checkTypeScript(content: string, filePath: string): LintResult[] {
    const results: LintResult[] = []
    const lines = content.split('\n')

    // 简单的规则检查
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1

      // 检查 console.log
      if (line.includes('console.log')) {
        results.push({
          filePath,
          line: lineNum,
          column: line.indexOf('console.log') + 1,
          severity: 'warning',
          message: 'Avoid using console.log in production code',
          rule: 'no-console',
        })
      }

      // 检查 any 类型
      if (line.includes(': any')) {
        results.push({
          filePath,
          line: lineNum,
          column: line.indexOf(': any') + 1,
          severity: 'warning',
          message: 'Avoid using "any" type',
          rule: 'no-any',
        })
      }

      // 检查未使用的变量（简化）
      if (line.match(/(?:const|let|var)\s+\w+\s*=/) && !line.includes('//')) {
        // 这里只是示例，实际需要更复杂的分析
      }

      // 检查分号
      if (line.trim().endsWith(';') && !line.trim().startsWith('//')) {
        // 可选：检查是否需要分号
      }
    }

    return results
  }

  /**
   * 检查 Dart 代码
   */
  checkDart(content: string, filePath: string): LintResult[] {
    const results: LintResult[] = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineNum = i + 1

      // 检查 print 语句
      if (line.includes('print(')) {
        results.push({
          filePath,
          line: lineNum,
          column: line.indexOf('print(') + 1,
          severity: 'warning',
          message: 'Avoid using print in production code',
          rule: 'avoid_print',
        })
      }

      // 检查 dynamic 类型
      if (line.includes('dynamic ')) {
        results.push({
          filePath,
          line: lineNum,
          column: line.indexOf('dynamic ') + 1,
          severity: 'info',
          message: 'Consider using a more specific type',
          rule: 'avoid_dynamic',
        })
      }
    }

    return results
  }

  /**
   * 渲染 Lint 结果
   */
  renderResults(results: LintResult[]): string {
    const theme = getTheme()
    const lines: string[] = []

    if (results.length === 0) {
      lines.push(theme.success('✓ No issues found'))
      return lines.join('\n')
    }

    // 按文件分组
    const byFile = new Map<string, LintResult[]>()
    for (const result of results) {
      const fileResults = byFile.get(result.filePath) || []
      fileResults.push(result)
      byFile.set(result.filePath, fileResults)
    }

    // 渲染结果
    for (const [filePath, fileResults] of byFile) {
      lines.push(theme.text.bold(`\n${filePath}`))

      for (const result of fileResults) {
        const severityIcon = this.getSeverityIcon(result.severity)
        const severityColor = this.getSeverityColor(result.severity)
        const location = `${result.line}:${result.column}`
        const rule = result.rule ? theme.subtle(` (${result.rule})`) : ''

        lines.push(`  ${severityColor(severityIcon)} ${theme.subtle(location)} ${result.message}${rule}`)
      }
    }

    // 统计
    const errorCount = results.filter(r => r.severity === 'error').length
    const warningCount = results.filter(r => r.severity === 'warning').length
    const infoCount = results.filter(r => r.severity === 'info').length

    lines.push('')
    lines.push(theme.text.bold('Summary:'))
    if (errorCount > 0) lines.push(theme.error(`  ${errorCount} error(s)`))
    if (warningCount > 0) lines.push(theme.warning(`  ${warningCount} warning(s)`))
    if (infoCount > 0) lines.push(theme.subtle(`  ${infoCount} info(s)`))

    return lines.join('\n')
  }

  private getSeverityIcon(severity: LintSeverity): string {
    switch (severity) {
      case 'error': return '✗'
      case 'warning': return '⚠'
      case 'info': return 'ℹ'
      case 'hint': return '💡'
    }
  }

  private getSeverityColor(severity: LintSeverity): chalk.Chalk {
    const theme = getTheme()
    switch (severity) {
      case 'error': return theme.error
      case 'warning': return theme.warning
      case 'info': return theme.subtle
      case 'hint': return theme.subtle
    }
  }
}

/**
 * 测试运行器
 */
export class TestRunner {
  /**
   * 解析 Jest 输出
   */
  parseJestOutput(output: string): TestSuite {
    const tests: TestResult[] = []
    const lines = output.split('\n')

    let currentTest: Partial<TestResult> | null = null

    for (const line of lines) {
      // 匹配测试结果
      const passMatch = line.match(/✓\s+(.+?)\s+\((\d+)\s*ms\)/)
      const failMatch = line.match(/✗\s+(.+?)(?:\s+\((\d+)\s*ms\))?/)
      const skipMatch = line.match(/○\s+(.+?)/)

      if (passMatch) {
        tests.push({
          name: passMatch[1],
          status: 'passed',
          duration: parseInt(passMatch[2]),
        })
      } else if (failMatch) {
        currentTest = {
          name: failMatch[1],
          status: 'failed',
          duration: failMatch[2] ? parseInt(failMatch[2]) : undefined,
        }
      } else if (skipMatch) {
        tests.push({
          name: skipMatch[1],
          status: 'skipped',
        })
      } else if (currentTest && line.trim().startsWith('Error:')) {
        currentTest.error = line.trim()
        tests.push(currentTest as TestResult)
        currentTest = null
      }
    }

    if (currentTest) {
      tests.push(currentTest as TestResult)
    }

    // 统计
    const passed = tests.filter(t => t.status === 'passed').length
    const failed = tests.filter(t => t.status === 'failed').length
    const skipped = tests.filter(t => t.status === 'skipped').length

    return {
      name: 'Test Suite',
      tests,
      passed,
      failed,
      skipped,
    }
  }

  /**
   * 解析 Dart/Flutter test 输出
   */
  parseDartTestOutput(output: string): TestSuite {
    const tests: TestResult[] = []
    const lines = output.split('\n')

    for (const line of lines) {
      // 匹配测试结果
      const passMatch = line.match(/✓\s+(.+?)(?:\s+(\d+)ms)?/)
      const failMatch = line.match(/✗\s+(.+?)(?:\s+(\d+)ms)?/)
      const skipMatch = line.match(/○\s+(.+?)/)

      if (passMatch) {
        tests.push({
          name: passMatch[1],
          status: 'passed',
          duration: passMatch[2] ? parseInt(passMatch[2]) : undefined,
        })
      } else if (failMatch) {
        tests.push({
          name: failMatch[1],
          status: 'failed',
          duration: failMatch[2] ? parseInt(failMatch[2]) : undefined,
        })
      } else if (skipMatch) {
        tests.push({
          name: skipMatch[1],
          status: 'skipped',
        })
      }
    }

    const passed = tests.filter(t => t.status === 'passed').length
    const failed = tests.filter(t => t.status === 'failed').length
    const skipped = tests.filter(t => t.status === 'skipped').length

    return {
      name: 'Dart Test Suite',
      tests,
      passed,
      failed,
      skipped,
    }
  }

  /**
   * 渲染测试结果
   */
  renderResults(suite: TestSuite): string {
    const theme = getTheme()
    const lines: string[] = []

    // 标题
    lines.push(theme.text.bold(`\n${suite.name}`))
    lines.push(theme.inactive('─'.repeat(40)))

    // 测试结果
    for (const test of suite.tests) {
      const icon = this.getStatusIcon(test.status)
      const color = this.getStatusColor(test.status)
      const duration = test.duration ? theme.subtle(` (${test.duration}ms)`) : ''

      lines.push(`  ${color(icon)} ${test.name}${duration}`)

      // 错误信息
      if (test.error) {
        lines.push(theme.error(`    ${test.error}`))
      }
    }

    // 统计
    lines.push('')
    lines.push(theme.text.bold('Summary:'))
    lines.push(theme.success(`  ✓ ${suite.passed} passed`))
    if (suite.failed > 0) {
      lines.push(theme.error(`  ✗ ${suite.failed} failed`))
    }
    if (suite.skipped > 0) {
      lines.push(theme.subtle(`  ○ ${suite.skipped} skipped`))
    }

    return lines.join('\n')
  }

  private getStatusIcon(status: TestResult['status']): string {
    switch (status) {
      case 'passed': return '✓'
      case 'failed': return '✗'
      case 'skipped': return '○'
      case 'pending': return '◌'
    }
  }

  private getStatusColor(status: TestResult['status']): chalk.Chalk {
    const theme = getTheme()
    switch (status) {
      case 'passed': return theme.success
      case 'failed': return theme.error
      case 'skipped': return theme.subtle
      case 'pending': return theme.warning
    }
  }
}

/**
 * 创建 Diff 生成器
 */
export function createDiffGenerator(): DiffGenerator {
  return new DiffGenerator()
}

/**
 * 创建 Lint 检查器
 */
export function createLintChecker(): LintChecker {
  return new LintChecker()
}

/**
 * 创建测试运行器
 */
export function createTestRunner(): TestRunner {
  return new TestRunner()
}

/**
 * 全局实例
 */
export const diffGenerator = createDiffGenerator()
export const lintChecker = createLintChecker()
export const testRunner = createTestRunner()

export default {
  DiffGenerator,
  LintChecker,
  TestRunner,
  createDiffGenerator,
  createLintChecker,
  createTestRunner,
  diffGenerator,
  lintChecker,
  testRunner,
}
