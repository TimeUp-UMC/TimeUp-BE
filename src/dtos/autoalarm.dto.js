// 자동 알람 등록
// export const createAutoAlarmDTO = (user_id, body) => {
//   const {
//     schedule_id,
//     wakeup_time,
//     is_active,
//     is_repeating,
//     repeat_interval,
//     repeat_count,
//     created_at,
//     is_sound,
//     is_vibrating,
//     sound_id,
//     vibration_type,
//   } = body;

//   return {
//     user_id, // 반드시 포함
//     schedule_id,
//     wakeup_time,
//     is_active: is_active ?? true,
//     is_repeating: is_repeating ?? false,
//     repeat_interval,
//     repeat_count,
//     created_at: created_at || new Date(),
//     is_sound: is_sound ?? true,
//     is_vibrating: is_vibrating ?? false,
//     sound_id: sound_id || 1,
//     vibration_type,
//   };
// };

// export const createAutoAlarmDTO = (user_id, body) => {
//   const {
//     schedule_id,
//     wakeup_time,
//     is_active,
//     is_repeating,
//     repeat_interval,
//     repeat_count,
//     created_at,
//     is_sound,
//     is_vibrating,
//     sound_id,
//     vibration_type,
//   } = body;
// };

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

// 자동 알람 설정값 조회 DTO(마이페이지)
export const getMPAutoAlarmDTO = (AutoAlarm, ATalarmId) => {
  return {
    user_id: AutoAlarm.user_id,
    vibration_type: AutoAlarm.vibration_type,
    sound_id: AutoAlarm.sound_id,
    repeat_interval: AutoAlarm.repeat_interval,
    repeat_count: AutoAlarm.repeat_count,
  };
};

// 자동 알람 푸시 알람 DTO
export const pushAutoAlarmDTO = (auto_alarms, token) => {
  return {
    to: token,
    sound: 'default',
    title: '기상 알람',
    body: '알람 해제',
    data: {
      auto_alarm_id: auto_alarms.auto_alarm_id,
      wakeup_time: auto_alarms.wakeup_time,
      is_active: auto_alarms.is_active,
      schedule_id: auto_alarms.schedule_id,
      is_repeating: auto_alarms.is_repeating,
      is_sound: auto_alarms.is_sound,
      is_vibrating: auto_alarms.is_vibrating,
      vibration_type: auto_alarms.vibration_type,
      sound_id: auto_alarms.sound_id,
      repeat_interval: auto_alarms.repeat_interval,
      repeat_count: auto_alarms.repeat_count,
    },
  };
};
