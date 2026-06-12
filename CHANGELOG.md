# Changelog

说明：

- `0.2.x` 中出现的 `legacy_project_scan.md`、`~/.forge-cli/projects/*.rule_card.yaml` 等表述保留为当时版本的历史事实
- 当前现行入口与项目护栏路径策略以 `references/existing_project_entry.md`、`references/existing_project_scan.md`、`references/project_guardrails_protocol.md` 为准

## v1.0.0

通用化重构：移除 Flutter 工作流，Forge CLI 成为纯通用 Agent 框架。

### 变更

- 移除 `/flutter-forge` 命令及其 handler，工作流入口统一为 `/workflow`
- 移除 `/forge-cli`、`/ff` 别名（迁移残留）
- 清理 `settings.local.json` 中的 sed 迁移重命名规则
- 保留通用语言支持能力（DartParser、tree-sitter dart、checkDart 等）
- 项目现在是纯通用 CLI Agent，可独立挂载任意工作流

## v0.5.0

完整 Agent 能力集成，对标 Claude Code 所有核心功能。

### 新增模块

| 模块 | 说明 |
|------|------|
| `src/hooks/` | Hooks 系统，支持 5 种事件钩子 |
| `src/plugins/` | 插件系统，支持 commands/agents/skills/hooks/mcp |
| `src/mcp/` | MCP 客户端，支持外部工具集成 |
| `src/agents/pool.ts` | Agent 池，支持多 Agent 并行执行 |
| `src/github/` | GitHub 集成，支持 PR/Issue/git blame |
| `src/security/` | 安全钩子增强，9 大安全类别检测 |
| `src/confidence/` | 置信度评分，0-100 分制 |
| `src/learning/` | 交互式学习模式 |
| `src/plugin-dev/` | 插件开发工具，5 种模板 |

### 新增命令

| 命令 | 说明 |
|------|------|
| `/plugins` | 查看已加载插件 |
| `/mcp` | 查看 MCP 服务器状态 |
| `/security` | 查看安全检查配置 |
| `/learn` | 切换学习模式 |
| `/review` | 查看代码审查配置 |
| `/hook` | 查看已注册钩子 |

### 版本更新

- `src/version.ts`: 0.4.0 → 0.5.0
- `package.json`: 0.4.0 → 0.5.0

## v0.4.0

Session 管理 + 门禁检查 + 日志规范 + 快速/全自动模式。

### 新增模块

| 模块 | 说明 |
|------|------|
| `src/session/` | Session 持久化管理 |
| `src/gate/` | 门禁检查器 (G01-G16) |
| `src/output/` | [f-forge] 日志规范 |
| `src/modes/` | ff-fast/ff-a 模式 |

### 新增命令

| 命令 | 说明 |
|------|------|
| `/fast` | 切换 ff-fast 快速模式 |
| `/auto` | 切换 ff-a 全自动模式 |
| `/session` | 查看当前 session 信息 |

## v0.3.0

强门禁闭环 + 维护面收敛。

### 强门禁闭环

- **Global Constitution 落地**：`SKILL.md` 新增全局宪法，明确未确认目标/范围/验收/约束不得执行、未冻结当前子单元不得实现、未验证不得宣称完成、未拿到退出许可不得离开工作模式
- **角色合同硬化**：5 张角色卡重写为 task-driver 风格的硬合同，统一采用“仅允许 / 明确禁止 / 违规后强制动作”的结构
- **session 状态扩展**：新增 `目标状态`、`范围状态`、`验收状态`、`约束状态`、`当前子单元`、`子单元状态`、`验证状态`、`超范围风险`、`计划冲突状态`、`工作模式锁`、`退出许可` 等字段
- **gate 执法补齐**：`gate_check.py` 新增 `core_definition`、`current_work_unit`、`scope_expansion`、`plan_conflict`、`mode_exit`、`verification_truth` 等门禁，阻断偷跑、假完成和提前收口
- **controller 收口增强**：`controller.py` 补充新状态注入和 premature exit 判定，确保未完成任务优先恢复而不是伪装成新任务

### 维护面收敛

- **发布校验拆分**：`validate_release.sh` 从单体脚本拆为 `metadata / guardrails / session / gates / output_protocol` 5 个可独立维护的检查模块
- **维护导航新增**：新增 `references/maintenance_map.md`，明确改阶段门禁、session 字段、角色边界、策略豁免、发布校验时的最小同步文件集合
- **核心主表新增**：新增 `references/core_contracts.yaml`，集中记录 session 核心字段、gate 名称、策略边界和维护面分组，降低规则定义分散度
- **load_map 对齐**：`references/load_map.md` 新增 `core_contracts.yaml` 和 `maintenance_map.md` 入口，减少维护者搜索成本

## v0.2.6

门禁代码化 + 角色边界硬隔离 + 语义清理（rule_card → project_guardrails）。

### 门禁代码化（gate_check.py）

- **Gate 2（S2 强制推进）**：S2 已确认 + 改动契约已冻结时，阻断 metadata/test/project_config 写入，只放行实现类——LLM 想留在 S2 输出"结论"就写不了代码，必须先切 S4
- **Gate 3（S5 验证隔离）**：S5 验证阶段阻断实现/配置文件写入，只允许测试和元数据
- **Gate 4（阶段日志强制）**：实现类写入前检查 session `最近操作` 是否包含 `[f-forge]` 前缀，缺失则阻断
- **Gate 5（角色边界硬隔离）**：基于 session `活跃代理` 字段强制执行文件写入权限——需求/UI/架构分析师只能写 metadata，页面工程师只能写实现和测试，验证工程师只能写测试，越权写入直接 block
- **Iron Law 门禁**：无 session 时阻断实现类写入（之前允许一切）

### 角色隔离执行

