// 기상 알람 수정
export const createWakeUpAlarmDTO = (userId, body) => {
    const {
      day,
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
      day,
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