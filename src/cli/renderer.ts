import chalk from 'chalk';

export function renderBanner(version: string, model: string, projectRoot: string): string {
  const lines = [
    chalk.cyan('╔══════════════════════════════════════════╗'),
    chalk.cyan('║') + chalk.bold('  Flutter Forge ') + chalk.dim(`v${version}`) + '                    ' + chalk.cyan('║'),
    chalk.cyan('║') + chalk.dim('  模型: ') + chalk.yellow(model) + ' '.repeat(Math.max(0, 30 - model.length)) + chalk.cyan('║'),
    chalk.cyan('║') + chalk.dim('  项目: ') + chalk.white(truncate(projectRoot, 28)) + ' '.repeat(Math.max(0, 30 - Math.min(projectRoot.length, 28))) + chalk.cyan('║'),
    chalk.cyan('║') + chalk.dim('  输入 /help 查看命令') + '                  ' + chalk.cyan('║'),
    chalk.cyan('╚══════════════════════════════════════════╝'),
  ];
  return lines.join('\n');
}

export function renderHelp(): string {
  const commands = [
    ['/help', '显示帮助信息'],
    ['/model', '模型管理：查看/切换/配置/添加模型'],
    ['/model <name>', '切换模型（未配置时进入配置）'],
    ['/model <name> <key>', '快捷配置模型 API Key'],
    ['/config', '查看当前配置'],
    ['/clear', '清空对话上下文'],
    ['/status', '显示当前状态'],
    ['/fast', '切换 ff-fast 快速模式'],
    ['/auto', '切换 ff-a 全自动模式'],
    ['/session', '查看当前 session 信息'],
    ['/plugins', '查看已加载插件'],
    ['/mcp', '查看 MCP 服务器状态'],
    ['/security', '查看安全检查配置'],
    ['/learn', '切换学习模式'],
    ['/review', '查看代码审查配置'],
    ['/memory', '查看已保存的记忆'],
    ['/hook', '查看已注册钩子'],
    ['/trace', '查看最近一次执行的 Trace 摘要'],
    ['/exit', '退出程序'],
  ];

  const lines = [
    chalk.bold('\n可用命令:'),
    ...commands.map(([cmd, desc]) => `  ${chalk.cyan(cmd)}  ${chalk.dim(desc)}`),
    '',
    chalk.dim('提示: 直接输入内容开始对话'),
  ];
  return lines.join('\n');
}

export function renderStatus(contextSummary: string, model: string, phase?: string): string {
  const lines = [
    chalk.bold('\n当前状态:'),
    `  ${chalk.dim('模型:')} ${chalk.yellow(model)}`,
    `  ${chalk.dim('上下文:')} ${contextSummary}`,
  ];
  if (phase) {
    lines.push(`  ${chalk.dim('阶段:')} ${chalk.green(phase)}`);
  }
  return lines.join('\n');
}

export function renderError(error: string): string {
  return chalk.red(`\n错误: ${error}`);
}

export function renderSuccess(message: string): string {
  return chalk.green(`\n✓ ${message}`);
}

export function renderPhase(phase: string): string {
  return chalk.blue(`\n[${phase}]`);
}

export function renderAssistantStart(): string {
  return chalk.green('\n▸ ');
}

export function renderMarkdown(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let codeLang = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        result.push(chalk.dim('└' + '─'.repeat(40)));
        inCodeBlock = false;
      } else {
        codeLang = line.trimStart().slice(3).trim();
        const label = codeLang ? ` ${chalk.dim(codeLang)}` : '';
        result.push(chalk.dim('┌' + '─'.repeat(40)) + label);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      result.push(chalk.dim('│ ') + chalk.green(line));
      continue;
    }

    // Headers
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^(#{1,3})/)![1].length;
      const text = line.replace(/^#{1,3}\s+/, '');
      if (level === 1) result.push(chalk.bold.cyan(text));
      else if (level === 2) result.push(chalk.bold.blue(text));
      else result.push(chalk.bold.white(text));
      continue;
    }

    // Bold: **text**
    line = line.replace(/\*\*(.+?)\*\*/g, (_, t) => chalk.bold(t));
    // Italic: *text*
    line = line.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, (_, t) => chalk.italic(t));
    // Inline code: `text`
    line = line.replace(/`([^`]+)`/g, (_, t) => chalk.bgGray.white(` ${t} `));
    // Strikethrough: ~~text~~
    line = line.replace(/~~(.+?)~~/g, (_, t) => chalk.dim.strikethrough(t));

    // Bullet lists
    if (/^\s*[-*+]\s/.test(line)) {
      line = line.replace(/^(\s*)([-*+])\s/, `$1${chalk.cyan('•')} `);
    }

    // Numbered lists
    if (/^\s*\d+\.\s/.test(line)) {
      line = line.replace(/^(\s*)(\d+)\.\s/, `$1${chalk.cyan('$2.')} `);
    }

    // Blockquote
    if (/^\s*>\s/.test(line)) {
      line = line.replace(/^(\s*)>\s/, chalk.dim('│ '));
      line = chalk.dim(line);
    }

    // Horizontal rule
    if (/^[-*_]{3,}\s*$/.test(line.trim())) {
      line = chalk.dim('─'.repeat(40));
    }

    result.push(line);
  }

  if (inCodeBlock) result.push(chalk.dim('└' + '─'.repeat(40)));

  return result.join('\n');
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

export function renderStatusBar(model: string, contextPercent: number): string {
  const width = process.stdout.columns || 80;

  const pct = Math.min(100, Math.max(0, Math.round(contextPercent)));
  const pctColor = pct > 80 ? chalk.red : pct > 50 ? chalk.yellow : chalk.green;

  const left = ` ${chalk.yellow(model)}`;
  const right = `上下文: ${pctColor(pct + '%')} `;
  const mid = width - stripAnsi(left).length - stripAnsi(right).length - 2;
  const gap = mid > 0 ? ' '.repeat(mid) : ' ';

  return `${chalk.dim('─'.repeat(width))}\n${left}${gap}│${right}`;
}

function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*m/g, '');
}
