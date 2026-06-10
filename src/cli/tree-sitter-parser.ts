/**
 * Tree-sitter 多语言 AST 解析器
 * 支持 TypeScript、JavaScript、Java、Swift、Dart、Python、Go、Rust、C/C++、Ruby、PHP、Kotlin 等
 */

import { getTheme } from './theme.js'

// Tree-sitter 类型定义
export interface SyntaxNode {
  type: string
  text: string
  startPosition: { row: number; column: number }
  endPosition: { row: number; column: number }
  startIndex: number
  endIndex: number
  children: SyntaxNode[]
  namedChildren: SyntaxNode[]
  parent: SyntaxNode | null
  fieldName: string | null
  childForFieldName(name: string): SyntaxNode | null
  walk(): TreeCursor
}

export interface TreeCursor {
  nodeType: string
  nodeText: string
  startPosition: { row: number; column: number }
  endPosition: { row: number; column: number }
  fieldName: string | null
  gotoFirstChild(): boolean
  gotoNextSibling(): boolean
  gotoParent(): boolean
}

export interface Tree {
  rootNode: SyntaxNode
}

export interface Parser {
  setLanguage(language: any): void
  parse(input: string): Tree
}

// AST 节点类型
export type ASTNodeType =
  | 'program'
  | 'function'
  | 'class'
  | 'method'
  | 'property'
  | 'variable'
  | 'import'
  | 'export'
  | 'interface'
  | 'type'
  | 'enum'
  | 'decorator'
  | 'comment'

// AST 节点
export interface ASTNode {
  type: ASTNodeType
  name: string
  filePath: string
  startLine: number
  endLine: number
  startColumn: number
  endColumn: number
  children?: ASTNode[]
  metadata?: ASTMetadata
}

// AST 元数据
export interface ASTMetadata {
  // 函数相关
  parameters?: string[]
  returnType?: string
  isAsync?: boolean
  isGenerator?: boolean

  // 类相关
  superClass?: string
  implements?: string[]
  isAbstract?: boolean

  // 变量相关
  dataType?: string
  isConstant?: boolean
  isExported?: boolean

  // 导入相关
  importPath?: string
  importNames?: string[]
  isDefault?: boolean

  // 通用
  modifiers?: string[]
  documentation?: string
  decorators?: string[]
}

// 符号信息
export interface SymbolInfo {
  name: string
  type: ASTNodeType
  filePath: string
  line: number
  column: number
  documentation?: string
  dataType?: string
  isExported?: boolean
}

// 语言配置
export interface LanguageConfig {
  name: string
  extensions: string[]
  grammar: any
  nodeTypes: {
    function: string[]
    class: string[]
    method: string[]
    variable: string[]
    import: string[]
    export: string[]
    interface: string[]
    type: string[]
    enum: string[]
    parameter: string[]
    return_type: string[]
  }
}

/**
 * Tree-sitter 解析器管理器
 */
export class TreeSitterParserManager {
  private parser: Parser | null = null
  private languages: Map<string, LanguageConfig> = new Map()
  private initialized = false

