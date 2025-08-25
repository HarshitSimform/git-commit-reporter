import OpenAI from 'openai';
import { HfInference } from '@huggingface/inference';
import { CommitCategory, LeaderboardEntry, BranchGroup } from '../types';
import { config, hasConfig } from '../config';

export interface WeeklySummaryData {
  totalCommits: number;
  categories: CommitCategory[];
  topContributors: LeaderboardEntry[];
  branchGroups: BranchGroup[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

export class AIService {
  private openai: OpenAI | null = null;
  private hf: HfInference | null = null;

  constructor() {
    // Initialize OpenAI client if API key is available
    if (hasConfig('openai.apiKey') && config.openai.apiKey) {
      this.openai = new OpenAI({ apiKey: config.openai.apiKey });
    }

    // Initialize Hugging Face client only if token is available
    // Without a token, most useful models won't be accessible
    if (hasConfig('huggingface.token') && config.huggingface.token) {
      this.hf = new HfInference(config.huggingface.token);
    }
  }

  async generateWeeklySummary(data: WeeklySummaryData): Promise<string | null> {
    // Use only free AI providers - try Hugging Face first, then fallback to basic
    if (this.hf && hasConfig('huggingface.token')) {
      try {
        const aiResult = await this.tryHuggingFaceGeneration(data);
        if (aiResult) {
          return aiResult;
        }
      } catch (error) {
        console.warn('Hugging Face generation failed:', error);
      }
    }

    // If no HF token or HF failed, generate enhanced basic summary
    console.log('Using enhanced basic summary generation (no AI providers available)');
    return this.generateEnhancedBasicSummary(data);
  }

  private async tryHuggingFaceGeneration(data: WeeklySummaryData): Promise<string | null> {
    if (!this.hf) {
      return null;
    }

    const prompt = this.buildEnhancedSummaryPrompt(data);

    try {
      // Use Hugging Face's recommended text generation models
      const response = await this.hf.textGeneration({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          do_sample: true,
          return_full_text: false,
        },
      });

      const generated = response.generated_text?.trim();
      return generated ? this.formatSummaryForHTML(generated) : null;
    } catch (error) {
      // Try alternative free model - Google's Flan-T5
      try {
        const response = await this.hf.textGeneration({
          model: 'google/flan-t5-large',
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false,
          },
        });

        const generated = response.generated_text?.trim();
        return generated ? this.formatSummaryForHTML(generated) : null;
      } catch (fallbackError) {
        console.warn('Both HF models failed:', error, fallbackError);
        return null;
      }
    }
  }

  private generateEnhancedBasicSummary(data: WeeklySummaryData): string {
    const { totalCommits, categories, topContributors, branchGroups, dateRange } = data;

    // Analyze the data for insights
    const topCategory = categories.reduce(
      (prev, curr) => (prev.count > curr.count ? prev : curr),
      categories[0],
    );

    const topContributor = topContributors[0];
    const activeBranches = branchGroups.length;

    // Create engaging paragraphs
    const paragraphs = [];

    // First paragraph: Major work overview
    const workTypes = categories
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    let workDescription = `This week brought ${totalCommits} commits`;
    if (workTypes.length > 0) {
      const workTypeDescriptions = workTypes.map((cat) => {
        switch (cat.name.toLowerCase()) {
          case 'feature':
            return `${cat.count} new features`;
          case 'fix':
            return `${cat.count} bug fixes`;
          case 'docs':
            return `${cat.count} documentation updates`;
          case 'refactor':
            return `${cat.count} code refactors`;
          case 'style':
            return `${cat.count} style improvements`;
          case 'test':
            return `${cat.count} test additions`;
          default:
            return `${cat.count} ${cat.name.toLowerCase()} changes`;
        }
      });
      workDescription += ` focusing on ${workTypeDescriptions.join(', ')}`;
    }

    // Add branch activity
    if (branchGroups.length > 0) {
      const topBranches = branchGroups.slice(0, 2);
      const branchNames = topBranches.map((bg) => `\`${bg.branch}\``).join(' and ');
      workDescription += `. Most activity occurred on ${branchNames}`;
      if (branchGroups.length > 2) {
        workDescription += ` along with ${branchGroups.length - 2} other branches`;
      }
    }
    workDescription += '.';

    paragraphs.push(workDescription);

    // Second paragraph: Contributors and momentum
    let contributorInsight = '';
    if (topContributors.length > 0) {
      if (topContributors.length === 1) {
        contributorInsight = `${topContributor.author_name} led development with ${topContributor.commits} commits`;
      } else if (topContributors.length >= 2) {
        contributorInsight = `${topContributor.author_name} led with ${topContributor.commits} commits, followed by ${topContributors[1].author_name} (${topContributors[1].commits} commits)`;
        if (topContributors.length > 2) {
          contributorInsight += ` and ${topContributors.length - 2} other contributors`;
        }
      }

      // Add project momentum insight
      const avgCommitsPerDay = (totalCommits / 7).toFixed(1);
      contributorInsight += `. The team maintained steady momentum with ${avgCommitsPerDay} commits per day on average`;

      if (topCategory && topCategory.count > totalCommits * 0.4) {
        contributorInsight += `, showing strong focus on ${topCategory.name.toLowerCase()} work`;
      }
      contributorInsight += '.';

      paragraphs.push(contributorInsight);
    }

    return `<p>${paragraphs.join('</p><p>')}</p>`;
  }

