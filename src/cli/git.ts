/**
 * Git 操作系统 - 对齐 Claude Code 的 Git 集成
 * 支持状态查看、提交、分支管理、Diff 查看
 */

import { execSync, exec } from 'child_process'
import chalk from 'chalk'
import { getTheme } from './theme.js'

// Git 状态
export interface GitStatus {
  branch: string
  upstream?: string
  ahead: number
  behind: number
  staged: GitFileStatus[]
  unstaged: GitFileStatus[]
  untracked: string[]
}

// Git 文件状态
export interface GitFileStatus {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'copied' | 'unmerged'
  staged: boolean
}

// Git 提交
export interface GitCommit {
  hash: string
  shortHash: string
  author: string
  date: string
  message: string
}

// Git 分支
export interface GitBranch {
  name: string
  current: boolean
  remote?: string
  upstream?: string
}

/**
 * Git 管理器
 */
export class GitManager {
  private cwd: string

  constructor(cwd?: string) {
    this.cwd = cwd || process.cwd()
  }

  /**
   * 执行 Git 命令
   */
  private exec(command: string): string {
    try {
      return execSync(`git ${command}`, {
        cwd: this.cwd,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim()
    } catch (error: any) {
      throw new Error(`Git command failed: ${error.message}`)
    }
  }

  /**
   * 异步执行 Git 命令
   */
  private execAsync(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(`git ${command}`, {
        cwd: this.cwd,
        encoding: 'utf-8',
      }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Git command failed: ${stderr || error.message}`))
        } else {
          resolve(stdout.trim())
        }
      })
    })
  }

  /**
   * 检查是否是 Git 仓库
   */
  isRepository(): boolean {
    try {
      this.exec('rev-parse --git-dir')
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取当前分支
   */
  getCurrentBranch(): string {
    return this.exec('rev-parse --abbrev-ref HEAD')
  }

  /**
   * 获取 Git 状态
   */
  getStatus(): GitStatus {
    const branch = this.getCurrentBranch()

    // 获取上游分支
    let upstream: string | undefined
    let ahead = 0
    let behind = 0

    try {
      upstream = this.exec(`rev-parse --abbrev-ref ${branch}@{upstream}`)
      const aheadBehind = this.exec(`rev-list --left-right --count ${branch}...${upstream}`).split('\t')
      ahead = parseInt(aheadBehind[0]) || 0
      behind = parseInt(aheadBehind[1]) || 0
    } catch {
      // 没有上游分支
    }

    // 获取文件状态
    const statusOutput = this.exec('status --porcelain')
    const staged: GitFileStatus[] = []
    const unstaged: GitFileStatus[] = []
    const untracked: string[] = []

    for (const line of statusOutput.split('\n')) {
      if (!line.trim()) continue

      const indexStatus = line[0]
      const workTreeStatus = line[1]
      const filePath = line.slice(3)

      // 索引状态（已暂存）
      if (indexStatus !== ' ' && indexStatus !== '?') {
        staged.push({
          path: filePath,
          status: this.parseFileStatus(indexStatus),
          staged: true,
        })
      }

      // 工作树状态（未暂存）
      if (workTreeStatus !== ' ' && workTreeStatus !== '?') {
        unstaged.push({
          path: filePath,
          status: this.parseFileStatus(workTreeStatus),
          staged: false,
        })
      }

      // 未跟踪文件
      if (indexStatus === '?' && workTreeStatus === '?') {
        untracked.push(filePath)
      }
    }

    return {
      branch,
      upstream,
      ahead,
      behind,
      staged,
      unstaged,
      untracked,
    }
  }

  /**
   * 解析文件状态
   */
  private parseFileStatus(status: string): GitFileStatus['status'] {
    switch (status) {
      case 'A': return 'added'
      case 'M': return 'modified'
      case 'D': return 'deleted'
      case 'R': return 'renamed'
      case 'C': return 'copied'
      case 'U': return 'unmerged'
      default: return 'modified'
    }
  }

  /**
   * 获取提交历史
   */
  async getLog(count: number = 10): Promise<GitCommit[]> {
    const output = await this.execAsync(
      `log --oneline --format="%H|%h|%an|%ai|%s" -n ${count}`
    )

    return output.split('\n').filter(Boolean).map(line => {
      const [hash, shortHash, author, date, message] = line.split('|')
      return { hash, shortHash, author, date, message }
    })
  }

  /**
   * 获取分支列表
   */
  getBranches(): GitBranch[] {
    const output = this.exec('branch -vv')
    const currentBranch = this.getCurrentBranch()

    return output.split('\n').filter(Boolean).map(line => {
      const isCurrent = line.startsWith('*')
      const match = line.match(/^\*?\s+(\S+)\s+(\S+)\s+(?:\[(.+?)\])?\s*(.*)$/)

      if (!match) {
        return {
          name: line.replace(/^\*?\s+/, '').split(/\s+/)[0],
          current: isCurrent,
        }
      }

      return {
        name: match[1],
        current: isCurrent,
        upstream: match[3],
      }
    })
  }

  /**
   * 获取远程仓库列表
   */
  getRemotes(): { name: string; url: string }[] {
    const output = this.exec('remote -v')
    const remotes: { name: string; url: string }[] = []
    const seen = new Set<string>()

    for (const line of output.split('\n').filter(Boolean)) {
      const match = line.match(/^(\S+)\s+(\S+)\s+\((\w+)\)$/)
      if (match && !seen.has(match[1])) {
        remotes.push({ name: match[1], url: match[2] })
        seen.add(match[1])
      }
    }

    return remotes
  }

  /**
   * 暂存文件
   */
  stage(files: string[]): void {
    if (files.length === 0) return
    this.exec(`add ${files.map(f => `"${f}"`).join(' ')}`)
  }

  /**
   * 暂存所有文件
   */
  stageAll(): void {
    this.exec('add -A')
  }

  /**
   * 取消暂存文件
   */
  unstage(files: string[]): void {
    if (files.length === 0) return
    this.exec(`reset HEAD ${files.map(f => `"${f}"`).join(' ')}`)
  }

  /**
   * 提交
   */
  commit(message: string): string {
    return this.exec(`commit -m "${message.replace(/"/g, '\\"')}"`)
  }

  /**
   * 创建分支
   */
  createBranch(name: string): void {
    this.exec(`branch ${name}`)
  }

  /**
   * 切换分支
   */
  checkout(branch: string): void {
    this.exec(`checkout ${branch}`)
  }

  /**
   * 合并分支
   */
  merge(branch: string): string {
    return this.exec(`merge ${branch}`)
  }

  /**
   * 拉取
   */
  pull(): string {
    return this.exec('pull')
  }

  /**
   * 推送
   */
  push(): string {
    return this.exec('push')
  }

  /**
   * 获取文件 Diff
   */
  getDiff(file?: string, staged: boolean = false): string {
    const stagedFlag = staged ? '--staged' : ''
    const fileArg = file ? `-- "${file}"` : ''
    return this.exec(`diff ${stagedFlag} ${fileArg}`)
  }

  /**
   * 获取文件内容（指定版本）
   */
  getFileAtRevision(filePath: string, revision: string = 'HEAD'): string {
    return this.exec(`show ${revision}:"${filePath}"`)
  }

  /**
   * 获取当前文件内容
   */
  getFileContent(filePath: string): string {
    try {
      return this.exec(`show HEAD:"${filePath}"`)
    } catch {
      // 文件可能是新建的
      const fs = require('fs')
      const path = require('path')
      return fs.readFileSync(path.join(this.cwd, filePath), 'utf-8')
    }
  }

  /**
   * 渲染 Git 状态
   */
  renderStatus(status: GitStatus): string {
    const theme = getTheme()
    const lines: string[] = []

    // 分支信息
    lines.push(theme.text.bold('分支信息:'))
    lines.push(`  ${theme.claude('当前分支:')} ${theme.text(status.branch)}`)

    if (status.upstream) {
      lines.push(`  ${theme.claude('上游分支:')} ${theme.text(status.upstream)}`)
      if (status.ahead > 0) {
        lines.push(`  ${theme.warning('领先:')} ${status.ahead} 个提交`)
      }
      if (status.behind > 0) {
        lines.push(`  ${theme.warning('落后:')} ${status.behind} 个提交`)
      }
    }

    // 已暂存文件
    if (status.staged.length > 0) {
      lines.push('')
      lines.push(theme.text.bold('已暂存的文件:'))
      for (const file of status.staged) {
        const icon = this.getStatusIcon(file.status)
        lines.push(`  ${theme.success(icon)} ${file.path}`)
      }
    }

    // 未暂存文件
    if (status.unstaged.length > 0) {
      lines.push('')
      lines.push(theme.text.bold('未暂存的文件:'))
      for (const file of status.unstaged) {
        const icon = this.getStatusIcon(file.status)
        lines.push(`  ${theme.error(icon)} ${file.path}`)
      }
    }

    // 未跟踪文件
    if (status.untracked.length > 0) {
      lines.push('')
      lines.push(theme.text.bold('未跟踪的文件:'))
      for (const file of status.untracked) {
        lines.push(`  ${theme.subtle('?')} ${file}`)
      }
    }

    // 无变更
    if (status.staged.length === 0 && status.unstaged.length === 0 && status.untracked.length === 0) {
      lines.push('')
      lines.push(theme.success('✓ 工作目录干净'))
    }

    return lines.join('\n')
  }

  /**
   * 渲染提交历史
   */
  renderLog(commits: GitCommit[]): string {
    const theme = getTheme()
    const lines: string[] = []

    lines.push(theme.text.bold('提交历史:'))
    lines.push(theme.inactive('─'.repeat(60)))

    for (const commit of commits) {
      const hash = theme.subtle(commit.shortHash)
      const date = theme.subtle(commit.date.split(' ')[0])
      const message = commit.message

      lines.push(`${hash} ${date} ${message}`)
    }

    return lines.join('\n')
  }

  /**
   * 渲染分支列表
   */
  renderBranches(branches: GitBranch[]): string {
    const theme = getTheme()
    const lines: string[] = []

    lines.push(theme.text.bold('分支列表:'))
    lines.push(theme.inactive('─'.repeat(40)))

    for (const branch of branches) {
      const prefix = branch.current ? theme.success('* ') : '  '
      const upstream = branch.upstream ? theme.subtle(` (${branch.upstream})`) : ''

      lines.push(`${prefix}${theme.text(branch.name)}${upstream}`)
    }

    return lines.join('\n')
  }

  /**
   * 渲染 Diff
   */
  renderDiff(diff: string): string {
    const theme = getTheme()
    const lines = diff.split('\n')
    const result: string[] = []

    for (const line of lines) {
      if (line.startsWith('+')) {
        result.push(theme.success(line))
      } else if (line.startsWith('-')) {
        result.push(theme.error(line))
      } else if (line.startsWith('@@')) {
        result.push(theme.claude(line))
      } else if (line.startsWith('diff --git')) {
        result.push(theme.text.bold(line))
      } else {
        result.push(line)
      }
    }

    return result.join('\n')
  }

  private getStatusIcon(status: GitFileStatus['status']): string {
    switch (status) {
      case 'added': return '+'
      case 'modified': return '~'
      case 'deleted': return '-'
      case 'renamed': return '→'
      case 'copied': return '⊕'
      case 'unmerged': return '!'
    }
  }
}

/**
 * 创建 Git 管理器
 */
export function createGitManager(cwd?: string): GitManager {
  return new GitManager(cwd)
}

/**
 * 全局 Git 管理器实例
 */
export const gitManager = createGitManager()

export default {
  GitManager,
  createGitManager,
  gitManager,
}
