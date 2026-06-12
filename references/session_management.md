# Forge CLI Reference - 会话管理

这个文件定义 `.forge-cli/session.md` 的结构和使用规则。它服务的是当前未完成任务与等待态的运行状态，不是每轮消息的默认恢复机制。

## Session 文件路径

session 路径与 `project_guardrails` 路径采用**同一套宿主优先级**：根据 `scripts/check_project_guardrails.sh` 输出的 `path` 字段所在的宿主目录定位 session，LLM 不自行遍历多个目录。

路径优先级（与项目护栏一致）：

1. `.claude/.forge-cli/session.md`
2. `.trae/.forge-cli/session.md`
3. `.agents/.forge-cli/session.md`
4. `.forge-cli/session.md`

定位规则：

- 优先使用**与当前 `project_guardrails` 同宿主目录**下的 session 文件
- 如果当前 `project_guardrails` 在 `.claude/.forge-cli/projects/`，session 应写到 `.claude/.forge-cli/session.md`
- 如果项目尚未初始化 `project_guardrails`，session 暂存到 `.forge-cli/session.md`；项目锚点正式初始化后，由 `scripts/ff_session.sh` 在下次写入时自动迁移到对应宿主目录

兼容性说明：旧版本 session 固定写在 `.forge-cli/session.md`。`scripts/ff_session.sh read` 优先读对应宿主目录，未命中再回退到 `.forge-cli/`，避免历史数据丢失。

> 实现层依赖：`scripts/check_project_guardrails.sh` 当前输出 `path` 字段，session 寻址通过 `dirname(path)` 推导宿主根目录。

## 基础结构

统一采用以下字段：

```markdown
# Forge CLI Session

- 轨道：cocreation / execution
- 当前阶段：C0-C3 / S0-S6
- 当前模式：直通模式 / 轻量任务 / 中等任务 / UI 优化 / 架构级任务 / 功能开发 / 页面开发 / 新项目共创
- 决策版本：v1 / v2 / v3
- 项目护栏：已加载 / 未加载 / 待生成
- 项目护栏摘要：2-3 个关键字段
- 活跃代理：controller / ui-agent / arch-agent / impl-agent / verify-agent
- 工作包：无 / P1 / P2 / P3
- 失效结果：无 / impl-agent:v2 / ui-agent:v1
- 最近操作：具体做了什么
- 等待状态：none / user_input / artifact / confirmation
- 等待输入类型：none / text / screenshot / document / design / confirmation / any
- 待确认问题：等待用户回答的问题；无则 `-`
- 任务对象：页面、模块、业务链路或文件对象；无则 `-`
- 恢复键：用于判断用户补充输入是否属于同一任务的关键词；无则 `-`
- 改动契约：最近一次待确认或已确认的改动契约摘要；无则 `-`
- 确认状态：不需要 / 未确认 / 用户已确认
- 目标状态：未确认 / 已确认
- 范围状态：未确认 / 已确认
- 验收状态：未确认 / 已确认
- 约束状态：未确认 / 已确认
- 当前子单元：当前唯一允许推进的子目标；无则 `-`
- 子单元状态：未冻结 / 已冻结 / 实现中 / 待验证 / 已通过 / 未通过
- 验证状态：未验证 / 验证中 / 已通过 / 未通过
- 超范围风险：无 / 已发现
- 计划冲突状态：无 / 已发现待回退
- 任务结束条件：本轮完成定义；无则 `-`
- 工作模式锁：激活 / 可退出
- 退出许可：禁止 / 允许
- 摘要包：当前阶段摘要包路径或摘要标识；无则 `-`
- 最后用户输入摘要：最近一次用户补充输入摘要；无则 `-`
- 更新时间：YYYY-MM-DD HH:mm
```

等待态字段是恢复链路的硬依赖：只要 controller 要等待用户输入、截图、文稿或确认，就必须写入；用户补充材料时优先用这些字段恢复原任务。

## 带工作包的结构

