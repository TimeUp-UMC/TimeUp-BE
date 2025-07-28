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