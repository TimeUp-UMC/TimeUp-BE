// 자동 알람 수정
export const updateAutoAlarmDTO = (ATalarmId, body) => {
    const {
        is_repeating,
        is_sound,
        is_vibrating,
        vibration_type,
        sound_id,
        repeat_interval,
        repeat_count
    } = body

    return {
        auto_alarm_id: ATalarmId,
        is_repeating,
        is_sound,
        is_vibrating,
        vibration_type,
        sound_id,
        repeat_interval,
        repeat_count
    };
}

// 자동 알람 비활성화
export const inactiveAutoDTO = (body) => {
    const {
        is_actife
    }= body

    return {
        is_active: false
    };
};