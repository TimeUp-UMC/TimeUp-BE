import { findWakeUpAlarmsDueNow, findAutoAlarmsDueNow, findMyAlarmsDueNow, findScheduleAlarmsDueNow } from "../repositories/alarm.repository.js";
import { updatedPushTokenInDB } from "../repositories/alarm.repository.js";
import { pushWakeUpAlarmDTO } from "../dtos/wakeupalarm.dto.js";
import { pushAutoAlarmDTO } from "../dtos/autoalarm.dto.js";
import { pushMyAlarmDTO } from "../dtos/myalarm.dto.js";
import { pushScheduleAlarmDTO } from "../dtos/schedule.dto.js";
import { sendPushWUNotification, sendPushMYNotification, sendPushSCNotification } from "../utils/pushNotification.js";

// 푸시 알람 토큰 저장
export const savePushTokenService = async (userId, token) => {
    return updatedPushTokenInDB(userId, token);
};

// 특정 시각의 알람 발송 - 기상 알람
export const sendDueWakeUpAlarms = async () => {
    const alarms = await findWakeUpAlarmsDueNow();
    for (const alarm of alarms) {
      if (alarm.user?.push_token) {
        const token = alarm.user.push_token;
        const dto = pushWakeUpAlarmDTO(alarm, token);
        await sendPushWUNotification(token, dto);

      }
    }
};

// 자동 알람
export const sendDueAutoAlarms = async () => {
    const alarms = await findAutoAlarmsDueNow();
    for (const alarm of alarms) {
      if (alarm.user?.push_token) {
        const dto = pushAutoAlarmDTO(alarm, alarm.users.push_token);
        await sendPushWUNotification(dto); // 기상 알람과 동일
      }
    }
};

// 내 알람
export const sendDueMyAlarms = async () => {
    const alarms = await findMyAlarmsDueNow();
    for (const alarm of alarms) {
      if (alarm.user?.push_token) {
        const dto = pushMyAlarmDTO(alarm, alarm.users.push_token);
        await sendPushMYNotification(dto);
      }
    }
};

// 일정 알람
export const sendDueScheduleAlarms = async () => {
    const alarms = await findScheduleAlarmsDueNow();
    for (const alarm of alarms) {
      if (alarm.user?.push_token) {
        const dto = pushScheduleAlarmDTO(alarm, alarm.users.push_token);
        await sendPushSCNotification(dto);
      }
    }
}