- **controller.py 扩展**：新增 `generate-agent-prompt` 子命令，读取 `references/roles/<role>.md` 角色合约，组装上下文，生成隔离提示词；恢复场景自动注入恢复上下文
- **agent_isolation_protocol.md**：新增协议文档，定义角色隔离架构、上下文传递、降级路径和代码强制边界
- **SKILL.md**：新增"角色隔离执行"段落，描述子代理启动流程和角色边界硬隔离

### 上下文注入与恢复增强

- **hook 上下文提醒**：写操作时 stderr 输出当前角色、角色边界、阶段、模式——LLM 在工具结果中能看到角色约束
- **恢复指令增强**：`ff_session.sh` 恢复指令自动附带角色合约路径和护栏摘要
- **validate_output_prefix.sh**：新增独立脚本校验 `[f-forge]` 前缀

### 语义清理（rule_card → project_guardrails）

- **术语统一**：30+ 参考文档从 `rule_card/规则卡` 迁移到 `project_guardrails/项目护栏`
- **脚本重命名**：`check_rule_card.sh` → `check_project_guardrails.sh`、`init_rule_card.py` → `init_project_guardrails.py`、`hook_check_rule_card.sh` → `hook_check_project_guardrails.sh`、`validate_rule_card.py` → `validate_project_guardrails.py`、`validate_rule_card_resolution.py` → `validate_project_guardrails_resolution.py`
- **草案流程移除**：不再生成 `_draft.yaml`，脚本直接写 `*.project_guardrails.yaml`
- **stub 清理**：删除 4 个旧 stub 脚本、2 个旧模板、1 个旧协议文档
- **controller.py**：新增最小控制器，负责 session 检查、恢复检测、角色选择、门禁检查

## v0.2.5

补强 forge-cli 的日志门禁，修复不同模型下可见性输出不完整却仍被校验放行的问题。

### 日志校验强化

- **缺少 `[f-forge]` 硬失败**：`validate_output.sh` 现在会拦截整段工作流输出没有任何 `[f-forge]` 状态行的情况，同时对裸 `模式/阶段/本轮完成` 状态行直接失败
- **策略日志显式门禁**：新增 `--expect-fast` 与 `--expect-autonomous`，分别校验 `ff-fast` 启动日志、`ff-a` 启动日志与全自动摘要
- **重流程阶段链补齐**：`功能开发` / `页面开发` 收口时必须包含 `S1`，所有重流程模式必须包含 `S5`，避免只校 `S2→S4`
- **角色门禁落地**：新增 `S1→S2` 间角色结果日志要求，以及 `S5` 后 `验证工程师` 日志要求，减少“有模式没角色”或“有阶段没验证”的漏检

### 回归覆盖补齐

- **发布回归新增反例**：`validate_release.sh` 新增“整段无 `[f-forge]`”、“缺 `ff-fast` 启动日志”、“缺全自动摘要”、“页面开发缺 `S1`/`S5`”、“缺 `S1` 角色结论”等负例
- **协议文档同步**：`references/skill_visibility.md` 同步新增 fast/autonomous 校验参数和新的阶段链/角色链校验项，避免脚本与文档再次漂移

## v0.2.4

基于 agent-pm 最佳实践与产品维度审查的协议补全与设计优化。

### 最佳实践补全

- **Iron Law 新增**：SKILL.md 新增 Iron Law —— 需求/方案未确认且无 `auto_assumption` 时禁止写实现代码，覆盖所有模式和策略
- **类型标注**：SKILL.md 和 task_runtime_prompt.md 补充 `[Rigid]` / `[Flexible]` 标注（共 15 处），明确哪些规则不可动、哪些可适配
- **Red Flags 预判表**：task_runtime_prompt.md 新增执行过程中的自我欺骗预判（11 条规则，覆盖任务分类、阶段门禁、实现三个阶段）
- **工作流可视化**：新增 `references/workflow_diagram.md`，包含主工作流、阶段门禁、策略选择 3 张 digraph 流程图
- **中等任务合并确认**：范围明确时扫描结论、执行策略和改动契约可在同一条回复中连续输出，用户只需确认一次

### 验证工程师两阶段审查

- **规格合规 + 代码质量分离**：verify_agent checklist 拆为两阶段——先审"做了对的事"（规格合规），再审"事做得好"（代码质量），顺序不可颠倒
- **validate_checklist.py 同步**：verify_agent schema 更新，新增 `spec_compliance`、`contract_alignment`、`code_quality` 等字段

## v0.2.2

修复 forge-cli 流程掉链和输出格式回归。

### P0 流程闭环

- **S2→S4 硬阻断**：S2 方案确认完成后必须继续输出 `[f-forge] 阶段：S4 实现中` 并开始实现，不允许停在 S2 结论或等待下一步指令
- **阶段检查点文档化**：新增 `references/phase_checkpoint.md`，集中描述阶段切换、S2→S4 防掉链、角色日志和 session 恢复检查点
- **Session 状态持久化对齐**：阶段切换要求通过 `scripts/ff_session.sh` 写入宿主 session，避免手写 `.forge-cli/session.md` 与现有脚本格式冲突

### 输出格式校验

- **阶段全名校验**：`validate_output.sh` 新增完整阶段名检查，拦截 `S1 需求分析`、`S2 方案设计`、`S4 开发中` 等非法阶段名
- **裸结论拦截**：`validate_output.sh` 新增裸角色结论和裸分析结论检查，要求 `需求分析师：...`、`分析结论：...` 等输出必须改为 `[f-forge] 角色名：...`
- **S4 必达校验**：新增 `--require-s4` 参数，用于拦截页面开发/功能开发流程中 S2 后未进入 S4 的输出
- **发布回归用例**：`validate_release.sh` 覆盖非法阶段名、裸角色结论、裸分析结论、S2-only 默认校验、`--require-s4` 硬阻断和参数顺序兼容

