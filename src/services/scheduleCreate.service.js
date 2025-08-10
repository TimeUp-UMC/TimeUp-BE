import {
  insertSchedule,
  insertRemindRule,
  insertRecurrenceRule,
  insertRepeatWeekdays
} from '../repositories/scheduleCreate.repository.js';

// 1. 일정 기본 데이터 저장
// 2. 리마인드 알람 규칙 저장 (조건부)
// 3. 반복 규칙 저장 (조건부)

export const createScheduleWithRules = async (userId, data) => {
  const schedule = await insertSchedule(userId, data);

  if (data.is_reminding && data.remind_at !== undefined) {
    await insertRemindRule(schedule.schedule_id, data.remind_at);
  }

  if (data.is_recurring && data.recurrenceRule) {
    const recurrence = await insertRecurrenceRule(schedule.schedule_id, data.recurrenceRule);

    if (
      data.recurrenceRule.repeatType === 'weekly' &&
      Array.isArray(data.recurrenceRule.repeatWeekdays)
    ) {
      await insertRepeatWeekdays(recurrence.recurrence_id, data.recurrenceRule.repeatWeekdays);
    }
  }

  return schedule.schedule_id;
};
