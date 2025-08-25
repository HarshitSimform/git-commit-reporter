import { GitService } from '../../src/services/git';
import { GitCommit } from '../../src/types';

describe('GitService', () => {
  let gitService: GitService;

  beforeEach(() => {
    gitService = new GitService();
  });

  it('should fetch commits from the repository', async () => {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const endDate = new Date();

    const commits: GitCommit[] = await gitService.getCommits(startDate, endDate);
    expect(commits).toBeDefined();
    expect(Array.isArray(commits)).toBe(true);
  });

  it('should return commits with correct structure', async () => {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const commits: GitCommit[] = await gitService.getCommits(startDate, endDate);

    if (commits.length > 0) {
      const commit = commits[0];
      expect(commit).toHaveProperty('hash');
      expect(commit).toHaveProperty('date');
      expect(commit).toHaveProperty('message');
      expect(commit).toHaveProperty('author_name');
      expect(commit).toHaveProperty('author_email');
      expect(commit).toHaveProperty('files');
    }
  });
});
