export interface AutonomousModeConfig {
  enabled: boolean;
  autoAssume: boolean;
  highRiskInterrupt: boolean;
}

export class AutonomousMode {
  private config: AutonomousModeConfig;

  constructor() {
    this.config = {
      enabled: false,
      autoAssume: true,
      highRiskInterrupt: true,
    };
  }

  // 启用全自动模式
  enable(): void {
    this.config.enabled = true;
  }

  // 禁用全自动模式
  disable(): void {
    this.config.enabled = false;
  }

  // 检查是否启用
  isEnabled(): boolean {
    return this.config.enabled;
  }

  // 获取配置
  getConfig(): AutonomousModeConfig {
    return { ...this.config };
  }

  // 判断是否需要中断
  shouldInterrupt(userInput: string, context: string): boolean {
    if (!this.config.highRiskInterrupt) {
      return false;
    }

    // 高风险信号
    const highRiskSignals = [
      '安全',
      '不可逆',
      '生产环境',
      '全项目级架构切换',
      '删除',
      '迁移',
    ];

    const combined = `${userInput} ${context}`;
    return highRiskSignals.some(signal => combined.includes(signal));
  }

  // 获取自动假设
  getAutoAssumption(context: string): string | null {
    if (!this.config.autoAssume) {
      return null;
    }

    // 根据上下文生成自动假设
    if (context.includes('缺少')) {
      return '自动采用推荐方案';
    }

    return null;
  }

  // 判断是否可以自动推进
  canAutoProceed(userInput: string): boolean {
    // 检查是否是高风险操作
    if (this.shouldInterrupt(userInput, '')) {
      return false;
    }

    return true;
  }
}

export const autonomousMode = new AutonomousMode();