## v0.2.1

P0 强制层闭环 + P1 路由脚本增强 + P2 文档精简。

### P0 强制层

- **修复 hook 循环依赖**：`hook_check_rule_card.sh` 改为自行调用 `check_rule_card.sh --json` 获取状态，不再依赖 LLM 写入状态文件；状态文件不存在时不再 fail-open 放行
- **修复 check_rule_card.sh JSON 输出 bug**：shell 变量替换 `false` 进入 Python 字符串导致 NameError，改为通过环境变量传参
- **hook 初始化白名单**：当工具调用本身是规则卡初始化/检查相关命令时放行，避免初始化死锁
- **Checklist 结构化**：5 个角色的 Mandatory Checklist 从 `[x]/[ ]` 自我陈述改为结构化 YAML 块输出，新增 `scripts/validate_checklist.py` 校验脚本
- **Checklist 校验 P0 化**：SKILL.md P0 规则新增"角色宣布放行前必须运行 validate_checklist.py 并确认 PASS"
- **validate_output.sh 强制化**：从"推荐运行"升级为 P0 强制，模式/阶段/完成日志输出后必须校验

### P1 路由脚本增强

- **classify_task.sh 输出扩展**：新增 `should_load_rule_card`、`required_phases`、`upgrade_signals` 字段，LLM 直接消费结构化路由结果
- **SKILL.md 减肥**：日志执行清单详细模板、阶段转换自检表格、规则优先级详细说明下沉到对应 reference 文件，主文档从 ~480 行压缩到 ~280 行

### P2 文档精简

- **触发词精简**：README 首屏只展示 `ff-` / `ff-fast` / `ff-a` 三种主推入口
- **新增"不适合"小节**：README 新增"什么情况下你不需要 Forge CLI"
- **PLAN_STATUS 合并**：内容合并到 CHANGELOG 末尾的路线图节，删除独立文件
- **归档交叉引用修复**：`validate_docs_sync.py` 新增归档文件断链检查

## v0.2.0

基于真实评测（v0.1.4 综合 3.5/5）的根因修复与资产精简。

- **规则卡执行 hook 化**：新增 `.claude/settings.json` preToolCall hook，规则卡 not_found 时系统级阻断，不再依赖 LLM 自觉
- **角色清单强制化**：5 个角色文件各添加 5 项 mandatory checklist，SKILL.md P0 规则新增"未完成 checklist 不得宣布角色结论"
- **Reference 文件瘦身**：63 文件精简为核心 + 归档两层，低频文件移入 `references/archive/`，load_map 同步更新
- **版本号格式统一**：`.skillhub.json` 与 `VERSION` 统一为 `v` 前缀格式（`v0.2.0`），消除 validate_release.sh 精确比较歧义
- **SKILL.md 路由步骤 1 精简**：拆为"执行检查"+"结果处理"表格，降级路径独立小节

## v0.1.5

基于 agent-pm 三次技术审查的语义真空修复与协议一致性补全。

- **等待态日志格式补全**：标准模式清单新增 `[f-forge] 等待态：任务未明确，等待用户输入`，解决等待态无合规日志导致 LLM 回退自然语言的问题
- **进入日志与模式日志解耦**：新增 `[f-forge] 进入 controller` 作为命中后第一条强制输出，模式日志作为第二步，解决"进入 skill"与"输出模式日志"绑定导致等待态无法输出的问题
- **P0 日志时序修正**：第一步触发条件从"路由判定完成后"改为"命中触发词后"，解决等待态场景下"判定未完成→不该输出"的死锁
- **session 恢复时序前置**：启动顺序中 session 恢复检查插入到等待态判定之前，明确"session 恢复 > 等待态判定"的执行路径
- **脚本路径降级说明**：路由第 1 条和 task_runtime_prompt.md 补充"脚本不存在或执行失败时按 rule_card_protocol.md 手动判定"，并新增脚本路径解析规则节
- **等待态追问后路由起点明确**：追问后从路由第 2 条重新判定，跳过规则卡检查
- **启动握手模式名补全**：SKILL.md 和 skill_visibility.md 标准模式清单补充启动握手
- **等待态追问话术模板**：skill_visibility.md 新增标准格式
- **task_runtime_prompt.md 去重**：去除与 SKILL.md 重复的日志时机定义，改为引用
- 同步更新 validate_output.sh 模式允许列表、P0 硬规则描述

## v0.1.4

基于 agent-pm 二次技术审查的指令清晰度与协议一致性修复。

- **修复规则卡初始化链路根因**：SKILL.md 路由步骤 1 从概念描述（"检查规则卡状态？"）改为明确脚本执行指令（"运行 `scripts/check_rule_card.sh`"），标注"必须执行的动作，不是可选判断"，解决 agent 跳过规则卡检查的问题
- 新增验证失败回退矩阵：quality_gates.md 定义 5 种失败类型的回退阶段和回退原则
- 规则卡草案超时计数改为持久化到 session.md，支持跨会话累积
- 修正 advisor_collaboration.md 提问数量矛盾：明确"1-3 个问题"是总数，每轮仍只放 1 个
- existing_project_consulting.md 精简为存量项目特有场景，通用格式引用 advisor_collaboration.md
- 新增低置信度判定标准：engineering_heuristics.md 定义 5 种触发条件和处理方式
- 新增长任务并行 5 项前提条件内联到 SKILL.md，不再需要跳转查找
- 明确 validate_output.sh 是推荐运行而非强制，P0 日志规则不依赖脚本
- code_review_mode.md 开头增加与 S5 验证的边界区分说明
- existing_project_entry.md 补充"已加载规则卡"的启动握手输出模板
- SKILL.md 补全 "ff a"（带空格）等价写法说明
- 修正"完整流程"命名歧义：明确为内部执行协议，对外以功能开发/页面开发呈现
- 对齐等待态与 session 恢复的优先级关系

