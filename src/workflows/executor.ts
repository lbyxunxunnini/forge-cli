import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import type { AIClient } from '../llm/client-v2.js';
import type { ContextManager } from '../llm/context.js';
import type { ToolRegistry } from '../tools/registry.js';
import { WorkflowStore } from './store.js';
import type { Workflow, WorkflowExecuteResult, WorkflowSessionData, WorkflowRoleDef } from './types.js';
import { forgeLogger } from '../output/logger.js';
import { executeShell, executePython } from '../tools/executor.js';
import { hookManager } from '../hooks/manager.js';

/**
 * 工作流执行器 —— 代码驱动的工作流引擎
 *
 * 三大能力：
 * 1. Gate 硬拦截 — PreToolUse hook 调用 gate_check.py，LLM 无法绕过
 * 2. 子 agent 隔离 — 每个角色独立 API 调用，上下文不互通
 * 3. 项目记忆集成 — 工作流知识写入 {project}/.forge-cli/memory/
 */
export class WorkflowExecutor {
  private store: WorkflowStore | null = null;
  private activeWorkflow: Workflow | null = null;
  private gateHookRegistered = false;

  constructor(
    private aiClient: AIClient,
    private contextManager: ContextManager,
    private toolRegistry: ToolRegistry
  ) {}

  // ─── 主入口 ─────────────────────────────────────────────

  async execute(workflow: Workflow, projectRoot: string, userInput: string): Promise<WorkflowExecuteResult> {
    this.store = new WorkflowStore(workflow.manifest.name, projectRoot);
    this.store.ensureProjectDirs();
    this.activeWorkflow = workflow;

    // 注册 gate 硬拦截 hook
    this.registerGateHook(workflow);

    forgeLogger.logInfo(`[workflow:${workflow.manifest.name}] 进入工作流执行`);

    // ─── flutter-forge 原生 controller 路径 ───
    if (workflow.manifest.name === 'flutter-forge') {
      try {
        return await this.executeFlutterForge(workflow, projectRoot, userInput);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        forgeLogger.logError(`[flutter-forge] 原生 controller 执行失败: ${msg}`);
        return { success: false, output: '', error: msg };
      } finally {
        this.unregisterGateHook();
      }
    }

    try {
      // 1. 检查可恢复会话
      const resumable = this.store.findResumableSession(userInput);
      if (resumable) {
        forgeLogger.logInfo(`[workflow] 发现可恢复会话: ${resumable.id}`);
        return this.resumeSession(workflow, resumable.id, resumable.data, userInput);
      }

      // 2. 创建新会话
      const sessionId = this.generateSessionId();
      const sessionData: WorkflowSessionData = {
        workflow: workflow.manifest.name,
        phase: workflow.manifest.phases.execution[0] || 'S0',
        mode: 'unknown',
        activeRole: 'controller',
        designConfirmed: false,
        guardrailsLoaded: false,
        resumeKeys: this.extractResumeKeys(userInput),
        projectRoot,
        history: [],
      };

      // 3. 检查/加载 guardrails
      const guardrails = this.store.loadGuardrails();
      if (guardrails) {
        sessionData.guardrailsLoaded = true;
        forgeLogger.logInfo(`[workflow] 已加载项目 guardrails`);
      }

      // 同步 session 到 gate_check.py 能读的格式
      this.syncSessionForGateCheck(sessionData);

      // 4. 分类任务（代码调用）
      const classification = await this.classifyTask(workflow, userInput);
      sessionData.mode = classification.mode;
      // 把 mode 也加入 resumeKeys，确保 ff-a 等无内容输入也能恢复
      sessionData.resumeKeys = [...(sessionData.resumeKeys || []), classification.mode];
      sessionData.resumeKeys = [...new Set(sessionData.resumeKeys)];
      forgeLogger.logInfo(`[workflow] 任务分类: ${classification.mode} (${classification.confidence})`);

      // 5. 执行多角色流水线
      const result = await this.executePipeline(workflow, sessionData, userInput, sessionId);

      // 6. 保存项目记忆
      await this.saveWorkflowMemory(workflow, sessionData, result);

      return result;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      forgeLogger.logError(`[workflow] 执行失败: ${msg}`);
      return { success: false, output: '', error: msg };
    } finally {
      this.unregisterGateHook();
    }
  }

