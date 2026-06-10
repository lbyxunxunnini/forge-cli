export type ProjectState = 'empty_new' | 'existing' | 'unknown';

export type TaskMode =
  | 'direct'       // 直通模式
  | 'lightweight'  // 轻量任务
  | 'medium'       // 中等任务
  | 'ui_optimize'  // UI 优化
  | 'architecture' // 架构级
  | 'feature'      // 功能开发
  | 'page'         // 页面开发
  | 'new_project'; // 新项目共创

export type Phase =
  | 'C0' | 'C1' | 'C2' | 'C3'  // 共创轨道
  | 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';  // 执行轨道

export interface TaskClassification {
  mode: TaskMode;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export interface PhaseResult {
  phase: Phase;
  output: string;
  nextPhase?: Phase;
  needsUserInput?: boolean;
  completed?: boolean;
}

export interface WorkflowState {
  projectState: ProjectState;
  currentMode: TaskMode | null;
  currentPhase: Phase | null;
  userConfirmed: boolean;
  designConfirmed: boolean;
}
