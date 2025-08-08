import * as userService from '../services/user.service.js';

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

export const submitAlarmFeedback = async (req, res) => {
  const userId = req.user?.user_id;
  const { time_rating, wakeup_rating, comment } = req.body;
  await userService.submitAlarmFeedback(userId, time_rating, wakeup_rating, comment);
  return res.status(200).json({ message: '피드백이 성공적으로 저장되었습니다' });
};
