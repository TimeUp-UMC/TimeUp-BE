// schedulers/autoAlarmScheduler.js

import cron from 'node-cron'; //npm install node-cron
import { addAutoAlarmService } from '../services/autoalarm.service.js';
import { getAllUserIds } from '../repositories/user.repository.js';

export function startAutoAlarmScheduler() {
  //분, 시, 일, 월, 요일
  cron.schedule('15 20 * * *', async () => {
    try {
      console.log('auto alarm scheduler start1');
      const userIds = await getAllUserIds();
      for (const userId of userIds) {
        await addAutoAlarmService({ userId });
      }
    } catch (err) {
      console.error('오류 발생:', err);
    }
  });

  cron.schedule('12 11 * * *', async () => {
    try {
      console.log('auto alarm scheduler start2');
      const userIds = await getAllUserIds();
      for (const userId of userIds) {
        await addAutoAlarmService({ userId });
      }
    } catch (err) {
      console.error('오류 발생:', err);
    }
  });
}
