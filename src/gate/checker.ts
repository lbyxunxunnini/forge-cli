import type { SessionData, SessionMode } from '../session/manager.js';
import chalk from 'chalk';

export type GateId =
  | 'G01' // session 不存在
  | 'G05' // 阶段未进入 S4
  | 'G06' // S2→S4 强制推进
  | 'G07' // S5 验证阶段
  | 'G08' // 角色边界
  | 'G09' // 工作模式锁
  | 'G10' // 核心定义未冻结
  | 'G11' // 子单元未冻结
  | 'G12' // 超范围风险
  | 'G13' // 计划冲突
  | 'G14' // 验证未通过
  | 'G15' // 改动契约缺失
  | 'G16'; // 改动契约未确认

export interface GateCheckResult {
  passed: boolean;
  gateId?: GateId;
  reason?: string;
}

export class GateChecker {
  // 检查是否允许写入实现类文件
  checkWriteAllowed(
    session: SessionData | null,
    targetFile: string,
    activeAgent: string
  ): GateCheckResult {
    // G01: session 不存在
    if (!session) {
      return {
        passed: false,
        gateId: 'G01',
        reason: 'session 不存在，必须先初始化 session',
      };
    }

    // G05: 阶段未进入 S4
    if (!this.isImplementationPhase(session.phase) && !this.isAllowedFile(targetFile)) {
      return {
        passed: false,
        gateId: 'G05',
        reason: `当前阶段 ${session.phase} 未进入 S4，禁止写入实现类文件`,
      };
    }

    // G07: S5 验证阶段
    if (session.phase === 'S5' && this.isImplementationFile(targetFile)) {
      return {
        passed: false,
        gateId: 'G07',
        reason: 'S5 验证阶段禁止写入实现类文件',
      };
    }

    // G08: 角色边界
    if (!this.isAgentAllowedToWrite(activeAgent, targetFile)) {
      return {
        passed: false,
        gateId: 'G08',
        reason: `Agent ${activeAgent} 无权写入 ${targetFile}`,
      };
    }

    return { passed: true };
  }

  // 检查是否允许进入实现阶段
  checkCanEnterImplementation(
    session: SessionData | null,
    userConfirmed: boolean,
    designConfirmed: boolean
  ): GateCheckResult {
    // G01: session 不存在
    if (!session) {
      return {
        passed: false,
        gateId: 'G01',
        reason: 'session 不存在',
      };
    }

    // G10: 核心定义未冻结
    if (!userConfirmed || !designConfirmed) {
      return {
        passed: false,
        gateId: 'G10',
        reason: '目标/范围/验收/约束未确认，禁止进入实现',
      };
    }

    return { passed: true };
  }

  // 检查是否允许进入下一阶段
  checkCanAdvancePhase(
    session: SessionData | null,
    currentPhase: string,
    nextPhase: string
  ): GateCheckResult {
    // G01: session 不存在
    if (!session) {
      return {
        passed: false,
        gateId: 'G01',
        reason: 'session 不存在',
      };
    }

    // 检查阶段转换是否合法
    const validTransitions: Record<string, string[]> = {
      'S0': ['S1'],
      'S1': ['S2'],
      'S2': ['S3', 'S4'],
      'S3': ['S4'],
      'S4': ['S5'],
      'S5': ['S6'],
      'S6': [],
    };

    const allowed = validTransitions[currentPhase] || [];
    if (!allowed.includes(nextPhase)) {
      return {
        passed: false,
        gateId: 'G06',
        reason: `不允许从 ${currentPhase} 转换到 ${nextPhase}`,
      };
    }

    return { passed: true };
  }

  // 检查是否是实现阶段
  private isImplementationPhase(phase: string): boolean {
    return ['S4', 'S5', 'S6'].includes(phase);
  }

  // 检查是否是允许的文件（非实现类）
  private isAllowedFile(file: string): boolean {
    const allowedPatterns = [
      /\.md$/,
      /\.yaml$/,
      /\.json$/,
      /test\//,
      /spec\//,
      /__tests__\//,
    ];
    return allowedPatterns.some(pattern => pattern.test(file));
  }

  // 检查是否是实现文件
  private isImplementationFile(file: string): boolean {
    const implPatterns = [
      /\.dart$/,
      /\.ts$/,
      /\.js$/,
    ];
    return implPatterns.some(pattern => pattern.test(file));
  }

  // 检查 Agent 是否允许写入
  private isAgentAllowedToWrite(agent: string, file: string): boolean {
    // 需求分析师、UI设计师、架构设计师只能写 metadata
    const readOnlyAgents = ['requirement_analyst', 'ui_designer', 'architecture_designer'];
    if (readOnlyAgents.includes(agent)) {
      return this.isAllowedFile(file);
    }

    // 页面工程师可以写实现和测试
    if (agent === 'page_engineer') {
      return true;
    }

    // 验证工程师只能写测试
    if (agent === 'verify_agent') {
      return file.includes('test') || file.includes('spec') || this.isAllowedFile(file);
    }

    // 主控可以写任何文件
    return true;
  }
}

export const gateChecker = new GateChecker();
