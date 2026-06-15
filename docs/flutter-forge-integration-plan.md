# Flutter Forge 接入 forge-cli 完整执行计划

> 本文档是 flutter-forge 原生移植到 forge-cli 的权威执行计划。
> 新对话可直接读取本文档继续执行，无需重新讨论。

---

## 进度跟踪

> 最后更新：2026-06-12

| Phase | 名称 | 状态 | 完成内容 |
|-------|------|------|---------|
| Phase 0 | 工作流基础设施 | **已完成** | activeWorkflow 状态、/workflows 列表选择、/exit-wf、语义退出检测、状态栏显示 |
| Phase 1 | 基础架构 | **已完成** | manifest.yaml、types.ts、迁移 20+ 参考文档、5 角色 prompt、5 profiles、3 gate 文档 |
| Phase 2 | 核心引擎 | **已完成** | project-scanner、task-classifier、gate-checker(11 gate)、phase-engine、router、guardrails-manager |
| Phase 3 | 角色与编排 | **已完成** | role-dispatcher、parallel-executor、rubric、output-schemas、controller(总控) |
| Phase 4 | 集成与记忆 | **已完成** | WorkflowExecutor 集成(executeFlutterForge + 自动编译 + 回退)、MemoryManager 子目录扩展 |
| Phase 5 | 模式与参考文档 | **已完成** | fast gate 跳过、autonomous 默认值填充、reference-loader 按需加载 |
| Phase 6 | 验证 | **已完成** | manifest 加载、orchestrator/commands/executor/repl-ink 集成检查、15 脚本完整性、36 参考文档 |

### 已创建的文件清单

**forge-cli 核心修改（Phase 0）：**
- `src/agents/orchestrator.ts` — +activeWorkflow 状态、enterWorkflow/exitWorkflow、isExitIntent、executeInActiveWorkflow
- `src/cli/commands.ts` — +/workflows、/exit-wf、交互式选择、startWorkflow 调用 enterWorkflow
- `src/cli/repl-ink.tsx` — +activeWorkflow 状态、状态栏显示、placeholder 显示工作流名

**flutter-forge 工作流目录 `~/.forge-cli/workflows/flutter-forge/`：**

| 文件 | 类型 | 说明 |
|------|------|------|
| `manifest.yaml` | 配置 | 工作流声明（角色、阶段、脚本、触发词） |
| `scripts/types.ts` | TS | 核心类型定义（TaskMode、Phase、GateName、Session、角色输出 Schema） |
| `scripts/output-schemas.ts` | TS | 5 个角色的 JSON Schema |
| `scripts/project-scanner.ts` | TS | 项目状态检测 + 技术栈扫描 |
| `scripts/task-classifier.ts` | TS | 触发词 + 关键词 → TaskMode |
| `scripts/router.ts` | TS | 10 秒测试 + 路由决策 |
| `scripts/gate-checker.ts` | TS | 11 个 gate 校验（含 fast 模式跳过） |
| `scripts/phase-engine.ts` | TS | S0-S6/C0-C3 状态机 |
| `scripts/guardrails-manager.ts` | TS | Guardrails 加载/初始化（方案 B 路径） |
| `scripts/role-dispatcher.ts` | TS | 子 agent 隔离执行 + 结构化 JSON 传递 |
| `scripts/parallel-executor.ts` | TS | 按 parallel_groups 按模块并行派发 |
| `scripts/rubric.ts` | TS | Rubric 评估表 + 加权打分 |
| `scripts/session-manager.ts` | TS | Session 创建/保存/恢复 |
| `scripts/memory-bridge.ts` | TS | 方案 B 三层记忆 + 角色读写权限 |
| `scripts/reference-loader.ts` | TS | 按 phase 场景按需加载参考文档 |
| `scripts/controller.ts` | **TS 总控** | 串联：路由→guardrails→phase→role→gate→并行 |
| `references/` | MD/YAML | 20+ 参考文档 |
| `references/roles/` | MD | 5 个角色 prompt |
| `references/shared_workflow_gates/` | MD | 3 个 gate 定义文档 |
| `profiles/` | YAML | 5 个技术栈模板 |

### 下一步：实际使用验证

Phase 0-6 已全部完成。下一步是实际使用验证：

1. 启动 forge-cli，输入 `/workflows`，选择 flutter-forge
2. 输入 `ff- 做一个登录页面`，验证完整 S1→S5 流水线
3. 输入 `/exit-wf` 或 "退出"，验证工作流退出
4. 在 Flutter 项目中测试，验证 guardrails 初始化和技术栈扫描

---

## 1. 项目概述

### 1.1 目标

将 flutter-forge（Claude Code skill，v0.3.4）完整移植为 forge-cli 的一个标准工作流实例。
Flutter 开发者在 forge-cli 中通过 `/workflows` 选择 flutter-forge 进入，获得 flutter-forge 的全部编排能力。

### 1.2 已确认决策总表

| # | 决策项 | 结论 | 理由 |
|---|--------|------|------|
| 1 | 接入方式 | 原生 TypeScript 移植 | 运行时零 Python 依赖，自洽 |
| 2 | flutter-forge 定位 | forge-cli 标准工作流实例 | 后续会有更多工作流，需要规范化 |
| 3 | 工作流进入/退出 | activeWorkflow 状态 + `/exit-wf` + 语义退出 | 持续交互模式，不是一次性执行 |
| 4 | 记忆体系 | 方案 B — 共享根目录，独立格式 | guardrails 是结构化 YAML，不能退化为 markdown |
| 5 | 角色执行 | 子 agent 隔离，独立 API 调用 | 上下文不互通，防止角色间信息污染 |
| 6 | 信息传递 | 结构化 JSON 协议 | 角色间通过 schema 传递，不传自由文本 |
| 7 | 并行派发 | 架构师输出 parallel_groups，按模块并行 | 无依赖模块可并行开发，提升效率 |
| 8 | 结果合并 | 并行结果收集后统一交给 verify_agent | 端到端测试审查，不遗漏 |
| 9 | 脚本处理 | 全部 TypeScript 重写 | 零 Python 依赖 |
| 10 | 角色定义 | 重新设计（TS 模板 + role prompt markdown） | 适配 forge-cli agent 系统 |
| 11 | flutter-skills | 暂不接入 | 后续独立任务 |
| 12 | 品质层级 | 完整移植 | 8 种模式、双轨、11 gate、5 角色、fast/autonomous |
| 13 | 节奏 | 分阶段多次会话 | 工程量大，需要分步推进 |

### 1.3 非目标

- 10 个官方 Flutter skill 接入（flutter-add-widget-test 等）
- flutter-forge 的验证/发布脚本（validate_release.sh 等）
- Claude Code 原生 hook 适配（forge-cli 有自己的 hook 系统）
- 新的 UI 组件（复用 forge-cli 现有的 Ink/React 组件）

---

## 2. 架构设计

### 2.1 整体架构

```
用户输入
    │
    ▼
forge-cli REPL (Ink/React)
    │
    ▼
AgentOrchestrator
    ├── activeWorkflowName === 'flutter-forge' ?
    │   ├── 是 → WorkflowExecutor.execute(flutter-forge, ...)
    │   │         ├── 任务分类 → TaskMode
    │   │         ├── Phase 引擎推进
    │   │         ├── 角色调度（子 agent 隔离执行）
    │   │         ├── Gate 拦截
    │   │         └── 并行派发（架构师判断后）
    │   └── 否 → 现有逻辑（直接响应 / 触发词匹配）
    │
    ▼
LLM API (Vercel AI SDK)
```

### 2.2 工作流生命周期

```
/workflows
    │
    ▼
列出所有工作流（数字选择）
    │
    ▼
用户选择 flutter-forge
    │
    ▼
进入工作流模式（orchestrator.activeWorkflowName = 'flutter-forge'）
    │
    ▼
所有用户输入路由到 flutter-forge 的 executor
    │
    ├── ff-        → standard 模式（完整流程）
    ├── ff-fast    → fast 模式（跳过非关键 gate）
    ├── ff-a       → autonomous 模式（推荐默认值填充）
    ├── 其他输入   → 在当前工作流上下文中处理
    │
    ├── /exit-wf   → 退出工作流
    └── 语义退出   → LLM 判断"退出/结束/不做了" → 退出工作流
```

### 2.3 执行流水线（核心）

```
S1: requirement_analyst
    输入: 用户需求（原始文本）
    输出: RequirementOutput (JSON)
          ├── goal: string
          ├── scope: string[]
          ├── acceptance: string[]
          ├── constraints: string[]
          ├── excluded: string[]
          └── rubric_items: RubricItem[]
    │
    ▼
S2: architecture_designer
    输入: RequirementOutput
    输出: ArchitectureOutput (JSON)
          ├── decisions: ArchitectDecision[]
          ├── modules: ModuleSpec[]
          ├── parallel_groups?: ParallelGroup[]   ← 关键！
          ├── dependencies: DependencyEdge[]
          └── risk_notes: string[]
    │
    ▼
S4: page_engineer（动态派发）
    │
    ├── 如果 parallel_groups 存在且 modules > 1:
    │   ├── page_engineer(module_a)  ─┐
    │   ├── page_engineer(module_b)  ─┤ 并行执行
    │   └── page_engineer(module_c)  ─┘
    │   每个输入: { module, requirement: RequirementOutput, architecture: ArchitectureOutput, guardrails }
    │   每个输出: PageEngineerOutput (JSON)
    │             ├── module: string
    │             ├── files_changed: FileChange[]
    │             ├── test_commands: string[]
    │             └── notes: string[]
    │   合并: PageEngineerOutput[]
    │
    └── 如果无 parallel_groups 或 modules == 1:
        单个 page_engineer 串行执行
    │
    ▼
S5: verify_agent
    输入: { requirement: RequirementOutput, architecture: ArchitectureOutput, implementations: PageEngineerOutput[] }
    输出: VerifyOutput (JSON)
          ├── rubric_scores: RubricScore[]
          ├── issues: Issue[]
          └── verdict: 'pass' | 'fail' | 'pass_with_notes'
```

