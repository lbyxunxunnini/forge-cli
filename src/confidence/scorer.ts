import type {
  ConfidenceScore,
  ConfidenceLevel,
  ReviewIssue,
  ReviewResult,
  ReviewConfig,
  IssueCategory,
} from './types.js';

export class ConfidenceScorer {
  private config: ReviewConfig;

  constructor(config?: Partial<ReviewConfig>) {
    this.config = {
      confidenceThreshold: 80,
      categories: [
        'bug',
        'performance',
        'security',
        'maintainability',
        'style',
        'documentation',
        'test',
        'accessibility',
        'compatibility',
      ],
      maxIssues: 50,
      ...config,
    };
  }

  // 计算置信度分数
  calculateConfidence(params: {
    hasEvidence: boolean;
    evidenceCount: number;
    isVerified: boolean;
    isReproducible: boolean;
    contextQuality: 'high' | 'medium' | 'low';
  }): ConfidenceScore {
    let score = 50; // 基础分
    const evidence: string[] = [];
    let reasoning = '';

    // 有证据
    if (params.hasEvidence) {
      score += 20;
      evidence.push('有明确证据');
    }

    // 证据数量
    if (params.evidenceCount >= 3) {
      score += 15;
      evidence.push(`多处证据 (${params.evidenceCount})`);
    } else if (params.evidenceCount >= 2) {
      score += 10;
      evidence.push(`多处证据 (${params.evidenceCount})`);
    }

    // 已验证
    if (params.isVerified) {
      score += 10;
      evidence.push('已验证');
    }

    // 可复现
    if (params.isReproducible) {
      score += 10;
      evidence.push('可复现');
    }

    // 上下文质量
    switch (params.contextQuality) {
      case 'high':
        score += 10;
        evidence.push('上下文完整');
        break;
      case 'medium':
        score += 5;
        evidence.push('上下文一般');
        break;
      case 'low':
        evidence.push('上下文不足');
        break;
    }

    // 限制分数范围
    score = Math.min(100, Math.max(0, score));

    // 生成推理说明
    reasoning = this.generateReasoning(score, params);

    return {
      score,
      level: this.scoreToLevel(score),
      evidence,
      reasoning,
    };
  }

  // 生成推理说明
  private generateReasoning(score: number, params: {
    hasEvidence: boolean;
    evidenceCount: number;
    isVerified: boolean;
    isReproducible: boolean;
    contextQuality: 'high' | 'medium' | 'low';
  }): string {
    const parts: string[] = [];

    if (score >= 80) {
      parts.push('高置信度');
    } else if (score >= 60) {
      parts.push('中等置信度');
    } else {
      parts.push('低置信度');
    }

    if (!params.hasEvidence) {
      parts.push('缺乏直接证据');
    }

    if (params.evidenceCount < 2) {
      parts.push('证据不足');
    }

    if (!params.isVerified) {
      parts.push('未验证');
    }

    return parts.join('，');
  }

  // 分数转级别
  private scoreToLevel(score: number): ConfidenceLevel {
    if (score >= 90) return 'critical';
    if (score >= 75) return 'major';
    if (score >= 50) return 'minor';
    return 'info';
  }

  // 评估问题
  evaluateIssue(issue: Omit<ReviewIssue, 'confidence'>): ReviewIssue {
    // 根据问题特征计算置信度
    const confidence = this.calculateConfidence({
      hasEvidence: !!issue.description,
      evidenceCount: issue.references?.length || 0,
      isVerified: false,
      isReproducible: true,
      contextQuality: issue.location.line ? 'high' : 'medium',
    });

    return {
      ...issue,
      confidence,
    };
  }

  // 过滤问题
  filterIssues(issues: ReviewIssue[]): ReviewIssue[] {
    return issues
      .filter(issue => issue.confidence.score >= this.config.confidenceThreshold)
      .filter(issue => this.config.categories.includes(issue.category))
      .sort((a, b) => b.confidence.score - a.confidence.score)
      .slice(0, this.config.maxIssues);
  }

  // 生成审查结果
  generateReviewResult(issues: ReviewIssue[]): ReviewResult {
    const filtered = this.filterIssues(issues);

    const summary = {
      total: filtered.length,
      critical: filtered.filter(i => i.severity === 'critical').length,
      major: filtered.filter(i => i.severity === 'major').length,
      minor: filtered.filter(i => i.severity === 'minor').length,
      info: filtered.filter(i => i.severity === 'info').length,
      averageConfidence: filtered.length > 0
        ? Math.round(filtered.reduce((sum, i) => sum + i.confidence.score, 0) / filtered.length)
        : 0,
    };

    return {
      issues: filtered,
      summary,
      passed: summary.critical === 0 && summary.major === 0,
    };
  }

  // 格式式审查结果
  formatReviewResult(result: ReviewResult): string {
    const lines: string[] = [];

    lines.push('## 代码审查结果');
    lines.push('');

    if (result.issues.length === 0) {
      lines.push('未发现问题');
      return lines.join('\n');
    }

    lines.push(`发现 ${result.summary.total} 个问题：`);
    lines.push('');

    // 按严重性分组
    const grouped = this.groupBySeverity(result.issues);

    for (const [severity, issues] of Object.entries(grouped)) {
      if (issues.length === 0) continue;

      lines.push(`### ${this.severityToChinese(severity as ConfidenceLevel)} (${issues.length})`);
      lines.push('');

      for (const issue of issues) {
        lines.push(`- **${issue.title}** (置信度: ${issue.confidence.score})`);
        lines.push(`  ${issue.description}`);
        if (issue.location.file) {
          lines.push(`  位置: ${issue.location.file}${issue.location.line ? `:${issue.location.line}` : ''}`);
        }
        if (issue.suggestion) {
          lines.push(`  建议: ${issue.suggestion}`);
        }
        lines.push('');
      }
    }

    // 统计信息
    lines.push('### 统计');
    lines.push(`- 平均置信度: ${result.summary.averageConfidence}`);
    lines.push(`- 严重问题: ${result.summary.critical}`);
    lines.push(`- 主要问题: ${result.summary.major}`);
    lines.push(`- 次要问题: ${result.summary.minor}`);
    lines.push(`- 信息: ${result.summary.info}`);

    return lines.join('\n');
  }

  // 按严重性分组
  private groupBySeverity(issues: ReviewIssue[]): Record<string, ReviewIssue[]> {
    const groups: Record<string, ReviewIssue[]> = {
      critical: [],
      major: [],
      minor: [],
      info: [],
    };

    for (const issue of issues) {
      groups[issue.severity].push(issue);
    }

    return groups;
  }

  // 严重性转中文
  private severityToChinese(severity: ConfidenceLevel): string {
    const map: Record<ConfidenceLevel, string> = {
      critical: '严重问题',
      major: '主要问题',
      minor: '次要问题',
      info: '信息',
    };
    return map[severity];
  }

  // 更新配置
  updateConfig(config: Partial<ReviewConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  getConfig(): ReviewConfig {
    return { ...this.config };
  }
}

export const confidenceScorer = new ConfidenceScorer();
