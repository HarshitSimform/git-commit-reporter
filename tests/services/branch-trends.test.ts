import { BranchTrendsService } from '../../src/services/branch-trends';
import { BranchTrendData, GitCommit } from '../../src/types';

describe('BranchTrendsService', () => {
  let branchTrendsService: BranchTrendsService;

  beforeEach(() => {
    branchTrendsService = new BranchTrendsService();
  });

  describe('getBranchCommitTrends', () => {
    it('should group commits by branch and date correctly', () => {
      const commits: GitCommit[] = [
        {
          hash: 'abc123',
          date: new Date('2025-01-01T10:00:00Z'),
          message: 'feat: add feature A',
          author_name: 'John Doe',
          author_email: 'john@example.com',
          files: ['file1.ts'],
          branch: 'feature/A',
        },
        {
          hash: 'def456',
          date: new Date('2025-01-01T11:00:00Z'),
          message: 'feat: add feature B',
          author_name: 'Jane Doe',
          author_email: 'jane@example.com',
          files: ['file2.ts'],
          branch: 'feature/A',
        },
        {
          hash: 'ghi789',
          date: new Date('2025-01-02T10:00:00Z'),
          message: 'fix: bug fix',
          author_name: 'John Doe',
          author_email: 'john@example.com',
          files: ['file1.ts'],
          branch: 'main',
        },
      ];

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-02');

      const result = branchTrendsService.getBranchCommitTrends(commits, startDate, endDate, false);

      expect(result['feature/A']).toBeDefined();
      expect(result['feature/A']['2025-01-01']).toEqual({
        commits: 2,
        contributors: 2,
      });
      expect(result['main']).toBeDefined();
      expect(result['main']['2025-01-02']).toEqual({
        commits: 1,
        contributors: 1,
      });
    });

    it('should handle unknown branch correctly', () => {
      const commits: GitCommit[] = [
        {
          hash: 'abc123',
          date: new Date('2025-01-01T10:00:00Z'),
          message: 'feat: add feature',
          author_name: 'John Doe',
          author_email: 'john@example.com',
          files: ['file1.ts'],
          // branch is undefined
        },
      ];

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-01');

      const result = branchTrendsService.getBranchCommitTrends(commits, startDate, endDate, false);

      expect(result['unknown']).toBeDefined();
      expect(result['unknown']['2025-01-01']).toEqual({
        commits: 1,
        contributors: 1,
      });
    });

    it('should count unique contributors correctly', () => {
      const commits: GitCommit[] = [
        {
          hash: 'abc123',
          date: new Date('2025-01-01T10:00:00Z'),
          message: 'commit 1',
          author_name: 'John Doe',
          author_email: 'john@example.com',
          files: ['file1.ts'],
          branch: 'main',
        },
        {
          hash: 'def456',
          date: new Date('2025-01-01T11:00:00Z'),
          message: 'commit 2',
          author_name: 'John Doe', // Same author
          author_email: 'john@example.com',
          files: ['file2.ts'],
          branch: 'main',
        },
        {
          hash: 'ghi789',
          date: new Date('2025-01-01T12:00:00Z'),
          message: 'commit 3',
          author_name: 'Jane Doe', // Different author
          author_email: 'jane@example.com',
          files: ['file3.ts'],
          branch: 'main',
        },
      ];

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-01');

      const result = branchTrendsService.getBranchCommitTrends(commits, startDate, endDate, false);

      expect(result['main']['2025-01-01']).toEqual({
        commits: 3,
        contributors: 2, // John and Jane
      });
    });
  });

  describe('formatDataForChart', () => {
    it('should prepare chart data correctly for daily trends', () => {
      const trendData: BranchTrendData = {
        main: {
          '2025-01-01': { commits: 5, contributors: 2 },
          '2025-01-02': { commits: 3, contributors: 1 },
        },
        'feature/auth': {
          '2025-01-01': { commits: 2, contributors: 1 },
          '2025-01-02': { commits: 1, contributors: 1 },
        },
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-02');

      const result = branchTrendsService.formatDataForChart(trendData, startDate, endDate, false);

      expect(result.labels).toHaveLength(2);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0].label).toBe('main');
      expect(result.datasets[0].data).toEqual([5, 3]);
      expect(result.datasets[1].label).toBe('feature/auth');
      expect(result.datasets[1].data).toEqual([2, 1]);
    });

    it('should handle missing dates with zero commits', () => {
      const trendData: BranchTrendData = {
        main: {
          '2025-01-01': { commits: 5, contributors: 2 },
          // Missing 2025-01-02
          '2025-01-03': { commits: 2, contributors: 1 },
        },
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-03');

      const result = branchTrendsService.formatDataForChart(trendData, startDate, endDate, false);

      expect(result.datasets[0].data).toEqual([5, 0, 2]);
    });

    it('should apply different colors to different branches', () => {
      const trendData: BranchTrendData = {
        branch1: { '2025-01-01': { commits: 1, contributors: 1 } },
        branch2: { '2025-01-01': { commits: 2, contributors: 1 } },
        branch3: { '2025-01-01': { commits: 3, contributors: 1 } },
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-01');

      const result = branchTrendsService.formatDataForChart(trendData, startDate, endDate, false);

      expect(result.datasets[0].borderColor).not.toBe(result.datasets[1].borderColor);
      expect(result.datasets[1].borderColor).not.toBe(result.datasets[2].borderColor);
      expect(result.datasets[0].borderColor).not.toBe(result.datasets[2].borderColor);
    });
  });

  describe('getBranchTrendSummary', () => {
    it('should calculate summary statistics correctly', () => {
      const trendData: BranchTrendData = {
        main: {
          '2025-01-01': { commits: 5, contributors: 2 },
          '2025-01-02': { commits: 3, contributors: 1 },
        },
        'feature/auth': {
          '2025-01-01': { commits: 2, contributors: 1 },
        },
      };

      const summary = branchTrendsService.getBranchTrendSummary(trendData);

      expect(summary.totalBranches).toBe(2);
      expect(summary.mostActiveBranch).toBe('main'); // 5 + 3 = 8 commits vs 2 commits
      expect(typeof summary.totalUniqueContributors).toBe('number');
    });

    it('should handle empty data', () => {
      const trendData: BranchTrendData = {};

      const summary = branchTrendsService.getBranchTrendSummary(trendData);

      expect(summary.totalBranches).toBe(0);
      expect(summary.mostActiveBranch).toBe('No activity');
      expect(summary.totalUniqueContributors).toBe(0);
    });
  });
});
