import {
  findScheduleById,
  findRemindRuleByScheduleId,
  findRecurrenceRuleByScheduleId,
  findRepeatWeekdaysByRecurrenceId,
} from '../repositories/scheduleDetail.repository.js';

export const getScheduleDetailByScheduleId = async (scheduleId) => {
  const baseSchedule = await findScheduleById(scheduleId);
  if (!baseSchedule) return null;

  const remindRule = await findRemindRuleByScheduleId(scheduleId);
  const recurrenceRule = await findRecurrenceRuleByScheduleId(scheduleId);

  let repeatWeekdays = [];
  if (recurrenceRule?.recurrence_id) {
    repeatWeekdays = await findRepeatWeekdaysByRecurrenceId(recurrenceRule.recurrence_id);
  }

  return {
    schedule_id: baseSchedule.schedule_id,
    user_id: baseSchedule.user_id,
    name: baseSchedule.name,
    start_date: baseSchedule.start_date,
    end_date: baseSchedule.end_date,
    color: baseSchedule.color,
    place_name: baseSchedule.place_name,
    address: baseSchedule.address,
    memo: baseSchedule.memo,
    is_reminding: baseSchedule.is_reminding,
    is_recurring: baseSchedule.is_recurring,
    is_important: baseSchedule.is_important,
    reminder_minutes: remindRule?.remind_at ?? null,
    recurrence_rule: recurrenceRule
      ? {
          ...recurrenceRule,
          repeat_weekdays: repeatWeekdays.map((r) => r.day_of_week),
        }
      : null,
  };
};
