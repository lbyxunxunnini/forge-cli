# Flutter Forge CLI Agent

> 基于 Vercel AI SDK 的 Flutter 开发 CLI Agent，集成完整的工作流和角色系统

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
│ - 目标冻结     │ │ - 视觉方案     │ │ - 架构设计     │
│ - 范围确认     │ │ - 交互设计     │ │ - 模块划分     │
│ - 验收标准     │ │ - 样式规范     │ │ - 技术选型     │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          ▼
                ┌───────────────┐
                │ 页面工程师     │
                │ Agent         │
                │ - 代码实现     │
                │ - 文件读写     │
                │ - 命令执行     │
                └───────────────┘
                          │
                          ▼
                ┌───────────────┐
                │ 验证工程师     │
                │ Agent         │
                │ - 功能验证     │
                │ - 测试执行     │
                │ - 质量检查     │
                └───────────────┘
```

## 特性

- **5 个专业 Agent** — 需求分析师、UI 设计师、架构设计师、页面工程师、验证工程师
- **角色隔离** — 每个 Agent 有独立的工具权限和职责边界
- **结构化工作流** — S1→S2→S3→S4→S5→S6 阶段流程
- **工具调用** — 基于 Vercel AI SDK 的 tool calling
- **文件读写** — 创建、编辑、删除文件
- **命令执行** — 运行 shell 命令
- **多模型支持** — DeepSeek、通义千问、小米大模型

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
flutter-forge
```

### 配置模型

```
> /model-config deepseek-chat sk-your-api-key
```

### 开始使用

```
> 帮我创建一个登录页面
> 修改 main.dart 的标题
> 运行 flutter pub get
```

## Agent 角色

### 主控 Agent (Controller)
- 路由判断：根据用户输入判断任务类型
- 阶段推进：管理 S1→S6 阶段流程
- 子 Agent 调度：根据阶段调用对应的 Agent
- 状态管理：维护 session 状态

### 需求分析师 (Requirement Analyst)
- 目标冻结：明确业务目标
- 范围确认：定义功能范围
- 验收标准：制定验收条件
- 约束定义：明确技术约束

**工具权限**：只读（read_file, list_files, search_files, scan_project）

### UI 设计师 (UI Designer)
- 视觉方案：设计界面风格
- 交互设计：设计用户交互
- 样式规范：制定样式标准

**工具权限**：只读（read_file, list_files, search_files, scan_project）

### 架构设计师 (Architecture Designer)
- 架构设计：设计系统架构
- 模块划分：划分功能模块
- 技术选型：选择技术方案

**工具权限**：只读（read_file, list_files, search_files, scan_project, detect_project_state）

### 页面工程师 (Page Engineer)
- 代码实现：编写业务代码
- 文件读写：创建和编辑文件
- 命令执行：运行构建和测试命令

**工具权限**：全部（read_file, write_file, edit_file, run_command, list_files, search_files）

### 验证工程师 (Verify Agent)
- 功能验证：验证功能正确性
- 测试执行：运行测试用例
- 质量检查：检查代码质量

**工具权限**：部分（read_file, list_files, search_files, run_command, validate_output, validate_docs_sync）

## 工作流阶段

| 阶段 | 说明 | 调用的 Agent |
|------|------|-------------|
| S0 | 准备 | 主控 |
| S1 | 需求分析 | 需求分析师 |
| S2 | 方案设计 | UI 设计师 / 架构设计师 |
| S3 | 任务拆分 | 主控（可选） |
| S4 | 实现 | 页面工程师 |
| S5 | 验证 | 验证工程师 |
| S6 | 完成 | 主控 |

## 命令

| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助 |
| `/model` | 查看可用模型 |
| `/model <name>` | 切换模型 |
| `/model-config <name> <key>` | 配置 API Key |
| `/config` | 查看配置 |
| `/clear` | 清空上下文 |
| `/status` | 查看状态 |
| `/exit` | 退出 |

## 技术栈

- **Runtime**: Node.js 18+
- **语言**: TypeScript
- **AI SDK**: Vercel AI SDK (`ai`, `@ai-sdk/openai`)
- **CLI**: readline
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
```

## 许可证

MIT
