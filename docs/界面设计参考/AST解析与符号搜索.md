# AST 解析与符号搜索

> 提升 Agent 代码理解能力 - 对齐 Claude Code 的代码结构分析

## 1. 概述

AST（抽象语法树）解析系统提供了代码结构分析能力，帮助 Agent 理解代码中的函数、类、变量、导入等元素。

### 核心功能

- **TypeScript 解析**：解析 .ts/.tsx 文件
- **Dart 解析**：解析 .dart 文件
- **符号搜索**：按名称搜索代码元素
- **文件结构展示**：可视化代码结构

---

## 2. 基本使用

### AST 管理器

```typescript
import { ASTManager, astManager } from './cli/ast-parser.js'

// 使用全局实例
// 或创建新实例
const manager = new ASTManager()
```

### 解析文件

```typescript
import { astManager } from './cli/ast-parser.js'
import fs from 'fs'

// 读取文件
const content = fs.readFileSync('src/main.ts', 'utf-8')

// 解析文件
const ast = astManager.parseFile(content, 'src/main.ts')

// 获取文件结构
const structure = astManager.getFileStructure('src/main.ts', content)
console.log(structure)
```

---

## 3. TypeScript 解析

### 支持的语法

- **导入语句**：`import { x } from 'y'`
- **导出语句**：`export function x() {}`
- **函数声明**：`function x() {}`、`const x = () => {}`
- **类声明**：`class X {}`、`abstract class X {}`
- **接口声明**：`interface X {}`
- **类型声明**：`type X = ...`
- **枚举声明**：`enum X {}`
- **变量声明**：`const x = ...`、`let x = ...`

### 示例

```typescript
import chalk from 'chalk'
import { getTheme } from './theme.js'

export interface User {
  id: string
  name: string
}

export class UserManager {
  private users: User[] = []

  addUser(user: User): void {
    this.users.push(user)
  }

  async loadUsers(): Promise<User[]> {
    const response = await fetch('/api/users')
    return response.json()
  }
}

export function formatUser(user: User): string {
  return `${user.name} (${user.email})`
}

export const MAX_USERS = 100
```

### 解析结果

```
ⓘ chalk:1
ⓘ ./theme.js:2
Ⓘ User:4
Ⓒ UserManager:9
  ƒ addUser:13
  ƒ loadUsers:17
ƒ formatUser:22
ⓥ MAX_USERS:26
```

---

## 4. Dart 解析

### 支持的语法

- **导入语句**：`import 'package:...'`
- **类声明**：`class X {}`、`abstract class X {}`
- **函数声明**：`void x() {}`、`Future<void> x() async {}`
- **变量声明**：`final x = ...`、`const x = ...`

### 示例

```dart
import 'package:flutter/material.dart'

class User {
  final String id
  final String name

  User({required this.id, required this.name})

  factory User.fromJson(Map<String, dynamic> json) {
    return User(id: json['id'], name: json['name']);
  }
}

class UserService {
  final List<User> _users = []

  void addUser(User user) {
    _users.add(user)
  }

  Future<List<User>> loadUsers() async {
    await Future.delayed(Duration(seconds: 1))
    return _users
  }
}

String formatUser(User user) {
  return '${user.name}'
}
```

### 解析结果

```
ⓘ package:flutter/material.dart:1
Ⓒ User:3
  ƒ User:7
  ƒ fromJson:10
Ⓒ UserService:15
  ƒ addUser:19
  ƒ loadUsers:23
ƒ formatUser:29
```

---

## 5. 符号搜索

### 基本搜索

```typescript
import { astManager } from './cli/ast-parser.js'

// 搜索符号
const results = astManager.searchSymbol('User')

// 渲染结果
console.log(astManager.renderSearchResults(results))
```

### 搜索选项

```typescript
// 按类型搜索
const classResults = astManager.searchSymbol('User', { type: 'class' })
const funcResults = astManager.searchSymbol('add', { type: 'function' })

// 精确匹配
const exactResults = astManager.searchSymbol('UserManager', { exact: true })

// 按文件过滤
const fileResults = astManager.searchSymbol('User', { filePath: 'user.ts' })

// 限制结果数量
const limitedResults = astManager.searchSymbol('User', { limit: 5 })
```

### 搜索类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `function` | 函数 | `function hello() {}` |
| `class` | 类 | `class User {}` |
| `method` | 方法 | `addUser() {}` |
| `variable` | 变量 | `const MAX = 100` |
| `interface` | 接口 | `interface User {}` |
| `type` | 类型 | `type Role = 'admin'` |
| `enum` | 枚举 | `enum Status {}` |
| `import` | 导入 | `import x from 'y'` |
| `export` | 导出 | `export function x()` |

### 匹配算法

1. **精确匹配**：100 分
2. **前缀匹配**：80 分
3. **包含匹配**：60 分
4. **模糊匹配**：40 分
5. **导出符号加分**：+10 分

---

## 6. 命令行集成

### /ast 命令

```bash
# 查看文件结构
/ast src/main.ts
/ast lib/main.dart
```

### /symbol 命令

