import { SimpleGit, simpleGit } from 'simple-git';
import { GitCommit } from '../types';

export class GitService {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string = process.env.GIT_REPO_PATH || '/home/harshit/Harshit/projects/ssu-api-two') {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async getCommits(since: Date, until: Date): Promise<GitCommit[]> {
    const logs = await this.git.log([
      `--since=${since.toISOString()}`,
      `--until=${until.toISOString()}`,
      '--all', // Get commits from all branches
    ]);

    const commits: GitCommit[] = [];

    for (const commit of logs.all) {
      const branch = await this.getBranchForCommit(commit.hash);

      commits.push({
        hash: commit.hash,
        date: new Date(commit.date),
        message: commit.message,
        author_name: commit.author_name,
        author_email: commit.author_email,
        files: [],
        branch: branch,
      });
    }

    return commits;
  }

  private async getBranchForCommit(commitHash: string): Promise<string> {
    try {
      const branches = await this.git.raw(['branch', '--contains', commitHash, '--all']);

      const branchLines = branches
        .split('\n')
        .map((line) => line.trim().replace(/^\*\s*/, ''))
        .filter((line) => line && !line.includes('HEAD'))
        .map((line) => {
          if (line.startsWith('remotes/origin/')) {
            return line.replace('remotes/origin/', '');
          }
          return line;
        })
        .filter((branch) => branch !== 'HEAD' && !branch.includes('->'));

      const mainBranches = branchLines.filter((b) => b === 'main' || b === 'master');

      return mainBranches.length > 0 ? mainBranches[0] : branchLines[0] || 'unknown';
    } catch (error) {
      console.warn(`Failed to get branch for commit ${commitHash}:`, error);
      return 'unknown';
    }
  }

  async getGitHubRepoInfo(): Promise<{ owner: string; repo: string } | null> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find((remote) => remote.name === 'origin');

      if (!origin?.refs?.fetch) {
        return null;
      }

      // Parse GitHub URL - supports both SSH and HTTPS
      const url = origin.refs.fetch;
      let match;

      // Try SSH format: git@github.com:owner/repo.git
      match = url.match(/git@github\.com:([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }

      // Try HTTPS format: https://github.com/owner/repo.git
      match = url.match(/https:\/\/github\.com\/([^/]+)\/(.+?)(?:\.git)?$/);
      if (match) {
        return { owner: match[1], repo: match[2] };
      }

      return null;
    } catch (error) {
      console.warn('Failed to get GitHub repo info:', error);
      return null;
    }
  }
}
