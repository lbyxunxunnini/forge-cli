# Flutter Forge Quickstart

3 分钟上手，只记住这 4 类输入。

> **触发方式**：输入 `/flutter-forge`（推荐）或 `ff-`（快捷）开头的消息。

## 1. 快速改一个小东西

```text
ff-fast 把登录页按钮文案改成“立即开始”
```

适合文案、颜色、字号、已定位 bug、局部交互。`ff-fast` 会轻量优先，发现架构风险才升级。

如果你希望缺少的部分都采用推荐方案并一路做完，用：

```text
ff-a 新建商品详情页，缺少的部分按推荐方案自动做完
```

## 2. 新建一个页面

```text
ff- 新建一个商品详情页，包含轮播图、价格、规格选择和底部购买按钮
```

适合新页面、新模块、路由接入、状态接入。Flutter Forge 会先收口结构，再实现。

## 3. 先扫描项目生成 project_guardrails

```text
ff- 这是一个迭代中的 Flutter 项目。先扫描项目结构，输出 project_guardrails，不要先写代码。
```

适合第一次接入已有项目。project_guardrails 会记录目录、状态管理、路由、网络层、命名和复用规则。

## 4. 新项目想法先共创

```text
ff- 我想做一个新的 Flutter 项目，先帮我收口需求、风格和首批页面结构。
```

适合只有想法但还没有工程结构时。先定方向，再生成项目。

## 常用本地命令

```bash
scripts/doctor.sh
scripts/validate_project.sh /path/to/flutter/app
python3 scripts/project_snapshot.py /path/to/flutter/app
python3 scripts/init_project_guardrails.py /path/to/flutter/app --profile auto --interactive
```

## 使用原则

- 小改动用 `ff-fast`。
- 新页面、新模块、PRD、设计图用 `ff-`。
- 第一次接入已有项目，先生成 project_guardrails。
- 不确定时直接用 `ff-`，controller 会分流。

> 完整触发词与匹配规则：[references/trigger_words.md](references/trigger_words.md)
