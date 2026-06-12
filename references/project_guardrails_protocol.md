# Forge CLI Reference - Project Guardrails 协议

Project guardrails 是 forge-cli 的项目锚点与长期护栏文件，定义了项目状态检测、护栏存储、检查和来源判定。

## 项目根状态模型

forge-cli 使用三态项目根分类：

1. `existing` — 非空目录，有 `pubspec.yaml` 和 `lib/`，forge-cli 可介入
2. `non_project` — 非空目录，不满足 项目结构，forge-cli 不介入
3. `empty_new` — 空目录（排除隐藏文件），视为新项目，优先级高于 项目检测

状态检测由 `scripts/detect_project_root_state.py` 完成。

## Guardrails 路径

项目 guardrails 使用项目内目录，按以下顺序查找：

1. `.claude/.forge-cli/projects/*.project_guardrails.yaml`
2. `.trae/.forge-cli/projects/*.project_guardrails.yaml`
3. `.agents/.forge-cli/projects/*.project_guardrails.yaml`
4. `.forge-cli/projects/*.project_guardrails.yaml`

查找规则：

- 优先检查 `.claude/.forge-cli`
- 其次检查 `.trae/.forge-cli`
- 再检查 `.agents/.forge-cli`
- 如果前三个目录都不存在或都没有当前项目 guardrails，则回退到项目根目录下的 `.forge-cli`
- 当需要初始化正式 guardrails 时，按优先级在第一个存在的目录中创建；如果都不存在，优先在 `.claude/.forge-cli/projects/` 创建

这是 **唯一正式 guardrails 来源范围**。

以下内容都不应视为正式 guardrails 来源：

- `.claude/projects/.../memory/*.yaml`
- 未命中上述四个目录的其他宿主项目记忆目录
- 仓库内示例 guardrails 或模板文件
- 当前会话临时总结或扫描推断

## 快速查找脚本

每次任务启动时，通过脚本完成路径解析，LLM 只消费输出结果：

```bash
scripts/check_project_guardrails.sh <project_root>
```

输出格式：

```text
status: found | missing | empty_new | non_project
path: <相对路径或 ->
project_name: <项目名>
root_type: existing | non_project | empty_new
forge_enabled: true | false
```

- `status: found` → 加载 `path` 指向的正式 guardrails
- `status: missing` → `existing` 项目但无 guardrails，进入初始化流程
- `status: empty_new` → 空目录新项目，进入共创流程
- `status: non_project` → 非项目工作区，forge-cli 不介入

LLM 禁止自行遍历上述四个路径查找 guardrails。路径解析由脚本完成，确保精确匹配项目名且不跨项目污染。

## 脚本降级路径解析

仅在 `scripts/check_project_guardrails.sh` 不存在或执行失败（非零退出码、超时、缺依赖）时启用降级路径，**正常情况下不允许走降级**。

降级触发时必须：

1. 先输出 `[f-forge] 主控：guardrails 脚本不可用，进入降级路径解析`，保留可观测性
2. 按下列顺序读取项目根目录下的 guardrails，命中第一个存在的即停：
   - `.claude/.forge-cli/projects/*.project_guardrails.yaml`
   - `.trae/.forge-cli/projects/*.project_guardrails.yaml`
   - `.agents/.forge-cli/projects/*.project_guardrails.yaml`
   - `.forge-cli/projects/*.project_guardrails.yaml`
3. 命中 guardrails 时按 `status: found` 处理；都没有时按 `status: missing` 处理
4. 全程不跳过 guardrails 检查环节——降级是路径解析方式的降级，不是检查环节的降级

降级路径解析后，LLM 应在任务收口前提示用户检查脚本环境（如 `bash` 不可用、脚本文件被误删），避免长期降级运行。

## Guardrails 的意义

Project guardrails 不只是记忆文件，而是 **项目初始化状态标记 + 长期护栏**：

- 有 guardrails：说明该项目已经被 Forge CLI 初始化过
- 无 guardrails：说明该项目尚未完成初始化，或至少尚未完成规则沉淀

项目一旦存在真实 guardrails 文件，就视为已经被 Forge CLI 接管。

## 输出规则

只有在**真实 guardrails 文件存在且路径可明确指出**时，才允许输出 `project_guardrails：已加载`，并且应同时输出 `guardrails 路径：...`

如果真实 guardrails 文件不存在：

- 一律输出 `project_guardrails：未发现，准备初始化`
- 一律视为 `项目状态：未初始化`
- 不要把扫描推断、代码印象或会话记忆误报成"已加载 guardrails"
- 应显式标注 `当前判断来源：项目扫描 / 当前代码结构 / 会话上下文`

即使其他宿主目录中存在项目记忆文件，只要不在上述查找顺序内，也不能据此输出"已加载 guardrails"。

## 无 Guardrails 时的强制处理

如果当前项目不存在真实 guardrails（`existing` 状态）：

- 不允许输出 `project_guardrails：已加载`
- 不允许把无 guardrails 视为普通上下文缺口后直接跳过
- 不允许在未处理初始化前直接进入普通执行流程

必须执行：

- 先输出 `project_guardrails：未发现，准备初始化`
- 迭代项目：扫描当前项目并生成 guardrails

