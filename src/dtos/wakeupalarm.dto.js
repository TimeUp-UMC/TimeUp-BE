import { BusinessLogicError } from "../errors/error.js";

// 기상 알람 수정
export const createWakeUpAlarmDTO = (userId, body) => {
    const {
      day,
      is_active,
      is_sound,
      is_vibrating,
      is_repeating,
    } = body;

    const now = new Date();

    return {
      user_id: userId,
      day,
      wakeup_time: wakeTime,
      is_active: is_active ?? true,
      is_repeating: is_repeating ?? true,
      is_sound: is_sound ?? true,
      is_vibrating: is_vibrating ?? true,
      sound_id: sound_id,
      vibration_type: vibration_type,
      repeat_interval: repeat_interval,
      repeat_count: repeat_count,
      updated_at: now
    };
  };

  // 기상 알람 비활성화 
  export const inactiveWakeUpDTO = (body) => {
    const {
      in_active
    } = body

    return {
      in_active: false
    };
  };