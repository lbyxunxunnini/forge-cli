import chalk from 'chalk';

// ASCII Art "FORGE" 完整字母（每行固定 42 字符，紧凑风格）
const FORGE_ART = [
  '███████╗ ██████╗ ██████╗  ██████╗ ███████╗',
  '██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝',
  '█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  ',
  '██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ',
  '██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗',
  '╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝',
];

export function renderBanner(version: string, model: string, projectRoot: string): string {
  const width = process.stdout.columns || 80;
  const borderWidth = Math.min(width - 2, 86);

  // 固定各区域宽度
  const logoWidth = 48;  // Logo 区域固定宽度
  const dividerWidth = 3;  // 分隔线宽度 " │ "
  const rightWidth = 22;  // 右侧命令区域固定宽度

  // 右侧命令区域
  const rightCommands = [
    '/help   显示帮助',
    '/model  模型管理',
    '/clear  清空上下文',
    '/status 显示状态',
    '/exit   退出程序',
  ];

  const lines: string[] = [];

  // 顶部边框（带版本号）
  const title = ` Forge CLI v${version} `;
  const lineWidth = Math.max(0, borderWidth - title.length);
  const leftLine = '─'.repeat(Math.floor(lineWidth / 2));
  const rightLine = '─'.repeat(Math.ceil(lineWidth / 2));
  lines.push(chalk.cyan('╭' + leftLine + title + rightLine + '╮'));

  // Logo 行 + 命令
  for (let i = 0; i < FORGE_ART.length; i++) {
    const logoText = FORGE_ART[i];
    const rightContent = i < rightCommands.length ? rightCommands[i] : '';

    // 左侧部分：边框 + Logo（固定宽度 48）
    const logoPadding = Math.max(0, logoWidth - logoText.length);
    const leftPart = chalk.cyan('│') + chalk.cyan.bold(logoText) + ' '.repeat(logoPadding);

    // 右侧部分：分隔线 + 命令（固定宽度 22 + 两边空格）
    const rightPadding = Math.max(0, rightWidth - rightContent.length);
    const rightPart = chalk.cyan('│') + ' ' + chalk.white(rightContent) + ' '.repeat(rightPadding) + chalk.cyan(' │');

    lines.push(leftPart + rightPart);
  }

  // 分隔线
  lines.push(chalk.cyan('├' + '─'.repeat(borderWidth) + '┤'));

  // 模型和项目信息行
  const infoLine = `  模型: ${model}    项目: ${truncate(projectRoot, 30)}`;
  const infoPadding = Math.max(0, borderWidth - infoLine.length);
  lines.push(chalk.cyan('│') + chalk.yellow(infoLine) + ' '.repeat(infoPadding) + chalk.cyan('│'));

  // 快捷键行
  const shortcutsLine = '  Ctrl+C:中断 │ Ctrl+D:退出 │ /help:帮助 │ 直接输入内容开始对话';
  const shortcutsPadding = Math.max(0, borderWidth - shortcutsLine.length);
  lines.push(chalk.cyan('│') + chalk.dim(shortcutsLine) + ' '.repeat(shortcutsPadding) + chalk.cyan('│'));

  // 底部边框
  lines.push(chalk.cyan('╰' + '─'.repeat(borderWidth) + '╯'));

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
    ['/theme', '切换主题'],
    ['/git', 'Git 操作：status/log/branch/add/commit/diff/remote'],
    ['/diff', '查看 Diff：/diff <old> <new> 或 /diff --staged'],
    ['/lint', 'Lint 检查：/lint 或 /lint <file>'],
    ['/test', '运行测试：/test 或 /test <args>'],
    ['/ast', '查看文件结构：/ast <file> 或 /ast --init'],
    ['/symbol', '搜索符号：/symbol <query> 或 /sym <query>'],
    ['/fetch', '获取网页：/fetch <url> 或 /web <url>'],
    ['/search', '网络搜索：/search <query> 或 /s <query>'],
    ['/state', '状态机管理：/state status/history/graph/snapshot/restore/reset'],
    ['/out-task', '导出当前会话记忆到 .forge/memory/'],
    ['/import-task', '导入之前导出的会话记忆'],
    ['/perm', '权限管理：查看/清除已记住的权限'],
    ['/cache', '查看缓存命中率统计'],
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

export function renderStatus(contextSummary: string, model: string, phase?: string, cacheHitRate?: number): string {
  const lines = [
    chalk.bold('\n当前状态:'),
    `  ${chalk.dim('模型:')} ${chalk.yellow(model)}`,
    `  ${chalk.dim('上下文:')} ${contextSummary}`,
  ];
  if (cacheHitRate !== undefined && cacheHitRate > 0) {
    const rateColor = cacheHitRate >= 90 ? chalk.green : cacheHitRate >= 70 ? chalk.yellow : chalk.red;
    lines.push(`  ${chalk.dim('缓存命中率:')} ${rateColor(cacheHitRate.toFixed(1) + '%')}`);
  }
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
  let inTable = false;
  let tableRows: string[][] = [];

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

    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // 检查是否是分隔行（如 |---|---|）
      if (/^\|[\s-:|]+\|$/.test(line.trim())) {
        continue; // 跳过分隔行
      }

      // 解析表格行
      const cells = line.trim()
        .slice(1, -1) // 移除首尾 |
        .split('|')
        .map(cell => cell.trim());

      if (!inTable) {
        inTable = true;
        tableRows = [];
      }

      tableRows.push(cells);

      // 检查下一行是否还是表格
      const nextLine = lines[i + 1];
      if (!nextLine || !nextLine.trim().startsWith('|')) {
        // 渲染表格
        result.push(renderTable(tableRows));
        inTable = false;
        tableRows = [];
      }
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

/**
 * 渲染表格
 */
function renderTable(rows: string[][]): string {
  if (rows.length === 0) return '';

  // 先对单元格内容进行 Markdown 渲染
  const renderedRows = rows.map(row =>
    row.map(cell => renderInlineMarkdown(cell))
  );

  // 计算每列的最大宽度（使用字符串宽度，考虑 Emoji 和中文）
  const numCols = Math.max(...renderedRows.map(r => r.length));
  const colWidths: number[] = new Array(numCols).fill(0);

  for (const row of renderedRows) {
    for (let i = 0; i < row.length; i++) {
      colWidths[i] = Math.max(colWidths[i], getStringWidth(row[i]));
    }
  }

  const result: string[] = [];
  const isHeader = renderedRows.length > 1; // 第一行是表头

  for (let rowIndex = 0; rowIndex < renderedRows.length; rowIndex++) {
    const row = renderedRows[rowIndex];
    const cells = row.map((cell, colIndex) => {
      const cellWidth = getStringWidth(cell);
      const padding = Math.max(0, colWidths[colIndex] - cellWidth);
      return ` ${cell}${' '.repeat(padding)} `;
    });

    const line = chalk.dim('│') + cells.join(chalk.dim('│')) + chalk.dim('│');
    result.push(line);

    // 表头后添加分隔线
    if (rowIndex === 0 && isHeader) {
      const separator = colWidths.map(w => '─'.repeat(w + 2)).join(chalk.dim('┼'));
      result.push(chalk.dim('├') + separator + chalk.dim('┤'));
    }
  }

  // 添加顶部和底部边框
  const topBorder = colWidths.map(w => '─'.repeat(w + 2)).join(chalk.dim('┬'));
  const bottomBorder = colWidths.map(w => '─'.repeat(w + 2)).join(chalk.dim('┴'));

  result.unshift(chalk.dim('┌') + topBorder + chalk.dim('┐'));
  result.push(chalk.dim('└') + bottomBorder + chalk.dim('┘'));

  return result.join('\n');
}

/**
 * 渲染行内 Markdown（粗体、斜体、行内代码）
 */
function renderInlineMarkdown(text: string): string {
  // Bold: **text**
  text = text.replace(/\*\*(.+?)\*\*/g, (_, t) => chalk.bold(t));
  // Italic: *text*
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, (_, t) => chalk.italic(t));
  // Inline code: `text`
  text = text.replace(/`([^`]+)`/g, (_, t) => chalk.bgGray.white(` ${t} `));
  return text;
}

/**
 * 获取字符串的显示宽度（考虑 Emoji 和中文字符）
 */
function getStringWidth(str: string): number {
  // 移除 ANSI 转义序列
  const cleanStr = stripAnsi(str);
  let width = 0;

  for (const char of cleanStr) {
    const code = char.codePointAt(0)!;

    // Emoji 字符（通常占 2 个字符宽度）
    if (code >= 0x1F000 && code <= 0x1FFFF) {
      width += 2;
    }
    // 中文字符（占 2 个字符宽度）
    else if (code >= 0x4E00 && code <= 0x9FFF) {
      width += 2;
    }
    // 全角字符
    else if (code >= 0xFF00 && code <= 0xFFEF) {
      width += 2;
    }
    // 其他字符
    else {
      width += 1;
    }
  }

  return width;
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

/**
 * 渲染固定顶部标题栏（单行简洁版）
 * 使用 ANSI 转义序列固定在终端顶部
 */
export function renderFixedHeader(version: string): string {
  const width = process.stdout.columns || 80
  const title = `Forge CLI v${version}`
  const padding = Math.max(0, width - title.length - 4)
  return chalk.cyan(`  ${title}${' '.repeat(padding)}`)
}