  private formatSummaryForHTML(text: string): string {
    // Split text into sentences and group into paragraphs
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    const paragraphs: string[] = [];

    // Group sentences into paragraphs (2-3 sentences per paragraph)
    for (let i = 0; i < sentences.length; i += 2) {
      const paragraphSentences = sentences.slice(i, i + 2);
      if (paragraphSentences.length > 0) {
        const paragraph = paragraphSentences.join('. ').trim();
        if (paragraph.length > 0) {
          paragraphs.push(paragraph + (paragraph.endsWith('.') ? '' : '.'));
        }
      }
    }

    // Return as HTML paragraphs
    return paragraphs.length > 0 ? `<p>${paragraphs.join('</p><p>')}</p>` : `<p>${text}</p>`;
  }

  private buildEnhancedSummaryPrompt(data: WeeklySummaryData): string {
    const { totalCommits, categories, topContributors, branchGroups, dateRange } = data;

    // Build detailed categories breakdown
    const categoriesText = categories
      .filter((cat) => cat.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((cat) => `${cat.name}: ${cat.count} commits`)
      .join(', ');

    // Build comprehensive contributors list
    const contributorsText = topContributors
      .slice(0, 5)
      .map((contributor) => `${contributor.author_name} (${contributor.commits} commits)`)
      .join(', ');

    // Build detailed branches analysis
    const branchesText = branchGroups
      .slice(0, 4)
      .map((branch) => `${branch.branch} (${branch.count} commits)`)
      .join(', ');

    const startDate = dateRange.start.toLocaleDateString();
    const endDate = dateRange.end.toLocaleDateString();

    return `Please generate a professional and engaging weekly project summary for developers.

Project Activity (${startDate} to ${endDate}):
- Total commits: ${totalCommits}
- Work breakdown: ${categoriesText || 'Mixed development work'}
- Key contributors: ${contributorsText || 'Various team members'}
- Active branches: ${branchesText || 'Multiple development branches'}

Focus on:
- What major work happened (features added, bugs fixed, docs updated, refactors)
- Which branches were most active and what work they contained
- Who contributed significantly and in what areas
- Overall project momentum and development patterns
- Any notable trends or focuses this week

Format the response as 2-3 engaging paragraphs suitable for embedding in an HTML report.`;
  }

  private buildSummaryPrompt(data: WeeklySummaryData): string {
    const { totalCommits, categories, topContributors, branchGroups, dateRange } = data;

    // Build categories breakdown
    const categoriesText = categories
      .filter((cat) => cat.count > 0)
      .map((cat) => `${cat.name} = ${cat.count}`)
      .join(', ');

    // Build top contributors list (top 3)
    const contributorsText = topContributors
      .slice(0, 3)
      .map((contributor) => `${contributor.author_name} (${contributor.commits} commits)`)
      .join(', ');

    // Build active branches list (top 3)
    const branchesText = branchGroups
      .slice(0, 3)
      .map((branch) => `${branch.branch} (${branch.count} commits)`)
      .join(', ');

    const startDate = dateRange.start.toLocaleDateString();
    const endDate = dateRange.end.toLocaleDateString();

    return `Summarize this week's development activity in a professional, engaging tone. Write 2-3 sentences maximum.

Week: ${startDate} to ${endDate}
Total commits: ${totalCommits}
Categories: ${categoriesText || 'No categorized commits'}
Top contributors: ${contributorsText || 'No contributors'}
Active branches: ${branchesText || 'No branch data'}

Focus on the most significant development activities and improvements made this week.`;
  }
}
