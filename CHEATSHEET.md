# Forge CLI Cheatsheet

> **触发方式**：`/forge-cli`（推荐，100% 可靠）或 `ff-`（快捷，尽力识别）
> 完整触发词与匹配规则：[references/trigger_words.md](references/trigger_words.md)

## 快速任务

```text
ff-fast 改登录页按钮颜色，按现有主题色
ff-fast 修复订单列表空态文案
ff-fast 会员页加一个局部 loading
ff-fast 跑一下 analyze/test，能修的直接修
```

## 页面开发

```text
ff- 新建商品详情页，包含轮播图、价格、规格选择、底部购买按钮
ff- 新建订单列表页，支持筛选、下拉刷新、分页和空态
ff- 根据这份 PRD 做会员中心页，先拆结构再实现
```

## 功能开发

```text
ff- 完成邀请唤起 app 后的授权弹窗、录制流程和提示栏联动
ff- 登录成功后按身份跳转不同首页，并处理 token 过期回流
```

## UI 优化

```text
ff- 优化个人中心页面视觉层级和卡片布局
ff- 按这张截图调整首页首屏视觉，不改业务逻辑
```

## 架构级任务

```text
ff- 帮我做包体积优化
ff- review 当前路由和状态管理接入是否一致
ff- 把旧目录结构迁移到 feature-first，但先给迁移方案
```

## 项目接入

```text
ff- 这是迭代中的 项目。先扫描项目结构，生成 project_guardrails，不要写代码。
ff- 校验当前 project_guardrails 和项目实际代码是否一致
```

## 新项目共创

```text
ff- 我想做一个习惯打卡 项目 app，先共创需求、风格和第一版页面
ff- 新 项目，用 business profile，先定目录、状态管理、路由和网络层
```
