import { PullRequest, ReviewActivity, ReviewerStats, PRSummary } from '../types';
import { getBadgeForRank } from './leaderboard';

export function aggregatePRData(
  prsCreated: PullRequest[],
  prsMerged: PullRequest[],
  reviewActivities: ReviewActivity[],
): PRSummary {
  // Aggregate reviewer stats
  const reviewerMap = new Map<string, number>();

  reviewActivities.forEach((activity) => {
    reviewerMap.set(activity.reviewer, (reviewerMap.get(activity.reviewer) || 0) + 1);
  });

  // Create reviewer leaderboard
  const reviewerLeaderboard: ReviewerStats[] = Array.from(reviewerMap.entries())
    .map(([reviewer, reviews]) => ({
      rank: 0, // Will be set below
      reviewer,
      reviews,
      badge: '',
    }))
    .sort((a, b) => b.reviews - a.reviews); // Sort by reviews descending

  // Assign ranks and badges
  reviewerLeaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.badge = getBadgeForRank(entry.rank);
  });

  return {
    total_created: prsCreated.length,
    total_merged: prsMerged.length,
    total_reviewed: reviewActivities.length,
    prs_created: prsCreated.sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
    prs_merged: prsMerged.sort(
      (a, b) => (b.merged_at?.getTime() || 0) - (a.merged_at?.getTime() || 0),
    ),
    review_activities: reviewActivities.sort(
      (a, b) => b.submitted_at.getTime() - a.submitted_at.getTime(),
    ),
    reviewer_leaderboard: reviewerLeaderboard,
  };
}

export function getTopReviewers(reviewerStats: ReviewerStats[], limit = 10): ReviewerStats[] {
  return reviewerStats.slice(0, limit);
}

export function formatPRStatus(pr: PullRequest): string {
  if (pr.merged) {
    return 'Merged';
  } else if (pr.state === 'closed') {
    return 'Closed';
  } else {
    return 'Open';
  }
}

export function getPRStateColor(pr: PullRequest): string {
  if (pr.merged) {
    return '#8b5cf6'; // Purple for merged
  } else if (pr.state === 'closed') {
    return '#ef4444'; // Red for closed
  } else {
    return '#10b981'; // Green for open
  }
}
