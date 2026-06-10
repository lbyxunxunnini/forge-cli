import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { stringify as stringifyYaml } from 'yaml';
import type {
  PluginType,
  PluginTemplate,
  PluginProject,
  PluginValidationResult,
  PluginTestResult,
  TemplateFile,
  TemplateVariable,
  TestResult,
} from './types.js';

export class PluginDevToolkit {
  private templates: Map<string, PluginTemplate> = new Map();

  constructor() {
    this.initTemplates();
  }

  // 初始化模板
  private initTemplates(): void {
    // 命令插件模板
    this.templates.set('command', {
      id: 'command',
      name: '命令插件',
      description: '创建自定义斜杠命令',
      type: 'command',
      files: [
        {
          path: '.plugin.json',
          content: JSON.stringify({
            name: '{{name}}',
            version: '1.0.0',
            description: '{{description}}',
          }, null, 2),
          isTemplate: true,
        },
        {
          path: 'commands/{{name}}.md',
          content: `---
name: {{name}}
description: {{description}}
usage: /{{name}} [args]
---

# {{name}}

{{description}}

## 使用方法

\`\`\`
/{{name}} [args]
\`\`\`
`,
          isTemplate: true,
        },
      ],
      variables: [
        { name: 'name', description: '命令名称', type: 'string', required: true },
        { name: 'description', description: '命令描述', type: 'string', required: true },
      ],
    });

    // Agent 插件模板
    this.templates.set('agent', {
      id: 'agent',
      name: 'Agent 插件',
      description: '创建专业 Agent',
      type: 'agent',
      files: [
        {
          path: '.plugin.json',
          content: JSON.stringify({
            name: '{{name}}',
            version: '1.0.0',
            description: '{{description}}',
          }, null, 2),
          isTemplate: true,
        },
        {
          path: 'agents/{{name}}.md',
          content: `---
name: {{name}}
description: {{description}}
allowedTools:
  - readFile
  - listFiles
  - searchFiles
---

你是 {{name}}，一个专业 Agent。

## 职责

{{description}}

## 工作流程

1. 分析输入
2. 执行任务
3. 返回结果
`,
          isTemplate: true,
        },
      ],
      variables: [
        { name: 'name', description: 'Agent 名称', type: 'string', required: true },
        { name: 'description', description: 'Agent 描述', type: 'string', required: true },
      ],
    });

    // 技能插件模板
    this.templates.set('skill', {
      id: 'skill',
      name: '技能插件',
      description: '创建 Agent 技能',
      type: 'skill',
      files: [
        {
          path: '.plugin.json',
          content: JSON.stringify({
            name: '{{name}}',
            version: '1.0.0',
            description: '{{description}}',
          }, null, 2),
          isTemplate: true,
        },
        {
          path: 'skills/{{name}}/SKILL.md',
          content: `---
name: {{name}}
description: {{description}}
autoInvoke: false
triggers:
  - {{trigger}}
---

# {{name}}

{{description}}

## 使用方法

当检测到 "{{trigger}}" 时自动触发。
`,
          isTemplate: true,
        },
      ],
      variables: [
        { name: 'name', description: '技能名称', type: 'string', required: true },
        { name: 'description', description: '技能描述', type: 'string', required: true },
        { name: 'trigger', description: '触发关键词', type: 'string', required: true },
      ],
    });

    // 钩子插件模板
    this.templates.set('hook', {
      id: 'hook',
      name: '钩子插件',
      description: '创建事件钩子',
      type: 'hook',
      files: [
        {
          path: '.plugin.json',
          content: JSON.stringify({
            name: '{{name}}',
            version: '1.0.0',
            description: '{{description}}',
          }, null, 2),
          isTemplate: true,
        },
        {
          path: 'hooks/hooks.json',
          content: JSON.stringify({
            description: '{{description}}',
            hooks: {
              '{{event}}': [{
                hooks: [{
                  type: 'command',
                  command: 'python3 ${CLAUDE_PLUGIN_ROOT}/hooks/handler.py',
                }],
                matcher: '{{matcher}}',
              }],
            },
          }, null, 2),
          isTemplate: true,
        },
        {
          path: 'hooks/handler.py',
          content: `#!/usr/bin/env python3
"""
{{description}}
"""

import json
import sys

def main():
    # 读取输入
    input_data = json.load(sys.stdin)

    # 处理逻辑
    # TODO: 实现你的钩子逻辑

    # 返回结果
    result = {
        "action": "allow",
        "message": "{{name}} 钩子执行完成"
    }

    print(json.dumps(result))

if __name__ == "__main__":
    main()
`,
          isTemplate: true,
        },
      ],
      variables: [
        { name: 'name', description: '钩子名称', type: 'string', required: true },
        { name: 'description', description: '钩子描述', type: 'string', required: true },
        { name: 'event', description: '事件类型 (PreToolUse/PostToolUse/Stop)', type: 'string', required: true },
        { name: 'matcher', description: '匹配器 (工具名正则)', type: 'string', required: false, default: '' },
      ],
    });

    // 完整插件模板
    this.templates.set('full', {
      id: 'full',
      name: '完整插件',
      description: '创建包含所有组件的完整插件',
      type: 'full',
      files: [
        {
          path: '.plugin.json',
          content: JSON.stringify({
            name: '{{name}}',
            version: '1.0.0',
            description: '{{description}}',
            author: '{{author}}',
          }, null, 2),
          isTemplate: true,
        },
        {
          path: 'README.md',
          content: `# {{name}}

{{description}}

## 安装

将此插件放入 \`~/.forge-cli/plugins/\` 目录。

## 使用

### 命令

\`\`\`
/{{name}}
\`\`\`

### Agent

自动激活 {{name}} Agent。

### 技能

当检测到相关触发词时自动激活。
`,
          isTemplate: true,
        },
        {
          path: 'commands/{{name}}.md',
          content: `---
name: {{name}}
description: {{description}}
---

# {{name}}

{{description}}
`,
          isTemplate: true,
        },
        {
          path: 'agents/{{name}}.md',
          content: `---
name: {{name}}
description: {{description}}
---

你是 {{name}} Agent。
`,
          isTemplate: true,
        },
      ],
      variables: [
        { name: 'name', description: '插件名称', type: 'string', required: true },
        { name: 'description', description: '插件描述', type: 'string', required: true },
        { name: 'author', description: '作者', type: 'string', required: false, default: 'Anonymous' },
      ],
    });
  }