### 2.4 记忆体系（方案 B）

```
{project}/.forge-cli/memory/
├── *.md                        ← forge-cli 通用 project memory
└── flutter-forge/              ← 工作流专属子目录
    └── guardrails.yaml         ← 结构化 YAML（技术栈、规范、约束）

~/.forge-cli/memory/
├── *.md                        ← forge-cli 通用 memory
└── flutter-forge/
    └── preferences.yaml        ← 跨项目偏好（YAML）

{project}/.forge-cli/workflows/flutter-forge/runtime/
├── sessions/                   ← 工作流会话状态（已有 WorkflowStore）
│   └── {sessionId}.yaml
└── ...
```

三层记忆映射：

| flutter-forge 层 | forge-cli 位置 | 格式 | 读写权限 |
|------------------|---------------|------|---------|
| Session（任务进度） | WorkflowStore.sessionsDir | YAML | controller 读写 |
| Project Guardrails | `{project}/.forge-cli/memory/flutter-forge/guardrails.yaml` | YAML | controller 读写，其他角色只读 |
| 跨项目偏好 | `~/.forge-cli/memory/flutter-forge/preferences.yaml` | YAML | controller 读写 |

MemoryManager 扩展点：
- `getProjectSubdir(subdir)` — 扫描项目记忆子目录
- `getGlobalSubdir(subdir)` — 扫描全局记忆子目录
- 不改变现有 MemoryManager 的核心逻辑，只增加子目录发现

### 2.5 Gate 系统

11 个 gate，全部用 TypeScript 实现，放在工作流 scripts 目录：

| Gate | 检查时机 | 拦截条件 |
|------|----------|---------|
| phase_progression | phase 切换时 | 前置 phase 未完成 |
| change_contract | S4 写文件时 | 改动超出 S2 冻结的范围 |
| role_scope | 角色执行时 | 角色使用了 forbiddenTools |
| requirement_freeze | S2 开始时 | S1 输出缺少 goal/scope/acceptance |
| design_freeze | S4 开始时 | S2 输出缺少 decisions/modules |
| verification_complete | 进入 S6 时 | S5 verdict 为 fail |
| scope_creep | S4 执行时 | 新增文件不在 architecture modules 中 |
| false_completion | S5 执行时 | 声称完成但未跑测试 |
| guardrails_loaded | 任何 gate 前 | guardrails 未初始化（非 passthrough） |
| question_budget | 角色提问时 | 同一问题已问过 |
| tool_permission | 工具调用时 | 角色无权使用该工具 |

Gate 拦截位置：FlutterForgeController 内部，不走全局 hook。
原因：flutter-forge 的 gate 逻辑与工作流状态紧密耦合，全局 hook 无法访问工作流 session。

### 2.6 角色定义

