import { prisma } from "../db.config.js";

export const insertSchedule = async (userId, data) => {
  return await prisma.schedules.create({
    data: {
      user_id: userId,
      name: data.name,
      start_date: new Date(data.startDate),
      end_date: new Date(data.endDate),
      color: data.color,
      place_name: data.placeName,
      address: data.address,
      memo: data.memo || null,
      is_important: data.isImportant,
      is_reminding: data.isReminding,
      is_recurring: data.isRecurring,
    },
  });
};

export const updateSchedule = async (scheduleId, userId, data) => {
  return await prisma.schedules.update({
    where: {
      schedule_id: scheduleId,
      user_id: userId,
    },
    data: {
      name: data.name,
      start_date: new Date(data.startDate),
      end_date: new Date(data.endDate),
      color: data.color,
      place_name: data.placeName,
      address: data.address,
      memo: data.memo || null,
      is_important: data.isImportant,
      is_reminding: data.isReminding,
      is_recurring: data.isRecurring,
    },
  });
};

export const deleteSchedule = async (scheduleId, userId) => {
  return await prisma.schedules.delete({
    where: {
      schedule_id: scheduleId,
      user_id: userId,
    },
  });
};

export const insertRemindRule = async (scheduleId, remindAt) => {
  return await prisma.remind_rules.create({
    data: {
      schedule_id: scheduleId,
      remind_at: remindAt,
    },
  });
};

export const deleteRemindRuleByScheduleId = async (scheduleId) => {
  return await prisma.remind_rules.deleteMany({
    where: { schedule_id: scheduleId },
  });
};

export const insertRecurrenceRule = async (scheduleId, rule) => {
  return await prisma.recurrence_rules.create({
    data: {
      schedule_id: scheduleId,
      repeat_type: rule.repeatType,
      repeat_mode: rule.repeatMode,
      repeat_count: rule.repeatCount ?? null,
      repeat_until_date: rule.repeatUntilDate ? new Date(rule.repeatUntilDate) : null,
      monthly_repeat_option: rule.monthlyRepeatOption ?? null,
      day_of_month: rule.dayOfMonth ?? null,
      nth_week: rule.nthWeek ?? null,
      weekday: rule.weekday ?? null,
    },
  });
};

export const insertRepeatWeekdays = async (recurrenceId, days) => {
  return await prisma.repeat_weekdays.createMany({
    data: days.map((day) => ({
      recurrence_id: recurrenceId,
      day_of_week: day,
    })),
  });
};

export const deleteRecurrenceRuleByScheduleId = async (scheduleId) => {
  return await prisma.recurrence_rules.deleteMany({
    where: { schedule_id: scheduleId },
  });
};
