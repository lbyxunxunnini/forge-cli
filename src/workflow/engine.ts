import type { WorkflowState, Phase, PhaseResult, TaskMode } from './types.js';
import { routeTask } from './router.js';
import type { ContextManager } from '../llm/context.js';

export class WorkflowEngine {
  private state: WorkflowState;
  private contextManager: ContextManager;

  constructor(contextManager: ContextManager) {
    this.state = {
      projectState: 'flutter_existing',
      currentMode: null,
      currentPhase: null,
      userConfirmed: false,
      designConfirmed: false,
    };
    this.contextManager = contextManager;
  }

  // 路由：判断任务类型
  route(userInput: string): TaskMode {
    const classification = routeTask(userInput);
    this.state.currentMode = classification.mode;

    // 添加系统消息记录路由结果
    this.contextManager.addMessage({
      role: 'system',
      content: `[f-forge] 路由判定：${classification.mode} (${classification.confidence}) - ${classification.reason}`,
    });

    return classification.mode;
  }

  // 获取当前阶段的系统提示
  getPhasePrompt(userInput: string): string {
    const mode = this.state.currentMode;

    switch (mode) {
      case 'direct':
        return this.getDirectPrompt(userInput);
      case 'lightweight':
        return this.getLightweightPrompt(userInput);
      case 'medium':
        return this.getMediumPrompt(userInput);
      case 'ui_optimize':
        return this.getUIOptimizePrompt(userInput);
      case 'architecture':
        return this.getArchitecturePrompt(userInput);
      case 'feature':
      case 'page':
        return this.getFullFlowPrompt(userInput);
      case 'new_project':
        return this.getNewProjectPrompt(userInput);
      default:
        return this.getFullFlowPrompt(userInput);
    }
  }

  // 推进到下一阶段
  advancePhase(): Phase {
    const current = this.state.currentPhase;

    if (!current) {
      this.state.currentPhase = 'S1';
      return 'S1';
    }

    const phaseOrder: Phase[] = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
    const currentIndex = phaseOrder.indexOf(current);

    if (currentIndex < phaseOrder.length - 1) {
      // S2 完成后直接跳到 S4（跳过 S3，除非是大任务）
      if (current === 'S2' && this.state.currentMode !== 'feature') {
        this.state.currentPhase = 'S4';
        return 'S4';
      }

      this.state.currentPhase = phaseOrder[currentIndex + 1];
      return this.state.currentPhase;
    }

    return current;
  }

  // 设置当前阶段
  setPhase(phase: Phase): void {
    this.state.currentPhase = phase;
  }

  // 获取当前状态
  getState(): WorkflowState {
    return { ...this.state };
  }

  // 标记用户确认
  confirmUser(): void {
    this.state.userConfirmed = true;
  }

  // 标记设计确认
  confirmDesign(): void {
    this.state.designConfirmed = true;
  }

  // 检查是否可以进入实现阶段
  canEnterImplementation(): boolean {
    return this.state.userConfirmed && this.state.designConfirmed;
  }

  // 重置状态
  reset(): void {
    this.state = {
      projectState: 'flutter_existing',
      currentMode: null,
      currentPhase: null,
      userConfirmed: false,
      designConfirmed: false,
    };
  }

  private getDirectPrompt(userInput: string): string {
    return `你是 Flutter Forge 的直通模式。用户的问题可以直接回答，不需要走完整流程。

用户输入：${userInput}

请直接回答用户的问题。完成后输出：[f-forge] 直通模式：完成`;
  }

  private getLightweightPrompt(userInput: string): string {
    return `你是 Flutter Forge 的页面工程师，当前执行轻量任务。

用户输入：${userInput}

轻量任务流程：
1. 理解用户需求
2. 直接定位到相关代码
3. 完成修改
4. 简单验证

完成后输出：[f-forge] 页面工程师：已完成修改并完成基本验证`;
  }

  private getMediumPrompt(userInput: string): string {
    return `你是 Flutter Forge 的页面工程师，当前执行中等任务。

用户输入：${userInput}

中等任务流程：
1. 扫描项目结构
2. 输出扫描结论
3. 制定执行策略
4. 输出改动契约
5. 等待用户确认后执行

完成后输出：[f-forge] 页面工程师：已完成修改`;
  }

  private getUIOptimizePrompt(userInput: string): string {
    return `你是 Flutter Forge 的 UI 设计师，当前执行 UI 优化任务。

用户输入：${userInput}

UI 优化流程：
1. 确认优化范围
2. 分析当前 UI
3. 提出优化方案
4. 实现修改

完成后输出：[f-forge] 模式：UI 优化 - 完成`;
  }

  private getArchitecturePrompt(userInput: string): string {
    return `你是 Flutter Forge 的架构设计师，当前执行架构级任务。

用户输入：${userInput}

架构级任务流程：
1. 分析当前架构
2. 识别问题和风险
3. 设计改进方案
4. 实现重构
5. 验证改动

完成后输出：[f-forge] 模式：架构级任务 - 完成`;
  }

  private getFullFlowPrompt(userInput: string): string {
    const mode = this.state.currentMode === 'feature' ? '功能开发' : '页面开发';
    return `你是 Flutter Forge，当前执行${mode}任务，需要走完整流程。

用户输入：${userInput}

执行流程：
S1 需求分析：理解用户需求，确认目标和范围
S2 方案设计：设计实现方案，确认技术选型
S3 任务拆分：（可选）拆分大任务为子任务
S4 实现：编写代码实现
S5 验证：测试验证功能

当前阶段：${this.state.currentPhase || 'S1'}

请根据当前阶段完成相应任务。每个阶段完成后输出：
[f-forge] 阶段：Sx <阶段名称>`;
  }

  private getNewProjectPrompt(userInput: string): string {
    return `你是 Flutter Forge，当前执行新项目共创任务。

用户输入：${userInput}

新项目共创流程：
C0 想法收口：理解用户想法
C1 需求确认：确认产品需求
C2 工程定型：确定技术方案
C3 方案冻结：冻结实现方案

完成后进入执行轨道 S3/S4。

当前阶段：${this.state.currentPhase || 'C0'}`;
  }
}
