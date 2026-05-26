import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

export type SessionState =
  | 'init'
  | 'routing'
  | 'waiting'
  | 'executing'
  | 'paused'
  | 'completed'
  | 'failed';

export type SessionMode =
  | 'direct'
  | 'lightweight'
  | 'medium'
  | 'ui_optimize'
  | 'architecture'
  | 'feature'
  | 'page'
  | 'new_project';

export interface SessionData {
  id: string;
  state: SessionState;
  mode: SessionMode | null;
  phase: string;
  activeAgent: string;
  projectRoot: string;
  userInput: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
  history: Array<{
    timestamp: string;
    action: string;
    agent: string;
    output: string;
  }>;
}

const SESSION_DIR = join(homedir(), '.flutter-forge', 'sessions');

export class SessionManager {
  private session: SessionData | null = null;
  private sessionPath: string | null = null;

  // 初始化 session
  init(projectRoot: string, userInput: string): SessionData {
    const id = this.generateId();
    const now = new Date().toISOString();

    this.session = {
      id,
      state: 'init',
      mode: null,
      phase: 'S0',
      activeAgent: 'controller',
      projectRoot: resolve(projectRoot),
      userInput,
      createdAt: now,
      updatedAt: now,
      metadata: {},
      history: [],
    };

    this.sessionPath = join(SESSION_DIR, `${id}.yaml`);
    this.save();

    return this.session;
  }

  // 加载 session
  load(sessionId: string): SessionData | null {
    const sessionPath = join(SESSION_DIR, `${sessionId}.yaml`);
    if (!existsSync(sessionPath)) {
      return null;
    }

    try {
      const content = readFileSync(sessionPath, 'utf-8');
      this.session = parseYaml(content) as SessionData;
      this.sessionPath = sessionPath;
      return this.session;
    } catch {
      return null;
    }
  }

  // 保存 session
  save(): void {
    if (!this.session || !this.sessionPath) {
      return;
    }

    this.session.updatedAt = new Date().toISOString();

    const dir = this.sessionPath.replace(/[^/\\]+$/, '');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const content = stringifyYaml(this.session);
    writeFileSync(this.sessionPath, content, 'utf-8');
  }

  // 获取当前 session
  get(): SessionData | null {
    return this.session;
  }

  // 更新状态
  setState(state: SessionState): void {
    if (this.session) {
      this.session.state = state;
      this.save();
    }
  }

  // 更新模式
  setMode(mode: SessionMode): void {
    if (this.session) {
      this.session.mode = mode;
      this.save();
    }
  }

  // 更新阶段
  setPhase(phase: string): void {
    if (this.session) {
      this.session.phase = phase;
      this.save();
    }
  }

  // 更新活跃 Agent
  setActiveAgent(agent: string): void {
    if (this.session) {
      this.session.activeAgent = agent;
      this.save();
    }
  }

  // 添加历史记录
  addHistory(action: string, agent: string, output: string): void {
    if (this.session) {
      this.session.history.push({
        timestamp: new Date().toISOString(),
        action,
        agent,
        output,
      });
      this.save();
    }
  }

  // 设置元数据
  setMetadata(key: string, value: unknown): void {
    if (this.session) {
      this.session.metadata[key] = value;
      this.save();
    }
  }

  // 获取元数据
  getMetadata(key: string): unknown {
    return this.session?.metadata[key];
  }

  // 等待用户输入
  waitForInput(): void {
    this.setState('waiting');
  }

  // 恢复执行
  resume(): void {
    this.setState('executing');
  }

  // 完成
  complete(): void {
    this.setState('completed');
  }

  // 失败
  fail(): void {
    this.setState('failed');
  }

  // 生成 ID
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ff-${timestamp}-${random}`;
  }

  // 列出所有 session
  static list(): SessionData[] {
    if (!existsSync(SESSION_DIR)) {
      return [];
    }

    const { readdirSync } = require('fs');
    const files = readdirSync(SESSION_DIR).filter((f: string) => f.endsWith('.yaml'));
    const sessions: SessionData[] = [];

    for (const file of files) {
      try {
        const content = readFileSync(join(SESSION_DIR, file), 'utf-8');
        sessions.push(parseYaml(content) as SessionData);
      } catch {
        // 跳过损坏的 session
      }
    }

    return sessions.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}

export const sessionManager = new SessionManager();
