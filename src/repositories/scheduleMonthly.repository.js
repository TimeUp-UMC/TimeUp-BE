import { prisma } from '../db.config.js';

// 주어진 사용자 ID와 연/월에 해당하는 일정들을 DB에서 조회하는 레포지토리
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
      id: true,
      color: true,
      start_date: true,
    },
  });

  return schedules;
};
