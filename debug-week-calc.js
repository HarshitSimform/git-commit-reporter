// Quick debug script to understand the week calculation
const { BranchTrendsService } = require('./dist/services/branch-trends');
const { getDateRange } = require('./dist/utils/date');

const branchTrendsService = new BranchTrendsService();
const { start, end } = getDateRange(7);

console.log('Date Range:', { start, end });
console.log('Start day:', start.toLocaleDateString('en-US', { weekday: 'long' }));
console.log('End day:', end.toLocaleDateString('en-US', { weekday: 'long' }));

// Test the formatDateForTrends method
const testDate = new Date('2025-08-25');
console.log('\nTesting date formatting:');
console.log('Test date (Aug 25):', testDate.toISOString());
console.log('Day of week:', testDate.toLocaleDateString('en-US', { weekday: 'long' }));

// We need to test the private methods, so let's recreate the logic
function formatDateForTrends(date, isWeekly) {
  if (isWeekly) {
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  } else {
    return date.toISOString().split('T')[0];
  }
}

function generateDateRange(startDate, endDate, isWeekly) {
  const dates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (isWeekly) {
      const monday = new Date(currentDate);
      const day = monday.getDay();
      const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
      monday.setDate(diff);
      dates.push(monday.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return [...new Set(dates)];
}

const weeklyFormatted = formatDateForTrends(testDate, true);
console.log('Formatted for trends (weekly):', weeklyFormatted);

const dateRange = generateDateRange(start, end, true);
console.log('Generated date range:', dateRange);

console.log('\nDoes formatted date match range?', dateRange.includes(weeklyFormatted));
