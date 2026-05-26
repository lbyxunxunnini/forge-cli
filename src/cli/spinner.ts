import ora, { Ora } from 'ora';

export class Spinner {
  private spinner: Ora;

  constructor(text: string = '处理中...') {
    this.spinner = ora({
      text,
      color: 'cyan',
      spinner: 'dots',
    });
  }

  start(text?: string): void {
    if (text) this.spinner.text = text;
    this.spinner.start();
  }

  stop(): void {
    this.spinner.stop();
  }

  succeed(text?: string): void {
    this.spinner.succeed(text);
  }

  fail(text?: string): void {
    this.spinner.fail(text);
  }

  setText(text: string): void {
    this.spinner.text = text;
  }
}
