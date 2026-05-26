# Flutter Forge Reference - Anti Patterns

以下是 Flutter Forge 默认需要警惕的常见 Flutter 反模式。

## error

- 在 `build()` 中直接调用 `setState`
- 页面层直接发起数据层请求且绕过既定架构
- 为了复用而抽出高度参数化且语义空泛的公共组件

## warning

- 在异步 gap 之后直接使用旧 `BuildContext`
- 在 `initState` 中不当依赖尚未稳定的上下文读取
- 未处理 `Future` 或异步错误分支
- 长列表不用 builder，直接一次性构建所有 children
- 把跨页面共享业务状态硬塞进局部页面 state

## info

- 用户可见字符串未国际化
- 可以 `const` 的稳定子组件未标记为 `const`
- 明显可提取的重复 UI 片段仍然散落在页面中
