import { ValidationError } from '../errors/AppError.js';

// 클라이언트 body → 내부 스케줄 포맷으로 변환 및 유효성 검사
export const bodyToSchedule = (body) => {
  const {
    name,
    startDate,
    endDate,
    color,
    placeName,
    address,
    isImportant = false,
    isReminding = false,
    isRecurring = false,
    remindAt,
    repeatRule,
    memo,
  } = body;

  // 필수값 검사
  if (!name || !startDate || !endDate || !color || !placeName || !address) {
    throw new ValidationError('필수 일정 정보가 누락되었습니다.');
  }

  // 날짜 타입 변환
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) {
    throw new ValidationError('날짜 형식이 올바르지 않습니다.');
  }

  // 리마인드 유효성 검사
  if (isReminding && (typeof remindAt !== 'number' || remindAt < 0)) {
    throw new ValidationError('리마인드 시간은 0 이상의 숫자여야 합니다.');
  }

  // 반복 규칙 유효성 검사 (선택적)
  if (isRecurring && repeatRule) {
    if (!['weekly', 'monthly'].includes(repeatRule.repeatType)) {
      throw new ValidationError('반복 주기는 weekly 또는 monthly여야 합니다.');
    }
    if (!['count', 'until'].includes(repeatRule.repeatMode)) {
      throw new ValidationError('반복 종료 방식은 count 또는 until이어야 합니다.');
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
    repeatRule: isRecurring ? repeatRule : null,
    memo: memo ?? null,
  };
};
