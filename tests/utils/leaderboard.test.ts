import {
  aggregateContributors,
  getBadgeForRank,
  getTopContributors,
} from '../../src/utils/leaderboard';
import { GitCommit } from '../../src/types';

describe('Leaderboard Utils', () => {
  describe('aggregateContributors', () => {
    test('should aggregate commits by contributor', () => {
      const mockCommits: GitCommit[] = [
        {
          hash: '1',
          date: new Date(),
          message: 'feat: add login',
          author_name: 'Alice',
          author_email: 'alice@test.com',
          files: [],
        },
        {
          hash: '2',
          date: new Date(),
          message: 'fix: resolve bug',
          author_name: 'Bob',
          author_email: 'bob@test.com',
          files: [],
        },
        {
          hash: '3',
          date: new Date(),
          message: 'feat: add signup',
          author_name: 'Alice',
          author_email: 'alice@test.com',
          files: [],
        },
        {
          hash: '4',
          date: new Date(),
          message: 'docs: update readme',
          author_name: 'Charlie',
          author_email: 'charlie@test.com',
          files: [],
        },
        {
          hash: '5',
          date: new Date(),
          message: 'refactor: clean code',
          author_name: 'Alice',
          author_email: 'alice@test.com',
          files: [],
        },
      ];

      const leaderboard = aggregateContributors(mockCommits);

      expect(leaderboard).toHaveLength(3);

      // Should be sorted by commit count descending
      expect(leaderboard[0].author_name).toBe('Alice');
      expect(leaderboard[0].commits).toBe(3);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].badge).toBe('🥇');

      expect(leaderboard[1].author_name).toBe('Bob');
      expect(leaderboard[1].commits).toBe(1);
      expect(leaderboard[1].rank).toBe(2);
      expect(leaderboard[1].badge).toBe('🥈');

      expect(leaderboard[2].author_name).toBe('Charlie');
      expect(leaderboard[2].commits).toBe(1);
      expect(leaderboard[2].rank).toBe(3);
      expect(leaderboard[2].badge).toBe('🥉');
    });

    test('should handle empty commits array', () => {
      const leaderboard = aggregateContributors([]);
      expect(leaderboard).toHaveLength(0);
    });

    test('should handle single contributor', () => {
      const mockCommits: GitCommit[] = [
        {
          hash: '1',
          date: new Date(),
          message: 'feat: add feature',
          author_name: 'Alice',
          author_email: 'alice@test.com',
          files: [],
        },
      ];

      const leaderboard = aggregateContributors(mockCommits);

      expect(leaderboard).toHaveLength(1);
      expect(leaderboard[0].author_name).toBe('Alice');
      expect(leaderboard[0].commits).toBe(1);
      expect(leaderboard[0].rank).toBe(1);
      expect(leaderboard[0].badge).toBe('🥇');
    });

    test('should differentiate contributors by email', () => {
      const mockCommits: GitCommit[] = [
        {
          hash: '1',
          date: new Date(),
          message: 'feat: add feature',
          author_name: 'John',
          author_email: 'john@company.com',
          files: [],
        },
        {
          hash: '2',
          date: new Date(),
          message: 'fix: resolve bug',
          author_name: 'John',
          author_email: 'john@personal.com',
          files: [],
        },
      ];

      const leaderboard = aggregateContributors(mockCommits);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].author_email).toBe('john@company.com');
      expect(leaderboard[1].author_email).toBe('john@personal.com');
    });
  });

  describe('getBadgeForRank', () => {
    test('should return correct badges for top 3 ranks', () => {
      expect(getBadgeForRank(1)).toBe('🥇');
      expect(getBadgeForRank(2)).toBe('🥈');
      expect(getBadgeForRank(3)).toBe('🥉');
    });

    test('should return empty string for ranks > 3', () => {
      expect(getBadgeForRank(4)).toBe('');
      expect(getBadgeForRank(10)).toBe('');
      expect(getBadgeForRank(100)).toBe('');
    });
  });

  describe('getTopContributors', () => {
    test('should return top N contributors', () => {
      const mockLeaderboard = [
        {
          rank: 1,
          author_name: 'Alice',
          author_email: 'alice@test.com',
          commits: 10,
          badge: '🥇',
        },
        {
          rank: 2,
          author_name: 'Bob',
          author_email: 'bob@test.com',
          commits: 8,
          badge: '🥈',
        },
        {
          rank: 3,
          author_name: 'Charlie',
          author_email: 'charlie@test.com',
          commits: 5,
          badge: '🥉',
        },
        {
          rank: 4,
          author_name: 'David',
          author_email: 'david@test.com',
          commits: 3,
          badge: '',
        },
        {
          rank: 5,
          author_name: 'Eve',
          author_email: 'eve@test.com',
          commits: 2,
          badge: '',
        },
      ];

      const top3 = getTopContributors(mockLeaderboard, 3);
      expect(top3).toHaveLength(3);
      expect(top3[0].author_name).toBe('Alice');
      expect(top3[1].author_name).toBe('Bob');
      expect(top3[2].author_name).toBe('Charlie');
    });

    test('should default to top 10 when limit not specified', () => {
      const mockLeaderboard = Array.from({ length: 15 }, (_, i) => ({
        rank: i + 1,
        author_name: `Author${i + 1}`,
        author_email: `author${i + 1}@test.com`,
        commits: 15 - i,
        badge: i < 3 ? ['🥇', '🥈', '🥉'][i] : '',
      }));

      const topContributors = getTopContributors(mockLeaderboard);
      expect(topContributors).toHaveLength(10);
    });

    test('should return all contributors when list is smaller than limit', () => {
      const mockLeaderboard = [
        {
          rank: 1,
          author_name: 'Alice',
          author_email: 'alice@test.com',
          commits: 10,
          badge: '🥇',
        },
        {
          rank: 2,
          author_name: 'Bob',
          author_email: 'bob@test.com',
          commits: 8,
          badge: '🥈',
        },
      ];

      const topContributors = getTopContributors(mockLeaderboard, 5);
      expect(topContributors).toHaveLength(2);
    });
  });
});
