# Flutter Forge Reference - Flutter Skills 本地集成

这个文件定义 Flutter 官方 skills 的本地委托方式。关键规则是：

**是否调用某个 Flutter skill，由 `controller` 决定。**

`arch-agent` 只提供建议，`impl-agent` 只负责执行已批准的委托。

## 本地来源

官方 skills 的本地副本位于：

```text
flutter-skills/
```

无需外部探测或 `npx skills add`。

## 委托分工

### controller

- 决定是否需要委托 Flutter skill
- 决定当前阶段是否允许委托
- 决定是否记录为降级执行

### arch-agent

- 建议应该使用哪些 Flutter skill
- 说明为什么需要这些 skill
- 不直接调度它们

### impl-agent

- 执行已经批准的 skill 委托
- 结合项目上下文收口结果
- skill 不可用时按降级规则执行

## 常见映射

| 场景 | 建议 skill |
|------|-----------|
| 路由接入 | `flutter-setup-declarative-routing` |
| JSON 序列化 | `flutter-implement-json-serialization` |
| 网络请求 | `flutter-use-http-package` |
| 本地化 | `flutter-setup-localization` |
| 响应式布局 | `flutter-build-responsive-layout` |
| 布局修复 | `flutter-fix-layout-issues` |
| Widget 测试 | `flutter-add-widget-test` |
| Widget 预览 | `flutter-add-widget-preview` |
| 集成测试 | `flutter-add-integration-test` |
| 架构规范 | `flutter-apply-architecture-best-practices` |

## 什么时候不该委托

以下情况不要调用 Flutter skill：

- 需求确认阶段
- 新项目共创的 `C0-C2`
- 只是纯业务收口或纯视觉方向判断
- 当前guardrails和项目现状已经足够支撑实现

## 降级规则

如果 skill 不可用：

1. 明确标注当前是降级执行
2. 改用 `flutter-forge` 内置参考规则
3. 不降低产出质量

示例：

```text
[f-forge] 页面工程师：flutter-add-widget-test 当前未使用，改按内置测试策略补测试
```

## 不要做的事

- 不要让 `arch-agent` 自己成为委托调度中心
- 不要让 `impl-agent` 未经授权自行拉起新的 Flutter skill
- 不要在共创阶段为了“显得专业”提前委托实现类 skill
