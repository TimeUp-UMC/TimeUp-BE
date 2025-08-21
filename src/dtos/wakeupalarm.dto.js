// 기상 알람 수정
export const createWakeUpAlarmDTO = (userId, body) => {
    const {
      wakeup_time,
      is_active,
      is_sound,
      is_vibrating,
      is_repeating,
      sound_id,
      vibration_type,
      repeat_interval,
      repeat_count,
      memo
    } = body;

    const now = new Date();

    return {
      user_id: userId,
      wakeup_time: wakeup_time,
      is_active: is_active ?? true,
      is_repeating: is_repeating ?? true,
      is_sound: is_sound ?? true,
      is_vibrating: is_vibrating ?? true,
      sound_id,
      vibration_type,
      repeat_interval,
      repeat_count,
      memo,
      updated_at: now
    };
  };

// 기상 알람 비활성화 
export const activeWakeUpAlarmDTO = (userId, currentState) => {
  return {
    user_id: userId,
    is_active: !currentState, // 호출 시마다 상태를 반전시켜 반환
    updated_at: new Date(),
  };
};

// 기상 알람 조회
export const getWakeUpAlarmDTO = (WakeUpAlarm) => {
  return {
    user_id: WakeUpAlarm.userId,
    wakeup_alarm_id: WakeUpAlarm.wakeup_alarm_id,
    wakeup_time: WakeUpAlarm.wakeup_time,
    is_active: WakeUpAlarm.is_active,
    is_repeating: WakeUpAlarm.is_repeating, 
    is_sound: WakeUpAlarm.is_sound, 
    is_vibrating: WakeUpAlarm.is_vibrating,
    vibration_type: WakeUpAlarm.vibration_type, 
    sound_id: WakeUpAlarm.sound_id, 
    repeat_interval: WakeUpAlarm.repeat_count, 
    repeat_count: WakeUpAlarm.repeat_count, 
    memo: WakeUpAlarm.memo,
    day: WakeUpAlarm.day
  }
};

// 기상 알람 푸시 알람 DTO
export const pushWakeUpAlarmDTO = (wakeup_alarms, token) => {
  const rawData = {
    wakeup_alarm_id: wakeup_alarms.wakeup_alarm_id,
    wakeup_time: wakeup_alarms.wakeup_time ? new Date(wakeup_alarms.wakeup_time).toISOString(): '',
    memo: typeof my_alarms.memo === 'string'
    ? my_alarms.memo
    : my_alarms.memo != null
      ? JSON.stringify(my_alarms.memo)
      : ''
  };

  // string 으로 변환
  const data = Object.fromEntries(
    Object.entries(rawData).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : String(value ?? '')
    ])
  );
  return {
    token, 
    notification: {
      title: '기상 알람',
      body: '알람 해제',
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
    data
  };
};