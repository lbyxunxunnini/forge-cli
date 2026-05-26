import { AIClient } from '../llm/client-v2.js';
import type { ContextManager } from '../llm/context.js';
import type { ToolRegistry } from '../tools/registry.js';
import { sessionManager } from '../session/manager.js';
import { gateChecker } from '../gate/checker.js';
import { forgeLogger } from '../output/logger.js';
import { fastMode } from '../modes/fast.js';
import { autonomousMode } from '../modes/autonomous.js';
import { hookManager } from '../hooks/manager.js';
import { pluginManager } from '../plugins/manager.js';
import { mcpClient } from '../mcp/client.js';
import { agentPool } from './pool.js';
import { securityChecker } from '../security/checker.js';
import { confidenceScorer } from '../confidence/scorer.js';
import { learningMode } from '../learning/manager.js';
import { ControllerAgent } from './controller.js';
import type { AgentRole, AgentResult, AgentContext } from './types.js';

export class AgentOrchestrator {
  private controller: ControllerAgent;
  private context: AgentContext;
  private sessionInitialized = false;

  constructor(
    private aiClient: AIClient,
    private contextManager: ContextManager,
    private toolRegistry: ToolRegistry,
    private projectRoot: string
  ) {
    this.controller = new ControllerAgent(aiClient, contextManager, toolRegistry);
    this.context = {
      projectRoot,
      currentPhase: 'S0',
      currentMode: 'unknown',
      userConfirmed: false,
      designConfirmed: false,
      sessionData: {},
    };

    // 初始化插件管理器
    this.initPluginManager();
  }

  // 初始化插件管理器
  private async initPluginManager(): Promise<void> {
    try {
      await pluginManager.init();
      forgeLogger.logInfo(pluginManager.getSummary());
    } catch (error) {
      forgeLogger.logError(`插件管理器初始化失败: ${error}`);
    }
  }

  // 执行用户输入
  async execute(userInput: string): Promise<AgentResult> {
    // 先让大模型判断：是否需要进入 f-forge 工作流
    const isFlutterTask = await this.classifyTask(userInput);

    if (isFlutterTask === null) {
      return {
        success: false,
        output: '',
        error: '模型不可用，请检查 API 配置（/model）',
      };
    }

    if (!isFlutterTask) {
      // 非工作流任务：直接用工具回答（带上下文）
      return await this.directResponse(userInput);
    }

    // ─── 以下为 Flutter 任务的完整工作流 ───

    // 执行 PromptSubmit 钩子
    const promptHookResult = await hookManager.execute('PromptSubmit', {
      event: 'PromptSubmit',
      userPrompt: userInput,
    });

    if (promptHookResult.action === 'block') {
      return {
        success: false,
        output: '',
        error: promptHookResult.message || '操作被钩子阻止',
      };
    }

    // 安全检查
    const securityResult = securityChecker.checkCode(userInput);
    if (!securityResult.passed && securityResult.score < 50) {
      forgeLogger.logWarning(`安全检查警告 (分数: ${securityResult.score})`);
      for (const issue of securityResult.issues) {
        forgeLogger.logWarning(`  - ${issue.pattern.message}: ${issue.match}`);
      }
    }

    // 初始化 session（如果需要）
    if (!this.sessionInitialized) {
      sessionManager.init(this.context.projectRoot, userInput);
      this.sessionInitialized = true;

      // 执行 SessionStart 钩子
      await hookManager.execute('SessionStart', {
        event: 'SessionStart',
        sessionState: sessionManager.get() as unknown as Record<string, unknown>,
      });
    }

    // 更新 session 状态
    sessionManager.setState('executing');
    sessionManager.addHistory('user_input', 'user', userInput);

    // 检查是否需要中断（ff-a 模式）
    if (autonomousMode.isEnabled() && !autonomousMode.canAutoProceed(userInput)) {
      forgeLogger.logWaiting('检测到高风险操作，等待用户确认');
      sessionManager.waitForInput();
      return {
        success: true,
        output: '[f-forge] 检测到高风险操作，请确认是否继续',
        needsUserInput: true,
      };
    }

    // 路由判断
    const targetAgent = this.controller.route(userInput);

    // 更新上下文（先更新阶段，再检查门禁）
    this.updateContext(targetAgent);
    sessionManager.setActiveAgent(targetAgent);
    sessionManager.setPhase(this.context.currentPhase);

    // 日志：进入 controller
    forgeLogger.enterController();
    forgeLogger.logPhase(this.context.currentPhase);

    // 调度执行
    const result = await this.controller.dispatch(targetAgent, userInput, this.context);

    // 处理结果
    this.processResult(result);

    // 记录结果到 session
    sessionManager.addHistory('agent_result', targetAgent, result.output);

    return result;
  }

