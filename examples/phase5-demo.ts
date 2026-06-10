/**
 * Phase 5 功能演示
 * 展示结构化编辑、Git 操作、Lint 检查、测试运行
 */

import {
  // 结构化编辑
  DiffGenerator,
  LintChecker,
  TestRunner,
  diffGenerator,
  lintChecker,
  testRunner,

  // Git 操作
  GitManager,
  gitManager,

  // 渲染器
  renderDivider,
  renderTable,
  renderList,
  renderKeyValue,
} from '../src/cli/index.js'

async function main() {
  console.log('=== Phase 5 功能演示 ===\n')

  // 1. Diff 生成演示
  console.log('1. Diff 生成')
  console.log(renderDivider(60))

  const oldContent = `function hello() {
  console.log("Hello, World!")
  return true
}`

  const newContent = `function hello(name: string) {
  console.log(\`Hello, \${name}!\`)
  return true
}

function goodbye() {
  console.log("Goodbye!")
}`

  const diff = diffGenerator.generateDiff(oldContent, newContent, 'example.ts')
  console.log(diffGenerator.renderDiff(diff))

  const stats = diffGenerator.getStats(diff)
  console.log('')
  console.log(renderKeyValue('新增行数', String(stats.additions)))
  console.log(renderKeyValue('删除行数', String(stats.deletions)))
  console.log(renderKeyValue('修改行数', String(stats.changes)))

  // 2. Lint 检查演示
  console.log('\n2. Lint 检查')
  console.log(renderDivider(60))

  const tsCode = `import chalk from 'chalk'

const debug = true
const message: any = "Hello"

console.log(message)

function test() {
  const unused = 42
  return true
}`

  const tsResults = lintChecker.checkTypeScript(tsCode, 'example.ts')
  console.log(lintChecker.renderResults(tsResults))

  // Dart 代码检查
  console.log('\nDart 代码检查:')
  const dartCode = `import 'package:flutter/material.dart'

void main() {
  dynamic value = 'Hello'
  print(value)

  runApp(MyApp())
}`

  const dartResults = lintChecker.checkDart(dartCode, 'main.dart')
  console.log(lintChecker.renderResults(dartResults))

  // 3. 测试结果解析演示
  console.log('\n3. 测试结果解析')
  console.log(renderDivider(60))

  const jestOutput = `✓ should add two numbers (2ms)
✓ should subtract two numbers (1ms)
✗ should multiply correctly (5ms)
  Error: Expected 6, got 5
○ should divide (skipped)
✓ should handle zero (3ms)`

  const suite = testRunner.parseJestOutput(jestOutput)
  console.log(testRunner.renderResults(suite))

  // 4. Git 操作演示（需要在 Git 仓库中运行）
  console.log('\n4. Git 操作')
  console.log(renderDivider(60))

  if (gitManager.isRepository()) {
    const status = gitManager.getStatus()
    console.log(gitManager.renderStatus(status))

    // 获取分支
    const branches = gitManager.getBranches()
    console.log('\n' + gitManager.renderBranches(branches))

    // 获取远程仓库
    const remotes = gitManager.getRemotes()
    if (remotes.length > 0) {
      console.log('\n远程仓库:')
      for (const remote of remotes) {
        console.log(`  ${remote.name}: ${remote.url}`)
      }
    }
  } else {
    console.log('当前目录不是 Git 仓库')
  }

  // 5. 命令用法演示
  console.log('\n5. 命令用法')
  console.log(renderDivider(60))

  console.log(renderList([
    '/git - 显示 Git 状态',
    '/git status - 显示 Git 状态',
    '/git log - 显示提交历史',
    '/git branch - 显示分支列表',
    '/git add . - 暂存所有文件',
    '/git commit "message" - 提交',
    '/git diff - 显示未暂存的 Diff',
    '/git diff --staged - 显示已暂存的 Diff',
    '/git remote - 显示远程仓库',
  ], true))

  console.log('')

  console.log(renderList([
    '/diff old.ts new.ts - 比较两个文件',
    '/diff --staged - 显示已暂存的 Diff',
  ], true))

  console.log('')

  console.log(renderList([
    '/lint - 检查当前目录的 TypeScript 文件',
    '/lint file.ts - 检查指定文件',
    '/lint file.dart - 检查 Dart 文件',
  ], true))

  console.log('')

  console.log(renderList([
    '/test - 运行项目测试（自动检测 Jest/Flutter）',
    '/test --coverage - 运行测试并生成覆盖率报告',
  ], true))

  console.log('\n=== 演示完成 ===')
}

main().catch(console.error)
