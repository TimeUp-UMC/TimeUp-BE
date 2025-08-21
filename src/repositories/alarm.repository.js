import { schedule } from 'node-cron';
import { prisma } from '../db.config.js';

// 푸시 알람 토큰 저장
export const updatedPushTokenInDB = async (userId, token) => {
  return prisma.users.update({
    where: { user_id: userId },
    data: { push_token: token },
  });
};

// 현재 시각에 맞는 알람 찾기 - 기상 알람(TIME)
export const findWakeUpAlarmsDueNow = async () => {
  const now = new Date();
  now.setSeconds(0, 0);

  // 시간 범위
  const nowTimeStr = now.toTimeString().slice(0, 8); // "HH:mm:ss" (TIME)
  const oneMinuteLater = new Date(now.getTime() + 60000);
  const oneMinuteLaterStr = oneMinuteLater.toTimeString().slice(0, 8);

  // 요일 매핑
  const jsDay = now.getDay(); // 0 : 일 ~ 6 : 토

  return await prisma.$queryRaw`
    SELECT * FROM wakeup_alarms
    WHERE wakeup_time >= ${nowTimeStr}
      AND wakeup_time < ${oneMinuteLaterStr}
      AND day = ${jsDay}
  `;
};

// 자동 알람(UTC)
// 시간에 맞는 자동 알람 찾기
export const findAutoAlarmsDueNow = async () => {
  const utcNow = new Date();
  utcNow.setSeconds(0, 0);
  const oneMinuteLater = new Date(utcNow.getTime() + 60000);

  return prisma.auto_alarms.findMany({
    where: {
      is_active: true,
      wakeup_time: {
        gte: utcNow,
        lt: oneMinuteLater,
      },
    },
    select: {
      auto_alarm_id: true,
      schedule_id: true,
      wakeup_time: true
    }
  });
};
// 자동 알람의 scheduleID 조회
export const findScheduleDueNow = async (ATalarms) => {
  return prisma.schedules.findMany({
    where: {
      schedule_id: ATalarms.schedule_id,
    },
  });
};

// 내 알람(UTC)
export const findMyAlarmsDueNow = async () => {
  const utcNow = new Date();
  utcNow.setSeconds(0, 0);
  const oneMinuteLater = new Date(utcNow.getTime() + 60000);
  
  return prisma.my_alarms.findMany({
    where: {
      is_active: true,
      my_alarm_time: {
        gte: utcNow,
        lt: oneMinuteLater,
      },
    },
  });
};

// 일정 알람(UTC)
export const findScheduleAlarmsDueNow = async () => {
  const utcNow = new Date();
  utcNow.setSeconds(0, 0);
  const oneMinuteLater = new Date(utcNow.getTime() + 60 * 1000);

  // 오늘 0시 ~ 모레 0시
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  const dayAfterTomorrowUTC = new Date(todayUTC.getTime() + 48 * 60 * 60 * 1000);

  const schedules = await prisma.schedules.findMany({
    where: {
      is_reminding: true,
      start_date: {
        gte: todayUTC,
        lt: dayAfterTomorrowUTC, // 내일 일정까지 포함 : 1일 전 알람을 위해
      },
    },
  });
  // remind_rules 포함
  const schedulesWithRules = await Promise.all(
    schedules.map(async (schedule) => {
      const remindRules = await prisma.remind_rules.findMany({
        where: { schedule_id: schedule.schedule_id },
      });
      return { ...schedule, remind_rules: remindRules };
    })
  );
  // remind_rulse 있는 일정 필터링
  const dueAlarms = schedulesWithRules.filter(schedule => {
    return schedule.remind_rules?.some(rule => {
      const remindTime = new Date(
        schedule.start_date.getTime() - rule.remind_at * 60000
      );
      return remindTime >= utcNow && remindTime <= oneMinuteLater;
    });
  });
  return dueAlarms;
};

// 자동 알람 활성화 여부
// check_time 기준 사용자 조회 (TIME)
export const findUsersDueNow = async () => {
  const now = new Date();
  now.setSeconds(0, 0);

  // 시간 범위
  const nowTimeStr = now.toTimeString().slice(0, 8); // "HH:mm:ss" (TIME)
  const oneMinuteLater = new Date(now.getTime() + 60000);
  const oneMinuteLaterStr = oneMinuteLater.toTimeString().slice(0, 8);

  return await prisma.$queryRaw`
    SELECT * FROM users
    WHERE alarm_check_time >= ${nowTimeStr}
      AND alarm_check_time < ${oneMinuteLaterStr}
  `;
};
// 자동 알람이 있는 사용자 조회(UCT)
export const findAutoAlarmsTomorrow = async (userId) => {
  const now = new Date();

  // 내일 0시 ~ 24시 (KST)
  const tomorrowKST = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowKST.setHours(0, 0, 0, 0);

  // UTC 변환
  const tomorrowStartUTC = new Date(tomorrowKST.getTime() - 9 * 60 * 60000);
  const tomorrowEndUTC = new Date(tomorrowStartUTC.getTime() + 24 * 60 * 60 * 1000);

  return await prisma.$queryRaw`
    SELECT at.*, s.user_id
    FROM auto_alarms at
    JOIN schedules s ON at.schedule_id = s.schedule_id
    WHERE at.wakeup_time >= ${tomorrowStartUTC}
      AND at.wakeup_time < ${tomorrowEndUTC}
      AND at.is_active = true
  `;
};
