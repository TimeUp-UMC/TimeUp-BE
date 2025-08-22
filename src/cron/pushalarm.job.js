import cron from 'node-cron';
import { sendDueWakeUpAlarms, sendDueAutoAlarms, sendDueMyAlarms, sendDueScheduleAlarms, sendDueActiveAutoAlarms } from '../services/alarm.service.js';

// 매 분 0초마다 실행
let isWURunning = false;
let isATRunning = false;
let isMYRunning = false;
let isSCRunning = false;
let isURRunning = false;

// 기상 알람
export function startWakeUpAlarmJob() {
  cron.schedule('* * * * *', async () => {
    if (isWURunning) {
      console.log('[WakeUpAlarmJob] 이전 작업 중');
      return;
    }
    isWURunning = true;
  
    try {
      console.log('[WakeUpAlarmJob] 실행 : ', new Date().toISOString());
      await sendDueWakeUpAlarms();
    } catch (err) {
      console.error(err);
    } finally {
      isWURunning = false;
    }
  });
};

// 자동 알람
export function startAutoAlarmJob() {
  cron.schedule('* * * * *', async () => {
    if (isATRunning) {
      console.log('[AutoAlarmJob] 이전 작업 중');
      return;
    }
    isATRunning = true;
  
    try {
      console.log('[AutoAlarmJob] 실행 : ', new Date().toISOString());
      await sendDueAutoAlarms();
    } catch (err) {
      console.error(err);
    } finally {
      isATRunning = false;
    }
  });
};

// 내 알람
export function startMyAlarmJob() {
  cron.schedule('* * * * *', async () => {
    if (isMYRunning) {
      console.log('[MyAlarmJob] 이전 작업 중');
      return;
    }
    isMYRunning = true;
  
    try {
      console.log('[MyAlarmJob] 실행 : ', new Date().toISOString());
      await sendDueMyAlarms();
    } catch (err) {
      console.error(err);
    } finally {
      isMYRunning = false;
    }
  });
  };

// 일정 알람
export function startScheduleAlarmjob() {
  cron.schedule('* * * * *', async () => {
    if (isSCRunning) {
      console.log('[ScheduleAlarmJob] 이전 작업 중');
      return;
    }
    isSCRunning = true;
  
    try {
      console.log('[ScheduleAlarmJob] 실행 : ', new Date().toISOString());
      await sendDueScheduleAlarms();
    } catch (err) {
      console.error(err);
    } finally {
      isSCRunning = false;
    }
  });
};

// 자동 알람 활성화 여부
export function startActiveAutoAlarmJob() {
  cron.schedule('* * * * *', async () => {
    if (isURRunning) {
      console.log('[ActiveAutoAlarmJob] 이전 작업 중');
      return;
    }
    isURRunning = true;
  
    try {
      console.log('[ActiveAutoJob] 실행 : ', new Date().toISOString());
      await sendDueActiveAutoAlarms();
    } catch (err) {
      console.error(err);
    } finally {
      isURRunning = false;
    }
  });
};