## v0.1.3

基于 agent-pm 技术审查修复与 README 结构优化。

- 修复 "ff a" 触发词不一致：SKILL.md 触发条件补充 "ff a"，classify_task.sh 正则修复 `ff a` 不匹配问题
- 修复路由顺序重复维护：task_runtime_prompt.md 路由判定改为引用 SKILL.md，消除两处不一致
- 修复脚本失败回退缺失：check_rule_card.sh 和 classify_task.sh 脚本不存在或执行失败时补充降级路径
- 修复 ff-fast 升级后日志限额冲突：明确升级日志不计入轻量任务 2 条限额
- 优化 Session 恢复判定：增加强匹配/弱匹配/反向排除三级判定规则，减少歧义
- 补充"等待态"行为约束：上下文保持、恢复方式、超时处理
- 新增 S6 完成阶段定义：收口状态 + 完成日志 + 规则卡出口 + 退出
- 明确 validate_output.sh 校验频率：只在模式/阶段/完成日志后运行
- 规则卡草案超时"轮"改为"次触发 forge-cli 任务"，定义更明确
- 10 秒测试第二条改为"用户输入包含可直接定位的信息"+ 示例
- ff-fast / ff-a 补充 4 文件分布的显式指引
- README 新增「30 秒快速上手」区，核心机制从 10 项精简为 6 项

## 0.1.2

路由判定与规则卡协议补强。

- 路由判定新增"等待态"内部状态：任务信息不明确时先追问目标，不直接进入执行流程
- 路由判定步骤重写为问句格式，逻辑更清晰（规则卡检查→任务明确性→直通→共创→优化→架构→页面→功能→需求起步→10秒测试→中等→兜底）
- 规则卡协议新增无规则卡时强制处理规则：不允许跳过初始化直接进入执行流程
- 规则卡协议新增用户询问规则卡位置时的回答规范，明确正式规则卡路径优先
- `task_runtime_prompt.md` 新增规则卡检查硬约束：未命中真实 `.rule_card.yaml` 前不得输出"已加载"
- `task_runtime_prompt.md` 规则卡查找路径格式统一为完整路径（`.claude/.forge-cli > .trae/.forge-cli > .agents/.forge-cli > .forge-cli`）
- "UI 优化任务"统一简化为"UI 优化"，涉及 SKILL.md、README.md、session_management.md、question_budget.md、skill_visibility.md、startup_handshake.md、task_runtime_prompt.md
- `code_review_mode.md` 术语对齐：中间地带→不满足轻量条件但也不需重流程
- `similar_implementation_search.md` 术语对齐：需求分析阶段→S1 需求确认

## v0.1.1

规则卡项目隔离修复。

- 规则卡正式来源限定为当前目标项目目录内 `<project>.rule_card.yaml` 精确命中
- 禁止读取 `~/.claude/projects/.../memory/*.yaml`、其它项目目录或其它项目名的规则卡作为兜底
- 无规则卡时必须输出 `规则卡：未发现，准备初始化`，并生成 `.forge-cli/projects/<project>.rule_card_draft.yaml`
- `scripts/project_snapshot.py` 从通配加载改为按当前项目名精确匹配
- 新增 `scripts/validate_rule_card_resolution.py`，覆盖全局 Claude memory、当前目录其它项目卡、当前项目精确卡三类回归
- `validate_release.sh` 纳入规则卡解析隔离测试

## v0.1.0

开启 v 前缀发布线，用于和历史无 `v` 的 `0.x.x` 版本隔离。

- 新增 `ff-fast` 快速执行策略：轻量优先、自动生成 project snapshot、发现结构风险再升级
- 新增 `ff-a` 全自动执行策略：非阻塞缺口采用推荐方案继续推进，高风险或不可逆事项才中断确认
- 新增 `QUICKSTART.md` 和 `CHEATSHEET.md`，降低使用者学习成本
- 新增 `scripts/project_snapshot.py`、`scripts/init_rule_card.py`、`scripts/doctor.sh`、`scripts/validate_project.sh`
- `scripts/init_rule_card.py` 升级为初始化向导，支持 `--profile auto`、显式 profile、`--interactive` 和 `quick_context` 写入
- 新增 `references/fast_mode.md`、`references/autonomous_mode.md`、`references/stack_profiles.md`、`references/release_playbook.md`
- 新增多套技术栈 profile：Riverpod / Bloc / go_router+Dio+freezed / GetX / lean MVP
- 新增 项目技术栈扫描、规则卡 schema 校验、路由 golden cases、文档同步检查和发布 gate
- 补充宿主子代理支持判断、串行降级协议、大任务摘要包、统一验证工程师和规则卡结束判断出口

## 0.5.3

补强 UI 输入门禁与大任务结束出口

