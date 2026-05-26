import type {
  SecurityPattern,
  SecurityCheckResult,
  SecurityIssue,
  SecuritySeverity,
  SecurityCategory,
  SecurityConfig,
} from './types.js';

export class SecurityChecker {
  private patterns: SecurityPattern[] = [];
  private config: SecurityConfig;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      enabled: true,
      severityThreshold: 'medium',
      categories: [
        'command_injection',
        'path_traversal',
        'xss',
        'sql_injection',
        'code_injection',
        'file_operation',
        'credential_exposure',
        'dangerous_config',
        'unsafe_deserialization',
      ],
      customPatterns: [],
      ...config,
    };

    this.initBuiltinPatterns();
  }

  // 初始化内置安全模式
  private initBuiltinPatterns(): void {
    // 命令注入
    this.patterns.push({
      id: 'cmd-injection-1',
      name: '命令注入 - rm -rf',
      description: '检测危险的递归删除命令',
      pattern: /rm\s+(-[a-z]*r[a-z]*f|-[a-z]*f[a-z]*r)\s/,
      severity: 'critical',
      category: 'command_injection',
      message: '检测到危险的递归删除命令',
      suggestion: '请确认路径是否正确，避免删除重要文件',
    });

    this.patterns.push({
      id: 'cmd-injection-2',
      name: '命令注入 - dd',
      description: '检测 dd 命令可能覆盖磁盘',
      pattern: /dd\s+if=/,
      severity: 'critical',
      category: 'command_injection',
      message: 'dd 命令可能覆盖磁盘数据',
      suggestion: '请确认输入输出路径是否正确',
    });

    this.patterns.push({
      id: 'cmd-injection-3',
      name: '命令注入 - mkfs',
      description: '检测文件系统格式化命令',
      pattern: /mkfs\./,
      severity: 'critical',
      category: 'command_injection',
      message: '检测到文件系统格式化命令',
      suggestion: '格式化会永久删除数据，请确认设备路径',
    });

    this.patterns.push({
      id: 'cmd-injection-4',
      name: '命令注入 - chmod 777',
      description: '检测过于宽松的权限设置',
      pattern: /chmod\s+777/,
      severity: 'high',
      category: 'command_injection',
      message: '设置过于宽松的文件权限',
      suggestion: '建议使用更严格的权限，如 755 或 644',
    });

    this.patterns.push({
      id: 'cmd-injection-5',
      name: '命令注入 - eval',
      description: '检测 eval 执行',
      pattern: /eval\s*\(/,
      severity: 'high',
      category: 'code_injection',
      message: 'eval 执行存在安全风险',
      suggestion: '避免使用 eval，考虑使用更安全的替代方案',
    });

    this.patterns.push({
      id: 'cmd-injection-6',
      name: '命令注入 - exec',
      description: '检测 exec 执行',
      pattern: /exec\s*\(/,
      severity: 'high',
      category: 'code_injection',
      message: 'exec 执行存在安全风险',
      suggestion: '确保输入经过严格验证',
    });

    // 路径遍历
    this.patterns.push({
      id: 'path-traversal-1',
      name: '路径遍历',
      description: '检测路径遍历攻击',
      pattern: /\.\.\//,
      severity: 'high',
      category: 'path_traversal',
      message: '检测到路径遍历尝试',
      suggestion: '使用绝对路径或验证路径边界',
    });

    // XSS
    this.patterns.push({
      id: 'xss-1',
      name: 'XSS - innerHTML',
      description: '检测 innerHTML 使用',
      pattern: /\.innerHTML\s*=/,
      severity: 'medium',
      category: 'xss',
      message: 'innerHTML 可能导致 XSS',
      suggestion: '使用 textContent 或 DOMPurify 清理',
    });

    this.patterns.push({
      id: 'xss-2',
      name: 'XSS - document.write',
      description: '检测 document.write 使用',
      pattern: /document\.write\s*\(/,
      severity: 'medium',
      category: 'xss',
      message: 'document.write 可能导致 XSS',
      suggestion: '使用 DOM API 替代',
    });

    // SQL 注入
    this.patterns.push({
      id: 'sql-injection-1',
      name: 'SQL 注入 - 字符串拼接',
      description: '检测 SQL 字符串拼接',
      pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\$\{|(?:SELECT|INSERT|UPDATE|DELETE|DROP)\s+.*\+/i,
      severity: 'critical',
      category: 'sql_injection',
      message: 'SQL 字符串拼接存在注入风险',
      suggestion: '使用参数化查询或 ORM',
    });

    // 凭证暴露
    this.patterns.push({
      id: 'credential-1',
      name: '凭证暴露 - API Key',
      description: '检测硬编码的 API Key',
      pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i,
      severity: 'critical',
      category: 'credential_exposure',
      message: '检测到硬编码的 API Key',
      suggestion: '使用环境变量存储敏感信息',
    });

    this.patterns.push({
      id: 'credential-2',
      name: '凭证暴露 - 密码',
      description: '检测硬编码的密码',
      pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/i,
      severity: 'critical',
      category: 'credential_exposure',
      message: '检测到硬编码的密码',
      suggestion: '使用环境变量或密钥管理服务',
    });

    this.patterns.push({
      id: 'credential-3',
      name: '凭证暴露 - 私钥',
      description: '检测私钥文件',
      pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/,
      severity: 'critical',
      category: 'credential_exposure',
      message: '检测到私钥内容',
      suggestion: '私钥不应出现在代码中',
    });

    // 文件操作
    this.patterns.push({
      id: 'file-op-1',
      name: '文件操作 - 敏感文件',
      description: '检测敏感文件操作',
      pattern: /\.(env|pem|key|p12|pfx|jks)$/i,
      severity: 'high',
      category: 'file_operation',
      message: '检测到敏感文件操作',
      suggestion: '确保敏感文件不被提交到版本控制',
    });

    // 危险配置
    this.patterns.push({
      id: 'dangerous-config-1',
      name: '危险配置 - CORS',
      description: '检测过于宽松的 CORS 配置',
      pattern: /Access-Control-Allow-Origin.*\*/,
      severity: 'medium',
      category: 'dangerous_config',
      message: 'CORS 配置过于宽松',
      suggestion: '限制允许的源',
    });

    // 不安全的反序列化
    this.patterns.push({
      id: 'unsafe-deser-1',
      name: '不安全反序列化 - pickle',
      description: '检测 pickle 反序列化',
      pattern: /pickle\.loads?\(/,
      severity: 'critical',
      category: 'unsafe_deserialization',
      message: 'pickle 反序列化存在安全风险',
      suggestion: '使用更安全的序列化方式，如 JSON',
    });

    this.patterns.push({
      id: 'unsafe-deser-2',
      name: '不安全反序列化 - eval',
      description: '检测 eval 反序列化',
      pattern: /JSON\.parse\(.*\+|eval\(.*JSON/,
      severity: 'high',
      category: 'unsafe_deserialization',
      message: 'JSON 解析可能存在注入风险',
      suggestion: '确保输入来源可信',
    });

    // 添加自定义模式
    this.patterns.push(...this.config.customPatterns);
  }

  // 检查代码
  checkCode(code: string, location?: string): SecurityCheckResult {
    if (!this.config.enabled) {
      return { passed: true, issues: [], score: 100 };
    }

    const issues: SecurityIssue[] = [];

    for (const pattern of this.patterns) {
      if (!this.isCategoryEnabled(pattern.category)) continue;
      if (!this.isSeverityAboveThreshold(pattern.severity)) continue;

      const matches = code.match(new RegExp(pattern.pattern, 'g'));
      if (matches) {
        for (const match of matches) {
          issues.push({
            pattern,
            match,
            location,
            context: this.extractContext(code, match),
          });
        }
      }
    }

    const score = this.calculateScore(issues);

    return {
      passed: issues.length === 0,
      issues,
      score,
    };
  }

  // 检查命令
  checkCommand(command: string): SecurityCheckResult {
    return this.checkCode(command, 'command');
  }

  // 检查文件路径
  checkFilePath(filePath: string): SecurityCheckResult {
    const issues: SecurityIssue[] = [];

    // 检查路径遍历
    if (filePath.includes('..')) {
      issues.push({
        pattern: this.patterns.find(p => p.id === 'path-traversal-1')!,
        match: filePath,
        location: 'file_path',
      });
    }

    // 检查敏感文件
    if (/\.(env|pem|key|p12|pfx|jks)$/i.test(filePath)) {
      issues.push({
        pattern: this.patterns.find(p => p.id === 'file-op-1')!,
        match: filePath,
        location: 'file_path',
      });
    }

    const score = this.calculateScore(issues);

    return {
      passed: issues.length === 0,
      issues,
      score,
    };
  }

  // 检查是否启用类别
  private isCategoryEnabled(category: SecurityCategory): boolean {
    return this.config.categories.includes(category);
  }

  // 检查严重性是否高于阈值
  private isSeverityAboveThreshold(severity: SecuritySeverity): boolean {
    const levels: SecuritySeverity[] = ['info', 'low', 'medium', 'high', 'critical'];
    const thresholdIndex = levels.indexOf(this.config.severityThreshold);
    const severityIndex = levels.indexOf(severity);
    return severityIndex >= thresholdIndex;
  }

  // 提取上下文
  private extractContext(code: string, match: string): string {
    const index = code.indexOf(match);
    if (index === -1) return '';

    const start = Math.max(0, index - 50);
    const end = Math.min(code.length, index + match.length + 50);
    return code.substring(start, end);
  }

  // 计算安全分数
  private calculateScore(issues: SecurityIssue[]): number {
    if (issues.length === 0) return 100;

    let deductions = 0;
    for (const issue of issues) {
      switch (issue.pattern.severity) {
        case 'critical':
          deductions += 25;
          break;
        case 'high':
          deductions += 15;
          break;
        case 'medium':
          deductions += 10;
          break;
        case 'low':
          deductions += 5;
          break;
        case 'info':
          deductions += 2;
          break;
      }
    }

    return Math.max(0, 100 - deductions);
  }

  // 获取所有模式
  getPatterns(): SecurityPattern[] {
    return [...this.patterns];
  }

  // 添加自定义模式
  addPattern(pattern: SecurityPattern): void {
    this.patterns.push(pattern);
  }

  // 移除模式
  removePattern(id: string): void {
    this.patterns = this.patterns.filter(p => p.id !== id);
  }

  // 更新配置
  updateConfig(config: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取配置
  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

export const securityChecker = new SecurityChecker();
