import { ValidationError } from '../errors/error.js';

const allowedColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'pink'];
const allowedRemindValues = [0, 5, 10, 30, 60, 1440];

export const bodyToSchedule = (body) => {
  const {
    name,
    startDate,
    endDate,
    color = 'red',
    placeName,
    address,
    isImportant = false,
    isReminding = false,
    isRecurring = false,
    remindAt,
    recurrenceRule,
    memo,
  } = body;

  // 필수값 검사
  if (!name || !startDate || !endDate || !color || !placeName || !address) {
    throw new ValidationError('필수 일정 정보가 누락되었습니다.');
  }

  // 날짜 변환 및 유효성 검사
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ValidationError('날짜 형식이 올바르지 않습니다.');
  }

  // 일정 종료 날짜 유효성 검사
  if (end < start) {
  throw new ValidationError('일정 종료는 시작보다 나중이어야 합니다.');
}

  // 색상 유효성 검사
  if (!allowedColors.includes(color)) {
    throw new ValidationError(`일정 색상은 지정된 옵션 중 하나여야 합니다. 사용 가능한 옵션: ${allowedColors.join(', ')}`);
  }

  // 리마인드 유효성 검사
  if (isReminding) {
    if (typeof remindAt !== 'number' || !allowedRemindValues.includes(remindAt)) {
      throw new ValidationError(`리마인드 시간은 지정된 옵션 중 하나여야 합니다. 사용 가능한 옵션: ${allowedRemindValues.join(', ')}`);
    }
  }

  // 반복 규칙 유효성 검사
  if (isRecurring && recurrenceRule) {
    if (!['weekly', 'monthly'].includes(recurrenceRule.repeatType)) {
      throw new ValidationError('반복 주기는 weekly 또는 monthly여야 합니다.');
    }

    if (!['count', 'until'].includes(recurrenceRule.repeatMode)) {
      throw new ValidationError('반복 종료 방식은 count 또는 until이어야 합니다.');
    }

    if (
      recurrenceRule.repeatMode === 'until' &&
      recurrenceRule.repeatUntilDate &&
      new Date(recurrenceRule.repeatUntilDate) < start
    ) {
      throw new ValidationError('반복 종료일은 시작일 이후여야 합니다.');
    }

    if (
      recurrenceRule.repeatMode === 'count' &&
      (typeof recurrenceRule.repeatCount !== 'number' || recurrenceRule.repeatCount < 1)
    ) {
      throw new ValidationError('반복 횟수는 1 이상의 숫자여야 합니다.');
    }

    if (recurrenceRule.repeatType === 'weekly') {
      if (!Array.isArray(recurrenceRule.repeatWeekdays)) {
        throw new ValidationError('반복 요일은 배열 형태여야 합니다.');
      }

      const startDay = start.getDay();

      if (recurrenceRule.repeatWeekdays.length === 0) {
        throw new ValidationError('반복 요일은 최소 1개 이상 선택해야 합니다.');
      }

      if (!recurrenceRule.repeatWeekdays.includes(startDay)) {
        recurrenceRule.repeatWeekdays.push(startDay);
      }

      const isValid = recurrenceRule.repeatWeekdays.every(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6
      );
      if (!isValid) {
        throw new ValidationError('반복 요일은 0-6 사이의 정수여야 합니다.');
      }

      recurrenceRule.repeatWeekdays = [...new Set(recurrenceRule.repeatWeekdays)];
    }
  }

  return {
    name,
    startDate: start,
    endDate: end,
    color,
    placeName,
    address,
    isImportant,
    isReminding,
    isRecurring,
    remindAt: isReminding ? remindAt : null,
    recurrenceRule: isRecurring ? recurrenceRule : null,
    memo: memo ?? null,
  };
};
