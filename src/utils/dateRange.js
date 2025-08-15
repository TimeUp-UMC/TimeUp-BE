import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import weekday from 'dayjs/plugin/weekday.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(timezone);
dayjs.extend(timezone);

// UTC → KST +09:00 ISO 문자열 변환
export const utcToKstDate = (input) => {
  if (!input) return null;
  const d = dayjs(input).tz('Asia/Seoul');
  // YYYY-MM-DDTHH:mm:ss+09:00
  return d.format('YYYY-MM-DDTHH:mm:ssZ');
};

// KST 기준으로 하루의 시작과 끝 반환
export const getKSTDateRange = (dateStr) => {
  const start = dayjs.tz(`${dateStr} 00:00:00`, 'Asia/Seoul').toDate();
  const end = dayjs.tz(`${dateStr} 23:59:59.999`, 'Asia/Seoul').toDate();
  return { start, end };
};

// KST 기준 월 시작과 끝 반환
export const getKSTMonthRange = (year, month) => {
  const start = dayjs.tz(`${year}-${month}-01 00:00:00`, 'Asia/Seoul').toDate();
  const end = dayjs.tz(`${year}-${month}-01 00:00:00`, 'Asia/Seoul')
    .add(1, 'month')
    .subtract(1, 'millisecond')
    .toDate();
  return { start, end };
};

// 매달 n번째 요일 (예: 두 번째 화요일)
export const getNthWeekdayOfMonth = (year, month, nth, weekday) => {
  const firstDayOfMonth = dayjs.tz(`${year}-${month}-01`, 'Asia/Seoul');
  let count = 0;

  for (let i = 0; i < 31; i++) {
    const current = firstDayOfMonth.add(i, 'day');
    if (current.month() + 1 !== month) break;

    if (current.day() === weekday) {
      count++;
      if (count === nth) {
        return current.toDate();
      }
    }
  }

  return null;
};

// 매달 특정 날짜 (예: 15일)
export const getDayOfMonth = (year, month, day) => {
  const date = dayjs.tz(`${year}-${month}-${day}`, 'Asia/Seoul');
  if (date.month() + 1 !== month) return null;
  return date.toDate();
};
