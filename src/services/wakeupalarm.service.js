import { updateWakeUpAlarmInDB } from "../repositories/wakeupalarm.repository.js";
import { getWakeUpAlarmInDB } from "../repositories/wakeupalarm.repository.js";

// 기상 알람 등록
/*
export const addWakeUpAlarmService = async (dto) => {
  const newAlarm = await addWakeUpAlarmToDB(dto);
  return newAlarm;
};
*/

// 기상 알람 수정 + 비활성화
export const updatedWakeUpAlarmService = async (WUalarmId, dto) => {
  const updateWakeUpAlarm = await updateWakeUpAlarmInDB(WUalarmId, dto);
  return updateWakeUpAlarm;
}

// 기상 알람 조회
export const getWakeUpAlarmByUserId = async (userId) => {
  const wakeUpAlarm = await getWakeUpAlarmInDB(userId);
  return wakeUpAlarm;
}