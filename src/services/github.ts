import { Octokit } from '@octokit/rest';
import { PullRequest, ReviewActivity } from '../types';
import { config } from '../config';

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(owner: string, repo: string, token?: string) {
    this.owner = owner;
    this.repo = repo;
    this.octokit = new Octokit({
      auth: token || config.github.token,
    });
  }

  async getPullRequests(since: Date, until: Date): Promise<PullRequest[]> {
    try {
      const { data } = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'all',
        sort: 'created',
        direction: 'desc',
        per_page: 100,
      });

      return data
        .filter((pr) => {
          const createdAt = new Date(pr.created_at);
          return createdAt >= since && createdAt <= until;
        })
        .map((pr) => ({
          number: pr.number,
          title: pr.title,
          author: pr.user?.login || 'Unknown',
          state: pr.state as 'open' | 'closed',
          merged: pr.merged_at !== null,
          created_at: new Date(pr.created_at),
          merged_at: pr.merged_at ? new Date(pr.merged_at) : undefined,
          merged_by: (pr as any).merged_by?.login,
          url: pr.html_url,
        }));
    } catch (error) {
      console.warn('Failed to fetch PRs:', error);
      return [];
    }
  }

  async getReviewActivities(prs: PullRequest[]): Promise<ReviewActivity[]> {
    const activities: ReviewActivity[] = [];

    for (const pr of prs) {
      try {
        const { data: reviews } = await this.octokit.rest.pulls.listReviews({
          owner: this.owner,
          repo: this.repo,
          pull_number: pr.number,
        });

        const reviewActivities = reviews
          .filter((review) => review.user?.login !== pr.author) // Exclude self-reviews
          .map((review) => ({
            reviewer: review.user?.login || 'Unknown',
            pr_number: pr.number,
            pr_title: pr.title,
            submitted_at: new Date(review.submitted_at || new Date()),
          }));

        activities.push(...reviewActivities);
      } catch (error) {
        console.warn(`Failed to fetch reviews for PR #${pr.number}:`, error);
      }
    }

    return activities;
  }

  async getMergedPullRequests(since: Date, until: Date): Promise<PullRequest[]> {
    try {
      const { data } = await this.octokit.rest.pulls.list({
        owner: this.owner,
        repo: this.repo,
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
      });

      return data
        .filter((pr) => {
          if (!pr.merged_at) return false;
          const mergedAt = new Date(pr.merged_at);
          return mergedAt >= since && mergedAt <= until;
        })
        .map((pr) => ({
          number: pr.number,
          title: pr.title,
          author: pr.user?.login || 'Unknown',
          state: 'closed' as const,
          merged: true,
          created_at: new Date(pr.created_at),
          merged_at: new Date(pr.merged_at!),
          merged_by: (pr as any).merged_by?.login,
          url: pr.html_url,
        }));
    } catch (error) {
      console.warn('Failed to fetch merged PRs:', error);
      return [];
    }
  }
}
