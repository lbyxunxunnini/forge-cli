# 结构化编辑与 Git 操作

> Phase 5 功能完善 - 对齐 Claude Code 的代码操作能力

## 1. Diff 生成

### 基本使用

```typescript
import { DiffGenerator, diffGenerator } from './cli/structured-edit.js'

// 创建 Diff 生成器
const generator = new DiffGenerator()

// 生成 Diff
const diff = generator.generateDiff(oldContent, newContent, 'file.ts')

// 渲染 Diff
console.log(generator.renderDiff(diff))

// 获取统计信息
const stats = generator.getStats(diff)
console.log(`新增: ${stats.additions} 行`)
console.log(`删除: ${stats.deletions} 行`)
console.log(`修改: ${stats.changes} 行`)
```

### Diff 类型

```typescript
type DiffType = 'add' | 'remove' | 'modify' | 'rename'

interface DiffResult {
  filePath: string
  hunks: DiffHunk[]
  oldContent: string
  newContent: string
  type: DiffType
}

interface DiffHunk {
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: DiffLine[]
}

interface DiffLine {
  type: 'add' | 'remove' | 'context'
  content: string
  lineNumber?: number
  oldLineNumber?: number
  newLineNumber?: number
}
```

---

## 2. Lint 检查

### TypeScript 检查

```typescript
import { LintChecker, lintChecker } from './cli/structured-edit.js'

// 创建 Lint 检查器
const checker = new LintChecker()

// 检查 TypeScript 代码
const results = checker.checkTypeScript(content, 'file.ts')

// 渲染结果
console.log(checker.renderResults(results))
```

### Dart 检查

```typescript
// 检查 Dart 代码
const results = checker.checkDart(content, 'main.dart')
console.log(checker.renderResults(results))
```

### Lint 结果类型

```typescript
type LintSeverity = 'error' | 'warning' | 'info' | 'hint'

interface LintResult {
  filePath: string
  line: number
  column: number
  severity: LintSeverity
  message: string
  rule?: string
  source?: string
}
```

### 检查规则

#### TypeScript
- `no-console` - 避免使用 console.log
- `no-any` - 避免使用 any 类型

#### Dart
- `avoid_print` - 避免使用 print
- `avoid_dynamic` - 避免使用 dynamic 类型

---

## 3. 测试运行

### 解析 Jest 输出

```typescript
import { TestRunner, testRunner } from './cli/structured-edit.js'

// 创建测试运行器
const runner = new TestRunner()

// 解析 Jest 输出
const suite = runner.parseJestOutput(jestOutput)

// 渲染结果
console.log(runner.renderResults(suite))
```

### 解析 Flutter test 输出

```typescript
// 解析 Flutter test 输出
const suite = runner.parseFlutterTestOutput(flutterOutput)
console.log(runner.renderResults(suite))
```

### 测试结果类型

```typescript
interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'skipped' | 'pending'
  duration?: number
  error?: string
  stack?: string
}

interface TestSuite {
  name: string
  tests: TestResult[]
  duration?: number
  passed: number
  failed: number
  skipped: number
}
```

---

## 4. Git 操作

### 基本使用

```typescript
import { GitManager, gitManager } from './cli/git.js'

// 创建 Git 管理器
const manager = new GitManager()

// 检查是否是 Git 仓库
if (manager.isRepository()) {
  // 获取状态
  const status = manager.getStatus()
  console.log(manager.renderStatus(status))
}
```

### 状态查看

```typescript
// 获取 Git 状态
const status = manager.getStatus()

// 状态包含：
// - branch: 当前分支
// - upstream: 上游分支
// - ahead: 领先提交数
// - behind: 落后提交数
// - staged: 已暂存文件
// - unstaged: 未暂存文件
// - untracked: 未跟踪文件

// 渲染状态
console.log(manager.renderStatus(status))
```

### 提交历史

```typescript
// 获取提交历史
const commits = await manager.getLog(10)

// 渲染历史
console.log(manager.renderLog(commits))
```

### 分支管理

```typescript
// 获取分支列表
const branches = manager.getBranches()

// 渲染分支
console.log(manager.renderBranches(branches))

// 创建分支
manager.createBranch('feature/new-feature')

// 切换分支
manager.checkout('feature/new-feature')

// 合并分支
manager.merge('main')
```

### 文件操作

```typescript
// 暂存文件
manager.stage(['file1.ts', 'file2.ts'])

// 暂存所有文件
manager.stageAll()

// 取消暂存
manager.unstage(['file1.ts'])

// 提交
manager.commit('feat: add new feature')
```

### 远程仓库

