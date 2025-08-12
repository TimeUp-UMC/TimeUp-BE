import { getMonthlySchedule } from '../services/scheduleMonthly.service.js';
import { UnauthorizedError, NotFoundError, InternalServerError } from '../errors/error.js';

// 월별 일정 목록 조회

export const handleGetMonthlySchedule = async (req, res, next) => {
  try {
    const userId = Number(req.user?.user_id);
    const { month } = req.query;

    if (!userId) {
      throw new UnauthorizedError();
    }

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      throw new ValidationError('month 파라미터는 YYYY-MM 형식으로 입력해야 합니다.');
    }

    const [yearStr, monthStr] = month.split('-');
    const year = Number(yearStr);
    const monthNum = Number(monthStr);

    const schedules = await getMonthlySchedule(userId, year, monthNum);

    return res.success(
      { 
        message: '조회하신 달의 일정 목록입니다.',
        schedulesByDay: schedules
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