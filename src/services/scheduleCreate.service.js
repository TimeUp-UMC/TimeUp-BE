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

  if (data.is_recurring && data.recurrence_rule) {
    const recurrence = await insertRecurrenceRule(schedule.schedule_id, data.recurrence_rule);

    if (
      data.recurrence_rule.repeat_type === 'weekly' &&
      Array.isArray(data.recurrence_rule.repeat_weekdays)
    ) {
      await insertRepeatWeekdays(recurrence.recurrence_id, data.recurrence_rule.repeat_weekdays);
    }
  }

  return schedule.schedule_id;
};
