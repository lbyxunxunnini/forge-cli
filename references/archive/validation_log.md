# Flutter Forge Reference - Validation Log

这个文件不是规则文件，而是试跑记录模板。每次用 Flutter Forge 跑完一个真实项目或真实任务后，只记录最有价值的事实。

## 记录方式

真实试跑优先通过 GitHub issue 模板 `Validation case` 提交。维护者可以把高价值案例整理回这个文件，作为后续规则调整依据。

不要补虚构 demo。没有真实项目时，宁可保留空缺。

## 案例索引

当前已有真实回归案例，但还没有真实 Flutter app 开发案例。按时间倒序记录：

```text
- 2026-05-15 flutter-forge / 规则卡项目隔离回归 / 已限定为当前项目目录精确命中，禁止读取 Claude 全局 memory
- 2026-05-15 flutter-forge / 规则卡目录策略回归 / 已统一为宿主目录优先，未命中时回退项目内 `.flutter-forge`
- 2026-05-15 flutter-forge / 非 Flutter 仓库接入判定 / 初始误触发，用户纠正后成功退出
```

## 真实案例

> 说明：以下案例是真实发生的工作流 / 文档工程回归，不等价于真实 Flutter app 项目试跑。发布前仍应补至少一个真实 Flutter app validation case。

### 案例 1：规则卡项目隔离回归

### 基本信息

- 日期：2026-05-15
- 项目：flutter-forge（skill 文档工程）
- 任务类型：规则卡协议回归
- 输入类型：真实调试反馈
- 使用工具：Claude Code / Codex
- Flutter Forge 版本：v0.1.0+
- 是否启用规则卡：否
- 是否命中官方 Flutter skills：否
- 用户是否能明显感知到当前模式 / 阶段切换：能

### 问题

调试 `flutter-forge` 本身时，外部宿主输出了 `~/.claude/projects/.../memory/facesong_project_rule_card.yaml`，并误报为已读取当前项目规则卡。

### 修复

- 规则卡正式来源限定为当前目标项目目录内 `<project>.rule_card.yaml` 精确命中
- 当前项目没有精确命中时，必须输出 `规则卡：未发现，准备初始化`
- 初始化路径固定为当前项目 `.flutter-forge/projects/<project>.rule_card_draft.yaml`
- 新增 `scripts/validate_project_guardrails_resolution.py` 覆盖全局 Claude memory、当前目录其它项目护栏、当前项目精确护栏三种情况

### 结论

规则卡必须项目内隔离，不能跨项目兜底；错误读取后必须废弃上下文并重新初始化当前项目草案。

### 案例 2：规则卡目录策略回归

### 基本信息

- 日期：2026-05-15
- 项目：flutter-forge（skill 文档工程）
- 任务类型：规则卡协议回归
- 输入类型：其他（规则修订 + 路径策略补充）
- 使用工具：Trae
- Flutter Forge 版本：0.5.2
- 是否启用规则卡：否
- 是否命中官方 Flutter skills：否
- 用户是否能明显感知到当前模式 / 阶段切换：能

### 做对了什么

- 将规则卡正式来源统一为宿主目录优先、项目目录兜底的查找顺序
- 同步修正文档入口、握手输出和记忆协议，避免 README 与 reference 口径分叉
- 明确“前三个宿主目录都未命中时，在项目内创建 `.flutter-forge/projects/`”

### 做错了什么

- 旧协议长期把规则卡路径写死为 `~/.flutter-forge/projects/*.rule_card.yaml`，没有覆盖不同宿主目录
- 规则卡正式来源和宿主目录关系之前定义得过于单一路径化

### 路由是否正确

- 是否应该进入 flutter-forge：否
- 实际进入的模式：普通模式下的仓库文档维护
- 理想模式：普通模式下完成协议回归
- 如果路由错误，最小修正建议：无，本次模式选择正确

### 哪个 reference 真正有帮助

- `rule_card_protocol.md`
- `memory_protocol.md`
- `startup_handshake.md`

### 哪一步判断最不稳定

- “规则卡唯一正式来源” 与 “不同宿主目录的实际落点” 之间的边界定义

### 哪些 reference 实际没有用到

- 页面实现类角色卡
- Flutter skills 委托链路

### 下次需要修什么

- 为规则卡目录解析补一条更明确的示例输出
- 把目录解析顺序加入后续回归检查清单

