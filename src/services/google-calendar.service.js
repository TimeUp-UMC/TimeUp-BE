import { BusinessLogicError } from '../errors/error.js';
import { createOAuthClientForUser } from '../utils/googleCalendarClient.js';
import { google } from 'googleapis';

const DEFAULT_TZ = 'Asia/Seoul';
const TIMEUP_SUMMARY = 'timeup';

export const getOrCreateNamedCalendar = async (
  userId,
  summary = TIMEUP_SUMMARY
) => {
  try {
    const auth = await createOAuthClientForUser(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    // 1) 목록에서 timeup 캘린더 찾기
    const list = await calendar.calendarList.list();
    const items = list.data.items || [];
    const found = items.find(
      (c) => (c.summary || '').toLowerCase() === summary.toLowerCase()
    );
    if (found) return found;

    // 2) 없으면 생성
    const created = await calendar.calendars.insert({
      requestBody: {
        summary,
        timeZone: DEFAULT_TZ,
      },
    });

    return created.data;
  } catch (err) {
    throw BusinessLogicError(err?.message || 'Google Calendar error');
  }
};

export const createEvent = async (userId, calendarId, event) => {
  try {
    // event: { summary, description?, location?, start: { dateTime, timeZone? }, end: { dateTime, timeZone? } }
    const auth = await createOAuthClientForUser(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });
    return res.data;
  } catch (err) {
    throw BusinessLogicError(err?.message || 'Google Calendar error');
  }
};

const normalizeStartEnd = (evt) => {
  // Google은 all-day면 date, 시간 이벤트면 dateTime을 줌
  const s = evt.start?.dateTime || evt.start?.date;
  const e = evt.end?.dateTime || evt.end?.date;
  return { start_date: s, end_date: e };
};

const normalizeStartEndUTC = (evt) => {
  // Google은 all-day면 date, 시간 이벤트면 dateTime을 줌
  const s = evt.start?.dateTime || evt.start?.date;
  const e = evt.end?.dateTime || evt.end?.date;
  return {
    start_date: new Date(s).toISOString(),
    end_date: new Date(e).toISOString(),
  };
};

const getMonthRange = (year, month) => {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endExclusive = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  return { timeMin: start.toISOString(), timeMax: endExclusive.toISOString() };
};

const getDayRange = (yyyyMmDd) => {
  const timeMin = `${yyyyMmDd}T00:00:00+09:00`;
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d) + 24 * 60 * 60 * 1000);
  const y2 = next.getUTCFullYear();
  const m2 = String(next.getUTCMonth() + 1).padStart(2, '0');
  const d2 = String(next.getUTCDate()).padStart(2, '0');
  const timeMax = `${y2}-${m2}-${d2}T00:00:00+09:00`;
  return { timeMin, timeMax };
};

const listNonTimeupCalendars = async (userId) => {
  try {
    const auth = await createOAuthClientForUser(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const res = await calendar.calendarList.list();
    const items = res.data.items || [];

    // summary가 'timeup'인 캘린더 제외
    return items.filter(
      (c) => (c.summary || '').toLowerCase() !== TIMEUP_SUMMARY.toLowerCase()
    );
  } catch (err) {
    throw new BusinessLogicError(err?.message);
  }
};

const listEventsForCalendar = async (
  calendar,
  calendarId,
  timeMin,
  timeMax
) => {
  try {
    const all = [];
    let pageToken;

    do {
      const res = await calendar.events.list({
        calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        showDeleted: false,
        orderBy: 'startTime',
        maxResults: 100,
        pageToken,
        timeZone: 'Asia/Seoul',
      });
      all.push(...(res.data.items || []));
      pageToken = res.data.nextPageToken;
    } while (pageToken);

    return all;
  } catch (err) {
    throw new BusinessLogicError(err?.message);
  }
};

//월별 조회
export const fetchGoogleMonthlyMarkers = async (userId, year, month) => {
  try {
    const auth = await createOAuthClientForUser(userId);
    const calendar = google.calendar({ version: 'v3', auth });
    const { timeMin, timeMax } = getMonthRange(year, month);
    const calendars = await listNonTimeupCalendars(userId);

    const dayMap = {};

    for (const cal of calendars) {
      const events = await listEventsForCalendar(
        calendar,
        cal.id,
        timeMin,
        timeMax
      );

      for (const evt of events) {
        const { start_date, end_date } = normalizeStartEnd(evt);

        const start = new Date(start_date);
        const end = new Date(end_date);

        for (
          let dt = new Date(
            Date.UTC(
              start.getUTCFullYear(),
              start.getUTCMonth(),
              start.getUTCDate()
            )
          );
          dt < end;
          dt = new Date(dt.getTime() + 24 * 60 * 60 * 1000)
        ) {
          const day = dt.getUTCDate().toString();
          dayMap[day] ||= [];
          dayMap[day].push({ color: 'red' }); // 색상은 red로 표시
        }
      }
    }

    return dayMap;
  } catch (err) {
    throw new BusinessLogicError(err?.message);
  }
};

// 일별 조회
export const fetchGoogleDailySchedules = async (userId, date) => {
  try {
    const auth = await createOAuthClientForUser(userId);
    const calendar = google.calendar({ version: 'v3', auth });
    const { timeMin, timeMax } = getDayRange(date);
    const calendars = await listNonTimeupCalendars(userId);

    const googleSchedules = [];

    for (const cal of calendars) {
      const events = await listEventsForCalendar(
        calendar,
        cal.id,
        timeMin,
        timeMax
      );

      for (const evt of events) {
        const { start_date, end_date } = normalizeStartEnd(evt);
        googleSchedules.push({
          scheduleId: evt.id, // DB 스케줄 아님
          name: evt.summary || '(제목 없음)',
          start_date,
          end_date,
          color: 'red',
          url: evt.htmlLink,
        });
      }
    }

    return googleSchedules;
  } catch (err) {
    throw new BusinessLogicError(err?.message);
  }
};

// 자동 알람 계산을 위해 장소 데이터 추가
export const fetchGoogleDailySchedule_alarm = async (userId, date) => {
  try {
    const auth = await createOAuthClientForUser(userId);
    const calendar = google.calendar({ version: 'v3', auth });
    const { timeMin, timeMax } = getDayRange(date);
    const calendars = await listNonTimeupCalendars(userId);

    const googleSchedules = [];

    for (const cal of calendars) {
      const events = await listEventsForCalendar(
        calendar,
        cal.id,
        timeMin,
        timeMax
      );

      for (const evt of events) {
        const { start_date, end_date } = normalizeStartEnd(evt);

        // 장소 정보 가져오기
        const address = evt.location || '(장소 정보 없음)';

        googleSchedules.push({
          schedule_id: evt.id, // DB 스케줄 아님
          name: evt.summary || '(제목 없음)',
          start_date,
          end_date,
          address, // 장소 정보 추가
          color: 'red',
          url: evt.htmlLink,
        });
      }
    }

    return googleSchedules;
  } catch (err) {
    throw new BusinessLogicError(err?.message);
  }
};
