import { bodyToSchedule } from '../dtos/schedule.dto.js';
import { createScheduleWithRules } from '../services/scheduleCreate.service.js';
import {
  UnauthorizedError,
  InternalServerError,
  ValidationError,
} from '../errors/error.js';
import {
  createEvent,
  getOrCreateNamedCalendar,
} from '../services/google-calendar.service.js';
import { bodyToGoogleCalendar } from '../dtos/google-calendar.dto.js';

// 일정 등록

export const handleCreateSchedule = async (req, res, next) => {
  try {
    const userId = Number(req.user?.user_id);

    if (!userId) {
      throw new UnauthorizedError();
    }

    const scheduleData = bodyToSchedule(req.body);
    const scheduleId = await createScheduleWithRules(userId, scheduleData);

    // 구글 캘린더에서 timeup 캘린더 ID 확보 (없으면 생성)
    const cal = await getOrCreateNamedCalendar(userId, 'timeup');
    const timeupCalendarId = cal.id;

    const dtoInput = { ...req.body, calendar_id: timeupCalendarId };
    const googleCalendarData = bodyToGoogleCalendar(dtoInput);
    const googleCalendarRes = await createEvent(
      userId,
      googleCalendarData.calendarId,
      googleCalendarData.requestBody
    );

    return res.success(
      {
        message: '일정이 등록되었습니다.',
        schedule_id: scheduleId,
        google_link: googleCalendarRes.htmlLink,
      },
      200
    );
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UnauthorizedError
    ) {
      return res.error(error, error.status);
    }

    const internalError = new InternalServerError();
    return res.error(internalError, internalError.status);
  }
};