当任务已经拆分为多个工作包时，增加清单：

```markdown
## 工作包

- [x] P1: member_center page structure
- [ ] P2: shared member widgets
- [ ] P3: member data integration
```

规则：

- 工作包状态必须显式维护
- 完成后立刻从 `[ ]` 更新为 `[x]`
- 如果上游方案变化导致结果失效，在 `失效结果` 中记录

## 写入时机

通过 `scripts/ff_session.sh` 操作 session，禁止 LLM 直接读写文件格式。

```bash
scripts/ff_session.sh read                                    # 读取
scripts/ff_session.sh init --track execution --phase S1       # 初始化
scripts/ff_session.sh update --phase S4 --mode 功能开发       # 更新字段
scripts/ff_session.sh wait --waiting_state artifact \
  --expected_input screenshot \
  --pending_question "请补充当前 UI 截图" \
  --task_object "订单详情页" \
  --resume_keys "订单详情页,截图,头像叠放"
scripts/ff_session.sh save-resume \
  --waiting_state confirmation \
  --expected_input confirmation \
  --pending_question "方案A和方案B你倾向哪个？" \
  --task_object "订单详情页" \
  --resume_keys "订单详情页,方案A,方案B"
scripts/ff_session.sh check-resume --user-input "方案A"
scripts/ff_session.sh check-resume --user-input "" --has-attachment true
scripts/ff_session.sh consume-resume --user-input "方案A"
scripts/ff_session.sh reset                                   # 重置（任务完成时）
scripts/ff_session.sh validate                                # 校验字段完整性
```

补充说明：

- `save-resume` 是对 `wait/update` 的语义化封装，用于提问、中断和等待确认前保存恢复点；新链路优先用它，不再重复手写一套 `wait + update`
- `check-resume` 会基于 `等待状态 / 等待输入类型 / 任务对象 / 恢复键` 判断当前输入是否应恢复旧任务；如果当前轮包含截图、文稿或设计稿附件，调用时追加 `--has-attachment true`
- `consume-resume` 在恢复命中后清空等待态，并写入 `最后用户输入摘要`
- 关键状态变化会自动追加到 `.forge-cli/runtime/session_events.log`，不再依赖 LLM 自己输出阶段日志

### 必写

1. 路由和模式判定完成时 → `init` 或 `update --phase --mode`
2. 阶段切换时 → `update --phase`
3. 决策版本变化时 → `update --decision_version`
4. 工作包完成时 → `update --work_packages --recent_action`
5. 下游结果失效时 → `update --stale_results`
6. 等待用户输入、截图、文稿、设计说明或确认前 → `wait --waiting_state --expected_input --pending_question --task_object --resume_keys`
7. 输出改动契约并等待确认前（非豁免模式）→ `wait --waiting_state confirmation --expected_input confirmation --change_contract --confirmation_status 未确认`
8. 生成长文档 / 长 UI 文档摘要包后 → `update --summary_package --recent_action`
9. 用户补充材料被消费后 → `consume-resume --user-input "<摘要>"`
10. 整个任务完成时 → `reset`
11. 目标/范围/验收/约束收口时 → `update --goal_status/--scope_status/--acceptance_status/--constraint_status`
12. 当前子单元冻结、切换、验证时 → `update --current_work_unit/--work_unit_status/--verification_status`
13. 发现超范围或计划冲突时 → `update --scope_risk 已发现` 或 `--plan_conflict 已发现待回退`
14. 允许收口退出前 → `update --mode_lock 可退出 --exit_permission 允许 --task_exit_criteria "<完成定义>"`

### 不必写

- 每读一个文件
- 每调一次工具
- 中间推理过程
- 还没形成结论的临时思路

## 读取时机

通过 `scripts/ff_session.sh read` 读取。

### 可读场景

1. 当前任务被压缩或中断时
2. 用户明确要求继续同一未完成任务时
3. 当前工作包尚未完成，且仍在同一轮任务内部时
4. `等待状态 != none`，且用户发来了文本、截图、文稿、设计说明或确认
5. 上一轮曾向用户补要材料或确认，但本轮输入没有显式触发词

