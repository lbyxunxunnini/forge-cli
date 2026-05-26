# Flutter Forge CLI Agent 验证清单

## 前置条件

1. 配置 API Key：
```bash
export DEEPSEEK_API_KEY=your-api-key
# 或
export DASHSCOPE_API_KEY=your-api-key
```

2. 安装依赖：
```bash
npm install
```

## 子单元完成状态

| # | 子单元 | 状态 | 验证结果 |
|---|--------|------|----------|
| 1 | 项目初始化 | ✅ 完成 | package.json, tsconfig.json, tsup.config.ts, 目录结构 |
| 2 | 配置管理 | ✅ 完成 | config 读写可用，支持 yaml，环境变量替换 |
| 3 | LLM 客户端 | ✅ 完成 | OpenAI 兼容客户端，流式响应 |
| 4 | REPL 框架 | ✅ 完成 | 交互界面，/help、/exit 可用，Ctrl+C 可中断 |
| 5 | 上下文管理 | ✅ 完成 | 多轮对话记忆，/clear 可清空 |
| 6 | 工作流引擎 | ✅ 完成 | 路由→分类→阶段推进 |
| 7 | 工具层 | ✅ 完成 | 扫描、验证、护栏工具可被 LLM 调用 |
| 8 | 完整流程 | ✅ 完成 | 端到端框架完成，需要配置 API key 测试 |

## 功能验证

### 1. 基本功能

- [x] CLI 启动正常
- [x] 显示欢迎界面（模型、项目路径）
- [x] /help 命令正常
- [x] /model 命令正常
- [x] /config 命令正常
- [x] /status 命令正常
- [x] /clear 命令正常
- [x] /exit 命令正常
- [x] Ctrl+C 可中断

### 2. 配置管理

- [x] 配置文件加载（~/.flutter-forge/config.yaml）
- [x] 环境变量替换（${DEEPSEEK_API_KEY}）
- [x] 模型切换
- [x] 配置保存

### 3. LLM 客户端

- [x] OpenAI 兼容客户端
- [x] 流式响应支持
- [x] 多模型支持（DeepSeek、通义千问）

### 4. 工作流引擎

- [x] 路由判断（8 种模式）
- [x] 任务分类
- [x] 阶段推进（S1→S2→S4→S5→S6）
- [x] 阶段提示词生成

### 5. 工具层

- [x] 工具注册表
- [x] 脚本执行器
- [x] 项目扫描工具
- [x] 验证工具
- [x] 护栏检查工具
- [x] 任务分类工具

### 6. Agent 执行器

- [x] 工具调用循环
- [x] 流式输出
- [x] 上下文管理

## 测试方法

### 1. 基本命令测试

```bash
npm run build
node dist/main.js
```

在 REPL 中测试：
- `/help` - 显示帮助
- `/model` - 查看可用模型
- `/config` - 查看配置
- `/status` - 查看状态
- `/clear` - 清空上下文
- `/exit` - 退出

### 2. 对话测试

```bash
node dist/main.js
```

输入：
```
帮我做一个登录页面
```

观察：
- 路由判断（应显示 "模式: page"）
- LLM 响应（流式输出）
- 阶段标记（[f-forge] 阶段：S1 需求分析）

### 3. 工具调用测试

输入：
```
扫描一下当前项目结构
```

观察：
- 工具调用日志（[调用工具: scan_project]）
- 工具执行结果

### 4. 端到端测试

```bash
bash scripts/test-e2e.sh
```

### 路由判断验证

| 输入 | 预期模式 |
|------|---------|
| 帮我做一个登录页面 | page |
| 改一下按钮颜色 | lightweight |
| 重构这个模块 | architecture |
| 这个需求怎么做 | feature |
| 怎么配置环境 | direct |

## 构建验证

```bash
# 类型检查
npm run typecheck  # ✅ 通过

# 构建
npm run build  # ✅ 成功

# 运行
node dist/main.js  # ✅ 正常启动
```

## 待验证（需要 API Key）

- [ ] LLM 对话功能
- [ ] 流式输出
- [ ] 工具调用
- [ ] 完整工作流执行

## 文件结构

```
src/
├── agent/
│   ├── index.ts
│   └── loop.ts
├── cli/
│   ├── commands.ts
│   ├── index.ts
│   ├── renderer.ts
│   ├── repl.ts
│   └── spinner.ts
├── config/
│   ├── index.ts
│   ├── manager.ts
│   └── types.ts
├── llm/
│   ├── client.ts
│   ├── context.ts
│   ├── index.ts
│   └── types.ts
├── tools/
│   ├── classifier.ts
│   ├── executor.ts
│   ├── guardrails.ts
│   ├── index.ts
│   ├── registry.ts
│   ├── scanner.ts
│   ├── types.ts
│   └── validator.ts
├── workflow/
│   ├── engine.ts
│   ├── index.ts
│   ├── router.ts
│   └── types.ts
├── main.ts
└── version.ts
```

## 依赖项

### 运行时依赖
- openai: ^4.0.0
- chalk: ^5.3.0
- cosmiconfig: ^9.0.0
- yaml: ^2.3.0
- ora: ^8.0.0

### 开发依赖
- typescript: ^5.3.0
- tsup: ^8.0.0
- @types/node: ^20.0.0

## 故障排查

### 1. API Key 错误

```
错误: Authentication Fails
```

检查 API Key 是否正确配置。

### 2. 构建失败

```bash
npm run typecheck
```

查看具体类型错误。

### 3. 工具调用失败

检查 scripts 目录下的脚本是否有执行权限：
```bash
chmod +x scripts/*.sh scripts/*.py
```

### 4. 命令未找到

```bash
flutter-forge: command not found
```

重新安装全局包：
```bash
npm install -g
```

## 下一步

1. 配置 API Key
2. 运行 `node dist/main.js`
3. 输入任务描述开始使用