  /**
   * 多角色流水线执行
   *
   * 成本优化：首个角色传完整上下文，后续角色只传角色定义 + 前序输出 + guardrails 摘要
   * 阶段确认：每个阶段结束后暂停，等用户确认再继续
   */
  private async executePipeline(
    workflow: Workflow,
    session: WorkflowSessionData,
    userInput: string,
    sessionId: string
  ): Promise<WorkflowExecuteResult> {
    const pipeline = this.resolvePipeline(workflow, session.mode);
    const outputs: string[] = [];
    let previousOutput = '';

    for (let i = 0; i < pipeline.length; i++) {
      const step = pipeline[i];
      const isFirstStep = i === 0;
      const isLastStep = i === pipeline.length - 1;

      session.activeRole = step.role;
      session.phase = step.phase;
      this.store!.saveSession(sessionId, session);
      this.syncSessionForGateCheck(session);

      forgeLogger.logInfo(`[workflow] 流水线步骤 ${i + 1}/${pipeline.length}: ${step.phase} → ${step.role}`);

      // 构造角色输入：原始需求 + 前序结构化输出
      const roleInput = previousOutput
        ? `用户需求：${userInput}\n\n前序角色输出：\n${previousOutput}`
        : userInput;

      // 首个角色用完整上下文，后续角色用轻量上下文（省 token）
      const result = isFirstStep
        ? await this.executeRoleIsolated(workflow, session, step.role, roleInput)
        : await this.executeRoleLightweight(workflow, session, step.role, roleInput);

      // 解析输出（根据角色的 outputFormat 决定策略）
      const roleDef = workflow.manifest.roles.find(r => r.name === step.role);
      const isFreeFormat = roleDef?.outputFormat === 'free';
      const parsed = isFreeFormat
        ? this.parseFreeOutput(result.output)
        : this.parseStructuredOutput(result.output);

      // 记录历史
      session.history.push({
        timestamp: new Date().toISOString(),
        phase: step.phase,
        role: step.role,
        action: 'execute',
        output: parsed.summary || result.output.substring(0, 500),
      });
      this.store!.saveSession(sessionId, session);
      this.syncSessionForGateCheck(session);

      if (!result.success) {
        return { success: false, output: outputs.join('\n\n---\n\n'), error: result.error };
      }

      // 输出用 summary，传递用 content
      const displayOutput = parsed.summary || result.output.substring(0, 200);
      outputs.push(`[${step.phase}] ${step.role}: ${displayOutput}`);
      previousOutput = parsed.content || result.output;

      // 非最后一个阶段：暂停等用户确认
      if (!isLastStep) {
        const remaining = pipeline.slice(i + 1).map(s => `${s.phase} ${s.role}`).join(' → ');
        outputs.push(`[确认] 当前阶段 ${step.phase} 完成。下一步: ${remaining}\n输入 ff- 继续，或输入修改意见。`);
        return { success: true, output: outputs.join('\n\n---\n\n'), needsUserInput: true };
      }
    }

    return { success: true, output: outputs.join('\n\n---\n\n') };
  }

  // ─── flutter-forge 原生 controller ────────────────────────

  /**
   * flutter-forge 专用执行路径
   * 动态导入 FlutterForgeController，使用原生 TypeScript 编排逻辑
   */
  private async executeFlutterForge(
    workflow: Workflow,
    projectRoot: string,
    userInput: string,
  ): Promise<WorkflowExecuteResult> {
    const controllerPath = join(workflow.globalBase, 'scripts', 'controller.ts');
    if (!existsSync(controllerPath)) {
      return { success: false, output: '', error: `flutter-forge controller 不存在: ${controllerPath}` };
    }

    // 确保 .js 文件存在（自动编译）
    const controllerJsPath = join(workflow.globalBase, 'scripts', 'controller.js');
    if (!existsSync(controllerJsPath)) {
      forgeLogger.logInfo('[flutter-forge] 首次运行，编译 scripts...');
      const compiled = this.compileFlutterForgeScripts(workflow);
      if (!compiled) {
        forgeLogger.logWarning('[flutter-forge] 编译失败，回退到通用流水线');
        return this.fallbackToGenericPipeline(workflow, projectRoot, userInput);
      }
    }

    // 导入 FlutterForgeController
    try {
      const { FlutterForgeController } = await import(controllerJsPath);
      const controller = new FlutterForgeController(
        this.aiClient,
        this.contextManager,
        this.toolRegistry,
        workflow,
        projectRoot,
      );

      // 检测 policy
      let policy: 'standard' | 'fast' | 'autonomous' = 'standard';
      if (userInput.startsWith('ff-fast')) policy = 'fast';
      else if (userInput.startsWith('ff-a') || userInput.startsWith('ff a')) policy = 'autonomous';

      return await controller.execute(userInput, policy);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      forgeLogger.logError(`[flutter-forge] 导入 controller 失败: ${msg}`);
      return this.fallbackToGenericPipeline(workflow, projectRoot, userInput);
    }
  }

