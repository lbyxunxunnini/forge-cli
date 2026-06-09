import type { TraceSession, TraceStats } from './trace.js';

// ---- 执行摘要 ----

export interface ExecutionSummary {
  sessionId: string;
  status: 'success' | 'partial' | 'failed';
  duration: string; // 可读格式
  stats: {
    llmCalls: number;
    toolCalls: number;
    toolSuccessRate: string;
    errors: number;
    retries: number;
  };
  toolBreakdown: Array<{
    name: string;
    calls: number;
    successes: number;
    failures: number;
  }>;
  errorSummary: Array<{
    message: string;
    count: number;
    category: string;
  }>;
  phaseProgression: string[];
  recommendations: string[];
}

// ---- 生成摘要 ----

export function generateSummary(session: TraceSession, stats: TraceStats): ExecutionSummary {
  const toolBreakdown = buildToolBreakdown(session);
  const errorSummary = buildErrorSummary(session);
  const phaseProgression = buildPhaseProgression(session);
  const recommendations = generateRecommendations(stats, errorSummary);

  // 判断状态
  let status: ExecutionSummary['status'] = 'success';
  if (stats.errorCount > 0 && stats.toolSuccessRate < 0.5) {
    status = 'failed';
  } else if (stats.errorCount > 0 || stats.toolSuccessRate < 1) {
    status = 'partial';
  }

  return {
    sessionId: session.sessionId,
    status,
    duration: formatDuration(stats.totalDuration),
    stats: {
      llmCalls: stats.llmCallCount,
      toolCalls: stats.toolCallCount,
      toolSuccessRate: (stats.toolSuccessRate * 100).toFixed(1) + '%',
      errors: stats.errorCount,
      retries: stats.retryCount,
    },
    toolBreakdown,
    errorSummary,
    phaseProgression,
    recommendations,
  };
}

// ---- 格式化输出 ----

export function formatSummary(summary: ExecutionSummary): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════');
  lines.push('  Agent 执行摘要');
  lines.push('═══════════════════════════════════════');
  lines.push('');

  // 状态图标
  const statusIcon = summary.status === 'success' ? '✓'
    : summary.status === 'partial' ? '⚠'
    : '✗';
  lines.push(`  ${statusIcon} 状态: ${summary.status}`);
  lines.push(`  ⏱ 耗时: ${summary.duration}`);
  lines.push('');

  // 统计
  lines.push('  ── 统计 ──');
  lines.push(`  LLM 调用:     ${summary.stats.llmCalls}`);
  lines.push(`  工具调用:     ${summary.stats.toolCalls}`);
  lines.push(`  工具成功率:   ${summary.stats.toolSuccessRate}`);
  lines.push(`  错误数:       ${summary.stats.errors}`);
  lines.push(`  重试次数:     ${summary.stats.retries}`);
  lines.push('');

  // 工具明细
  if (summary.toolBreakdown.length > 0) {
    lines.push('  ── 工具明细 ──');
    for (const tool of summary.toolBreakdown) {
      const icon = tool.failures > 0 ? '⚠' : '✓';
      lines.push(`  ${icon} ${tool.name}: ${tool.calls}次 (${tool.successes}成功/${tool.failures}失败)`);
    }
    lines.push('');
  }

  // 错误摘要
  if (summary.errorSummary.length > 0) {
    lines.push('  ── 错误摘要 ──');
    for (const err of summary.errorSummary) {
      lines.push(`  ✗ ${err.message} (${err.count}次, ${err.category})`);
    }
    lines.push('');
  }

  // 阶段进展
  if (summary.phaseProgression.length > 0) {
    lines.push('  ── 阶段进展 ──');
    lines.push(`  ${summary.phaseProgression.join(' → ')}`);
    lines.push('');
  }

  // 建议
  if (summary.recommendations.length > 0) {
    lines.push('  ── 建议 ──');
    for (const rec of summary.recommendations) {
      lines.push(`  → ${rec}`);
    }
    lines.push('');
  }

  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}

// ---- 内部函数 ----

function buildToolBreakdown(session: TraceSession): ExecutionSummary['toolBreakdown'] {
  const toolMap = new Map<string, { calls: number; successes: number; failures: number }>();

  for (const event of session.events) {
    if (event.type === 'tool_call') {
      const name = event.data.toolName as string;
      const existing = toolMap.get(name) || { calls: 0, successes: 0, failures: 0 };
      existing.calls++;
      toolMap.set(name, existing);
    }
    if (event.type === 'tool_result') {
      const name = event.data.toolName as string;
      const existing = toolMap.get(name) || { calls: 0, successes: 0, failures: 0 };
      if (event.data.success) {
        existing.successes++;
      } else {
        existing.failures++;
      }
      toolMap.set(name, existing);
    }
  }

  return Array.from(toolMap.entries()).map(([name, stats]) => ({
    name,
    ...stats,
  }));
}

function buildErrorSummary(session: TraceSession): ExecutionSummary['errorSummary'] {
  const errorMap = new Map<string, { count: number; category: string }>();

  for (const event of session.events) {
    if (event.type === 'error') {
      const msg = (event.data.message as string) || 'Unknown error';
      const existing = errorMap.get(msg) || { count: 0, category: 'unknown' };
      existing.count++;
      // 用 tags 判断分类
      if (event.tags?.includes('retry')) {
        existing.category = 'transient';
      }
      errorMap.set(msg, existing);
    }
  }

  return Array.from(errorMap.entries()).map(([message, stats]) => ({
    message,
    ...stats,
  }));
}

function buildPhaseProgression(session: TraceSession): string[] {
  const phases: string[] = [];

  for (const event of session.events) {
    if (event.type === 'phase_advance') {
      const from = event.data.from as string;
      const to = event.data.to as string;
      if (phases.length === 0) phases.push(from);
      phases.push(to);
    }
  }

  return phases;
}

function generateRecommendations(
  stats: TraceStats,
  errorSummary: ExecutionSummary['errorSummary']
): string[] {
  const recs: string[] = [];

  // 工具成功率低
  if (stats.toolSuccessRate < 0.8 && stats.toolCallCount > 0) {
    recs.push('工具成功率偏低，检查工具参数定义是否清晰，或增加输入校验');
  }

  // 重试过多
  if (stats.retryCount > 3) {
    recs.push('重试次数过多，考虑增加超时时间或检查网络稳定性');
  }

  // LLM 调用过多
  if (stats.llmCallCount > 8) {
    recs.push('LLM 调用次数较多，考虑优化 prompt 减少不必要的循环');
  }

  // 有永久性错误
  const hasPermanentErrors = errorSummary.some(e => e.category === 'permanent');
  if (hasPermanentErrors) {
    recs.push('存在永久性错误（如认证失败），请检查 API Key 或权限配置');
  }

  // 执行时间过长
  if (stats.totalDuration > 120000) {
    recs.push('执行时间超过 2 分钟，考虑拆分任务或减少上下文长度');
  }

  return recs;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}
