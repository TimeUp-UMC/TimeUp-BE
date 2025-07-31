import {
  insertSchedule,
  insertRemindRule,
  insertRecurrenceRule,
  insertRepeatWeekdays
} from '../repositories/scheduleCreate_repository.js';

/// 일정 등록을 처리하는 서비스 로직
/// 1. 기본 일정 저장
/// 2. 리마인드 알람 저장 (조건부)
/// 3. 반복 규칙 저장 (조건부)
export const createScheduleWithRules = async (userId, data) => {
  const schedule = await insertSchedule(userId, data);

  if (data.isReminding && data.remindAt !== undefined) {
    await insertRemindRule(schedule.schedule_id, data.remindAt);
  }

  if (data.isRecurring && data.repeatRule) {
    const recurrence = await insertRecurrenceRule(schedule.schedule_id, data.repeatRule);
    if (data.repeatRule.weeklyDays?.length > 0) {
      await insertRepeatWeekdays(recurrence.recurrence_id, data.repeatRule.weeklyDays);
    }
  }

  return schedule.schedule_id;
};
