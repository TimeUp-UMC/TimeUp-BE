export const updateUserDto = {
  email: 'string',
  name: 'string',
  birth: 'YYYY',
  job: '직장인 | 공무원/군인 | 자영업자 | 프리랜서 | 학생 | 무직 | 기타',
  avg_ready_time: 'number (minutes)',
  duration_time: 'number (minutes)',
  alarm_check_time: 'HH:mm',
};

export const feedbackDto = {
  time_rating: 'number (1~5)',
  wakeup_rating: 'number (1~5)',
  comment: 'string (optional)',
};