5 个角色，在 forge-cli 的 agent 系统中注册。每个角色有：
- TypeScript 配置（allowedTools, forbiddenTools）
- Prompt markdown 文件（references/roles/*.md）
- 结构化输出 schema

角色配置（TypeScript）：

```typescript
// requirement_analyst
{
  role: 'requirement_analyst',
  name: '需求分析师',
  allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'scan_project'],
  forbiddenTools: ['write_file', 'edit_file', 'run_command'],
  outputSchema: RequirementOutput,
}

// architecture_designer
{
  role: 'architecture_designer',
  name: '架构设计师',
  allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'scan_project'],
  forbiddenTools: ['write_file', 'edit_file', 'run_command'],
  outputSchema: ArchitectureOutput,  // 含 parallel_groups
}

// page_engineer
{
  role: 'page_engineer',
  name: '页面工程师',
  allowedTools: ['*'],  // 所有工具
  forbiddenTools: [],
  outputSchema: PageEngineerOutput,
}

// ui_designer
{
  role: 'ui_designer',
  name: 'UI 设计师',
  allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'scan_project'],
  forbiddenTools: ['write_file', 'edit_file', 'run_command'],
  outputSchema: UIDesignOutput,
}

// verify_agent
{
  role: 'verify_agent',
  name: '验证工程师',
  allowedTools: ['read_file', 'list_files', 'search_files', 'glob', 'grep', 'ls', 'run_command', 'validate_output'],
  forbiddenTools: ['write_file', 'edit_file'],
  outputSchema: VerifyOutput,
}
```

---

## 3. 目录结构

### 3.1 工作流安装目录（全局只读）

```
~/.forge-cli/workflows/flutter-forge/
├── manifest.yaml                         # 工作流声明
├── scripts/                              # TypeScript 源码（编译后执行）
│   ├── types.ts                          # 核心类型定义
│   ├── controller.ts                     # 总控（串联所有组件）
│   ├── task-classifier.ts                # 任务分类 → TaskMode
│   ├── phase-engine.ts                   # Phase 状态机（S0-S6, C0-C3）
│   ├── gate-checker.ts                   # 11 个 gate 校验
│   ├── role-dispatcher.ts                # 角色调度 + 子 agent 派发
│   ├── parallel-executor.ts              # 并行执行引擎
│   ├── rubric.ts                         # Rubric 评估
│   ├── project-scanner.ts                # 项目状态检测
│   ├── guardrails-manager.ts             # Guardrails 加载/初始化
│   ├── memory-bridge.ts                  # 记忆桥接（方案 B）
│   ├── reference-loader.ts               # 参考文档按需加载
│   ├── router.ts                         # 10 秒测试 + 路由
│   ├── session-manager.ts                # 会话状态管理
│   └── output-schemas.ts                 # 角色输出 JSON Schema 定义
├── references/                           # 参考文档（markdown，按需加载）
│   ├── load_map.md                       # 场景→文件映射索引
│   ├── core_contracts.yaml               # Session fields, gates, policies
│   ├── trigger_words.md                  # 触发词列表
│   ├── fast_mode.md                      # ff-fast 策略
│   ├── autonomous_mode.md                # ff-a 策略
│   ├── decision_and_question_protocol.md # 决策与提问协议
│   ├── phase_checkpoint.md               # Phase 转换自检
│   ├── project_guardrails_protocol.md    # Guardrails 协议
│   ├── memory_protocol.md                # 记忆协议
│   ├── agent_isolation_protocol.md       # Agent 隔离协议
│   ├── engineering_heuristics.md         # 工程启发式
│   ├── flutter_stack_detection.md        # Flutter 栈检测
│   ├── rubric_evaluation.md              # Rubric 评估
│   ├── systematic_debugging.md           # 系统化调试
│   ├── tdd_discipline.md                 # TDD 纪律
│   ├── workflow_diagram.md               # 工作流图
│   ├── startup_handshake.md              # 启动握手
│   ├── session_management.md             # 会话管理
│   ├── roles/                            # 角色 prompt
│   │   ├── requirement_analyst.md
│   │   ├── ui_designer.md
│   │   ├── architecture_designer.md
│   │   ├── page_engineer.md
│   │   └── verify_agent.md
│   └── shared_workflow_gates/            # Gate 定义文档
│       ├── role_gate_matrix.md
│       ├── question_budget.md
│       └── requirement_confirmation.md
├── profiles/                             # 技术栈模板
│   ├── bloc_module_profile.yaml
│   ├── riverpod_feature_profile.yaml
│   ├── lean_mvp_profile.yaml
│   ├── go_router_dio_freezed_profile.yaml
│   └── getx_mvp_profile.yaml
└── flutter-skills/                       # （暂不接入，预留目录）
```

### 3.2 项目级目录（运行时读写）

```
{project}/.forge-cli/
├── memory/
│   ├── *.md                              # forge-cli 通用 project memory
│   └── flutter-forge/                    # 工作流专属记忆
│       └── guardrails.yaml               # 项目 guardrails（结构化 YAML）
└── workflows/
    └── flutter-forge/
        └── runtime/
            └── sessions/
                └── {sessionId}.yaml      # 工作流会话状态
```

### 3.3 全局记忆目录

```
~/.forge-cli/memory/
├── *.md                                  # forge-cli 通用 memory
└── flutter-forge/
    └── preferences.yaml                  # 跨项目偏好
```

### 3.4 需修改的 forge-cli 核心文件

| 文件 | 修改内容 |
|------|---------|
| `src/agents/orchestrator.ts` | 增加 activeWorkflow 状态、工作流进入/退出逻辑、语义退出检测 |
| `src/cli/commands.ts` | 增强 `/workflows`（列表选择）、新增 `/exit-wf` |
| `src/cli/repl-ink.tsx` | 状态栏显示当前活跃工作流 |
| `src/memory/manager.ts` | 增加子目录发现能力 |
| `src/workflows/executor.ts` | 支持结构化输入/输出、并行派发 |
| `src/workflows/types.ts` | 增加结构化输出类型定义 |

---

## 4. 分阶段执行计划

### Phase 0：工作流基础设施 ✅ 已完成

**目标**：forge-cli 支持"进入工作流 → 持续交互 → 退出工作流"的完整生命周期。
**前置依赖**：无。
**验收标准**：`/workflows` 列出工作流，选择后进入，`/exit-wf` 退出，状态栏显示活跃工作流。

#### Step 0.1 — Orchestrator 增加 activeWorkflow 状态

文件：`src/agents/orchestrator.ts`

```typescript
// 新增属性
private activeWorkflowName: string | null = null;

// 进入工作流
enterWorkflow(name: string): void {
  this.activeWorkflowName = name;
  forgeLogger.logInfo(`[orchestrator] 进入工作流: ${name}`);
}

// 退出工作流
exitWorkflow(): void {
  const name = this.activeWorkflowName;
  this.activeWorkflowName = null;
  forgeLogger.logInfo(`[orchestrator] 退出工作流: ${name}`);
}

// 获取当前活跃工作流
getActiveWorkflow(): string | null {
  return this.activeWorkflowName;
}
```

修改 `handleUserInput` 方法：
```typescript
async handleUserInput(input: string): Promise<string> {
  // 0. 检查 /exit-wf 命令
  if (input.trim() === '/exit-wf') {
    if (this.activeWorkflowName) {
      this.exitWorkflow();
      return '已退出工作流';
    }
    return '当前没有活跃的工作流';
  }

  // 1. 如果在工作流模式中
  if (this.activeWorkflowName) {
    // 1a. 语义退出检测
    if (await this.isExitIntent(input)) {
      this.exitWorkflow();
      return '已退出工作流';
    }
    // 1b. 路由到工作流 executor
    return await this.executeInActiveWorkflow(input);
  }

  // 2. 现有逻辑（触发词匹配、直接响应等）
  // ...
}
```

#### Step 0.2 — 语义退出检测

文件：`src/agents/orchestrator.ts`

```typescript
private async isExitIntent(input: string): Promise<boolean> {
  // 关键词快速匹配
  const exitKeywords = ['退出工作流', '退出', '结束工作流', '不做了', 'exit workflow', '/exit-wf'];
  const inputLower = input.toLowerCase().trim();
  if (exitKeywords.some(kw => inputLower.includes(kw))) return true;

  // LLM 兜底判断（仅在不确定时调用）
  // 避免每次都调 LLM，只在输入较短且可能是退出意图时
  if (input.length < 20) {
    try {
      const result = await this.aiClient.generate(
        `判断用户是否想退出当前工作流。只回答 "yes" 或 "no"。\n用户输入：${input}`,
        '你是一个意图分类器。',
        [],
        1
      );
      return result.text.toLowerCase().includes('yes');
    } catch {
      return false;
    }
  }
  return false;
}
```

#### Step 0.3 — `/workflows` 增强

文件：`src/cli/commands.ts`

当前 `/workflow` 已有列表和名称匹配功能。需要增强为交互式选择：

```typescript
case '/workflows': {  // 注意：改为复数形式，与现有 /workflow 区分
  const workflows = workflowRegistry.getAll();
  if (workflows.length === 0) {
    return { handled: true, output: chalk.dim('未安装任何工作流。') };
  }

  // 如果有参数，按原有逻辑处理（名称匹配）
  if (args.length > 0) {
    // 现有 /workflow <name> 逻辑
  }

  // 无参数：列出所有工作流，让用户选择
  const lines = ['可用工作流：', ''];
  for (let i = 0; i < workflows.length; i++) {
    const wf = workflows[i];
    lines.push(`  ${chalk.cyan(`${i + 1}`)}. ${wf.manifest.name} v${wf.manifest.version}`);
    lines.push(`     ${chalk.dim(wf.manifest.description)}`);
    lines.push(`     触发词: ${wf.manifest.triggers.join(', ')}`);
    lines.push('');
  }
  lines.push(chalk.dim('输入数字进入对应工作流，或 /workflow <名称> 直接启动'));

  return { handled: true, output: lines.join('\n') };
}
```

数字选择逻辑需要在 orchestrator 或 REPL 层面处理（当用户输入纯数字且当前有工作流列表时）。

#### Step 0.4 — `/exit-wf` 命令注册

文件：`src/cli/commands.ts`

```typescript
// 在命令列表中添加 '/exit-wf'
case '/exit-wf': {
  if (!orchestrator.getActiveWorkflow()) {
    return { handled: true, output: chalk.dim('当前没有活跃的工作流') };
  }
  orchestrator.exitWorkflow();
  return { handled: true, output: chalk.green('已退出工作流') };
}
```

#### Step 0.5 — 状态栏显示

文件：`src/cli/repl-ink.tsx`

在状态栏组件中增加工作流名称显示：

```tsx
// 状态栏中添加
{activeWorkflow && (
  <Text color="yellow"> [{activeWorkflow}]</Text>
)}
```

需要从 orchestrator 暴露 `getActiveWorkflow()` 方法给 REPL 组件。

#### Step 0.6 — 工作流进入时保存 session，退出时清理

文件：`src/workflows/executor.ts`

进入工作流时自动创建 session，退出时保存最终状态。
在 orchestrator 的 `enterWorkflow` 和 `exitWorkflow` 中调用 executor 的相应方法。

---

### Phase 1：flutter-forge 基础架构 ✅ 已完成

**目标**：建立 flutter-forge 作为标准工作流实例的目录结构和类型系统。
**前置依赖**：Phase 0 完成。
**验收标准**：`~/.forge-cli/workflows/flutter-forge/` 目录结构完整，manifest.yaml 可被 WorkflowRegistry 加载。

#### Step 1.1 — 创建 manifest.yaml

文件：`~/.forge-cli/workflows/flutter-forge/manifest.yaml`

```yaml
name: flutter-forge
version: "0.4.0"
description: "Flutter 项目结构化开发工作流 — 需求分析→架构设计→实现→验证"
triggers:
  - "ff-"
  - "ff-fast"
  - "ff-a"
  - "ff "
  - "/flutter-forge"

roles:
  - name: controller
    description: "主控 — 路由、阶段推进、状态管理"
    allowedTools: ["*"]
    forbiddenTools: []
    outputFormat: free

  - name: requirement_analyst
    description: "需求分析师 — 目标冻结、范围确认、验收标准"
    allowedTools:
      - read_file
      - list_files
      - search_files
      - glob
      - grep
      - ls
      - scan_project
      - detect_project_state
      - save_memory
      - read_memory
    forbiddenTools:
      - write_file
      - edit_file
      - run_command
    promptFile: "roles/requirement_analyst.md"
    outputFormat: structured

  - name: ui_designer
    description: "UI 设计师 — 视觉方案、交互设计"
    allowedTools:
      - read_file
      - list_files
      - search_files
      - glob
      - grep
      - ls
      - scan_project
      - save_memory
      - read_memory
    forbiddenTools:
      - write_file
      - edit_file
      - run_command
    promptFile: "roles/ui_designer.md"
    outputFormat: structured

  - name: architecture_designer
    description: "架构设计师 — 架构决策、模块划分、并行分析"
    allowedTools:
      - read_file
      - list_files
      - search_files
      - glob
      - grep
      - ls
      - scan_project
      - detect_project_state
      - save_memory
      - read_memory
    forbiddenTools:
      - write_file
      - edit_file
      - run_command
    promptFile: "roles/architecture_designer.md"
    outputFormat: structured

  - name: page_engineer
    description: "页面工程师 — 代码实现"
    allowedTools: ["*"]
    forbiddenTools: []
    promptFile: "roles/page_engineer.md"
    outputFormat: structured

  - name: verify_agent
    description: "验证工程师 — 功能验证、Rubric 评估"
    allowedTools:
      - read_file
      - list_files
      - search_files
      - glob
      - grep
      - ls
      - run_command
      - validate_output
      - save_memory
      - read_memory
    forbiddenTools:
      - write_file
      - edit_file
    promptFile: "roles/verify_agent.md"
    outputFormat: structured

phases:
  cocreation:
    - C0
    - C1
    - C2
    - C3
  execution:
    - S0
    - S1
    - S2
    - S3
    - S4
    - S5
    - S6

scripts:
  controller: "scripts/controller.ts"
  task_classifier: "scripts/task-classifier.ts"
  phase_engine: "scripts/phase-engine.ts"
  gate_checker: "scripts/gate-checker.ts"
  role_dispatcher: "scripts/role-dispatcher.ts"
  parallel_executor: "scripts/parallel-executor.ts"
  project_scanner: "scripts/project-scanner.ts"
  guardrails_manager: "scripts/guardrails-manager.ts"
  memory_bridge: "scripts/memory-bridge.ts"
  reference_loader: "scripts/reference-loader.ts"
  router: "scripts/router.ts"
  session_manager: "scripts/session-manager.ts"

hooks:
  pre_write_gate: "scripts/gate-checker.ts"
```

#### Step 1.2 — 核心类型定义

文件：`~/.forge-cli/workflows/flutter-forge/scripts/types.ts`

```typescript
// ─── 任务模式 ─────────────────────────────────────────
export type TaskMode =
  | 'direct'           // 直通（闲聊/简单问答）
  | 'lightweight'      // 轻量（小改动、本地 bug）
  | 'medium'           // 中等（单文件修改）
  | 'ui_optimize'      // UI 优化
  | 'architecture'     // 架构级（重构、技术选型）
  | 'feature'          // 功能开发（完整 S1-S5）
  | 'page'             // 页面开发（UI + 实现）
  | 'new_project';     // 新项目共创（C0-C3 + S4）

// ─── 阶段 ─────────────────────────────────────────────
export type ExecutionPhase = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
export type CocreationPhase = 'C0' | 'C1' | 'C2' | 'C3';
export type Phase = ExecutionPhase | CocreationPhase;

// ─── 角色 ─────────────────────────────────────────────
export type RoleName =
  | 'controller'
  | 'requirement_analyst'
  | 'ui_designer'
  | 'architecture_designer'
  | 'page_engineer'
  | 'verify_agent';

// ─── 策略 ─────────────────────────────────────────────
export type Policy = 'standard' | 'fast' | 'autonomous';

// ─── Gate ─────────────────────────────────────────────
export type GateName =
  | 'phase_progression'
  | 'change_contract'
  | 'role_scope'
  | 'requirement_freeze'
  | 'design_freeze'
  | 'verification_complete'
  | 'scope_creep'
  | 'false_completion'
  | 'guardrails_loaded'
  | 'question_budget'
  | 'tool_permission';

export interface GateResult {
  gate: GateName;
  passed: boolean;
  message: string;
}

// ─── 会话状态 ─────────────────────────────────────────
export interface FlutterForgeSession {
  workflow: 'flutter-forge';
  phase: Phase;
  mode: TaskMode;
  policy: Policy;
  activeRole: RoleName;
  projectRoot: string;

  // 状态标记
  goalConfirmed: boolean;
  scopeConfirmed: boolean;
  designConfirmed: boolean;
  guardrailsLoaded: boolean;

  // 结构化输出（角色间传递）
  requirementOutput?: RequirementOutput;
  architectureOutput?: ArchitectureOutput;
  implementationOutputs?: PageEngineerOutput[];
  uiDesignOutput?: UIDesignOutput;
  verifyOutput?: VerifyOutput;

  // 历史
  history: SessionHistoryEntry[];

  // 恢复
  resumeKeys?: string[];
}

export interface SessionHistoryEntry {
  timestamp: string;
  phase: Phase;
  role: RoleName;
  action: string;
  outputSummary?: string;
}

// ─── 角色输出 Schema ──────────────────────────────────

export interface RequirementOutput {
  goal: string;
  scope: string[];
  acceptance: string[];
  constraints: string[];
  excluded: string[];
  rubric_items: RubricItem[];
  questions_asked: string[];
  open_issues: string[];
}

export interface RubricItem {
  id: string;
  category: string;
  description: string;
  weight: number;        // 1-5
  verification_method: string;
}

export interface ArchitectureOutput {
  decisions: ArchitectDecision[];
  modules: ModuleSpec[];
  parallel_groups?: ParallelGroup[];
  dependencies: DependencyEdge[];
  risk_notes: string[];
}

export interface ArchitectDecision {
  topic: string;
  choice: string;
  alternatives: string[];
  rationale: string;
}

export interface ModuleSpec {
  name: string;
  description: string;
  file_scope: string[];       // 涉及的文件/目录
  interfaces: string[];       // 对外接口
  dependencies: string[];     // 依赖的其他模块名
}

export interface ParallelGroup {
  group_id: string;
  modules: string[];          // 同组内可并行的模块名
  rationale: string;
  sequence_order: number;     // 执行顺序（0 = 最先）
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'data' | 'api' | 'shared_state';
}

export interface PageEngineerOutput {
  module: string;
  files_changed: FileChange[];
  test_commands: string[];
  notes: string[];
  warnings: string[];
}

export interface FileChange {
  path: string;
  action: 'create' | 'modify' | 'delete';
  summary: string;
}

export interface UIDesignOutput {
  components: ComponentSpec[];
  layout: string;
  style_notes: string[];
  interaction_flows: string[];
}

export interface ComponentSpec {
  name: string;
  type: 'page' | 'widget' | 'component';
  props: string[];
  description: string;
}

export interface VerifyOutput {
  rubric_scores: RubricScore[];
  issues: Issue[];
  verdict: 'pass' | 'fail' | 'pass_with_notes';
  summary: string;
}

export interface RubricScore {
  item_id: string;
  score: number;           // 0-100
  evidence: string;
  notes: string;
}

export interface Issue {
  severity: 'critical' | 'major' | 'minor';
  module: string;
  description: string;
  suggestion: string;
}

// ─── Project Guardrails ──────────────────────────────
export interface ProjectGuardrails {
  project_name: string;
  project_type: 'flutter_new' | 'flutter_existing' | 'non_flutter';
  tech_stack: TechStackConfig;
  engineering: EngineeringConfig;
  boundaries: BoundaryConfig;
  created_at: string;
  updated_at: string;
}

export interface TechStackConfig {
  state_management: string;    // bloc, riverpod, getx, provider, etc.
  routing: string;             // go_router, auto_route, etc.
  networking: string;          // dio, http, etc.
  serialization: string;       // freezed, json_serializable, etc.
  testing: string;             // flutter_test, mockito, etc.
  ui_framework: string;        // material, cupertino, custom
}

export interface EngineeringConfig {
  naming_convention: string;
  file_structure: string;
  test_policy: 'none' | 'widget_only' | 'full';
  code_review_required: boolean;
  ci_required: boolean;
}

export interface BoundaryConfig {
  protected_files: string[];       // 不可修改的文件
  protected_directories: string[]; // 不可修改的目录
  max_file_lines: number;
  max_function_lines: number;
}
```

#### Step 1.3 — 迁移参考文档

将 flutter-forge 的 `references/` 目录复制到 `~/.forge-cli/workflows/flutter-forge/references/`。
需要迁移的文件清单：

核心（必须）：
- `load_map.md`
- `core_contracts.yaml`
- `trigger_words.md`
- `fast_mode.md`
- `autonomous_mode.md`
- `decision_and_question_protocol.md`
- `phase_checkpoint.md`
- `project_guardrails_protocol.md`
- `project_guardrails_template.yaml`
- `memory_protocol.md`
- `agent_isolation_protocol.md`
- `engineering_heuristics.md`
- `workflow_diagram.md`
- `startup_handshake.md`
- `session_management.md`
- `skill_visibility.md`

角色（必须）：
- `roles/requirement_analyst.md`
- `roles/ui_designer.md`
- `roles/architecture_designer.md`
- `roles/page_engineer.md`
- `roles/verify_agent.md`

Gate（必须）：
- `shared_workflow_gates/role_gate_matrix.md`
- `shared_workflow_gates/question_budget.md`
- `shared_workflow_gates/requirement_confirmation.md`

技术栈相关（推荐）：
- `flutter_stack_detection.md`
- `stack_profiles.md`
- `network_and_api.md`
- `routing_and_navigation.md`

其他（可选，按需迁移）：
- `rubric_evaluation.md`
- `systematic_debugging.md`
- `tdd_discipline.md`
- `model_selection.md`
- `forge_controller_protocol.md`
- `maintenance_map.md`
- `existing_project_entry.md`
- `existing_project_scan.md`
- `existing_rules_discovery.md`
- `new_project_cocreation_mode.md`

#### Step 1.4 — 迁移 profiles

将 flutter-forge 的 `memory/profiles/` 复制到 `~/.forge-cli/workflows/flutter-forge/profiles/`。

#### Step 1.5 — 迁移角色 prompt

将 flutter-forge 的 `references/roles/*.md` 复制到 `~/.forge-cli/workflows/flutter-forge/references/roles/`。
注意：这些是原始 prompt 参考，实际的角色 prompt 会在 TypeScript 中重新组织（保留规则语义，适配 forge-cli 的 agent 系统）。

---

### Phase 2：核心引擎（TypeScript 重写） ✅ 已完成

**目标**：flutter-forge 的核心编排逻辑用 TypeScript 实现。
**前置依赖**：Phase 1 完成。
**验收标准**：任务分类、Phase 推进、Gate 校验独立可测。

#### Step 2.1 — 项目状态检测器

文件：`~/.forge-cli/workflows/flutter-forge/scripts/project-scanner.ts`

从 `detect_project_root_state.py` 移植。逻辑：
1. 检查 `pubspec.yaml` 是否存在 → flutter_existing
2. 检查目录是否为空 → empty_new
3. 否则 → non_flutter

从 `flutter_stack_scan.py` 移植。逻辑：
1. 读 `pubspec.yaml` 的 dependencies
2. 检测 state_management（flutter_bloc → bloc, riverpod → riverpod, etc.）
3. 检测 routing（go_router → go_router, auto_route → auto_route, etc.）
4. 检测 networking（dio → dio, http → http, etc.）
5. 返回 TechStackConfig

#### Step 2.2 — 任务分类器

文件：`~/.forge-cli/workflows/flutter-forge/scripts/task-classifier.ts`

从 SKILL.md 的路由逻辑和 `classify_task.sh` 移植。

输入：用户文本 + 项目状态
输出：{ mode: TaskMode, confidence: number, reason: string }

分类逻辑（10 秒测试 + 关键词匹配）：
1. 关键词匹配：`ff-fast` → lightweight, `ff-a` → autonomous, etc.
2. 内容分析：
   - 提到"新建页面/模块/功能" → feature 或 page
   - 提到"重构/架构/选型" → architecture
   - 提到"UI/样式/交互" → ui_optimize
   - 提到"bug/修复/报错" → lightweight
   - 无明确开发意图 → direct
3. 复杂度判断：单文件 → lightweight/medium, 多文件 → feature, 新项目 → new_project

#### Step 2.3 — Gate 系统

文件：`~/.forge-cli/workflows/flutter-forge/scripts/gate-checker.ts`

从 `gate_check.py` 和 `core_contracts.yaml` 移植。11 个 gate 全部用 TypeScript 实现。

```typescript
export class GateChecker {
  constructor(private session: FlutterForgeSession) {}

  check(gate: GateName, context?: Record<string, unknown>): GateResult {
    switch (gate) {
      case 'phase_progression':
        return this.checkPhaseProgression(context);
      case 'requirement_freeze':
        return this.checkRequirementFreeze();
      case 'design_freeze':
        return this.checkDesignFreeze();
      case 'change_contract':
        return this.checkChangeContract(context);
      case 'role_scope':
        return this.checkRoleScope(context);
      case 'verification_complete':
        return this.checkVerificationComplete();
      case 'scope_creep':
        return this.checkScopeCreep(context);
      case 'false_completion':
        return this.checkFalseCompletion();
      case 'guardrails_loaded':
        return this.checkGuardrailsLoaded();
      case 'question_budget':
        return this.checkQuestionBudget(context);
      case 'tool_permission':
        return this.checkToolPermission(context);
    }
  }

  // 检查所有应该在 phase 切换前通过的 gate
  checkPhaseTransition(from: Phase, to: Phase): GateResult[] {
    const results: GateResult[] = [];
    // 根据 from→to 的映射表检查对应 gate
    // ...
    return results;
  }
}
```

Gate 详细规则（从 core_contracts.yaml 移植）：

- **phase_progression**: 前置 phase 必须在 history 中有记录
- **requirement_freeze**: session.requirementOutput 必须存在且包含 goal/scope/acceptance
- **design_freeze**: session.architectureOutput 必须存在且包含 decisions/modules
- **change_contract**: S4 的 file_scope 必须在 architectureOutput.modules 的 file_scope 范围内
- **role_scope**: 当前角色的工具调用必须在 allowedTools 内
- **verification_complete**: session.verifyOutput.verdict 不能是 'fail'
- **scope_creep**: 新增的文件必须在某个 module 的 file_scope 内
- **false_completion**: 声称完成时必须有 verifyOutput
- **guardrails_loaded**: session.guardrailsLoaded 必须为 true（passthrough 模式除外）
- **question_budget**: 同一问题（相似度 > 0.8）不能问超过 2 次
- **tool_permission**: 角色调用的工具必须在 manifest.roles[].allowedTools 内

#### Step 2.4 — Phase 引擎

文件：`~/.forge-cli/workflows/flutter-forge/scripts/phase-engine.ts`

状态机管理 phase 推进。从 `controller.py` 的 phase 管理逻辑移植。

```typescript
export class PhaseEngine {
  private session: FlutterForgeSession;
  private gateChecker: GateChecker;

  constructor(session: FlutterForgeSession) {
    this.session = session;
    this.gateChecker = new GateChecker(session);
  }

  // 获取当前 mode 对应的 phase 流水线
  getPipeline(): Phase[] {
    const pipelines: Record<TaskMode, Phase[]> = {
      direct: ['S0'],
      lightweight: ['S4'],
      medium: ['S4'],
      ui_optimize: ['S2', 'S4'],
      architecture: ['S2', 'S4', 'S5'],
      feature: ['S1', 'S2', 'S4', 'S5'],
      page: ['S1', 'S2', 'S4', 'S5'],
      new_project: ['C0', 'C1', 'C2', 'C3', 'S4', 'S5'],
    };
    return pipelines[this.session.mode] || pipelines.medium;
  }

  // 获取当前 phase 对应的角色
  getRoleForPhase(phase: Phase): RoleName {
    const mapping: Record<string, RoleName> = {
      'S0': 'controller',
      'S1': 'requirement_analyst',
      'S2': this.session.mode === 'ui_optimize' ? 'ui_designer' : 'architecture_designer',
      'S3': 'architecture_designer',  // 任务拆分
      'S4': 'page_engineer',
      'S5': 'verify_agent',
      'S6': 'controller',
      'C0': 'requirement_analyst',
      'C1': 'requirement_analyst',
      'C2': 'architecture_designer',
      'C3': 'architecture_designer',
    };
    return mapping[phase] || 'controller';
  }

  // 推进到下一 phase（带 gate 检查）
  advance(): { success: boolean; nextPhase?: Phase; errors?: string[] } {
    const pipeline = this.getPipeline();
    const currentIndex = pipeline.indexOf(this.session.phase);
    if (currentIndex === -1 || currentIndex >= pipeline.length - 1) {
      return { success: false, errors: ['已在最后一个 phase'] };
    }

    const nextPhase = pipeline[currentIndex + 1];
    const gateResults = this.gateChecker.checkPhaseTransition(this.session.phase, nextPhase);
    const failures = gateResults.filter(r => !r.passed);

    if (failures.length > 0) {
      return {
        success: false,
        errors: failures.map(f => `[${f.gate}] ${f.message}`),
      };
    }

    this.session.phase = nextPhase;
    this.session.activeRole = this.getRoleForPhase(nextPhase);
    return { success: true, nextPhase };
  }
}
```

#### Step 2.5 — 10 秒测试 + 路由

文件：`~/.forge-cli/workflows/flutter-forge/scripts/router.ts`

快速判断任务是否轻量到可以跳过完整流程。

```typescript
export function quickClassify(input: string, projectState: ProjectState): {
  mode: TaskMode;
  skipFullFlow: boolean;
  reason: string;
} {
  // 触发词直接匹配
  if (input.startsWith('ff-fast')) return { mode: 'lightweight', skipFullFlow: true, reason: 'ff-fast 触发' };
  if (input.startsWith('ff-a')) return { mode: 'medium', skipFullFlow: false, reason: 'ff-a 触发（autonomous）' };
  if (input.startsWith('ff-')) return { mode: 'feature', skipFullFlow: false, reason: 'ff- 触发' };

  // 内容分析
  const lightweightKeywords = ['bug', 'fix', '修复', '报错', '错误', '调整', '改一下', '小改'];
  const featureKeywords = ['新建', '创建', '开发', '实现', '添加功能', '新页面', '新模块'];
  const architectureKeywords = ['重构', '架构', '选型', '迁移', '技术方案'];

  const inputLower = input.toLowerCase();

  if (lightweightKeywords.some(kw => inputLower.includes(kw))) {
    return { mode: 'lightweight', skipFullFlow: true, reason: '轻量任务关键词' };
  }
  if (architectureKeywords.some(kw => inputLower.includes(kw))) {
    return { mode: 'architecture', skipFullFlow: false, reason: '架构级任务关键词' };
  }
  if (featureKeywords.some(kw => inputLower.includes(kw))) {
    return { mode: 'feature', skipFullFlow: false, reason: '功能开发关键词' };
  }

  // 默认
  return { mode: 'medium', skipFullFlow: false, reason: '默认中等模式' };
}
```

#### Step 2.6 — Guardrails 管理

文件：`~/.forge-cli/workflows/flutter-forge/scripts/guardrails-manager.ts`

从 `init_project_guardrails.py` 移植。

```typescript
export class GuardrailsManager {
  constructor(
    private projectRoot: string,
    private workflowName: string = 'flutter-forge'
  ) {}

  // Guardrails 路径（方案 B：共享记忆根目录 + 工作流子目录）
  get guardrailsPath(): string {
    return join(this.projectRoot, '.forge-cli', 'memory', this.workflowName, 'guardrails.yaml');
  }

  // 加载 guardrails
  load(): ProjectGuardrails | null { ... }

  // 初始化 guardrails（首次进入时）
  async initialize(projectState: ProjectState, techStack: TechStackConfig): Promise<ProjectGuardrails> { ... }

  // 更新 guardrails（controller 在大任务结束时建议更新）
  update(partial: Partial<ProjectGuardrails>): void { ... }

  // 检查是否已加载
  exists(): boolean { ... }
}
```

---

### Phase 3：角色与编排 ✅ 已完成

**目标**：5 个角色作为子 agent 隔离执行，架构师可判断并行。
**前置依赖**：Phase 2 完成。
**验收标准**：角色隔离执行，结构化输出传递，架构师输出 parallel_groups。

#### Step 3.1 — 输出 Schema 定义

文件：`~/.forge-cli/workflows/flutter-forge/scripts/output-schemas.ts`

定义每个角色的 JSON Schema（用于 prompt 约束和输出解析）。

```typescript
export const REQUIREMENT_SCHEMA = {
  type: 'object',
  properties: {
    goal: { type: 'string' },
    scope: { type: 'array', items: { type: 'string' } },
    acceptance: { type: 'array', items: { type: 'string' } },
    constraints: { type: 'array', items: { type: 'string' } },
    excluded: { type: 'array', items: { type: 'string' } },
    rubric_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          weight: { type: 'number' },
          verification_method: { type: 'string' },
        },
        required: ['id', 'category', 'description', 'weight', 'verification_method'],
      },
    },
    questions_asked: { type: 'array', items: { type: 'string' } },
    open_issues: { type: 'array', items: { type: 'string' } },
  },
  required: ['goal', 'scope', 'acceptance', 'constraints', 'excluded', 'rubric_items'],
};

export const ARCHITECTURE_SCHEMA = {
  type: 'object',
  properties: {
    decisions: { /* ... */ },
    modules: { /* ... */ },
    parallel_groups: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          group_id: { type: 'string' },
          modules: { type: 'array', items: { type: 'string' } },
          rationale: { type: 'string' },
          sequence_order: { type: 'number' },
        },
        required: ['group_id', 'modules', 'rationale', 'sequence_order'],
      },
    },
    dependencies: { /* ... */ },
    risk_notes: { type: 'array', items: { type: 'string' } },
  },
  required: ['decisions', 'modules', 'dependencies'],
};

