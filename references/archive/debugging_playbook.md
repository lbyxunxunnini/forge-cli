# Flutter Forge Reference - Debugging Playbook

当生成代码出现问题时，优先按以下方式排查。

## 布局溢出

先检查：

1. 父子约束链
2. 是否错误嵌套滚动容器
3. 是否缺少 `Expanded` / `Flexible`
4. 是否应改为 builder / sliver 方案

如果工作区已安装官方 skill，优先参考：

- `flutter-build-responsive-layout`
- `flutter-fix-layout-issues`

## 状态不更新

先检查：

1. 状态是否放错层级
2. 是否错误复用了旧对象
3. 是否异步完成后没有触发正确刷新
4. 是否 rebuild 边界过大或过小

## 性能问题

先检查：

1. 长列表是否一次性构建
2. 是否有明显无意义重建
3. 是否遗漏 `const`
4. 图片、列表、复杂区块是否缺缓存或惰性构建

## 常见错误处理思路

- 报错信息 -> 定位阶段（布局 / 状态 / 生命周期 / 路由 / 网络）
- 阶段确定后 -> 对应检查主链路
- 不先盲改，先判断是结构问题还是实现问题