- 新增 `ff-a` 全自动执行策略：非阻塞缺口采用推荐方案继续推进，安全 / 不可逆 / 生产环境 / 全项目架构切换等高风险事项才中断确认
- 新增 `ff-fast` 快速执行策略：轻量优先、自动生成 project snapshot、发现结构风险再升级
- 新增 `references/autonomous_mode.md`，定义 `auto_assumption`、全自动输出格式、自动决策范围和必须中断确认的边界
- 新增 `references/fast_mode.md`，定义轻量 / 中等任务的快速路径、15 分钟内完成策略和升级条件
- 新增 `references/stack_profiles.md` 和多套内置技术栈 profile，用于规则卡初始化时推荐 Riverpod / Bloc / go_router+Dio+freezed / GetX / lean MVP 方案
- 新增 `QUICKSTART.md`、`CHEATSHEET.md`、`scripts/project_snapshot.py`、`scripts/init_rule_card.py`、`scripts/doctor.sh`、`scripts/validate_project.sh` 和 `references/release_playbook.md`
- `scripts/init_rule_card.py` 升级为初始化向导，支持 `--profile auto`、显式 profile、`--interactive` 和 `quick_context` 写入
- 新增 `references/host_subagent_support.md`，说明宿主对子代理支持应以官方宿主能力而非模型名判断，并补充 Claude Code / Codex / Cursor / Trae 的官方支持矩阵
- 新增“未知宿主能力时的串行降级协议”：无法确认真实子代理或并行能力时，统一降级为 `单主控 + 串行阶段推进 + 逻辑角色分工`
- `README.md`、`load_map.md` 新增 `host_subagent_support.md` 入口，便于在任务执行前快速判断是否允许真实并行实现
- 新增 `references/decision_and_question_protocol.md`，统一收口决策域、提问归属、一问一答、阶段摘要包、前置阶段并发边界和规则卡判断出口
- 新增 `references/case_study_large_rework.md`，给出整体大改版场景下的标准案例，覆盖缺材料询问、用户一问一答、阶段摘要包、并行实现与最终收口
- `SKILL.md`、`task_runtime_prompt.md` 新增硬规则：`UI 设计师` 遇到会影响布局、交互或状态表达正确性的缺失信息时，先向用户补要设计图、参考图或文字化 UI 描述
- 新增 `controller` 合并提问规则：多个角色同时发现缺口时，统一聚合成一次最小提问，不让角色轮流追问用户
- 新增大改版 / 超长 PRD / 超长 UI 文档场景的“阶段摘要包”机制，要求先压缩为需求 / UI / 架构冻结摘要包，再继续下游
- 新增 `scripts/validate_release.sh`、`scripts/validate_rule_card.py` 和 `scripts/route_golden_tests.py`，把版本一致性、规则卡 schema 和模式路由用例纳入可执行发布检查
- 新增 `scripts/project_stack_scan.py` 与 fixture 回归，首次接入 项目时可识别 Riverpod / Bloc / go_router / Dio / freezed / json_serializable / get_it / l10n / test 等技术栈 evidence
- 新增 `scripts/validate_docs_sync.py` 和 `references/demo_transcript.md`，把 demo transcript、load map 和关键文档链接纳入自动同步检查
- `skill_visibility.md` 新增子 agent 结果摘要示例，要求子 agent 完成时对用户说明“完成了什么”，而不是只写“完成”
- 新增大任务结束固定出口：先输出“已完成什么 / 修改了什么 / 实现了什么”，再显式判断“是否需要更新规则卡”
- `mode_test_cases.md`、`example_workflow.md`、`validation_log.md`、`README.md` 同步更新大任务结束模板与规则卡判断口径
- `references/roles/ui_designer.md`、`requirement_analyst.md`、`role_handoff_formats.md`、`question_budget.md`、`input_incomplete_handling.md` 同步补充摘要包与聚合提问约束

## 0.5.2

架构级任务分类与路由清理

- 补充“功能开发”模式：用于已有项目中的大功能闭环、跨页面状态联动、弹窗/提示栏/流程承接类需求
- 明确“完整流程”是执行协议，不是用户可见模式名；对外按任务语义显示为功能开发或页面开发
- 新增 `references/mode_test_cases.md`：覆盖各模式的最小测试用例，并补充大任务并行时 arch-agent / impl-agent / verify-agent 的对外可见输出示例
- 新增架构级任务分类：优化/重构/代码审查/迁移/依赖清理/i18n-a11y，角色流程为架构设计师 → 页面工程师
- 运维直通重定义：仅覆盖排除场景（非项目 任务），analyze/test/build 等工程任务改为轻量任务
- 新增角色流程选择表：有 UI → 四角色，无 UI → 跳 UI 设计师，架构级 → 跳需求+UI，轻量 → 页面工程师
- 新增"优化"关键词路由：默认进架构级任务，需求+优化进完整流程，样式+优化由 UI 设计师处理
- 新增高风险结构决策定义：含需求分析师阻断条件
- 修复误路由纠正与需求阶段强制重开的触发短语冲突
- 修复组件抽取标准矛盾（architecture_designer.md 对齐 engineering_heuristics.md）
- Description 精简为 3 行，加入角色输出格式规则
- 模式表合并：代码审查/迁移/i18n-a11y 合并为架构级任务一个模式
- question_budget.md 新增 LA 层级和角色流程选择表
- 同步更新 README、skill_visibility.md、task_runtime_prompt.md、code_review_mode.md、migration_assist.md

## 0.5.1

触发机制与会话管理修复

- 重写 SKILL.md frontmatter description：加入硬触发关键词（`ff-`/`ff -`/`ff `）、强制调用规则、排除场景、防误判规则
- 新建 `references/session_management.md`：子任务清单格式、精确写入时机、恢复逻辑
- 精简 SKILL.md：删除正文重复的触发列表和冗余段落（631→479 行）
- `skill_visibility.md` 会话状态段落改为引用 session_management.md
- `load_map.md` 新增 session_management.md 条目

## 0.5.0

统一四角色提问预算与确认门禁

- 将 `project-skills/` 目录下的 10 个官方 项目 skill 本地副本纳入 `0.5.0` 版本提交
- 新增 `references/shared_workflow_gates/question_budget.md`，把 `L1-L4` 提问预算从主规则中拆出
- `SKILL.md` 新增四角色提问预算摘要，明确完整流程不等于问题越多越好
- `requirement_confirmation.md`、`role_gate_matrix.md` 补充预算和放行规则
- 需求分析师与 UI 设计师角色卡补充预算说明，强调“问到够用就停”
- 统一 `VERSION`、`.skillhub.json` 和 README 版本号到 `0.5.0`

