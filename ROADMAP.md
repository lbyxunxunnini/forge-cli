# Flutter Forge 执行计划

> 整合自 MISSING.md（差距分析）与 LONG_TERM_PLAN.md（长期规划）
> 目标：达到 Claude Code 70%+ 核心体验，聚焦 Flutter 专项优化
> 更新时间：2026-06-04

---

## 一、已实现能力

| 能力 | 状态 | 说明 |
|------|------|------|
| CLI REPL 交互 | ✅ | readline 交互式界面、状态栏、Ctrl+C 两步退出 |
| 多模型支持 | ✅ | DeepSeek, Qwen, MiMo (OpenAI 兼容) |
| 流式输出 | ✅ | REPL 已接入 executeStream，逐字输出 + 工具调用可视化 |
| 工具调用 | ✅ | 20 个工具：文件读写、命令执行、Glob/Grep/LS、记忆、项目扫描等 |
| 上下文压缩 | ✅ | 重要性标记、Token 预算管理、工具结果裁剪、LLM 摘要生成 |
| 记忆系统 | ✅ | 四类记忆、写入门槛（置信度）、去重合并、记忆压缩、过期淘汰、语义召回、compress_memory 工具 |
| 多 Agent 架构 | ✅ | 5 个角色 + 主控编排器 |
| 工作流引擎 | ✅ | S0-S6 阶段 + C0-C3 共创轨道、8 种路由模式 |
| Session 持久化 | ✅ | YAML 文件存储 |
| 门禁检查 | ✅ | G01-G16 门禁规则（TS + Python 双实现） |
| Hooks 系统 | ✅ | PreToolUse/PostToolUse/SessionStart/Stop/PromptSubmit |
| 插件系统 | ✅ | commands/agents/skills/hooks/mcp 架构 |
| MCP 支持 | ✅ | Model Context Protocol 外部工具集成 |
| Agent 并行执行 | ✅ | AgentPool 支持多 Agent 并行 |
| GitHub 集成 | ✅ | PR 审查、Issue 管理、git blame |
| 安全检查 | ✅ | 9 类检测（注入/XSS/SQL/凭证暴露等） |
| 置信度评分 | ✅ | 0-100 分制 |
| 交互式学习 | ✅ | 决策点提示用户贡献 |
| 插件开发工具 | ✅ | 模板创建、验证 |
| 快速/自动模式 | ✅ | ff-fast 轻量跳过、ff-a 高风险中断 |
| 可观测性（Trace） | ✅ | 全链路追踪：LLM 调用、工具调用、状态变化、错误记录，磁盘持久化 |
| 失败重试策略 | ✅ | 错误分类（transient/permanent/unknown）+ 指数退避 + 工具重试 |
| 执行摘要 | ✅ | 工具明细、错误摘要、阶段进展、自动建议，/trace 命令查看 |

---

## 二、P0 — 必须（不做无法流畅使用）

### 1. 流式输出接入

**现状**：`repl.ts` 调用 `orchestrator.execute()` 整块返回，用户只看到 spinner → 一大段文字。
**目标**：接入 `executeStream()`，逐字流式显示，体感对齐 Claude Code。
**工作量**：1 天

### 2. Glob / Grep / LS 工具

**现状**：`list_files` 和 `search_files` 基于 `readdirSync` + 正则，能力弱。
**目标**：实现文件模式匹配（`**/*.dart`）、内容搜索（ripgrep 级别）、目录结构列出。
**为什么必须**：没有这些 Agent 无法自动探索项目，用户必须手动告知文件位置。
**工作量**：2.5 天

| 工具 | 用途 | 说明 |
|------|------|------|
| Glob | 按模式搜索文件 | 支持 `**/*.dart`、`src/**/*.ts` 等 |
| Grep | 按内容搜索 | 正则匹配、文件类型过滤、上下文行 |
| LS | 列出目录结构 | 树形展示、忽略 node_modules 等 |

### 3. 上下文压缩

**现状**：简单截断旧消息，长对话丢失关键信息。
**目标**：

- 重要性标记（P0）— 标记每条消息重要性
- 选择性保留（P0）— 保留重要消息，丢弃低价值消息
- 摘要生成（P1）— 压缩早期消息为摘要
- 工具结果裁剪（P1）— 大文件内容只保留关键部分

