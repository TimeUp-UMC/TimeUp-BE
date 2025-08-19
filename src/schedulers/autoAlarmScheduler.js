// schedulers/autoAlarmScheduler.js

import cron from 'node-cron'; //npm install node-cron
import { addAutoAlarmService } from '../services/autoalarm.service.js';
import { getAllUserIds } from '../repositories/user.repository.js';

export function startAutoAlarmScheduler() {
  //분, 시, 일, 월, 요일
  cron.schedule('46 19 * * *', async () => {
    try {
      console.log('auto alarm scheduler start');
      const userIds = await getAllUserIds();
      for (const userId of userIds) {
        await addAutoAlarmService({ userId });
      }
    } catch (err) {
      console.error('오류 발생:', err);
    }
  });
}
