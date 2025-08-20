import * as Handlebars from "handlebars";
import { ReportData, ReportOptions, PullRequest } from "../types";
import * as fs from "fs/promises";
import * as path from "path";
import { generateCategoryChartData } from "../utils/categories";
import { formatPRStatus, getPRStateColor } from "../utils/pr-analysis";

export class ReportService {
  constructor() {
    this.registerHelpers();
  }

  private registerHelpers() {
    // Helper to get category color
    Handlebars.registerHelper("getCategoryColor", (category: string) => {
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
      return categoryColors[category] || "#9E9E9E";
    });

    // Helper to format dates
    Handlebars.registerHelper("formatDate", (date: Date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    });

    // Helper to get PR status text
    Handlebars.registerHelper("getPRStatus", (pr: PullRequest) => {
      return formatPRStatus(pr);
    });

    // Helper to get PR state color
    Handlebars.registerHelper("getPRStateColor", (pr: PullRequest) => {
      return getPRStateColor(pr);
    });
  }

  async generateReport(
    data: ReportData,
    options: ReportOptions
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      `${options.format === "html" ? "report.hbs" : "report.txt.hbs"}`
    );

    const template = await fs.readFile(templatePath, "utf-8");
    const compiled = Handlebars.compile(template);

    // Enhance data with chart information and percentages
    const enhancedData = { ...data };

    if (data.categories && data.categories.length > 0) {
      // Add percentages to categories
      enhancedData.categories = data.categories.map((category) => ({
        ...category,
        percentage: ((category.count / data.totalCommits) * 100).toFixed(1),
      }));

      // Generate chart data for Chart.js
      const chartData = generateCategoryChartData(data.categories);
      (enhancedData as any).chartData = JSON.stringify(chartData);
    }

    return compiled(enhancedData);
  }
}
