export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityPattern {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: SecuritySeverity;
  category: SecurityCategory;
  message: string;
  suggestion?: string;
}

export type SecurityCategory =
  | 'command_injection'
  | 'path_traversal'
  | 'xss'
  | 'sql_injection'
  | 'code_injection'
  | 'file_operation'
  | 'credential_exposure'
  | 'dangerous_config'
  | 'unsafe_deserialization';

export interface SecurityCheckResult {
  passed: boolean;
  issues: SecurityIssue[];
  score: number; // 0-100, 100 = 最安全
}

export interface SecurityIssue {
  pattern: SecurityPattern;
  match: string;
  location?: string;
  context?: string;
}

export interface SecurityConfig {
  enabled: boolean;
  severityThreshold: SecuritySeverity;
  categories: SecurityCategory[];
  customPatterns: SecurityPattern[];
}
