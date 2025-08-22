// schedulers/autoAlarmScheduler.js

import cron from 'node-cron'; // npm install node-cron
import { addAutoAlarmService } from '../services/autoalarm.service.js';
import { getAllUserIds } from '../repositories/user.repository.js';

export async function autoAlarmJob() {
  console.log('* * *auto alarm job start* * *');
  const userIds = await getAllUserIds();
  console.log(`Found ${userIds.length} users`);
  for (const userId of userIds) {
    await addAutoAlarmService({ userId });
  }
}

export function startAutoAlarmScheduler() {
  cron.schedule('00 12 * * *', autoAlarmJob, { timezone: 'Asia/Seoul' });
}