// ... 其他 schema
```

#### Step 3.2 — 角色调度器

文件：`~/.forge-cli/workflows/flutter-forge/scripts/role-dispatcher.ts`

```typescript
export class RoleDispatcher {
  constructor(
    private aiClient: AIClient,
    private workflow: Workflow,
    private session: FlutterForgeSession,
    private store: WorkflowStore,
    private guardrailsManager: GuardrailsManager
  ) {}

  // 执行单个角色（子 agent 隔离）
  async executeRole(
    roleName: RoleName,
    input: Record<string, unknown>,  // 结构化输入
    schema: object                    // 输出 JSON Schema
  ): Promise<{ success: boolean; output: Record<string, unknown>; raw: string }> {
    const roleDef = this.workflow.manifest.roles.find(r => r.name === roleName);
    if (!roleDef) throw new Error(`角色 ${roleName} 未定义`);

    // 加载角色 prompt
    const rolePrompt = this.store.loadRolePrompt(roleDef.promptFile || `${roleName}.md`);

    // 构建隔离的 system prompt
    const systemPrompt = this.buildIsolatedPrompt(roleName, roleDef, rolePrompt);

    // 结构化输入（不传自由文本）
    const userInput = JSON.stringify(input, null, 2);

    // 获取角色允许的工具
    const tools = this.filterTools(roleDef);

    // 独立 API 调用
    const result = await this.aiClient.generate(userInput, systemPrompt, tools, 10);

    // 解析结构化输出
    const parsed = this.parseStructuredOutput(result.text, schema);

    return { success: true, output: parsed, raw: result.text };
  }

