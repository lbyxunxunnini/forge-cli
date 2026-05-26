export type ConfidenceLevel = 'critical' | 'major' | 'minor' | 'info';

export interface ConfidenceScore {
  score: number; // 0-100
  level: ConfidenceLevel;
  evidence: string[];
  reasoning: string;
}

export interface ReviewIssue {
  id: string;
  title: string;
  description: string;
  location: {
    file: string;
    line?: number;
    column?: number;
  };
  category: IssueCategory;
  severity: ConfidenceLevel;
  confidence: ConfidenceScore;
  suggestion?: string;
  references?: string[];
}

export type IssueCategory =
  | 'bug'
  | 'performance'
  | 'security'
  | 'maintainability'
  | 'style'
  | 'documentation'
  | 'test'
  | 'accessibility'
  | 'compatibility';

export interface ReviewResult {
  issues: ReviewIssue[];
  summary: {
    total: number;
    critical: number;
    major: number;
    minor: number;
    info: number;
    averageConfidence: number;
  };
  passed: boolean;
}

export interface ReviewConfig {
  confidenceThreshold: number; // 默认 80
  categories: IssueCategory[];
  maxIssues: number;
}
