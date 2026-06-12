# Forge CLI Reference - Existing Project Entry

迭代中 项目首次接入时，目标是：

- 识别项目现状
- 初始化或校准 `project_guardrails`
- 然后进入执行轨道

## 推荐入口表达

```text
这是一个迭代中的 项目。先用 forge-cli 识别项目结构和 project_guardrails，再进入当前任务。
```

## 首次接入时需要回答的问题

- 项目主目录结构是什么
- 页面和组件怎么命名
- 状态管理主方案是什么
- 路由在哪里注册
- 网络层怎么接入
- 公共组件边界在哪里
- 哪些页面或组件适合复用

## 推荐输出格式

缺少 `project_guardrails` 时：

```text
[f-forge] 模式：启动握手
- 项目阶段：迭代项目
- 项目护栏：未发现
- 下一步：初始化项目锚点，再进入当前任务
```

已有 `project_guardrails` 时：

```text
[f-forge] 模式：启动握手
- 项目阶段：迭代项目
- 项目护栏：已加载
- 项目护栏路径：.claude/.forge-cli/projects/<project>.project_guardrails.yaml
- 下一步：进入当前任务
```

如需继续说明扫描结果，再由主控进入当前真实阶段，不要把“扫描”本身当主模式。

详细扫描清单见 [`existing_project_scan.md`](existing_project_scan.md)。

## 高风险确认项

只有会影响长期维护的点才抛给用户确认：

- 多种状态管理并存
- 路由注册分散
- shared 目录存在多套相似组件
- 网络层混用
- 命名与目录规则明显冲突

## 后续策略

项目护栏初始化后，后续开发优先遵守：

1. 已有项目规则
2. 当前模块主流写法
3. 已生成的 `project_guardrails`
4. 项目通用建议
