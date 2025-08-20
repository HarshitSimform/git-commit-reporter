import { GitCommit, CommitCategory } from "../types";

export function categorizeCommit(message: string): string {
  const normalizedMessage = message.toLowerCase().trim();

  if (
    normalizedMessage.startsWith("feat:") ||
    normalizedMessage.startsWith("feature:") ||
    normalizedMessage.startsWith("feat ") ||
    normalizedMessage.startsWith("feature ")
  ) {
    return "Feature";
  }
  if (
    normalizedMessage.startsWith("fix:") ||
    normalizedMessage.startsWith("bugfix:") ||
    normalizedMessage.startsWith("fix ") ||
    normalizedMessage.startsWith("bugfix ")
  ) {
    return "Fix";
  }
  if (
    normalizedMessage.startsWith("docs:") ||
    normalizedMessage.startsWith("doc:") ||
    normalizedMessage.startsWith("docs ") ||
    normalizedMessage.startsWith("doc ")
  ) {
    return "Docs";
  }
  if (
    normalizedMessage.startsWith("refactor:") ||
    normalizedMessage.startsWith("refact:") ||
    normalizedMessage.startsWith("refactor ") ||
    normalizedMessage.startsWith("refact ")
  ) {
    return "Refactor";
  }
  if (
    normalizedMessage.startsWith("style:") ||
    normalizedMessage.startsWith("style ")
  ) {
    return "Style";
  }
  if (
    normalizedMessage.startsWith("test:") ||
    normalizedMessage.startsWith("tests:") ||
    normalizedMessage.startsWith("test ") ||
    normalizedMessage.startsWith("tests ")
  ) {
    return "Test";
  }
  if (
    normalizedMessage.startsWith("chore:") ||
    normalizedMessage.startsWith("chore ")
  ) {
    return "Chore";
  }
  if (
    normalizedMessage.startsWith("perf:") ||
    normalizedMessage.startsWith("performance:") ||
    normalizedMessage.startsWith("perf ") ||
    normalizedMessage.startsWith("performance ")
  ) {
    return "Performance";
  }
  if (
    normalizedMessage.startsWith("update:") ||
    normalizedMessage.startsWith("upd:") ||
    normalizedMessage.startsWith("update ") ||
    normalizedMessage.startsWith("upd ")
  ) {
    return "Update";
  }

  return "Other";
}

export function aggregateCommitsByCategory(
  commits: GitCommit[]
): CommitCategory[] {
  const categoryMap = new Map<string, number>();

  // Categorize all commits
  commits.forEach((commit) => {
    const category = categorizeCommit(commit.message);
    commit.category = category;
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  // Define colors for each category
  const categoryColors: { [key: string]: string } = {
    Feature: "#4CAF50",
    Fix: "#F44336",
    Docs: "#2196F3",
    Refactor: "#FF9800",
    Style: "#9C27B0",
    Test: "#00BCD4",
    Chore: "#795548",
    Performance: "#CDDC39",
    Update: "#E91E63",
    Other: "#9E9E9E",
  };

  // Convert map to array of CommitCategory objects
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      count,
      color: categoryColors[name] || "#9E9E9E",
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