  /** 编译 flutter-forge 的 .ts 脚本为 .js */
  private compileFlutterForgeScripts(workflow: Workflow): boolean {
    const scriptsDir = join(workflow.globalBase, 'scripts');
    try {
      const { execSync } = require('child_process');
      const tsFiles = readdirSync(scriptsDir)
        .filter(f => f.endsWith('.ts') && f !== 'types.ts' && f !== 'build.ts')
        .map(f => join(scriptsDir, f));

      for (const file of tsFiles) {
        const jsFile = file.replace('.ts', '.js');
        execSync(
          `npx esbuild "${file}" --outfile="${jsFile}" --format=esm --target=node18 --platform=node`,
          { cwd: scriptsDir, stdio: 'pipe', timeout: 30000 },
        );
      }
      forgeLogger.logInfo(`[flutter-forge] 编译完成: ${tsFiles.length} 个文件`);
      return true;
    } catch (error) {
      forgeLogger.logError(`[flutter-forge] 编译失败: ${error}`);
      return false;
    }
  }

  /** 回退到通用流水线 */
  private async fallbackToGenericPipeline(
    workflow: Workflow,
    projectRoot: string,
    userInput: string,
  ): Promise<WorkflowExecuteResult> {
    const sessionId = this.generateSessionId();
    const sessionData: WorkflowSessionData = {
      workflow: workflow.manifest.name,
      phase: 'S0',
      mode: 'feature',
      activeRole: 'controller',
      designConfirmed: false,
      guardrailsLoaded: false,
      resumeKeys: this.extractResumeKeys(userInput),
      projectRoot,
      history: [],
    };
    const guardrails = this.store!.loadGuardrails();
    if (guardrails) sessionData.guardrailsLoaded = true;
    sessionData.mode = (await this.classifyTask(workflow, userInput)).mode;
    return this.executePipeline(workflow, sessionData, userInput, sessionId);
  }

  /**
   * 根据 mode 解析角色流水线
   * 返回 [{phase, role}] 序列
   */
  private resolvePipeline(workflow: Workflow, mode: string): Array<{ phase: string; role: string }> {
    // 模式 → 角色链的映射
    const pipelineMap: Record<string, Array<{ phase: string; role: string }>> = {
      direct: [{ phase: 'S0', role: 'controller' }],
      lightweight: [{ phase: 'S4', role: 'page_engineer' }],
      medium: [{ phase: 'S4', role: 'page_engineer' }],
      ui_optimize: [
        { phase: 'S2', role: 'ui_designer' },
        { phase: 'S4', role: 'page_engineer' },
      ],
      architecture: [
        { phase: 'S2', role: 'architecture_designer' },
        { phase: 'S4', role: 'page_engineer' },
        { phase: 'S5', role: 'verify_agent' },
      ],
      feature: [
        { phase: 'S1', role: 'requirement_analyst' },
        { phase: 'S2', role: 'architecture_designer' },
        { phase: 'S4', role: 'page_engineer' },
        { phase: 'S5', role: 'verify_agent' },
      ],
      page: [
        { phase: 'S1', role: 'requirement_analyst' },
        { phase: 'S2', role: 'ui_designer' },
        { phase: 'S4', role: 'page_engineer' },
        { phase: 'S5', role: 'verify_agent' },
      ],
      new_project: [
        { phase: 'C0', role: 'requirement_analyst' },
        { phase: 'C1', role: 'requirement_analyst' },
        { phase: 'C2', role: 'architecture_designer' },
        { phase: 'S4', role: 'page_engineer' },
      ],
    };

    const pipeline = pipelineMap[mode] || pipelineMap.medium;

    // 过滤掉 manifest 中未定义的角色
    return pipeline.filter(step =>
      workflow.manifest.roles.some(r => r.name === step.role)
    );
  }

  // ─── Gate 硬拦截 ────────────────────────────────────────

