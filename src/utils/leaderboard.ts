import { GitCommit, LeaderboardEntry } from '../types';

export function aggregateContributors(commits: GitCommit[]): LeaderboardEntry[] {
  const contributorMap = new Map<string, { name: string; email: string; count: number }>();

  // Count commits per contributor
  commits.forEach((commit) => {
    const key = `${commit.author_name}|${commit.author_email}`;
    const existing = contributorMap.get(key);

    if (existing) {
      existing.count++;
    } else {
      contributorMap.set(key, {
        name: commit.author_name,
        email: commit.author_email,
        count: 1,
      });
    }
  });

  // Convert to leaderboard entries and sort by commit count
  const leaderboard = Array.from(contributorMap.values())
    .map((contributor) => ({
      rank: 0, // Will be set below
      author_name: contributor.name,
      author_email: contributor.email,
      commits: contributor.count,
      badge: '', // Will be set below
    }))
    .sort((a, b) => b.commits - a.commits); // Sort descending by commits

  // Assign ranks and badges
  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.badge = getBadgeForRank(entry.rank);
  });

  return leaderboard;
}

export function getBadgeForRank(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

export function getTopContributors(
  leaderboard: LeaderboardEntry[],
  limit = 10,
): LeaderboardEntry[] {
  return leaderboard.slice(0, limit);
}
