import { startOfDay, endOfDay, subDays } from "date-fns";

export function getDateRange(days: number) {
  const end = endOfDay(new Date());
  const start = startOfDay(subDays(end, days - 1));

  return { start, end };
}
