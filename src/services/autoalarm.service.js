import { updateAutoAlarmInDB, getscheduleInDB, getAutoAlarmInDB } from "../repositories/autoalarm.repository.js";
import { prisma } from "../db.config.js";

// 자동 알람 수정 + 비활성화
export const updatedAutoAlarmService = async (ATalarmId, dto) => {
    const updateAutoAlarm = await updateAutoAlarmInDB(ATalarmId, dto);
    return updateAutoAlarm;
}

// 자동 알람 조회
export const getAutoAlarmByUserId = async (userId) => {
  const schedules = await getscheduleInDB(userId);
  const scheduleId = schedules.map(s => s.schedule_id);

  const autoAlarm = await getAutoAlarmInDB(scheduleId);
  return autoAlarm;
};