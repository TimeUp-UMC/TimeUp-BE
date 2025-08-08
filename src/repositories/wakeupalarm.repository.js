import { prisma } from "../db.config.js";

// 기상 알람 등록
/*
export const addWakeUpAlarmToDB = async (WakeUpalarmData) => {
  const newAlarm = await pool.wakeup_alarms.create({
    data: WakeUpalarmData,
  });
  return newAlarm;
};*/

// 기상 알람 수정 + 비활성화
export const updateWakeUpAlarmInDB = async (WUalarmId, WakeUpalarmData) => {
  const updatedWakeUpAlarm = await prisma.wakeup_alarms.update({
    where: { wakeup_alarm_id: WUalarmId },
    data: WakeUpalarmData,
  })
  return updatedWakeUpAlarm;
}
export const findWakeUpAlarmById = async (WUalarmId) => {
  const WakeUpAlarm = await prisma.wakeup_alarms.findUnique({
    where: { wakeup_alarm_id: WUalarmId }
  });
  return WakeUpAlarm;
}

// 기상 알람 조회
export const getWakeUpAlarmInDB = async (userId) => {
  const getWakeUpAlarm = await prisma.wakeup_alarms.findMany({
    where: { user_id: userId },
  });
  return getWakeUpAlarm;
}