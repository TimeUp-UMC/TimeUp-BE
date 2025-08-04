import { getMonthlySchedule } from '../services/scheduleMonthly.service.js';
import { UnauthorizedError, ValidationError } from '../errors/error.js';

/// 사용자의 특정 월 일정들을 날짜별로 조회하는 컨트롤러
/// 달력 뷰에 점 형태로 표시될 일정 색상 정보를 제공합니다
export const handleGetMonthlySchedule = async (req, res, next) => {
  try {
    const userId = req.user?.user_id;
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!userId) {
      throw new UnauthorizedError('로그인 정보가 없습니다.');
    }

    if (!year || !month) {
      throw new ValidationError('year와 month 쿼리 파라미터가 필요합니다.');
    }

    const result = await getMonthlySchedule(userId, year, month);

    res.success({ schedulesByDay: result }, 200);
  } catch (error) {
    res.error(error, error.status || 500);
  }
};
