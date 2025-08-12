import { prisma } from '../db.config.js';

export const getSchedulesByDate = async (userId, startDate, endDate) => {
  return await prisma.schedules.findMany({
    where: {
      user_id: userId,
      start_date: {
        lte: endDate,
      },
        end_date: {
          gte: startDate,
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
    },
  });
};
