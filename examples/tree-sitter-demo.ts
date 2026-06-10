/**
 * Tree-sitter 多语言 AST 解析演示
 * 展示支持 13 种编程语言的代码结构解析
 */

import {
  // Tree-sitter 解析器
  TreeSitterParserManager,
  treeSitterParserManager,

  // AST 解析器
  astManager,

  // 渲染器
  renderDivider,
  renderList,
  renderKeyValue,
} from '../src/cli/index.js'

async function main() {
  console.log('=== Tree-sitter 多语言 AST 解析演示 ===\n')

  // 1. 初始化 tree-sitter
  console.log('1. 初始化 Tree-sitter 解析器')
  console.log(renderDivider(60))

  try {
    await treeSitterParserManager.initialize()
    console.log('✓ Tree-sitter 解析器初始化成功')
  } catch (error) {
    console.log('✗ Tree-sitter 解析器初始化失败:', error)
    console.log('  提示: 需要安装 tree-sitter 和语言 grammar')
    console.log('  运行: npm install tree-sitter tree-sitter-typescript tree-sitter-javascript tree-sitter-java')
    return
  }

  // 2. 显示支持的语言
  console.log('\n2. 支持的语言')
  console.log(renderDivider(60))

  const supportedLanguages = treeSitterParserManager.getSupportedLanguages()
  console.log(renderList(supportedLanguages, true))

  // 3. 解析不同语言的代码示例
  console.log('\n3. 代码解析示例')
  console.log(renderDivider(60))

  // TypeScript 示例
  const tsCode = `
import chalk from 'chalk'

export interface User {
  id: string
  name: string
}

export class UserManager {
  private users: User[] = []

  async addUser(user: User): Promise<void> {
    this.users.push(user)
  }

  getUser(id: string): User | undefined {
    return this.users.find(u => u.id === id)
  }
}

export function formatUser(user: User): string {
  return \`\${user.name} (\${user.email})\`
}
`

  console.log('\nTypeScript:')
  try {
    const tsTree = treeSitterParserManager.parseCode(tsCode, 'typescript')
    if (tsTree) {
      const nodes = treeSitterParserManager.extractASTNodes(tsTree, 'typescript', 'example.ts')
      console.log(`  找到 ${nodes.length} 个节点:`)
      for (const node of nodes.slice(0, 5)) {
        console.log(`    ${node.type}: ${node.name} (行 ${node.startLine})`)
      }
    }
  } catch (error) {
    console.log('  解析失败:', error)
  }

  // Java 示例
  const javaCode = `
import java.util.List;
import java.util.ArrayList;

public class UserManager {
    private List<User> users = new ArrayList<>();

    public void addUser(User user) {
        users.add(user);
    }

    public User getUser(String id) {
        return users.stream()
            .filter(u -> u.getId().equals(id))
            .findFirst()
            .orElse(null);
    }

    public List<User> getAllUsers() {
        return new ArrayList<>(users);
    }
}
`

  console.log('\nJava:')
  try {
    const javaTree = treeSitterParserManager.parseCode(javaCode, 'java')
    if (javaTree) {
      const nodes = treeSitterParserManager.extractASTNodes(javaTree, 'java', 'UserManager.java')
      console.log(`  找到 ${nodes.length} 个节点:`)
      for (const node of nodes.slice(0, 5)) {
        console.log(`    ${node.type}: ${node.name} (行 ${node.startLine})`)
      }
    }
  } catch (error) {
    console.log('  解析失败:', error)
  }

  // Swift 示例
  const swiftCode = `
import Foundation

protocol UserServiceProtocol {
    func addUser(_ user: User)
    func getUser(byId id: String) -> User?
}

class UserService: UserServiceProtocol {
    private var users: [User] = []

    func addUser(_ user: User) {
        users.append(user)
    }

    func getUser(byId id: String) -> User? {
        return users.first { $0.id == id }
    }

    func loadUsers() async throws -> [User] {
        // 模拟网络请求
        try await Task.sleep(nanoseconds: 1_000_000_000)
        return users
    }
}
`

  console.log('\nSwift:')
  try {
    const swiftTree = treeSitterParserManager.parseCode(swiftCode, 'swift')
    if (swiftTree) {
      const nodes = treeSitterParserManager.extractASTNodes(swiftTree, 'swift', 'UserService.swift')
      console.log(`  找到 ${nodes.length} 个节点:`)
      for (const node of nodes.slice(0, 5)) {
        console.log(`    ${node.type}: ${node.name} (行 ${node.startLine})`)
      }
    }
  } catch (error) {
    console.log('  解析失败:', error)
  }

  // Dart 示例
  const dartCode = `
import 'package:flutter/material.dart'

class UserManager {
  final List<User> _users = []

  void addUser(User user) {
    _users.add(user)
  }

  User? getUser(String id) {
    try {
      return _users.firstWhere((u) => u.id == id)
    } catch (e) {
      return null
    }
  }

  Future<List<User>> loadUsers() async {
    await Future.delayed(Duration(seconds: 1))
    return _users
  }
}

String formatUser(User user) {
  return '\${user.name} (\${user.email})'
}
`

  console.log('\nDart:')
  try {
    const dartTree = treeSitterParserManager.parseCode(dartCode, 'dart')
    if (dartTree) {
      const nodes = treeSitterParserManager.extractASTNodes(dartTree, 'dart', 'UserManager.dart')
      console.log(`  找到 ${nodes.length} 个节点:`)
      for (const node of nodes.slice(0, 5)) {
        console.log(`    ${node.type}: ${node.name} (行 ${node.startLine})`)
      }
    }
  } catch (error) {
    console.log('  解析失败:', error)
  }

  // 4. 符号搜索演示
  console.log('\n4. 符号搜索')
  console.log(renderDivider(60))

  // 解析多个文件
  const files = [
    { content: tsCode, path: 'example.ts', language: 'typescript' },
    { content: javaCode, path: 'UserManager.java', language: 'java' },
    { content: swiftCode, path: 'UserService.swift', language: 'swift' },
    { content: dartCode, path: 'UserManager.dart', language: 'dart' },
  ]

  for (const file of files) {
    try {
      astManager.parseFile(file.content, file.path)
    } catch (error) {
      // 忽略解析错误
    }
  }

  // 搜索符号
  console.log('搜索 "User" 相关符号:')
  const userResults = astManager.searchSymbol('User')
  console.log(astManager.renderSearchResults(userResults.slice(0, 10)))

  // 5. 命令用法演示
  console.log('\n5. 命令用法')
  console.log(renderDivider(60))

  console.log(renderList([
    '/ast - 显示支持的语言和用法',
    '/ast --init - 初始化 tree-sitter 解析器',
    '/ast --languages - 显示支持的语言',
    '/ast file.ts - 解析 TypeScript 文件',
    '/ast Main.java - 解析 Java 文件',
    '/ast UserService.swift - 解析 Swift 文件',
    '/ast UserManager.dart - 解析 Dart 文件',
  ], true))

  // 6. 安装说明
  console.log('\n6. 安装说明')
  console.log(renderDivider(60))

  console.log(renderList([
    'npm install tree-sitter',
    'npm install tree-sitter-typescript',
    'npm install tree-sitter-javascript',
    'npm install tree-sitter-java',
    'npm install tree-sitter-swift',
    'npm install tree-sitter-dart',
    'npm install tree-sitter-python',
    'npm install tree-sitter-go',
    'npm install tree-sitter-rust',
    'npm install tree-sitter-ruby',
    'npm install tree-sitter-php',
    'npm install tree-sitter-kotlin',
    'npm install tree-sitter-c',
    'npm install tree-sitter-cpp',
  ], true))

  console.log('\n=== 演示完成 ===')
}

main().catch(console.error)
