import { getDailySchedule } from '../services/scheduleDaily.service.js';
import { UnauthorizedError, ValidationError } from '../errors/error.js';

// 사용자의 특정 날짜 일정 목록을 조회
export const handleGetDailySchedule = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    const date = req.query.date;

    if (!userId) {
      throw new UnauthorizedError('로그인 정보가 없습니다.');
    }

    if (!date) {
      throw new ValidationError('date 쿼리 파라미터가 필요합니다.');
    }

    const schedules = await getDailySchedule(userId, date);

    res.success(
      {
        message: `조회하신 날짜의 일정 목록입니다.`,
        schedules,
      },
      200
    );
  } catch (error) {
    next(error);
  }
};
