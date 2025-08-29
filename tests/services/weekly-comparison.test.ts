import { WeeklyComparisonService } from '../../src/services/weekly-comparison';
import { GitCommit } from '../../src/types';

describe('WeeklyComparisonService', () => {
  const mockCommits: GitCommit[] = [
    // This week commits
    {
      hash: 'abc123',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      message: 'feat: add new feature',
      author_name: 'John Doe',
      author_email: 'john@example.com',
      files: ['file1.ts'],
    },
    {
      hash: 'def456',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      message: 'fix: bug fix',
      author_name: 'Jane Smith',
      author_email: 'jane@example.com',
      files: ['file2.ts'],
    },
    // Last week commits
    {
      hash: 'ghi789',
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      message: 'docs: update documentation',
      author_name: 'Bob Johnson',
      author_email: 'bob@example.com',
      files: ['docs.md'],
    },
    {
      hash: 'jkl012',
      date: new Date(Date.now() - 10 * 24 * 60 * 1000 * 60), // 10 days ago
      message: 'test: add tests',
      author_name: 'Alice Wilson',
      author_email: 'alice@example.com',
      files: ['test.spec.ts'],
    },
    {
      hash: 'mno345',
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      message: 'chore: update dependencies',
      author_name: 'Charlie Brown',
      author_email: 'charlie@example.com',
      files: ['package.json'],
    },
  ];

  describe('getWeeklyComparisonData', () => {
    it('should calculate weekly comparison metrics correctly', () => {
      const result = WeeklyComparisonService.getWeeklyComparisonData(mockCommits);

      expect(result).toHaveProperty('commits');
      expect(result).toHaveProperty('contributors');
      expect(result).toHaveProperty('categories');
      expect(result).toHaveProperty('insights');

      // Check commits metric
      expect(result.commits.thisWeek).toBeGreaterThanOrEqual(0);
      expect(result.commits.lastWeek).toBeGreaterThanOrEqual(0);
      expect(typeof result.commits.change).toBe('number');
      expect(typeof result.commits.percentageChange).toBe('number');
      expect(['up', 'down', 'same']).toContain(result.commits.trend);
    });

    it('should calculate contributors correctly', () => {
      const result = WeeklyComparisonService.getWeeklyComparisonData(mockCommits);

      expect(result.contributors.thisWeek).toBeGreaterThanOrEqual(0);
      expect(result.contributors.lastWeek).toBeGreaterThanOrEqual(0);
      expect(['up', 'down', 'same']).toContain(result.contributors.trend);
    });

    it('should categorize commits properly', () => {
      const result = WeeklyComparisonService.getWeeklyComparisonData(mockCommits);

      expect(Array.isArray(result.categories)).toBe(true);
      result.categories.forEach((category) => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('thisWeek');
        expect(category).toHaveProperty('lastWeek');
        expect(category).toHaveProperty('change');
        expect(['up', 'down', 'same']).toContain(category.trend);
      });
    });

    it('should generate insights', () => {
      const result = WeeklyComparisonService.getWeeklyComparisonData(mockCommits);

      expect(typeof result.insights).toBe('string');
      expect(result.insights.length).toBeGreaterThan(0);
    });
  });

  describe('prepareWeeklyComparisonChartData', () => {
    it('should prepare chart data correctly', () => {
      const comparisonData = WeeklyComparisonService.getWeeklyComparisonData(mockCommits);
      const chartData = WeeklyComparisonService.prepareWeeklyComparisonChartData(comparisonData);

      expect(chartData).toHaveProperty('labels');
      expect(chartData).toHaveProperty('datasets');
      expect(chartData.labels).toEqual(['Commits', 'Contributors']);
      expect(chartData.datasets).toHaveLength(2);

      // Check This Week dataset
      const thisWeekDataset = chartData.datasets[0];
      expect(thisWeekDataset.label).toBe('This Week');
      expect(thisWeekDataset.data).toHaveLength(2);
      expect(thisWeekDataset.backgroundColor).toBe('#4ade80');

      // Check Last Week dataset
      const lastWeekDataset = chartData.datasets[1];
      expect(lastWeekDataset.label).toBe('Last Week');
      expect(lastWeekDataset.data).toHaveLength(2);
      expect(lastWeekDataset.backgroundColor).toBe('#94a3b8');
    });
  });
});
