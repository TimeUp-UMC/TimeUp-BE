import { prisma } from '../db.config.js';

export const findAutoDataById = async (userId) => {
  const now = new Date();
  const createdAtKST = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9시간 더하기
  const tomorrowStart = new Date(createdAtKST);
  tomorrowStart.setDate(createdAtKST.getDate() + 1);
  tomorrowStart.setUTCHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);
  // 1. 유저 기본 정보
  const user = await prisma.users.findUnique({
    where: { user_id: userId },
    select: {
      avg_ready_time: true,
      home_address: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 2. 해당 유저의 내일 스케줄 중 가장 빠른 것 하나
  const schedule = await prisma.schedules.findFirst({
    where: {
      user_id: userId,
      start_date: {
        gte: tomorrowStart,
        lte: tomorrowEnd,
      },
    },
    orderBy: {
      start_date: 'asc',
    },
    select: {
      schedule_id: true,
      name: true,
      start_date: true,
      place_name: true,
      address: true,
    },
  });

  // 3. 해당 유저의 최근 피드백 5개
  const feedbacks = await prisma.wakeup_feedbacks.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 5,
    select: {
      feedback_id: true,
      time_rating: true,
      wakeup_rating: true,
      created_at: true,
    },
  });

  // 4. 가장 선호하는 교통수단
  const preferredTransport = await prisma.user_preference_transport.findFirst({
    where: {
      user_id: userId,
    },
    orderBy: {
      priority: 'asc', // 가장 높은 우선순위 (1)
    },
    select: {
      transport: true,
    },
  });

  // time_rating 평균 계산
  let feedback;

  if (feedbacks.length === 0) {
    feedback = 3;
  } else {
    const total = feedbacks.reduce((acc, cur) => acc + cur.time_rating, 0);
    feedback = total / feedbacks.length;
  }

  return {
    ...user,
    schedule,
    preferredTransport: preferredTransport?.transport ?? 'bus',
    feedback,
  };
};

// 자동 알람 등록
export async function createAutoAlarmInDB(dto) {
  return await prisma.auto_alarms.create({
    data: {
      schedule_id: dto.schedule_id,
      wakeup_time: dto.wakeup_time,
      sound_id: dto.sound_id || 1, // 기본값 지정
      created_at: dto.created_at,
    },
  });
}

// 자동 알람 수정 + 비활성화
export const updateAutoAlarmInDB = async (ATalarmId, autoalarmData) => {
  const updatedAlarm = await prisma.auto_alarms.update({
    where: { auto_alarm_id: ATalarmId },
    data: autoalarmData,
  });
  return updatedAlarm;
};
export const findAutoAlarmById = async (ATalarmId) => {
  const Autoalarm = await prisma.auto_alarms.findUnique({
    where: { auto_alarm_id: ATalarmId },
  });
  return Autoalarm;
};

// 자동 알람 조회
export const getscheduleInDB = async (userId) => {
  const schedules = await prisma.schedules.findMany({
    where: { user_id: userId },
    select: { schedule_id: true },
  });
    return schedules;
};
export const getAutoAlarmInDB = async (scheduleId) => {
    const autoAlarms = await prisma.auto_alarms.findMany({
        where: { schedule_id: { in: scheduleId } }
    });
    const sortedAlarms = await prisma.auto_alarms.findMany({
        orderBy: { wakeup_time: 'asc' }
    });
    return sortedAlarms;
};