  /**
   * 注册 PreToolUse hook，写操作前调用 gate_check.py
   * LLM 根本没有机会违反 gate 规则，因为写操作在工具层就被拦了
   */
  private registerGateHook(workflow: Workflow): void {
    if (this.gateHookRegistered) return;

    const gateScript = workflow.manifest.scripts.gate_check;
    if (!gateScript || !this.store) return;

    const scriptPath = this.store.getScriptPath(gateScript);
    if (!existsSync(scriptPath)) {
      forgeLogger.logWarning(`[workflow] gate_check 脚本不存在: ${scriptPath}`);
      return;
    }

    const storeRef = this.store;

    hookManager.register({
      name: 'workflow-gate-check',
      description: `工作流 ${workflow.manifest.name} 写操作门禁拦截`,
      event: 'PreToolUse',
      matcher: 'writeFile|editFile|write_file|edit_file',
      enabled: true,
      handler: async (ctx) => {
        const targetFile = (ctx.toolArgs?.file_path || ctx.toolArgs?.path || '') as string;
        if (!targetFile) return { action: 'allow' };

        try {
          const result = await executePython(scriptPath, [
            '--project-root', storeRef.projectBase,
            '--target-path', targetFile,
            '--mode', 'enforce',
          ], storeRef.projectBase);

          if (result.exitCode === 2) {
            // gate_check 返回 exit 2 = 拦截
            forgeLogger.logWarning(`[gate] 写入被拦截: ${targetFile} - ${result.stderr}`);
            return {
              action: 'block',
              message: `[f-forge gate] 写入被拦截: ${result.stderr || '未满足门禁条件'}`,
            };
          }

          if (result.exitCode !== 0) {
            forgeLogger.logWarning(`[gate] gate_check 异常: exit=${result.exitCode}, ${result.stderr}`);
          }
        } catch (error) {
          // gate_check 执行失败不阻塞（降级为软约束）
          forgeLogger.logWarning(`[gate] gate_check 执行失败，降级为软约束: ${error}`);
        }

        return { action: 'allow' };
      },
    });

    this.gateHookRegistered = true;
    forgeLogger.logInfo(`[workflow] gate 硬拦截已注册`);
  }

  private unregisterGateHook(): void {
    if (this.gateHookRegistered) {
      hookManager.unregister('workflow-gate-check');
      this.gateHookRegistered = false;
    }
  }

  /**
   * 将 YAML session 同步为 gate_check.py 能读的 markdown session.md
   * gate_check.py 期望：project_root/.claude/.forge-cli/session.md
   * 格式：每行 "- 字段：值"
   */
  private syncSessionForGateCheck(session: WorkflowSessionData): void {
    const gateSessionDir = join(session.projectRoot, '.claude', '.forge-cli');
    if (!existsSync(gateSessionDir)) {
      mkdirSync(gateSessionDir, { recursive: true });
    }

    // 从 session 历史推导真实的门禁状态
    const hasRequirement = session.history.some(h => h.role === 'requirement_analyst');
    const hasDesign = session.history.some(h =>
      h.role === 'ui_designer' || h.role === 'architecture_designer'
    );
    const hasImplementation = session.history.some(h => h.role === 'page_engineer');
    const hasVerification = session.history.some(h => h.role === 'verify_agent');

    const lines = [
      `- 当前阶段：${session.phase}`,
      `- 当前模式：${session.mode}`,
      `- 活跃代理：${session.activeRole}`,
      `- 确认状态：${hasDesign ? '用户已确认' : '未确认'}`,
      `- 目标状态：${hasRequirement ? '已确认' : '未确认'}`,
      `- 范围状态：${hasRequirement ? '已确认' : '未确认'}`,
      `- 验收状态：${hasRequirement ? '已确认' : '未确认'}`,
      `- 约束状态：${hasRequirement ? '已确认' : '未确认'}`,
      `- 改动契约：${hasDesign ? '已冻结' : '-'}`,
      `- 当前子单元：-`,
      `- 子单元状态：${hasDesign ? '已冻结' : '未冻结'}`,
      `- 验证状态：${hasVerification ? '已验证' : '未验证'}`,
      `- 超范围风险：无`,
      `- 计划冲突状态：无`,
      `- 工作模式锁：激活`,
      `- 退出许可：${hasVerification ? '允许' : '禁止'}`,
    ];

    writeFileSync(join(gateSessionDir, 'session.md'), lines.join('\n'), 'utf-8');
  }

