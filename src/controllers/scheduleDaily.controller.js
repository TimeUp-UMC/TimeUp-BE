import { getDailySchedule } from '../services/scheduleDaily.service.js';
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
  InternalServerError,
  ValidationError,
} from '../errors/error.js';
import { fetchGoogleDailySchedules } from '../services/google-calendar.service.js';

// 날짜별 일정 목록 조회

export const handleGetDailySchedule = async (req, res, next) => {
  try {
    const userId = Number(req.user?.user_id);
    const date = req.query.date;

    if (!userId) {
      throw new UnauthorizedError();
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ValidationError(
        'date 파라미터는 YYYY-MM-DD 형식으로 입력해야 합니다.'
      );
    }

    const schedules = await getDailySchedule(userId, date);

    let googleSchedules = [];
    try {
      //구글 오류가 생겨도 db 응답만 반환
      googleSchedules = await fetchGoogleDailySchedules(userId, date);
    } catch (err) {
      console.error(err);
      googleSchedules = [];
    }

    //if (schedules.user_id !== userId)
    //throw new ForbiddenError('해당 일정에 접근할 수 없습니다.');

    return res.success(
      {
        message: `조회하신 날짜의 일정 목록입니다.`,
        schedules,
        googleSchedules,
      },
      200
    );
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof UnauthorizedError ||
      error instanceof NotFoundError ||
      error instanceof ForbiddenError
    ) {
      return res.error(error, error.status);
    }

    const internalError = new InternalServerError();
    return res.error(internalError, internalError.status);
  }
};
