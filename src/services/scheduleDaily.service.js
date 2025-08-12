  import { getKSTDateRange } from '../utils/dateRange.js';
  import { getSchedulesByDate } from '../repositories/scheduleDaily.repository.js';

  export const getDailySchedule = async (userId, date) => {
    const { start, end } = getKSTDateRange(date);
    return await getSchedulesByDate(userId, start, end);
  };