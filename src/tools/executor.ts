import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

const execAsync = promisify(exec);

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function executeScript(
  scriptPath: string,
  args: string[] = [],
  cwd?: string
): Promise<ExecResult> {
  const resolvedPath = resolve(scriptPath);
  const command = `${resolvedPath} ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: cwd || process.cwd(),
      timeout: 30000, // 30 秒超时
      encoding: 'utf-8',
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
    };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: execError.stdout?.trim() || '',
      stderr: execError.stderr?.trim() || '',
      exitCode: execError.code || 1,
    };
  }
}

export async function executePython(
  scriptPath: string,
  args: string[] = [],
  cwd?: string
): Promise<ExecResult> {
  return executeScript(`python3 ${scriptPath}`, args, cwd);
}

export async function executeShell(
  scriptPath: string,
  args: string[] = [],
  cwd?: string
): Promise<ExecResult> {
  return executeScript(`bash ${scriptPath}`, args, cwd);
}
