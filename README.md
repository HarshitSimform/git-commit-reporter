````markdown
# git-commit-reporter

A Git commit reporter tool that generates daily and weekly activity reports based on commits in a Git repository. This tool helps developers and teams keep track of their contributions over time.

## Features

- **Daily Reports**: Generates HTML reports summarizing commits from the last day.
- **Weekly Reports**: Generates HTML reports summarizing commits from the last week.
- **Commit Categories Breakdown**: Automatically categorizes commits and displays visual charts showing the distribution of commit types.
- **Top Contributors Leaderboard**: Shows a ranked table of contributors with their commit counts and 🥇🥈🥉 badges for top performers.
- **Interactive Charts**: Uses Chart.js to create beautiful pie/doughnut charts for category visualization.
- **Customizable**: Easily modify the report formats and data included in the reports.

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
