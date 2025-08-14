import { prisma } from '../db.config.js';

// 날짜 범위는 월 시작 ~ 다음 달 1일 미만까지로 설정
export const findSchedulesByMonth = async (userId, year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const schedules = await prisma.schedules.findMany({
    where: {
      user_id: userId,
      start_date: {
        gte: start,
        lt: end,
      },
    },
    select: {
      schedule_id: true,
      color: true,
      start_date: true,
    },
  });

  return schedules;
};
