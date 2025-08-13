import { BusinessLogicError, NotFoundError } from '../errors/error.js';

const DEFAULT_TZ = 'Asia/Seoul';

const toISOOrThrow = (value, fieldName) => {
  if (!value) throw new NotFoundError(`"${fieldName}" is required`);
  const d = new Date(value);
  if (Number.isNaN(d.getTime()))
    throw new NotFoundError(`"${fieldName}" must be a valid datetime`);
  return d.toISOString();
};

const toAllDayRangeOrNull = (body) => {
  if (!body.is_all_day) return null;

  const start = new Date(body.start_date);
  const end = new Date(body.end_date);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new BusinessLogicError(
      '"start_date"/"end_date" must be valid when is_all_day = true'
    );
  }

  const startDate = start.toISOString().slice(0, 10);
  const endDateObj = new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1)
  );
  const endDate = endDateObj.toISOString().slice(0, 10);

  return {
    start: { date: startDate },
    end: { date: endDate },
  };
};

const normalizeWeekdays = (list) => {
  if (!Array.isArray(list) || list.length === 0) return [];
  return list
    .map((n) => {
      if (n >= 0 && n <= 6) return weekdayToByDay(n);
      if (n >= 1 && n <= 7) return weekdayToByDay(n % 7);
      return null;
    })
    .filter(Boolean);
};

const weekdayToByDay = (n) => {
  const map = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return map[n] || 'MO';
};

const toUntilUTC = (dateInput) => {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime()))
    throw new BusinessLogicError('"repeat_until_date" must be a valid date');
  const y = d.getUTCFullYear().toString().padStart(4, '0');
  const m = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = d.getUTCDate().toString().padStart(2, '0');
  return `${y}${m}${day}T000000Z`;
};

const buildRecurrence = (body) => {
  if (!body.is_recurring) return undefined;

  const r = body.recurrence_rule; // 단수/복수 모두 허용
  if (!r || !r.repeat_type) return undefined;

  const parts = [];

  // FREQ
  if (r.repeat_type === 'weekly') {
    parts.push('FREQ=WEEKLY');
    const weekdays = body.repeat_weekdays || r.repeat_weekdays;
    const days = normalizeWeekdays(weekdays);
    if (days.length > 0) parts.push(`BYDAY=${days.join(',')}`);
  }

  if (r.repeat_type === 'monthly') {
    parts.push('FREQ=MONTHLY');
    const monthlyOpt = r.monthly_repeat_option || r.monthly_option;

    if (monthlyOpt === 'day_of_month' && Number.isInteger(r.day_of_month)) {
      parts.push(`BYMONTHDAY=${r.day_of_month}`);
    } else if (
      monthlyOpt === 'nth_weekday' &&
      Number.isInteger(r.nth_week) &&
      Number.isInteger(r.weekday) &&
      r.weekday >= 0 &&
      r.weekday <= 6
    ) {
      const byday = weekdayToByDay(r.weekday); // 0=SU, 1=MO, ...
      parts.push(`BYDAY=${r.nth_week}${byday}`); // 예: 2TU
    }
  }

  // COUNT / UNTIL
  if (r.repeat_mode === 'count' && Number.isInteger(r.repeat_count)) {
    parts.push(`COUNT=${r.repeat_count}`);
  } else if (r.repeat_mode === 'until' && r.repeat_until_date) {
    parts.push(`UNTIL=${toUntilUTC(r.repeat_until_date)}`);
  }

  return parts.length ? [`RRULE:${parts.join(';')}`] : undefined;
};

const buildLocation = (body) => {
  const parts = [];
  if (body.place_name) parts.push(body.place_name);
  if (body.address) parts.push(body.address);
  return parts.join(' ') || undefined;
};

export const bodyToGoogleCalendar = (body) => {
  const timeZone = body.time_zone || DEFAULT_TZ;
  const allDay = toAllDayRangeOrNull(body);

  if (!allDay) {
    const startISO = toISOOrThrow(body.start_date, 'start_date');
    const endISO =
      new Date(body.end_date).getTime() === new Date(body.start_date).getTime()
        ? new Date(new Date(startISO).getTime() + 60 * 60 * 1000).toISOString()
        : toISOOrThrow(body.end_date, 'end_date');

    if (new Date(startISO) >= new Date(endISO)) {
      throw new BusinessLogicError('"end_date" must be after "start_date"');
    }

    return {
      calendarId: body.calendar_id || 'primary',
      requestBody: {
        summary: body.name,
        description: body.memo || undefined,
        location: buildLocation(body),
        start: { dateTime: startISO, timeZone },
        end: { dateTime: endISO, timeZone },
        colorId: body.colorId ?? '9',
        recurrence: buildRecurrence(body),
      },
    };
  }

  return {
    calendarId: body.calendar_id || 'primary',
    requestBody: {
      summary: body.name,
      description: body.memo || undefined,
      location: buildLocation(body),
      start: allDay.start,
      end: allDay.end,
      colorId: '9' || undefined,
      recurrence: buildRecurrence(body),
    },
  };
};
