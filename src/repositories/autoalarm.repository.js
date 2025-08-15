import { prisma } from '../db.config.js';
import { fetchGoogleDailySchedule_alarm } from '../services/google-calendar.service.js';

export const findAutoDataById = async (userId) => {
  const now = new Date();
  const createdAtKST = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9시간 더하기
  const tomorrowStart = new Date(createdAtKST);
  tomorrowStart.setDate(createdAtKST.getDate() + 1);
  tomorrowStart.setUTCHours(0, 0, 0, 0);
  const dbtomorrowStart = new Date(
    tomorrowStart.getTime() - 9 * 60 * 60 * 1000
  ); // 9시간 빼기 -> UTC 기준
  const dbtomorrowEnd = new Date(
    dbtomorrowStart.getTime() + 24 * 60 * 60 * 1000 - 1
  ); // -> UTC 기준

  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);
  // 유저 기본 정보
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

  // 해당 유저의 내일 스케줄 중 가장 빠른 것 하나
  const dbSchedule = await prisma.schedules.findFirst({
    where: {
      user_id: userId,
      start_date: {
        gte: dbtomorrowStart,
        lte: dbtomorrowEnd,
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
  // 구글 캘린더 스케줄
  const yyyyMmDd = tomorrowStart.toISOString().split('T')[0]; // YYYY-MM-DD
  const googleSchedules = await fetchGoogleDailySchedule_alarm(
    userId,
    yyyyMmDd
  );

  // 내일 범위에 속하는 구글 일정만 필터
  const tomorrowSchedules = googleSchedules.filter((s) => {
    const startDate = new Date(s.start_date);
    return startDate >= dbtomorrowStart && startDate <= dbtomorrowEnd;
  });

  // 가장 빠른 일정 하나만 선택
  let googleSchedule = null;
  if (tomorrowSchedules.length > 0) {
    tomorrowSchedules.sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );
    googleSchedule = tomorrowSchedules[0];
  }

  // DB vs Google 중 더 빠른 일정 선택
  let schedule = null;
  if (dbSchedule && googleSchedule) {
    schedule =
      new Date(dbSchedule.start_date) < new Date(googleSchedule.start_date)
        ? dbSchedule
        : googleSchedule;
  } else {
    schedule = dbSchedule || googleSchedule;
  }

  // 해당 유저의 최근 피드백 5개
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

  // 가장 선호하는 교통수단 순서대로 배열 조회
  const preferredTransports = await prisma.user_preference_transport.findMany({
    where: {
      user_id: userId,
    },
    orderBy: {
      priority: 'asc',
    },
    select: {
      transport: true,
    },
  });

  const transportList = preferredTransports.map((t) => t.transport);

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
    preferredTransport: transportList.length > 0 ? transportList : ['bus'],
    feedback,
  };
};

// 자동 알람 등록
export async function createAutoAlarmInDB(dto) {
  return await prisma.auto_alarms.create({
    data: {
      schedule_id: isNaN(Number(dto.schedule_id)) ? 0 : Number(dto.schedule_id),
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
  const autoAlarm = await prisma.auto_alarms.findMany({
    where: { schedule_id: { in: scheduleId } },
  });
  return autoAlarm;
};
