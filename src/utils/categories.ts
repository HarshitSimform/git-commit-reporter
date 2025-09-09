import { GitCommit, CommitCategory, BranchGroup } from '../types';

export function categorizeCommit(message: string): string {
  const normalizedMessage = message.toLowerCase().trim();

  // Define patterns for each category with their keywords
  const categoryPatterns = [
    {
      category: 'Feature',
      patterns: ['feat:', 'feature:', 'feat ', 'feature '],
    },
    {
      category: 'Fix',
      patterns: ['fix:', 'bugfix:', 'fix ', 'bugfix '],
    },
    {
      category: 'Docs',
      patterns: ['docs:', 'doc:', 'docs ', 'doc '],
    },
    {
      category: 'Refactor',
      patterns: ['refactor:', 'refact:', 'refactor ', 'refact '],
    },
    {
      category: 'Style',
      patterns: ['style:', 'style '],
    },
    {
      category: 'Test',
      patterns: ['test:', 'tests:', 'test ', 'tests '],
    },
    {
      category: 'Chore',
      patterns: ['chore:', 'chore '],
    },
    {
      category: 'Performance',
      patterns: ['perf:', 'performance:', 'perf ', 'performance '],
    },
    {
      category: 'Update',
      patterns: ['update:', 'upd:', 'update ', 'upd '],
    },
  ];

  // Find the earliest match in the message
  let earliestMatch = { position: Infinity, category: 'Other' };

  for (const { category, patterns } of categoryPatterns) {
    for (const pattern of patterns) {
      const position = normalizedMessage.indexOf(pattern);
      if (position !== -1 && position < earliestMatch.position) {
        earliestMatch = { position, category };
      }
    }
  }

  return earliestMatch.category;
}

export function aggregateCommitsByCategory(commits: GitCommit[]): CommitCategory[] {
  const categoryMap = new Map<string, number>();

  // Categorize all commits
  commits.forEach((commit) => {
    const category = categorizeCommit(commit.message);
    commit.category = category;
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  // Define colors for each category
  const categoryColors: { [key: string]: string } = {
    Feature: '#4CAF50',
    Fix: '#F44336',
    Docs: '#2196F3',
    Refactor: '#FF9800',
    Style: '#9C27B0',
    Test: '#00BCD4',
    Chore: '#795548',
    Performance: '#CDDC39',
    Update: '#E91E63',
    Other: '#9E9E9E',
  };

  // Convert map to array of CommitCategory objects
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      color: categoryColors[name] || '#9E9E9E',
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending
}

export function generateCategoryChartData(categories: CommitCategory[]) {
  return {
    labels: categories.map((cat) => cat.name),
    datasets: [
      {
        data: categories.map((cat) => cat.count),
        backgroundColor: categories.map((cat) => cat.color),
        borderColor: categories.map((cat) => cat.color),
        borderWidth: 1,
      },
    ],
  };
}

export function groupCommitsByBranch(commits: GitCommit[]): BranchGroup[] {
  const branchMap: Record<string, GitCommit[]> = {};

  // Group commits by branch
  commits.forEach((commit) => {
    const branch = commit.branch || 'unknown';
    if (!branchMap[branch]) {
      branchMap[branch] = [];
    }
    branchMap[branch].push(commit);
  });

  // Convert to BranchGroup array and sort
  return Object.entries(branchMap)
    .map(([branch, branchCommits]) => ({
      branch,
      commits: branchCommits.sort((a, b) => b.date.getTime() - a.date.getTime()),
      count: branchCommits.length,
    }))
    .sort((a, b) => {
      // Sort: main/master first, then by commit count
      if (a.branch === 'main' || a.branch === 'master') return -1;
      if (b.branch === 'main' || b.branch === 'master') return 1;
      return b.count - a.count;
    });
}
