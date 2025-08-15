import { prisma } from '../db.config.js';

// schedules 테이블에 일정 데이터 저장
export const insertSchedule = async (userId, data) => {
  return await prisma.schedules.create({
    data: {
      user_id: userId,
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      color: data.color ?? 'red',
      place_name: data.place_name,
      address: data.address,
      memo: data.memo ?? null,
      is_reminding: data.is_reminding ?? false,
      is_recurring: data.is_recurring ?? false,
      is_important: data.is_important ?? false,
    },
  });
};

// remind_rules 테이블에 리마인드 알림 규칙 저장
export const insertRemindRule = async (scheduleId, remind_at) => {
  return await prisma.remind_rules.create({
    data: {
      schedule_id: scheduleId,
      remind_at: remind_at
    }
  });
};

// recurrence_rules 테이블에 반복 규칙 저장
export const insertRecurrenceRule = async (scheduleId, recurrence_rule) => {
  return await prisma.recurrence_rules.create({
    data: {
      schedule_id: scheduleId,
      repeat_type: recurrence_rule.repeat_type, // 'weekly' or 'monthly'
      repeat_mode: recurrence_rule.repeat_mode, // 'count' or 'until'
      repeat_count: recurrence_rule.repeat_count ?? null,
      repeat_until_date: recurrence_rule.repeat_until_date ? new Date(recurrence_rule.repeat_until_date) : null,
      monthly_repeat_option: recurrence_rule.monthly_option ?? null,
      day_of_month: recurrence_rule.day_of_month ?? null,
      nth_week: recurrence_rule.nth_week ?? null,
      weekday: recurrence_rule.weekday ?? null,
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
