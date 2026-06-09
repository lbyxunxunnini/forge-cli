import type { Tracer } from './trace.js';

// ---- 错误分类 ----

export type ErrorCategory =
  | 'transient'    // 临时性错误，可重试（网络超时、限流）
  | 'permanent'    // 永久性错误，不重试（参数错误、权限不足）
  | 'unknown';     // 未分类，默认重试

export interface ErrorClassifier {
  classify(error: Error): ErrorCategory;
}

// 默认错误分类器
export const defaultClassifier: ErrorClassifier = {
  classify(error: Error): ErrorCategory {
    const msg = error.message.toLowerCase();

    // 临时性错误
    if (
      msg.includes('timeout') ||
      msg.includes('rate limit') ||
      msg.includes('429') ||
      msg.includes('503') ||
      msg.includes('502') ||
      msg.includes('econnreset') ||
      msg.includes('econnrefused') ||
      msg.includes('network') ||
      msg.includes('socket hang up')
    ) {
      return 'transient';
    }

    // 永久性错误
    if (
      msg.includes('401') ||
      msg.includes('403') ||
      msg.includes('invalid api key') ||
      msg.includes('authentication') ||
      msg.includes('permission denied') ||
      msg.includes('not found') ||
      msg.includes('invalid parameter') ||
      msg.includes('bad request')
    ) {
      return 'permanent';
    }

    return 'unknown';
  },
};

// ---- 重试配置 ----

export interface RetryConfig {
  maxAttempts: number;       // 最大尝试次数（含首次）
  baseDelay: number;         // 基础延迟 ms
  maxDelay: number;          // 最大延迟 ms
  backoffMultiplier: number; // 退避倍数
  jitter: boolean;           // 是否加随机抖动
  classifier: ErrorClassifier;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  classifier: defaultClassifier,
};

// ---- 重试结果 ----

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
  errors: Array<{ attempt: number; category: ErrorCategory; message: string }>;
}

// ---- 重试执行器 ----

export class RetryExecutor {
  private config: RetryConfig;
  private tracer?: Tracer;

  constructor(config?: Partial<RetryConfig>, tracer?: Tracer) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    if (config?.classifier) {
      this.config.classifier = config.classifier;
    }
    this.tracer = tracer;
  }

  async execute<T>(
    fn: () => Promise<T>,
    context?: string
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const errors: RetryResult<T>['errors'] = [];
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await fn();
        return {
          success: true,
          result,
          attempts: attempt,
          totalDuration: Date.now() - startTime,
          errors,
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const category = this.config.classifier.classify(lastError);

        errors.push({
          attempt,
          category,
          message: lastError.message,
        });

        // 记录到 tracer
        if (this.tracer) {
          this.tracer.traceError(lastError, `retry attempt ${attempt}/${this.config.maxAttempts}`);
        }

        // 永久性错误不重试
        if (category === 'permanent') {
          if (this.tracer) {
            this.tracer.traceWarning(`Permanent error, not retrying: ${lastError.message}`);
          }
          break;
        }

        // 最后一次尝试失败，不等待
        if (attempt >= this.config.maxAttempts) {
          break;
        }

        // 计算延迟
        const delay = this.calculateDelay(attempt);

        if (this.tracer) {
          this.tracer.traceRetry(attempt, this.config.maxAttempts, lastError.message, delay);
        }

        await this.sleep(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts: errors.length,
      totalDuration: Date.now() - startTime,
      errors,
    };
  }

  // 计算延迟（指数退避 + 可选抖动）
  private calculateDelay(attempt: number): number {
    let delay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, this.config.maxDelay);

    if (this.config.jitter) {
      // 加 ±25% 随机抖动
      const jitterRange = delay * 0.25;
      delay += (Math.random() - 0.5) * 2 * jitterRange;
    }

    return Math.max(0, Math.round(delay));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ---- 工具调用专用重试 ----

export interface ToolRetryConfig {
  maxAttempts: number;
  baseDelay: number;
  retryableErrors: string[]; // 可重试的错误消息模式
}

const DEFAULT_TOOL_RETRY: ToolRetryConfig = {
  maxAttempts: 2,
  baseDelay: 500,
  retryableErrors: [
    'timeout',
    'ECONNRESET',
    'rate limit',
    '429',
  ],
};

export class ToolRetryExecutor {
  private config: ToolRetryConfig;
  private tracer?: Tracer;

  constructor(config?: Partial<ToolRetryConfig>, tracer?: Tracer) {
    this.config = { ...DEFAULT_TOOL_RETRY, ...config };
    this.tracer = tracer;
  }

  async execute<T>(
    toolName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // 检查是否可重试
        const retryable = this.config.retryableErrors.some(pattern =>
          lastError!.message.toLowerCase().includes(pattern.toLowerCase())
        );

        if (!retryable || attempt >= this.config.maxAttempts) {
          throw lastError;
        }

        const delay = this.config.baseDelay * attempt;

        if (this.tracer) {
          this.tracer.traceRetry(attempt, this.config.maxAttempts, lastError.message, delay);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}