  /**
   * 初始化解析器
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // 动态导入 tree-sitter
      const TreeSitter = require('tree-sitter')
      this.parser = new TreeSitter() as Parser

      // 加载语言 grammar
      await this.loadLanguages()
      this.initialized = true
    } catch (error) {
      console.error('初始化 tree-sitter 失败:', error)
      throw error
    }
  }

  /**
   * 加载语言 grammar
   */
  private async loadLanguages(): Promise<void> {
    const languageConfigs = [
      {
        name: 'typescript',
        extensions: ['.ts', '.tsx'],
        module: 'tree-sitter-typescript',
        nodeTypes: {
          function: ['function_declaration', 'arrow_function', 'function'],
          class: ['class_declaration', 'class'],
          method: ['method_definition', 'method'],
          variable: ['variable_declaration', 'lexical_declaration', 'variable'],
          import: ['import_statement', 'import'],
          export: ['export_statement', 'export'],
          interface: ['interface_declaration', 'interface'],
          type: ['type_alias_declaration', 'type'],
          enum: ['enum_declaration', 'enum'],
          parameter: ['required_parameter', 'optional_parameter', 'parameter'],
          return_type: ['type_annotation', 'return_type'],
        },
      },
      {
        name: 'javascript',
        extensions: ['.js', '.jsx'],
        module: 'tree-sitter-javascript',
        nodeTypes: {
          function: ['function_declaration', 'arrow_function', 'function'],
          class: ['class_declaration', 'class'],
          method: ['method_definition', 'method'],
          variable: ['variable_declaration', 'lexical_declaration', 'variable'],
          import: ['import_statement', 'import'],
          export: ['export_statement', 'export'],
          interface: [],
          type: [],
          enum: [],
          parameter: ['required_parameter', 'optional_parameter', 'parameter'],
          return_type: [],
        },
      },
      {
        name: 'java',
        extensions: ['.java'],
        module: 'tree-sitter-java',
        nodeTypes: {
          function: ['method_declaration', 'constructor_declaration'],
          class: ['class_declaration'],
          method: ['method_declaration'],
          variable: ['field_declaration', 'local_variable_declaration'],
          import: ['import_declaration'],
          export: [],
          interface: ['interface_declaration'],
          type: [],
          enum: ['enum_declaration'],
          parameter: ['formal_parameter'],
          return_type: ['type'],
        },
      },
      {
        name: 'swift',
        extensions: ['.swift'],
        module: 'tree-sitter-swift',
        nodeTypes: {
          function: ['function_declaration'],
          class: ['class_declaration'],
          method: ['function_declaration'],
          variable: ['property_declaration', 'variable_declaration'],
          import: ['import_declaration'],
          export: [],
          interface: ['protocol_declaration'],
          type: ['type_alias_declaration'],
          enum: ['enum_declaration'],
          parameter: ['parameter'],
          return_type: ['type_annotation'],
        },
      },
      {
        name: 'dart',
        extensions: ['.dart'],
        module: 'tree-sitter-dart',
        nodeTypes: {
          function: ['function_declaration', 'method_declaration'],
          class: ['class_declaration'],
          method: ['method_declaration'],
          variable: ['field_declaration', 'variable_declaration'],
          import: ['import_specification'],
          export: [],
          interface: [],
          type: ['type_alias'],
          enum: ['enum_declaration'],
          parameter: ['formal_parameter'],
          return_type: ['type_annotation'],
        },
      },
      {
        name: 'python',
        extensions: ['.py'],
        module: 'tree-sitter-python',
        nodeTypes: {
          function: ['function_definition'],
          class: ['class_definition'],
          method: ['function_definition'],
          variable: ['assignment', 'augmented_assignment'],
          import: ['import_statement', 'import_from_statement'],
          export: [],
          interface: [],
          type: [],
          enum: [],
          parameter: ['parameters', 'default_parameter', 'typed_parameter'],
          return_type: ['type'],
        },
      },
      {
        name: 'go',
        extensions: ['.go'],
        module: 'tree-sitter-go',
        nodeTypes: {
          function: ['function_declaration', 'method_declaration'],
          class: ['type_declaration'],
          method: ['method_declaration'],
          variable: ['var_declaration', 'short_var_declaration'],
          import: ['import_declaration'],
          export: [],
          interface: ['interface_type'],
          type: ['type_declaration'],
          enum: [],
          parameter: ['parameter_declaration'],
          return_type: ['type'],
        },
      },
      {
        name: 'rust',
        extensions: ['.rs'],
        module: 'tree-sitter-rust',
        nodeTypes: {
          function: ['function_item'],
          class: ['impl_item', 'struct_item'],
          method: ['function_item'],
          variable: ['let_declaration', 'const_item', 'static_item'],
          import: ['use_declaration'],
          export: [],
          interface: ['trait_item'],
          type: ['type_alias'],
          enum: ['enum_item'],
          parameter: ['parameter'],
          return_type: ['type'],
        },
      },
      {
        name: 'ruby',
        extensions: ['.rb'],
        module: 'tree-sitter-ruby',
        nodeTypes: {
          function: ['method', 'singleton_method'],
          class: ['class'],
          method: ['method'],
          variable: ['assignment'],
          import: ['call'],
          export: [],
          interface: [],
          type: [],
          enum: [],
          parameter: ['method_parameters', 'block_parameters'],
          return_type: [],
        },
      },
      {
        name: 'php',
        extensions: ['.php'],
        module: 'tree-sitter-php',
        nodeTypes: {
          function: ['function_definition', 'method_declaration'],
          class: ['class_declaration'],
          method: ['method_declaration'],
          variable: ['property_declaration', 'simple_parameter'],
          import: [],
          export: [],
          interface: ['interface_declaration'],
          type: [],
          enum: ['enum_declaration'],
          parameter: ['simple_parameter'],
          return_type: ['type_list'],
        },
      },
      {
        name: 'kotlin',
        extensions: ['.kt', '.kts'],
        module: 'tree-sitter-kotlin',
        nodeTypes: {
          function: ['function_declaration'],
          class: ['class_declaration'],
          method: ['function_declaration'],
          variable: ['property_declaration', 'variable_declaration'],
          import: ['import_header'],
          export: [],
          interface: ['class_declaration'],
          type: ['type_alias'],
          enum: ['class_declaration'],
          parameter: ['parameter', 'value_parameter'],
          return_type: ['type_reference'],
        },
      },
      {
        name: 'c',
        extensions: ['.c', '.h'],
        module: 'tree-sitter-c',
        nodeTypes: {
          function: ['function_definition'],
          class: ['struct_specifier'],
          method: ['function_definition'],
          variable: ['declaration'],
          import: ['preproc_include'],
          export: [],
          interface: [],
          type: ['type_definition'],
          enum: ['enum_specifier'],
          parameter: ['parameter_declaration'],
          return_type: ['type'],
        },
      },
      {
        name: 'cpp',
        extensions: ['.cpp', '.cc', '.cxx', '.hpp', '.hxx'],
        module: 'tree-sitter-cpp',
        nodeTypes: {
          function: ['function_definition'],
          class: ['class_specifier'],
          method: ['function_definition'],
          variable: ['declaration'],
          import: ['preproc_include'],
          export: [],
          interface: [],
          type: ['type_definition', 'alias_declaration'],
          enum: ['enum_specifier'],
          parameter: ['parameter_declaration'],
          return_type: ['type'],
        },
      },
    ]

    for (const config of languageConfigs) {
      try {
        const grammar = require(config.module)
        this.languages.set(config.name, {
          ...config,
          grammar: grammar.default || grammar,
        })
      } catch (error) {
        // 语言 grammar 未安装，跳过
        console.warn(`未安装 ${config.name} 的 tree-sitter grammar`)
      }
    }
  }

