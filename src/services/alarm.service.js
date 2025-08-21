import { updatedPushTokenInDB } from "../repositories/alarm.repository.js";
import { findWakeUpAlarmsDueNow, findAutoAlarmsDueNow, findMyAlarmsDueNow, findScheduleAlarmsDueNow, findUsersDueNow, findAutoAlarmsTomorrow, findScheduleDueNow } from "../repositories/alarm.repository.js";
import { pushWakeUpAlarmDTO } from "../dtos/wakeupalarm.dto.js";
import { pushAutoAlarmDTO } from "../dtos/autoalarm.dto.js";
import { pushMyAlarmDTO } from "../dtos/myalarm.dto.js";
import { pushScheduleAlarmDTO } from "../dtos/schedule.dto.js";
import { sendPushWUNotification, sendPushMYNotification, sendPushSCNotification, sendPushURNotification } from "../utils/pushNotification.js";
import { prisma } from "../db.config.js";

// 푸시 알람 토큰 저장
export const savePushTokenService = async (userId, token) => {
    return updatedPushTokenInDB(userId, token);
};

// 특정 시각의 알람 발송 - 기상 알람
export const sendDueWakeUpAlarms = async () => {
    const alarms = await findWakeUpAlarmsDueNow();

    await Promise.all(
        alarms.map(async (alarm) => {
          const user = await prisma.users.findUnique({
            where: { user_id: alarm.user_id },
            select: { push_token: true },
          });
          if (user?.push_token) {
            const token = user.push_token;
            const dto = pushWakeUpAlarmDTO(alarm, token);
            console.log(`[wakeup]:`, dto);
            await sendPushWUNotification(token, dto);
          }
        })
      );
};

// 자동 알람
export const sendDueAutoAlarms = async () => {
    const alarms = await findAutoAlarmsDueNow();
    for (const alarm of alarms) {
        const scheduleIds = await findScheduleDueNow(alarm);

        await Promise.all(
            scheduleIds.map(async (scheduleId) => {
              const user = await prisma.users.findUnique({
                where: { user_id: scheduleId.user_id },
                select: { push_token: true },
              });
              if (user?.push_token) {
                const token = user.push_token;
                const dto = pushAutoAlarmDTO(alarm, token);
                console.log(`[auto]:`, dto);
                await sendPushWUNotification(token, dto);
              }
            })
          );
    }
};

// 내 알람
export const sendDueMyAlarms = async () => {
    const alarms = await findMyAlarmsDueNow();
  
    await Promise.all(
      alarms.map(async (alarm) => {
        const user = await prisma.users.findUnique({
          where: { user_id: alarm.user_id },
          select: { push_token: true },
        });
        if (user?.push_token) {
          const token = user.push_token;
          const dto = pushMyAlarmDTO(alarm, token);
          console.log(`[my]:`, dto);
          await sendPushMYNotification(token, dto);
        }
        try {
            // 푸시 알람 전송 성공 후 알람 삭제
            await prisma.my_alarms.delete({
                where: { alarm_id: alarm.alarm_id }
            });
            console.log('내 알람 삭제 완료', alarm.alarm_id);
        } catch (error) {
            next(error);
        }
      })
    );
  };

// 일정 알람
export const sendDueScheduleAlarms = async () => {
    const alarms = await findScheduleAlarmsDueNow();
    await Promise.all(
        alarms.map(async (alarm) => {
          const user = await prisma.users.findUnique({
            where: { user_id: alarm.user_id },
            select: { push_token: true },
          });
          if (user?.push_token) {
            const token = user.push_token;
            // remind_rule 찾기
            const matchedRule = alarm.remind_rules.find((rule) => {
            const remindTime = new Date(
              alarm.start_date.getTime() - rule.remind_at * 60000
            );
            const utcNow = new Date();
            utcNow.setSeconds(0, 0);
            const oneMinuteLater = new Date(utcNow.getTime() + 60 * 1000);
  
            return remindTime >= utcNow && remindTime <= oneMinuteLater;
          });
            const dto = pushScheduleAlarmDTO(alarm, token, matchedRule?.remind_at);
            console.log(`[schedule]:`,dto);
            await sendPushSCNotification(token, dto);
          }
        })
      );
}

// 자동 알람 활성화 여부
export const sendDueActiveAutoAlarms = async () => {
    // alarm_check_time 기준 사용자 조회
    const users = await findUsersDueNow(); 
    console.log('사용자', users);
    if (!users || users.length === 0) return;
  
    for (const user of users) {
        const token = user.push_token;
        const userId = user.user_id;
    
        // 각 사용자별 내일 자동 알람 유무 조회(UTC)
        const tomorrowAlarms = await findAutoAlarmsTomorrow(userId);
        if (tomorrowAlarms.length > 0 && token) {
          console.log(`푸시 전송 대상: user_id=${userId}`);
          await sendPushURNotification(token);
        }
      }
  };