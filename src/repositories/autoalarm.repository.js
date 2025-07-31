import { prisma } from "../db.config.js";

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
        where: { schedule_id: { in: scheduleId }}
    });
    return autoAlarm;
};