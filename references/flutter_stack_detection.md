# Flutter Forge Reference - Flutter Stack Detection

这个文件定义首次接入 Flutter 项目时的技术栈识别口径。它补强guardrails扫描，避免只停留在“目录结构 / 命名风格”的通用判断。

## 目标

扫描目标不是替代架构判断，而是为guardrails提供 evidence：

- 当前主状态管理方案是什么
- 当前路由方案是什么
- 网络层、序列化、代码生成和依赖注入是否已有主流工具链
- 测试、国际化和本地化是否已经启用
- 哪些结论来自 `pubspec.yaml`，哪些来自 `lib/`、`test/` 或配置文件

## 可执行扫描

```bash
python3 scripts/flutter_stack_scan.py /path/to/flutter/project
python3 scripts/flutter_stack_scan.py /path/to/flutter/project --json
```

发布检查使用本地 fixture 回归扫描器：

```bash
python3 scripts/validate_flutter_stack_scan.py
```

## 检测范围

| 类别 | 识别信号 |
|------|----------|
| 状态管理 | Riverpod / Bloc / Provider / GetX |
| 路由 | go_router / auto_route / Navigator 2.0 / 命名路由 |
| 网络层 | Dio / http / Retrofit |
| 序列化 | freezed / json_serializable |
| 依赖注入 | get_it / injectable |
| 国际化 | flutter_localizations / intl / l10n.yaml / arb |
| 测试 | flutter_test / mocktail / mockito / integration_test |
| 代码生成 | build_runner / build.yaml |

## guardrails写入原则

- `high` confidence 至少需要 3 条 evidence，且无明显反例。
- 仅 `pubspec.yaml` 出现依赖，不足以证明项目主流模式，只能作为 medium 或 low evidence。
- 如果依赖存在但代码没有使用，记录为“可用工具链”，不要写成“主流工程规则”。
- 如果代码里出现多个状态管理方案，把非主流方案写入 `inferred_rules.conflicts_to_watch`。
- 如果最近 feature 与历史实现冲突，优先记录最近主流，但 confidence 不应高于 medium。

## 与guardrails字段的映射

| 扫描结果 | guardrails字段 |
|----------|------------|
| `state_management.*` | `team_rules.state_management.primary_pattern` |
| `routing.*` | `team_rules.routing_and_navigation.route_definition_rule` |
| `networking.*` | `team_rules.api_integration.request_layer_rule` |
| `serialization.*` | `team_rules.api_integration.model_mapping_rule` |
| `dependency_injection.*` | `team_rules.dependency_injection.di_strategy` |
| `localization.*` | `team_rules.localization.localization_strategy` |
| `testing.*` | `quality_preferences.*` |
| `code_generation.build_runner` | 影响序列化、DI、路由生成等工具链判断 |

## 不能做的事

- 不要因为检测到依赖就强行改造项目架构。
- 不要把孤立样例当成项目主流。
- 不要在没有代码 evidence 时把 confidence 标为 high。
- 不要让扫描器输出直接覆盖用户已确认的guardrails。
