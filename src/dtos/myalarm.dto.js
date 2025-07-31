import { BusinessLogicError } from "../errors/error.js";

// 내 알람 등록 + 수정
export const createMyAlarmDTO = (userId, body) => {
    const {
      my_alarm_name,
      my_alarm_time,
      is_active,
      is_repeating,
      is_sound,
      is_vibrating,
      vibration_type,
      sound_id,
      repeat_interval,
      repeat_count,
      memo,
    } = body;
  
    if (!my_alarm_time) throw new BusinessLogicError('알람 시간을 설정하지 않았습니다.', '400');
    if (new Date(my_alarm_time) < new Date()) {
        throw new BusinessLogicError('과거 시간에는 알람을 설정할 수 없습니다.', '422');
      }
      
    const now = new Date();
    const alarmDate = new Date(my_alarm_time);

    return {
      user_id: userId,
      my_alarm_name,
      my_alarm_time: alarmDate,
      is_active: is_active ?? true,
      is_repeating: is_repeating ?? true,
      is_sound: is_sound ?? true,
      is_vibrating: is_vibrating ?? true,
      vibration_type,
      sound_id,
      repeat_interval,
      repeat_count,
      memo,
      created_at: now,
      updated_at: now,
    };
  };

// 내 알람 비활성화
export const activeMyAlarmDTO = (userId, currentState) => {
  return {
    user_id: userId,
    is_active: !currentState, // 호출 시마다 상태를 반전시켜 반환
    updated_at: new Date()
  };
};

// 내 알람 조회
export const getMyalarmDTO = (MyAlarm) => {
  const date = new Date(MyAlarm.my_alarm_time);

  return {
    user_id: MyAlarm.userId,
    my_alarm_name: MyAlarm.my_alarm_name,
    my_alarm_time: date,
    is_active: MyAlarm.is_active
  };
};