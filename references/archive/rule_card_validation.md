# Flutter Forge Reference - 规则卡校验协议

这个文件定义规则卡生成后的校验机制，确保冷启动时生成的规则卡质量足够支撑后续开发决策。

## 1. 校验时机

规则卡校验在以下时机触发：

- 首次扫描生成草案后（冷启动）
- 规则卡刷新后
- 用户手动要求校验时

## 2. 必填字段（缺失即不合格）

以下字段必须有明确值，不能为空或仅填占位符：

| 字段 | 原因 |
|------|------|
| `project.name` | 标识项目 |
| `project.status` | 决定接入策略 |
| `team_rules.directory_structure.rule` | 影响所有新文件落点 |
| `team_rules.state_management.primary_pattern` | 影响所有状态相关代码 |
| `team_rules.naming_conventions.pages` | 影响所有新页面命名 |

如果扫描后这 5 个字段中任一个无法确定，必须向用户确认后再写入，不能用猜测值填充。

## 3. 推荐填写字段（空值可接受但会降低决策质量）

| 字段 | 影响 |
|------|------|
| `team_rules.routing_and_navigation.route_definition_rule` | 新页面路由接入 |
| `team_rules.component_boundaries.shared_component_rule` | 复用判断 |
| `team_rules.api_integration.request_layer_rule` | 接口接入 |
| `team_rules.module_boundaries.rule` | 模块归属 |

这些字段为空时，controller 在相关决策点应主动提示用户补充。

## 4. 置信度校验

每个字段的 `confidence` 必须基于实际证据：

| 置信度 | 要求 |
|--------|------|
| `high` | 至少 3 个文件遵循该规则，且无反例 |
| `medium` | 至少 1 个文件遵循，但存在少量不一致 |
| `low` | 仅从目录结构或命名推断，无直接代码证据 |

禁止：

- 没有 evidence 却标 high
- 只扫描了 1 个文件就标 high
- 发现明显反例仍标 high

## 5. 冲突检测

扫描时如果发现以下情况，必须记录到 `inferred_rules.conflicts_to_watch`：

- 同一类文件存在两种命名风格
- 同一项目存在两种状态管理方案
- 目录结构在不同 feature 间不一致
- 已有规则文件（如 .claude/rules/）与代码实际不一致

冲突不阻止规则卡生成，但必须显式标注，让用户知道哪些地方需要统一。

## 6. 草案校验清单

生成草案后，controller 按以下清单逐项检查：

```text
□ 必填字段是否全部有值？
□ 每个 high confidence 字段是否有 ≥3 个 evidence？
□ 是否存在未标注的冲突？
□ state_management 是否与实际代码一致（不是只看 pubspec.yaml）？
□ directory_structure 是否覆盖了主要 feature 目录？
□ 是否有字段的值来自猜测而非扫描？如有，是否已降为 low confidence？
```

如果清单中有未通过项，在草案摘要中明确标出，让用户知道哪些字段需要人工确认。

## 7. 扫描深度建议

冷启动扫描时的推荐策略：

| 扫描目标 | 最少扫描量 | 目的 |
|----------|-----------|------|
| 目录结构 | 项目根 + lib/ 前两层 | 确定分层和 feature 组织 |
| 状态管理 | pubspec.yaml + 2-3 个 feature 的 state 文件 | 确定主流方案 |
| 命名规范 | 3-5 个页面文件 + 3-5 个组件文件 | 确定命名模式 |
| 路由 | 路由配置文件 + 1-2 个页面的导航调用 | 确定路由方案 |
| 网络层 | core/network 或 data 层 + 1 个 repository | 确定请求模式 |

扫描不足时，对应字段标为 `low` confidence，不要用少量样本强行推断 `high`。

## 8. 用户确认输出格式

草案生成后，向用户展示的确认摘要推荐格式：

```text
[f-forge] 主控：规则卡草案已生成，请确认以下关键决策：

1. 状态管理：Riverpod StateNotifier（confidence: medium，基于 3 个 feature 扫描）
2. 目录结构：lib/features/<module>/pages/ + widgets/ + state/（confidence: high）
3. 路由方案：GoRouter（confidence: medium，基于 app_router.dart）
4. 命名规范：*_page.dart / *_widget.dart（confidence: medium）

⚠️ 发现冲突：
- 部分历史页面使用 Bloc，与主流 Riverpod 不一致
- features/settings/ 目录结构与其他 feature 不同

请确认是否按以上规则继续，或需要调整哪些字段？
```
