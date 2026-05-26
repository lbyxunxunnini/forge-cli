# Flutter Forge Reference - 项目初始化与接入

这个文件定义项目首次接入 `flutter-forge` 时，如何判断：

- 当前是新项目还是迭代项目
- 是否应该进入新项目共创
- project_guardrails 应该提取、补齐还是初始化

## 二维判断

不要把“新/老项目”和“有无架构”混成一个结论。先拆成两个维度。

### 1. 项目阶段

- `迭代项目`
  - 已存在真实业务模块、真实页面、状态或接口接入
- `新项目`
  - 只有基础脚手架、演示代码，或还没形成真实业务模块

### 2. 架构状态

- `已存在架构`
  - 已有稳定目录分层、状态管理、路由、共享组件或命名约定
- `不存在架构`
  - 只有基础脚手架，还没形成稳定工程规则

## 接入结论

### 迭代项目

- 有 guardrails：直接读取 guardrails，进入执行轨道
- 无 guardrails：先扫描现有项目，生成 project_guardrails，再进入执行轨道

初始化流程见 [project_guardrails_protocol.md](project_guardrails_protocol.md)。

### 新项目

- 只有模糊想法：先进入 `新项目共创`
- 已明确想直接定工程规则：先完成 project_guardrails 初始化，再进入执行轨道
- 既是新项目又已搭了部分架构：优先提取现有架构，再补齐 guardrails

## 新项目共创与初始化的关系

在新模型下：

- `新项目共创` 是 `C0-C3`
- project_guardrails 初始化通常发生在 `C2-C3`
- 完成 `C3` 后，才进入执行轨道 `S3`

执行顺序：

1. 先共创
2. 共创过程中完成 project_guardrails 初始化或补齐
3. 再进入执行

## Guardrails 策略

| 场景 | Guardrails 动作 |
|------|-----------------|
| 有 guardrails | 直接读取，进入执行轨道 |
| 无 guardrails | 自动扫描项目结构 → 生成 project_guardrails |

简化原则：不再区分"已存在架构"和"不存在架构"，只要没有 guardrails 就自动扫描并生成。架构信息会在扫描过程中自动提取，不需要单独判定。

## 首次接入的推荐输出

### 迭代项目，无 guardrails

```text
[f-forge] 模式：启动握手
- 项目阶段：迭代项目
- project_guardrails：未发现
- 下一步：扫描现有结构并生成 project_guardrails
```

### 新项目，方向未定

```text
[f-forge] 模式：新项目共创
- 升级原因：当前只有产品方向，需要先收口页面结构和工程方案
[f-forge] 阶段：C0 想法收口
```

### 新项目，工程规则已基本明确

```text
[f-forge] 模式：新项目共创
- 升级原因：当前需要先冻结工程组织，再进入代码阶段
[f-forge] 阶段：C2 工程定型
```

## 约束

- `C3` 前禁止进入实现
- 开始大范围代码落地前必须有 guardrails 策略
