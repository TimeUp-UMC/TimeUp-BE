import cron from 'node-cron';
import { sendDueWakeUpAlarms, sendDueAutoAlarms, sendDueMyAlarms, sendDueScheduleAlarms } from '../services/alarm.service.js';

// 매 분 0초마다 실행

// 기상 알람
export function startWakeUpAlarmJob() {
  cron.schedule('* * * * *', async () => { // 매 분마다 실행
    console.log('[WakeUpAlarmJob] 실행 중');
    await sendDueWakeUpAlarms();
  });
};

// 자동 알람
export function startAutoAlarmJob() {
    cron.schedule('* * * * *', async () => {
      console.log('[AutoAlarmJob] 실행:', new Date().toISOString());
      await sendDueAutoAlarms();
    });
};

// 내 알람
export function startMyAlarmJob() {
    cron.schedule('* * * * *', async () => {
      console.log('[MyAlarmJob] 실행:', new Date().toISOString());
      await sendDueMyAlarms();
    });
  }

// 일정 알람
export function startScheduleAlarmjob() {
  cron.schedule('* * * * *', async () => {
    console.log('[SchedyleAlarmJob] 실행:', new Date().toISOString());
    await sendDueScheduleAlarms();
  });
}