// schedulers/autoAlarmScheduler.js

import cron from 'node-cron'; // npm install node-cron
import { addAutoAlarmService } from '../services/autoalarm.service.js';
import { getAllUserIds } from '../repositories/user.repository.js';

export function startAutoAlarmScheduler() {
  console.log('auto');
  console.log('auto alarm scheduler initialized');
  cron.schedule(
    '* * * * *',
    async () => {
      try {
        console.log('* * *auto alarm scheduler start* * *');
        const userIds = await getAllUserIds();
        console.log(`🔹 Found ${userIds.length} users`);
        for (const userId of userIds) {
          await addAutoAlarmService({ userId });
        }
      } catch (err) {
        console.error('오류 발생:', err);
      }
    },
    {
      timezone: 'Asia/Seoul',
    }
  );
}