  // 创建插件项目
  createProject(params: {
    name: string;
    type: PluginType;
    outputDir: string;
    variables: Record<string, unknown>;
  }): PluginProject {
    const template = this.templates.get(params.type);
    if (!template) {
      throw new Error(`未知的插件类型: ${params.type}`);
    }

    const projectPath = join(params.outputDir, params.name);

    // 创建目录
    if (!existsSync(projectPath)) {
      mkdirSync(projectPath, { recursive: true });
    }

    // 生成文件
    for (const file of template.files) {
      const filePath = join(projectPath, this.processTemplate(file.path, params.variables));
      const dir = filePath.replace(/[^/\\]+$/, '');

      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      const content = file.isTemplate
        ? this.processTemplate(file.content, params.variables)
        : file.content;

      writeFileSync(filePath, content, 'utf-8');
    }

    return {
      name: params.name,
      path: projectPath,
      type: params.type,
      template,
      variables: params.variables,
      createdAt: new Date().toISOString(),
    };
  }

  // 处理模板
  private processTemplate(template: string, variables: Record<string, unknown>): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  // 验证插件
  validate(pluginPath: string): PluginValidationResult {
    const errors: PluginValidationResult['errors'] = [];
    const warnings: PluginValidationResult['warnings'] = [];

    // 检查 plugin.json
    const configPaths = [
      join(pluginPath, '.plugin.json'),
      join(pluginPath, 'plugin.json'),
    ];

    let configExists = false;
    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        configExists = true;
        try {
          const content = readFileSync(configPath, 'utf-8');
          const config = JSON.parse(content);

          // 验证必需字段
          if (!config.name) {
            errors.push({
              file: configPath,
              message: '缺少 name 字段',
              severity: 'error',
            });
          }
          if (!config.version) {
            warnings.push({
              file: configPath,
              message: '缺少 version 字段',
              severity: 'warning',
            });
          }
          if (!config.description) {
            warnings.push({
              file: configPath,
              message: '缺少 description 字段',
              severity: 'warning',
            });
          }
        } catch {
          errors.push({
            file: configPath,
            message: 'JSON 解析失败',
            severity: 'error',
          });
        }
        break;
      }
    }

    if (!configExists) {
      errors.push({
        file: pluginPath,
        message: '缺少 .plugin.json 或 plugin.json',
        severity: 'error',
      });
    }

    // 检查命令文件
    const commandsDir = join(pluginPath, 'commands');
    if (existsSync(commandsDir)) {
      const { readdirSync } = require('fs');
      const files = readdirSync(commandsDir).filter((f: string) => f.endsWith('.md'));
      for (const file of files) {
        const filePath = join(commandsDir, file);
        const content = readFileSync(filePath, 'utf-8');

        // 检查 frontmatter
        if (!content.startsWith('---')) {
          warnings.push({
            file: filePath,
            message: '命令文件缺少 frontmatter',
            severity: 'warning',
          });
        }
      }
    }

    // 检查 Agent 文件
    const agentsDir = join(pluginPath, 'agents');
    if (existsSync(agentsDir)) {
      const { readdirSync } = require('fs');
      const files = readdirSync(agentsDir).filter((f: string) => f.endsWith('.md'));
      for (const file of files) {
        const filePath = join(agentsDir, file);
        const content = readFileSync(filePath, 'utf-8');

        // 检查 frontmatter
        if (!content.startsWith('---')) {
          warnings.push({
            file: filePath,
            message: 'Agent 文件缺少 frontmatter',
            severity: 'warning',
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // 测试插件
  async test(pluginPath: string): Promise<PluginTestResult> {
    const startTime = Date.now();
    const tests: PluginTestResult['tests'] = [];

    // 测试 1: 配置文件验证
    tests.push(await this.testConfig(pluginPath));

    // 测试 2: 命令文件验证
    tests.push(await this.testCommands(pluginPath));

    // 测试 3: Agent 文件验证
    tests.push(await this.testAgents(pluginPath));

    const duration = Date.now() - startTime;
    const passed = tests.every(t => t.passed);

    return { passed, tests, duration };
  }

  // 测试配置文件
  private async testConfig(pluginPath: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const validation = this.validate(pluginPath);
      return {
        name: '配置文件验证',
        passed: validation.valid,
        error: validation.errors.map(e => e.message).join(', '),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: '配置文件验证',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  // 测试命令文件
  private async testCommands(pluginPath: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const commandsDir = join(pluginPath, 'commands');
      if (!existsSync(commandsDir)) {
        return {
          name: '命令文件验证',
          passed: true,
          duration: Date.now() - startTime,
        };
      }

      // 检查命令文件格式
      const { readdirSync } = require('fs');
      const files = readdirSync(commandsDir).filter((f: string) => f.endsWith('.md'));

      for (const file of files) {
        const filePath = join(commandsDir, file);
        const content = readFileSync(filePath, 'utf-8');

        if (!content.includes('---')) {
          return {
            name: '命令文件验证',
            passed: false,
            error: `${file}: 缺少 frontmatter`,
            duration: Date.now() - startTime,
          };
        }
      }

      return {
        name: '命令文件验证',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: '命令文件验证',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  // 测试 Agent 文件
  private async testAgents(pluginPath: string): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const agentsDir = join(pluginPath, 'agents');
      if (!existsSync(agentsDir)) {
        return {
          name: 'Agent 文件验证',
          passed: true,
          duration: Date.now() - startTime,
        };
      }

      // 检查 Agent 文件格式
      const { readdirSync } = require('fs');
      const files = readdirSync(agentsDir).filter((f: string) => f.endsWith('.md'));

      for (const file of files) {
        const filePath = join(agentsDir, file);
        const content = readFileSync(filePath, 'utf-8');

        if (!content.includes('---')) {
          return {
            name: 'Agent 文件验证',
            passed: false,
            error: `${file}: 缺少 frontmatter`,
            duration: Date.now() - startTime,
          };
        }
      }

      return {
        name: 'Agent 文件验证',
        passed: true,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        name: 'Agent 文件验证',
        passed: false,
        error: String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  // 获取模板
  getTemplate(type: PluginType): PluginTemplate | undefined {
    return this.templates.get(type);
  }

  // 获取所有模板
  getTemplates(): PluginTemplate[] {
    return Array.from(this.templates.values());
  }

  // 格式式验证结果
  formatValidationResult(result: PluginValidationResult): string {
    const lines: string[] = [];

    if (result.valid) {
      lines.push('✅ 插件验证通过');
    } else {
      lines.push('❌ 插件验证失败');
    }

    if (result.errors.length > 0) {
      lines.push('');
      lines.push('错误:');
      for (const error of result.errors) {
        lines.push(`  - ${error.file}: ${error.message}`);
      }
    }

    if (result.warnings.length > 0) {
      lines.push('');
      lines.push('警告:');
      for (const warning of result.warnings) {
        lines.push(`  - ${warning.file}: ${warning.message}`);
      }
    }

    return lines.join('\n');
  }

  // 格式式测试结果
  formatTestResult(result: PluginTestResult): string {
    const lines: string[] = [];

    if (result.passed) {
      lines.push('✅ 所有测试通过');
    } else {
      lines.push('❌ 测试失败');
    }

    lines.push(`耗时: ${result.duration}ms`);
    lines.push('');

    for (const test of result.tests) {
      const status = test.passed ? '✅' : '❌';
      lines.push(`${status} ${test.name} (${test.duration}ms)`);
      if (test.error) {
        lines.push(`   错误: ${test.error}`);
      }
    }

    return lines.join('\n');
  }
}

export const pluginDevToolkit = new PluginDevToolkit();
