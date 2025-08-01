import {
  updateScheduleById,
  upsertRemindRule,
  deleteRemindRule,
  upsertRecurrenceRule,
  deleteRecurrenceRule,
  deleteRepeatWeekdays,
  insertRepeatWeekdays,
} from '../repositories/scheduleUpdate.repository.js';
import { NotFoundError } from '../errors/error.js';

// 일정 수정 전체 처리 서비스
export const updateScheduleWithRules = async (scheduleId, userId, data) => {
  // 1. 기본 일정 수정
  const result = await updateScheduleById(scheduleId, userId, {
    name: data.name,
    start_date: data.startDate,
    end_date: data.endDate,
    color: data.color,
    place_name: data.placeName,
    address: data.address,
    memo: data.memo,
    is_important: data.isImportant,
    is_reminding: data.isReminding,
    is_recurring: data.isRecurring,
  });

  if (result.count === 0) {
    throw new NotFoundError('일정을 찾을 수 없습니다.');
  }

  // 2. 리마인드 알람 처리
  if (data.isReminding && data.remindAt !== undefined) {
    await upsertRemindRule(scheduleId, data.remindAt);
  } else {
    await deleteRemindRule(scheduleId);
  }

  // 3. 반복 규칙 처리
  if (data.isRecurring && data.repeatRule) {
    const recurrence = await upsertRecurrenceRule(scheduleId, data.repeatRule);

    // 반복 요일 갱신
    await deleteRepeatWeekdays(recurrence.recurrence_id);

    if (Array.isArray(data.repeatRule.weeklyDays) && data.repeatRule.weeklyDays.length > 0) {
      await insertRepeatWeekdays(recurrence.recurrence_id, data.repeatRule.weeklyDays);
    }
  } else {
    // 반복 안함으로 설정한 경우, 기존 규칙 삭제
    await deleteRecurrenceRule(scheduleId);
  }

  return true;
};
