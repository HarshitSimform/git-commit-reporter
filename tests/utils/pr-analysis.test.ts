import {
  aggregatePRData,
  getTopReviewers,
  formatPRStatus,
  getPRStateColor,
} from '../../src/utils/pr-analysis';
import { PullRequest, ReviewActivity } from '../../src/types';

describe('PR Analysis Utils', () => {
  describe('aggregatePRData', () => {
    test('should aggregate PR and review data correctly', () => {
      const prsCreated: PullRequest[] = [
        {
          number: 1,
          title: 'Add login feature',
          author: 'alice',
          state: 'open',
          merged: false,
          created_at: new Date('2023-08-15'),
          url: 'https://github.com/test/repo/pull/1',
        },
        {
          number: 2,
          title: 'Fix bug',
          author: 'bob',
          state: 'closed',
          merged: true,
          created_at: new Date('2023-08-16'),
          merged_at: new Date('2023-08-17'),
          merged_by: 'charlie',
          url: 'https://github.com/test/repo/pull/2',
        },
      ];

      const prsMerged: PullRequest[] = [
        {
          number: 2,
          title: 'Fix bug',
          author: 'bob',
          state: 'closed',
          merged: true,
          created_at: new Date('2023-08-16'),
          merged_at: new Date('2023-08-17'),
          merged_by: 'charlie',
          url: 'https://github.com/test/repo/pull/2',
        },
      ];

      const reviewActivities: ReviewActivity[] = [
        {
          reviewer: 'charlie',
          pr_number: 1,
          pr_title: 'Add login feature',
          submitted_at: new Date('2023-08-16'),
        },
        {
          reviewer: 'charlie',
          pr_number: 2,
          pr_title: 'Fix bug',
          submitted_at: new Date('2023-08-17'),
        },
        {
          reviewer: 'alice',
          pr_number: 2,
          pr_title: 'Fix bug',
          submitted_at: new Date('2023-08-17'),
        },
      ];

      const result = aggregatePRData(prsCreated, prsMerged, reviewActivities);

      expect(result.total_created).toBe(2);
      expect(result.total_merged).toBe(1);
      expect(result.total_reviewed).toBe(3);
      expect(result.prs_created).toHaveLength(2);
      expect(result.prs_merged).toHaveLength(1);
      expect(result.review_activities).toHaveLength(3);
      expect(result.reviewer_leaderboard).toHaveLength(2);

      // Check reviewer leaderboard sorting
      expect(result.reviewer_leaderboard[0].reviewer).toBe('charlie');
      expect(result.reviewer_leaderboard[0].reviews).toBe(2);
      expect(result.reviewer_leaderboard[0].badge).toBe('🥇');

      expect(result.reviewer_leaderboard[1].reviewer).toBe('alice');
      expect(result.reviewer_leaderboard[1].reviews).toBe(1);
      expect(result.reviewer_leaderboard[1].badge).toBe('🥈');
    });

    test('should handle empty data', () => {
      const result = aggregatePRData([], [], []);

      expect(result.total_created).toBe(0);
      expect(result.total_merged).toBe(0);
      expect(result.total_reviewed).toBe(0);
      expect(result.prs_created).toHaveLength(0);
      expect(result.prs_merged).toHaveLength(0);
      expect(result.review_activities).toHaveLength(0);
      expect(result.reviewer_leaderboard).toHaveLength(0);
    });
  });

  describe('getTopReviewers', () => {
    test('should return top N reviewers', () => {
      const reviewerStats = [
        { rank: 1, reviewer: 'alice', reviews: 5, badge: '🥇' },
        { rank: 2, reviewer: 'bob', reviews: 3, badge: '🥈' },
        { rank: 3, reviewer: 'charlie', reviews: 2, badge: '🥉' },
        { rank: 4, reviewer: 'david', reviews: 1, badge: '' },
      ];

      const top2 = getTopReviewers(reviewerStats, 2);
      expect(top2).toHaveLength(2);
      expect(top2[0].reviewer).toBe('alice');
      expect(top2[1].reviewer).toBe('bob');
    });

    test('should default to top 10', () => {
      const reviewerStats = Array.from({ length: 15 }, (_, i) => ({
        rank: i + 1,
        reviewer: `reviewer${i + 1}`,
        reviews: 15 - i,
        badge: i < 3 ? ['🥇', '🥈', '🥉'][i] : '',
      }));

      const topReviewers = getTopReviewers(reviewerStats);
      expect(topReviewers).toHaveLength(10);
    });
  });

  describe('formatPRStatus', () => {
    test('should return correct status for different PR states', () => {
      const mergedPR: PullRequest = {
        number: 1,
        title: 'Test',
        author: 'test',
        state: 'closed',
        merged: true,
        created_at: new Date(),
        url: 'test',
      };

      const closedPR: PullRequest = {
        number: 2,
        title: 'Test',
        author: 'test',
        state: 'closed',
        merged: false,
        created_at: new Date(),
        url: 'test',
      };

      const openPR: PullRequest = {
        number: 3,
        title: 'Test',
        author: 'test',
        state: 'open',
        merged: false,
        created_at: new Date(),
        url: 'test',
      };

      expect(formatPRStatus(mergedPR)).toBe('Merged');
      expect(formatPRStatus(closedPR)).toBe('Closed');
      expect(formatPRStatus(openPR)).toBe('Open');
    });
  });

  describe('getPRStateColor', () => {
    test('should return correct colors for different PR states', () => {
      const mergedPR: PullRequest = {
        number: 1,
        title: 'Test',
        author: 'test',
        state: 'closed',
        merged: true,
        created_at: new Date(),
        url: 'test',
      };

      const closedPR: PullRequest = {
        number: 2,
        title: 'Test',
        author: 'test',
        state: 'closed',
        merged: false,
        created_at: new Date(),
        url: 'test',
      };

      const openPR: PullRequest = {
        number: 3,
        title: 'Test',
        author: 'test',
        state: 'open',
        merged: false,
        created_at: new Date(),
        url: 'test',
      };

      expect(getPRStateColor(mergedPR)).toBe('#8b5cf6'); // Purple
      expect(getPRStateColor(closedPR)).toBe('#ef4444'); // Red
      expect(getPRStateColor(openPR)).toBe('#10b981'); // Green
    });
  });
});
