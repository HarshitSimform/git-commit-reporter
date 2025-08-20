import { GitHubService } from "../../src/services/github";

// Mock the Octokit module
jest.mock("@octokit/rest");

describe("GitHubService", () => {
  let githubService: GitHubService;
  let mockOctokit: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const { Octokit } = require("@octokit/rest");
    mockOctokit = {
      rest: {
        pulls: {
          list: jest.fn(),
          listReviews: jest.fn(),
        },
      },
    };

    // Mock the Octokit constructor to return our mock
    (Octokit as jest.Mock).mockImplementation(() => mockOctokit);

    githubService = new GitHubService("testowner", "testrepo", "test-token");
  });

  describe("getPullRequests", () => {
    test("should fetch and filter PRs by date range", async () => {
      const mockPRs = [
        {
          number: 1,
          title: "Test PR 1",
          user: { login: "alice" },
          state: "open",
          merged_at: null,
          created_at: "2023-08-15T10:00:00Z",
          html_url: "https://github.com/testowner/testrepo/pull/1",
        },
        {
          number: 2,
          title: "Test PR 2",
          user: { login: "bob" },
          state: "closed",
          merged_at: "2023-08-17T10:00:00Z",
          created_at: "2023-08-16T10:00:00Z",
          html_url: "https://github.com/testowner/testrepo/pull/2",
        },
        {
          number: 3,
          title: "Old PR",
          user: { login: "charlie" },
          state: "open",
          merged_at: null,
          created_at: "2023-08-10T10:00:00Z", // Outside date range
          html_url: "https://github.com/testowner/testrepo/pull/3",
        },
      ];

      mockOctokit.rest.pulls.list.mockResolvedValue({ data: mockPRs });

      const since = new Date("2023-08-14");
      const until = new Date("2023-08-18");
      const result = await githubService.getPullRequests(since, until);

      expect(result).toHaveLength(2); // Should exclude the old PR
      expect(result[0].number).toBe(1);
      expect(result[0].title).toBe("Test PR 1");
      expect(result[0].author).toBe("alice");
      expect(result[0].merged).toBe(false);

      expect(result[1].number).toBe(2);
      expect(result[1].merged).toBe(true);
    });

    test("should handle API errors gracefully", async () => {
      mockOctokit.rest.pulls.list.mockRejectedValue(new Error("API Error"));

      const since = new Date("2023-08-14");
      const until = new Date("2023-08-18");
      const result = await githubService.getPullRequests(since, until);

      expect(result).toEqual([]);
    });
  });

  describe("getReviewActivities", () => {
    test("should fetch reviews for PRs and exclude self-reviews", async () => {
      const mockPRs = [
        {
          number: 1,
          title: "Test PR 1",
          author: "alice",
          state: "open" as const,
          merged: false,
          created_at: new Date("2023-08-15"),
          url: "https://github.com/testowner/testrepo/pull/1",
        },
      ];

      const mockReviews = [
        {
          user: { login: "alice" }, // Self-review, should be excluded
          submitted_at: "2023-08-16T10:00:00Z",
        },
        {
          user: { login: "bob" },
          submitted_at: "2023-08-16T12:00:00Z",
        },
        {
          user: { login: "charlie" },
          submitted_at: "2023-08-16T14:00:00Z",
        },
      ];

      mockOctokit.rest.pulls.listReviews.mockResolvedValue({
        data: mockReviews,
      });

      const result = await githubService.getReviewActivities(mockPRs);

      expect(result).toHaveLength(2); // Should exclude self-review
      expect(result[0].reviewer).toBe("bob");
      expect(result[0].pr_number).toBe(1);
      expect(result[1].reviewer).toBe("charlie");
    });

    test("should handle review API errors gracefully", async () => {
      const mockPRs = [
        {
          number: 1,
          title: "Test PR 1",
          author: "alice",
          state: "open" as const,
          merged: false,
          created_at: new Date("2023-08-15"),
          url: "https://github.com/testowner/testrepo/pull/1",
        },
      ];

      mockOctokit.rest.pulls.listReviews.mockRejectedValue(
        new Error("API Error")
      );

      const result = await githubService.getReviewActivities(mockPRs);

      expect(result).toEqual([]);
    });
  });

  describe("getMergedPullRequests", () => {
    test("should fetch and filter merged PRs by merge date", async () => {
      const mockPRs = [
        {
          number: 1,
          title: "Merged PR 1",
          user: { login: "alice" },
          state: "closed",
          merged_at: "2023-08-16T10:00:00Z",
          created_at: "2023-08-15T10:00:00Z",
          html_url: "https://github.com/testowner/testrepo/pull/1",
        },
        {
          number: 2,
          title: "Old Merged PR",
          user: { login: "bob" },
          state: "closed",
          merged_at: "2023-08-10T10:00:00Z", // Outside date range
          created_at: "2023-08-09T10:00:00Z",
          html_url: "https://github.com/testowner/testrepo/pull/2",
        },
        {
          number: 3,
          title: "Closed but not merged",
          user: { login: "charlie" },
          state: "closed",
          merged_at: null, // Not merged
          created_at: "2023-08-16T10:00:00Z",
          html_url: "https://github.com/testowner/testrepo/pull/3",
        },
      ];

      mockOctokit.rest.pulls.list.mockResolvedValue({ data: mockPRs });

      const since = new Date("2023-08-14");
      const until = new Date("2023-08-18");
      const result = await githubService.getMergedPullRequests(since, until);

      expect(result).toHaveLength(1); // Only the first PR should be included
      expect(result[0].number).toBe(1);
      expect(result[0].merged).toBe(true);
    });
  });
});
