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
  const recurrence_rule = await findRecurrenceRuleByScheduleId(scheduleId);

  let repeat_weekdays = [];
  if (recurrence_rule?.recurrence_id) {
    repeat_weekdays = await findRepeatWeekdaysByRecurrenceId(recurrence_rule.recurrence_id);
  }

  return {
    scheduleId: baseSchedule.schedule_id,
    user_id: baseSchedule.user_id,
    name: baseSchedule.name,
    start_date: baseSchedule.start_date,
    end_date: baseSchedule.end_date,
    color: baseSchedule.color,
    place_name: baseSchedule.place_name,
    address: baseSchedule.address,
    is_important: baseSchedule.is_important,
    is_reminding: baseSchedule.is_reminding,
    reminder_at: remindRule?.remind_at ?? null,
    is_recurring: baseSchedule.is_recurring,
    recurrence_rule: recurrence_rule
      ? {
          ...recurrence_rule,
          repeat_weekdays: (repeat_weekdays ?? []).map((r) => r.day_of_week),
        }
      : null,
    memo: baseSchedule.memo ?? null
  };
};