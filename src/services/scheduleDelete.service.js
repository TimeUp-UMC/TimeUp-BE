import {
  deleteRemindRule,
  deleteRecurrenceRule,
  deleteScheduleById,
} from '../repositories/scheduleDelete.repository.js';
import { NotFoundError } from '../errors/error.js';

export const deleteScheduleWithRules = async (scheduleId, userId) => {
  
  // 부가 정보들 먼저 삭제 (외래키 오류 방지)
  await deleteRemindRule(scheduleId);
  await deleteRecurrenceRule(scheduleId);

  const result = await deleteScheduleById(scheduleId, userId);

  if (result.count === 0) {
    throw new NotFoundError('해당 일정이 존재하지 않습니다.');
  }

  return true;
};