  // 非工作流任务：直接回答（带上下文和工具）
  private async directResponse(userInput: string): Promise<AgentResult> {
    // 添加用户消息到上下文
    this.contextManager.addUserMessage(userInput);

    try {
      const tools = this.toolRegistry.getAll().map(t => ({
        name: t.definition.name,
        description: t.definition.description,
        parameters: t.definition.parameters.properties,
        execute: t.execute,
      }));

      const result = await this.aiClient.generateWithMessages(
        this.contextManager.getMessages(),
        tools,
        5
      );

      // 保存助手回复到上下文
      this.contextManager.addAssistantMessage(result.text);

      return { success: true, output: result.text };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      return { success: false, output: '', error: msg };
    }
  }

  // 用大模型判断是否需要进入 f-forge 工作流
  private async classifyTask(userInput: string): Promise<boolean | null> {
    try {
      const result = await this.aiClient.generate(
        `判断以下用户输入是否需要进入结构化开发工作流（需求分析→方案设计→实现→验证）。
需要进入工作流的：创建页面、开发功能、重构代码、UI设计、架构设计等需要多步骤规划的开发任务。
不需要进入工作流的：闲聊、简单问答、直接执行命令、查看信息、简单的文件操作等。

用户输入：${userInput}

只回复一个字："是"或"否"。`,
        '你是一个任务分类器。只回复"是"或"否"，不要回复其他内容。',
        undefined,
        1
      );
      const text = result.text.trim();
      return text.startsWith('是');
    } catch {
      return null;
    }
  }

  // 流式执行
  async *executeStream(userInput: string): AsyncGenerator<{ type: 'text' | 'tool-call' | 'tool-result'; content: string }> {
    // 初始化 session（如果需要）
    if (!this.sessionInitialized) {
      sessionManager.init(this.context.projectRoot, userInput);
      this.sessionInitialized = true;
    }

    // 更新 session 状态
    sessionManager.setState('executing');
    sessionManager.addHistory('user_input', 'user', userInput);

    // 路由判断
    const targetAgent = this.controller.route(userInput);

    // 更新上下文
    this.updateContext(targetAgent);
    sessionManager.setActiveAgent(targetAgent);
    sessionManager.setPhase(this.context.currentPhase);

    // 日志：进入 controller
    forgeLogger.enterController();
    forgeLogger.logPhase(this.context.currentPhase);

    // 调度执行
    yield* this.controller.executeStream(userInput, this.context);

    // 记录完成
    sessionManager.addHistory('stream_complete', targetAgent, '');
  }

  // 更新上下文
  private updateContext(targetAgent: AgentRole): void {
    // 根据目标 Agent 更新阶段
    switch (targetAgent) {
      case 'requirement_analyst':
        this.context.currentPhase = 'S1';
        break;
      case 'ui_designer':
      case 'architecture_designer':
        this.context.currentPhase = 'S2';
        break;
      case 'page_engineer':
        this.context.currentPhase = 'S4';
        break;
      case 'verify_agent':
        this.context.currentPhase = 'S5';
        break;
    }
  }

  // 处理结果
  private processResult(result: AgentResult): void {
    if (result.success) {
      // 格式化输出
      const formattedOutput = forgeLogger.formatOutput(result.output);

      // 检查是否需要推进阶段
      if (result.output.includes('[f-forge] 阶段：')) {
        this.advancePhase();
      }

      // 检查是否需要用户输入
      if (result.needsUserInput) {
        this.context.userConfirmed = false;
        sessionManager.waitForInput();
      }

      // 完成日志
      forgeLogger.logComplete(formattedOutput.substring(0, 100));
    } else {
      // 错误日志
      forgeLogger.logError(result.error || '执行失败');
    }
  }

