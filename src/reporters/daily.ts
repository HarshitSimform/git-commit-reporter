import { GitService } from "../services/git";
import { ReportService } from "../services/report";
import { getDateRange } from "../utils/date";
import { aggregateCommitsByCategory } from "../utils/categories";
import {
  aggregateContributors,
  getTopContributors,
} from "../utils/leaderboard";
import { ReportOptions } from "../types";

export async function generateDailyReport(repoPath?: string) {
  const gitService = new GitService(repoPath);
  const reportService = new ReportService();

  const { start, end } = getDateRange(1);
  const commits = await gitService.getCommits(start, end);

  // Analyze commit categories
  const categories = aggregateCommitsByCategory(commits);

  // Generate leaderboard
  const allContributors = aggregateContributors(commits);
  const leaderboard = getTopContributors(allContributors, 10); // Top 10 contributors

  const reportData = {
    commits,
    totalCommits: commits.length,
    dateRange: { start, end },
    categories,
    leaderboard,
  };

  const options: ReportOptions = {
    startDate: start,
    endDate: end,
    format: "html",
  };

  return reportService.generateReport(reportData, options);
}
