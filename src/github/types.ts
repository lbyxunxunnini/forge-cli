export interface GitHubConfig {
  owner: string;
  repo: string;
}

export interface GitHubPR {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  head: string;
  base: string;
  url: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  url: string;
  author: string;
  createdAt: string;
}

export interface GitHubReview {
  id: number;
  body: string;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  author: string;
  submittedAt: string;
}

export interface GitHubComment {
  id: number;
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface GitHubBlame {
  commit: string;
  author: string;
  date: string;
  line: number;
  content: string;
}

export interface GitHubDiff {
  files: Array<{
    path: string;
    additions: number;
    deletions: number;
    changes: number;
    status: 'added' | 'removed' | 'modified' | 'renamed';
  }>;
  totalAdditions: number;
  totalDeletions: number;
}

export interface PRReviewComment {
  path: string;
  line: number;
  body: string;
  side?: 'LEFT' | 'RIGHT';
}