  private buildIsolatedPrompt(
    roleName: RoleName,
    roleDef: WorkflowRoleDef,
    rolePrompt: string | null
  ): string {
    const parts: string[] = [
      `# 工作流: flutter-forge v${this.workflow.manifest.version}`,
      '',
      rolePrompt || `你是 ${roleName}，执行特定阶段的任务。`,
      '',
      '## 输出要求',
      '你必须以 JSON 格式输出，符合以下 schema 要求。',
      '输出时只输出 JSON，不要添加其他文本。',
      '用 ```json 代码块包裹你的输出。',
      '',
      '## 当前上下文',
      `- 项目路径: ${this.session.projectRoot}`,
      `- 当前阶段: ${this.session.phase}`,
      `- 当前模式: ${this.session.mode}`,
      `- 策略: ${this.session.policy}`,
    ];

    // Guardrails（结构化）
    const guardrails = this.guardrailsManager.load();
    if (guardrails) {
      parts.push('', '## 项目 Guardrails', '```yaml');
      parts.push(YAML.stringify(guardrails));
      parts.push('```');
    }

    // 历史摘要
    if (this.session.history.length > 0) {
      parts.push('', '## 执行历史');
      for (const entry of this.session.history.slice(-5)) {
        parts.push(`- [${entry.phase}] ${entry.role}: ${entry.action}`);
      }
    }

    return parts.join('\n');
  }