**工作量**：3 天

### 4. 记忆系统

**现状**：`memory/` 目录只有模板，无实际跨会话记忆。
**目标**：四层记忆架构

```
L1: 工作记忆 (当前上下文)    → 当前对话消息、临时变量     ✅ 已有
L2: 短期记忆 (Session)      → Session 持久化、阶段历史   ✅ 已有
L3: 长期记忆 (跨 Session)   → 用户偏好、项目知识         ❌ 缺失
L4: 永久记忆 (配置)         → 系统配置、角色定义         ✅ 已有
```

**存储结构**：
```
~/.flutter-forge/memory/
├── MEMORY.md              # 索引（自动加载到上下文）
├── user_role.md           # 用户角色、偏好
├── project_structure.md   # 项目架构知识
├── feedback_testing.md    # 纠正/确认记录
└── references.md          # 外部资源指针
```

**工作量**：3 天

**P0 合计**：~2 周

---

## 三、P1 — 重要（严重影响体验）

### 5. 工具执行可视化

**现状**：用户只看到 spinner + "思考中..."，不知道 Agent 在做什么。
**目标**：实时显示当前调用的工具名、参数、执行状态。
**工作量**：1 天

### 6. 代码理解工具

**现状**：Agent 不理解代码结构，改代码靠猜。
**目标**：

| 工具 | 用途 | 优先级 | 工作量 |
|------|------|--------|--------|
| AST 解析 | 解析代码结构 | P0 | 3 天 |
| 符号搜索 | 按函数/类名定位 | P1 | 2 天 |
| 依赖图 | 模块间关系 | P2 | 3 天 |
| 引用查找 | 谁在用这个符号 | P2 | 2 天 |

### 7. WebFetch / WebSearch

**现状**：无网络能力，Agent 无法查文档、搜解决方案。
**目标**：获取网页内容 + 网络搜索。
**工作量**：4 天

### 8. 状态机增强

**现状**：状态转换无验证、无历史、无恢复。
**目标**：

- 严格的状态转换验证
- 完整的状态历史记录
- 崩溃后精确恢复
- 状态与阶段统一

**工作量**：3 天

### 9. 调试模式

**现状**：无 `--debug` 标志。
**目标**：verbose 日志、执行时间追踪、工具调用详情。
**工作量**：1 天
**进展**：Trace 系统已实现（`src/utils/trace.ts`），支持事件记录、统计、持久化，`/trace` 命令可查看摘要

### 10. 输入框布局优化

**现状**：输入框在最底部。
**目标**：输入框在两条分割线中间（对齐 Claude Code）。
**工作量**：1 天

**P1 合计**：~2-3 周

---

## 四、P2 — 提升质量

| 能力 | 工作量 | 说明 |
|------|--------|------|
| 快捷键（Ctrl+L 清屏、Tab 补全、Ctrl+K/U 行编辑） | 2 天 | CLI 体验 |
| 结构化编辑（改签名、重命名） | 3 天 | 代码操作 |
| Diff 生成（变更预览） | 2 天 | 代码操作 |
| Lint / 类型检查集成 | 2 天 | 代码验证 |
| 测试执行集成 | 2 天 | 代码验证 |
| Git 操作 / 分支管理 | 3 天 | 项目管理 |
| 沙箱执行 | 中 | 安全性 |
| IDE 集成（VS Code / JetBrains） | 2 周 | 用户体验 |
| 插件市场 | 长期 | 生态建设 |

---

## 五、工具生态对比

| 工具 | Claude Code | Flutter Forge |
|------|-------------|---------------|
| Glob | 文件模式匹配 | ✅ globTool |
| Grep | 内容搜索 (ripgrep) | ✅ grepTool |
| LS | 目录列表 | ✅ lsTool |
| Read | 文件读取（图片/PDF） | ✅ readFile |
| Edit | 精确编辑 | ✅ editFile |
| Write | 文件写入 | ✅ writeFile |
| Bash | 命令执行 | ✅ runCommand |
| Agent | 子 Agent 启动 | ✅ AgentPool |
| WebFetch | 网页获取 | ❌ 缺失 |
| WebSearch | 网络搜索 | ❌ 缺失 |
| TodoWrite | 任务管理 | ❌ 缺失 |
| Trace | 全链路追踪 | ✅ Tracer（事件记录 + 统计 + 持久化） |
| Retry | 失败重试 | ✅ RetryExecutor（错误分类 + 指数退避） |
| Summary | 执行摘要 | ✅ generateSummary（工具明细 + 错误摘要 + 建议） |

