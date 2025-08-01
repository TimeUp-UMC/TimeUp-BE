

import * as userRepository from '../repositories/user.repository.js';

export const getUserInfo = (userId) => {
  return userRepository.findUserById(userId);
};

export const updateUserInfo = (userId, updateData) => {
  return userRepository.updateUser(userId, updateData);
};

export  const getAlarmCheckTime = (userId) => {
  return userRepository.getAlarmCheckTime(userId);
};

export  const updateAlarmCheckTime = (userId, alarm_check_time) => {
  return userRepository.updateAlarmCheckTime(userId, alarm_check_time);
};

export  const submitAlarmFeedback = (userId, time_rating, wakeup_rating, comment) => {
  return userRepository.createAlarmFeedback(userId, time_rating, wakeup_rating, comment);
};
