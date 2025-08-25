import './config';
import { generateDailyReport } from './reporters/daily';
import { generateWeeklyReport } from './reporters/weekly';
import * as fs from 'fs/promises';

async function main() {
  try {
    // Generate reports
    const dailyReport = await generateDailyReport();
    const weeklyReport = await generateWeeklyReport();

    // Save reports
    await fs.writeFile('daily-report.html', dailyReport);
    await fs.writeFile('weekly-report.html', weeklyReport);

    console.log('Reports generated successfully!');
  } catch (error) {
    console.error('Error generating reports:', error);
  }
}

main();