  // 推进阶段
  private advancePhase(): void {
    const phases = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
    const currentIndex = phases.indexOf(this.context.currentPhase);
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1];

      // 门禁检查：阶段转换是否合法
      const session = sessionManager.get();
      const gateResult = gateChecker.checkCanAdvancePhase(session, this.context.currentPhase, nextPhase);
      if (!gateResult.passed) {
        forgeLogger.logGate(gateResult.gateId!, false, gateResult.reason);
        return;
      }

      this.context.currentPhase = nextPhase;
      sessionManager.setPhase(nextPhase);
      forgeLogger.logPhase(nextPhase);
    }
  }

  // 获取当前阶段
  getCurrentPhase(): string {
    return this.context.currentPhase;
  }

  // 获取当前 Agent
  getCurrentAgent(): AgentRole | null {
    return this.controller.getCurrentAgent();
  }

  // 设置用户确认
  setUserConfirmed(confirmed: boolean): void {
    this.context.userConfirmed = confirmed;
  }

  // 设置设计确认
  setDesignConfirmed(confirmed: boolean): void {
    this.context.designConfirmed = confirmed;
  }

  // 获取上下文
  getContext(): AgentContext {
    return { ...this.context };
  }

  // 获取 session 信息
  getSessionInfo(): { id: string; state: string; mode: string | null } | null {
    const session = sessionManager.get();
    if (!session) return null;
    return {
      id: session.id,
      state: session.state,
      mode: session.mode,
    };
  }

  // 启用/禁用 ff-fast 模式
  enableFastMode(): void {
    fastMode.enable();
    forgeLogger.logMode('ff-fast');
  }

  disableFastMode(): void {
    fastMode.disable();
    forgeLogger.logMode('standard');
  }

  isFastModeEnabled(): boolean {
    return fastMode.isEnabled();
  }

  // 启用/禁用 ff-a 模式
  enableAutonomousMode(): void {
    autonomousMode.enable();
    forgeLogger.logMode('ff-a (autonomous)');
  }

  disableAutonomousMode(): void {
    autonomousMode.disable();
    forgeLogger.logMode('standard');
  }

  isAutonomousModeEnabled(): boolean {
    return autonomousMode.isEnabled();
  }

  // 获取推荐模式（ff-fast）
  getRecommendedMode(userInput: string): string {
    return fastMode.getRecommendedMode(userInput);
  }

  // 检查是否应该升级模式
  shouldUpgradeMode(userInput: string, scanResult?: string): boolean {
    return fastMode.shouldUpgrade(userInput, scanResult);
  }

  // 获取插件管理器
  getPluginManager() {
    return pluginManager;
  }

  // 获取 MCP 客户端
  getMCPClient() {
    return mcpClient;
  }

  // 获取 Agent 池
  getAgentPool() {
    return agentPool;
  }

  // 获取安全检查器
  getSecurityChecker() {
    return securityChecker;
  }

  // 获取置信度评分器
  getConfidenceScorer() {
    return confidenceScorer;
  }

  // 获取学习模式
  getLearningMode() {
    return learningMode;
  }

  // 获取钩子管理器
  getHookManager() {
    return hookManager;
  }

  // 并行执行多个任务
  async parallelExecute(tasks: Array<{ role: AgentRole; input: string }>): Promise<AgentResult[]> {
    const agentTasks = tasks.map((task, index) => ({
      id: `task-${index}`,
      role: task.role,
      input: task.input,
      context: this.context,
    }));

    const results = await agentPool.parallel(agentTasks);
    return results.map(r => r.result);
  }

  // 连接 MCP 服务器
  async connectMCPServer(serverId: string, config: { command: string; args?: string[] }): Promise<boolean> {
    return mcpClient.connect(serverId, config);
  }

  // 获取 MCP 工具
  getMCPTools() {
    return mcpClient.getAllTools();
  }

  // 启用/禁用学习模式
  enableLearningMode(): void {
    learningMode.enable();
    forgeLogger.logMode('learning');
  }

  disableLearningMode(): void {
    learningMode.disable();
    forgeLogger.logMode('standard');
  }

  isLearningModeEnabled(): boolean {
    return learningMode.isEnabled();
  }
}
