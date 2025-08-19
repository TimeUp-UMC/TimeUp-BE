import { findSchedulesForDay } from '../repositories/scheduleDaily.repository.js';
import { getNthWeekdayOfMonth, getDayOfMonth } from '../utils/dateRange.js';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = 'Asia/Seoul';
const ENABLE_DEBUG = false;

// ---- 작은 유틸(플러그인 없이 비교/클램프) ----
const minD = (a, b) => (a.isBefore(b) ? a : b);
const maxD = (a, b) => (a.isAfter(b) ? a : b);

const formatKST = (d) => dayjs(d).tz(TZ).format('YYYY-MM-DDTHH:mm:ss');

// ISO(UTC)로 반환하되, '발생 일자(KST)의 시분초'를 원본 시분초로 맞춤
const buildOccurrenceUTC = (baseDate, targetDayKST /* dayjs */) => {
  const base = dayjs(baseDate).tz(TZ);
  const kst = targetDayKST
    .tz(TZ)
    .hour(base.hour())
    .minute(base.minute())
    .second(base.second())
    .millisecond(base.millisecond());
  return kst.format('YYYY-MM-DDTHH:mm:ss');
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

/**
 * 컨트롤러 시그니처에 맞춰 'schedules' 배열만 반환합니다.
 * 각 아이템은 { scheduleId, name, start_date, end_date, color } 형태입니다.
 */
export const getDailySchedule = async (userId, date) => {
  try {
    // date: 'YYYY-MM-DD'
    const [year, month, day] = date.split('-').map((n) => parseInt(n, 10));

    // 이 날의 [start, endExclusive) (KST)
    const dayStart = dayjs.tz(`${date} 00:00:00`, TZ).startOf('day');
    const dayEndExclusive = dayStart.add(1, 'day');

    if (ENABLE_DEBUG) {
      console.log('[DEBUG] Day KST Range:', {
        dayStart: dayStart.format(),
        dayEndExclusive: dayEndExclusive.format(),
      });
    }

    // DB 로드 (비반복 교집합 + 반복 전부)
    const rows = await findSchedulesForDay(
      userId,
      dayStart.toDate(),
      dayEndExclusive.toDate()
    );
    if (ENABLE_DEBUG) console.log('[DEBUG] rows:', JSON.stringify(rows, null, 2));

    const out = []; // 최종: schedules 배열

    // ─────────────────────────────────────────────────────────────
    // 비반복 스팬: [start, end) ∩ 당일 있으면 포함
    // (버그 FIX) 교집합 판정은 시간 단위 비교 s < e 로 해야 함
    // ─────────────────────────────────────────────────────────────
    const addSpanIfTouches = (row) => {
      let s = dayjs(row.start_date).tz(TZ);
      let e = dayjs(row.end_date).tz(TZ);
      if (!s.isValid() || !e.isValid() || e.isBefore(s)) return;

      s = maxD(s, dayStart);
      e = minD(e, dayEndExclusive);

      // ✅ 핵심 수정: 'day' 단위가 아니라 '시간' 비교로 교집합 체크
      if (s.isBefore(e)) {
        out.push({
          scheduleId: row.schedule_id,
          name: row.name,
          start_date: formatKST(row.start_date),
          end_date: formatKST(row.end_date),
          color: row.color,
        });
      }
    };

    // weekly: 당일이 발생일인가?
    const addWeeklyIfOccursToday = (row) => {
      const rr = row.recurrence_rule;
      const start = dayjs(row.start_date).tz(TZ).startOf('day');
      const until =
        rr.repeat_mode === 'until' && rr.repeat_until_date
          ? dayjs(rr.repeat_until_date).tz(TZ).startOf('day')
          : null;

      // 모드 무관 count 우선
      const countLimit = Number(rr?.repeat_count) > 0 ? Number(rr.repeat_count) : 0;

      let weekdays = Array.isArray(rr?.repeat_weekdays)
        ? rr.repeat_weekdays.slice()
        : [];
      if (!weekdays.length) weekdays = [start.day()];

      // 당일이 start 이전이면 불가
      if (dayStart.isBefore(start, 'day')) return;
      // until(exclusive) 제한
      if (until && !dayStart.isBefore(until, 'day')) return;
      // 요일 매칭
      if (!weekdays.includes(dayStart.day())) return;

      // count 제한: 첫 유효 발생부터 당일까지 요일 일치 건을 카운트
      if (countLimit > 0) {
        const firstValid = findFirstValidWeekly(start, weekdays);
        let emitted = 0;

        // firstValid ~ dayStart 전날까지 요일 일치 카운트
        for (
          let cur = firstValid;
          cur.isBefore(dayStart, 'day');
          cur = cur.add(1, 'day')
        ) {
          if (cur.isBefore(start, 'day')) continue;
          if (!weekdays.includes(cur.day())) continue;
          emitted += 1;
          if (countLimit > 0 && emitted >= countLimit) break;
        }
        // 당일(실제 발생일) 포함
        emitted += 1;
        if (emitted > countLimit) return;
      }

      // 발생 → 당일 시각으로 start/end를 재구성해서 반환
      out.push({
        scheduleId: row.schedule_id,
        name: row.name,
        start_date: buildOccurrenceUTC(row.start_date, dayStart),
        end_date: buildOccurrenceUTC(row.end_date, dayStart),
        color: row.color,
      });
    };

    // monthly: 당일이 규칙의 후보와 일치하는가?
    const addMonthlyIfOccursToday = (row) => {
      const rr = row.recurrence_rule;
      const start = dayjs(row.start_date).tz(TZ).startOf('day');
      const until =
        rr.repeat_mode === 'until' && rr.repeat_until_date
          ? dayjs(rr.repeat_until_date).tz(TZ).startOf('day')
          : null;

      const countLimit = Number(rr?.repeat_count) > 0 ? Number(rr.repeat_count) : 0;

      if (dayStart.isBefore(start, 'day')) return;
      if (until && !dayStart.isBefore(until, 'day')) return;

      // 이번 달 후보
      let candidate = null;
      if (rr.monthly_repeat_option === 'by_day_of_month' && rr.day_of_month) {
        const d = getDayOfMonth(year, month, rr.day_of_month);
        candidate = d ? dayjs(d).tz(TZ).startOf('day') : null;
      } else if (
        rr.monthly_repeat_option === 'by_nth_weekday' &&
        rr.nth_week &&
        (rr.weekday !== null && rr.weekday !== undefined)
      ) {
        const d = getNthWeekdayOfMonth(year, month, rr.nth_week, rr.weekday);
        candidate = d ? dayjs(d).tz(TZ).startOf('day') : null;
      }
      if (!candidate) return;
      if (candidate.date() !== day) return;

      // count 제한: firstValid를 1회차로 간주
      if (countLimit > 0) {
        const findFirstValid = () => {
          let y = start.year();
          let m = start.month() + 1;
          for (let i = 0; i < 36; i++) {
            let dd = null;
            if (rr.monthly_repeat_option === 'by_day_of_month' && rr.day_of_month) {
              dd = getDayOfMonth(y, m, rr.day_of_month);
            } else if (
              rr.nth_week &&
              (rr.weekday !== null && rr.weekday !== undefined)
            ) {
              dd = getNthWeekdayOfMonth(y, m, rr.nth_week, rr.weekday);
            }
            if (dd) {
              const dk = dayjs(dd).tz(TZ).startOf('day');
              if (!dk.isBefore(start, 'day')) return dk;
            }
            m += 1;
            if (m > 12) {
              m = 1;
              y += 1;
            }
          }
          return null;
        };

        const firstValid = findFirstValid();
        if (!firstValid) return;

        const ym = (y, m) => y * 12 + (m - 1);
        const seq =
          ym(candidate.year(), candidate.month() + 1) -
          ym(firstValid.year(), firstValid.month() + 1) +
          1;

        if (seq > countLimit) return;
      }

      out.push({
        scheduleId: row.schedule_id,
        name: row.name,
        start_date: buildOccurrenceUTC(row.start_date, dayStart),
        end_date: buildOccurrenceUTC(row.end_date, dayStart),
        color: row.color,
      });
    };

    // 전개
    for (const row of rows) {
      if (!row.is_recurring || !row.recurrence_rule) {
        addSpanIfTouches(row);
        continue;
      }
      if (row.recurrence_rule.repeat_type === 'weekly') {
        addWeeklyIfOccursToday(row);
      } else if (row.recurrence_rule.repeat_type === 'monthly') {
        addMonthlyIfOccursToday(row);
      } else {
        // 미지정 타입: 시작일이 당일이면 보수적으로 포함
        const s = dayjs(row.start_date).tz(TZ).startOf('day');
        if (s.isSame(dayStart, 'day')) {
          out.push({
            scheduleId: row.schedule_id,
            name: row.name,
            start_date: formatKST(row.start_date),
            end_date: formatKST(row.end_date),
            color: row.color,
          });
        }
      }
    }

    if (ENABLE_DEBUG) {
      console.log('[DEBUG] Daily result:', JSON.stringify(out, null, 2));
    }

    return out; // 컨트롤러는 그대로 res.success({ schedules, googleSchedules })
  } catch (err) {
    console.error('[DAILY][ERROR]', err && err.stack ? err.stack : err);
    throw err;
  }
};
