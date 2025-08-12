import { prisma } from '../db.config.js';
import {
  updateScheduleById,
  upsertRemindRule,
  deleteRemindRule,
  upsertRecurrenceRule,
  deleteRecurrenceRule,
  deleteRepeatWeekdays,
  insertRepeatWeekdays,
} from '../repositories/scheduleUpdate.repository.js';
import { NotFoundError, ValidationError } from '../errors/error.js';

export const updateScheduleWithRules = async (scheduleId, userId, data) => {
  if (!(data.start_date instanceof Date) || !(data.end_date instanceof Date)) {
    throw new ValidationError('날짜는 date 타입으로 전달되어야 합니다.');
  }

  await prisma.$transaction(async (tx) => {
    // 기본 일정 수정
    const result = await updateScheduleById(scheduleId, userId, {
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      color: data.color,
      place_name: data.place_name,
      address: data.address,
      memo: data.memo ?? null,
      is_important: !!data.is_important,
      is_reminding: !!data.is_reminding,
      is_recurring: !!data.is_recurring,
    }, tx);

    if (!result || result.count === 0) {
      throw new NotFoundError('해당 일정이 존재하지 않습니다.');
    }

    // 리마인드 알람 처리
    if (data.is_reminding && data.remind_at !== undefined) {
      await upsertRemindRule(scheduleId, data.remind_at, tx);
    } else {
      await deleteRemindRule(scheduleId, tx);
    }

    // 반복 규칙 처리
    if (data.is_recurring && data.recurrence_rule) {
      // upsert recurrence_rules (schedule_id UNIQUE 전제)
      const recurrence = await upsertRecurrenceRule(scheduleId, data.recurrence_rule, tx);

      // 요일 덮어쓰기
      await deleteRepeatWeekdays(recurrence.recurrence_id, tx);

      const days = data.recurrence_rule.repeat_weekdays;
      if (Array.isArray(days) && days.length > 0) {
        await insertRepeatWeekdays(recurrence.recurrence_id, days, tx);
      }
    } else {
      // 반복 해제: 하위부터 삭제 후 규칙 삭제
      await deleteRecurrenceRule(scheduleId, tx);
    }
  });

  return true;
};
