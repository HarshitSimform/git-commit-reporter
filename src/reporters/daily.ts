import { GitService } from '../services/git';
import { ReportService } from '../services/report';
import { BranchTrendsService } from '../services/branch-trends';
import { getDateRange } from '../utils/date';
import {
  aggregateCommitsByCategory,
  categorizeCommit,
  groupCommitsByBranch,
} from '../utils/categories';
import { aggregateContributors, getTopContributors } from '../utils/leaderboard';
import { ReportOptions } from '../types';

export async function generateDailyReport(repoPath?: string) {
  const gitService = new GitService(repoPath);
  const reportService = new ReportService();
  const branchTrendsService = new BranchTrendsService();

  const { start, end } = getDateRange(1);
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

  // Get branch trends data for daily report
  const branchTrendData = branchTrendsService.getBranchCommitTrends(commits, start, end, false);
  const branchTrends = branchTrendsService.formatDataForChart(branchTrendData, start, end, false);

  const reportData = {
    commits,
    totalCommits: commits.length,
    dateRange: { start, end },
    categories,
    leaderboard,
    branchGroups,
    branchTrends,
    isWeekly: false,
  };

  const options: ReportOptions = {
    startDate: start,
    endDate: end,
    format: 'html',
  };

  return reportService.generateReport(reportData, options);
}