  /**
   * 获取支持的语言
   */
  getSupportedLanguages(): string[] {
    return Array.from(this.languages.keys())
  }

  /**
   * 根据文件扩展名获取语言
   */
  getLanguageByExtension(ext: string): string | null {
    for (const [lang, config] of this.languages) {
      if (config.extensions.includes(ext)) {
        return lang
      }
    }
    return null
  }

  /**
   * 解析代码
   */
  parseCode(code: string, language: string): Tree | null {
    if (!this.parser || !this.initialized) {
      throw new Error('解析器未初始化')
    }

    const config = this.languages.get(language)
    if (!config) {
      throw new Error(`不支持的语言: ${language}`)
    }

    this.parser.setLanguage(config.grammar)
    return this.parser.parse(code)
  }

  /**
   * 提取 AST 节点
   */
  extractASTNodes(tree: Tree, language: string, filePath: string): ASTNode[] {
    const config = this.languages.get(language)
    if (!config) return []

    const nodes: ASTNode[] = []
    const cursor = tree.rootNode.walk()

    this.traverseCursor(cursor, config, filePath, nodes)
    return nodes
  }

  /**
   * 遍历游标
   */
  private traverseCursor(
    cursor: TreeCursor,
    config: LanguageConfig,
    filePath: string,
    nodes: ASTNode[]
  ): void {
    const nodeType = cursor.nodeType
    const nodeText = cursor.nodeText
    const startPos = cursor.startPosition
    const endPos = cursor.endPosition

    // 检查节点类型
    let astType: ASTNodeType | null = null

    if (config.nodeTypes.function.includes(nodeType)) {
      astType = 'function'
    } else if (config.nodeTypes.class.includes(nodeType)) {
      astType = 'class'
    } else if (config.nodeTypes.method.includes(nodeType)) {
      astType = 'method'
    } else if (config.nodeTypes.variable.includes(nodeType)) {
      astType = 'variable'
    } else if (config.nodeTypes.import.includes(nodeType)) {
      astType = 'import'
    } else if (config.nodeTypes.interface.includes(nodeType)) {
      astType = 'interface'
    } else if (config.nodeTypes.type.includes(nodeType)) {
      astType = 'type'
    } else if (config.nodeTypes.enum.includes(nodeType)) {
      astType = 'enum'
    }

    if (astType) {
      // 提取名称
      const name = this.extractNodeName(cursor, config, astType)

      // 提取元数据
      const metadata = this.extractMetadata(cursor, config, astType)

      nodes.push({
        type: astType,
        name: name || nodeText.slice(0, 50),
        filePath,
        startLine: startPos.row + 1,
        endLine: endPos.row + 1,
        startColumn: startPos.column,
        endColumn: endPos.column,
        metadata,
      })
    }

    // 遍历子节点
    if (cursor.gotoFirstChild()) {
      do {
        this.traverseCursor(cursor, config, filePath, nodes)
      } while (cursor.gotoNextSibling())
      cursor.gotoParent()
    }
  }

