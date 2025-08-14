import * as userRepository from '../repositories/user.repository.js';

import { createAlarmFeedback } from '../repositories/user.repository.js';

export const getUserInfo = async (userId) => {
  return await userRepository.findUserById(userId);
};

export const updateUserInfo = async (userId, updateData) => {
  return await userRepository.updateUser(userId, updateData);
};

export const getAlarmCheckTime = async (userId) => {
  return await userRepository.getAlarmCheckTime(userId);
};

export const updateAlarmCheckTime = async (userId, alarm_check_time) => {
  return await userRepository.updateAlarmCheckTime(userId, alarm_check_time);
};

export  const submitAlarmFeedback = async (userId, auto_alarm_id, time_rating, wakeup_rating, comment) => {
  return await userRepository.createAlarmFeedback(userId, auto_alarm_id, time_rating, wakeup_rating, comment);
};