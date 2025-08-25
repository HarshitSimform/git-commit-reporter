import { GitService } from "../services/git";
import { GitHubService } from "../services/github";
import { ReportService } from "../services/report";
import { AIService } from "../services/ai";
import { getDateRange } from "../utils/date";
import {
  aggregateCommitsByCategory,
  categorizeCommit,
  groupCommitsByBranch,
} from "../utils/categories";
import {
  aggregateContributors,
  getTopContributors,
} from "../utils/leaderboard";
import { aggregatePRData, getTopReviewers } from "../utils/pr-analysis";
import { ReportOptions } from "../types";
import { WeeklySummaryData } from "../services/ai";

function prepareWeeklySummaryData(
  commits: any[],
  categories: any[],
  leaderboard: any[],
  branchGroups: any[],
  start: Date,
  end: Date
): WeeklySummaryData {
  return {
    totalCommits: commits.length,
    categories,
    topContributors: leaderboard,
    branchGroups,
    dateRange: { start, end },
  };
}

export async function generateWeeklyReport(repoPath?: string) {
  const gitService = new GitService(repoPath);
  const reportService = new ReportService();

  const { start, end } = getDateRange(7);
  const commits = await gitService.getCommits(start, end);

  // Apply category to each commit
  commits.forEach((commit) => {
    commit.category = categorizeCommit(commit.message);
  });

  // Analyze commit categories
  const categories = aggregateCommitsByCategory(commits);

  // Generate leaderboard
  const allContributors = aggregateContributors(commits);
  const leaderboard = getTopContributors(allContributors, 10); // Top 10 contributors

  // Group commits by branch
  const branchGroups = groupCommitsByBranch(commits);

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

  // Generate enhanced AI summary with more detailed data
  let aiSummary: string | null = null;
  try {
    const aiService = new AIService();
    const summaryData = prepareWeeklySummaryData(
      commits,
      categories,
      leaderboard,
      branchGroups,
      start,
      end
    );
    aiSummary = await aiService.generateWeeklySummary(summaryData);
  } catch (error) {
    console.warn("Failed to generate AI summary:", error);
  }

  const reportData = {
    commits,
    totalCommits: commits.length,
    dateRange: { start, end },
    categories,
    leaderboard,
    prSummary,
    branchGroups,
    aiSummary: aiSummary || undefined,
  };

  const options: ReportOptions = {
    startDate: start,
    endDate: end,
    format: "html",
  };

  return reportService.generateReport(reportData, options);
}
