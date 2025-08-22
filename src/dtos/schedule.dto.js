import { ValidationError } from '../errors/error.js';

const allowedColors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'pink'];
const allowedRemindValues = [0, 5, 10, 30, 60, 1440];

export const bodyToSchedule = (body) => {
  const {
    name,
    start_date,
    end_date,
    color = 'red',
    place_name,
    address,
    is_important = false,
    is_reminding = false,
    is_recurring = false,
    remind_at,
    recurrence_rule,
    memo,
  } = body;

  // 필수값 검사
  if (!name || !start_date || !end_date || !color || !place_name || !address) {
    throw new ValidationError('필수 일정 정보가 누락되었습니다.');
  }

  // 날짜 변환 및 유효성 검사
  const start = new Date(start_date);
  const end = new Date(end_date);
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
  if (is_reminding) {
    if (typeof remind_at !== 'number' || !allowedRemindValues.includes(remind_at)) {
      throw new ValidationError(`리마인드 시간은 지정된 옵션 중 하나여야 합니다. 사용 가능한 옵션: ${allowedRemindValues.join(', ')}`);
    }
  }

  // 반복 규칙 유효성 검사
  if (is_recurring && recurrence_rule) {
    if (!['weekly', 'monthly'].includes(recurrence_rule.repeat_type)) {
      throw new ValidationError('반복 주기는 weekly 또는 monthly여야 합니다.');
    }

    if (!['count', 'until'].includes(recurrence_rule.repeat_mode)) {
      throw new ValidationError('반복 종료 방식은 count 또는 until이어야 합니다.');
    }

    if (
      recurrence_rule.repeat_mode === 'until' &&
      recurrence_rule.repeat_until_date &&
      new Date(recurrence_rule.repeat_until_date) < start
    ) {
      throw new ValidationError('반복 종료일은 시작일 이후여야 합니다.');
    }

    if (
      recurrence_rule.repeat_mode === 'count' &&
      (typeof recurrence_rule.repeat_count !== 'number' || recurrence_rule.repeat_count < 1)
    ) {
      throw new ValidationError('반복 횟수는 1 이상의 숫자여야 합니다.');
    }

    if (recurrence_rule.repeat_type === 'weekly') {
      if (!Array.isArray(recurrence_rule.repeat_weekdays)) {
        throw new ValidationError('반복 요일은 배열 형태여야 합니다.');
      }

      const startDay = start.getDay();

      if (recurrence_rule.repeat_weekdays.length === 0) {
        throw new ValidationError('반복 요일은 최소 1개 이상 선택해야 합니다.');
      }

      if (!recurrence_rule.repeat_weekdays.includes(startDay)) {
        recurrence_rule.repeat_weekdays.push(startDay);
      }

      const isValid = recurrence_rule.repeat_weekdays.every(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6
      );
      if (!isValid) {
        throw new ValidationError('반복 요일은 0-6 사이의 정수여야 합니다.');
      }

      recurrence_rule.repeat_weekdays = [...new Set(recurrence_rule.repeat_weekdays)];
    }
  }

  return {
    name,
    start_date: start,
    end_date: end,
    color,
    place_name,
    address,
    is_important,
    is_reminding,
    remind_at: is_reminding ? remind_at : null,
    is_recurring,
    recurrence_rule: is_recurring ? recurrence_rule : null,
    memo: memo ?? null,
  };
};

// 일정 알람 푸시 알람 DTO
export const pushScheduleAlarmDTO = (schedule, token, remindAt) => {
  const rawData = {
    schedule_id: String(schedule.schedule_id),
    start_date: schedule.start_date
      ? new Date(schedule.start_date).toISOString()
      : '',
    end_date: schedule.end_date
      ? new Date(schedule.end_date).toISOString()
      : '',
    place_name: schedule.place_name,
    address: schedule.address,
    remind_at: remindAt ? String(remindAt) : ''
  };

  // 메세지 정의
  const RemindMessage = (remindAt) => {
    if (remindAt === 0) return '일정이 지금 시작됩니다.';
    if (remindAt === 60) return '1시간 뒤에 일정이 시작됩니다.';
    if (remindAt === 1440) return '1일 뒤에 일정이 시작됩니다.';
    return `${remindAt}분 뒤에 일정이 시작됩니다.`;
  };

  return {
    token,
    notification: {
      title: schedule.name,
      body: RemindMessage(remindAt)
    },
    android: {
      notification: {
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
    data: rawData
  };
};
