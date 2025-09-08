import { BranchTrendData, BranchTrendChartData, GitCommit } from '../types';

export class BranchTrendsService {
  /**
   * Get branch commit trends data for visualization
   */
  getBranchCommitTrends(
    commits: GitCommit[],
    startDate: Date,
    endDate: Date,
    isWeekly = false,
  ): BranchTrendData {
    // Temporary structure for processing
    const tempData: {
      [branchName: string]: {
        [date: string]: {
          commits: number;
          contributors: Set<string>;
        };
      };
    } = {};

    // Group commits by branch and date
    for (const commit of commits) {
      const branch = commit.branch || 'unknown';
      const commitDate = this.formatDateForTrends(commit.date, isWeekly);

      // Initialize branch if not exists
      if (!tempData[branch]) {
        tempData[branch] = {};
      }

      // Initialize date if not exists
      if (!tempData[branch][commitDate]) {
        tempData[branch][commitDate] = {
          commits: 0,
          contributors: new Set<string>(),
        };
      }

      // Increment commit count and add contributor
      tempData[branch][commitDate].commits++;
      tempData[branch][commitDate].contributors.add(commit.author_name);
    }

    // Convert to final data structure
    const finalData: BranchTrendData = {};
    for (const [branch, dates] of Object.entries(tempData)) {
      finalData[branch] = {};
      for (const [date, data] of Object.entries(dates)) {
        finalData[branch][date] = {
          commits: data.commits,
          contributors: data.contributors.size,
        };
      }
    }

    return finalData;
  }

  /**
   * Convert branch trend data to Chart.js format
   */
  formatDataForChart(
    trendData: BranchTrendData,
    startDate: Date,
    endDate: Date,
    isWeekly = false,
  ): BranchTrendChartData {
    // Generate all dates in range
    const dateLabels = this.generateDateRange(startDate, endDate, isWeekly);

    // Define colors for different branches
    const branchColors = [
      '#4CAF50',
      '#2196F3',
      '#FF9800',
      '#E91E63',
      '#9C27B0',
      '#00BCD4',
      '#795548',
      '#607D8B',
      '#FF5722',
      '#CDDC39',
    ];

    const datasets = Object.keys(trendData).map((branch, index) => {
      const branchData = trendData[branch];
      const color = branchColors[index % branchColors.length];

      // Map data to date labels, filling missing dates with 0
      const data = dateLabels.map((date) => {
        return branchData[date]?.commits || 0;
      });

      return {
        label: branch,
        data,
        borderColor: color,
        backgroundColor: color + '20', // Add transparency
        tension: 0.3,
        fill: false,
        pointBackgroundColor: color,
        pointBorderColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return {
      labels: dateLabels.map((date) => this.formatDateLabel(date, isWeekly)),
      datasets,
    };
  }

  /**
   * Format date for trend analysis (daily or weekly)
   */
  private formatDateForTrends(date: Date, isWeekly: boolean): string {
    if (isWeekly) {
      // Get the Monday of the week for weekly grouping
      const monday = new Date(date);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);
      return monday.toISOString().split('T')[0];
    } else {
      // Return date as YYYY-MM-DD for daily grouping
      return date.toISOString().split('T')[0];
    }
  }

  /**
   * Generate array of date strings between start and end dates
   */
  private generateDateRange(startDate: Date, endDate: Date, isWeekly: boolean): string[] {
    const dates: string[] = [];

    if (isWeekly) {
      // For weekly reporting, we need to include all weeks that could contain dates
      // in our range. Start from the Monday of the start date's week and continue
      // until we've covered all possible weeks.

      let current = new Date(startDate);

      // Continue until we've passed the end date
      while (current <= endDate) {
        // Get the Monday of the current week
        const monday = new Date(current);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        const mondayString = monday.toISOString().split('T')[0];
        if (!dates.includes(mondayString)) {
          dates.push(mondayString);
        }

        // Move forward by 7 days to the next week
        current.setDate(current.getDate() + 7);
      }

      // Also check if we need to include the week containing the end date
      const endMonday = new Date(endDate);
      const endDay = endMonday.getDay();
      const endDiff = endMonday.getDate() - endDay + (endDay === 0 ? -6 : 1);
      endMonday.setDate(endDiff);
      const endMondayString = endMonday.toISOString().split('T')[0];

      if (!dates.includes(endMondayString)) {
        dates.push(endMondayString);
      }
    } else {
      // For daily, include each day in the range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return dates.sort(); // Sort chronologically
  }

  /**
   * Format date label for display
   */
  private formatDateLabel(dateString: string, isWeekly: boolean): string {
    const date = new Date(dateString + 'T00:00:00');

    if (isWeekly) {
      return (
        date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }) + ' (Week)'
      );
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }

  /**
   * Get summary statistics for branch trends
   */
  getBranchTrendSummary(trendData: BranchTrendData): {
    totalBranches: number;
    mostActiveBranch: string;
    totalUniqueContributors: number;
  } {
    let mostActiveBranch = '';
    let maxCommits = 0;
    const allContributors = new Set<string>();

    Object.entries(trendData).forEach(([branch, dates]) => {
      const branchCommits = Object.values(dates).reduce((sum, data) => sum + data.commits, 0);

      if (branchCommits > maxCommits) {
        maxCommits = branchCommits;
        mostActiveBranch = branch;
      }
    });

    return {
      totalBranches: Object.keys(trendData).length,
      mostActiveBranch: mostActiveBranch || 'No activity',
      totalUniqueContributors: allContributors.si,
    };
  }
}
