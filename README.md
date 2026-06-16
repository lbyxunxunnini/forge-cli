# Forge CLI

> 通用 AI 协作 CLI Agent，支持多语言、多模型、可挂载独立工作流
>
> **v0.1.1** | MIT License | [GitHub](https://github.com/lbyxunxunnini/forge-cli)

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                    主控 Agent (Controller)                │
│  - 路由判断                                              │
│  - 阶段推进                                              │
│  - 子 Agent 调度                                         │
│  - 状态管理                                              │
│  - 门禁检查                                              │
└─────────────────────────────────────────────────────────┘
                           │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ 需求分析师     │ │ UI 设计师      │ │ 架构设计师     │
│ Agent         │ │ Agent         │ │ Agent         │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                ┌───────────────┐
                │ 页面工程师     │
                │ Agent         │
                └───────────────┘
                          │
                          ▼
                ┌───────────────┐
                │ 验证工程师     │
                │ Agent         │
                └───────────────┘
```

## 特性

- **通用 Agent** — 不绑定特定语言或框架，支持任意项目类型
- **多语言支持** — TypeScript、JavaScript、Python、Java、Go、Rust、Dart 等
- **多模型支持** — DeepSeek、Qwen、MiMo、通义千问、GLM 等（OpenAI 兼容）
- **工作流引擎** — 可挂载独立工作流，通过 `/workflow` 命令管理
- **5 个专业 Agent** — 需求分析师、UI 设计师、架构设计师、页面工程师、验证工程师
- **20+ 工具** — 文件读写、命令执行、Glob/Grep/LS、AST 解析、WebFetch、WebSearch 等
- **插件系统** — commands/agents/skills/hooks/mcp 架构
- **MCP 支持** — Model Context Protocol 外部工具集成
- **Hooks 系统** — PreToolUse/PostToolUse/SessionStart/Stop/PromptSubmit
- **记忆系统** — 四类记忆、写入门槛、去重合并、语义召回
- **可观测性** — 全链路 Trace、执行摘要

## 快速开始

### 安装

```bash
# 全局安装
npm install -g

# 或本地开发
npm install
npm run build
```

### 启动

```bash
forge-cli
```

### 配置模型

```
> /model add deepseek sk-your-api-key
```

### 开始使用

```
> 帮我创建一个登录页面
> 修改 src/main.ts 的标题
> 运行 npm test
```

## 命令

| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助信息 |
| `/model` | 模型管理：查看/切换/配置/添加模型 |
| `/config` | 查看当前配置 |
| `/clear` | 清空对话上下文 |
| `/status` | 显示当前状态 |
| `/fast` | 切换快速模式 |
| `/auto` | 切换全自动模式 |
| `/session` | 查看当前 session 信息 |
| `/workflow` | 工作流管理：列出/启动工作流 |
| `/skill` | 查看已加载技能 |
| `/skill-install` | 安装远程技能 |
| `/plugins` | 查看已加载插件 |
| `/mcp` | 查看 MCP 服务器状态 |
| `/security` | 查看安全检查配置 |
| `/learn` | 切换学习模式 |
| `/memory` | 查看已保存的记忆 |
| `/hook` | 查看已注册钩子 |
| `/trace` | 查看最近一次执行的 Trace 摘要 |
| `/theme` | 切换主题 |
| `/git` | Git 操作 |
| `/diff` | 查看 Diff |
| `/lint` | Lint 检查 |
| `/test` | 运行测试 |
| `/ast` | 查看文件结构 |
| `/symbol` | 搜索符号 |
| `/fetch` | 获取网页内容 |
| `/search` | 网络搜索 |
| `/state` | 状态机管理 |
| `/exit` | 退出程序 |

## 技术栈

- **Runtime**: Node.js 18+
- **语言**: TypeScript
- **AI SDK**: Vercel AI SDK (`ai`, `@ai-sdk/openai`)
- **CLI UI**: Ink (React for CLI)
- **构建**: tsup

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 类型检查
npm run typecheck

# 开发模式
npm run dev

# 测试
npm test
```

## 许可证

MIT
