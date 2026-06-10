/**
 * AST 解析演示
 * 展示代码结构解析和符号搜索功能
 */

import {
  // AST 解析
  TypeScriptParser,
  DartParser,
  SymbolSearcher,
  ASTManager,
  astManager,

  // 渲染器
  renderDivider,
  renderList,
  renderKeyValue,
} from '../src/cli/index.js'

async function main() {
  console.log('=== AST 解析演示 ===\n')

  // 1. TypeScript 解析演示
  console.log('1. TypeScript 代码解析')
  console.log(renderDivider(60))

  const tsCode = `import chalk from 'chalk'
import { getTheme } from './theme.js'

// 用户接口
export interface User {
  id: string
  name: string
  email: string
}

// 用户类型
export type UserRole = 'admin' | 'user' | 'guest'

// 用户管理类
export class UserManager {
  private users: User[] = []

  // 添加用户
  addUser(user: User): void {
    this.users.push(user)
  }

  // 获取用户
  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id)
  }

  // 异步加载用户
  async loadUsers(): Promise<User[]> {
    const response = await fetch('/api/users')
    return response.json()
  }
}

// 工具函数
export function formatUser(user: User): string {
  return \`\${user.name} (\${user.email})\`
}

// 常量
export const MAX_USERS = 100
export const DEFAULT_ROLE: UserRole = 'user'
`

  console.log('TypeScript 代码结构:')
  const tsStructure = astManager.getFileStructure('example.ts', tsCode)
  console.log(tsStructure)

  // 2. Dart 解析演示
  console.log('\n2. Dart 代码解析')
  console.log(renderDivider(60))

  const dartCode = `import 'package:flutter/material.dart'

// 用户模型
class User {
  final String id
  final String name
  final String email

  User({
    required this.id,
    required this.name,
    required this.email,
  })

  // 从 JSON 创建
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      email: json['email'],
    );
  }

  // 转换为 JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
    };
  }
}

// 用户服务
class UserService {
  final List<User> _users = []

  // 添加用户
  void addUser(User user) {
    _users.add(user)
  }

  // 获取用户
  User? getUser(String id) {
    try {
      return _users.firstWhere((u) => u.id == id);
    } catch (e) {
      return null;
    }
  }

  // 异步加载用户
  Future<List<User>> loadUsers() async {
    // 模拟网络请求
    await Future.delayed(Duration(seconds: 1))
    return _users
  }
}

// 格式化用户
String formatUser(User user) {
  return '\${user.name} (\${user.email})'
}

// 常量
const int maxUsers = 100
const String defaultRole = 'user'
`

  console.log('Dart 代码结构:')
  const dartStructure = astManager.getFileStructure('main.dart', dartCode)
  console.log(dartStructure)

  // 3. 符号搜索演示
  console.log('\n3. 符号搜索')
  console.log(renderDivider(60))

  // 搜索函数
  console.log('搜索函数 "User":')
  const userResults = astManager.searchSymbol('User', { type: 'class' })
  console.log(astManager.renderSearchResults(userResults))

  // 搜索方法
  console.log('\n搜索方法 "addUser":')
  const addResults = astManager.searchSymbol('addUser', { type: 'function' })
  console.log(astManager.renderSearchResults(addResults))

  // 模糊搜索
  console.log('\n模糊搜索 "format":')
  const formatResults = astManager.searchSymbol('format')
  console.log(astManager.renderSearchResults(formatResults))

  // 4. 统计信息
  console.log('\n4. 统计信息')
  console.log(renderDivider(60))

  const stats = astManager.getStats()
  console.log(renderKeyValue('已解析文件数', String(stats.files)))
  console.log(renderKeyValue('索引符号数', String(stats.symbols)))

  // 5. 命令用法演示
  console.log('\n5. 命令用法')
  console.log(renderDivider(60))

  console.log(renderList([
    '/ast file.ts - 查看 TypeScript 文件结构',
    '/ast main.dart - 查看 Dart 文件结构',
    '/symbol User - 搜索符号 "User"',
    '/symbol User --type=c - 只搜索类',
    '/symbol add --type=f - 只搜索函数',
    '/symbol format --exact - 精确匹配',
  ], true))

  // 6. 实际文件演示（如果存在）
  console.log('\n6. 实际文件演示')
  console.log(renderDivider(60))

  const fs = require('fs')
  const path = require('path')

  // 尝试解析当前目录的 TypeScript 文件
  const currentDir = process.cwd()
  const files = fs.readdirSync(currentDir)
    .filter((f: string) => f.endsWith('.ts') || f.endsWith('.tsx'))
    .slice(0, 3)

  if (files.length > 0) {
    console.log(`解析当前目录的 TypeScript 文件:`)
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(currentDir, file), 'utf-8')
        const structure = astManager.getFileStructure(file, content)
        console.log(`\n${file}:`)
        console.log(structure)
      } catch (error) {
        console.log(`  解析失败: ${error}`)
      }
    }
  } else {
    console.log('当前目录没有 TypeScript 文件')
  }

  console.log('\n=== 演示完成 ===')
}

main().catch(console.error)
