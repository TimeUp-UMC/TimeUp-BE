import { findSchedulesByMonth } from '../repositories/scheduleMonthly.repository.js';

export const getMonthlySchedule = async (userId, year, month) => {
  const schedules = await findSchedulesByMonth(userId, year, month);

  const grouped = {};

  schedules.forEach(schedule => {
    const day = new Date(schedule.start_date).getDate();

    if (!grouped[day]) {
      grouped[day] = [];
    }

    grouped[day].push({
      id: schedule.id,
      color: schedule.color,
    });
  });

  return grouped;
};
