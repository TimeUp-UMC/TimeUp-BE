import { findSchedulesByMonth } from '../repositories/scheduleMonthly.repository.js';
import {
  getKSTMonthRange,
  getNthWeekdayOfMonth,
  getDayOfMonth,
} from '../utils/dateRange.js';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Seoul';
const ENABLE_DEBUG = true;

// ---- 작은 유틸 (플러그인 없이 min/max/비교 대체) ----
const minD = (a, b) => (a.isBefore(b) ? a : b);
const maxD = (a, b) => (a.isAfter(b) ? a : b);
const gteDay = (a, b) => !a.isBefore(b, 'day'); // a >= b (day 단위)
const lteDay = (a, b) => !a.isAfter(b, 'day');  // a <= b (day 단위)

// 같은 연·월인지(KST)
const isSameYearMonthKST = (d, year, month) => {
  const k = dayjs(d).tz(TZ);
  return k.year() === year && (k.month() + 1) === month;
};

// 푸시
const pushMarker = (grouped, d, schedule_id, color, year, month) => {
  const k = dayjs(d).tz(TZ).startOf('day');
  if (!isSameYearMonthKST(k, year, month)) return;
  const dayKey = String(k.date());
  (grouped[dayKey] ||= []).push({ scheduleId: schedule_id, color });
  if (ENABLE_DEBUG) {
    console.log('[DEBUG][PUSH]', { schedule_id, color, dayKey, dateKST: k.format('YYYY-MM-DD') });
  }
};

// weekly/count: 첫 유효 발생(= start 이후 첫 요일 일치)
const findFirstValidWeekly = (start, weekdays) => {
  if (weekdays.includes(start.day())) return start;
  for (let i = 1; i <= 6; i++) {
    const cand = start.add(i, 'day');
    if (weekdays.includes(cand.day())) return cand;
  }
  return start; // 안전장치
};

// weekly/count: 마지막 발생(횟수 기준)
const calcWeeklyLastOccurrenceByCount = (firstValid, weekdays, countLimit, hardEndExclusive) => {
  let emitted = 0;
  let last = null;
  const MAX_DAYS = 366 * 2; // 안전 가드
  for (let i = 0, cur = firstValid; i < MAX_DAYS && cur.isBefore(hardEndExclusive, 'day'); i++, cur = cur.add(1, 'day')) {
    if (!weekdays.includes(cur.day())) continue;
    if (!cur.isBefore(hardEndExclusive, 'day')) break;
    emitted += 1;
    last = cur;
    if (emitted >= countLimit) break;
  }
  return last;
};

