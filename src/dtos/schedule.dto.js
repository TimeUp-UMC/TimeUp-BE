import { ValidationError } from '../errors/error.js';

// 색상 리스트 (enum)
const allowedColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'pink'];

// 리마인드 알람 리스트 (enum)
const allowedRemindValues = [0, 5, 10, 30, 60, 1440];

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

  // 색상 유효성 검사
  if (!allowedColors.includes(color)) {
    throw new ValidationError(`허용되지 않는 색상입니다. 사용 가능한 색상: ${allowedColors.join(', ')}`);
  }

  // 날짜 타입 변환
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start) || isNaN(end)) {
    throw new ValidationError('날짜 형식이 올바르지 않습니다.');
  }

  // 리마인드 유효성 검사
  if (isReminding) {
    if (typeof remindAt !== 'number' || !allowedRemindValues.includes(remindAt)) {
      throw new ValidationError(
        '리마인드 시간은 지정된 옵션 중 하나여야 합니다 (0, 5, 10, 30, 60, 1440)'
      );
    }
  }

  // 반복 규칙 유효성 검사 (선택적)
  if (isRecurring && repeatRule) {
    if (!['weekly', 'monthly'].includes(repeatRule.repeatType)) {
      throw new ValidationError('반복 주기는 weekly 또는 monthly여야 합니다.');
    }
    if (!['count', 'until'].includes(repeatRule.repeatMode)) {
      throw new ValidationError('반복 종료 방식은 count 또는 until이어야 합니다.');
    }

    // 반복 종료일이 시작일보다 빠르면 안 됨
    if (
      repeatRule.repeatMode === 'until' &&
      repeatRule.repeatUntilDate &&
      new Date(repeatRule.repeatUntilDate) < start
    ) {
      throw new ValidationError('반복 종료일은 시작일 이후여야 합니다.');
    }

    // 반복 횟수는 1 이상
    if (
      repeatRule.repeatMode === 'count' &&
      (typeof repeatRule.repeatCount !== 'number' || repeatRule.repeatCount < 1)
    ) {
      throw new ValidationError('반복 횟수는 1 이상의 숫자여야 합니다.');
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
