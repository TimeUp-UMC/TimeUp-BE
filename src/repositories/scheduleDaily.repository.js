import { prisma } from '../db.config.js';
import { utcToKstDate } from '../utils/dateRange.js';

export const getSchedulesByDate = async (userId, start_date, end_date) => {
  const rows = await prisma.schedules.findMany({
    where: {
      user_id: userId,
      start_date: { lte: end_date },
      end_date:   { gte: start_date },
    },
    orderBy: { start_date: 'asc' },
    select: {
      schedule_id: true,
      name: true,
      start_date: true,
      end_date: true,
      color: true,
    },
  });

  return rows.map(r => ({
    ...r,
    start_date: utcToKstDate(r.start_date),
    end_date: utcToKstDate(r.end_date),
  }));
};
