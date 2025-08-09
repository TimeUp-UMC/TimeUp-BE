import { prisma } from '../db.config.js';

// 일정 데이터를 schedules 테이블에 저장
export const insertSchedule = async (userId, data) => {
  return await prisma.schedules.create({
    data: {
      user_id: userId,
      name: data.name,
      start_date: new Date(data.startDate),
      end_date: new Date(data.endDate),
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

// remind_rules 테이블에 리마인드 알람 시간 저장
export const insertRemindRule = async (scheduleId, remindAt) => {
  return await prisma.remind_rules.create({
    data: {
      schedule_id: scheduleId,
      remind_at: remindAt,
    },
  });
};

// recurrence_rules 테이블에 반복 규칙 저장
// return 값: recurrence_rules row (recurrence_id 추출용)
export const insertRecurrenceRule = async (scheduleId, repeatRule) => {
  return await prisma.recurrence_rules.create({
    data: {
      schedule_id: scheduleId,
      repeat_type: repeatRule.repeatType, // 'weekly' or 'monthly'
      repeat_mode: repeatRule.repeatMode, // 'count' | 'until'
      repeat_count: repeatRule.repeatCount ?? null,
      repeat_until_date: repeatRule.repeatUntilDate
        ? new Date(repeatRule.repeatUntilDate)
        : null,
      monthly_repeat_option: repeatRule.monthlyOption ?? null,
      day_of_month: repeatRule.dayOfMonth ?? null,
      nth_week: repeatRule.nthWeek ?? null,
      weekday: repeatRule.weekday ?? null,
    },
  });
};

/// repeat_weekdays 테이블에 반복 요일 저장
export const insertRepeatWeekdays = async (recurrenceId, days) => {
  return await prisma.repeat_weekdays.createMany({
    data: days.map((day) => ({
      recurrence_id: recurrenceId,
      day_of_week: day``,
    })),
  });
};
