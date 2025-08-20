import { generateWeeklyReport } from "../../src/reporters/weekly";

// Mock the GitHub service to avoid API calls
jest.mock("../../src/services/github", () => ({
  GitHubService: jest.fn().mockImplementation(() => ({
    getPullRequests: jest.fn().mockResolvedValue([]),
    getReviewActivities: jest.fn().mockResolvedValue([]),
    getMergedPullRequests: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock the Octokit module
jest.mock("@octokit/rest");

describe("Weekly Reporter", () => {
  test("should generate weekly report", async () => {
    const report = await generateWeeklyReport();
    expect(report).toBeDefined();
    expect(typeof report).toBe("string");
    expect(report).toContain("Git Commit Report");
  });
});
