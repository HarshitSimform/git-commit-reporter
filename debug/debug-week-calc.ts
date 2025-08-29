// Quick debug script to understand the week calculation
import { BranchTrendsService } from '../src/services/branch-trends';
import { getDateRange } from '../src/utils/date';

async function debugWeekCalculation(): Promise<void> {
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

  // Recreate the logic to test private methods
  function formatDateForTrends(date: Date, isWeekly: boolean): string {
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

  function generateDateRange(startDate: Date, endDate: Date, isWeekly: boolean): string[] {
    const dates: string[] = [];
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
}

// Run the debug function
debugWeekCalculation().catch(console.error);
