import {
  insertSchedule,
  insertRemindRule,
  insertRecurrenceRule,
  insertRepeatWeekdays,
  updateSchedule,
  deleteRemindRuleByScheduleId,
  deleteRecurrenceRuleByScheduleId,
  deleteSchedule,
} from "../repositories/schedule.repository.js";

export const createScheduleWithRules = async (userId, data) => {
  const schedule = await insertSchedule(userId, data);

  if (data.isReminding && data.remindAt !== undefined) {
    await insertRemindRule(schedule.schedule_id, data.remindAt);
  }

  if (data.isRecurring && data.repeatRule) {
    const recurrence = await insertRecurrenceRule(schedule.schedule_id, data.repeatRule);
    if (data.repeatRule.weeklyDays?.length) {
      await insertRepeatWeekdays(recurrence.recurrence_id, data.repeatRule.weeklyDays);
    }
  }

  return schedule.schedule_id;
};

export const updateScheduleWithRules = async (scheduleId, userId, data) => {
  await updateSchedule(scheduleId, userId, data);

  await deleteRemindRuleByScheduleId(scheduleId);
  if (data.isReminding && data.remindAt !== undefined) {
    await insertRemindRule(scheduleId, data.remindAt);
  }

  await deleteRecurrenceRuleByScheduleId(scheduleId);
  if (data.isRecurring && data.repeatRule) {
    const recurrence = await insertRecurrenceRule(scheduleId, data.repeatRule);
    if (data.repeatRule.weeklyDays?.length) {
      await insertRepeatWeekdays(recurrence.recurrence_id, data.repeatRule.weeklyDays);
    }
  }
};

export const deleteScheduleWithRules = async (scheduleId, userId) => {
  await deleteRemindRuleByScheduleId(scheduleId);
  await deleteRecurrenceRuleByScheduleId(scheduleId);
  await deleteSchedule(scheduleId, userId);
};
