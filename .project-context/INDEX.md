<!-- generated-by: project-memory; safe-to-overwrite -->
# 项目上下文索引

项目：forge-cli
项目 ID：proj-forge-cli-f61a1f2e
更新时间：2026-06-15T16:30:20+08:00

## 从这里开始

- `project-summary.md` - 生成的项目概览。
- `map/files.md` - 按角色归类的重要文件。
- `map/modules.md` - 模块和目录地图。
- `map/runtime-flow.md` - 入口、调度、执行、模型、工具和输出链路导航。
- `map/contracts.md` - 类型、schema、协议、配置、工具、工作流和权限 contract 索引。
- `map/risk-map.md` - 关键路径、缺测试模块、大文件和高导入文件。
- `map/worktree.md` - 当前 git 分支与未提交改动快照。
- `map/skill-summary.md` - Skill 项目专项摘要；未识别时说明无明确 skill 信号。
- `map/agent-summary.md` - Agent 项目专项摘要；未识别时说明无明确 agent 信号。
- `map/decisions.md` - 会话中发现或记录的决策。
- `sessions/index.md` - 带日期的会话摘要。
- `graph/graph.md` - 知识图谱摘要。
- `graph/mermaid.md` - 可视化图谱骨架。
- `scans/latest.json` - 最新机器可读紧凑索引，默认不要读入上下文。

## 给模型的恢复信号

本目录是项目的结构化全貌入口。默认只读取 `INDEX.md`、`project-summary.md` 和任务相关的少量 `map/*.md`；最多补充 `graph/graph.md` 或 `graph/mermaid.md`。禁止默认读取 `scans/latest.json`、`graph/nodes.jsonl`、`graph/edges.jsonl` 或递归读取整个 `.project-context/`。只有选择状态 3 读取会话记忆时，才额外读取 `sessions/index.md` 和选定会话摘要。只有当摘要标出缺口、出现事实冲突，或当前任务需要源码级验证时，才定向读取相关源码文件。

## 四状态判定

- 状态 1 初始化：仅当项目没有 `.project-context/INDEX.md`，或用户明确要求重新初始化/扫描时使用。
- 状态 2 总结会话摘要：当用户要求保存、总结、沉淀当前会话时使用；默认不重新扫描项目。
- 状态 3 读取会话记忆：当用户要求恢复、继续、读取历史记忆时使用。
- 状态 4 读取项目结构化文件：当用户只想读取项目全貌、结构化摘要或 map 时使用；不读取 `sessions/*.md`，不写摘要，不默认读取机器 JSON/JSONL。

如果用户只说“使用 project-memory”且本文件存在，应先让用户选择状态 2、状态 3、状态 4，或重新初始化/刷新扫描，不要默认恢复会话。

## 恢复顺序

1. 读取本文件。
2. 读取 `project-summary.md`。
3. 按任务需要读取少量 `map/*.md`，例如 `map/runtime-flow.md`、`map/contracts.md`、`map/risk-map.md`、`map/worktree.md`、`map/skill-summary.md`、`map/agent-summary.md` 或 `map/modules.md`。
4. 需要图谱概览时，只读取 `graph/graph.md` 或 `graph/mermaid.md`。
5. 不要默认读取 `scans/latest.json`、`graph/nodes.jsonl`、`graph/edges.jsonl`。
6. 只有恢复历史会话时，运行或查看 `sessions/index.md` 并选择会话摘要。
