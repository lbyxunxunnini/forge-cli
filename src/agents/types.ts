export type AgentRole =
  | 'controller'
  | 'requirement_analyst'
  | 'ui_designer'
  | 'architecture_designer'
  | 'page_engineer'
  | 'verify_agent';

export interface AgentConfig {
  role: AgentRole;
  name: string;
  description: string;
  systemPrompt: string;
  allowedTools: string[];
  forbiddenTools: string[];
}

export interface AgentResult {
  success: boolean;
  output: string;
  nextAgent?: AgentRole;
  needsUserInput?: boolean;
  error?: string;
}

export interface AgentContext {
  projectRoot: string;
  currentPhase: string;
  currentMode: string;
  userConfirmed: boolean;
  designConfirmed: boolean;
  sessionData: Record<string, unknown>;
}
