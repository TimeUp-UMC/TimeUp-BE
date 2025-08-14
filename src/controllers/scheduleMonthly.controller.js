import { getMonthlySchedule } from '../services/scheduleMonthly.service.js';
import {
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
  ValidationError
} from '../errors/error.js';
import { fetchGoogleMonthlyMarkers } from '../services/google-calendar.service.js';

// 월별 일정 목록 조회

export const handleGetMonthlySchedule = async (req, res, next) => {
  try {
    const userId = Number(req.user?.user_id);
    const { month } = req.query;

    if (!userId) {
      throw new UnauthorizedError();
    }

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new ValidationError(
        'month 파라미터는 YYYY-MM 형식으로 입력해야 합니다.'
      );
    }

    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr);

    const schedules = await getMonthlySchedule(userId, year, monthNum);

    let googleSchedules = {};
    try {
      //구글 오류가 생겨도 db 응답만 반환
      googleSchedules = await fetchGoogleMonthlyMarkers(userId, year, monthNum);
    } catch (err) {
      console.error(err);
      googleSchedules = {};
    }

    const schedulesByDay = { ...(schedules || {}) };

    for (const [day, markers] of Object.entries(googleSchedules)) {
      schedulesByDay[day] ||= [];
      schedulesByDay[day].push(...markers);
    }

    return res.success(
      {
        message: '조회하신 달의 일정 목록입니다.',
        schedulesByDay,
      },
      200
    );
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UnauthorizedError ||
      error instanceof NotFoundError
    ) {
      return res.error(error, error.status);
    }

    const internalError = new InternalServerError();
    return res.error(internalError, internalError.status);
  }
};
