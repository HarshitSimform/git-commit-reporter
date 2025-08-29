export interface GitCommit {
  hash: string;
  date: Date;
  message: string;
  author_name: string;
  author_email: string;
  files: string[];
  category?: string;
  branch?: string;
}

export interface BranchGroup {
  branch: string;
  commits: GitCommit[];
  count: number;
}

export interface ReportOptions {
  startDate: Date;
  endDate: Date;
  format: 'html' | 'text';
}

export interface CommitCategory {
  name: string;
  count: number;
  color: string;
}

export interface LeaderboardEntry {
  rank: number;
  author_name: string;
  author_email: string;
  commits: number;
  badge: string;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  state: 'open' | 'closed';
  merged: boolean;
  created_at: Date;
  merged_at?: Date;
  merged_by?: string;
  url: string;
}

export interface ReviewActivity {
  reviewer: string;
  pr_number: number;
  pr_title: string;
  submitted_at: Date;
}

export interface ReviewerStats {
  rank: number;
  reviewer: string;
  reviews: number;
  badge: string;
}

export interface PRSummary {
  total_created: number;
  total_merged: number;
  total_reviewed: number;
  prs_created: PullRequest[];
  prs_merged: PullRequest[];
  review_activities: ReviewActivity[];
  reviewer_leaderboard: ReviewerStats[];
}

export interface ReportData {
  commits: GitCommit[];
  totalCommits: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  categories?: CommitCategory[];
  leaderboard?: LeaderboardEntry[];
  prSummary?: PRSummary;
  branchGroups?: BranchGroup[];
  branchTrends?: BranchTrendChartData;
  aiSummary?: string;
  isWeekly?: boolean;
}

export interface BranchTrendData {
  [branchName: string]: {
    [date: string]: {
      commits: number;
      contributors: number;
    };
  };
}

export interface BranchTrendChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

export interface WeeklyComparisonMetric {
  thisWeek: number;
  lastWeek: number;
  change: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'same';
}

export interface CategoryComparison {
  name: string;
  thisWeek: number;
  lastWeek: number;
  change: number;
  trend: 'up' | 'down' | 'same';
}

export interface WeeklyComparisonData {
  commits: WeeklyComparisonMetric;
  contributors: WeeklyComparisonMetric;
  categories: CategoryComparison[];
  insights: string;
}

export interface WeeklyComparisonChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}