  private filterTools(roleDef: WorkflowRoleDef): AgentTool[] {
    const allTools = this.toolRegistry.getAll();
    return allTools
      .filter(t => {
        if (roleDef.forbiddenTools.includes(t.definition.name)) return false;
        if (roleDef.allowedTools.includes('*')) return true;
        return roleDef.allowedTools.includes(t.definition.name);
      })
      .map(t => ({
        name: t.definition.name,
        description: t.definition.description,
        parameters: t.definition.parameters.properties,
        execute: t.execute,
      }));
  }

  private parseStructuredOutput(text: string, schema: object): Record<string, unknown> {
    // 提取 JSON 代码块
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    // 尝试直接解析
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`角色输出不是有效 JSON: ${text.substring(0, 200)}`);
    }
  }
}
```

#### Step 3.3 — 并行执行引擎

文件：`~/.forge-cli/workflows/flutter-forge/scripts/parallel-executor.ts`

```typescript
export class ParallelExecutor {
  constructor(
    private dispatcher: RoleDispatcher
  ) {}

  // 根据架构师输出的 parallel_groups 并行派发 page_engineer
  async executeParallel(
    groups: ParallelGroup[],
    requirement: RequirementOutput,
    architecture: ArchitectureOutput,
    guardrails: ProjectGuardrails
  ): Promise<PageEngineerOutput[]> {
    const allResults: PageEngineerOutput[] = [];

    // 按 sequence_order 排序组
    const sortedGroups = [...groups].sort((a, b) => a.sequence_order - b.sequence_order);

    for (const group of sortedGroups) {
      if (group.modules.length === 1) {
        // 单模块，直接执行
        const result = await this.executeSingleModule(
          group.modules[0], requirement, architecture, guardrails
        );
        allResults.push(result);
      } else {
        // 多模块并行
        const promises = group.modules.map(module =>
          this.executeSingleModule(module, requirement, architecture, guardrails)
        );
        const results = await Promise.all(promises);
        allResults.push(...results);
      }
    }

    return allResults;
  }

  private async executeSingleModule(
    moduleName: string,
    requirement: RequirementOutput,
    architecture: ArchitectureOutput,
    guardrails: ProjectGuardrails
  ): Promise<PageEngineerOutput> {
    const moduleSpec = architecture.modules.find(m => m.name === moduleName);
    if (!moduleSpec) {
      throw new Error(`模块 ${moduleName} 未在架构设计中定义`);
    }

    const input = {
      module: moduleSpec,
      requirement,
      architecture_decisions: architecture.decisions,
      guardrails: {
        tech_stack: guardrails.tech_stack,
        engineering: guardrails.engineering,
        boundaries: guardrails.boundaries,
      },
      related_modules: architecture.modules
        .filter(m => m.name !== moduleName)
        .map(m => ({ name: m.name, interfaces: m.interfaces })),
    };

    const result = await this.dispatcher.executeRole(
      'page_engineer',
      input,
      PAGE_ENGINEER_SCHEMA
    );

    return result.output as unknown as PageEngineerOutput;
  }
}
```

#### Step 3.4 — Rubric 评估

文件：`~/.forge-cli/workflows/flutter-forge/scripts/rubric.ts`

```typescript
export class RubricEvaluator {
  // 从 requirementOutput 生成评估表
  generateRubric(requirement: RequirementOutput): RubricItem[] {
    return requirement.rubric_items;
  }

  // verify_agent 按 Rubric 打分
  evaluate(
    scores: RubricScore[],
    items: RubricItem[]
  ): { totalScore: number; verdict: 'pass' | 'fail' | 'pass_with_notes' } {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const item of items) {
      const score = scores.find(s => s.item_id === item.id);
      if (score) {
        weightedSum += score.score * item.weight;
        totalWeight += item.weight;
      }
    }

    const totalScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    let verdict: 'pass' | 'fail' | 'pass_with_notes';
    if (totalScore >= 80) verdict = 'pass';
    else if (totalScore >= 60) verdict = 'pass_with_notes';
    else verdict = 'fail';

    return { totalScore, verdict };
  }
}
```

#### Step 3.5 — FlutterForgeController

文件：`~/.forge-cli/workflows/flutter-forge/scripts/controller.ts`

总控类，串联所有组件。

```typescript
export class FlutterForgeController {
  private session: FlutterForgeSession;
  private phaseEngine: PhaseEngine;
  private gateChecker: GateChecker;
  private dispatcher: RoleDispatcher;
  private parallelExecutor: ParallelExecutor;
  private guardrailsManager: GuardrailsManager;
  private projectScanner: ProjectScanner;
  private referenceLoader: ReferenceLoader;
  private sessionManager: SessionManager;
  private memoryBridge: MemoryBridge;

  constructor(
    private aiClient: AIClient,
    private workflow: Workflow,
    private store: WorkflowStore,
    private projectRoot: string,
    private toolRegistry: ToolRegistry
  ) {
    this.guardrailsManager = new GuardrailsManager(projectRoot);
    this.projectScanner = new ProjectScanner(projectRoot);
    this.referenceLoader = new ReferenceLoader(store);
    this.sessionManager = new SessionManager(store);
    this.memoryBridge = new MemoryBridge(projectRoot, store);
  }

