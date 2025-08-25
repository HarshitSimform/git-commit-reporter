````markdown
# git-commit-reporter

A Git commit reporter tool that generates daily and weekly activity reports based on commits in a Git repository. This tool helps developers and teams keep track of their contributions over time.

## Features

- **Daily Reports**: Generates HTML reports summarizing commits from the last day.
- **Weekly Reports**: Generates HTML reports summarizing commits from the last week.
- **Commit Categories Breakdown**: Automatically categorizes commits and displays visual charts showing the distribution of commit types.
- **Top Contributors Leaderboard**: Shows a ranked table of contributors with their commit counts and 🥇🥈🥉 badges for top performers.
- **Interactive Charts**: Uses Chart.js to create beautiful pie/doughnut charts for category visualization.
- **AI-Powered Weekly Summaries**: Uses OpenAI to generate natural language summaries of weekly activity.
- **GitHub Integration**: Fetches PR and review data from GitHub for comprehensive reporting.
- **Branch Grouping**: Organizes commits by branch for better visibility.
- **Centralized Configuration**: Uses dotenv for environment variable management.
- **Customizable**: Easily modify the report formats and data included in the reports.

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Then edit the `.env` file with your credentials:

```env
# OpenAI API Key for AI-powered weekly summaries (optional)
OPENAI_API_KEY=your_openai_api_key_here

# GitHub Personal Access Token for PR/Review data (optional)
GITHUB_TOKEN=your_github_token_here

# Application Environment
NODE_ENV=development

# Logging Level (debug, info, warn, error)
LOG_LEVEL=info
```

### Configuration Options

- **OPENAI_API_KEY**: Optional for high-quality AI summaries. Get your key from [OpenAI Platform](https://platform.openai.com/api-keys).
- **HUGGINGFACE_TOKEN**: Optional for free AI summaries via Hugging Face. Get your token from [Hugging Face](https://huggingface.co/settings/tokens). Works without token on free tier with rate limits.
- **GITHUB_TOKEN**: Required for GitHub PR/review integration. Create a [Personal Access Token](https://github.com/settings/tokens) with `repo` permissions.
- **NODE_ENV**: Application environment (development, production, test)
- **LOG_LEVEL**: Logging verbosity level

### AI Summary Providers

The application supports multiple AI providers with automatic fallback:

1. **OpenAI (Primary)** - High quality summaries (requires paid API key)
2. **Hugging Face (Fallback)** - Free AI summaries (works with free tier)
3. **Basic Summary (Failsafe)** - Generated locally if no AI service is available

The system will automatically try providers in order and fallback gracefully if any service fails.

### Check Configuration Status

You can verify your configuration setup with:

```bash
npm run config:check
```

### Commit Categories

The tool automatically categorizes commits based on their message prefixes (supports both `:` and space separators):

- **Feature**: `feat:`, `feature:`, `feat `, `feature `
- **Fix**: `fix:`, `bugfix:`, `fix `, `bugfix `
- **Docs**: `docs:`, `doc:`, `docs `, `doc `
- **Refactor**: `refactor:`, `refact:`, `refactor `, `refact `
- **Style**: `style:`, `style `
- **Test**: `test:`, `tests:`, `test `, `tests `
- **Chore**: `chore:`, `chore `
- **Performance**: `perf:`, `performance:`, `perf `, `performance `
- **Update**: `update:`, `upd:`, `update `, `upd `
- **Other**: Any commit that doesn't match the above patterns

### Top Contributors Leaderboard

The tool generates a leaderboard showing:

- **Ranking**: Contributors sorted by commit count (descending)
- **Badges**: 🥇 🥈 🥉 for top 3 contributors
- **Contributor Info**: Name and email address
- **Commit Count**: Total commits made by each contributor
- **Top 10 Limit**: Shows up to 10 top contributors per report

## Installation

To install the project, clone the repository and run the following command:

```bash
npm install
```

## Usage

To generate a report, run the following command:

```bash
npm start -- [options]
```

### Options

- `--daily`: Generate a daily report.
- `--weekly`: Generate a weekly report.

## Development

To run tests, use the following command:

```bash
npm test
```

To build the project:

```bash
npm run build
```

To run in development mode:

```bash
npm run dev
```

## Project Structure

```
src/
├── index.ts              # Main entry point
├── reporters/            # Report generators
│   ├── daily.ts         # Daily report generator
│   └── weekly.ts        # Weekly report generator
├── services/            # Core services
│   ├── git.ts          # Git operations
│   └── report.ts       # Report generation
├── templates/           # HTML templates
│   └── report.hbs      # Handlebars template
├── types/              # TypeScript type definitions
│   └── index.ts
└── utils/              # Utility functions
    ├── categories.ts   # Commit categorization
    ├── leaderboard.ts  # Contributor ranking
    ├── date.ts        # Date utilities
    └── format.ts      # Formatting utilities
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
````