### 可引用输出片段

只贴最关键的 `[f-forge]` 输出片段，不要贴完整对话：

```text
规则卡查找顺序：
1. .claude/.flutter-forge
2. .trae/.flutter-forge
3. .agents/.flutter-forge
4. 项目根目录 .flutter-forge
```

### 案例 2：非 Flutter 仓库接入判定

### 基本信息

- 日期：2026-05-15
- 项目：flutter-forge（skill 文档工程，不是 Flutter App）
- 任务类型：问题排查
- 输入类型：其他（仓库查看 + 计划书阅读）
- 使用工具：Trae
- Flutter Forge 版本：0.5.2
- 是否启用规则卡：否
- 是否命中官方 Flutter skills：否
- 用户是否能明显感知到当前模式 / 阶段切换：能

### 做对了什么

- 用户明确指出“这不是 flutter 项目”后，能够退出 `flutter-forge` 接管，回到普通模式
- 后续针对当前仓库的分析、文档回归和清扫都在普通模式继续完成

### 做错了什么

- 初始查看仓库与计划书时，把 skill 仓库本身误判成 Flutter 项目并进入了 `flutter-forge`
- 对“Flutter skill 仓库”和“Flutter App 工程”的区分不够稳定

### 路由是否正确

- 是否应该进入 flutter-forge：否
- 实际进入的模式：误进入 `flutter-forge`
- 理想模式：普通模式直接分析 skill 仓库
- 如果路由错误，最小修正建议：在进入前先检查仓库是否存在 `pubspec.yaml`、`lib/` 等 Flutter App 关键信号；若当前仓库是 skill/文档工程，则直接按普通模式处理

### 哪个 reference 真正有帮助

- `PLAN_STATUS.md`
- `README.md`

### 哪一步判断最不稳定

- “当前工作区与 Flutter 相关” 不应直接等价为 “当前仓库是 Flutter 项目”

### 哪些 reference 实际没有用到

- 官方 Flutter skills 委托链路
- 页面实现与测试类 reference

### 下次需要修什么

- 补一条硬排除：当前仓库如果是 skill/文档工程，即使主题与 Flutter 相关，也不自动进入 `flutter-forge`
- 把“规则卡路径解析”和“非 Flutter 仓库退出逻辑”分别纳入后续回归检查项

### 可引用输出片段

只贴最关键的 `[f-forge]` 输出片段，不要贴完整对话：

```text
[f-forge] 页面工程师：运维直通，快速查看
```

## 单次记录模板

### 基本信息

- 日期：
- 项目：
- 任务类型：迭代中项目首次接入 / 新页面开发 / 老页面扩展 / 问题排查
- 工作模式：直通模式 / 轻量任务 / 中等任务 / UI 优化 / 架构级任务 / 功能开发 / 页面开发 / 新项目共创
- 工作模式标志：
- 当前阶段：C0-C3 / S0-S6 / 无
- 任务规模：小 / 中 / 大
- 输入类型：PRD / 设计图 / 类似页面代码 / 接口文档 / 其他
- 使用工具：Claude Code / Codex / Cursor / Trae / 其他
- Flutter Forge 版本：
- 是否启用规则卡：
- 规则卡更新判断：是 / 否 / 未触发
- 是否命中官方 Flutter skills：
- 是否启用并发代理：否 / 是
- 并发代理：arch-agent / impl-agent / verify-agent / 无
- 用户是否能明显感知到当前模式 / 阶段切换：

### 做对了什么

- 

### 做错了什么

- 

### 路由是否正确

- 是否应该进入 flutter-forge：
- 实际进入的模式：
- 理想模式：
- 如果路由错误，最小修正建议：

### 哪个 reference 真正有帮助

- 

### 哪一步判断最不稳定

- 

### 哪些 reference 实际没有用到

- 

### 下次需要修什么

- 

### 可引用输出片段

只贴最关键的 `[f-forge]` 输出片段，不要贴完整对话：

```text

```

## 记录原则

- 只记录真实发生的事情
- 不写空泛总结
- 不写“感觉还行”这类无效反馈
- 优先记录会影响下一轮改进的点
- 区分事实、用户感受和维护者判断
- 如果是大任务，优先记录是否出现“是否需要更新规则卡”的结束判断出口