任务已经完成时，不再读取旧 `session`（已通过 `reset` 清除）。

## 恢复逻辑

需要恢复时，读取 `session.md` 后按这个顺序恢复：

1. 是否存在未完成阶段
2. 当前轨道是 `cocreation` 还是 `execution`
3. 当前模式是什么
4. 当前有效 `decision_version` 是什么
5. 是否有未完成工作包
6. 是否有已失效结果需要丢弃
7. 是否处于等待态，以及当前用户输入是否满足 `等待输入类型`
8. 是否存在 `摘要包`，需要先消费摘要包而不是要求用户重发长文档

如果任务已完成或 `session` 已被重置，直接按新任务处理。

### 恢复输出

共创轨道示例：

```text
[f-forge] 模式：新项目共创
[f-forge] 阶段：C2 工程定型
[f-forge] 主控判断：继续上一轮工程定型，当前先确认目录结构和状态管理。
```

执行轨道示例：

```text
[f-forge] 模式：页面开发
[f-forge] 阶段：S4 实现中
[f-forge] 页面工程师：恢复上一轮实现进度，当前继续未完成工作包。
```

等待态恢复示例：

```text
[f-forge] 恢复等待：上一轮正在等待截图，已接入用户补充材料并继续页面开发 / S2。
[f-forge] UI 设计师：基于补充截图继续冻结头像叠放和禁用播放规则。
```

## 防误判规则

1. 不要只看”最近操作”，要看阶段和工作包状态
2. 不要跨 session 假设旧结论仍然有效
3. 如果 `决策版本` 已变化，旧实现结果可能失效
4. 如果用户开启新任务，默认覆盖旧 session，而不是恢复旧任务
5. 任务结束后不要保留可继续恢复的旧任务状态
6. 如果 `等待状态 != none`，用户直接补截图、文稿、JSON、长文本或回复“确认/可以/按这个来”，默认优先恢复等待中的任务；附件轮次调用 `check-resume` 时显式带 `--has-attachment true`
7. 如果用户补充材料与 `任务对象`、`恢复键`、`待确认问题` 都无关，再视为新任务

## 失效结果（stale_results）写入规则

`失效结果` 字段由主控在以下时机写入：

1. 某个 `impl-agent` 回传阻塞，且主控评估影响范围超出当前工作包时
2. 上游方案（需求或架构）发生变化，导致已完成的下游结果不再可靠时
3. `decision_version` 递增时，旧版本下完成的工作包结果自动标记为待确认

写入格式：`代理名:版本号`，例如 `impl-agent-1:v2`

清除时机：

- 受影响的工作包重新完成后，从 `失效结果` 中移除
- 回退到 S3 重新拆包后，清空所有 `失效结果`

## 多任务边界

一个 `forge-cli` 会话内可能包含多个子任务：

- 每个子任务有独立的路由判定和模式
- 直通模式子任务完成后，session 不写入（直通模式不创建 session）
- 轻量任务完成后，session 不写入
- `ff-a` 全自动任务只有在长文档压缩、跨轮等待高风险确认或发生中断时才写 session
- 中等及以上任务创建和维护 session
- 任何模式只要主动等待用户补截图、文稿、文本或确认，都必须临时写等待态 session；恢复并消费后可清空等待态
- 用户在同一轮对话中提出新任务时，如果旧任务已完成，重置 session 后按新任务处理
- 只要 `工作模式锁=激活` 且 `退出许可=禁止`，即使用户补一句“继续/确认”，也必须优先恢复当前任务，而不是默认为新任务

## 与 project_guardrails 的关系

- `session`：记录当前任务做到哪了
- `project_guardrails`：记录这个项目是否是 forge-cli 目标，以及少量长期护栏

不要把项目长期护栏写进 session，也不要把当前任务进度写进 `project_guardrails`。