  /**
   * 提取节点名称
   */
  private extractNodeName(cursor: TreeCursor, config: LanguageConfig, astType: ASTNodeType): string | null {
    // 这里需要根据具体的语言和节点类型来提取名称
    // 简化实现：从文本中提取
    const text = cursor.nodeText

    // 尝试提取函数名
    if (astType === 'function' || astType === 'method') {
      const match = text.match(/(?:function|func|def|fn)\s+(\w+)/)
      if (match) return match[1]
    }

    // 尝试提取类名
    if (astType === 'class') {
      const match = text.match(/(?:class|struct|interface)\s+(\w+)/)
      if (match) return match[1]
    }

    // 尝试提取变量名
    if (astType === 'variable') {
      const match = text.match(/(?:const|let|var|final|val|int|String|bool)\s+(\w+)/)
      if (match) return match[1]
    }

    return null
  }

  /**
   * 提取元数据
   */
  private extractMetadata(cursor: TreeCursor, config: LanguageConfig, astType: ASTNodeType): ASTMetadata {
    const metadata: ASTMetadata = {}
    const text = cursor.nodeText

    // 提取参数
    if (astType === 'function' || astType === 'method') {
      const paramMatch = text.match(/\(([^)]*)\)/)
      if (paramMatch) {
        metadata.parameters = paramMatch[1]
          .split(',')
          .map(p => p.trim())
          .filter(Boolean)
      }

      // 检查是否异步
      metadata.isAsync = text.includes('async') || text.includes('Future')
    }

    // 提取返回类型
    if (astType === 'function' || astType === 'method') {
      const returnMatch = text.match(/(?:->|:)\s*(\w+)/)
      if (returnMatch) {
        metadata.returnType = returnMatch[1]
      }
    }

    // 检查是否导出
    metadata.isExported = text.includes('export') || text.includes('public')

    // 检查是否抽象
    metadata.isAbstract = text.includes('abstract')

    // 检查是否常量
    if (astType === 'variable') {
      metadata.isConstant = text.includes('const') || text.includes('final')
    }

    return metadata
  }
}

/**
 * 创建 Tree-sitter 解析器管理器
 */
export function createTreeSitterParserManager(): TreeSitterParserManager {
  return new TreeSitterParserManager()
}

/**
 * 全局 Tree-sitter 解析器管理器实例
 */
export const treeSitterParserManager = createTreeSitterParserManager()

export default {
  TreeSitterParserManager,
  createTreeSitterParserManager,
  treeSitterParserManager,
}
