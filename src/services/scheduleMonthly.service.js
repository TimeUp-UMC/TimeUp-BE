import { findSchedulesByMonth } from '../repositories/scheduleMonthly.repository.js';

/// 사용자 ID와 연/월을 받아 해당 월의 일정을 날짜별로 색상 정보와 함께 그룹핑하는 서비스
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
