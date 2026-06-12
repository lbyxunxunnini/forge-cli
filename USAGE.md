# Forge CLI CLI Agent 使用指南

> 安装、架构、Agent 角色、工作流阶段等信息请参见 [README.md](./README.md)。

## Agent 工具能力

### 文件操作

| 工具 | 功能 |
|------|------|
| `read_file` | 读取文件内容 |
| `write_file` | 创建或覆盖文件 |
| `edit_file` | 编辑文件（替换指定内容） |
| `list_files` | 列出目录文件 |
| `search_files` | 搜索文件内容 |

### 命令执行

| 工具 | 功能 |
|------|------|
| `run_command` | 执行 shell 命令 |
| `run_command_with_output` | 执行命令并获取输出 |

### 项目专用

| 工具 | 功能 |
|------|------|
| `scan_project` | 扫描 项目结构 |
| `detect_project_state` | 检测项目根目录状态 |
| `validate_output` | 验证输出是否符合规范 |
| `check_guardrails` | 检查项目护栏状态 |
| `classify_task` | 分类任务类型 |

## 使用示例

### 1. 创建文件

```
> 创建一个 lib/utils/helper.dart 文件，包含字符串处理工具函数
```

AI 会：
1. 生成代码
2. 调用 `write_file` 创建文件
3. 确认创建成功

### 2. 修改代码

```
> 把 src/main.ts 中的 app title 改成 "My App"
```

AI 会：
1. 调用 `read_file` 读取文件
2. 调用 `edit_file` 修改内容
3. 确认修改成功

### 3. 运行命令

```
> 运行 npm install
```

AI 会：
1. 调用 `run_command` 执行命令
2. 返回执行结果

### 4. 搜索代码

```
> 搜索所有使用了 Provider 的文件
```

AI 会：
1. 调用 `search_files` 搜索
2. 返回匹配结果

## 交互界面

启动后会看到：

```
╔══════════════════════════════════════════╗
║  Forge CLI v0.3.0                    ║
║  模型: deepseek-chat                      ║
║  项目: /path/to/project           ║
║  输入 /help 查看命令                      ║
╚══════════════════════════════════════════╝

⚠ 未配置任何模型的 API Key
使用 /model-config <name> <api-key> 配置模型
例如: /model-config deepseek-chat sk-xxxx

>
```

## 配置文件

配置文件位置：`~/.forge-cli/config.yaml`

```yaml
models:
  default: deepseek-chat
  available:
    - name: deepseek-chat
      base_url: https://api.deepseek.com/v1
      api_key: sk-your-api-key
    - name: qwen-plus
      base_url: https://dashscope.aliyuncs.com/compatible-mode/v1
      api_key: your-api-key
    - name: MiMo-V2.5-Pro
      base_url: https://token-plan-sgp.xiaomimimo.com/v1
      api_key: your-api-key
    - name: MiMo-V2.5
      base_url: https://token-plan-sgp.xiaomimimo.com/v1
      api_key: your-api-key

project:
  root: .
```

## 故障排查

### 1. 命令未找到

```bash
forge-cli: command not found
```

重新安装全局包：
```bash
npm install -g
```

### 2. 模型未配置

```
⚠ 未配置任何模型的 API Key
```

使用 `/model-config` 配置：
```
> /model-config deepseek-chat sk-your-api-key
```

### 3. 工具调用失败

检查脚本权限：
```bash
chmod +x scripts/*.sh scripts/*.py
```
