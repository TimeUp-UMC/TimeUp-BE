import { prisma } from '../db.config.js';
import { fetchGoogleDailySchedule_alarm } from '../services/google-calendar.service.js';

export const findAutoDataById = async (userObj) => {
  const userId = userObj.userId;
  const now = new Date();
  // KST 기준 내일 00:00:00
  const DateKST = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const tomorrowStartKST = new Date(DateKST);
  tomorrowStartKST.setDate(DateKST.getDate() + 1);
  tomorrowStartKST.setHours(0, 0, 0, 0);

  // UTC 변환 (DB 저장용)
  const dbtomorrowStart = new Date(
    tomorrowStartKST.getTime() - 9 * 60 * 60 * 1000
  );
  const dbtomorrowEnd = new Date(
    tomorrowStartKST.getTime() + 24 * 60 * 60 * 1000 - 1
  );

  // 유저 기본 정보

  console.log('userId:', userId);

  const user = await prisma.users.findUnique({
    where: { user_id: Number(userId) },
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
  const yyyyMmDd = dbtomorrowStart.toISOString().split('T')[0]; // YYYY-MM-DD
  const googleSchedules = await fetchGoogleDailySchedule_alarm(
    userId,
    yyyyMmDd
  );

  // 가장 빠른 일정 하나만 선택
  let googleSchedule = null;
  if (googleSchedules.length > 0) {
    googleSchedules.sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );
    googleSchedule = googleSchedules[0];
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
export async function createAutoAlarmInDB(user_id, dto) {
  // 동일한 유저 + 동일한 wakeup_time 있는지 확인
  const existingAlarm = await prisma.auto_alarms.findFirst({
    where: {
      user_id: dto.user_id,
      wakeup_time: dto.wakeup_time,
    },
  });

  if (existingAlarm) {
    console.log(
      `이미 존재하는 auto alarm: user_id=${dto.user_id}, wakeup_time=${dto.wakeup_time}`
    );
    return existingAlarm; // 기존 알람 리턴 (새로 추가 안 함)
  }

  console.log('auto alarm create : ');
  console.log(dto);
  return await prisma.auto_alarms.create({
    data: {
      user_id: dto.user_id,
      schedule_id: typeof dto.schedule_id === 'string' ? 0 : dto.schedule_id,
      wakeup_time: dto.wakeup_time,
      sound_id: dto.sound_id,
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
export const getAutoAlarmInDB = async (user_id) => {
  const now = new Date();

  // 한국 시간(KST)으로 변환
  const nowKST = new Date(now.getTime());

  let startKST = new Date(nowKST);
  let endKST = new Date(nowKST);

  if (nowKST.getHours() < 12) {
    // 정오 이전 → 오늘 00:00 ~ 11:59:59
    startKST.setHours(0, 0, 0, 0);
    endKST.setHours(11, 59, 59, 999);
  } else {
    // 정오 이후 → 내일 00:00 ~ 23:59:59
    startKST.setDate(startKST.getDate() + 1);
    startKST.setHours(0, 0, 0, 0);
    endKST = new Date(startKST);
    endKST.setHours(23, 59, 59, 999);
  }

  // UTC로 변환 (DB 저장 기준)
  return prisma.auto_alarms.findMany({
    where: {
      user_id: user_id,
      wakeup_time: {
        gte: startKST,
        lte: endKST,
      },
    },
    orderBy: {
      wakeup_time: 'asc',
    },
  });
};