```bash
# 搜索符号
/symbol User

# 只搜索类
/symbol User --type=c

# 只搜索函数
/symbol add --type=f

# 只搜索变量
/symbol MAX --type=v

# 精确匹配
/symbol UserManager --exact

# 按文件过滤
/symbol User --file=user.ts
```

### 类型简写

| 简写 | 类型 |
|------|------|
| `f` | function |
| `c` | class |
| `m` | method |
| `v` | variable |
| `i` | interface |
| `t` | type |
| `e` | enum |

---

## 7. 完整示例

```typescript
import { astManager } from './cli/ast-parser.js'
import fs from 'fs'

async function analyzeProject() {
  // 1. 解析项目文件
  const files = ['src/main.ts', 'src/utils.ts', 'lib/main.dart']

  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8')
      astManager.parseFile(content, file)
    }
  }

  // 2. 搜索特定符号
  const userClasses = astManager.searchSymbol('User', { type: 'class' })
  console.log('用户类:')
  console.log(astManager.renderSearchResults(userClasses))

  // 3. 搜索所有函数
  const allFunctions = astManager.searchSymbol('', { type: 'function' })
  console.log(`\n找到 ${allFunctions.length} 个函数`)

  // 4. 获取统计信息
  const stats = astManager.getStats()
  console.log(`\n已解析 ${stats.files} 个文件，索引 ${stats.symbols} 个符号`)

  // 5. 清空缓存
  astManager.clearCache()
}

analyzeProject().catch(console.error)
```

---

## 8. 最佳实践

### 1. 增量解析

```typescript
// 只解析修改的文件
if (isFileModified(filePath)) {
  const content = fs.readFileSync(filePath, 'utf-8')
  astManager.parseFile(content, filePath)
}
```

### 2. 缓存管理

```typescript
// 定期清空缓存
setInterval(() => {
  astManager.clearCache()
}, 60 * 60 * 1000) // 每小时清空一次
```

### 3. 错误处理

```typescript
try {
  const content = fs.readFileSync(filePath, 'utf-8')
  astManager.parseFile(content, filePath)
} catch (error) {
  console.error(`解析失败: ${filePath}`, error)
}
```

### 4. 性能优化

```typescript
// 限制解析文件数量
const files = getProjectFiles().slice(0, 100)
for (const file of files) {
  astManager.parseFile(content, file)
}
```

---

## 9. 局限性

### 当前实现

- 基于正则表达式的简化 AST 解析
- 不支持完整的语法分析
- 可能存在误报或漏报

### 改进方向

- 集成 TypeScript 编译器 API
- 集成 Dart 分析器
- 支持更复杂的语法结构
- 提供更准确的类型信息

---

## 10. Tree-sitter 多语言支持

### 支持的语言

| 语言 | 扩展名 | 包名 |
|------|--------|------|
| TypeScript/TSX | .ts, .tsx | tree-sitter-typescript |
| JavaScript/JSX | .js, .jsx | tree-sitter-javascript |
| Java | .java | tree-sitter-java |
| Swift | .swift | tree-sitter-swift |
| Dart | .dart | tree-sitter-dart |
| Python | .py | tree-sitter-python |
| Go | .go | tree-sitter-go |
| Rust | .rs | tree-sitter-rust |
| Ruby | .rb | tree-sitter-ruby |
| PHP | .php | tree-sitter-php |
| Kotlin | .kt, .kts | tree-sitter-kotlin |
| C | .c, .h | tree-sitter-c |
| C++ | .cpp, .cc, .hpp | tree-sitter-cpp |

### 安装

```bash
# 安装 tree-sitter 核心
npm install tree-sitter

# 安装语言 grammar（按需安装）
npm install tree-sitter-typescript
npm install tree-sitter-javascript
npm install tree-sitter-java
npm install tree-sitter-swift
npm install tree-sitter-dart
npm install tree-sitter-python
npm install tree-sitter-go
npm install tree-sitter-rust
npm install tree-sitter-ruby
npm install tree-sitter-php
npm install tree-sitter-kotlin
npm install tree-sitter-c
npm install tree-sitter-cpp
```

### 初始化

```typescript
import { astManager } from './cli/ast-parser.js'

// 初始化 tree-sitter 解析器
const success = await astManager.initializeTreeSitter()
if (success) {
  console.log('Tree-sitter 解析器初始化成功')
} else {
  console.log('Tree-sitter 解析器初始化失败，使用正则解析器')
}
```

### 命令行使用

```bash
# 初始化 tree-sitter
/ast --init

# 显示支持的语言
/ast --languages

# 解析不同语言的文件
/ast src/main.ts
/ast src/Main.java
/ast src/UserService.swift
/ast lib/main.dart
/ast main.py
/ast main.go
/ast src/main.rs
```

### 自动回退

如果 tree-sitter 解析器不可用或解析失败，系统会自动回退到正则解析器：

```typescript
// ASTManager 会自动选择解析器
const ast = astManager.parseFile(content, filePath)

// 如果 tree-sitter 可用，使用 tree-sitter
// 否则，使用正则解析器
```

---

## 11. 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-06-09 | 初始创建，实现 TypeScript/Dart AST 解析和符号搜索 |
| 2026-06-09 | 集成 Tree-sitter 多语言 AST 解析器，支持 13 种语言 |