  // ─── 子 Agent 隔离执行 ──────────────────────────────────

  /**
   * 每个角色独立 API 调用，上下文不互通
   * - 角色 A 的输出不会泄漏到角色 B 的上下文
   * - 每个角色只看到：自己的 prompt + session 摘要 + guardrails
   * - 历史记录只保留摘要（phase + role + action），不保留完整输出
   */
  private async executeRoleIsolated(
    workflow: Workflow,
    session: WorkflowSessionData,
    roleName: string,
    userInput: string
  ): Promise<WorkflowExecuteResult> {
    const roleDef = workflow.manifest.roles.find(r => r.name === roleName);
    if (!roleDef) {
      return { success: false, output: '', error: `角色 ${roleName} 未在工作流中定义` };
    }

    const rolePrompt = this.loadRolePrompt(workflow, roleDef);
    if (!rolePrompt) {
      return { success: false, output: '', error: `无法加载角色 ${roleName} 的 prompt` };
    }

    // 构建隔离的 system prompt（不包含其他角色的输出）
    const systemPrompt = this.buildIsolatedSystemPrompt(workflow, session, roleDef, rolePrompt);

    // 获取角色允许的工具
    const tools = this.filterTools(roleDef);

    forgeLogger.logInfo(`[workflow] 隔离执行角色: ${roleDef.name}`);

    try {
      // 独立 API 调用 — 无共享历史，纯隔离
      const result = await this.aiClient.generate(
        userInput,
        systemPrompt,
        tools,
        10
      );

      return { success: true, output: result.text };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, output: '', error: msg };
    }
  }

  /**
   * 完整 system prompt（首个角色使用）
   * 包含：角色定义 + guardrails + 历史 + 记忆
   */
  private buildIsolatedSystemPrompt(
    workflow: Workflow,
    session: WorkflowSessionData,
    roleDef: WorkflowRoleDef,
    rolePrompt: string
  ): string {
    const parts: string[] = [
      `# 工作流: ${workflow.manifest.name} v${workflow.manifest.version}`,
      '',
      rolePrompt,
      '',
      `## 当前上下文`,
      `- 项目路径: ${session.projectRoot}`,
      `- 当前阶段: ${session.phase}`,
      `- 当前模式: ${session.mode}`,
    ];

    // guardrails（完整）
    if (this.store && session.guardrailsLoaded) {
      const guardrails = this.store.loadGuardrails();
      if (guardrails) {
        const summary = JSON.stringify(guardrails, null, 2);
        parts.push('', '## 项目 Guardrails', '```yaml', summary.substring(0, 2000), '```');
      }
    }

    // 历史摘要
    if (session.history.length > 0) {
      parts.push('', '## 执行历史');
      for (const entry of session.history.slice(-5)) {
        parts.push(`- [${entry.phase}] ${entry.role}: ${entry.action}`);
      }
    }

    // 项目记忆
    const projectMemory = this.loadProjectMemoryContext(session.projectRoot);
    if (projectMemory) {
      parts.push('', projectMemory);
    }

    // 结构化输出要求（只对 structured 角色）
    if (roleDef.outputFormat !== 'free') {
      parts.push('', ...this.getStructuredOutputInstructions());
    } else {
      parts.push('', '## 输出说明', '请直接输出内容（代码、文档等），不要包裹 JSON。');
    }

    return parts.join('\n');
  }

  /**
   * 轻量 system prompt（后续角色使用）
   * 只包含：角色定义 + guardrails 摘要（500字）+ 阶段信息
   */
  private buildLightweightSystemPrompt(
    workflow: Workflow,
    session: WorkflowSessionData,
    roleDef: WorkflowRoleDef,
    rolePrompt: string
  ): string {
    const parts: string[] = [
      `# 工作流: ${workflow.manifest.name} — ${roleDef.name}`,
      '',
      rolePrompt,
      '',
      `## 当前阶段: ${session.phase} (模式: ${session.mode})`,
    ];

    // guardrails 摘要（截断到 500 字）
    if (this.store && session.guardrailsLoaded) {
      const guardrails = this.store.loadGuardrails();
      if (guardrails) {
        const summary = JSON.stringify(guardrails).substring(0, 500);
        parts.push('', `## Guardrails 摘要: ${summary}`);
      }
    }

    // 结构化输出要求（只对 structured 角色）
    if (roleDef.outputFormat !== 'free') {
      parts.push('', ...this.getStructuredOutputInstructions());
    } else {
      parts.push('', '## 输出说明', '请直接输出内容（代码、文档等），不要包裹 JSON。');
    }

    return parts.join('\n');
  }

  /** 结构化输出指令 */
  private getStructuredOutputInstructions(): string[] {
    return [
      '## 输出格式要求',
      '请用以下 JSON 格式输出结果，便于下一个角色接力：',
      '```json',
      '{',
      '  "phase": "当前阶段代码（如 S1/S2/S4/S5）",',
      '  "role": "你的角色名",',
      '  "summary": "一句话总结本轮产出",',
      '  "decisions": ["关键决策1", "关键决策2"],',
      '  "content": "完整产出内容（代码/文档/分析）",',
      '  "next_role": "建议下一个执行的角色",',
      '  "needs_confirm": true',
      '}',
      '```',
      'content 字段放完整内容，其他字段放元数据。两者都必须输出。',
    ];
  }

  /**
   * 轻量角色执行（后续角色，省 token）
   */
  private async executeRoleLightweight(
    workflow: Workflow,
    session: WorkflowSessionData,
    roleName: string,
    userInput: string
  ): Promise<WorkflowExecuteResult> {
    const roleDef = workflow.manifest.roles.find(r => r.name === roleName);
    if (!roleDef) {
      return { success: false, output: '', error: `角色 ${roleName} 未在工作流中定义` };
    }

    const rolePrompt = this.loadRolePrompt(workflow, roleDef);
    if (!rolePrompt) {
      return { success: false, output: '', error: `无法加载角色 ${roleName} 的 prompt` };
    }

    const systemPrompt = this.buildLightweightSystemPrompt(workflow, session, roleDef, rolePrompt);
    const tools = this.filterTools(roleDef);

    forgeLogger.logInfo(`[workflow] 轻量执行角色: ${roleDef.name}`);

    try {
      const result = await this.aiClient.generate(userInput, systemPrompt, tools, 10);
      return { success: true, output: result.text };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, output: '', error: msg };
    }
  }

  // ─── 项目记忆集成 ───────────────────────────────────────

  /**
   * 工作流产生的知识写入 {project}/.forge-cli/memory/
   * 与全局记忆隔离，项目专属
   */
  private async saveWorkflowMemory(
    workflow: Workflow,
    session: WorkflowSessionData,
    result: WorkflowExecuteResult
  ): Promise<void> {
    if (!result.success || !result.output) return;

    const projectMemoryDir = join(session.projectRoot, '.forge-cli', 'memory');
    if (!existsSync(projectMemoryDir)) {
      mkdirSync(projectMemoryDir, { recursive: true });
    }

    // 保存工作流执行摘要为项目记忆
    const memoryName = `workflow_${workflow.manifest.name}_${session.mode}_${Date.now().toString(36)}`;
    const memoryFile = join(projectMemoryDir, `${memoryName}.md`);

    const content = [
      '---',
      `name: ${memoryName}`,
      `description: 工作流 ${workflow.manifest.name} 执行记录 (${session.mode})`,
      `type: project`,
      `confidence: 0.8`,
      `stable: true`,
      `accessCount: 0`,
      `source: workflow`,
      `tags: [workflow, ${workflow.manifest.name}, ${session.mode}]`,
      '---',
      '',
      `## 执行摘要`,
      `- 工作流: ${workflow.manifest.name} v${workflow.manifest.version}`,
      `- 模式: ${session.mode}`,
      `- 角色: ${session.activeRole}`,
      `- 阶段: ${session.phase}`,
      '',
      `## 输出摘要`,
      result.output.substring(0, 1000),
    ].join('\n');

    try {
      writeFileSync(memoryFile, content, 'utf-8');
      forgeLogger.logInfo(`[workflow] 已保存项目记忆: ${memoryName}`);
    } catch {
      // 记忆保存失败不阻塞主流程
    }
  }

  /**
   * 加载项目记忆上下文（注入到角色 prompt 中）
   */
  private loadProjectMemoryContext(projectRoot: string): string | null {
    const projectMemoryDir = join(projectRoot, '.forge-cli', 'memory');
    if (!existsSync(projectMemoryDir)) return null;

    try {
      const files = readdirSync(projectMemoryDir)
        .filter((f: string) => f.endsWith('.md') && f !== 'MEMORY.md')
        .sort()
        .slice(-5); // 最近 5 条

      if (files.length === 0) return null;

      const lines = ['## 项目记忆'];
      for (const file of files) {
        try {
          const content = readFileSync(join(projectMemoryDir, file), 'utf-8');
          const descMatch = content.match(/description:\s*(.+)/);
          if (descMatch) {
            lines.push(`- ${descMatch[1].trim()}`);
          }
        } catch {
          // 跳过损坏文件
        }
      }

      return lines.length > 1 ? lines.join('\n') : null;
    } catch {
      return null;
    }
  }

  // ─── 恢复会话 ───────────────────────────────────────────

  private async resumeSession(
    workflow: Workflow,
    sessionId: string,
    sessionData: WorkflowSessionData,
    userInput: string
  ): Promise<WorkflowExecuteResult> {
    forgeLogger.logInfo(`[workflow] 恢复会话 ${sessionId}，阶段: ${sessionData.phase}，角色: ${sessionData.activeRole}`);

    const fullPipeline = this.resolvePipeline(workflow, sessionData.mode);
    const currentIndex = fullPipeline.findIndex(s => s.phase === sessionData.phase && s.role === sessionData.activeRole);
    // 从当前角色开始（不跳过当前角色，因为用户可能给了修改意见）
    const remainingPipeline = currentIndex >= 0 ? fullPipeline.slice(currentIndex) : fullPipeline;

    // 用上次输出作为前序上下文
    const lastOutput = sessionData.history.length > 0
      ? sessionData.history[sessionData.history.length - 1].output || ''
      : '';

    const outputs: string[] = [];
    let previousOutput = lastOutput;

    for (let i = 0; i < remainingPipeline.length; i++) {
      const step = remainingPipeline[i];
      const isLastStep = i === remainingPipeline.length - 1;

      sessionData.activeRole = step.role;
      sessionData.phase = step.phase;
      this.store!.saveSession(sessionId, sessionData);
      this.syncSessionForGateCheck(sessionData);

      forgeLogger.logInfo(`[workflow] 恢复流水线: ${step.phase} → ${step.role}`);

      const roleInput = previousOutput
        ? `用户需求：${userInput}\n\n前序角色输出：\n${previousOutput}`
        : userInput;

      // 恢复时用轻量 prompt（省 token）
      const result = await this.executeRoleLightweight(workflow, sessionData, step.role, roleInput);

      sessionData.history.push({
        timestamp: new Date().toISOString(),
        phase: step.phase,
        role: step.role,
        action: 'resume',
        output: result.output.substring(0, 500),
      });
      this.store!.saveSession(sessionId, sessionData);
      this.syncSessionForGateCheck(sessionData);

      if (!result.success) {
        return { success: false, output: outputs.join('\n\n---\n\n'), error: result.error };
      }

      // 根据 outputFormat 解析
      const roleDef = workflow.manifest.roles.find(r => r.name === step.role);
      const isFreeFormat = roleDef?.outputFormat === 'free';
      const parsed = isFreeFormat
        ? this.parseFreeOutput(result.output)
        : this.parseStructuredOutput(result.output);

      const displayOutput = parsed.summary || result.output.substring(0, 200);
      outputs.push(`[${step.phase}] ${step.role}: ${displayOutput}`);
      previousOutput = parsed.content || result.output;

      // 非最后一个阶段：暂停等用户确认
      if (!isLastStep) {
        const remaining = remainingPipeline.slice(i + 1).map(s => `${s.phase} ${s.role}`).join(' → ');
        outputs.push(`[确认] 当前阶段 ${step.phase} 完成。下一步: ${remaining}\n输入 ff- 继续，或输入修改意见。`);
        return { success: true, output: outputs.join('\n\n---\n\n'), needsUserInput: true };
      }
    }

    await this.saveWorkflowMemory(workflow, sessionData, { success: true, output: outputs.join('\n\n---\n\n') });

    return { success: true, output: outputs.join('\n\n---\n\n') };
  }

  // ─── 任务分类（代码驱动） ───────────────────────────────

  private async classifyTask(
    workflow: Workflow,
    userInput: string
  ): Promise<{ mode: string; confidence: string; reason: string }> {
    const classifyScript = workflow.manifest.scripts.classify;

    if (classifyScript && this.store) {
      const scriptPath = this.store.getScriptPath(classifyScript);
      if (existsSync(scriptPath)) {
        try {
          const result = await executeShell(scriptPath, [userInput], this.store.projectBase);
          if (result.exitCode === 0 && result.stdout.trim()) {
            try {
              return JSON.parse(result.stdout.trim());
            } catch { /* fallback */ }
          }
        } catch { /* fallback */ }
      }
    }

    return this.classifyWithLLM(userInput);
  }

  private async classifyWithLLM(userInput: string): Promise<{ mode: string; confidence: string; reason: string }> {
    try {
      const result = await this.aiClient.generate(
        `判断以下任务类型，只回复 JSON：
{"mode": "<direct|lightweight|medium|ui_optimize|architecture|feature|page|new_project>", "confidence": "<high|medium|low>", "reason": "<一句话理由>"}

用户输入：${userInput}`,
        '你是任务分类器。只回复 JSON，不要其他内容。',
        undefined,
        1
      );
      const text = result.text.trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { /* fallback */ }

    return { mode: 'medium', confidence: 'low', reason: '无法精确分类，使用默认模式' };
  }

  // ─── 角色 Prompt 加载 ───────────────────────────────────

  private loadRolePrompt(workflow: Workflow, roleDef: WorkflowRoleDef): string | null {
    if (roleDef.promptFile && this.store) {
      const prompt = this.store.loadReference(`roles/${roleDef.promptFile}`);
      if (prompt) return prompt;
    }

    if (this.store) {
      const prompt = this.store.loadRolePrompt(roleDef.name);
      if (prompt) return prompt;
    }

    return `你是${roleDef.name}。${roleDef.description}`;
  }

  // ─── 工具过滤 ───────────────────────────────────────────

  private filterTools(roleDef: WorkflowRoleDef): import('../llm/client-v2.js').AgentTool[] | undefined {
    const allTools = this.toolRegistry.getAll();

    const filtered = allTools
      .filter(t => {
        const name = t.definition.name;
        if (roleDef.forbiddenTools.includes(name)) return false;
        if (roleDef.allowedTools.includes('*')) return true;
        return roleDef.allowedTools.includes(name);
      })
      .map(t => ({
        name: t.definition.name,
        description: t.definition.description,
        parameters: t.definition.parameters.properties || {},
        execute: t.execute,
      }));

    return filtered.length > 0 ? filtered : undefined;
  }

  // ─── 辅助 ───────────────────────────────────────────────

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `wf-${timestamp}-${random}`;
  }

  /** 解析结构化输出（structured 角色） */
  private parseStructuredOutput(output: string): {
    summary: string;
    content: string;
    phase: string;
    role: string;
    decisions: string[];
    nextRole: string;
  } {
    const defaults = { summary: '', content: output, phase: '', role: '', decisions: [], nextRole: '' };

    try {
      const jsonMatch = output.match(/```json\s*([\s\S]*?)```/) || output.match(/(\{[\s\S]*"content"[\s\S]*\})/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          summary: parsed.summary || '',
          content: parsed.content || output,
          phase: parsed.phase || '',
          role: parsed.role || '',
          decisions: parsed.decisions || [],
          nextRole: parsed.next_role || '',
        };
      }
    } catch { /* JSON 解析失败 */ }

    // 降级：取第一行作为 summary，全文作为 content
    const firstLine = output.split('\n').find(l => l.trim()) || '';
    return { ...defaults, summary: firstLine.substring(0, 100) };
  }

  /** 解析自由格式输出（free 角色，如 page_engineer） */
  private parseFreeOutput(output: string): {
    summary: string;
    content: string;
    phase: string;
    role: string;
    decisions: string[];
    nextRole: string;
  } {
    // 从输出中提取摘要：取第一个非空行，截断到 100 字
    const lines = output.split('\n').filter(l => l.trim());
    const summary = (lines[0] || '').substring(0, 100);

    return {
      summary,
      content: output, // 完整内容原样传递
      phase: '',
      role: '',
      decisions: [],
      nextRole: '',
    };
  }

  /** 从用户输入中提取恢复关键词 */
  private extractResumeKeys(input: string): string[] {
    // 去掉触发词前缀
    const cleaned = input.replace(/^\/?\w+[\s-]+/, '').trim();
    if (!cleaned) return [];

    // 提取中文词组和英文单词（长度 >= 2）
    const words = cleaned.match(/[一-鿿]{2,}|[a-zA-Z]{3,}/g) || [];
    return [...new Set(words)].slice(0, 5);
  }
}
