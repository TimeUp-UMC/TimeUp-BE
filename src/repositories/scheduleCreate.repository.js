import { prisma } from '../db.config.js';

// schedules 테이블에 일정 데이터 저장
export const insertSchedule = async (userId, data) => {
  return await prisma.schedules.create({
    data: {
      user_id: userId,
      name: data.name,
      start_date: data.startDate,
      end_date: data.endDate,
      color: data.color ?? 'red',
      place_name: data.placeName,
      address: data.address,
      memo: data.memo ?? null,
      is_reminding: data.isReminding ?? false,
      is_recurring: data.isRecurring ?? false,
      is_important: data.isImportant ?? false,
    },
  });
};

// remind_rules 테이블에 리마인드 알림 규칙 저장
export const insertRemindRule = async (scheduleId, remindAt) => {
  return await prisma.remind_rules.create({
    data: {
      schedule_id: scheduleId,
      remind_at: remindAt
    }
  });
};

// recurrence_rules 테이블에 반복 규칙 저장
export const insertRecurrenceRule = async (scheduleId, recurrenceRule) => {
  return await prisma.recurrence_rules.create({
    data: {
      schedule_id: scheduleId,
      repeat_type: recurrenceRule.repeatType, // 'weekly' or 'monthly'
      repeat_mode: recurrenceRule.repeatMode, // 'count' or 'until'
      repeat_count: recurrenceRule.repeatCount ?? null,
      repeat_until_date: recurrenceRule.repeatUntilDate ? new Date(recurrenceRule.repeatUntilDate) : null,
      monthly_repeat_option: recurrenceRule.monthlyOption ?? null,
      day_of_month: recurrenceRule.dayOfMonth ?? null,
      nth_week: recurrenceRule.nthWeek ?? null,
      weekday: recurrenceRule.weekday ?? null,
    },
  });
};

// repeat_weekdays 테이블에 반복 요일 저장
export const insertRepeatWeekdays = async (recurrenceId, days) => {
  return await prisma.repeat_weekdays.createMany({
    data: days.map((day) => ({
      recurrence_id: recurrenceId,
      day_of_week: day
    }))
  });
};
