<!-- generated-by: project-memory; safe-to-overwrite -->
# 项目摘要

项目根目录：`/Users/agi00114/Desktop/AI/agent设计/forge-cli`
项目 ID：`proj-forge-cli-f61a1f2e`
扫描时间：2026-06-15T16:30:20+08:00

## 清单

- 已索引文件：249
- 已索引模块：37
- 配置：4
- 文档：86
- 其他：19
- 源码：132
- 测试：8

## 项目用途

- `AGENTS.md`：<claude-mem-context> No previous sessions found. </claude-mem-context>
- `CHANGELOG.md`：说明： - `0.2.x` 中出现的 `legacy_project_scan.md`、`~/.forge-cli/projects/*.rule_card.yaml` 等表述保留为当时版本的历史事实 - 当前现行入口与项目护栏路径策略以 `references/existing_project_entry.md`、`references/existing_project_scan.md`、`references/project_guardrails_protocol.md` 为准 通用化重构：移除 Flutter 工作流，Forge CLI 成为纯通用 Agent 框架。 - 移除 `/flutter-forge` 命令及其 handler，工作流入口统一为 `/workflow` - 移除 `/forge-cli`、`/ff` 别名（迁移残留） - 清理 `settings.local.json` 中的 sed 迁移重命名规则 - 保留通用语言支持能力（DartParser、tree-sitter dart、checkDart 等） - 项目现在是纯通用 CLI Agent，可独立挂载任意工作流 完整 Agent 能力集成，对标 Claude Code 所有核心功能。 | 模块 | 说明 | |------|------| | `src/hooks/` | Hooks 系统，支持 5 种事件钩子 | | `src/plugins/` | 插件系统，支持 commands/agents/skills/hooks/mcp | | `src/mcp/` | MCP 客户端，支持外
- `CHEATSHEET.md`：> **触发方式**：`/forge-cli`（推荐，100% 可靠）或 `ff-`（快捷，尽力识别） > 完整触发词与匹配规则：[references/trigger_words.md](references/trigger_words.md) ff-fast 改登录页按钮颜色，按现有主题色 ff-fast 修复订单列表空态文案 ff-fast 会员页加一个局部 loading ff-fast 跑一下 analyze/test，能修的直接修 ff- 新建商品详情页，包含轮播图、价格、规格选择、底部购买按钮 ff- 新建订单列表页，支持筛选、下拉刷新、分页和空态 ff- 根据这份 PRD 做会员中心页，先拆结构再实现 ff- 完成邀请唤起 app 后的授权弹窗、录制流程和提示栏联动 ff- 登录成功后按身份跳转不同首页，并处理 token 过期回流 ff- 优化个人中心页面视觉层级和卡片布局 ff- 按这张截图调整首页首屏视觉，不改业务逻辑 ff- 帮我做包体积优化 ff- review 当前路由和状态管理接入是否一致 ff- 把旧目录结构迁移到 feature-first，但先给迁移方案 ff- 这是迭代中的 项目。先扫描项目结构，生成 project_guardrails，不要写代码。 ff- 校验当前 project_guardrails 和项目实际代码是否一致 ff- 我想做一个习惯打卡 项目 app，先共创需求、风格和第一版页面 ff- 新 项目，用 business profile，先定目录、状态管理、路由和网络层
- `CONTRIBUTING.md`：Forge CLI is a workflow skill for AI-assisted 项目开发. Contributions should improve how the skill routes tasks, reads project context, handles incomplete input, or keeps generated work aligned with an existing 项目代码库. - Clearer task-routing rules in `SKILL.md`. - Better reference material under `references/`. - Real validation logs from actual 项目. - Installation, diagnosis, and compatibility fixes. - More precise guardrails fields or examples. - Bug reports where the skill chose the wrong workflow. 1. Keep `SKILL.md` focused on orchestration. Put detailed rules in `references/`. 2. Keep version metadata consistent when publishing a release: `VERSION`, `.skillhub.json`, `README.md`, and `CHANGELO
- `OPEN_SOURCE_CHECKLIST.md`：Use this checklist before publishing a GitHub release or asking external users to try Forge CLI. - [x] Add an open-source license. - [x] Keep `VERSION`, `.skillhub.json`, and README version text consistent. - [x] Document installation through `npx skills add`. - [x] Document git clone fallback installation. - [x] Add contribution guidelines. - [x] Add issue templates. - [x] Add release validation scripts for version metadata, rule-card schema, and route golden cases. - [x] Add a short demo transcript. - [x] Add 项目栈检测 checks for rule-card evidence. - [ ] Add at least one real validation log from a project. - [ ] Add screenshots or a recording showing the workflow in action. Run: scripts/valid

## 技术信号

- 语言/文件类型：javascript、json、markdown、python、typescript、yaml
- Node.js / JavaScript 生态
- TypeScript
- 关键依赖：@ai-sdk/openai、@types/react、ink、ink-text-input、openai、react、tsup、vitest
- 配置文件：
  - `package.json`
  - `tsconfig.json`
  - `tsup.config.ts`
  - `vitest.config.ts`

## 文档信号

- `AGENTS.md` - Memory Context
- `CHANGELOG.md` - Changelog
- `CHEATSHEET.md` - Forge CLI Cheatsheet
- `CONTRIBUTING.md` - Contributing
- `OPEN_SOURCE_CHECKLIST.md` - Open Source Checklist
- `QUICKSTART.md` - Forge CLI Quickstart
- `README.md` - Forge CLI
- `ROADMAP.md` - Forge CLI 执行计划
- `SKILL.md` - Forge CLI
- `USAGE.md` - Forge CLI CLI Agent 使用指南
- `VERIFICATION.md` - Forge CLI CLI Agent 验证清单
- `docs/flutter-forge-integration-plan.md` - Flutter Forge 接入 forge-cli 完整执行计划
- `docs/界面设计参考/01-整体布局架构.md` - 整体布局架构
- `docs/界面设计参考/02-状态显示机制.md` - 状态显示机制
- `docs/界面设计参考/03-颜色系统.md` - 颜色系统
- `docs/界面设计参考/04-符号系统.md` - 符号系统
- `docs/界面设计参考/05-输入输出模式.md` - 输入输出模式
- `docs/界面设计参考/06-配置向导流程.md` - 配置向导流程
- `docs/界面设计参考/07-异步任务反馈.md` - 异步任务反馈
- `docs/界面设计参考/08-文本排版规范.md` - 文本排版规范

## 源码与测试

- 源码文件：132
- 测试文件：8

## 入口与命令

- 可能入口文件：
  - `src/agent/index.ts`
  - `src/agents/index.ts`
  - `src/cli/index.ts`
  - `src/confidence/index.ts`
  - `src/config/index.ts`
  - `src/github/index.ts`
  - `src/hooks/index.ts`
  - `src/learning/index.ts`
  - `src/llm/index.ts`
  - `src/main.ts`
  - `src/mcp/index.ts`
  - `src/memory/index.ts`
- 配置命令：
  - `package.json -> build: tsup`
  - `package.json -> dev: tsup --watch`
  - `package.json -> start: node dist/main.js`
  - `package.json -> test: vitest run`
  - `package.json -> test:coverage: vitest run --coverage`
  - `package.json -> test:watch: vitest`
  - `package.json -> typecheck: tsc --noEmit`

## 测试与质量门禁

- `package.json -> test: vitest run`
- `package.json -> test:coverage: vitest run --coverage`
- `package.json -> test:watch: vitest`
- `package.json -> typecheck: tsc --noEmit`

## 主要模块

- `.`：19 个文件；角色：配置、文档、其他、源码
- `.claude`：1 个文件；角色：源码
- `config`：1 个文件；角色：源码
- `docs`：24 个文件；角色：文档
- `examples`：5 个文件；角色：源码
- `memory`：2 个文件；角色：源码
- `pm-memory`：1 个文件；角色：文档
- `pm-output`：1 个文件；角色：文档
- `references`：40 个文件；角色：文档
- `scripts`：27 个文件；角色：文档、其他、源码
- `src`：3 个文件；角色：源码
- `src/agent`：3 个文件；角色：源码
- `src/agents`：7 个文件；角色：文档、源码
- `src/cli`：30 个文件；角色：源码、测试
- `src/confidence`：3 个文件；角色：源码
- `src/config`：3 个文件；角色：源码
- `src/gate`：1 个文件；角色：源码
- `src/github`：3 个文件；角色：源码
- `src/hooks`：3 个文件；角色：源码
- `src/learning`：3 个文件；角色：源码

## 全貌补充文件

- `map/runtime-flow.md`：从入口、CLI、执行器、客户端和注册器文件推断的运行链路入口。
- `map/contracts.md`：协议、类型、schema、配置、工具、工作流和权限相关文件索引。
- `map/risk-map.md`：轻量风险地图，包括大文件、高导入文件、缺测试模块和关键路径。
- `map/worktree.md`：当前 git 分支与未提交改动快照。
- `map/skill-summary.md`：Skill 项目的触发规则、资源布局、验证与恢复提示。
- `map/agent-summary.md`：Agent 项目的行为协议、工具链路、状态与恢复提示。

## 后续建议阅读

- `AGENTS.md`
- `CHANGELOG.md`
- `CHEATSHEET.md`
- `CONTRIBUTING.md`
- `OPEN_SOURCE_CHECKLIST.md`
- `QUICKSTART.md`
- `README.md`
- `ROADMAP.md`
- `package.json`
- `tsconfig.json`
- `tsup.config.ts`
- `vitest.config.ts`
- `.claude/settings.local.json`
- `config/default.yaml`
- `examples/ast-demo.ts`
- `examples/phase5-demo.ts`
- `examples/tree-sitter-demo.ts`
- `examples/ui-demo.ts`
- `examples/web-fetch-demo.ts`
- `memory/global_preferences.yaml`
- `memory/runtime/current_task.template.yaml`
- `package-lock.json`
- `scripts/controller.py`
- `scripts/detect_project_root_state.py`

## 风险与未知点

- 当前是轻量扫描；修改前仍需对照源码验证行为。
- import 关系可能包含未解析的外部包。
- 产品定位、真实运行链路和安全边界只能从源码/文档推断；大型改动前应读取 `map/runtime-flow.md`、`map/contracts.md` 和相关源码。
