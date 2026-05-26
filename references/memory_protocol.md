# Flutter Forge Reference - Memory Protocol

三层记忆的分工和读写边界。

## 三层记忆

| 层 | 位置 | 回答什么 | 详细协议 |
|----|------|----------|----------|
| Session | `.flutter-forge/session.md` | 这次任务做到哪了 | [session_management.md](session_management.md) |
| Project Guardrails | 当前项目内 `.flutter-forge/projects/<project>.project_guardrails.yaml` 或宿主子目录下同名文件 | 这个项目长期怎么做 | [project_guardrails_protocol.md](project_guardrails_protocol.md) |
| 跨项目偏好 | `~/.flutter-forge/global_preferences.yaml` | 跨项目稳定偏好 | — |

## 读写权限

| 角色 | Session | Guardrails | 跨项目偏好 |
|------|---------|--------|-----------|
| controller | 读写 | 读；大任务结束时建议更新 | 读 |
| arch-agent | 只读 | 读；可建议更新 | — |
| impl-agent | — | 只读摘要 | — |

## 启用时机

- 轻量任务：不启用完整记忆流程
- 中等及以上：检查 project_guardrails
- 新项目共创：C2-C3 决定 guardrails 策略
- 恢复未完成大任务：读 session

## 硬规则

- 项目规则不写进 session
- 任务进度不写进 guardrails
- impl-agent 不写长期规则
- 扫描推断不误报为"已加载正式 guardrails"
- `~/.claude/projects/.../memory/*.yaml` 不是 Flutter Forge 项目 guardrails 来源
- 当前项目没有精确命中 guardrails 时，必须初始化，不能读取其他项目记忆兜底