---

## 六、无法弥补的差距

1. **LLM 模型能力** — Claude Opus/Sonnet 是闭源顶级模型，取决于模型提供商
2. **Anthropic 官方支持** — Claude Code 有专门团队维护
3. **生态系统规模** — 社区、插件数量

**策略**：不完全复制 Claude Code，聚焦 Flutter 专项优化 + 中文支持 + 国产模型。

---

## 七、实施路线

### Phase 1：核心体验打通（第 1-2 周）

- [x] 流式输出接入 REPL（repl.ts 改用 executeStream）
- [x] Glob / Grep / LS 工具（globTool, grepTool, lsTool 已注册）
- [x] 工具执行可视化（tool-call 事件实时打印 ⚡ 工具名 + 参数）

**验收**：Agent 能自动探索项目、流式输出、用户能看到工具调用过程。

### Phase 2：上下文与记忆（第 3-4 周）

- [x] 上下文压缩（重要性标记 + Token 预算管理 + 工具结果裁剪 + LLM 摘要生成）
- [x] 记忆系统（MEMORY.md 索引 + 用户/项目/反馈/参考四类记忆 + save/read/delete_memory 工具）

**验收**：长对话不失忆、跨会话记住用户偏好。

### Phase 3：代码理解与网络（第 5-7 周）

- [ ] AST 解析 + 符号搜索
- [ ] WebFetch / WebSearch
- [ ] 状态机增强
- [x] 调试模式（Trace 系统已实现：全链路追踪 + /trace 命令 + 执行摘要）
- [x] 失败重试策略（错误分类 + 指数退避 + 工具重试）

**验收**：Agent 理解代码结构、能查文档、状态可恢复。

### Phase 4：打磨与生态（第 8 周+）

- [ ] 快捷键 / 输入框布局
- [ ] 结构化编辑 / Diff / Lint / 测试
- [ ] Git 操作
- [ ] 插件市场 / IDE 集成

---

## 八、缓存命中率（持续优化）

**目标**：同一对话内连续请求命中率 90%

- [x] 前缀稳定截断策略（保留前 N 条 + 最近窗口）
- [x] temperature 固定 0.7
- [x] system prompt 稳定
- [x] tools 定义稳定
- [ ] 可观测缓存命中率指标
- [x] 全链路 Trace 系统（LLM 调用、工具调用、状态变化、错误记录）

---

## 九、工作流抽取（meta-skill）

**目标**：把 flutter-forge 从 skill 抽取为独立工作模式，支持快速接入新工作流

- [ ] 把 flutter-forge 抽成工作模式
- [ ] 制作 meta-skill（skill → 工作模式的转换流程）
- [ ] 提供模板项目，快速理解接入

**输入**：一个 skill 文件（如 SKILL.md）
**输出**：自动注册为工作模式，可通过命令切换

---

## 十、更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-05-26 | 初始创建，整合 MISSING.md 与 LONG_TERM_PLAN.md |
| 2026-06-04 | **可观测性系统**：新增 `src/utils/trace.ts`（Tracer 收集器）、`src/utils/retry.ts`（重试执行器 + 错误分类器）、`src/utils/summary.ts`（执行摘要生成器）。集成到 `loop-v2.ts`（AgentLoop）和 `orchestrator.ts`（AgentOrchestrator），新增 `/trace` CLI 命令。 |
| 2026-06-04 | **记忆系统增强**：新增 `src/memory/threshold.ts`（写入门槛）、`src/memory/dedup.ts`（去重合并）、`src/memory/compress.ts`（记忆压缩 + 过期淘汰）。MemoryManager 增加置信度、访问计数、标签、稳定性标记。新增 `compress_memory` 工具，`recall()` 支持语义召回和多维排序。 |
