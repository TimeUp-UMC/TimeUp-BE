// 자동 알람 등록
export const createAutoAlarmDTO = (user_id, body) => {
  const {
    schedule_id,
    wakeup_time,
    is_active,
    is_repeating,
    repeat_interval,
    repeat_count,
    created_at,
    is_sound,
    is_vibrating,
    sound_id,
    vibration_type,
  } = body;
};

// 자동 알람 수정
export const updateAutoAlarmDTO = (ATalarmId, body) => {
  const {
    is_repeating,
    is_sound,
    is_vibrating,
    vibration_type,
    sound_id,
    repeat_interval,
    repeat_count,
  } = body;

  return {
    auto_alarm_id: ATalarmId,
    is_repeating,
    is_sound,
    is_vibrating,
    vibration_type,
    sound_id,
    repeat_interval,
    repeat_count,
  };
};

// 자동 알람 비활성화
export const activeAutoAlarmDTO = (scheduleId, currentState) => {
  return {
    schedule_id: scheduleId,
    is_active: !currentState, // 호출 시마다 상태를 반전시켜 반환
  };
};

// 자동 알람 조회
export const getAutoAlarmDTO = (AutoAlarm) => {
  const date = new Date(AutoAlarm.wakeup_time);

  return {
    user_id: AutoAlarm.user_id,
    wakeup_time: date,
    is_active: AutoAlarm.is_active,
  };
};
