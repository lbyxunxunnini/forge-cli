/**
 * 任务分组渲染器
 * 参考 Claude Code 的任务分组显示风格
 */

import chalk from 'chalk';

// 工具调用记录
export interface ToolCallRecord {
  name: string;
  args?: Record<string, any>;
  startTime: number;
  endTime?: number;
  success?: boolean;
}

// 任务分组
export interface TaskGroup {
  id: string;
  title: string;
  toolCalls: ToolCallRecord[];
  startTime: number;
  endTime?: number;
}

/**
 * 任务分组渲染器
 */
export class TaskGroupRenderer {
  private currentGroup: TaskGroup | null = null;
  private groups: TaskGroup[] = [];

  /**
   * 开始新的任务分组
   */
  startGroup(title: string): string {
    // 结束之前的分组
    if (this.currentGroup) {
      this.endGroup();
    }

    const group: TaskGroup = {
      id: `group-${Date.now()}`,
      title,
      toolCalls: [],
      startTime: Date.now(),
    };

    this.currentGroup = group;
    this.groups.push(group);

    return this.renderGroupStart(title);
  }

  /**
   * 添加工具调用到当前分组
   */
  addToolCall(name: string, args?: Record<string, any>): void {
    if (!this.currentGroup) return;

    this.currentGroup.toolCalls.push({
      name,
      args,
      startTime: Date.now(),
    });
  }

  /**
   * 完成当前工具调用
   */
  completeToolCall(success: boolean = true): void {
    if (!this.currentGroup || this.currentGroup.toolCalls.length === 0) return;

    const lastCall = this.currentGroup.toolCalls[this.currentGroup.toolCalls.length - 1];
    lastCall.endTime = Date.now();
    lastCall.success = success;
  }

  /**
   * 结束当前任务分组
   */
  endGroup(): string | null {
    if (!this.currentGroup) return null;

    this.currentGroup.endTime = Date.now();
    const result = this.renderGroupEnd(this.currentGroup);
    this.currentGroup = null;

    return result;
  }

  /**
   * 渲染分组开始
   */
  private renderGroupStart(title: string): string {
    const width = process.stdout.columns || 80;
    const titleStr = ` ${title} `;
    const lineWidth = Math.max(0, width - titleStr.length - 6);
    const line = '─'.repeat(Math.floor(lineWidth / 2));

    return `\n${chalk.cyan('┌─' + line + chalk.bold(titleStr) + line + '─┐')}`;
  }

  /**
   * 渲染分组结束
   */
  private renderGroupEnd(group: TaskGroup): string {
    const duration = group.endTime! - group.startTime;
    const toolCount = group.toolCalls.length;
    const successCount = group.toolCalls.filter(t => t.success).length;
    const failCount = toolCount - successCount;

    // 格式化时长
    const durationStr = duration < 1000 ? `${duration}ms`
      : duration < 60000 ? `${(duration / 1000).toFixed(1)}s`
      : `${Math.floor(duration / 60000)}m ${Math.floor((duration % 60000) / 1000)}s`;

    // 状态图标
    const statusIcon = failCount === 0 ? chalk.green('✓') : chalk.yellow('⚠');
    const statusText = failCount === 0
      ? chalk.green(`${toolCount} tool uses`)
      : chalk.yellow(`${successCount}/${toolCount} succeeded`);

    const summary = `${statusIcon} ${statusText} · ${chalk.dim(durationStr)}`;
    const width = process.stdout.columns || 80;
    const lineWidth = Math.max(0, width - summary.length - 4);
    const line = '─'.repeat(lineWidth);

    return `${chalk.cyan('└' + line + '┘')}\n  ${summary}`;
  }

  /**
   * 渲染工具调用行
   */
  renderToolCall(name: string, args?: Record<string, any>): string {
    const argsPreview = args
      ? Object.entries(args)
          .map(([k, v]) => `${k}=${chalk.dim(this.truncate(String(v), 30))}`)
          .join(', ')
      : '';

    return `${chalk.cyan('│')}  ${chalk.yellow('⏺')} ${chalk.white(name)}${argsPreview ? chalk.dim(` → ${argsPreview}`) : ''}`;
  }

  /**
   * 渲染完成统计
   */
  renderSummary(totalToolCalls: number, totalTokens: number, totalDuration: number): string {
    const durationStr = totalDuration < 1000 ? `${totalDuration}ms`
      : totalDuration < 60000 ? `${(totalDuration / 1000).toFixed(1)}s`
      : `${Math.floor(totalDuration / 60000)}m ${Math.floor((totalDuration % 60000) / 1000)}s`;

    const tokensStr = totalTokens >= 1000000
      ? `${(totalTokens / 1000000).toFixed(1)}M`
      : totalTokens >= 1000
        ? `${(totalTokens / 1000).toFixed(1)}K`
        : `${totalTokens}`;

    return chalk.dim(`Done (${totalToolCalls} tool uses · ${tokensStr} tokens · ${durationStr})`);
  }

  /**
   * 截断文本
   */
  private truncate(str: string, maxLen: number): string {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 3) + '...';
  }

  /**
   * 获取当前分组
   */
  getCurrentGroup(): TaskGroup | null {
    return this.currentGroup;
  }

  /**
   * 获取所有分组
   */
  getAllGroups(): TaskGroup[] {
    return [...this.groups];
  }

  /**
   * 清空分组历史
   */
  clear(): void {
    this.groups = [];
    this.currentGroup = null;
  }
}

/**
 * 全局任务分组渲染器实例
 */
export const taskGroupRenderer = new TaskGroupRenderer();

export default TaskGroupRenderer;
