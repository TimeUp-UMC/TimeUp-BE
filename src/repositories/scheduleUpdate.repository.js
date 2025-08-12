import { prisma } from '../db.config.js';

export const updateScheduleById = async (scheduleId, userId, data, tx = prisma) => {
  return await tx.schedules.updateMany({
    where: { schedule_id: scheduleId, user_id: userId },
    data: {
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      color: data.color,
      place_name: data.place_name,
      address: data.address,
      memo: data.memo ?? null,
      is_reminding: data.is_reminding ?? false,
      is_recurring: data.is_recurring ?? false,
      is_important: data.is_important ?? false,
    },
  });
};

// remind_rules 있으면 update, 없으면 insert
export const upsertRemindRule = async (scheduleId, remind_at, tx = prisma) => {
  return await tx.remind_rules.upsert({
    where: { schedule_id: scheduleId },
    update: { remind_at },
    create: { schedule_id: scheduleId, remind_at },
  });
};

// remind_rules delete
export const deleteRemindRule = async (scheduleId, tx = prisma) => {
  return await tx.remind_rules.deleteMany({
    where: { schedule_id: scheduleId },
  });
};

// recurrence_rules 있으면 update, 없으면 insert
export const upsertRecurrenceRule = async (scheduleId, recurrenceRule, tx = prisma) => {
  return await tx.recurrence_rules.upsert({
    where: { schedule_id: scheduleId },
    update: {
      repeat_type: recurrenceRule.repeatType,
      repeat_mode: recurrenceRule.repeatMode,
      repeat_count: recurrenceRule.repeatCount ?? null,
      repeat_until_date: recurrenceRule.repeatUntilDate ? new Date(recurrenceRule.repeatUntilDate) : null,
      monthly_repeat_option: recurrenceRule.monthlyOption ?? null,
      day_of_month: recurrenceRule.dayOfMonth ?? null,
      nth_week: recurrenceRule.nthWeek ?? null,
      weekday: recurrenceRule.weekday ?? null,
    },
    create: {
      schedule_id: scheduleId,
      repeat_type: recurrenceRule.repeatType,
      repeat_mode: recurrenceRule.repeatMode,
      repeat_count: recurrenceRule.repeatCount ?? null,
      repeat_until_date: recurrenceRule.repeatUntilDate ? new Date(recurrenceRule.repeatUntilDate) : null,
      monthly_repeat_option: recurrenceRule.monthlyOption ?? null,
      day_of_month: recurrenceRule.dayOfMonth ?? null,
      nth_week: recurrenceRule.nthWeek ?? null,
      weekday: recurrenceRule.weekday ?? null,
    },
    select: { recurrence_id: true }, // 요일 덮어쓰기에 사용
  });
};

// recurrence_rules + repeat_weekdays delete
export const deleteRecurrenceRule = async (scheduleId, tx = prisma) => {
  const recurrence = await tx.recurrence_rules.findUnique({
    where: { schedule_id: scheduleId },
  });
  if (!recurrence) return;

  await tx.repeat_weekdays.deleteMany({
    where: { recurrence_id: recurrence.recurrence_id },
  });

  await tx.recurrence_rules.delete({
    where: { recurrence_id: recurrence.recurrence_id },
  });
};

// repeat_weekdays 전체 delete (수정 시 덮어쓰기)
export const deleteRepeatWeekdays = async (recurrenceId, tx = prisma) => {
  return await tx.repeat_weekdays.deleteMany({
    where: { recurrence_id: recurrenceId },
  });
};

// repeat_weekdays insert
export const insertRepeatWeekdays = async (recurrenceId, days, tx = prisma) => {
  const data = [...new Set(days)].map((day) => ({
    recurrence_id: recurrenceId,
    day_of_week: day,
  }));

  return await tx.repeat_weekdays.createMany({
    data,
    skipDuplicates: true, // 중복 방지
  });
};