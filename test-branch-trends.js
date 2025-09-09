#!/usr/bin/env node
const path = require('path');

// Import the services
const { GitService } = require('./dist/services/git');
const { BranchTrendsService } = require('./dist/services/branch-trends');
const { getDateRange } = require('./dist/utils/date');

async function testBranchTrends() {
  console.log('🔍 Testing Branch Activity Trends Feature...\n');

  try {
    // Initialize services
    const gitService = new GitService(); // Use default repo path
    const branchTrendsService = new BranchTrendsService();

    // Test both daily and weekly date ranges
    console.log('📅 Date Range Testing:');

    // Manual 7-day range (like our previous test)
    const manualEnd = new Date();
    const manualStart = new Date();
    manualStart.setDate(manualEnd.getDate() - 7);
    console.log(`  Manual 7-day range: ${manualStart.toISOString()} to ${manualEnd.toISOString()}`);

    // Using actual date utility from the project
    const { start: utilStart, end: utilEnd } = getDateRange(7);
    console.log(`  Utility 7-day range: ${utilStart.toISOString()} to ${utilEnd.toISOString()}`);
    console.log();

    // Test commits with both ranges
    console.log('📋 Testing commit fetching with both ranges...');
    const manualCommits = await gitService.getCommits(manualStart, manualEnd);
    const utilCommits = await gitService.getCommits(utilStart, utilEnd);

    console.log(`  Manual range: ${manualCommits.length} commits`);
    console.log(`  Utility range: ${utilCommits.length} commits`);
    console.log();

    if (utilCommits.length === 0) {
      console.log('❌ No commits found with utility date range!');
      console.log('🔧 This explains why Branch Trends shows zero data in reports.\n');

      // Let's try different ranges
      console.log('🔍 Testing different date ranges:');
      for (let days of [1, 3, 7, 14, 30]) {
        const { start: testStart, end: testEnd } = getDateRange(days);
        const testCommits = await gitService.getCommits(testStart, testEnd);
        console.log(`  Last ${days} days: ${testCommits.length} commits`);
      }
      console.log();
    }

    // Test weekly trend processing specifically
    console.log('� Testing Weekly Branch Trends Processing...');
    const weeklyTrendData = branchTrendsService.getBranchCommitTrends(
      utilCommits,
      utilStart,
      utilEnd,
      true,
    );
    console.log('  Weekly trend data branches:', Object.keys(weeklyTrendData));

    for (const [branch, dates] of Object.entries(weeklyTrendData)) {
      console.log(`  ${branch}:`, dates);
    }
    console.log();

    // Test weekly chart data
    const weeklyChartData = branchTrendsService.prepareBranchTrendChartData(
      weeklyTrendData,
      utilStart,
      utilEnd,
      true,
    );
    console.log('  Weekly chart data:');
    console.log('    Labels:', weeklyChartData.labels);
    console.log('    Datasets:');
    weeklyChartData.datasets.forEach((dataset) => {
      console.log(`      ${dataset.label}: [${dataset.data.join(', ')}]`);
    });
    console.log();

    // Compare with daily processing
    console.log('📈 Comparing with Daily Processing...');
    const dailyTrendData = branchTrendsService.getBranchCommitTrends(
      utilCommits,
      utilStart,
      utilEnd,
      false,
    );
    const dailyChartData = branchTrendsService.prepareBranchTrendChartData(
      dailyTrendData,
      utilStart,
      utilEnd,
      false,
    );

    console.log('  Daily chart data:');
    console.log('    Labels:', dailyChartData.labels.slice(0, 5), '... (truncated)');
    console.log('    Datasets:');
    dailyChartData.datasets.forEach((dataset) => {
      const nonZeroData = dataset.data.filter((d) => d > 0);
      console.log(
        `      ${dataset.label}: ${nonZeroData.length} non-zero days, max: ${Math.max(...dataset.data)}`,
      );
    });
    console.log();

    // Summary
    console.log('🎯 Diagnosis:');
    if (utilCommits.length === 0) {
      console.log('  ❌ Main issue: getDateRange(7) returns no commits');
      console.log('  🔧 Fix needed: Adjust date range calculation');
    } else if (Object.keys(weeklyTrendData).length === 0) {
      console.log('  ❌ Issue: Weekly trend processing fails');
    } else if (weeklyChartData.datasets.every((d) => d.data.every((v) => v === 0))) {
      console.log('  ❌ Issue: Weekly chart shows all zeros');
      console.log('  🔧 Likely cause: Week grouping logic problem');
    } else {
      console.log('  ✅ Branch Activity Trends should be working!');
    }
  } catch (error) {
    console.error('❌ Error testing branch trends:', error);
    console.log('\n🔧 Potential fixes:');
    console.log('  1. Run "npm run build" to compile TypeScript');
    console.log('  2. Check if you have recent commits in your repository');
    console.log('  3. Verify the repository path is correct');
  }
}

testBranchTrends();
