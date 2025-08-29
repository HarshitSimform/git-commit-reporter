import { categorizeCommit } from '../utils/categories';
import {
  GitCommit,
  WeeklyComparisonData,
  WeeklyComparisonMetric,
  CategoryComparison,
  WeeklyComparisonChartData,
} from '../types';

export class WeeklyComparisonService {
  static getWeeklyComparisonData(commits: GitCommit[]): WeeklyComparisonData {
    const now = new Date();

    // Get this week's range
    const thisWeekStart = new Date();
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    // Get last week's range
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const lastWeekEnd = new Date(thisWeekEnd);
    lastWeekEnd.setDate(thisWeekEnd.getDate() - 7);

    // Filter commits for each week
    const thisWeekCommits = commits.filter((commit) => {
      const commitDate = new Date(commit.date);
      return commitDate >= thisWeekStart && commitDate <= thisWeekEnd;
    });

    const lastWeekCommits = commits.filter((commit) => {
      const commitDate = new Date(commit.date);
      return commitDate >= lastWeekStart && commitDate <= lastWeekEnd;
    });

    // Calculate commit metrics
    const commits_metric = this.calculateMetric(thisWeekCommits.length, lastWeekCommits.length);

    // Calculate contributor metrics
    const thisWeekContributors = new Set(thisWeekCommits.map((c) => c.author_email)).size;
    const lastWeekContributors = new Set(lastWeekCommits.map((c) => c.author_email)).size;
    const contributors_metric = this.calculateMetric(thisWeekContributors, lastWeekContributors);

    // Calculate category breakdown
    const categories = this.getCategoryComparison(thisWeekCommits, lastWeekCommits);

    // Generate insights
    const insights = this.generateInsights(commits_metric, contributors_metric, categories);

    return {
      commits: commits_metric,
      contributors: contributors_metric,
      categories,
      insights,
    };
  }

  private static calculateMetric(thisWeek: number, lastWeek: number): WeeklyComparisonMetric {
    const change = thisWeek - lastWeek;
    const percentageChange =
      lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round((change / lastWeek) * 100);

    let trend: 'up' | 'down' | 'same';
    if (change > 0) trend = 'up';
    else if (change < 0) trend = 'down';
    else trend = 'same';

    return {
      thisWeek,
      lastWeek,
      change,
      percentageChange,
      trend,
    };
  }

  private static getCategoryComparison(
    thisWeekCommits: GitCommit[],
    lastWeekCommits: GitCommit[],
  ): CategoryComparison[] {
    const categories = ['feature', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'other'];

    return categories
      .map((category) => {
        const thisWeekCount = thisWeekCommits.filter(
          (commit) => categorizeCommit(commit.message) === category,
        ).length;

        const lastWeekCount = lastWeekCommits.filter(
          (commit) => categorizeCommit(commit.message) === category,
        ).length;

        const change = thisWeekCount - lastWeekCount;
        let trend: 'up' | 'down' | 'same';
        if (change > 0) trend = 'up';
        else if (change < 0) trend = 'down';
        else trend = 'same';

        return {
          name: category.charAt(0).toUpperCase() + category.slice(1),
          thisWeek: thisWeekCount,
          lastWeek: lastWeekCount,
          change,
          trend,
        };
      })
      .filter((cat) => cat.thisWeek > 0 || cat.lastWeek > 0); // Only show categories with activity
  }

  private static generateInsights(
    commits: WeeklyComparisonMetric,
    contributors: WeeklyComparisonMetric,
    categories: CategoryComparison[],
  ): string {
    const insights = [];

    // Overall activity insight
    if (commits.trend === 'up') {
      insights.push(
        `📈 Activity is up with ${commits.change} more commits than last week (+${commits.percentageChange}%)`,
      );
    } else if (commits.trend === 'down') {
      insights.push(
        `📉 Activity is down with ${Math.abs(commits.change)} fewer commits than last week (${commits.percentageChange}%)`,
      );
    } else {
      insights.push(`📊 Activity remains stable with the same number of commits as last week`);
    }

    // Contributors insight
    if (contributors.trend === 'up') {
      insights.push(
        `👥 Team engagement increased with ${contributors.change} more active contributors`,
      );
    } else if (contributors.trend === 'down') {
      insights.push(
        `👥 Team engagement decreased with ${Math.abs(contributors.change)} fewer active contributors`,
      );
    }

    // Category insights
    const increasedCategories = categories.filter((cat) => cat.trend === 'up').slice(0, 2);
    const decreasedCategories = categories.filter((cat) => cat.trend === 'down').slice(0, 2);

    if (increasedCategories.length > 0) {
      insights.push(
        `🔥 Increased focus on: ${increasedCategories.map((cat) => cat.name.toLowerCase()).join(', ')}`,
      );
    }

    if (decreasedCategories.length > 0) {
      insights.push(
        `⚡ Reduced activity in: ${decreasedCategories.map((cat) => cat.name.toLowerCase()).join(', ')}`,
      );
    }

    return insights.join(' • ');
  }

  static prepareWeeklyComparisonChartData(data: WeeklyComparisonData): WeeklyComparisonChartData {
    return {
      labels: ['Commits', 'Contributors'],
      datasets: [
        {
          label: 'This Week',
          data: [data.commits.thisWeek, data.contributors.thisWeek],
          backgroundColor: '#4ade80',
          borderColor: '#22c55e',
          borderWidth: 2,
        },
        {
          label: 'Last Week',
          data: [data.commits.lastWeek, data.contributors.lastWeek],
          backgroundColor: '#94a3b8',
          borderColor: '#64748b',
          borderWidth: 2,
        },
      ],
    };
  }
}
