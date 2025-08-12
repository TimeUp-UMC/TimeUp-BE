import { prisma } from '../db.config.js';

export const findScheduleById = async (scheduleId) =>
  await prisma.schedules.findUnique({
    where: { schedule_id: scheduleId },
    select: {
      schedule_id: true,
      user_id: true,
      name: true,
      start_date: true,
      end_date: true,
      color: true,
      place_name: true,
      address: true,
      is_important: true,
      is_reminding: true,
      is_recurring: true,
      memo: true,
    },
  });

export const findRemindRuleByScheduleId = async (scheduleId) =>
  await prisma.remind_rules.findFirst({
    where: { schedule_id: scheduleId },
    select: { remind_at: true },
  });

export const findRecurrenceRuleByScheduleId = async (scheduleId) =>
  await prisma.recurrence_rules.findFirst({
    where: { schedule_id: scheduleId },
  });

export const findRepeatWeekdaysByRecurrenceId = async (recurrenceId) =>
  await prisma.repeat_weekdays.findMany({
    where: { recurrence_id: recurrenceId },
    select: { day_of_week: true },
  });