## 0.4.4

去外部依赖，项目 skills 本地化

- 删除 `scripts/discover_project_skills.sh` 外部探测脚本
- 删除 `references/official_skill_aliases.yaml` 别名映射
- `references/official_project_skills.md` 改为直接引用 `project-skills/` 本地副本
- `references/delegation_map.yaml` 每个 skill 加 `path` 字段指向本地副本
- 移除 task_runtime_prompt.md 中的探测/降级/安装命令整段
- LICENSE 加 Third-Party Components 段落，标注 project-skills/ 来源归属（BSD-3-Clause, Google LLC）
- README 更新架构图、项目结构、集成章节为本地副本模式

## 0.4.3

更新官方 项目 Skills 映射：对齐 project/skills 仓库命名

- 删除 20 个旧的 Forge CLI 命名 skills
- 安装 10 个官方 project/skills（2026-05-14 确认）
- 更新 official_skill_aliases.yaml：以官方名称为主键，旧名称为别名
- 更新 delegation_map.yaml：使用正确的官方 skill 名称
- 更新 official_project_skills.md：删除不存在的 16 个 skill，只保留 10 个官方 skill
- 更新 architecture_designer.md、page_engineer.md、engineering_heuristics.md、debugging_playbook.md、testing_strategy.md 中的 skill 引用

## 0.4.2

整理新项目分流与文档瘦身

- 把新项目判断拆成两个独立维度：`项目阶段` 决定是否进入共创模式，`架构状态` 决定规则卡是提取还是初始化
- 新增新项目入口三分流：明确共创意图、明确初始化意图、意图不清时默认推荐共创
- 新增"新增业务模块"的判定示例，明确区分现有项目扩展、空项目首个业务模块、新项目已有架构和忽略旧代码重做
- 主规则与初始化流程同步更新，避免把"新/老项目"和"有无架构"混成一个判断
- 继续压缩 `SKILL.md` 和 `README.md` 的重复规则说明，把详细分流和示例下沉到 reference 文件

## 0.4.1

同步共创与确认闸门

- 新增 `references/new_project_cocreation_mode.md`，支持从一个模糊 项目想法出发，通过多轮问答逐步收口需求、风格、页面结构和第一版范围
- 主规则新增"新项目共创模式"，放在新项目初始化之前，避免只有想法时过早跳到规则卡和工程细节
- 补强确认绑定规则：用户一句"确认 / 可以 / 按这个来 / 没问题"只对上一轮明确摘要生效，不能自动吞掉摘要外的未决项
- 补强 UI 首轮输出闸门：新项目共创模式下，UI 设计师在方向确认后的第一轮只允许输出"结构草案"，不得一次性展开完整页面结构包
- 更新角色交接格式：新增"结构草案确认状态"和"用户确认状态"约束，未通过时禁止下发完整 UI 包
- 同步共享门禁：`shared_workflow_gates` 中的确认门禁、角色闸门与顾问式协作规则
- 更新 README、load map、项目初始化流程和运行时提示，使 项目语义与 H5 版保持一致

## 0.4.0

开源准备与全接管路由升级

- 补充 MIT License、贡献指南、GitHub issue 模板和开源发布检查清单
- 修正 `.skillhub.json` 版本号，使其与 `VERSION` 和 README 的 `0.4.0` 保持一致
- 优化 README 首屏，明确 GitHub 首发状态、适用人群、暂缺 demo/截图的后续计划
- 新增老项目接入入口和新项目应用 profile 文档，README 增加可复制开场 prompt
- 优化任务路由为"硬排除 + 运维直通 + 轻量执行 + 完整流程"，让 项目尽量全接管但不牺牲效率
- 调整上下文恢复：弱继续表述在存在未完成 session 时轻量恢复，避免长期任务被误当成新任务
- 新增完整流程升级原因规则：进入重流程时必须说明具体触发点，防止中等任务被过度流程化
- 收紧 10 秒测试：从需求/设计开始的新页面、新模块、新项目任务优先进入完整流程，不能因描述清晰而误判为轻量任务
- 补强误路由纠正、需求阶段强制重开、同任务续写恢复和用户确认状态门禁，对齐 h5-forge 的核心工作流闸门
- 新增 `references/shared_workflow_gates/` 子目录，沉淀可在 Forge CLI 与 H5 Forge 之间直接复制的通用门禁规则
- 重构触发系统为"硬触发 + 语义触发 + 示例表达"三层结构，减少关键词堆积导致的误判和维护成本

## 0.3.7

重构任务路由为排除条件检查、全程接管模式、恢复触发标记明确化

- 重构任务路由：从"10秒测试+快速退出条件"改为"排除条件检查+10秒测试"
- 排除场景明确化：非项目项目、不涉及UI/Widget的操作（纯Dart、配置、CI、git、构建、部署、测试、文档）、纯知识问答、闲聊确认追问
- 全程接管模式：所有项目 UI相关任务都进入forge-cli，只有明确排除的场景才退出
- 上下文恢复规则增强：需要明确触发标记（ff-、业务关键词）才会恢复之前的工作，其他表述视为新任务
- 恢复触发标记：ff-、使用forge-cli、/forge-cli、继续做这个需求、继续页面开发、继续第2阶段、继续登录页
- 其他表述（"继续之前的工作"、"接着做"、"然后呢"）不触发恢复，视为新任务

## 0.3.6

设计边界规则、上游返回机制、上下文恢复规则

