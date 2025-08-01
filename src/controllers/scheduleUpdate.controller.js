import { bodyToSchedule } from '../dtos/schedule.dto.js';
import { updateScheduleWithRules } from '../services/scheduleUpdate.service.js';
import { AppError } from '../errors/error.js';

export const handleUpdateSchedule = async (req, res, next) => {
  try {
    const scheduleId = Number(req.params.id);
    const userId = req.user?.user_id;

    if (!userId) {
      throw new AppError('로그인 정보가 없습니다.', StatusCodes.UNAUTHORIZED, 'UnauthorizedError');
    }

    const data = bodyToSchedule(req.body);
    await updateSchedule(scheduleId, userId, data);

    res.success({
      message: '일정이 성공적으로 수정되었습니다.',
      schedule_id: scheduleId,
    }, StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};
