import type {
  LearningTrigger,
  LearningPrompt,
  LearningSession,
  UserContribution,
  LearningConfig,
  LearningInsight,
} from './types.js';

export class LearningMode {
  private config: LearningConfig;
  private currentSession: LearningSession | null = null;
  private promptCounter = 0;

  constructor(config?: Partial<LearningConfig>) {
    this.config = {
      enabled: false,
      frequency: 'sometimes',
      minCodeLines: 5,
      maxCodeLines: 10,
      showHints: true,
      trackContributions: true,
      ...config,
    };
  }

  // 开始学习会话
  startSession(): LearningSession {
    this.currentSession = {
      id: this.generateSessionId(),
      startTime: new Date().toISOString(),
      prompts: [],
      userContributions: [],
      insights: [],
    };
    return this.currentSession;
  }

  // 结束学习会话
  endSession(): LearningSession | null {
    if (!this.currentSession) return null;

    const session = { ...this.currentSession };
    this.currentSession = null;
    return session;
  }

  // 生成学习提示
  generatePrompt(params: {
    trigger: LearningTrigger;
    context: string;
    topic?: string;
    codeSnippet?: string;
  }): LearningPrompt | null {
    if (!this.config.enabled) return null;
    if (!this.shouldGeneratePrompt()) return null;

    const prompt: LearningPrompt = {
      id: `prompt-${++this.promptCounter}`,
      trigger: params.trigger,
      message: this.generateMessage(params.trigger, params.context, params.topic),
      codeSnippet: params.codeSnippet,
      expectedLines: this.getRandomExpectedLines(),
      hints: this.config.showHints ? this.generateHints(params.trigger, params.topic) : undefined,
    };

    if (this.currentSession) {
      this.currentSession.prompts.push(prompt);
    }

    return prompt;
  }

  // 是否应该生成提示
  private shouldGeneratePrompt(): boolean {
    const random = Math.random();
    switch (this.config.frequency) {
      case 'always':
        return true;
      case 'often':
        return random < 0.7;
      case 'sometimes':
        return random < 0.4;
      case 'rarely':
        return random < 0.2;
      default:
        return false;
    }
  }

  // 生成消息
  private generateMessage(trigger: LearningTrigger, context: string, topic?: string): string {
    const messages: Record<LearningTrigger, string[]> = {
      decision_point: [
        '现在是一个决策点。你认为应该怎么做？',
        '这里有几个选择，你会怎么选？',
        '这是一个很好的学习机会，你来决定下一步。',
      ],
      code_review: [
        '代码审查完成。你能写一段改进代码吗？',
        '基于审查结果，你来实现修复。',
        '这是改进的机会，你来写代码。',
      ],
      error_explanation: [
        '错误已解释。你能写一个正确的版本吗？',
        '理解了错误原因，你来修复它。',
        '这是学习的好机会，你来实现正确方案。',
      ],
      concept_intro: [
        '介绍了新概念。你能写一个示例吗？',
        '概念已解释，你来实践一下。',
        '理论已讲完，你来写代码。',
      ],
      pattern_detected: [
        '检测到代码模式。你能写一个遵循这个模式的代码吗？',
        '这是项目的代码模式，你来实现一个示例。',
        '模式已识别，你来实践。',
      ],
    };

    const options = messages[trigger];
    const message = options[Math.floor(Math.random() * options.length)];

    if (topic) {
      return `${message}\n\n主题: ${topic}`;
    }

    return message;
  }

  // 生成提示
  private generateHints(trigger: LearningTrigger, topic?: string): string[] {
    const hints: string[] = [];

    switch (trigger) {
      case 'decision_point':
        hints.push('考虑代码的可维护性');
        hints.push('考虑性能影响');
        hints.push('考虑错误处理');
        break;
      case 'code_review':
        hints.push('参考审查建议');
        hints.push('保持代码简洁');
        hints.push('添加必要的注释');
        break;
      case 'error_explanation':
        hints.push('理解错误根因');
        hints.push('添加边界检查');
        hints.push('考虑异常情况');
        break;
      case 'concept_intro':
        hints.push('从简单示例开始');
        hints.push('逐步增加复杂度');
        hints.push('测试你的代码');
        break;
      case 'pattern_detected':
        hints.push('遵循项目规范');
        hints.push('保持一致性');
        hints.push('参考现有代码');
        break;
    }

    if (topic) {
      hints.push(`聚焦于 ${topic}`);
    }

    return hints;
  }