```typescript
// 获取远程仓库
const remotes = manager.getRemotes()
console.log(remotes)

// 拉取
manager.pull()

// 推送
manager.push()
```

### Diff 查看

```typescript
// 获取未暂存的 Diff
const diff = manager.getDiff()

// 获取已暂存的 Diff
const stagedDiff = manager.getDiff(undefined, true)

// 获取指定文件的 Diff
const fileDiff = manager.getDiff('file.ts')

// 渲染 Diff
console.log(manager.renderDiff(diff))
```

### 文件内容

```typescript
// 获取 HEAD 版本的文件内容
const content = manager.getFileAtRevision('file.ts')

// 获取指定版本的文件内容
const oldContent = manager.getFileAtRevision('file.ts', 'HEAD~1')

// 获取当前文件内容
const currentContent = manager.getFileContent('file.ts')
```

---

## 5. 命令行集成

### /git 命令

```bash
# 显示 Git 状态
/git

# 显示 Git 状态（简写）
/git status
/git st

# 显示提交历史
/git log
/git log 20  # 显示 20 条

# 显示分支列表
/git branch
/git br

# 暂存文件
/git add file.ts
/git add .  # 暂存所有

# 提交
/git commit "feat: add new feature"

# 查看 Diff
/git diff
/git diff --staged
/git diff file.ts

# 显示远程仓库
/git remote
```

### /diff 命令

```bash
# 比较两个文件
/diff old.ts new.ts

# 显示已暂存的 Diff
/diff --staged
```

### /lint 命令

```bash
# 检查当前目录的 TypeScript 文件
/lint

# 检查指定文件
/lint file.ts
/lint file.dart
```

### /test 命令

```bash
# 运行项目测试（自动检测 Jest/Flutter）
/test

# 运行测试并传递参数
/test --coverage
/test --watch
```

---

## 6. 完整示例

```typescript
import {
  diffGenerator,
  lintChecker,
  testRunner,
  gitManager,
} from './cli/index.js'

async function analyzeCode() {
  // 1. 检查 Git 状态
  if (gitManager.isRepository()) {
    const status = gitManager.getStatus()
    console.log(gitManager.renderStatus(status))
  }

  // 2. 运行 Lint 检查
  const fs = require('fs')
  const content = fs.readFileSync('src/main.ts', 'utf-8')
  const lintResults = lintChecker.checkTypeScript(content, 'src/main.ts')
  console.log(lintChecker.renderResults(lintResults))

  // 3. 生成 Diff
  const oldContent = gitManager.getFileAtRevision('src/main.ts')
  const diff = diffGenerator.generateDiff(oldContent, content, 'src/main.ts')
  console.log(diffGenerator.renderDiff(diff))

  // 4. 运行测试
  try {
    const { execSync } = require('child_process')
    const testOutput = execSync('npm test', { encoding: 'utf-8' })
    const suite = testRunner.parseJestOutput(testOutput)
    console.log(testRunner.renderResults(suite))
  } catch (error) {
    console.error('测试失败:', error.message)
  }
}

analyzeCode().catch(console.error)
```

---

## 7. 最佳实践

### 1. 在提交前运行 Lint

```typescript
// 提交前检查
const status = gitManager.getStatus()
if (status.staged.length > 0) {
  // 对暂存的文件运行 Lint
  for (const file of status.staged) {
    const content = fs.readFileSync(file.path, 'utf-8')
    const results = lintChecker.checkTypeScript(content, file.path)
    if (results.some(r => r.severity === 'error')) {
      console.log('存在 Lint 错误，请修复后再提交')
      return
    }
  }
}
```

### 2. 生成 Diff 预览

```typescript
// 在提交前显示 Diff
const diff = gitManager.getDiff(undefined, true)
console.log(gitManager.renderDiff(diff))

// 确认提交
const confirmed = await confirm('是否提交这些更改?')
if (confirmed) {
  gitManager.commit(message)
}
```

### 3. 自动化测试

```typescript
// 在代码修改后自动运行测试
async function runTestsAfterChange() {
  const { execSync } = require('child_process')

  try {
    const output = execSync('npm test', { encoding: 'utf-8' })
    const suite = testRunner.parseJestOutput(output)

    if (suite.failed > 0) {
      console.log(testRunner.renderResults(suite))
      throw new Error(`${suite.failed} 个测试失败`)
    }

    console.log(`✓ ${suite.passed} 个测试通过`)
  } catch (error) {
    console.error('测试失败:', error.message)
    throw error
  }
}
```

---

## 8. 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-06-09 | 初始创建，基于 Claude Code CLI 源码分析实现结构化编辑和 Git 操作 |
