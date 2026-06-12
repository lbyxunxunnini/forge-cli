# Agent PM Issue Ledger

本文件记录 `agent-pm` 审查发现的问题生命周期，避免后续审查重复报告已处理问题。

## forge-cli — 2026-05-18

### Fixed

| issue_id | severity | status | summary | verification |
|---|---:|---|---|---|
| APM-WORKFLOW-001 | P1 | fixed | 轻量 / ff-fast 日志数量限制与 Mandatory Checklist 输出要求冲突 | 明确 checklist 是结构化校验产物，不计入主要 `[f-forge]` 日志限制；轻量任务顺序为开始日志 → checklist → 校验 PASS → 完成日志 |
| APM-WORKFLOW-002 | P1 | fixed | `draft` guardrails状态在“提示确认”和“advisory 继续执行”之间不收敛 | 定义 `draft` 默认 advisory，只有首次接入、用户询问/确认、提醒阈值或高风险冲突时中断确认 |
| APM-TOOL-001 | P1 | fixed | `validate_output.sh` 无法验证进入日志、模式顺序和完成日志 | 增加进入日志、模式先于阶段、`--require-complete` 完成日志检查，并在 release validation 中加入正反例 |
| APM-TOOL-002 | P1 | fixed | `classify_task.sh` 的 `should_load_project_guardrails` 与运行协议不一致 | 按任务类型和置信度输出 `should_load_project_guardrails` 与 `project_guardrails_check` |
| APM-LOGIC-001 | P1 | fixed | `ff-apple` / `ff-fastlane` 被误判为 `ff-a` / `ff-fast` 策略 | 触发词策略 regex 改为空白或字符串结束边界，并加入 golden cases |
| APM-OUTPUT-001 | P2 | fixed | 输出规范“所有对外输出必须带 `[f-forge]`”与列表/YAML/diff 示例冲突 | 改为 workflow 状态行必须带前缀，解释列表、选项、YAML checklist、命令输出和 diff 可跟随状态行 |
| APM-DESIGN-001 | P2 | fixed | `SKILL.md` 与 `trigger_words.md` 重复维护完整触发词列表 | `SKILL.md` 改为引用 `trigger_words.md`，不再内联完整列表 |
| APM-WORKFLOW-003 | P1 | fixed | 轻量任务guardrails启动跳过与写操作 hook 硬阻断冲突 | `classify_task.sh --write-gate` 写入 task gate；hook 仅在 gate 明确允许且目标文件不触碰架构边界时放行无guardrails轻量/直通写入 |
| APM-WORKFLOW-004 | P1 | fixed | 空触发和首次接入提示被误分到中等任务 | `classify_task.sh` 增加 `等待态` 与 `启动握手`；route golden 增加 `ff-` 空触发和首次接入用例 |
| APM-TOOL-003 | P1 | fixed | guardrails状态日志被 `validate_output.sh` 误判为非法角色 | guardrails初始化、转正、刷新日志统一改为 `[f-forge] 主控：...`，release gate 增加正反例 |
| APM-TOOL-004 | P1 | fixed | `validate_output.sh --require-s4` 未覆盖 UI 优化/架构级任务，且未检查 S2 到 S4 之间的角色结果日志 | 将 UI 优化/架构级任务纳入 S2→S4 校验，新增“缺 S2”和“缺角色结论”的 release gate 反例 |
| APM-TOOL-005 | P1 | fixed | 中等任务只有开始/完成日志时也能通过校验，导致实现前缺少角色分析与执行策略 | `validate_output.sh --require-complete` 对中等及以上任务要求非模式/非完成角色结果日志，release gate 增加中等任务正反例 |
| APM-SAFETY-001 | P0 | fixed | 简化/抽取/复用业务链路时未先声明改动范围与禁改范围，标准流程可能未确认就写代码 | 结构性链路收敛路由到架构级；中等及以上写前必须输出改动契约，标准 `ff-` 未确认不得写；release gate 增加缺改动契约反例 |
| APM-SAFETY-002 | P0 | superseded | 曾将轻量、`ff-fast`、`ff-a` 全部纳入最强写前确认，后续被产品口径纠正为过度门禁 | 现口径：轻量、直通、`ff-a` 豁免最强写前确认等待；中等及以上非 `ff-a` 仍需改动契约和用户确认 |
| APM-SESSION-001 | P0 | fixed | 等待用户输入、截图、文稿或上下文压缩时缺少可恢复等待态，容易退出工作模式 | `ff_session.sh` 增加等待态字段、宿主路径解析和 `wait` 命令；运行时要求等待前写 session、补材料时优先恢复 |
| APM-TOOL-006 | P0 | fixed | 整段工作流输出缺少 `[f-forge]` 前缀时 `validate_output.sh` 仍会直接通过 | 校验器新增“至少一条 `[f-forge]` 状态行”硬失败，并拦截裸 `模式/阶段/本轮完成` 工作流状态行 |
| APM-TOOL-007 | P1 | fixed | `ff-fast` / `ff-a` 的策略启动日志与全自动摘要没有真正门禁 | `validate_output.sh` 新增 `--expect-fast` / `--expect-autonomous`，发布回归覆盖缺快速策略日志、缺全自动摘要的反例 |
| APM-TOOL-008 | P1 | fixed | 重流程阶段链只校到 `S2→S4`，缺 `S1` 或 `S5` 仍可通过 | 收口校验新增最小阶段链：`功能/页面开发` 必须含 `S1`，重流程模式必须含 `S5` |
| APM-DESIGN-004 | P1 | fixed | “角色按需输出”没有落成可执行门禁，导致缺角色结论时仍可通过 | 收口校验新增 `S1→S2` 间角色日志与 `S5` 后 `验证工程师` 日志要求，避免只靠任意一条角色结论过门 |
| APM-LOGIC-002 | P2 | fixed | `draft_reminder_count` 只有文档承诺，没有脚本状态实现 | `check_project_guardrails.sh` 增加 `draft_reminder_count` 输出、`--increment-reminder` 和 `--reset-reminder` |
| APM-DESIGN-002 | P2 | fixed | 路由 golden 复制分类逻辑，不能验证真实脚本 | `route_golden_tests.py` 改为直接调用 `scripts/classify_task.sh` 并断言输出字段 |
| APM-DESIGN-003 | P1 | fixed | `SKILL.md` description 只引用 `references/trigger_words.md`，宿主召回不读取 reference 导致显式触发词失灵 | description 直接内联正式触发入口，`trigger_words.md` 改为要求 frontmatter 保留触发词，详细匹配规则仍单源维护 |

### Candidate Rules

- CR-2026-05-18-001: 可见性协议若声明 P0 日志顺序，校验脚本必须覆盖“进入日志、模式日志、阶段顺序、收口完成日志”的正反例。
- CR-2026-05-18-002: 预分类脚本输出的辅助字段必须与主运行协议的分级表保持一致，否则 LLM 会优先消费机器输出并偏离文档协议。
- CR-2026-05-18-003: 当 hook 执行硬阻断而主协议允许轻量例外时，必须有机器可读 task gate 传递最终路由结果，不能只靠自然语言说明。
- CR-2026-05-18-004: golden tests 不应复制被测脚本的核心逻辑；应调用真实入口并断言输出字段，避免实现和测试一起漂移。