- 新增设计边界规则：四角色各自只在自己决策域内标注缺失，不越界代劳
- 需求分析师：只标注逻辑/交互缺失，不标注视觉设计缺失
- UI 设计师：设计缺失先问用户再搜项目；无法解析时触发降级机制并给出明显提示
- 架构设计师：三层决策边界（代码层自主、功能层跟需求、设计层跟 UI）
- 页面工程师：简单视觉缺失自主决策，复杂缺失反馈上游；不搜项目拼凑样式
- 新增上游返回机制：下游角色发现缺失时向上游角色反馈，架构影响决定是否显示架构师对话
- 新增上下文恢复规则：对话压缩/暂停恢复时必须先读 session.md，不能降级为轻量任务
- session.md 格式增强：新增任务模式、任务阶段、阶段进度字段
- session.md 写入时机改为关键节点（模式判定、阶段切换、任务完成）

## 0.3.5

可见性标记统一为 [f-forge]、轻量任务强制角色标签、四角色输出强制执行

- 可见性标记统一：`[ff]` 和 `[forge-cli]` 全量替换为 `[f-forge]`，17 个文件 92 处
- 轻量任务强制角色标签：输出格式从 `[f-forge] 轻量任务，直接执行` 改为 `[f-forge] 页面工程师：轻量任务，直接执行`
- 轻量任务输出节奏约束：只在开始和结束时各输出一次 `[f-forge]` 标记，中间过程不逐条输出
- 大任务强制四角色输出：新增强制输出规则，禁止跳过需求分析师/UI设计师/架构设计师直接给结论
- 新增角色输出检查点：路由判定为完整流程后，输出前自检角色段落是否完整
- 红线新增第 5 条：大任务四角色流程中禁止无理由跳过角色（可简短声明后跳过，不可完全省略）
- 四个角色卡新增自检指令：每个角色输出必须以 `[f-forge] 角色名：` 开头

## 0.3.4

任务路由、四角色思考框架、讨论回合、skill 调度、冗余精简

- 新增任务路由决策逻辑：10 秒测试、5 条快速退出条件、完整流程触发条件、中间地带处理
- 新增输出后验证检查清单：7 项检查（编译/规则卡/架构/边界态/待补项/性能预算/i18n-a11y）
- 拆分 SKILL.md 为渐进式加载架构：HTML 注释分隔路由层和执行层，轻量任务只读 ~93 行
- 新增启动握手输出格式（`references/startup_handshake.md`）
- 新增规则卡协议（`references/rule_card_protocol.md`）
- 新增项目初始化流程（`references/project_init_flow.md`）：快速填写模式、5 个引导问题
- 规则卡模板增加 `performance_budget`、`i18n`、`accessibility` 字段组
- 新增四个角色思考框架：需求分析师（PRD 四层法/验收标准模板/隐含需求识别）、UI 设计师（四维评估/组件分类法/布局模式库）、架构设计师（技术选型权衡/风险评估矩阵/文件结构决策树/公共组件抽取标准）、页面工程师（实现优先级/性能优化检查/边界情况清单/代码生成决策）
- 新增讨论回合机制：触发条件、2 轮上限、决策权优先级（需求分析师>UI设计师>架构设计师>页面工程师）
- 新增角色输出标注：`[f-forge] 角色名：内容` 格式，每个角色独占一段
- 新增官方 项目 skill 调度：架构设计师为调度者，页面工程师为执行者，含降级处理
- 新增代码审查模式（`references/code_review_mode.md`）：5 维度审查、严重程度分级
- 新增迁移辅助（`references/migration_assist.md`）：状态管理迁移、目录重构、命名统一
- 新增国际化/无障碍检查（`references/i18n_a11y_check.md`）：i18n 5 项 + a11y 6 项检查
- 新增工作模式标志表：8 种模式的 `[f-forge]`/`[f-forge]` 标志
- 项目整体冗余精简：SKILL.md 376→302 行（-20%），三文件合计减少 103 行
- README 重写：新增任务路由、讨论回合、工作模式、思考框架章节
- 更新 `references/load_map.md`：新增 6 个场景映射
- 更新四个角色卡：增加行为清单、思考框架、官方 Skill 调用与降级
- 更新记忆协议：区分项目状态判定（每次）vs 长期记忆启用（条件触发）

## 0.3.3

术语调整、README 重构、可见性标记、输入处理增强

- 术语调整："小任务"改为"轻量任务"，"老项目"改为"迭代中项目"
- README 重构：新增实际效果展示、诊断命令，安装和使用提前，架构总览下移
- 安装方式更新：支持 `npx skills add` 安装，git clone 作为备选
- 新增可见性标记：`[f-forge]` 标记让用户在连续对话中感知 skill 是否在工作
- 新增会话状态：`.forge-cli/session.md` 记录当前工作状态，用户可主动查询
- 拆分 SKILL.md：输入不完整处理、官方 项目 skills、可见性标记拆为独立 reference（707→518 行）
- 输入处理增强：区分视觉输入（截图/Figma）和文字 UI 描述两条路径，文字 UI 描述不依赖多模态能力
- UI 输入增加需求确认步骤：从 UI 结构推断业务意图，列出待确认项，不跳过直接写代码

## 0.3.2

更新 CHANGELOG

## 0.3.1

拆分已有项目规则发现和相似实现检索到独立 reference 文件

- 将已有项目规则发现和相似实现检索拆分为独立 reference 文件，主文档按需加载
- 同步更新 task_runtime_prompt、legacy_project_scan、memory_protocol、engineering_heuristics、load_map

## 0.3.0

发布 0.3.0：重写 README、轻量任务降噪、兼容已有规则、相似实现检索

- 重写 README，从架构师视角增加架构总览图、核心机制详解、项目结构树
- 轻量任务降噪：跳过完整启动握手和输入模型日志，只输出一行直接执行
- 启动判定增加轻量任务前置判断，命中后不走四步判定
- 兼容已有项目规则：扫描 `.claude/rules/`、`.trae/rules/`、`.agents/rules/` 等已有规则文件，作为规则卡生成和校正的一等输入
- 规则卡模板增加 `source_rules` 字段，标注内容来源
- 新增相似实现检索：进入任务前先搜索相似页面、组件、路由、接口
- 复用追踪：检索发现可复用模式时记录到规则卡 `reusable_patterns`，同一模式出现第 2 次时主动建议抽取公共组件

