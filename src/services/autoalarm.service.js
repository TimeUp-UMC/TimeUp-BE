import { updateAutoAlarmInDB } from "../repositories/autoalarm.repository.js";

// 자동 알람 수정 + 비활성화
export const updatedAutoAlarmService = async (ATalarmId, dto) => {
    const updateAutoAlarm = await updateAutoAlarmInDB(ATalarmId, dto);
    return updateAutoAlarm;
}