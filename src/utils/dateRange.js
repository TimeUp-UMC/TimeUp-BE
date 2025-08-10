import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// UTC >> KST 변환
export const utcToKstDate = (input) => {
  const d = input instanceof Date ? input : new Date(input);
  return new Date(d.getTime() + 9 * 60 * 60 * 1000);
};

// KST 기준으로 하루의 시작과 끝 범위 반환
export const getKSTDateRange = (dateStr) => {
  const start = dayjs.tz(`${dateStr} 00:00:00`, 'Asia/Seoul').toDate();
  const end = dayjs.tz(`${dateStr} 23:59:59.999`, 'Asia/Seoul').toDate();
  return { start, end };
};
