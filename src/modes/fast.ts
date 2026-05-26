import type { SessionMode } from '../session/manager.js';

export interface FastModeConfig {
  enabled: boolean;
  autoScan: boolean;
  upgradeOnRisk: boolean;
}

export class FastMode {
  private config: FastModeConfig;

  constructor() {
    this.config = {
      enabled: false,
      autoScan: true,
      upgradeOnRisk: true,
    };
  }

  // 启用快速模式
  enable(): void {
    this.config.enabled = true;
  }

  // 禁用快速模式
  disable(): void {
    this.config.enabled = false;
  }

  // 检查是否启用
  isEnabled(): boolean {
    return this.config.enabled;
  }

  // 获取配置
  getConfig(): FastModeConfig {
    return { ...this.config };
  }

  // 判断是否应该升级
  shouldUpgrade(userInput: string, scanResult?: string): boolean {
    if (!this.config.upgradeOnRisk) {
      return false;
    }

    // 检查是否有风险信号
    const riskSignals = [
      '需求缺口',
      'UI 结构决策',
      '架构边界风险',
      '链路收敛风险',
    ];

    const combined = `${userInput} ${scanResult || ''}`;
    return riskSignals.some(signal => combined.includes(signal));
  }

  // 获取推荐模式
  getRecommendedMode(userInput: string): SessionMode {
    const input = userInput.toLowerCase();

    // 轻量任务
    if (this.isLightweight(input)) {
      return 'lightweight';
    }

    // 中等任务
    if (this.isMedium(input)) {
      return 'medium';
    }

    // 默认中等
    return 'medium';
  }

  // 判断是否轻量任务
  private isLightweight(input: string): boolean {
    const keywords = [
      '按钮', '颜色', '字体', '大小', '文案',
      '修改', '调整', '改一下',
    ];
    return keywords.some(kw => input.includes(kw));
  }

  // 判断是否中等任务
  private isMedium(input: string): boolean {
    const keywords = [
      '页面', '列表', '详情', '表单',
      '新增', '添加', '创建',
    ];
    return keywords.some(kw => input.includes(kw));
  }
}

export const fastMode = new FastMode();
