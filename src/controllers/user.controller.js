import * as userService from '../services/user.service.js';
import { submitAlarmFeedback } from '../services/user.service.js'; // ✅ (1) submitAlarmFeedback 함수만 직접 import한 것

export const getUserInfo = async (req, res) => {
  const userId = req.user?.user_id;
  const data = await userService.getUserInfo(userId);
  return res.status(200).json(data);
};

export const updateUserInfo = async (req, res) => {
  const userId = req.user?.user_id;
  const updateData = req.body;
  await userService.updateUserInfo(userId, updateData);
  return res.status(200).json({ message: '개인정보 수정 완료' });
};

export const getAlarmCheckTime = async (req, res) => {
  const userId = req.user?.user_id;
  const data = await userService.getAlarmCheckTime(userId);
  return res.status(200).json({ alarm_check_time: data });
};

export const updateAlarmCheckTime = async (req, res) => {
  const userId = req.user?.user_id;
  const { alarm_check_time } = req.body;
  await userService.updateAlarmCheckTime(userId, alarm_check_time);
  return res.status(200).json({ message: '자동 알람 확인 시간 수정 완료' });
};

export const postAlarmFeedback = async (req, res) => {
  try {
    const userId = req.user?.user_id; // JWT 토큰에서 추출
    const { auto_alarm_id, time_rating, wakeup_rating, comment } = req.body;

    await submitAlarmFeedback(
      userId,
      auto_alarm_id,
      Number(time_rating),
      Number(wakeup_rating),
      comment
    );

    res.status(200).json({ message: '피드백이 성공적으로 저장되었습니다' });
  } catch (error) {
    res.status(400).json({
      message: '피드백 저장 중 오류가 발생했습니다',
      error: error.message,
    });
  }
};
