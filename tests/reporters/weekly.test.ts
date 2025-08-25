import { generateWeeklyReport } from '../../src/reporters/weekly';

// Mock the GitHub service to avoid API calls
jest.mock('../../src/services/github', () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    getPullRequests: jest.fn().mockResolvedValue([]),
    getReviewActivities: jest.fn().mockResolvedValue([]),
    getMergedPullRequests: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock the AI service to avoid API calls
jest.mock('../../src/services/ai', () => ({
  AIService: jest.fn().mockImplementation(() => ({
    generateWeeklySummary: jest
      .fn()
      .mockResolvedValue(
        '<p>This is a test AI summary. It contains insights about the weekly development activities and team contributions.</p>',
      ),
  })),
}));

// Mock the Octokit module
jest.mock('@octokit/rest');

describe('Weekly Reporter', () => {
  test('should generate weekly report', async () => {
    const report = await generateWeeklyReport();
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
    expect(report).toContain('Git Commit Report');
  });
});
