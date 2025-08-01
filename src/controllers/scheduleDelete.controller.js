import { deleteScheduleWithRules } from '../services/scheduleDelete.service.js';
import { AppError } from '../errors/error.js';

export const handleDeleteSchedule = async (req, res, next) => {
  try {
    const scheduleId = Number(req.params.id);
    const userId = req.user?.user_id;

    if (!userId) {
      throw new AppError('로그인 정보가 없습니다.', StatusCodes.UNAUTHORIZED, 'UnauthorizedError');
    }

    await deleteScheduleWithRules(scheduleId, userId);

    res.success({
      message: '일정이 성공적으로 삭제되었습니다.',
      schedule_id: scheduleId,
    }, StatusCodes.OK);
  } catch (error) {
    next(error);
  }
};