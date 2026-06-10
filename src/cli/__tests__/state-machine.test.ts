/**
 * 状态机测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  StateMachine,
  StateMachineError,
  createStateMachine,
} from '../state-machine.js'

describe('状态机', () => {
  let stateMachine: StateMachine

  beforeEach(() => {
    stateMachine = createStateMachine({
      initialState: 'idle',
      states: ['idle', 'processing', 'completed', 'error'],
      transitions: [
        { from: 'idle', to: 'processing', event: 'start' },
        { from: 'processing', to: 'completed', event: 'finish' },
        { from: 'processing', to: 'error', event: 'fail' },
        { from: 'error', to: 'idle', event: 'reset' },
        { from: 'completed', to: 'idle', event: 'reset' },
      ],
    })
  })

  describe('初始化', () => {
    it('应该设置初始状态', () => {
      expect(stateMachine.getCurrentState()).toBe('idle')
    })

    it('应该有空的历史记录', () => {
      expect(stateMachine.getHistory()).toEqual([])
    })

    it('应该有空的上下文', () => {
      expect(stateMachine.getContext()).toEqual({})
    })
  })

  describe('状态转换', () => {
    it('应该执行有效的状态转换', () => {
      stateMachine.send('start')
      expect(stateMachine.getCurrentState()).toBe('processing')
    })

    it('应该记录状态历史', () => {
      stateMachine.send('start')
      const history = stateMachine.getHistory()

      expect(history).toHaveLength(1)
      expect(history[0].from).toBe('idle')
      expect(history[0].to).toBe('processing')
      expect(history[0].event).toBe('start')
    })

    it('应该执行多步转换', () => {
      stateMachine.send('start')
      stateMachine.send('finish')

      expect(stateMachine.getCurrentState()).toBe('completed')
      expect(stateMachine.getHistory()).toHaveLength(2)
    })

    it('应该抛出错误对于无效的转换', () => {
      expect(() => {
        stateMachine.send('finish')  // idle 不能直接到 completed
      }).toThrow(StateMachineError)
    })

    it('应该支持重置', () => {
      stateMachine.send('start')
      stateMachine.send('finish')
      stateMachine.send('reset')

      expect(stateMachine.getCurrentState()).toBe('idle')
    })
  })

  describe('条件检查', () => {
    it('应该支持 guard 条件', () => {
      const sm = createStateMachine({
        initialState: 'idle',
        states: ['idle', 'processing'],
        transitions: [
          {
            from: 'idle',
            to: 'processing',
            event: 'start',
            guard: (ctx) => ctx.canStart === true,
          },
        ],
      })

      // 条件不满足时应该抛出错误
      expect(() => {
        sm.send('start')
      }).toThrow(StateMachineError)

      // 设置条件后应该成功
      sm.setContext({ canStart: true })
      sm.send('start')
      expect(sm.getCurrentState()).toBe('processing')
    })

    it('应该支持 action 回调', () => {
      let actionCalled = false

      const sm = createStateMachine({
        initialState: 'idle',
        states: ['idle', 'processing'],
        transitions: [
          {
            from: 'idle',
            to: 'processing',
            event: 'start',
            action: () => { actionCalled = true },
          },
        ],
      })

      sm.send('start')
      expect(actionCalled).toBe(true)
    })
  })

  describe('上下文管理', () => {
    it('应该设置上下文', () => {
      stateMachine.setContext({ key: 'value' })
      expect(stateMachine.getContext()).toEqual({ key: 'value' })
    })

    it('应该合并上下文', () => {
      stateMachine.setContext({ key1: 'value1' })
      stateMachine.setContext({ key2: 'value2' })

      expect(stateMachine.getContext()).toEqual({
        key1: 'value1',
        key2: 'value2',
      })
    })
  })

  describe('可用事件', () => {
    it('应该返回当前状态的可用事件', () => {
      const events = stateMachine.getAvailableEvents()
      expect(events).toContain('start')
      expect(events).not.toContain('finish')
    })

    it('应该检查事件是否可用', () => {
      expect(stateMachine.canSend('start')).toBe(true)
      expect(stateMachine.canSend('finish')).toBe(false)
    })
  })

  describe('快照恢复', () => {
    it('应该创建快照', () => {
      stateMachine.send('start')
      stateMachine.setContext({ key: 'value' })

      const snapshot = stateMachine.createSnapshot()

      expect(snapshot.currentState).toBe('processing')
      expect(snapshot.history).toHaveLength(1)
      expect(snapshot.context).toEqual({ key: 'value' })
      expect(snapshot.timestamp).toBeDefined()
    })

    it('应该从快照恢复', () => {
      stateMachine.send('start')
      stateMachine.setContext({ key: 'value' })

      const snapshot = stateMachine.createSnapshot()

      // 重置状态机
      stateMachine.reset()
      expect(stateMachine.getCurrentState()).toBe('idle')

      // 从快照恢复
      stateMachine.restoreFromSnapshot(snapshot)
      expect(stateMachine.getCurrentState()).toBe('processing')
      expect(stateMachine.getContext()).toEqual({ key: 'value' })
    })
  })

  describe('重置', () => {
    it('应该重置到初始状态', () => {
      stateMachine.send('start')
      stateMachine.send('finish')
      stateMachine.setContext({ key: 'value' })

      stateMachine.reset()

      expect(stateMachine.getCurrentState()).toBe('idle')
      expect(stateMachine.getHistory()).toEqual([])
      expect(stateMachine.getContext()).toEqual({})
    })
  })

  describe('渲染', () => {
    it('应该渲染状态机信息', () => {
      const output = stateMachine.render()

      expect(output).toContain('状态机')
      expect(output).toContain('当前状态')
      expect(output).toContain('idle')
    })

    it('应该渲染转换图', () => {
      const output = stateMachine.renderTransitionGraph()

      expect(output).toContain('状态转换图')
      expect(output).toContain('idle')
      expect(output).toContain('processing')
    })
  })
})