说明：

- 无 guardrails 是初始化入口，不是可忽略缺口
- 只有"用户单纯询问 guardrails 位置"这类直通说明场景，才可以只回答现状而不立即展开初始化执行

## 用户询问 Guardrails 位置时

当用户直接询问"guardrails 位置在哪"、"guardrails 路径在哪"、"当前加载的是哪个 guardrails"时，必须先回答**正式 guardrails 路径**，不能先回答项目里的其他规则文件。

回答规则：

- 如果存在真实 guardrails：先输出 `guardrails 路径：...`
- 如果不存在真实 guardrails：先明确输出 `当前项目未发现正式 guardrails`
- `.trae/rules/rules.md`、`.claude/*.md`、`CLAUDE.md`、`AGENTS.md` 等只能作为"已有项目规则文件"补充说明，不能称为"guardrails"或"核心护栏"
- 不允许用宿主规则、用户规则、会话记忆或扫描推断替代正式 guardrails 回答

错误示例：

```text
guardrails 在 .trae/rules/rules.md
```

```text
当前 Trae 默认加载的项目规则就是 guardrails：.claude/project-rules-v2.md
```

正确示例：

```text
当前项目的正式 guardrails 路径是：
- .claude/.forge-cli/projects/<project>.project_guardrails.yaml

补充说明：
- `.trae/rules/rules.md`、`.claude/*.md`、`CLAUDE.md`、`AGENTS.md` 属于项目规则文件，不是正式 guardrails。
```

```text
当前项目未发现正式 guardrails。

正式 guardrails 只会出现在以下路径之一：
- .claude/.forge-cli/projects/*.project_guardrails.yaml
- .trae/.forge-cli/projects/*.project_guardrails.yaml
- .agents/.forge-cli/projects/*.project_guardrails.yaml
- .forge-cli/projects/*.project_guardrails.yaml
```

## 已有项目规则发现

除了 Forge CLI 自己的 guardrails，还要扫描项目中已有的规则文件：

- `.claude/rules/`、`.claude/*.md`
- `.trae/rules/`
- `.agents/rules/`
- 项目根目录的 `rules.md`、`analysis_rules.md`、`CONVENTIONS.md`
- `analysis/` 目录下的规则或分析文档

这些文件作为 guardrails 生成和校正的一等输入。已有规则与扫描推断冲突时，优先以已有规则为准。

详见 [existing_rules_discovery.md](existing_rules_discovery.md)。

## Guardrails 检查流程

Guardrails 检查**不再每次启动强制执行**，而是按任务类型分级触发（详见 [task_runtime_prompt.md](task_runtime_prompt.md) "启动顺序"节第 3 步与 [SKILL.md](../SKILL.md) "路由顺序"节第 2 步的分级表格）：

- 直通模式：跳过
- 轻量任务：启动跳过；实现中触碰状态管理/路由/目录约定时按需触发
- 中等任务：`confidence: high` 跳过；`low` 检查
- UI 优化 / 架构级 / 功能开发 / 页面开发：必须检查
- 新项目共创：C0/C1 跳过；进入 C2 工程定型时必须检查

需要检查时，运行 `scripts/check_project_guardrails.sh <project_root> --cached 300`（缓存优先，300 秒 TTL）。

写操作硬阻断由 preToolCall hook（`scripts/hook_check_project_guardrails.sh`）兜底——guardrails `missing` 状态下，写操作（Edit/Write/创建文件）触发硬阻断，读操作和命令执行只软提醒。

按状态执行：

- `status: found`：
  1. 加载 `path` 指向的 guardrails 内容
  2. 视为 `项目状态：已初始化`
  3. 视为 `项目已被 Forge CLI 接管`
  4. 加载跨项目长期偏好
  5. 判断是否需要补扫描

- `status: missing`：进入初始化流程

- `status: empty_new`：进入新项目共创流程

- `status: non_project`：forge-cli 不介入

只有在 `status: found` 且 项目 skills 状态也已就绪时，才允许静默进入下一环节。

## Guardrails 刷新时机

以下情况发生时，大任务结束后应询问用户是否刷新 guardrails：

1. **重构完成**：模块拆分、目录结构调整、文件重命名
2. **批量文件结构变更**：新建 feature 目录、迁移文件、统一命名
3. **状态管理方案切换**：从 Provider 换到 Bloc 等
4. **路由方案变更**：新增路由注册方式、切换路由库
5. **组件边界调整**：公共组件抽取、页面私有组件下沉
6. **性能预算调整**：修改 Widget 嵌套限制、函数行数限制等
7. **国际化/无障碍启用**：项目首次启用 i18n 或 a11y 支持

刷新流程：

- 大任务执行完后，对比 guardrails 与实际代码的差异
- 先询问用户是否刷新 guardrails
- 用户确认后，只更新有变化的字段，不重写整个 guardrails
- 输出一行日志：`[f-forge] 主控：project_guardrails 已刷新：{变更字段列表}`
- 如果变更涉及高风险项（状态管理、目录结构），明确提示本次变更点

不更新的情况：

- 轻量任务（改样式、改文案、修 bug）
- 单文件小改动
- 未涉及结构、命名或架构变更
