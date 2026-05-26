export type LearningTrigger =
  | 'decision_point'    // 决策点
  | 'code_review'       // 代码审查后
  | 'error_explanation' // 错误解释后
  | 'concept_intro'     // 概念介绍后
  | 'pattern_detected'; // 模式检测后

export interface LearningPrompt {
  id: string;
  trigger: LearningTrigger;
  message: string;
  codeSnippet?: string;
  expectedLines?: number; // 期望用户贡献的代码行数
  hints?: string[];
}

export interface LearningSession {
  id: string;
  startTime: string;
  prompts: LearningPrompt[];
  userContributions: UserContribution[];
  insights: string[];
}

export interface UserContribution {
  promptId: string;
  code: string;
  timestamp: string;
  quality?: 'good' | 'needs_improvement' | 'incorrect';
  feedback?: string;
}

export interface LearningConfig {
  enabled: boolean;
  frequency: 'always' | 'often' | 'sometimes' | 'rarely';
  minCodeLines: number;
  maxCodeLines: number;
  showHints: boolean;
  trackContributions: boolean;
}

export interface LearningInsight {
  topic: string;
  description: string;
  examples: string[];
  bestPractices: string[];
}