  // 获取随机期望行数
  private getRandomExpectedLines(): number {
    const { minCodeLines, maxCodeLines } = this.config;
    return Math.floor(Math.random() * (maxCodeLines - minCodeLines + 1)) + minCodeLines;
  }

  // 记录用户贡献
  recordContribution(contribution: UserContribution): void {
    if (!this.config.trackContributions || !this.currentSession) return;

    this.currentSession.userContributions.push(contribution);
  }

  // 评估用户贡献
  evaluateContribution(code: string, expectedLines: number): {
    quality: UserContribution['quality'];
    feedback: string;
  } {
    const lines = code.split('\n').filter(l => l.trim()).length;

    if (lines < expectedLines * 0.5) {
      return {
        quality: 'needs_improvement',
        feedback: `代码行数较少，期望约 ${expectedLines} 行，实际 ${lines} 行。`,
      };
    }

    if (lines > expectedLines * 2) {
      return {
        quality: 'needs_improvement',
        feedback: `代码行数较多，期望约 ${expectedLines} 行，实际 ${lines} 行。考虑简化。`,
      };
    }

    // 基本质量检查
    if (code.includes('TODO') || code.includes('FIXME')) {
      return {
        quality: 'needs_improvement',
        feedback: '代码中包含 TODO/FIXME，请完成实现。',
      };
    }

    return {
      quality: 'good',
      feedback: '代码看起来不错！',
    };
  }

  // 生成学习洞察
  generateInsight(topic: string, codeExamples: string[]): LearningInsight {
    const insight: LearningInsight = {
      topic,
      description: this.generateInsightDescription(topic),
      examples: codeExamples,
      bestPractices: this.generateBestPractices(topic),
    };

    if (this.currentSession) {
      this.currentSession.insights.push(topic);
    }

    return insight;
  }

  // 生成洞察描述
  private generateInsightDescription(topic: string): string {
    // 这里可以根据主题生成更详细的描述
    return `关于 ${topic} 的学习洞察`;
  }

  // 生成最佳实践
  private generateBestPractices(topic: string): string[] {
    // 这里可以根据主题生成更具体的最佳实践
    return [
      '遵循项目代码规范',
      '编写清晰的注释',
      '保持函数简洁',
      '处理边界情况',
    ];
  }

  // 格式式学习提示
  formatPrompt(prompt: LearningPrompt): string {
    const lines: string[] = [];

    lines.push('## 学习时刻');
    lines.push('');
    lines.push(prompt.message);
    lines.push('');

    if (prompt.codeSnippet) {
      lines.push('```');
      lines.push(prompt.codeSnippet);
      lines.push('```');
      lines.push('');
    }

    if (prompt.expectedLines) {
      lines.push(`期望代码行数: 约 ${prompt.expectedLines} 行`);
      lines.push('');
    }

    if (prompt.hints && prompt.hints.length > 0) {
      lines.push('提示:');
      for (const hint of prompt.hints) {
        lines.push(`- ${hint}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  // 格式式学习洞察
  formatInsight(insight: LearningInsight): string {
    const lines: string[] = [];

    lines.push(`## 学习洞察: ${insight.topic}`);
    lines.push('');
    lines.push(insight.description);
    lines.push('');

    if (insight.examples.length > 0) {
      lines.push('### 示例');
      lines.push('');
      for (const example of insight.examples) {
        lines.push('```');
        lines.push(example);
        lines.push('```');
        lines.push('');
      }
    }

    if (insight.bestPractices.length > 0) {
      lines.push('### 最佳实践');
      lines.push('');
      for (const practice of insight.bestPractices) {
        lines.push(`- ${practice}`);
      }
    }

    return lines.join('\n');
  }

  // 生成会话 ID
  private generateSessionId(): string {
    return `learning-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  // 获取当前会话
  getCurrentSession(): LearningSession | null {
    return this.currentSession;
  }

  // 获取配置
  getConfig(): LearningConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(config: Partial<LearningConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 检查是否启用
  isEnabled(): boolean {
    return this.config.enabled;
  }

  // 启用
  enable(): void {
    this.config.enabled = true;
  }

  // 禁用
  disable(): void {
    this.config.enabled = false;
  }
}

export const learningMode = new LearningMode();