  // 主入口
  async execute(userInput: string, policy: Policy = 'standard'): Promise<WorkflowExecuteResult> {
    // 1. 项目扫描
    const projectState = await this.projectScanner.detect();

    // 2. 加载/初始化 guardrails
    if (!this.guardrailsManager.exists()) {
      if (projectState.type === 'flutter_existing') {
        const techStack = await this.projectScanner.scanTechStack();
        await this.guardrailsManager.initialize(projectState, techStack);
      }
    }

    // 3. 任务分类
    const classification = quickClassify(userInput, projectState);

    // 4. 初始化或恢复 session
    this.session = this.sessionManager.getOrCreate(classification.mode, policy, projectState);

    // 5. Phase 引擎推进
    const pipeline = this.phaseEngine.getPipeline();
    const outputs: string[] = [];

    for (let i = 0; i < pipeline.length; i++) {
      const phase = pipeline[i];
      const role = this.phaseEngine.getRoleForPhase(phase);

      // Gate 检查
      if (i > 0) {
        const gateResults = this.gateChecker.checkPhaseTransition(pipeline[i - 1], phase);
        const failures = gateResults.filter(r => !r.passed);
        if (failures.length > 0) {
          return {
            success: false,
            output: outputs.join('\n\n'),
            error: `Gate 拦截: ${failures.map(f => f.message).join(', ')}`,
          };
        }
      }

      // 执行角色
      const roleInput = this.buildRoleInput(role, userInput);
      const result = await this.dispatcher.executeRole(role, roleInput, this.getSchemaForRole(role));

      // 保存结构化输出到 session
      this.saveRoleOutput(role, result.output);

      // 更新 session 状态
      this.session.history.push({
        timestamp: new Date().toISOString(),
        phase,
        role,
        action: 'execute',
        outputSummary: JSON.stringify(result.output).substring(0, 500),
      });

      // 非最后一个 phase：暂停等用户确认
      if (i < pipeline.length - 1) {
        this.sessionManager.save(this.session);
        const remaining = pipeline.slice(i + 1).map(p => `${p}(${this.phaseEngine.getRoleForPhase(p)})`).join(' → ');
        outputs.push(`[${phase}] ${role} 完成。下一步: ${remaining}\n输入 ff- 继续，或输入修改意见。`);
        return { success: true, output: outputs.join('\n\n'), needsUserInput: true };
      }

      outputs.push(`[${phase}] ${role}: ${JSON.stringify(result.output).substring(0, 200)}`);
    }

    this.sessionManager.save(this.session);
    return { success: true, output: outputs.join('\n\n') };
  }

  // S4 阶段：检查是否需要并行
  private async executeS4(userInput: string): Promise<WorkflowExecuteResult> {
    const archOutput = this.session.architectureOutput;

    if (archOutput?.parallel_groups && archOutput.parallel_groups.length > 0) {
      // 并行派发
      const results = await this.parallelExecutor.executeParallel(
        archOutput.parallel_groups,
        this.session.requirementOutput!,
        archOutput,
        this.guardrailsManager.load()!
      );
      this.session.implementationOutputs = results;
      return { success: true, output: `并行完成 ${results.length} 个模块` };
    } else {
      // 串行执行
      const result = await this.dispatcher.executeRole(
        'page_engineer',
        this.buildRoleInput('page_engineer', userInput),
        PAGE_ENGINEER_SCHEMA
      );
      this.session.implementationOutputs = [result.output as unknown as PageEngineerOutput];
      return { success: true, output: JSON.stringify(result.output) };
    }
  }

  // S5 阶段：verify_agent 接收全链路数据
  private async executeS5(): Promise<WorkflowExecuteResult> {
    const input = {
      requirement: this.session.requirementOutput,
      architecture: this.session.architectureOutput,
      implementations: this.session.implementationOutputs,
      guardrails: this.guardrailsManager.load(),
      rubric_items: this.session.requirementOutput?.rubric_items,
    };

    const result = await this.dispatcher.executeRole('verify_agent', input, VERIFY_SCHEMA);
    this.session.verifyOutput = result.output as unknown as VerifyOutput;
    return { success: true, output: JSON.stringify(result.output) };
  }

  private buildRoleInput(role: RoleName, userInput: string): Record<string, unknown> {
    switch (role) {
      case 'requirement_analyst':
        return { user_request: userInput, project_state: this.projectScanner.getLastState() };
      case 'architecture_designer':
        return { requirement: this.session.requirementOutput, user_request: userInput };
      case 'page_engineer':
        return { requirement: this.session.requirementOutput, architecture: this.session.architectureOutput };
      case 'verify_agent':
        return { requirement: this.session.requirementOutput, architecture: this.session.architectureOutput, implementations: this.session.implementationOutputs };
      case 'ui_designer':
        return { requirement: this.session.requirementOutput, user_request: userInput };
      default:
        return { user_request: userInput };
    }
  }

  private getSchemaForRole(role: RoleName): object {
    const schemas: Record<RoleName, object> = {
      controller: {},
      requirement_analyst: REQUIREMENT_SCHEMA,
      ui_designer: UI_DESIGN_SCHEMA,
      architecture_designer: ARCHITECTURE_SCHEMA,
      page_engineer: PAGE_ENGINEER_SCHEMA,
      verify_agent: VERIFY_SCHEMA,
    };
    return schemas[role] || {};
  }

  private saveRoleOutput(role: RoleName, output: Record<string, unknown>): void {
    switch (role) {
      case 'requirement_analyst':
        this.session.requirementOutput = output as unknown as RequirementOutput;
        this.session.goalConfirmed = true;
        this.session.scopeConfirmed = true;
        break;
      case 'architecture_designer':
        this.session.architectureOutput = output as unknown as ArchitectureOutput;
        this.session.designConfirmed = true;
        break;
      case 'ui_designer':
        this.session.uiDesignOutput = output as unknown as UIDesignOutput;
        break;
      case 'page_engineer':
        if (!this.session.implementationOutputs) this.session.implementationOutputs = [];
        this.session.implementationOutputs.push(output as unknown as PageEngineerOutput);
        break;
      case 'verify_agent':
        this.session.verifyOutput = output as unknown as VerifyOutput;
        break;
    }
  }
}
```

---

### Phase 4：集成与记忆 ✅ 已完成

**目标**：将 flutter-forge controller 集成到 WorkflowExecutor，记忆桥接方案 B 落地。
**前置依赖**：Phase 3 完成。
**验收标准**：`/workflows` → 选择 flutter-forge → `ff-` → 完整流水线跑通；guardrails 以 YAML 存储在记忆子目录。

#### Step 4.0 — WorkflowExecutor 集成 FlutterForgeController（核心）

文件：`src/workflows/executor.ts`（修改）

当前 executor 的 `executePipeline` 使用通用的角色执行逻辑。需要增加 flutter-forge 专用的执行路径：
当检测到 workflow name 为 `flutter-forge` 时，调用 `FlutterForgeController.execute()` 替代通用逻辑。

```typescript
// 在 executePipeline 方法中增加分支：
if (workflow.manifest.name === 'flutter-forge') {
  // 动态导入 flutter-forge controller
  const { FlutterForgeController } = await import(
    join(workflow.globalBase, 'scripts', 'controller.js')
  );
  const controller = new FlutterForgeController(
    this.aiClient, this.contextManager, this.toolRegistry,
    workflow, projectRoot,
  );
  return controller.execute(userInput, policy);
}
```

**关键问题**：flutter-forge 的 scripts 目录中的 .ts 文件需要编译为 .js 才能被动态导入。
方案：在 workflow 安装时或首次加载时自动编译，或直接使用 tsx/ts-node 运行时。
推荐方案：在 manifest.yaml 中增加 `runtime: tsx` 字段，executor 使用 `tsx` 执行 TypeScript。

#### Step 4.1 — MemoryManager 子目录扩展

文件：`src/memory/manager.ts`（修改）

```typescript
// 新增方法
getProjectSubdir(subdir: string): string {
  return join(homedir(), '.forge-cli', 'memory', subdir);
}

getGlobalSubdir(subdir: string): string {
  return join(homedir(), '.forge-cli', 'memory', subdir);
}

