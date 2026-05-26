import type { AgentRole, AgentResult, AgentContext } from './types.js';
import { BaseAgent } from './base-agent.js';

export interface AgentTask {
  id: string;
  role: AgentRole;
  input: string;
  context: AgentContext;
  priority?: number;
}

export interface AgentTaskResult {
  taskId: string;
  role: AgentRole;
  result: AgentResult;
  duration: number;
}

export class AgentPool {
  private maxConcurrent: number;
  private running: Map<string, Promise<AgentTaskResult>> = new Map();
  private queue: AgentTask[] = [];
  private agents: Map<AgentRole, BaseAgent> = new Map();

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  // 注册 Agent
  registerAgent(role: AgentRole, agent: BaseAgent): void {
    this.agents.set(role, agent);
  }

  // 并行执行多个任务
  async parallel(tasks: AgentTask[]): Promise<AgentTaskResult[]> {
    const results: AgentTaskResult[] = [];
    const executing: Promise<AgentTaskResult>[] = [];

    for (const task of tasks) {
      // 等待有空闲槽位
      if (this.running.size >= this.maxConcurrent) {
        await Promise.race(this.running.values());
      }

      // 执行任务
      const promise = this.executeTask(task).then(result => {
        this.running.delete(task.id);
        return result;
      });

      this.running.set(task.id, promise as unknown as Promise<AgentTaskResult>);
      executing.push(promise);
    }

    // 等待所有任务完成
    const completedResults = await Promise.all(executing);
    results.push(...completedResults);

    return results;
  }

  // 执行单个任务
  private async executeTask(task: AgentTask): Promise<AgentTaskResult> {
    const startTime = Date.now();
    const agent = this.agents.get(task.role);

    if (!agent) {
      return {
        taskId: task.id,
        role: task.role,
        result: {
          success: false,
          output: '',
          error: `未找到 Agent: ${task.role}`,
        },
        duration: Date.now() - startTime,
      };
    }

    try {
      const result = await agent.execute(task.input, task.context);
      return {
        taskId: task.id,
        role: task.role,
        result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        taskId: task.id,
        role: task.role,
        result: {
          success: false,
          output: '',
          error: `执行失败: ${error}`,
        },
        duration: Date.now() - startTime,
      };
    }
  }

  // 添加任务到队列
  enqueue(task: AgentTask): void {
    this.queue.push(task);
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  // 处理队列中的任务
  async processQueue(): Promise<AgentTaskResult[]> {
    const results: AgentTaskResult[] = [];

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.maxConcurrent);
      const batchResults = await this.parallel(batch);
      results.push(...batchResults);
    }

    return results;
  }

  // 获取运行中的任务数
  getRunningCount(): number {
    return this.running.size;
  }

  // 获取队列中的任务数
  getQueueLength(): number {
    return this.queue.length;
  }

  // 清空队列
  clearQueue(): void {
    this.queue = [];
  }

  // 等待所有任务完成
  async waitAll(): Promise<void> {
    await Promise.all(this.running.values());
  }

  // 取消所有任务
  cancelAll(): void {
    this.queue = [];
    // 注意：无法取消正在运行的任务
  }
}

export const agentPool = new AgentPool();
