import { prisma } from '../db.config.js';

// 푸시 알람 토큰 저장
export const updatedPushTokenInDB = async (userId, token) => {
  return prisma.users.update({
    where: { user_id: userId },
    data: { push_token: token },
  });
};

// 현재 시각에 맞는 알람 찾기 - 기상 알람
export const findWakeUpAlarmsDueNow = async () => {
  const now = new Date();
  now.setSeconds(0, 0); // 밀리초 제거
  const oneMinuteLater = new Date(now.getTime() + 60000);

  return prisma.wakeup_alarms.findMany({
    where: {
      is_active: true,
      wakeup_time: {
        gte: now,
        lt: oneMinuteLater,
      },
    },
    include: { user: true },
  });
};

// 자동 알람
export const findAutoAlarmsDueNow = async () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const oneMinuteLater = new Date(now.getTime() + 60000);

  return prisma.auto_alarms.findMany({
    where: {
      is_active: true,
      wakeup_time: {
        gte: now,
        lt: oneMinuteLater,
      },
    },
  });
};

// 내 알람
export const findMyAlarmsDueNow = async () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const oneMinuteLater = new Date(now.getTime() + 60000);

  return prisma.my_alarms.findMany({
    where: {
      is_active: true,
      my_alarm_time: {
        gte: now,
        lt: oneMinuteLater,
      },
    },
    include: { user: true },
  });
};

// 일정 알람
export const findScheduleAlarmsDueNow = async () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const oneMinuteLater = new Date(now.getTime() + 60000);

  return prisma.remind_rules.findMany({
    where: {
      is_active: true,
      remind_at: {
        gte: now,
        lt: oneMinuteLater,
      },
    },
    include: { user: true },
  });
};
