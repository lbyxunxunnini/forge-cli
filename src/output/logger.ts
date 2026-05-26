import chalk from 'chalk';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class ForgeLogger {
  private prefix = '[f-forge]';

  // 进入日志
  enterController(): void {
    console.log(chalk.blue(`${this.prefix} 进入 controller`));
  }

  // 模式日志
  logMode(mode: string): void {
    console.log(chalk.blue(`${this.prefix} 模式：${mode}`));
  }

  // 阶段日志
  logPhase(phase: string): void {
    console.log(chalk.blue(`${this.prefix} 阶段：${phase}`));
  }

  // 角色切换日志
  logRoleSwitch(from: string, to: string): void {
    console.log(chalk.blue(`${this.prefix} 角色切换：${from} → ${to}`));
  }

  // 角色结果日志
  logAgentResult(agent: string, result: string): void {
    console.log(chalk.blue(`${this.prefix} ${agent}：${result}`));
  }

  // 完成日志
  logComplete(content: string): void {
    console.log(chalk.green(`${this.prefix} 本轮完成：${content}`));
  }

  // 升级日志
  logUpgrade(fromMode: string, toMode: string, reason: string): void {
    console.log(chalk.yellow(`${this.prefix} 升级：${fromMode} → ${toMode}，原因：${reason}`));
  }

  // 跳过 S3 日志
  logSkipS3(): void {
    console.log(chalk.blue(`${this.prefix} 主控：首批范围足够小，跳过 S3 拆分任务冻结，直接进入 S4 实现。`));
  }

  // 等待日志
  logWaiting(reason: string): void {
    console.log(chalk.yellow(`${this.prefix} 等待：${reason}`));
  }

  // 错误日志
  logError(error: string): void {
    console.error(chalk.red(`${this.prefix} 错误：${error}`));
  }

  // 警告日志
  logWarning(warning: string): void {
    console.warn(chalk.yellow(`${this.prefix} 警告：${warning}`));
  }

  // 信息日志
  logInfo(message: string): void {
    console.log(chalk.dim(`${this.prefix} ${message}`));
  }

  // 验证日志
  logVerification(result: string): void {
    console.log(chalk.blue(`${this.prefix} 验证：${result}`));
  }

  // 门禁日志
  logGate(gateId: string, passed: boolean, reason?: string): void {
    if (passed) {
      console.log(chalk.green(`${this.prefix} 门禁 ${gateId}：通过`));
    } else {
      console.log(chalk.red(`${this.prefix} 门禁 ${gateId}：阻断 - ${reason}`));
    }
  }

  // 格式化输出（带前缀）
  formatOutput(output: string): string {
    // 检查是否已有前缀
    if (output.includes(this.prefix)) {
      return output;
    }
    return `${this.prefix} ${output}`;
  }

  // 检查输出是否符合规范
  validateOutput(output: string): boolean {
    // 检查是否包含必要的日志
    const requiredLogs = [
      this.prefix,
    ];

    return requiredLogs.every(log => output.includes(log));
  }
}

export const forgeLogger = new ForgeLogger();
