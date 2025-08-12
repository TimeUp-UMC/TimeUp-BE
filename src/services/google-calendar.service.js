import { BusinessLogicError } from '../errors/error.js';
import { createOAuthClientForUser } from '../utils/googleCalendarClient.js';
import { google } from 'googleapis';

const DEFAULT_TZ = 'Asia/Seoul';
const TIMEUP_SUMMARY = 'timeup';

export const listCalendars = async (userId) => {
  const auth = await createOAuthClientForUser(userId);
  const calendar = google.calendar({ version: 'v3', auth });
  const list = await calendar.calendarList.list();
  return list.data.items || [];
};

export const listAllCalendarEvents = async (userId, opts = {}) => {
  const { timeMin, timeMax, maxPerCalendar } = opts;

  const auth = await createOAuthClientForUser(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  const calendarRes = await calendar.calendarList.list();
  const calendars = calendarRes.data.items || [];

  const results = [];

  for (const cal of calendars) {
    const eventsRes = await calendar.events.list({
      calendarId: cal.id,
      timeMin: timeMin || new Date().toISOString(),
      ...(timeMax ? { timeMax } : {}),
      maxResults: maxPerCalendar || 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    results.push({
      calendarId: cal.id,
      calendarSummary: cal.summary,
      events: eventsRes.data.items || [],
    });
  }

  return {
    totalCalendars: calendars.length,
    calendars: results,
  };
};

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
    throw BusinessLogicError(err);
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
    throw BusinessLogicError(err);
  }
};
