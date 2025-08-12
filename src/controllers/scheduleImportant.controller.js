import { getImportantSchedulesByMonth } from '../services/scheduleImportant.service.js';
import { ValidationError, UnauthorizedError } from '../errors/error.js';

export const handleGetImportantSchedule = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    const { year, month } = req.query;

    if (!userId) throw new UnauthorizedError('로그인 정보가 없습니다.');

    const numericYear = Number(year);
    const numericMonth = Number(month);

    if (
      !numericYear ||
      !numericMonth ||
      isNaN(numericYear) ||
      isNaN(numericMonth) ||
      numericMonth < 1 ||
      numericMonth > 12
    ) {
      throw new ValidationError('year와 month는 유효한 숫자 형식이어야 하며, month는 1~12 사이여야 합니다.');
    }

    const schedules = await getImportantSchedulesByMonth({
      userId,
      year: numericYear,
      month: numericMonth,
    });

    res.success(
      {
        message: '월별 주요 일정 목록입니다.',
        schedules,
      },
      200
    );
  } catch (err) {
    res.error(err, err.status || 500);
  }
};
