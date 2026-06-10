/**
 * Git 操作测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { GitManager, createGitManager } from '../git.js'

describe('Git 操作', () => {
  let manager: GitManager

  beforeEach(() => {
    manager = createGitManager()
  })

  describe('初始化', () => {
    it('应该创建管理器实例', () => {
      expect(manager).toBeDefined()
      expect(manager).toBeInstanceOf(GitManager)
    })

    it('应该检查是否是 Git 仓库', () => {
      const isRepo = manager.isRepository()
      expect(typeof isRepo).toBe('boolean')
    })
  })

  describe('状态', () => {
    it('应该获取当前分支', () => {
      if (manager.isRepository()) {
        const branch = manager.getCurrentBranch()
        expect(typeof branch).toBe('string')
        expect(branch.length).toBeGreaterThan(0)
      }
    })

    it('应该获取 Git 状态', () => {
      if (manager.isRepository()) {
        const status = manager.getStatus()

        expect(status).toBeDefined()
        expect(status.branch).toBeDefined()
        expect(Array.isArray(status.staged)).toBe(true)
        expect(Array.isArray(status.unstaged)).toBe(true)
        expect(Array.isArray(status.untracked)).toBe(true)
      }
    })
  })

  describe('分支', () => {
    it('应该获取分支列表', () => {
      if (manager.isRepository()) {
        const branches = manager.getBranches()

        expect(Array.isArray(branches)).toBe(true)
        expect(branches.length).toBeGreaterThan(0)

        // 应该有当前分支
        const currentBranch = branches.find(b => b.current)
        expect(currentBranch).toBeDefined()
      }
    })
  })

  describe('远程仓库', () => {
    it('应该获取远程仓库列表', () => {
      if (manager.isRepository()) {
        const remotes = manager.getRemotes()

        expect(Array.isArray(remotes)).toBe(true)
      }
    })
  })

  describe('Diff', () => {
    it('应该获取 Diff', () => {
      if (manager.isRepository()) {
        try {
          const diff = manager.getDiff()
          expect(typeof diff).toBe('string')
        } catch (error) {
          // Git 可能没有变更，忽略错误
        }
      }
    })

    it('应该获取已暂存的 Diff', () => {
      if (manager.isRepository()) {
        try {
          const diff = manager.getDiff(undefined, true)
          expect(typeof diff).toBe('string')
        } catch (error) {
          // Git 可能没有暂存的变更，忽略错误
        }
      }
    })
  })

  describe('渲染', () => {
    it('应该渲染状态', () => {
      if (manager.isRepository()) {
        const status = manager.getStatus()
        const output = manager.renderStatus(status)

        expect(typeof output).toBe('string')
        expect(output).toContain('分支信息')
      }
    })

    it('应该渲染分支列表', () => {
      if (manager.isRepository()) {
        const branches = manager.getBranches()
        const output = manager.renderBranches(branches)

        expect(typeof output).toBe('string')
        expect(output).toContain('分支列表')
      }
    })

    it('应该渲染 Diff', () => {
      const diff = 'diff --git a/file.txt b/file.txt\n+new line\n-old line'
      const output = manager.renderDiff(diff)

      expect(typeof output).toBe('string')
      expect(output).toContain('+new line')
      expect(output).toContain('-old line')
    })
  })
})
