# Forge CLI Reference - Stack Profiles

技术栈 profile 是guardrails初始化的建议模板。它不覆盖项目扫描结果，只用于给 `init_project_guardrails.py` 补足低置信度字段和确认清单。

## 内置 profile

| Profile | 适用场景 |
|---------|----------|
| `riverpod_feature_profile` | Riverpod / Provider 风格，feature-first 目录 |
| `bloc_module_profile` | Bloc / Cubit 风格，module-first 目录 |
| `go_router_dio_freezed_profile` | go_router + Dio + freezed/json_serializable 标准业务 App |
| `getx_mvp_profile` | GetX 风格 MVP 或已有 GetX 项目 |
| `lean_mvp_profile` | 尚未形成复杂架构的新项目或快速验证项目 |

## 自动选择规则

`scripts/init_project_guardrails.py --profile auto` 的推荐顺序：

1. 检测到 Bloc / Cubit → `bloc_module_profile`
2. 检测到 Riverpod → `riverpod_feature_profile`
3. 检测到 GetX → `getx_mvp_profile`
4. 检测到 go_router + Dio + freezed/json_serializable → `go_router_dio_freezed_profile`
5. 无明显主流技术栈 → `lean_mvp_profile`

## 使用方式

```bash
python3 scripts/init_project_guardrails.py /path/to/app --profile auto
python3 scripts/init_project_guardrails.py /path/to/app --profile riverpod_feature_profile
python3 scripts/init_project_guardrails.py /path/to/app --interactive
```

`--interactive` 会输出推荐 profile、扫描摘要和高风险确认清单。

## 原则

- profile 是建议，不是事实。
- 扫描 evidence 优先于 profile。
- profile 填补低置信度字段时必须保留 low / medium confidence。
- 脚本直接写 `*.project_guardrails.yaml`，无需草案确认流程。
