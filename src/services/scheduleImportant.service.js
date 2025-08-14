import { findImportantSchedulesByMonth } from '../repositories/scheduleImportant.repository.js';

export const getImportantSchedulesByMonth = async ({ userId, year, month }) => {
  return await findImportantSchedulesByMonth(userId, year, month);
};
