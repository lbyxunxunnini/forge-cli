# Forge CLI Reference - 已有项目规则发现

除了 Forge CLI 自己的guardrails，还要扫描项目中已有的规则文件。这些不是正式guardrails，但应作为一等输入参与guardrails生成和校正。

## 扫描方式

运行 `scripts/find_existing_rules.sh <project_root>`，脚本按以下优先级扫描：

1. `.claude/rules/` 或 `.claude/*.md` — Claude Code 项目规则
2. `.trae/rules/` — Trae 项目规则
3. `.agents/rules/` — 其他 Agent 项目规则
4. 项目根目录的 `rules.md`、`analysis_rules.md`、`CONVENTIONS.md` 等
5. `analysis/` 目录下的规则或分析文档

输出格式：`path: <路径> | size: <大小> | modified: <时间> | source: <来源>`

## 处理方式

- 迭代中项目首次扫描时，把这些文件纳入扫描范围
- 生成guardrails时，以这些已有规则为校正输入：如果已有规则和扫描推断冲突，优先以已有规则为准
- 如果项目已有完整规则体系（如 `.trae/rules/rules.md` 覆盖了命名、状态管理、路由等），guardrails应标注来源：`source: .trae/rules/rules.md`
- 不要把已有规则的内容复制到guardrails里再当成自己的发现

## guardrails与已有规则的关系

- guardrails是 Forge CLI 的项目状态标记，这个定位不变
- 但guardrails的内容来源应扩展：不只来自扫描推断，也来自已有规则文件
- 如果项目已有规则文件且覆盖充分，guardrails可以更轻量，主要补 Forge CLI 特有的字段（如复用知识、UI 来源标注偏好等）

## 不要做的事

- 不要因为有guardrails就忽略已有规则文件
- 不要因为已有规则文件就不生成guardrails（guardrails仍是初始化状态标记）
- 不要要求用户把已有规则迁移到guardrails格式
