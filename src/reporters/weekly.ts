import { GitService } from "../services/git";
import { GitHubService } from "../services/github";
import { ReportService } from "../services/report";
import { getDateRange } from "../utils/date";
import { aggregateCommitsByCategory } from "../utils/categories";
import {
  aggregateContributors,
  getTopContributors,
} from "../utils/leaderboard";
import { aggregatePRData, getTopReviewers } from "../utils/pr-analysis";
import { ReportOptions } from "../types";

export async function generateWeeklyReport(repoPath?: string) {
  const gitService = new GitService(repoPath);
  const reportService = new ReportService();

  const { start, end } = getDateRange(7);
  const commits = await gitService.getCommits(start, end);

  // Analyze commit categories
  const categories = aggregateCommitsByCategory(commits);

  // Generate leaderboard
  const allContributors = aggregateContributors(commits);
  const leaderboard = getTopContributors(allContributors, 10); // Top 10 contributors

  // Generate PR data (if GitHub repo is detected and token is available)
  let prSummary;
  try {
    const repoInfo = await gitService.getGitHubRepoInfo();
    if (repoInfo && process.env.GITHUB_TOKEN) {
      const githubService = new GitHubService(repoInfo.owner, repoInfo.repo);

      const prsCreated = await githubService.getPullRequests(start, end);
      const prsMerged = await githubService.getMergedPullRequests(start, end);
      const reviewActivities = await githubService.getReviewActivities([
        ...prsCreated,
        ...prsMerged,
      ]);

      prSummary = aggregatePRData(prsCreated, prsMerged, reviewActivities);
      prSummary.reviewer_leaderboard = getTopReviewers(
        prSummary.reviewer_leaderboard,
        10
      );
    }
  } catch (error) {
    console.warn("Failed to fetch PR data:", error);
  }

  const reportData = {
    commits,
    totalCommits: commits.length,
    dateRange: { start, end },
    categories,
    leaderboard,
    prSummary,
  };

  const options: ReportOptions = {
    startDate: start,
    endDate: end,
    format: "html",
  };

  return reportService.generateReport(reportData, options);
}