## 0.2.1

发布 0.2.1

- 同步 `system_prompt.md`、`legacy_project_scan.md`、`task_runtime_prompt.md`，避免旧 reference 漂移
- 补充网络层与 API 规则参考
- 补充路由与导航规则参考
- 强化 `templates_catalog.md` 中的列表页与表单页结构建议
- 将记忆协议调整为"仓库内模板 + 仓库外真实记忆目录"
- 明确 skill 的核心能力与辅助参考边界，避免功能过度具象化
- 补充 Quick Start 与远程安装说明

## 0.2.0

Release Forge CLI 0.2.0

- 收紧 `forge-cli` 的主控定位与触发描述，强调 项目任务应优先进入 `forge-cli`，而不是先走通用编码模式
- 精简 `README`，只保留用户真正需要的信息：用途、安装、自然使用方式、推荐开场、官方 项目 skills 可选安装，以及触发失败时的 fallback 用法
- 增加显式触发兜底说明：支持 `ff- ...`、`使用 forge-cli ...`、`按 forge-cli 工作模式处理 ...`
- 将启动流程收口为更明确的握手机制：项目类型、规则卡状态、项目 skills 状态三项判定
- 增加"完全态"概念：只有正式规则卡存在且 项目 skills 状态已就绪时，后续进入项目才静默跳过完整握手
- 增加"进入工作阶段"日志与输入模型日志，区分 `只给 PRD`、`只给设计图`、`PRD + 设计图`、`上下文不足`、`直接开发任务`
- 强化规则卡语义：没有正式规则卡就视为项目未初始化；扫描推断、会话记忆、宿主项目记忆不得冒充"已加载规则卡"
- 统一正式规则卡来源：只认 `~/.forge-cli/projects/*.rule_card.yaml`，明确排除 `.claude/projects/.../memory/*.yaml` 等宿主侧记忆文件
- 固定新项目规则卡生成时机：完成起步方式选择并产出首个设计包后，进入代码前必须生成规则卡并打印路径
- 调整记忆协议：检查规则卡存在性始终执行，但读取 / 写入长期记忆只在长期协作或用户明确要求时启用
- 增加 项目 skills "已就绪 / 未就绪" 状态位，并要求该状态参与是否展开握手日志的判断
- 新增 项目 skills 安装 / 映射提醒抑制机制：当用户明确表示不想下载或映射时，记录跨项目偏好，后续只保留探测和状态输出，不再重复提醒安装命令或映射脚本
- 校正官方 项目 skills 名称基准，改为以当前 `project/skills` 仓库实际 skill 名称为主，旧名称降级为兼容别名
- 新增 `references/official_skill_aliases.yaml`，统一维护官方名称与历史名称的兼容映射
- 更新 `references/delegation_map.yaml`，按当前官方 skill 名称重写委托映射
- 更新官方 skill 文档，明确探测顺序、更新命令、命名兼容策略，以及不要在多个可发现目录放置同名 skill 副本
- 新增 `references/load_map.md`，把 reference 的按需加载入口从主文档中抽离，进一步落实 progressive disclosure
- 新增 `scripts/discover_project_skills.sh`，用于扫描项目内与宿主根技能目录、选择 项目协作技能根目录并写入本地映射文件
- 扩展脚本探测模型，统一覆盖项目内目录与宿主根目录：`.claude/skills/`、`.agents/skills/`、`.cc-switch/skills/`、`.trae/skills/` 及其 `~/` 根目录版本
- 补充启动握手与工作阶段的示例日志，更新 `example_workflow.md`，让接管时机、规则卡生成时机和技能状态更可见
- 持续收敛主文档与 reference 边界，降低主文档噪音，把模型内部工作细节从用户文档中剥离

## 0.1.0

Initial Forge CLI skill

- 明确定位为 项目内编排 skill，而不是通用代码生成器
- 补充四个角色定义与角色交接格式
- 补充只给 PRD、只给设计图、输入不完整时的处理规则
- 补充官方 项目 Agent Skills 对接策略与委托映射
- 补充 progressive disclosure 读取规则
- 补充记忆读写协议与新项目规则选择流程
- 新增全局偏好、项目规则卡、规则画像、短期任务记忆分层
- 补充工程判断标准与 项目专项知识
- 补充测试策略、质量门、构建与静态分析建议
- 补充反模式检测、模板目录、调试手册
- 扩展规则卡字段：路由、国际化、主题、性能、依赖注入、质量偏好
- 补充真实案例说明与会员中心案例
- 补充真实试跑记录模板
- 调整为 `cc-switch` 可识别单 skill 结构
- 移除安装脚本，改为仓库根目录即 skill 目录
- 忽略 `.claude/`


---

## 路线图

> 原 `PLAN_STATUS.md` 内容合并至此。

### 当前状态

协议层已完成重写（controller 主控、双轨模型、角色代理契约、按需加载）。P0 强制层已闭环（hook 阻断 + checklist 结构化校验 + validate_output 强制化）。

### 下一步

| 优先级 | 事项 | 状态 |
|--------|------|------|
| P1 | 真实 项目试跑 1-2 周，记录完整 transcript | 未开始 |
| P1 | 最后一轮低频文档清扫（references/archive 内旧术语） | 进行中 |
| P2 | 规则卡刷新流程细化（哪些变更必须建议刷新） | 未开始 |
| P2 | 全仓一致性回归检查 | 进行中 |

### 长期目标

- 进入稳定维护期，只按真实使用反馈做小修
- 不再大规模翻主协议
- 积累 3+ 真实项目验证记录
