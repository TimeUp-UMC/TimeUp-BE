import { prisma } from '../db.config.js';

export const findImportantSchedulesByMonth = async (userId, year, month) => {
  const start_date = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end_date = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // 해당 월의 마지막 날

  const schedules = await prisma.schedules.findMany({
    where: {
      user_id: userId,
      is_important: true,
      start_date: {
        gte: start_date,
        lte: end_date,
      },
    },
    orderBy: {
      start_date: 'asc',
    },
    select: {
      schedule_id: true,
      name: true,
      start_date: true,
      end_date: true,
      color: true,
      place_name: true,
    },
  });

  // 필드명 변환
  return schedules.map(({ schedule_id, ...rest }) => ({
    scheduleId: schedule_id,
    ...rest,
  }));
};
