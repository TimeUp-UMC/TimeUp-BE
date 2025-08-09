import { prisma } from '../db.config.js';

// 일정 정보 수정 (user_id까지 조건에 포함해 본인만 수정 가능하게)
export const updateScheduleById = async (scheduleId, userId, data) => {
    const startDate = data.startDate;
    const endDate = data.endDate;

  return await prisma.schedules.update({
    where: { schedule_id: scheduleId },
    data: {
      name: data.name,
      start_date: startDate,
      end_date: endDate,
      color: data.color,
      place_name: data.placeName,
      address: data.address,
      memo: data.memo ?? null,
      is_reminding: data.isReminding ?? false,
      is_recurring: data.isRecurring ?? false,
      is_important: data.isImportant ?? false,
    },
  });
};

// remind_rules 있으면 update, 없으면 insert
export const upsertRemindRule = async (scheduleId, remindAt) => {
  return await prisma.remind_rules.upsert({
    where: { schedule_id: scheduleId },
    update: { remind_at: remindAt },
    create: {
      schedule_id: scheduleId,
      remind_at: remindAt,
    },
  });
};

// remind_rules delete
export const deleteRemindRule = async (scheduleId) => {
  return await prisma.remind_rules.deleteMany({
    where: { schedule_id: scheduleId },
  });
};

// recurrence_rules 있으면 update, 없으면 insert
export const upsertRecurrenceRule = async (scheduleId, repeatRule) => {
  return await prisma.recurrence_rules.upsert({
    where: { schedule_id: scheduleId },
    update: {
      repeat_type: repeatRule.repeatType,
      repeat_mode: repeatRule.repeatMode,
      repeat_count: repeatRule.repeatCount ?? null,
      repeat_until_date: repeatRule.repeatUntilDate ? new Date(repeatRule.repeatUntilDate) : null,
      monthly_repeat_option: repeatRule.monthlyOption ?? null,
      day_of_month: repeatRule.dayOfMonth ?? null,
      nth_week: repeatRule.nthWeek ?? null,
      weekday: repeatRule.weekday ?? null,
    },
    create: {
      schedule_id: scheduleId,
      repeat_type: repeatRule.repeatType,
      repeat_mode: repeatRule.repeatMode,
      repeat_count: repeatRule.repeatCount ?? null,
      repeat_until_date: repeatRule.repeatUntilDate ? new Date(repeatRule.repeatUntilDate) : null,
      monthly_repeat_option: repeatRule.monthlyOption ?? null,
      day_of_month: repeatRule.dayOfMonth ?? null,
      nth_week: repeatRule.nthWeek ?? null,
      weekday: repeatRule.weekday ?? null,
    },
  });
};

// recurrence_rules + repeat_weekdays delete
export const deleteRecurrenceRule = async (scheduleId) => {
  const recurrence = await prisma.recurrence_rules.findUnique({
    where: { schedule_id: scheduleId },
  });
  if (!recurrence) return;

  await prisma.repeat_weekdays.deleteMany({
    where: { recurrence_id: recurrence.recurrence_id },
  });

  await prisma.recurrence_rules.delete({
    where: { recurrence_id: recurrence.recurrence_id },
  });
};

// repeat_weekdays 전체 delete (수정 시 덮어쓰기)
export const deleteRepeatWeekdays = async (recurrenceId) => {
  return await prisma.repeat_weekdays.deleteMany({
    where: { recurrence_id: recurrenceId },
  });
};

// repeat_weekdays insert
export const insertRepeatWeekdays = async (recurrenceId, days) => {
  const data = days.map((day) => ({
    recurrence_id: recurrenceId,
    day_of_week: day,
  }));

  return await prisma.repeat_weekdays.createMany({ data });
};

