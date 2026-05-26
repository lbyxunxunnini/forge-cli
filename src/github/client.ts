import { execSync } from 'child_process';
import type {
  GitHubConfig,
  GitHubPR,
  GitHubIssue,
  GitHubReview,
  GitHubComment,
  GitHubBlame,
  GitHubDiff,
  PRReviewComment,
} from './types.js';

export class GitHubClient {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  // 执行 gh 命令
  private exec(command: string): string {
    try {
      return execSync(`gh ${command}`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
      }).trim();
    } catch (error) {
      throw new Error(`GitHub CLI 执行失败: ${error}`);
    }
  }

  // 获取 PR 列表
  async listPRs(state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubPR[]> {
    const output = this.exec(`pr list --state ${state} --json number,title,body,state,headRefName,baseRefName,url,author,createdAt,updatedAt`);
    const prs = JSON.parse(output);

    return prs.map((pr: Record<string, unknown>) => ({
      number: pr.number as number,
      title: pr.title as string,
      body: (pr.body as string) || '',
      state: this.mapPRState(pr.state as string),
      head: pr.headRefName as string,
      base: pr.baseRefName as string,
      url: pr.url as string,
      author: (pr.author as Record<string, unknown>).login as string,
      createdAt: pr.createdAt as string,
      updatedAt: pr.updatedAt as string,
    }));
  }

  // 获取单个 PR
  async getPR(prNumber: number): Promise<GitHubPR> {
    const output = this.exec(`pr view ${prNumber} --json number,title,body,state,headRefName,baseRefName,url,author,createdAt,updatedAt`);
    const pr = JSON.parse(output);

    return {
      number: pr.number,
      title: pr.title,
      body: pr.body || '',
      state: this.mapPRState(pr.state),
      head: pr.headRefName,
      base: pr.baseRefName,
      url: pr.url,
      author: pr.author.login,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
    };
  }

  // 获取 PR diff
  async getPRDiff(prNumber: number): Promise<GitHubDiff> {
    const output = this.exec(`pr diff ${prNumber} --stat`);
    const lines = output.split('\n').filter(l => l.trim());

    const files: GitHubDiff['files'] = [];
    let totalAdditions = 0;
    let totalDeletions = 0;

    for (const line of lines) {
      const match = line.match(/(\d+)\s+files?\s+changed(?:,\s+(\d+)\s+insertions?)?(?:,\s+(\d+)\s+deletions?)?/);
      if (match) {
        totalAdditions = parseInt(match[2] || '0');
        totalDeletions = parseInt(match[3] || '0');
      }
    }

    // 获取详细文件变更
    const diffOutput = this.exec(`pr diff ${prNumber} --name-status`);
    const diffLines = diffOutput.split('\n').filter(l => l.trim());

    for (const line of diffLines) {
      const [status, path] = line.split('\t');
      if (path) {
        files.push({
          path,
          additions: 0, // 需要从 stat 获取
          deletions: 0,
          changes: 0,
          status: this.mapFileStatus(status),
        });
      }
    }

    return { files, totalAdditions, totalDeletions };
  }

  // 获取 PR 审查
  async getPRReviews(prNumber: number): Promise<GitHubReview[]> {
    const output = this.exec(`pr view ${prNumber} --json reviews`);
    const reviews = JSON.parse(output).reviews || [];

    return reviews.map((review: Record<string, unknown>) => ({
      id: review.databaseId as number,
      body: (review.body as string) || '',
      state: review.state as GitHubReview['state'],
      author: (review.author as Record<string, unknown>).login as string,
      submittedAt: review.submittedAt as string,
    }));
  }

  // 获取 PR 评论
  async getPRComments(prNumber: number): Promise<GitHubComment[]> {
    const output = this.exec(`pr view ${prNumber} --json comments`);
    const comments = JSON.parse(output).comments || [];

    return comments.map((comment: Record<string, unknown>) => ({
      id: comment.databaseId as number,
      body: comment.body as string,
      author: (comment.author as Record<string, unknown>).login as string,
      createdAt: comment.createdAt as string,
      updatedAt: comment.updatedAt as string,
    }));
  }

  // 发布 PR 审查评论
  async addPRReview(prNumber: number, body: string, event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT' = 'COMMENT'): Promise<void> {
    this.exec(`pr review ${prNumber} --${event.toLowerCase()} --body "${body.replace(/"/g, '\\"')}"`);
  }

  // 发布 PR 行内评论
  async addPRReviewComment(prNumber: number, comment: PRReviewComment): Promise<void> {
    const cmd = `pr review ${prNumber} --comment --body "${comment.body.replace(/"/g, '\\"')}"`;
    // 注意：gh CLI 的行内评论需要使用 API
    this.exec(cmd);
  }

  // 获取 Issue 列表
  async listIssues(state: 'open' | 'closed' | 'all' = 'open'): Promise<GitHubIssue[]> {
    const output = this.exec(`issue list --state ${state} --json number,title,body,state,labels,assignees,url,author,createdAt`);
    const issues = JSON.parse(output);

    return issues.map((issue: Record<string, unknown>) => ({
      number: issue.number as number,
      title: issue.title as string,
      body: (issue.body as string) || '',
      state: (issue.state as string).toLowerCase() as 'open' | 'closed',
      labels: ((issue.labels as Array<{ name: string }>) || []).map(l => l.name),
      assignees: ((issue.assignees as Array<{ login: string }>) || []).map(a => a.login),
      url: issue.url as string,
      author: (issue.author as Record<string, unknown>).login as string,
      createdAt: issue.createdAt as string,
    }));
  }

  // 获取单个 Issue
  async getIssue(issueNumber: number): Promise<GitHubIssue> {
    const output = this.exec(`issue view ${issueNumber} --json number,title,body,state,labels,assignees,url,author,createdAt`);
    const issue = JSON.parse(output);

    return {
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      state: issue.state.toLowerCase(),
      labels: (issue.labels || []).map((l: { name: string }) => l.name),
      assignees: (issue.assignees || []).map((a: { login: string }) => a.login),
      url: issue.url,
      author: issue.author.login,
      createdAt: issue.createdAt,
    };
  }

  // 创建 Issue
  async createIssue(title: string, body: string, labels?: string[]): Promise<GitHubIssue> {
    let cmd = `issue create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}"`;
    if (labels && labels.length > 0) {
      cmd += ` --label ${labels.join(',')}`;
    }
    const output = this.exec(cmd);
    const url = output.trim();

    // 获取创建的 Issue
    const match = url.match(/\/(\d+)$/);
    if (match) {
      return this.getIssue(parseInt(match[1]));
    }

    throw new Error('无法获取创建的 Issue');
  }

  // 获取 git blame
  async getBlame(filePath: string, startLine?: number, endLine?: number): Promise<GitHubBlame[]> {
    let cmd = `api repos/${this.config.owner}/${this.config.repo}/contents/${filePath}`;
    // 使用 git blame 命令
    const blameCmd = `git blame ${filePath} -L ${startLine || 1},${endLine || startLine || 1} --porcelain`;
    const output = execSync(blameCmd, { encoding: 'utf-8' });

    const blames: GitHubBlame[] = [];
    const lines = output.split('\n');

    let currentCommit = '';
    let currentAuthor = '';
    let currentDate = '';
    let currentLine = 0;

    for (const line of lines) {
      if (line.startsWith('commit ')) {
        currentCommit = line.substring(7);
      } else if (line.startsWith('author ')) {
        currentAuthor = line.substring(7);
      } else if (line.startsWith('author-time ')) {
        currentDate = new Date(parseInt(line.substring(12)) * 1000).toISOString();
      } else if (line.match(/^\t/)) {
        blames.push({
          commit: currentCommit,
          author: currentAuthor,
          date: currentDate,
          line: ++currentLine,
          content: line.substring(1),
        });
      }
    }

    return blames;
  }

  // 获取仓库信息
  async getRepoInfo(): Promise<Record<string, unknown>> {
    const output = this.exec(`repo view --json name,description,defaultBranchRef,url`);
    return JSON.parse(output);
  }

  // 检查 gh 是否可用
  static isAvailable(): boolean {
    try {
      execSync('gh --version', { encoding: 'utf-8' });
      return true;
    } catch {
      return false;
    }
  }

  // 映射 PR 状态
  private mapPRState(state: string): GitHubPR['state'] {
    switch (state.toLowerCase()) {
      case 'open':
        return 'open';
      case 'closed':
        return 'closed';
      case 'merged':
        return 'merged';
      default:
        return 'closed';
    }
  }

  // 映射文件状态
  private mapFileStatus(status: string): GitHubDiff['files'][0]['status'] {
    switch (status.toUpperCase()) {
      case 'A':
        return 'added';
      case 'D':
        return 'removed';
      case 'M':
        return 'modified';
      case 'R':
        return 'renamed';
      default:
        return 'modified';
    }
  }
}

export const createGitHubClient = (config: GitHubConfig) => new GitHubClient(config);