export const getMonthlySchedule = async (userId, year, month) => {
  try {
    if (ENABLE_DEBUG) {
      console.log('\n[DEBUG] === getMonthlySchedule START ===');
      console.log('[DEBUG] Params:', { userId, year, month });
    }

    // DB 로드
    const rows = await findSchedulesByMonth(userId, year, month);
    if (ENABLE_DEBUG) {
      console.log('[DEBUG] Raw DB rows:', JSON.stringify(rows, null, 2));
    }

    // KST 월 범위
    const { start: monthStartDate, end: monthEndDate } = getKSTMonthRange(year, month);
    const monthStart = dayjs(monthStartDate).tz(TZ).startOf('day');
    const monthEndExclusive = dayjs(monthEndDate).tz(TZ).add(1, 'millisecond'); // [start, end)

    if (ENABLE_DEBUG) {
      console.log('[DEBUG] Month KST Range:', {
        monthStart: monthStart.format(),
        monthEndExclusive: monthEndExclusive.format(),
      });
    }

    const grouped = {}; // { "1": [{ schedule_id, color }], ... }

    // 스팬 전개: [start, end) ∩ [monthStart, monthEndExclusive)
    const expandSpan = (start, end, schedule_id, color) => {
      let s = dayjs(start).tz(TZ);
      let e = dayjs(end).tz(TZ);
      if (!s.isValid() || !e.isValid()) return;

      s = s.isBefore(monthStart) ? monthStart : s;
      e = e.isAfter(monthEndExclusive) ? monthEndExclusive : e;

      // ① 길이 0(= e <= s)인 경우: 시작일 하루는 표시
      if (!e.isAfter(s)) {
        pushMarker(grouped, s.startOf('day'), schedule_id, color, year, month);
        return;
      }

      // ② 길이 > 0인 경우: [s, e) 가 포함하는 '날짜'들을 전부 표시
      //    종료는 exclusive이므로 e-1ms 의 '날짜'까지 포함
      const lastDay = e.subtract(1, 'millisecond').startOf('day');
      for (let cur = s.startOf('day'); !cur.isAfter(lastDay, 'day'); cur = cur.add(1, 'day')) {
        pushMarker(grouped, cur, schedule_id, color, year, month);
      }
    };

    // weekly 전개
    const expandWeekly = (row) => {
      const { schedule_id, color, start_date, recurrence_rule: rr } = row;
      if (ENABLE_DEBUG) console.log(`[DEBUG] expandWeekly for schedule_id=${schedule_id}`, rr);

      const start = dayjs(start_date).tz(TZ).startOf('day');
      const until = (rr.repeat_mode === 'until' && rr.repeat_until_date)
        ? dayjs(rr.repeat_until_date).tz(TZ).startOf('day')
        : null;

      // 모드 무관 count 우선
      const countLimit = Number(rr && rr.repeat_count) > 0 ? Number(rr.repeat_count) : 0;

      let weekdays = Array.isArray(rr && rr.repeat_weekdays) ? rr.repeat_weekdays.slice() : [];
      if (!weekdays.length) weekdays = [start.day()];

      const scanStart = start.isBefore(monthStart, 'day') ? start : monthStart;
      const scanEnd = until ? (until.isBefore(monthEndExclusive, 'day') ? until : monthEndExclusive) : monthEndExclusive;

      let emitted = 0;
      for (let cur = scanStart; cur.isBefore(scanEnd, 'day'); cur = cur.add(1, 'day')) {
        if (cur.isBefore(start, 'day')) continue;
        if (!weekdays.includes(cur.day())) continue;
        if (countLimit > 0 && emitted >= countLimit) break;

        // isSameOrAfter 대체: !cur.isBefore(monthStart,'day')
        if (!cur.isBefore(monthStart, 'day') && cur.isBefore(monthEndExclusive, 'day')) {
          pushMarker(grouped, cur, schedule_id, color, year, month);
        }
        emitted += 1;
      }
    };

    // monthly 전개
    const expandMonthly = (row) => {
      const { schedule_id, color, start_date, recurrence_rule: rr } = row;
      if (ENABLE_DEBUG) console.log(`[DEBUG] expandMonthly for schedule_id=${schedule_id}`, rr);

      const start = dayjs(start_date).tz(TZ).startOf('day');
      const until = (rr.repeat_mode === 'until' && rr.repeat_until_date)
        ? dayjs(rr.repeat_until_date).tz(TZ).startOf('day')
        : null;

      // 모드 무관 count 우선
      const countLimit = Number(rr && rr.repeat_count) > 0 ? Number(rr.repeat_count) : 0;

      // 이번 달 후보
      let candidate = null;
      if (rr.monthly_repeat_option === 'by_day_of_month' && rr.day_of_month) {
        const d = getDayOfMonth(year, month, rr.day_of_month);
        candidate = d ? dayjs(d).tz(TZ).startOf('day') : null;
      } else if (
        rr.monthly_repeat_option === 'by_nth_weekday' &&
        rr.nth_week && (rr.weekday !== null && rr.weekday !== undefined)
      ) {
        const d = getNthWeekdayOfMonth(year, month, rr.nth_week, rr.weekday);
        candidate = d ? dayjs(d).tz(TZ).startOf('day') : null;
      }
      if (!candidate) return;

      // 첫 유효 발생 찾기(= start 이후 rule 충족)
      const findFirstValid = () => {
        let y = start.year();
        let m = start.month() + 1;
        for (let i = 0; i < 36; i++) {
          let dd = null;
          if (rr.monthly_repeat_option === 'by_day_of_month' && rr.day_of_month) {
            dd = getDayOfMonth(y, m, rr.day_of_month);
          } else if (rr.nth_week && (rr.weekday !== null && rr.weekday !== undefined)) {
            dd = getNthWeekdayOfMonth(y, m, rr.nth_week, rr.weekday);
          }
          if (dd) {
            const dk = dayjs(dd).tz(TZ).startOf('day');
            if (!dk.isBefore(start, 'day')) return dk;
          }
          m += 1; if (m > 12) { m = 1; y += 1; }
        }
        return null;
      };

      const firstValid = findFirstValid();
      if (!firstValid) return;

      // until 제한(exclusive)
      if (until && !candidate.isBefore(until, 'day')) return;

      // count 제한: firstValid=1회차로 간주
      if (countLimit > 0) {
        const ym = (y, m) => y * 12 + (m - 1);
        const seq =
          ym(candidate.year(), candidate.month() + 1) -
          ym(firstValid.year(), firstValid.month() + 1) + 1;
        if (seq > countLimit) return;
      }

      if (!candidate.isBefore(monthStart, 'day') && candidate.isBefore(monthEndExclusive, 'day')) {
        pushMarker(grouped, candidate, schedule_id, color, year, month);
      }
    };

    // 프리-필터: 이 월과 교집합 없으면 스킵
    const rowTouchesMonth = (row) => {
      const start = dayjs(row.start_date).tz(TZ).startOf('day');
      const end   = dayjs(row.end_date).tz(TZ).startOf('day');

      if (!row.is_recurring || !row.recurrence_rule) {
        return start.isBefore(monthEndExclusive, 'day') && end.isAfter(monthStart, 'day');
      }

      // start >= monthEndExclusive → 스킵  (isSameOrAfter 대체)
      if (!start.isBefore(monthEndExclusive, 'day')) return false;

      const rr = row.recurrence_rule;

      // until 모드 종료 검사: until <= monthStart → 스킵
      if (rr && rr.repeat_mode === 'until' && rr.repeat_until_date) {
        const until = dayjs(rr.repeat_until_date).tz(TZ).startOf('day');
        if (lteDay(until, monthStart)) return false;
      }

      // count가 있으면 weekly는 마지막 발생이 monthStart 이전인지 검사
      const countLimit = Number(rr && rr.repeat_count) > 0 ? Number(rr.repeat_count) : 0;
      if (countLimit > 0 && rr.repeat_type === 'weekly') {
        let weekdays = Array.isArray(rr.repeat_weekdays) ? rr.repeat_weekdays.slice() : [];
        if (!weekdays.length) weekdays = [start.day()];
        const until = (rr.repeat_mode === 'until' && rr.repeat_until_date)
          ? dayjs(rr.repeat_until_date).tz(TZ).startOf('day')
          : null;
        const hardEndExclusive = until ? (until.isBefore(monthEndExclusive, 'day') ? until : monthEndExclusive) : monthEndExclusive;
        const firstValid = findFirstValidWeekly(start, weekdays);
        const last = calcWeeklyLastOccurrenceByCount(firstValid, weekdays, countLimit, hardEndExclusive);
        if (last && last.isBefore(monthStart, 'day')) return false;
      }

      return true;
    };

    // 전개
    for (const row of rows) {
      if (!rowTouchesMonth(row)) {
        if (ENABLE_DEBUG) {
          console.log('[DEBUG][SKIP_ROW]', {
            schedule_id: row.schedule_id,
            reason: 'no_intersection_with_month_or_until_passed',
          });
        }
        continue;
      }

      const { schedule_id, color, start_date, end_date, is_recurring, recurrence_rule } = row;

      if (!is_recurring || !recurrence_rule) {
        expandSpan(start_date, end_date, schedule_id, color);
        continue;
      }

      if (recurrence_rule.repeat_type === 'weekly') {
        expandWeekly(row);
      } else if (recurrence_rule.repeat_type === 'monthly') {
        expandMonthly(row);
      } else {
        // 미지정 타입: 시작일만
        pushMarker(grouped, start_date, schedule_id, color, year, month);
      }
    }

    if (ENABLE_DEBUG) {
      console.log('[DEBUG] Final grouped result:', JSON.stringify(grouped, null, 2));
      console.log('[DEBUG] === getMonthlySchedule END ===\n');
    }

    return grouped;
  } catch (err) {
    console.error('[MONTHLY][ERROR]', err && err.stack ? err.stack : err);
    throw err;
  }
};
