export type PluginType = 'command' | 'agent' | 'skill' | 'hook' | 'full';

export interface PluginTemplate {
  id: string;
  name: string;
  description: string;
  type: PluginType;
  files: TemplateFile[];
  variables: TemplateVariable[];
}

export interface TemplateFile {
  path: string;
  content: string;
  isTemplate: boolean;
}

export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  default?: unknown;
}

export interface PluginProject {
  name: string;
  path: string;
  type: PluginType;
  template: PluginTemplate;
  variables: Record<string, unknown>;
  createdAt: string;
}

export interface PluginValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  file: string;
  line?: number;
  message: string;
  severity: 'error';
}

export interface ValidationWarning {
  file: string;
  line?: number;
  message: string;
  severity: 'warning';
}

export interface PluginTestResult {
  passed: boolean;
  tests: TestResult[];
  duration: number;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}