// 扫描子目录中的 YAML 文件
loadSubdirYaml(subdir: string, filename: string): Record<string, unknown> | null {
  const filePath = join(this.getProjectSubdir(subdir), filename);
  if (!existsSync(filePath)) return null;
  try {
    return parseYaml(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

saveSubdirYaml(subdir: string, filename: string, data: Record<string, unknown>): void {
  const dir = this.getProjectSubdir(subdir);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, filename), stringifyYaml(data), 'utf-8');
}
```

#### Step 4.2 — MemoryBridge

文件：`~/.forge-cli/workflows/flutter-forge/scripts/memory-bridge.ts`

```typescript
export class MemoryBridge {
  private guardrailsPath: string;
  private preferencesPath: string;

  constructor(
    private projectRoot: string,
    private store: WorkflowStore
  ) {
    // 方案 B：共享记忆根目录 + 工作流子目录
    this.guardrailsPath = join(projectRoot, '.forge-cli', 'memory', 'flutter-forge', 'guardrails.yaml');
    this.preferencesPath = join(homedir(), '.forge-cli', 'memory', 'flutter-forge', 'preferences.yaml');
  }

  // 读取 guardrails
  loadGuardrails(): ProjectGuardrails | null {
    if (!existsSync(this.guardrailsPath)) return null;
    try {
      return parseYaml(readFileSync(this.guardrailsPath, 'utf-8')) as ProjectGuardrails;
    } catch {
      return null;
    }
  }

  // 保存 guardrails
  saveGuardrails(data: ProjectGuardrails): void {
    const dir = dirname(this.guardrailsPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.guardrailsPath, stringifyYaml(data), 'utf-8');
  }

  // 读取跨项目偏好
  loadPreferences(): Record<string, unknown> | null {
    if (!existsSync(this.preferencesPath)) return null;
    try {
      return parseYaml(readFileSync(this.preferencesPath, 'utf-8'));
    } catch {
      return null;
    }
  }

  // 保存跨项目偏好
  savePreferences(data: Record<string, unknown>): void {
    const dir = dirname(this.preferencesPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.preferencesPath, stringifyYaml(data), 'utf-8');
  }

  // 角色读写权限检查
  canRead(role: RoleName, layer: 'session' | 'guardrails' | 'preferences'): boolean {
    const permissions: Record<RoleName, Record<string, boolean>> = {
      controller: { session: true, guardrails: true, preferences: true },
      architecture_designer: { session: false, guardrails: true, preferences: false },
      page_engineer: { session: false, guardrails: true, preferences: false },
      requirement_analyst: { session: true, guardrails: true, preferences: false },
      ui_designer: { session: false, guardrails: true, preferences: false },
      verify_agent: { session: false, guardrails: true, preferences: false },
    };
    return permissions[role]?.[layer] ?? false;
  }

  canWrite(role: RoleName, layer: 'session' | 'guardrails' | 'preferences'): boolean {
    const permissions: Record<RoleName, Record<string, boolean>> = {
      controller: { session: true, guardrails: true, preferences: true },
      architecture_designer: { session: false, guardrails: false, preferences: false },
      page_engineer: { session: false, guardrails: false, preferences: false },
      requirement_analyst: { session: false, guardrails: false, preferences: false },
      ui_designer: { session: false, guardrails: false, preferences: false },
      verify_agent: { session: false, guardrails: false, preferences: false },
    };
    return permissions[role]?.[layer] ?? false;
  }
}
```

#### Step 4.3 — 迁移 global_preferences

将 flutter-forge 的 `memory/global_preferences.yaml` 格式转换为 forge-cli 的偏好格式。
初始化时创建 `~/.forge-cli/memory/flutter-forge/preferences.yaml`。

---

### Phase 5：模式与参考文档 ✅ 已完成

**目标**：fast/autonomous 模式差异，参考文档按需加载。
**前置依赖**：Phase 4 完成。
**验收标准**：三种模式行为不同，参考文档按场景动态注入。

#### Step 5.1 — fast 模式

在 phase-engine 和 gate-checker 中集成 fast 模式差异：

```typescript
// gate-checker.ts
if (this.session.policy === 'fast') {
  // fast 模式：跳过以下 gate
  const skippableGates: GateName[] = ['question_budget', 'guardrails_loaded'];
  if (skippableGates.includes(gate)) {
    return { gate, passed: true, message: 'fast 模式跳过' };
  }
  // 如果发现高风险，自动升级为 standard
  if (this.detectHighRisk()) {
    this.session.policy = 'standard';
    return { gate, passed: false, message: '检测到高风险，升级为 standard 模式' };
  }
}
```

#### Step 5.2 — autonomous 模式

```typescript
// controller.ts
if (this.session.policy === 'autonomous') {
  // autonomous 模式：缺失信息用推荐默认值填充
  if (!this.session.requirementOutput?.constraints?.length) {
    input.constraints = ['遵循项目现有架构', '保持向后兼容'];
  }
  // 不暂停等用户确认，直接推进
}
```

#### Step 5.3 — 参考文档按需加载

文件：`~/.forge-cli/workflows/flutter-forge/scripts/reference-loader.ts`

```typescript
export class ReferenceLoader {
  constructor(private store: WorkflowStore) {}

  // 根据 load_map.md 的场景→文件映射加载
  loadForScenario(scenario: string): string[] {
    const loadMap = this.store.loadReference('load_map.md');
    if (!loadMap) return [];

    // 解析 load_map 中 scenario 对应的文件列表
    const files = this.parseLoadMap(loadMap, scenario);
    return files.map(f => this.store.loadReference(f)).filter(Boolean) as string[];
  }

  // 根据当前 phase 加载对应参考文档
  loadForPhase(phase: Phase): string[] {
    const phaseScenarios: Record<string, string[]> = {
      S1: ['requirement_analysis', 'decision_protocol'],
      S2: ['architecture_design', 'stack_profiles', 'engineering_heuristics'],
      S4: ['implementation', 'tdd_discipline', 'systematic_debugging'],
      S5: ['verification', 'rubric_evaluation'],
    };
    return (phaseScenarios[phase] || []).flatMap(s => this.loadForScenario(s));
  }

  private parseLoadMap(content: string, scenario: string): string[] {
    // 解析 markdown 表格或列表，找到 scenario 对应的文件路径
    // ... 简单的文本解析
    return [];
  }
}
```

---

### Phase 6：验证 ✅ 已完成

**目标**：端到端验证全流程。
**前置依赖**：Phase 5 完成。
**验收标准**：见下方验收清单。

#### 验收清单

| # | 验收项 | 验证方法 | 通过条件 |
|---|--------|---------|---------|
| 1 | `/workflows` 列表 | 运行 `/workflows` | 列出 flutter-forge，可选择进入 |
| 2 | 进入工作流 | 选择 flutter-forge | orchestrator.activeWorkflowName = 'flutter-forge' |
| 3 | 触发词路由 | 输入 `ff- 做一个登录页` | 正确分类为 feature 模式 |
| 4 | S1 需求分析 | 执行 requirement_analyst | 输出结构化 RequirementOutput |
| 5 | S2 架构设计 | 执行 architecture_designer | 输出 ArchitectureOutput，含 modules |
| 6 | 并行判断 | 架构师分析多模块任务 | 输出 parallel_groups |
| 7 | S4 并行派发 | 存在 parallel_groups 时 | 多个 page_engineer 并行执行 |
| 8 | S5 验证 | 执行 verify_agent | 接收全链路数据，输出 VerifyOutput |
| 9 | Gate 拦截 | 未确认需求就尝试实现 | gate checker 阻止 |
| 10 | `/exit-wf` | 输入 `/exit-wf` | 退出工作流模式 |
| 11 | 语义退出 | 输入"不做了" | 检测退出意图，退出工作流 |
| 12 | 状态栏 | 进入工作流后 | 状态栏显示 [flutter-forge] |
| 13 | Guardrails | 首次进入 Flutter 项目 | 自动初始化 guardrails.yaml |
| 14 | 记忆持久化 | 退出后重新进入 | session 可恢复 |
| 15 | fast 模式 | 输入 `ff-fast 修个 bug` | 跳过非关键 gate |
| 16 | autonomous 模式 | 输入 `ff-a 做个设置页` | 用推荐默认值填充 |
| 17 | 参考文档 | 执行 S2 | 按需加载 engineering_heuristics 等 |
| 18 | 零 Python | 检查运行时依赖 | 无 Python 调用 |

---

## 5. 风险与缓解

| 风险 | 影响 | 缓解 |
|------|------|------|
| SKILL.md 35K 规则移植遗漏 | 行为与原版不一致 | 逐节对照移植，关键规则做 golden test |
| 并行 page_engineer 文件冲突 | 多个 agent 写同一文件 | guardrails 约束 file_scope，架构师划分清晰边界 |
| 结构化输出解析失败 | 角色输出无法传递 | 严格 JSON Schema 校验 + 降级为自由文本解析 |
| orchestrator 改动影响现有功能 | 回归风险 | activeWorkflow 为 null 时走现有逻辑，最小侵入 |
| LLM 不稳定输出 JSON | 结构化输出不可靠 | prompt 中强约束 + 多次重试 + 降级策略 |

---

## 6. 执行顺序与依赖

```
Phase 0 (基础设施) ✅
    │
    ▼
Phase 1 (基础架构) ✅
    │
    ▼
Phase 2 (核心引擎) ✅
    │
    ├── Step 2.1 项目扫描 ✅ ──┐
    ├── Step 2.2 任务分类 ✅ ──┤ 可并行
    ├── Step 2.3 Gate 系统 ✅ ─┤
    ├── Step 2.4 Phase 引擎 ✅ ┤
    ├── Step 2.5 路由 ✅ ──────┘
    │
    ▼
Phase 3 (角色与编排) ✅
    │
    ├── Step 3.1 输出 Schema ✅ ──┐
    ├── Step 3.2 角色调度器 ✅ ───┤
    ├── Step 3.3 并行引擎 ✅ ────┤ 依赖 3.1
    ├── Step 3.4 Rubric ✅ ───────┤
    └── Step 3.5 Controller ✅ ───┘ 依赖全部

    │
    ▼
Phase 4 (集成与记忆) ✅
    │
    ▼
Phase 5 (模式与参考文档) ✅
    │
    ▼
Phase 6 (验证) ✅
```

---

## 7. 后续扩展（不在本次范围）

| 扩展项 | 说明 |
|--------|------|
| 10 个官方 Flutter skill 接入 | 通过 delegation_map 在对应 phase 自动调用 |
| 更多工作流 | 本文档建立的基础设施可复用 |
| 工作流市场 | 从 GitHub 安装工作流（类似 skill 安装） |
| 工作流可视化 | 执行过程的图形化展示 |
| 自定义 gate | 用户可添加项目专属 gate |
