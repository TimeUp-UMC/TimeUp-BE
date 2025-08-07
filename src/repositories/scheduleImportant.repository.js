import { prisma } from '../db.config.js';

export const findImportantSchedulesByMonth = async (userId, year, month) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // 해당 월의 마지막 날

  return await prisma.schedules.findMany({
    where: {
      user_id: userId,
      is_important: true,
      start_date: {
        gte: startDate,
        lte: endDate,
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
};

